// The Simulation is the game world with no rendering attached.
//
// It owns the players, the enemies, the pickups and everything else a run
// consists of, and advances them from a set of inputs. Two things drive it:
// the Game class in the browser, which puts the canvas, the input handler
// and the scenes on top of it; and the multiplayer server, which runs a
// Simulation of its own with no canvas at all.
//
// The split exists because a networked run has to be simulated in exactly
// one place. If every client simulated its own copy of the world, they
// would drift apart within a second or two.

import { ParticleSystem } from '../systems/particles.js';
import { Player } from '../entities/player.js';
import { CombatSystem } from './combat.js';
import { SpawningSystem } from './spawning.js';
import { EventSystem } from './events.js';
import { CollisionSystem } from './collision.js';

// What a player sends to the world for one frame. The local player builds
// one from the keyboard, the AI builds one from what it can see, and the
// server builds one from what a client sent over the wire.
const EMPTY_INPUT = Object.freeze({
  dx: 0, dy: 0, shoot: false, ability1: false, ability2: false, aim: null
});

// A stand-in for the particle system on a machine that never draws anything.
// The combat, event and collision systems call into the particles for their
// visual effects; on the server those calls have to go somewhere harmless.
class NullParticles {
  spawn() {}
  spawnExplosion() {}
  spawnTrail() {}
  spawnScreenShake() {}
  spawnText() {}
  spawnCritical() {}
  spawnHealing() {}
  spawnBuff() {}
  spawnElectric() {}
  update() {}
  draw() {}
  clear() {}
  resize() {}
  getActiveParticleCount() { return 0; }
}

class Simulation {
  constructor(options = {}) {
    // The canvas size in the browser, or the size of the shared world on the
    // server.
    this.width = options.width || 1280;
    this.height = options.height || 720;

    // The play area. It matches the canvas in the local modes, but a
    // networked run has one shared world that every client draws at its own
    // size, so the two are kept apart.
    this.worldWidth = options.worldWidth || this.width;
    this.worldHeight = options.worldHeight || this.height;

    this.difficulty = 'normal';
    this.mode = 'single';

    // Every player in the run. The local player is `this.player`; the
    // others are the AI wingman and, online, the remote players.
    this.players = [];
    this.player = null;

    this.enemies = [];
    this.bosses = [];
    this.projectiles = [];
    this.pickups = [];

    // Particles are a presentation concern. The server runs the world
    // without them.
    this.particles = options.headless
      ? new NullParticles()
      : new ParticleSystem(this.width, this.height);

    // Core systems
    this.combat = new CombatSystem(this);
    this.spawning = new SpawningSystem(this);
    this.events = new EventSystem(this);
    this.collision = new CollisionSystem(this);

    // Projectile culling bounds, derived from the world size
    this.worldBounds = { minX: -100, maxX: this.worldWidth + 100, minY: -100, maxY: this.worldHeight + 100 };
    this.updateWorldBounds();

    // Timing
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
  }

  // Screen shake belongs to the presentation layer. The server has no
  // camera, so this is a no-op there; Game overrides it.
  addShake() {}

  // Projectiles are culled against the world, which is the canvas in the
  // local modes and the shared world online.
  updateWorldBounds() {
    this.worldBounds = {
      minX: -100,
      maxX: this.worldWidth + 100,
      minY: -100,
      maxY: this.worldHeight + 100
    };
  }

  // Add a player to the run. The build decides the stats, the id identifies
  // the player across the network.
  addPlayer({ playerId, buildName, x, y, playerName, isAI = false }) {
    const player = new Player(buildName, x, y);
    player.playerId = playerId;
    player.playerName = playerName || buildName;
    player.isAI = isAI;
    player.score = 0;
    player.kills = 0;
    this.players.push(player);
    if (!this.player) this.player = player;
    return player;
  }

  removePlayer(playerId) {
    this.players = this.players.filter(p => p.playerId !== playerId);
    if (this.player && this.player.playerId === playerId) this.player = null;
  }

  // The living players. A dead player is out of the run - in the local
  // modes the run ends with them, online the others carry on.
  livingPlayers() {
    return this.players.filter(p => !p.dead);
  }

  // Reset everything that belongs to a single run
  clearRunState() {
    this.players = [];
    this.player = null;
    this.enemies = [];
    this.bosses = [];
    this.projectiles = [];
    this.pickups = [];
    this.particles.clear();
    this.gameTime = 0;
    this.wave = 1;
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.kills = 0;
    this.bossSpawned = [];
    this.spawnTimer = 0;
  }

  // The input for one player, if there is one.
  inputFor(player, inputs) {
    if (!inputs) return EMPTY_INPUT;
    const input = typeof inputs.get === 'function'
      ? inputs.get(player.playerId)
      : inputs[player.playerId];
    return input || EMPTY_INPUT;
  }

  // Advance the world by one step. `inputs` maps a player id to that
  // player's input for this frame.
  update(deltaTime, inputs) {
    this.gameTime += deltaTime;
    this.comboTimer -= deltaTime;
    if (this.comboTimer <= 0) this.combo = 0;

    for (const player of this.players) {
      player.update(deltaTime, this.inputFor(player, inputs), this.worldWidth, this.worldHeight);
    }

    // Recompute the cooldown reduction after everyone has moved, so the
    // guardian's aura follows whoever is standing next to it.
    for (const player of this.players) player.updateCooldownAura(this.players);

    for (const player of this.players) {
      const input = this.inputFor(player, inputs);
      if (input.shoot && player.shootCooldown <= 0) this.combat.playerShoot(player, input.aim);
      if (input.ability1) this.combat.activateSkill(0, player, input);
      if (input.ability2) this.combat.activateSkill(1, player, input);
    }

    this.projectiles = this.projectiles.filter(p => {
      const alive = p.update(deltaTime);
      if (alive) this.collision.checkProjectileCollisions(p, deltaTime);
      return alive;
    });

    this.enemies = this.enemies.filter(e => {
      const result = e.update(deltaTime, this.players, this.worldWidth, this.worldHeight);
      if (result?.action === 'shoot') this.enemyShoot(e, result.target);
      return !e.dead;
    });

    this.bosses = this.bosses.filter(b => {
      const result = b.update(deltaTime, this.players, this.worldWidth, this.worldHeight);
      if (result?.action === 'attack') this.collision.handleBossAttack(b);
      return !b.dead;
    });

    this.pickups = this.pickups.filter(p => p.update(deltaTime, this.players));

    this.particles.update(deltaTime);

    this.spawnTimer -= deltaTime;
    if (this.spawnTimer <= 0) {
      this.spawnEnemies();
      this.spawnTimer = Math.max(0.5, this.spawnInterval - this.gameTime * 0.01);
    }

    this.spawning.checkBossSpawning();
    this.spawning.spawnRandomPickups();
  }

  // Delegate methods to core systems
  playerShoot(player, aim) { return this.combat.playerShoot(player, aim); }
  activateSkill(slot, player, input) { return this.combat.activateSkill(slot, player, input); }
  enemyShoot(enemy, target) { return this.combat.enemyShoot(enemy, target); }
  spawnEnemies() { return this.spawning.spawnEnemies(); }
  spawnBoss(index) { return this.spawning.spawnBoss(index); }
  onKill(enemy) { return this.events.onKill(enemy); }
  onBossKill(boss) { return this.events.onBossKill(boss); }
}

export { Simulation, EMPTY_INPUT };
