// Boss System
// Re-exports from entities/boss.js for backward compatibility

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
      if (result && result.action === 'attack') {
        const projectiles = b.getProjectiles(this.game.player);
        projectiles.forEach(p => {
          if (this.game.projectileManager) {
            this.game.projectileManager.add(p.x, p.y, p.vx, p.vy, p.damage, p.color, false, {
              size: p.size,
              piercing: p.piercing,
              aoe: p.aoe,
              expand: p.expand,
              maxSize: p.maxSize,
              duration: p.duration
            });
          }
        });
      }
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
