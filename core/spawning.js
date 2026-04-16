// Core Spawning Logic

import { Enemy, ENEMY_TYPES } from '../entities/enemy.js';
import { Boss } from '../entities/boss.js';
import { Pickup } from '../entities/pickup.js';
import { DIFFICULTIES, BOSS_CONFIG } from '../config/index.js';

class SpawningSystem {
  constructor(game) {
    this.game = game;
  }

  spawnEnemies() {
    const mult = DIFFICULTIES[this.game.difficulty];
    const types = Object.keys(ENEMY_TYPES);

    // Spawn count based on wave - INCREASED (doubled)
    const count = Math.min(10 + Math.floor(this.game.gameTime / 20), 25);

    for (let i = 0; i < count; i++) {
      // Choose enemy type based on game time - MORE DIFFICULT TYPES
      let typeIndex = 0;
      const rand = Math.random();
      if (this.game.gameTime > 30 && rand < 0.5) typeIndex = 1; // Fast (was 60s, now 30s)
      if (this.game.gameTime > 60 && rand < 0.35) typeIndex = 2; // Tank (was 120s, now 60s)
      if (this.game.gameTime > 90 && rand < 0.3) typeIndex = 3; // Shooter (was 180s, now 90s)
      if (this.game.gameTime > 120 && rand < 0.25) typeIndex = 4; // Elite (was 240s, now 120s)

      // Limit total enemies to prevent screen filling (max 40 enemies)
      if (this.game.enemies.length >= 30) break;

      const type = types[typeIndex];
      const x = Math.random() * (this.game.width - 100) + 50;
      const y = Math.random() * 200 - 50;

      this.game.enemies.push(new Enemy(type, x, y, mult.enemyHp));
    }
  }

  spawnBoss(index) {
    const mult = DIFFICULTIES[this.game.difficulty];
    const x = this.game.width / 2;
    const y = 100;

    this.game.bosses.push(new Boss(index, x, y, mult.enemyHp));
  }

  // Check boss spawning conditions
  checkBossSpawning() {
    BOSS_CONFIG.levels.forEach((level, index) => {
      if (Math.floor(this.game.gameTime / 60) >= level && !this.game.bossSpawned.includes(index)) {
        this.spawnBoss(index + 1);
        this.game.bossSpawned.push(index);
      }
    });
  }

  // Spawn random pickups
  spawnRandomPickups() {
    if (Math.random() < 0.001) {
      const types = ['health', 'shield', 'speed', 'damage'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.game.pickups.push(new Pickup(
        Math.random() * (this.game.width - 100) + 50,
        Math.random() * (this.game.height - 100) + 50,
        type
      ));
    }
  }
}

export { SpawningSystem };
