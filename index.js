// Main Exports - Cyber Shooter Game

import config from './config/index.js';
import { Game } from './game.js';
import { InputHandler } from './input.js';

// Entities
import { Player, BUILDS } from './entities/player.js';
import { Enemy, ENEMY_TYPES } from './entities/enemy.js';
import { Boss, BOSS_PATTERNS } from './entities/boss.js';

// Systems
import { Entity } from './systems/entity.js';
import { ParticleSystem } from './systems/particles.js';
import { Collision } from './systems/collision.js';
import { ProjectileManager } from './systems/projectiles.js';
import { EnemyManager } from './systems/enemies.js';
import { BossManager } from './systems/bosses.js';
import { PickupManager } from './systems/pickups.js';

// Export all modules
export {
  // Core
  config,
  Game,
  InputHandler,

  // Entities
  Entity,
  Player,
  Enemy,
  Boss,

  // Systems
  ParticleSystem,
  Collision,
  ProjectileManager,
  EnemyManager,
  BossManager,
  PickupManager,

  // Data
  BUILDS,
  ENEMY_TYPES,
  BOSS_PATTERNS
};
