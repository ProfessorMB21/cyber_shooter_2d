// Enemy System

import { Enemy, ENEMY_TYPES } from '../entities/enemy.js';

class EnemyManager {
  constructor(game, config) {
    this.game = game;
    this.config = config;
    this.enemies = [];
  }

  update(deltaTime) {
    // Update all enemies
    this.enemies = this.enemies.filter(e => {
      const result = e.update(deltaTime, this.game.player, this.game.width, this.game.height);
      if (e.dead) {
        this.game.onKill(e);
      }
      return !e.dead;
    });
  }

  add(type, x, y, difficultyMultiplier) {
    const enemy = new Enemy(type, x, y, difficultyMultiplier);
    this.enemies.push(enemy);
    return enemy;
  }

  getAlive() {
    return this.enemies;
  }

  clear() {
    this.enemies = [];
  }
}

export { Enemy, EnemyManager, ENEMY_TYPES };
