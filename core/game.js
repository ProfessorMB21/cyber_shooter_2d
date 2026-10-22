// Main Game Engine - Core Game Class
//
// The Game class is the Simulation with a canvas, an input handler and the
// scenes attached. Everything that is about *drawing* or about *reading the
// keyboard* lives here; everything that is about the world itself lives in
// core/simulation.js, which the multiplayer server runs on its own.

import { InputHandler } from '../input.js';
import { BUILDS } from '../entities/player.js';
import { MenuScene, GameOverScene, PauseScene, SettingsScene, LobbyScene, SceneManager } from '../scenes/index.js';
import { AIController } from '../systems/ai.js';
import { Simulation } from './simulation.js';
import { OnlineSession } from './online-session.js';
import { buildLocalInput } from './controls.js';
import { RenderingSystem } from './renderer.js';
import { VisualEffectsSystem } from './visual-effects.js';
import { PerformanceMonitor } from './performance.js';
import { GameSettings } from './settings.js';
import { DebugOverlay } from './debug-overlay.js';

class Game extends Simulation {
  constructor(canvas) {
    super({ width: canvas.width, height: canvas.height });

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Game settings
    this.settings = new GameSettings();

    // Performance monitoring
    this.perf = new PerformanceMonitor();

    // Debug overlay (toggle with F)
    this.debug = new DebugOverlay(this);

    // Input
    this.input = new InputHandler(canvas);

    // Rendering and effects
    this.renderer = new RenderingSystem(this);
    this.visuals = new VisualEffectsSystem(this);

    // Game state
    this.state = 'menu';
    this.buildSelection = 0;
    this.difficultySelection = 1;
    this.difficulties = ['easy', 'normal', 'hard', 'nightmare'];

    // The wingman in dualist mode
    this.ally = null;
    // The options the current run was started with, so a restart can repeat
    // them
    this.runOptions = { mode: 'single' };

    // One controller per AI player, keyed by player id
    this.aiControllers = new Map();

    // The socket to the multiplayer server and everything a networked run
    // needs. The lobby opens the socket and the run uses it.
    this.online = new OnlineSession(this);

    // The client side of a networked run - the snapshots turned into the
    // entities the renderer draws
    this.onlineWorld = null;

    // A notice that fades away, for the things worth saying in the middle
    // of a run
    this.notice = null;
    this.noticeTimer = 0;

    // The ability buttons in the HUD, as the last frame drew them. The
    // mouse can click them.
    this.hudButtons = [];

    // The shared world is a fixed size, whatever the window is. The client
    // draws it scaled to fit.
    this.worldScale = 1;
    this.worldOffsetX = 0;
    this.worldOffsetY = 0;

    // Level tracked at the start of the frame, to detect level-ups
    this.levelAtFrameStart = 1;
    // The same for the other players in the run
    this.allyLevels = new Map();
    // Level-up notice - shown briefly, without interrupting play
    this.levelUpNotice = null;
    this.levelUpNoticeTimer = 0;

    // Timing
    this.lastTime = performance.now();

    // Build names
    this.buildNames = Object.keys(BUILDS);

    // Scene manager
    this.sceneManager = new SceneManager(this);
    this.sceneManager.register('menu', new MenuScene(this));
    this.sceneManager.register('settings', new SettingsScene(this));
    this.sceneManager.register('gameover', new GameOverScene(this));
    this.sceneManager.register('pause', new PauseScene(this));
    this.sceneManager.register('lobby', new LobbyScene(this));
    this.sceneManager.switchTo('menu');

    // Bind loop
    this.loop = this.loop.bind(this);
  }

  // Delegate visual effect methods
  addShake(amount) { this.visuals.addShake(amount); }
  updateShake(deltaTime) { this.visuals.updateShake(deltaTime); }
  updateStars(deltaTime) { this.visuals.updateStars(deltaTime); }
  drawBackground(ctx) { this.visuals.drawBackground(ctx); }

