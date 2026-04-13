// Projectile System
// Re-exports from entities/projectile.js for backward compatibility

import { Projectile } from '../entities/projectile.js';

class ProjectileManager {
  constructor(game, config) {
    this.game = game;
    this.config = config;
    this.projectiles = [];
  }

  update(deltaTime) {
    // Update all projectiles
    this.projectiles = this.projectiles.filter(p => {
      const alive = p.update(deltaTime);
      return alive;
    });
  }

  add(x, y, vx, vy, damage, color, isPlayer = false, options = {}) {
    const projectile = new Projectile(x, y, vx, vy, damage, color, isPlayer, options);
    this.projectiles.push(projectile);
    return projectile;
  }

  get() {
    return this.projectiles;
  }

  clear() {
    this.projectiles = [];
  }
}

export { Projectile, ProjectileManager };
