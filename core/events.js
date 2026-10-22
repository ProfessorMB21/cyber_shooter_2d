// Core Event Handlers

import { Pickup } from '../entities/pickup.js';
import { DIFFICULTIES } from '../config/index.js';

class EventSystem {
  constructor(game) {
    this.game = game;
  }

  // The players who are still in the run. They share the XP - an enemy
  // killed by anyone is an enemy cleared for the whole team.
  livingPlayers() {
    const players = this.game.players.filter(p => !p.dead);
    if (players.length > 0) return players;
    return this.game.player ? [this.game.player] : [];
  }

  onKill(enemy) {
    this.game.kills++;
    this.game.combo++;
    this.game.comboTimer = 3;

    const mult = DIFFICULTIES[this.game.difficulty];
    const baseScore = enemy.score || 10;
    const comboMultiplier = Math.min(5, 1 + this.game.combo * 0.1);
    const score = Math.floor(baseScore * mult.scoreMultiplier * comboMultiplier);
    this.game.score += score;

    // XP reduction as the players progress (higher level = less XP from
    // low-level enemies). The penalty is based on the average level of the
    // players, so a single player run behaves exactly as it always did.
    const players = this.livingPlayers();
    const averageLevel = players.reduce((sum, p) => sum + p.level, 0) / (players.length || 1);
    const levelPenalty = Math.max(0.5, 1 - (averageLevel - 0.8) * 0.05);
    for (const player of players) {
      player.addXP((enemy.xp || 10) * levelPenalty);
      player.score += score;
      player.kills++;
    }

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
    const score = Math.floor(1000 * mult.scoreMultiplier);
    this.game.score += score;

    // XP reduction as the players progress
    const players = this.livingPlayers();
    const averageLevel = players.reduce((sum, p) => sum + p.level, 0) / (players.length || 1);
    const bossLevelPenalty = Math.max(0.7, 1 - (averageLevel - 0.6) * 0.03);
    for (const player of players) {
      player.addXP(500 * bossLevelPenalty);
      player.score += score;
      player.kills++;
    }

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
