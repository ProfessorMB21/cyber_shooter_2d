// Config Module - Re-exports all configuration

export {
  SPEED_SCALE_FACTOR,
  ARMOR_DAMAGE_REDUCTION,
  ARMOR_MAX_REDUCTION,
  ARMOR_EXCESS_THRESHOLD,
  STAT_GROWTH,
  SCORE_POINTS,
  PARTICLES
} from './constants.js';

export { PLAYER_BUILDS, BUILDS } from './player-builds.js';
export { ENEMY_TYPES } from './enemy-types.js';
export { DIFFICULTIES } from './difficulties.js';
export { BOSS_PATTERNS, BOSS_CONFIG } from './bosses.js';
export { PICKUPS, ITEMS } from './pickups.js';
export { GAME_MODES, DEFAULT_MODE } from './game-modes.js';
export { GAME_SETTINGS } from './game.js';

// Equipment item system exports
export {
  ITEMS as EQUIPMENT_ITEMS,
  RARITY_CHANCES,
  RARITY_MULTIPLIERS,
  ITEM_SLOTS,
  RARITY_COLORS,
  RARITY_STARS
} from './items.js';

// Default export combining all configs
import { PLAYER_BUILDS } from './player-builds.js';
import { ENEMY_TYPES } from './enemy-types.js';
import { DIFFICULTIES } from './difficulties.js';
import { BOSS_CONFIG } from './bosses.js';
import { PICKUPS, ITEMS } from './pickups.js';
import { GAME_SETTINGS } from './game.js';
import { ITEMS as EQUIPMENT_ITEMS, RARITY_CHANCES, RARITY_MULTIPLIERS, ITEM_SLOTS, RARITY_COLORS, RARITY_STARS } from './items.js';
import {
  SPEED_SCALE_FACTOR,
  ARMOR_DAMAGE_REDUCTION,
  ARMOR_MAX_REDUCTION,
  ARMOR_EXCESS_THRESHOLD,
  STAT_GROWTH,
  SCORE_POINTS,
  PARTICLES
} from './constants.js';

const GAME_CONFIG = {
  ...GAME_SETTINGS,
  SPEED_SCALE_FACTOR,
  STAT_GROWTH,
  builds: PLAYER_BUILDS,
  difficulties: DIFFICULTIES,
  enemyTypes: ENEMY_TYPES,
  bosses: BOSS_CONFIG,
  pickups: PICKUPS,
  items: ITEMS,
  equipmentItems: EQUIPMENT_ITEMS,
  rarityChances: RARITY_CHANCES,
  rarityMultipliers: RARITY_MULTIPLIERS,
  itemSlots: ITEM_SLOTS,
  rarityColors: RARITY_COLORS,
  rarityStars: RARITY_STARS,
  scorePoints: SCORE_POINTS,
  particles: PARTICLES
};

export default GAME_CONFIG;
