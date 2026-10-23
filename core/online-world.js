// The client side of a networked run.
//
// The server owns the world and sends snapshots of it. This turns those
// snapshots into the real entity objects the renderer already knows how to
// draw, so the drawing code does not have to know that the run is online.
//
// The snapshots come at 20 a second and the screen refreshes at 60, so the
// positions are interpolated between the two most recent snapshots. The
// world is drawn one snapshot behind on purpose - that is the price of
// moving smoothly, and it is a fiftieth of a second.

import { Player } from '../entities/player.js';
import { Enemy } from '../entities/enemy.js';
import { Boss } from '../entities/boss.js';
import { Projectile } from '../entities/projectile.js';
import { Pickup } from '../entities/pickup.js';
import { SNAPSHOT_RATE } from '../shared/protocol.js';

class OnlineWorld {
  constructor(game) {
    this.game = game;
    this.prev = null;
    this.latest = null;
    this.receivedAt = 0;
    this.interval = 1 / SNAPSHOT_RATE;

    this.players = new Map();
    this.enemies = new Map();
    this.bosses = new Map();
    this.projectiles = new Map();
    this.pickups = new Map();
  }

  // Take a snapshot from the server.
  apply(world) {
    this.prev = this.latest;
    this.latest = world;
    this.receivedAt = performance.now();

    // The run's own numbers come from the server too - the client has no
    // idea what is happening in the world it is watching.
    const game = this.game;
    game.score = world.score || 0;
    game.wave = world.wave || 1;
    game.kills = world.kills || 0;
    game.combo = world.combo || 0;
    game.gameTime = world.gameTime || 0;

    this.syncPlayers(world.players);
    this.syncEnemies(world.enemies);
    this.syncBosses(world.bosses);
    this.syncProjectiles(world.projectiles);
    this.syncPickups(world.pickups);
  }

  // The players. The local one is the one whose id the server gave us.
  syncPlayers(list) {
    const next = new Map();
    for (const data of list || []) {
      let player = this.players.get(data.id);
      if (!player) {
        player = new Player(data.build, data.x, data.y);
        player.playerId = data.id;
        player.playerName = data.name || data.build;
        player.netPrev = { x: data.x, y: data.y };
        this.players.set(data.id, player);
      }
      player.netCur = { x: data.x, y: data.y };
      this.updatePlayer(player, data);
      next.set(data.id, player);
    }
    this.players = next;
    this.game.players = [...next.values()];

    // The local player is the one the server gave us an id for. The
    // snapshot makes its own object for it, so the game is pointed at that
    // one - the renderer and the HUD read from it.
    const localId = this.game.network ? this.game.network.playerId : null;
    if (localId && next.has(localId)) {
      this.game.player = next.get(localId);
    }
  }

  updatePlayer(player, data) {
    // The stats are worked out from the build and the level, so a level
    // change has to be applied before the numbers the server sent.
    if (player.level !== data.level) {
      player.level = data.level;
      player.calculateDerivedStats();
    }
    player.hp = data.hp;
    player.maxHp = data.maxHp;
    player.currentStats.maxHp = data.maxHp;
    player.damage = data.damage;
    player.currentStats.damage = data.damage;
    player.xp = data.xp || 0;
    player.xpToNextLevel = data.xpToNextLevel || 100;
    player.dead = !!data.dead;

    // The cooldowns come as the seconds left on each one. They are put
    // back into the timestamps the player reads, and the object is filled
    // in rather than replaced - the abilities hold a reference to it.
    const now = Date.now();
    for (const key of Object.keys(player.cooldowns)) {
      delete player.cooldowns[key];
    }
    for (const [key, seconds] of Object.entries(data.cooldowns || {})) {
      player.cooldowns[key] = now + seconds * 1000;
    }
  }

  syncEnemies(list) {
    const next = new Map();
    for (const data of list || []) {
      let enemy = this.enemies.get(data.id);
      if (!enemy) {
        enemy = new Enemy(data.type, data.x, data.y);
        enemy.netPrev = { x: data.x, y: data.y };
        this.enemies.set(data.id, enemy);
      }
      enemy.netCur = { x: data.x, y: data.y };
      enemy.hp = data.hp;
      enemy.maxHp = data.maxHp;
      next.set(data.id, enemy);
    }
    this.enemies = next;
    this.game.enemies = [...next.values()];
  }

