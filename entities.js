// Entities Module - Main exports

export { Entity } from './systems/entity.js';
export { Particle, ParticleSystem } from './systems/particles.js';
export { Collision } from './systems/collision.js';
export { Projectile, ProjectileManager } from './systems/projectiles.js';
export { Enemy, EnemyManager, ENEMY_TYPES } from './systems/enemies.js';
export { Boss, BOSS_PATTERNS } from './entities/boss.js';
export { BossPatternGenerator } from './entities/boss-patterns.js';
export { Pickup, PickupManager, MAX_SPEED, MAX_SHIELD, MAX_DAMAGE } from './systems/pickups.js';
export { InputHandler } from './input.js';
export { Player, BUILDS, STAT_GROWTH, STAT_CAPS, SPEED_SCALE_FACTOR } from './entities/player.js';
export { PlayerAbilities } from './entities/abilities.js';
