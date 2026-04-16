// Entities Module - Main exports

export { Entity } from './systems/entity.js';
export { Particle, ParticleSystem } from './systems/particles.js';
export { Collision } from './systems/collision.js';
export { Projectile, ProjectileManager } from './systems/projectiles.js';
export { Enemy, EnemyManager, ENEMY_TYPES } from './systems/enemies.js';
export { Boss, BossManager, BOSS_PATTERNS } from './systems/bosses.js';
export { Pickup, PickupManager, MAX_SPEED, MAX_SHIELD, MAX_DAMAGE } from './systems/pickups.js';
export { InputHandler } from './input.js';
export { Player, BUILDS, STAT_GROWTH, STAT_CAPS, SPEED_SCALE_FACTOR } from './entities/player.js';
