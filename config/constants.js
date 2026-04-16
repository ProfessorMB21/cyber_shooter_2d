// Core Game Constants

// Speed scaling factor for gameplay (reduced from 80)
const SPEED_SCALE_FACTOR = 30;

// Stat caps to prevent overflow
const STAT_CAPS = {
  maxSpeed: 300,      // Maximum speed player can achieve
  maxShield: 150,     // Maximum shield cap
  maxHp: 1500,        // Maximum HP cap
  maxDamage: 210      // Maximum damage cap
};

// Stat growth multipliers per level
const STAT_GROWTH = {
  hpMultiplier: 1.2,
  damageMultiplier: 1.08,
  armorMultiplier: 1.05,
  speedMultiplier: 1.02,
  cap: 100
};

// Score calculation constants
const SCORE_POINTS = {
  enemyKill: 10,
  bossKill: 100,
  perfectShot: 5,
  combo: [2, 5, 10, 20, 50, 100, 200, 500, 1000],
  levelUp: 50,
  itemPickup: 25
};

// Particle types and colors
const PARTICLES = {
  types: ['spark', 'spark_small', 'smoke', 'spark_green', 'spark_purple', 'spark_orange'],
  colors: ['#ffffff', '#888888', '#555555', '#00ff00', '#9d00ff', '#ff8800']
};

export {
  SPEED_SCALE_FACTOR,
  STAT_CAPS,
  STAT_GROWTH,
  SCORE_POINTS,
  PARTICLES
};