  // Start a run. `options` carries the game mode and whatever it needs:
  // the wingman's build in dualist, the room to join online.
  start(buildName, difficulty, options = {}) {
    this.difficulty = difficulty || 'normal';
    this.mode = options.mode || 'single';
    this.runOptions = { ...options, mode: this.mode };

    this.clearRunState();

    const halfWidth = this.worldWidth / 2;
    this.player = this.addPlayer({
      playerId: options.playerId || 'local',
      buildName,
      x: halfWidth,
      y: this.worldHeight - 100,
      playerName: options.playerName || 'YOU'
    });

    // The AI wingman. It is a full player - it takes damage, levels up and
    // picks things up - it is just driven by the AI instead of a keyboard.
    if (this.mode === 'dualist' && options.allyBuild) {
      this.ally = this.addPlayer({
        playerId: 'ally',
        buildName: options.allyBuild,
        x: halfWidth - 90,
        y: this.worldHeight - 60,
        playerName: 'WINGMAN',
        isAI: true
      });
    }

    // Every AI player gets a controller. It produces the same input shape
    // the keyboard produces, so nothing downstream - the player entity, the
    // combat system, the cooldowns - knows the difference.
    this.aiControllers.clear();
    for (const player of this.players) {
      if (player.isAI) this.aiControllers.set(player.playerId, new AIController(player, this));
    }

    // Make game instance available to player for quality settings
    window.gameInstance = this;

    this.levelAtFrameStart = this.player.level;
    this.allyLevels.clear();

    this.state = 'playing';
    this.lastTime = performance.now();
    this.levelUpNotice = null;
    this.levelUpNoticeTimer = 0;
    // NOTE: the animation loop is already running - do NOT schedule it again
  }

  // Start an online run. The world is on the server - this only sets up
  // the client side of it: the local player, the place the snapshots are
  // put, and the shape of the screen the world is drawn on.
  startOnline(room) {
    this.online.start(room);
  }

  // The online run is over. The room goes back to being a lobby and so
  // does the client.
  endOnlineRun() {
    this.online.end();
  }

  // Leave an online run before it is over.
  leaveOnlineRun() {
    this.online.leave();
  }

  // The shared world is a fixed size. The client draws it scaled to fit
  // the canvas, so everybody sees the same field whatever their window is.
  updateWorldTransform() {
    this.online.updateTransform();
  }

  // The socket to the multiplayer server.
  get network() {
    return this.online.network;
  }

  // Say something in the middle of a run, without stopping it.
  showNotice(text, duration = 2) {
    this.notice = text;
    this.noticeTimer = duration;
  }

  // Abandon the current run and return to the main menu. The Game instance
  // and the animation loop stay alive - only the run state is cleared, so the
  // app never has to be restarted.
  quitToMenu() {
    this.state = 'menu';
    this.sceneManager.switchTo('menu');
    if (this.sceneManager.currentScene) {
      this.sceneManager.currentScene.menuState = 'main';
    }
    this.clearRunState();
  }

  // Reset everything that belongs to a single run
  clearRunState() {
    super.clearRunState();
    this.ally = null;
    this.aiControllers.clear();
    this.levelAtFrameStart = 1;
    this.allyLevels.clear();
    this.levelUpNotice = null;
    this.levelUpNoticeTimer = 0;
    this.notice = null;
    this.noticeTimer = 0;
    this.onlineWorld = null;
    this.worldScale = 1;
    this.worldOffsetX = 0;
    this.worldOffsetY = 0;
    this.visuals.shakeAmount = 0;
    this.visuals.cameraX = 0;
    this.visuals.cameraY = 0;
  }

  switchState(newState) {
    this.state = newState;
    if (newState !== 'playing') {
      this.sceneManager.switchTo(newState);
    }
  }

  applyQualitySettings() {
    // Apply quality settings to particle system and rendering
    const maxParticles = this.settings.getSetting('particleCount');
    if (this.particles.poolSize !== maxParticles) {
      this.particles.poolSize = maxParticles;
      this.particles.pool = [];
      this.particles.preAllocatePool();
    }
  }

  // The menu and settings screens draw the starfield background and the
  // ambient particles before the scene itself.
  renderMenuScene() {
    this.drawBackground(this.ctx);
    this.particles.update(1 / 60);
    this.particles.draw(this.ctx);
    this.sceneManager.render(this.ctx, this.width, this.height, this.particles);
  }

  // Delegate methods to core systems
  playerShoot(player, aim) { return this.combat.playerShoot(player, aim); }
  activateSkill(slot, player, input) { return this.combat.activateSkill(slot, player, input); }
  enemyShoot(enemy, target) { return this.combat.enemyShoot(enemy, target); }
  spawnEnemies() { return this.spawning.spawnEnemies(); }
  spawnBoss(index) { return this.spawning.spawnBoss(index); }
  onKill(enemy) { return this.events.onKill(enemy); }
  onBossKill(boss) { return this.events.onBossKill(boss); }
  render() { return this.renderer.render(); }
  renderUI(ctx) { return this.renderer.renderUI(ctx); }

