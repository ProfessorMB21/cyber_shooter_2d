// Pickup System
// Re-exports from entities/pickup.js for backward compatibility

import { Pickup, MAX_SPEED, MAX_SHIELD, MAX_DAMAGE } from '../entities/pickup.js';

class PickupManager {
  constructor(game, config) {
    this.game = game;
    this.config = config;
    this.pickups = [];
  }

  update(deltaTime) {
    this.pickups = this.pickups.filter(p => {
      const alive = p.update(deltaTime, this.game.player);
      if (!alive && this.game.particles) {
        this.game.particles.spawnExplosion(p.x, p.y, 5, p.color);
      }
      return alive;
    });
  }

  spawn(x, y, type) {
    const pickup = new Pickup(x, y, type);
    this.pickups.push(pickup);
    return pickup;
  }

  get() {
    return this.pickups;
  }

  clear() {
    this.pickups = [];
  }
}

export { Pickup, PickupManager, MAX_SPEED, MAX_SHIELD, MAX_DAMAGE };
