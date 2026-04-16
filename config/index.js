// Config Module - Re-exports all configuration

export {
  SPEED_SCALE_FACTOR,
  STAT_CAPS,
  STAT_GROWTH,
  SCORE_POINTS,
  PARTICLES
} from './constants.js';

export { PLAYER_BUILDS, BUILDS } from './player-builds.js';
export { ENEMY_TYPES } from './enemy-types.js';
export { DIFFICULTIES } from './difficulties.js';
export { BOSS_PATTERNS, BOSS_CONFIG as bosses } from './bosses.js';
export { PICKUPS, ITEMS } from './pickups.js';
export { GAME_SETTINGS } from './game.js';

// Default export combining all configs
import { PLAYER_BUILDS } from './player-builds.js';
import { ENEMY_TYPES } from './enemy-types.js';
import { DIFFICULTIES } from './difficulties.js';
import { BOSS_CONFIG } from './bosses.js';
import { PICKUPS, ITEMS } from './pickups.js';
import { GAME_SETTINGS } from './game.js';
import {
  SPEED_SCALE_FACTOR,
  STAT_CAPS,
  STAT_GROWTH,
  SCORE_POINTS,
  PARTICLES
} from './constants.js';

const GAME_CONFIG = {
  ...GAME_SETTINGS,
  SPEED_SCALE_FACTOR,
  STAT_CAPS,
  STAT_GROWTH,
  builds: PLAYER_BUILDS,
  difficulties: DIFFICULTIES,
  enemyTypes: ENEMY_TYPES,
  bosses: BOSS_CONFIG,
  pickups: PICKUPS,
  items: ITEMS,
  scorePoints: SCORE_POINTS,
  particles: PARTICLES
};

export default GAME_CONFIG;
