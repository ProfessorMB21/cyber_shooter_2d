// Boss System

import { Boss, BOSS_PATTERNS } from '../entities/boss.js';

class BossManager {
  constructor(game, config) {
    this.game = game;
    this.config = config;
    this.bosses = [];
  }

  update(deltaTime) {
    // Update all bosses
    this.bosses = this.bosses.filter(b => {
      const result = b.update(deltaTime, this.game.player, this.game.width, this.game.height);
      if (b.dead) {
        this.game.onBossKill(b);
      }
      return !b.dead;
    });
  }

  add(index, x, y, difficultyMultiplier) {
    const boss = new Boss(index, x, y, difficultyMultiplier);
    this.bosses.push(boss);
    return boss;
  }

  getAlive() {
    return this.bosses;
  }

  clear() {
    this.bosses = [];
  }
}

export { Boss, BossManager, BOSS_PATTERNS };
