// Core Event Handlers

import { Pickup } from '../entities/pickup.js';
import { DIFFICULTIES } from '../config/index.js';

class EventSystem {
  constructor(game) {
    this.game = game;
  }

  onKill(enemy) {
    this.game.kills++;
    this.game.combo++;
    this.game.comboTimer = 3;

    const mult = DIFFICULTIES[this.game.difficulty];
    const baseScore = enemy.score || 10;
    const comboMultiplier = Math.min(5, 1 + this.game.combo * 0.1);
    this.game.score += Math.floor(baseScore * mult.scoreMultiplier * comboMultiplier);

    // XP reduction as player progresses (higher level = less XP from low-level enemies)
    const levelPenalty = Math.max(0.5, 1 - (this.game.player.level - 0.8) * 0.05);
    this.game.player.addXP((enemy.xp || 10) * levelPenalty);

    // Spawn particles
    const center = enemy.getCenter();
    this.game.particles.spawnExplosion(center.x, center.y, 12, enemy.color);

    // Small screen shake on kill
    this.game.addShake(0.5);

    // Random pickup drop (reduced from 10% to 3%)
    if (Math.random() < 0.03) {
      const types = ['health', 'shield'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.game.pickups.push(new Pickup(center.x, center.y, type));
    }
  }

  onBossKill(boss) {
    const mult = DIFFICULTIES[this.game.difficulty];
    this.game.score += Math.floor(1000 * mult.scoreMultiplier);
    // XP reduction as player progresses
    const bossLevelPenalty = Math.max(0.7, 1 - (this.game.player.level - 0.6) * 0.03);
    this.game.player.addXP(500 * bossLevelPenalty);

    // Lots of particles
    const center = boss.getCenter();
    this.game.particles.spawnExplosion(center.x, center.y, 50, '#ff00ff');

    // Strong screen shake on boss kill
    this.game.addShake(3);

    // Guaranteed pickups
    for (let i = 0; i < 3; i++) {
      const types = ['health', 'shield', 'speed', 'damage'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.game.pickups.push(new Pickup(
        center.x + (Math.random() - 0.5) * 100,
        center.y + (Math.random() - 0.5) * 100,
        type
      ));
    }
  }
}

export { EventSystem };