  syncBosses(list) {
    const next = new Map();
    for (const data of list || []) {
      let boss = this.bosses.get(data.id);
      if (!boss) {
        // The level is what the boss is built from - its pattern and its
        // stats both come from it.
        boss = new Boss(data.levelIndex || 1, data.x, data.y);
        boss.netPrev = { x: data.x, y: data.y };
        this.bosses.set(data.id, boss);
      }
      boss.netCur = { x: data.x, y: data.y };
      boss.hp = data.hp;
      boss.maxHp = data.maxHp;
      next.set(data.id, boss);
    }
    this.bosses = next;
    this.game.bosses = [...next.values()];
  }

  syncProjectiles(list) {
    const next = new Map();
    for (const data of list || []) {
      let projectile = this.projectiles.get(data.id);
      if (!projectile) {
        projectile = new Projectile(data.x, data.y, data.vx, data.vy, 0, data.color, data.isPlayer, {
          size: data.size || 6,
          aoe: data.aoe
        });
        projectile.netPrev = { x: data.x, y: data.y };
        this.projectiles.set(data.id, projectile);
      }
      projectile.netCur = { x: data.x, y: data.y };
      projectile.vx = data.vx;
      projectile.vy = data.vy;
      projectile.size = data.size || projectile.size;
      next.set(data.id, projectile);
    }
    this.projectiles = next;
    this.game.projectiles = [...next.values()];
  }

  syncPickups(list) {
    const next = new Map();
    for (const data of list || []) {
      let pickup = this.pickups.get(data.id);
      if (!pickup) {
        pickup = new Pickup(data.x, data.y, data.type);
        pickup.netPrev = { x: data.x, y: data.y };
        this.pickups.set(data.id, pickup);
      }
      pickup.netCur = { x: data.x, y: data.y };
      next.set(data.id, pickup);
    }
    this.pickups = next;
    this.game.pickups = [...next.values()];
  }

  // Put every entity where the interpolation says it should be. The
  // snapshot gives the centre of each one, and the entities keep their own
  // idea of where their top left corner is.
  render(alpha) {
    const t = Math.max(0, Math.min(1, alpha));
    for (const player of this.players.values()) {
      const p = this.position(player, t);
      player.x = p.x - player.width / 2;
      player.y = p.y - player.height / 2;
    }
    for (const enemy of this.enemies.values()) {
      const p = this.position(enemy, t);
      enemy.x = p.x - enemy.width / 2;
      enemy.y = p.y - enemy.height / 2;
    }
    for (const boss of this.bosses.values()) {
      const p = this.position(boss, t);
      boss.x = p.x - boss.width / 2;
      boss.y = p.y - boss.height / 2;
    }
    for (const projectile of this.projectiles.values()) {
      const p = this.position(projectile, t);
      projectile.x = p.x;
      projectile.y = p.y;
    }
    for (const pickup of this.pickups.values()) {
      const p = this.position(pickup, t);
      pickup.x = p.x - pickup.width / 2;
      pickup.y = p.y - pickup.height / 2;
    }
  }

  // The interpolated position of one entity.
  position(entity, t) {
    const cur = entity.netCur;
    const prev = entity.netPrev || cur;
    if (!cur) return { x: 0, y: 0 };
    return {
      x: prev.x + (cur.x - prev.x) * t,
      y: prev.y + (cur.y - prev.y) * t
    };
  }

  // The client runs no simulation, so the things that spin are spun here.
  // It is only the look of them - the server owns what they do.
  animate(deltaTime) {
    for (const enemy of this.enemies.values()) {
      enemy.pulse += deltaTime * 5;
      enemy.hitFlash = Math.max(0, enemy.hitFlash - deltaTime);
    }
    for (const boss of this.bosses.values()) {
      boss.pulse += deltaTime * 5;
      boss.angle += deltaTime * boss.spinSpeed;
    }
    for (const pickup of this.pickups.values()) {
      pickup.bob += deltaTime * 5;
    }
  }

  // How far along the interpolation is, from the last snapshot that
  // arrived.
  alpha() {
    if (!this.latest) return 0;
    return (performance.now() - this.receivedAt) / this.interval;
  }
}

export { OnlineWorld };