  // Begin the animation loop. The Game class owns the requestAnimationFrame
  // chain exclusively - nothing else may schedule this.loop, or the whole
  // scene gets rendered multiple times per frame.
  startLoop() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  loop(timestamp) {
    // Schedule the next frame FIRST so a thrown error can never kill the loop
    requestAnimationFrame(this.loop);

    try {
      // Monitor performance every frame
      this.perf.update(timestamp);

      // Toggle the debug overlay
      if (this.input.isKeyPressed('f')) {
        this.debug.toggle();
      }

      // Apply quality scaling based on FPS
      const quality = this.perf.getQualityLevel();
      if (this.player) {
        this.player.skipBuildVisuals = quality === 'low';
      }

      if (this.state === 'paused') {
        const result = this.sceneManager.update(this.input);
        if (result) {
          if (result.action === 'resume') {
            this.state = 'playing';
            this.lastTime = performance.now();
          } else if (result.action === 'restart') {
            // Start a fresh run with the same build and difficulty
            const build = this.player ? this.player.buildName : this.buildNames[0];
            this.start(build, this.difficulty, this.runOptions);
            this.render();
            this.debug.render(this.ctx);
            return;
          } else if (result.action === 'quit') {
            // Leave the run for the main menu - the app keeps running
            this.quitToMenu();
            this.renderMenuScene();
            this.debug.render(this.ctx);
            return;
          }
        }
        this.sceneManager.render(this.ctx, this.width, this.height, this);
        this.debug.render(this.ctx);
        return;
      }

      if (this.state !== 'playing') {
        const result = this.sceneManager.update(this.input);
        if (result) {
          if (result.action === 'start') {
            // Remember the choice so the build select screen comes back to it
            const menu = this.sceneManager.currentScene;
            if (menu && menu.buildNames) {
              menu.buildSelection = Math.max(0, menu.buildNames.indexOf(result.build));
              menu.difficultySelection = Math.max(0, menu.difficulties.indexOf(result.difficulty));
            }
            this.start(result.build, result.difficulty, result.options || {});
            return;
          } else if (result.action === 'show_builds') {
            this.state = 'menu';
            this.sceneManager.switchTo('menu');
            const menu = this.sceneManager.currentScene;
            if (menu) {
              menu.mode = result.mode || 'single';
              menu.menuState = 'build_select';
            }
          } else if (result.action === 'show_wingman') {
            // The wingman has a build of its own, chosen on its own screen.
            this.state = 'menu';
            this.sceneManager.switchTo('menu');
            const menu = this.sceneManager.currentScene;
            if (menu) {
              menu.mode = 'dualist';
              menu.menuState = 'wingman_select';
            }
          } else if (result.action === 'show_lobby') {
            // An online mode. The lobby picks the build and the callsign,
            // and the room is on the server.
            this.state = 'lobby';
            this.sceneManager.switchTo('lobby');
          } else if (result.action === 'show_settings') {
            this.state = 'settings';
            this.sceneManager.switchTo('settings');
          } else if (result.action === 'apply_quality') {
            this.settings.setQuality(result.quality);
            this.applyQualitySettings();
            this.state = 'menu';
            this.sceneManager.switchTo('menu');
          } else if (result.action === 'apply_input_scheme') {
            this.settings.setInputScheme(result.scheme);
            this.state = 'menu';
            this.sceneManager.switchTo('menu');
          } else if (result.action === 'back_to_menu') {
            this.quitToMenu();
          } else if (result.action === 'menu') {
            this.quitToMenu();
          }
        }

        if (this.state === 'menu' || this.state === 'settings' || this.state === 'lobby') {
          this.renderMenuScene();
        } else {
          this.sceneManager.render(this.ctx, this.width, this.height, this);
        }
        this.debug.render(this.ctx);
        return;
      }

      if (this.input.isKeyPressed('escape') || this.input.isKeyPressed('p')) {
        if (this.mode === 'multiplayer') {
          // The world keeps running on the server, so there is nothing to
          // pause. Once the local player is down, ESC leaves the run.
          if (this.player && this.player.dead) {
            this.leaveOnlineRun();
          } else {
            this.showNotice('AN ONLINE RUN CANNOT BE PAUSED');
          }
          return;
        }
        // The pause scene has to be activated as well - without it the pause
        // menu never receives input and the game cannot be unpaused.
        //
        // A click that was in flight belongs to the game, not to the menu
        // that is about to open. Left alone, the pause menu would act on it
        // and press whatever happened to be under the pointer.
        this.input.wasMouseClicked();
        this.state = 'paused';
        this.sceneManager.switchTo('pause');
        return;
      }

      const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;

      this.update(deltaTime);
      this.render();
      this.debug.render(this.ctx);
    } catch (e) {
      console.error('Game loop error:', e);
      console.error('Stack:', e.stack);
    }
  }

