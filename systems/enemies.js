// Enemy System
// Re-exports from entities/enemy.js for backward compatibility

import { Enemy, ENEMY_TYPES, ELITE_AFFIXES } from '../entities/enemy.js';

class EnemyManager {
  constructor(game, config) {
    this.game = game;
    this.config = config;
    this.enemies = [];
    this.affixChance = 0.25; // 25% chance for elite affix on elites
  }
  
  getRandomAffixes() {
    const affixKeys = Object.keys(ELITE_AFFIXES);
    const numAffixes = Math.random() < 0.1 ? 2 : 1; // 10% chance for 2 affixes
    const selected = [];
    for (let i = 0; i < numAffixes; i++) {
      const randomAffix = affixKeys[Math.floor(Math.random() * affixKeys.length)];
      if (!selected.includes(randomAffix)) {
        selected.push(randomAffix);
      }
    }
    return selected;
  }

  update(deltaTime) {
    // Update all enemies
    this.enemies = this.enemies.filter(e => {
      const result = e.update(deltaTime, this.game.player, this.game.width, this.game.height, this.game);
      if (result && result.action === 'shoot') {
        // Handle enemy shooting
        if (this.game.enemyShoot) {
          this.game.enemyShoot(e, result.target);
        }
      }
      if (e.dead) {
        this.game.onKill(e);
      }
      return !e.dead;
    });
  }

  add(type, x, y, difficultyMultiplier, withAffixes = false) {
    let affixes = [];
    
    // Add affixes to elite enemies or randomly to other enemies
    if (type === 'elite' && withAffixes && Math.random() < this.affixChance) {
      affixes = this.getRandomAffixes();
    }
    
    const enemy = new Enemy(type, x, y, difficultyMultiplier, affixes);
    this.enemies.push(enemy);
    return enemy;
  }

  spawnEnemy(type, x, y) {
    // Helper method for summoner ability
    const enemy = new Enemy(type, x, y, 1, []);
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

export { Enemy, EnemyManager, ENEMY_TYPES, ELITE_AFFIXES };
