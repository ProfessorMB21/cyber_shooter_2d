// Main Game Engine - Core Game Class

import { InputHandler } from '../input.js';
import { ParticleSystem } from '../systems/particles.js';
import { Player, BUILDS, SPEED_SCALE_FACTOR } from '../entities/player.js';
import { Enemy } from '../entities/enemy.js';
import { Boss } from '../entities/boss.js';
import { Pickup } from '../entities/pickup.js';
import { DIFFICULTIES } from '../config/index.js';
import { MenuScene, GameOverScene, LevelUpScene, PauseScene, SettingsScene, SceneManager } from '../scenes/index.js';
import { CombatSystem } from './combat.js';
import { SpawningSystem } from './spawning.js';
import { EventSystem } from './events.js';
import { RenderingSystem } from './renderer.js';
import { VisualEffectsSystem } from './visual-effects.js';
import { CollisionSystem } from './collision.js';
import { PerformanceMonitor } from './performance.js';
import { GameSettings } from './settings.js';

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Game settings
    this.settings = new GameSettings();

    // Performance monitoring
    this.perf = new PerformanceMonitor();

    // Input
    this.input = new InputHandler(canvas);

    // Particles
    this.particles = new ParticleSystem(this.width, this.height);

    // Core systems
    this.combat = new CombatSystem(this);
    this.spawning = new SpawningSystem(this);
    this.events = new EventSystem(this);
    this.renderer = new RenderingSystem(this);
    this.visuals = new VisualEffectsSystem(this);
    this.collision = new CollisionSystem(this);

    // Game state
    this.state = 'menu';
    this.buildSelection = 0;
    this.difficultySelection = 1;
    this.difficulties = ['easy', 'normal', 'hard', 'nightmare'];

    // Game data
    this.player = null;
    this.enemies = [];
    this.bosses = [];
    this.projectiles = [];
    this.pickups = [];

    // Timing
    this.lastTime = performance.now();
    this.gameTime = 0;
    this.wave = 1;

    // Spawning
    this.spawnTimer = 0;
    this.spawnInterval = 2;
    this.bossSpawned = [];

    // Score
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.kills = 0;

    // Difficulty
    this.difficulty = this.difficulties[this.difficultySelection];

    // Build names
    this.buildNames = Object.keys(BUILDS);

    // Scene manager
    this.sceneManager = new SceneManager(this);
    this.sceneManager.register('menu', new MenuScene(this));
    this.sceneManager.register('settings', new SettingsScene(this));
    this.sceneManager.register('gameover', new GameOverScene(this));
    this.sceneManager.register('levelup', new LevelUpScene(this));
    this.sceneManager.register('pause', new PauseScene(this));
    this.sceneManager.switchTo('menu');

    // Bind loop
    this.loop = this.loop.bind(this);
  }

  // Delegate visual effect methods
  addShake(amount) { this.visuals.addShake(amount); }
  updateShake(deltaTime) { this.visuals.updateShake(deltaTime); }
  updateStars(deltaTime) { this.visuals.updateStars(deltaTime); }
  drawBackground(ctx) { this.visuals.drawBackground(ctx); }

  start(buildName, difficulty) {
    this.difficulty = difficulty || 'normal';
    const mult = DIFFICULTIES[this.difficulty];

    this.player = new Player(buildName, this.width / 2, this.height - 100);
    this.player.currentStats.speed = this.player.baseStats.speed * SPEED_SCALE_FACTOR;

    this.enemies = [];
    this.bosses = [];
    this.projectiles = [];
    this.pickups = [];
    this.particles.clear();

    this.gameTime = 0;
    this.wave = 1;
    this.score = 0;
    this.combo = 0;
    this.kills = 0;
    this.bossSpawned = [];
    this.spawnTimer = 0;

    this.state = 'playing';
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
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

  // Delegate methods to core systems
  playerShoot() { return this.combat.playerShoot(); }
  activateSkill(slot) { return this.combat.activateSkill(slot); }
  enemyShoot(enemy, target) { return this.combat.enemyShoot(enemy, target); }
  spawnEnemies() { return this.spawning.spawnEnemies(); }
  spawnBoss(index) { return this.spawning.spawnBoss(index); }
  onKill(enemy) { return this.events.onKill(enemy); }
  onBossKill(boss) { return this.events.onBossKill(boss); }
  render() { return this.renderer.render(); }
  renderUI(ctx) { return this.renderer.renderUI(ctx); }

  loop(timestamp) {
    // Monitor performance every frame
    this.perf.update();

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
          this.state = 'menu';
          this.sceneManager.switchTo('menu');
        }
      }
      this.sceneManager.render(this.ctx, this.width, this.height, this);
      requestAnimationFrame(this.loop);
      return;
    }

    if (this.state !== 'playing') {
      const result = this.sceneManager.update(this.input);
      if (result) {
        if (result.action === 'start') {
          this.start(result.build, result.difficulty);
          return;
        } else if (result.action === 'show_builds') {
          this.state = 'menu';
          this.sceneManager.switchTo('menu');
          if (this.sceneManager.currentScene) {
            this.sceneManager.currentScene.menuState = 'build_select';
          }
        } else if (result.action === 'show_settings') {
          this.state = 'settings';
          this.sceneManager.switchTo('settings');
        } else if (result.action === 'apply_quality') {
          this.settings.setQuality(result.quality);
          this.applyQualitySettings();
          this.state = 'menu';
          this.sceneManager.switchTo('menu');
        } else if (result.action === 'back_to_menu') {
          this.state = 'menu';
          this.sceneManager.switchTo('menu');
        } else if (result.action === 'menu') {
          this.state = 'menu';
          this.sceneManager.switchTo('menu');
        }
      }

      if (this.state === 'menu' || this.state === 'settings') {
        this.drawBackground(this.ctx);
        this.particles.update(1/60);
        this.particles.draw(this.ctx);
        this.sceneManager.render(this.ctx, this.width, this.height, this.particles);
      } else {
        this.sceneManager.render(this.ctx, this.width, this.height, this);
      }
      requestAnimationFrame(this.loop);
      return;
    }

    if (this.input.isKeyPressed('escape') || this.input.isKeyPressed('p')) {
      this.state = 'paused';
      requestAnimationFrame(this.loop);
      return;
    }

    const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.loop);
  }

  update(deltaTime) {
    this.gameTime += deltaTime;
    this.comboTimer -= deltaTime;
    if (this.comboTimer <= 0) this.combo = 0;

    this.updateShake(deltaTime);
    this.updateStars(deltaTime);

    this.player.update(deltaTime, this.input, this.width, this.height);

    if (this.input.isKeyDown(' ') && this.player.shootCooldown <= 0) {
      this.playerShoot();
    }

    if (this.input.isKeyPressed('1')) this.activateSkill(0);
    if (this.input.isKeyPressed('2')) this.activateSkill(1);

    this.projectiles = this.projectiles.filter(p => {
      const alive = p.update(deltaTime);
      if (alive) this.collision.checkProjectileCollisions(p, deltaTime);
      return alive;
    });

    this.enemies = this.enemies.filter(e => {
      const result = e.update(deltaTime, this.player, this.width, this.height);
      if (result?.action === 'shoot') this.enemyShoot(e, result.target);
      return !e.dead;
    });

    this.bosses = this.bosses.filter(b => {
      const result = b.update(deltaTime, this.player, this.width, this.height);
      if (result?.action === 'attack') this.collision.handleBossAttack(b);
      return !b.dead;
    });

    this.pickups = this.pickups.filter(p => p.update(deltaTime, this.player));
    this.particles.update(deltaTime);

    this.spawnTimer -= deltaTime;
    if (this.spawnTimer <= 0) {
      this.spawnEnemies();
      this.spawnTimer = Math.max(0.5, this.spawnInterval - this.gameTime * 0.01);
    }

    this.spawning.checkBossSpawning();
    this.spawning.spawnRandomPickups();

    if (this.player.dead) this.switchState('gameover');

    if (this.player.xp >= this.player.xpToNextLevel) {
      this.player.levelUp();
      this.switchState('levelup');
      setTimeout(() => { if (this.state === 'levelup') this.state = 'playing'; }, 2000);
    }
  }
}

export { Game };