  update(deltaTime) {
    this.updateShake(deltaTime);
    this.updateStars(deltaTime);

    if (this.mode === 'multiplayer') {
      this.updateOnline(deltaTime);
      return;
    }

    super.update(deltaTime, this.buildInputs(deltaTime));

    this.announceLevelUps();

    if (this.levelUpNoticeTimer > 0) this.levelUpNoticeTimer -= deltaTime;

    if (this.player && this.player.dead) this.switchState('gameover');
  }

  // An online run: the input goes to the server and the snapshots come
  // back. The world is not simulated here - it is on the server, and it
  // is the only copy there is.
  updateOnline(deltaTime) {
    this.online.update(deltaTime);
  }

  // The inputs for this frame: the local player comes from the keyboard
  // and the mouse, and every AI player comes from its controller.
  buildInputs(deltaTime = 1 / 60) {
    const inputs = new Map();
    for (const player of this.players) {
      if (player.isAI) {
        const controller = this.aiControllers.get(player.playerId);
        if (controller) inputs.set(player.playerId, controller.update(deltaTime));
        continue;
      }
      if (player !== this.player) continue;
      inputs.set(player.playerId, this.localInput());
    }
    return inputs;
  }

  // The local player's input for this frame, built from the keyboard and
  // the mouse according to the input scheme.
  localInput() {
    const input = buildLocalInput(this.input, this.settings.getInputScheme(), this);
    // A click on one of the ability buttons in the HUD fires that ability.
    const clicked = this.takeAbilityClick();
    if (clicked === 0) input.ability1 = true;
    else if (clicked === 1) input.ability2 = true;
    return input;
  }

  // Which ability button the player clicked, if any. The buttons are
  // where the last frame drew them, which is where they are on the screen.
  //
  // The click is consumed whatever the answer is. A click that is left
  // lying around would be picked up by the pause menu a moment later and
  // press whatever happened to be under it.
  takeAbilityClick() {
    if (!this.input.wasMouseClicked()) return -1;
    const buttons = this.hudButtons;
    if (!buttons || !buttons.length) return -1;
    const click = this.input.getClickPos();
    for (let i = buttons.length - 1; i >= 0; i--) {
      const b = buttons[i];
      if (click.x >= b.x && click.x <= b.x + b.w &&
          click.y >= b.y && click.y <= b.y + b.h) {
        return b.index;
      }
    }
    return -1;
  }

  // Announce a level-up without interrupting play: a short notice and a
  // burst of particles, but no overlay and no pause.
  announceLevelUps() {
    for (const player of this.players) {
      const previous = player === this.player
        ? this.levelAtFrameStart
        : (this.allyLevels.get(player.playerId) ?? player.level);
      if (player.level === previous) continue;
      if (player === this.player) {
        this.levelAtFrameStart = player.level;
        this.announceLevelUp(player);
      } else {
        this.allyLevels.set(player.playerId, player.level);
        this.announceAllyLevelUp(player);
      }
    }
  }

  announceLevelUp(player = this.player) {
    this.levelUpNotice = `LEVEL UP - LEVEL ${player.level}`;
    this.levelUpNoticeTimer = 1.8;
    const center = player.getCenter();
    this.particles.spawnExplosion(center.x, center.y, 18, '#0f0');
    this.particles.spawnText('LEVEL UP', center.x, center.y - 40, '#0f0');
  }

  // A wingman level up gets a quieter notice - it must not cover the
  // screen the way the local player's does.
  announceAllyLevelUp(player) {
    const center = player.getCenter();
    this.particles.spawnExplosion(center.x, center.y, 10, '#0ff');
    this.particles.spawnText(`${player.playerName} LV${player.level}`, center.x, center.y - 30, '#0ff');
  }
}

export { Game };
