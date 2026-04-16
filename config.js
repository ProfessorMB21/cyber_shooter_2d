// Game Configuration
const GAME_CONFIG = {
  // Canvas settings
  WIDTH: 800,
  HEIGHT: 600,
  TITLE: 'Simple Claude Game',
  SUBTITLE: 'A Cyberpunk Space Shooter',
  VERSION: '1.0.0',

  // Menu options
  MENU_OPTIONS: ['start', 'difficulty', 'about'],

  // Stat scaling factors (from player.js)
  SPEED_SCALE_FACTOR: 30,  // Speed multiplier for gameplay (reduced from 80)

  // Stat caps (from player.js STAT_CAPS)
  STAT_CAPS: {
    maxSpeed: 300,      // Maximum speed player can achieve (capped)
    maxShield: 150,     // Maximum shield cap (reduced from 200)
    maxHp: 1500,        // Maximum HP cap (reduced from 2000)
    maxDamage: 210      // Maximum damage cap
  },

  // Stat growth per level (from player.js STAT_GROWTH)
  STAT_GROWTH: {
    hpMultiplier: 1.2,
    damageMultiplier: 1.08,
    armorMultiplier: 1.05,
    speedMultiplier: 1.02,
    cap: 100
  },

  // Player builds - NERFED to match player.js gameplay values
  builds: [
    {
      name: 'fighter',
      display: 'Fighter',
      description: 'Balanced with high health and damage',
      color: '#00ff00',
      stats: {
        hp: 350,
        maxHp: 350,
        damage: 12,
        speed: 2.5,
        armor: 15,
        evasion: 5,
        criticalChance: 0,
        criticalDamage: 1.0,
        regen: 1,
        cooldown: 1
      },
      abilities: ['HEALING SHOT', 'DASH'],
      passive: 'Toughen Up - 8% HP gain per level'
    },
    {
      name: 'glass_cannon',
      display: 'Glass Cannon',
      description: 'Extreme damage but fragile',
      color: '#ff00ff',
      stats: {
        hp: 200,
        maxHp: 200,
        damage: 35,
        speed: 3.5,
        armor: 8,
        evasion: 15,
        criticalChance: 0.20,
        criticalDamage: 2.0,
        regen: 0.5,
        cooldown: 1
      },
      abilities: ['OVERLOAD', 'TELEPORT'],
      passive: 'Overclock - 10% damage per level'
    },
    {
      name: 'tank',
      display: 'Tank',
      description: 'Massive health pool, slow',
      color: '#4444ff',
      stats: {
        hp: 550,
        maxHp: 550,
        damage: 8,
        speed: 1.8,
        armor: 45,
        evasion: 0,
        criticalChance: 0,
        criticalDamage: 0,
        regen: 1.5,
        cooldown: 1
      },
      abilities: ['SHIELD', 'GROUND SLAM'],
      passive: 'Iron Skin - 12% HP gain per level'
    },
    {
      name: 'balanced',
      display: 'Balanced',
      description: 'Versatile all-rounder',
      color: '#ffff00',
      stats: {
        hp: 300,
        maxHp: 300,
        damage: 15,
        speed: 3,
        armor: 22,
        evasion: 12,
        criticalChance: 0.10,
        criticalDamage: 1.5,
        regen: 1,
        cooldown: 1
      },
      abilities: ['SHIELD', 'ADRENALINE RUSH'],
      passive: 'Adaptability - 6% all stats per level'
    },
    {
      name: 'sniper',
      display: 'Sniper',
      description: 'High crit chance, precision attacks',
      color: '#00ffff',
      stats: {
        hp: 220,
        maxHp: 220,
        damage: 14,
        speed: 3,
        armor: 10,
        evasion: 20,
        criticalChance: 0.25,
        criticalDamage: 2.5,
        regen: 0.8,
        cooldown: 1
      },
      abilities: ['SNIPER SHOT', 'SMOKE SCREEN'],
      passive: 'Sharpshooter - 8% crit chance per level'
    },
    {
      name: 'berserker',
      display: 'Berserker',
      description: 'Rage builds over time',
      color: '#ff0000',
      stats: {
        hp: 320,
        maxHp: 320,
        damage: 18,
        speed: 3.2,
        armor: 12,
        evasion: 10,
        criticalChance: 0.18,
        criticalDamage: 2.2,
        regen: 1,
        cooldown: 1
      },
      abilities: ['BERSERK RAGE', 'WHIRLWIND'],
      passive: 'Adrenaline - 8% damage per rage, max 100%'
    },
    {
      name: 'guardian',
      display: 'Guardian',
      description: 'High armor, support capabilities',
      color: '#888888',
      stats: {
        hp: 450,
        maxHp: 450,
        damage: 10,
        speed: 2.2,
        armor: 40,
        evasion: 8,
        criticalChance: 0,
        criticalDamage: 0,
        regen: 1.5,
        cooldown: 1
      },
      abilities: ['SHIELD', 'DIVINE PROTECTION'],
      passive: 'Protector - 10% armor per level'
    }
  ],

  // Difficulty settings
  difficulties: {
    easy: {
      name: 'Easy',
      enemySpeed: 0.7,
      enemyDamage: 0.6,
      enemyHp: 0.8,
      scoreMultiplier: 0.5,
      description: 'For newcomers'
    },
    normal: {
      name: 'Normal',
      enemySpeed: 1.0,
      enemyDamage: 1.0,
      enemyHp: 1.0,
      scoreMultiplier: 1.0,
      description: 'Standard difficulty'
    },
    hard: {
      name: 'Hard',
      enemySpeed: 1.4,
      enemyDamage: 1.4,
      enemyHp: 1.4,
      scoreMultiplier: 1.5,
      description: 'For experienced players'
    },
    nightmare: {
      name: 'Nightmare',
      enemySpeed: 1.8,
      enemyDamage: 2.0,
      enemyHp: 2.0,
      scoreMultiplier: 2.5,
      description: 'For true masters'
    }
  },

  // Enemy types - BUFFED for extreme difficulty (from enemy.js)
  enemyTypes: {
    grunt: {
      name: 'Grunt',
      hp: 150,
      damage: 25,
      speed: 120,
      size: 12,
      color: '#3a99e7',
      xp: 10,
      score: 10
    },
    fast: {
      name: 'Fast',
      hp: 80,
      damage: 18,
      speed: 250,
      size: 10,
      color: '#9fe95a',
      xp: 15,
      score: 15
    },
    tank: {
      name: 'Tank',
      hp: 450,
      damage: 20,
      speed: 80,
      size: 18,
      color: '#756767',
      xp: 30,
      score: 30
    },
    shooter: {
      name: 'Shooter',
      hp: 120,
      damage: 25,
      speed: 100,
      size: 12,
      color: '#6518ca',
      xp: 20,
      score: 20,
      shoots: true
    },
    elite: {
      name: 'Elite',
      hp: 550,
      damage: 20,
      speed: 120,
      size: 16,
      color: '#aa0000',
      xp: 100,
      score: 100,
      shoots: true
    }
  },

  // Boss configuration
  bosses: {
    levels: [15, 30, 45, 60, 75, 90, 100],
    hpMultipliers: [1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0],
    damageMultipliers: [1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0],
    patterns: [
      { name: 'SWARM', type: 'swarm', description: 'Spawns multiple small enemies' },
      { name: 'BEAM', type: 'beam', description: 'Shoots a powerful beam' },
      { name: 'ORBIT', type: 'orbit', description: 'Orbits player then releases nova' },
      { name: 'NOVA', type: 'nova', description: 'Rapid nova burst attacks' },
      { name: 'CRUSH', type: 'crush', description: 'Crushes the player' },
      { name: 'SWARM', type: 'swarm', description: 'Massive swarm assault' },
      { name: 'CRUSH', type: 'crush', description: 'Final crush attack' }
    ]
  },

  // Score calculation
  scorePoints: {
    enemyKill: 10,
    bossKill: 100,
    perfectShot: 5,
    combo: [2, 5, 10, 20, 50, 100, 200, 500, 1000], // Multipliers for consecutive kills
    levelUp: 50,
    itemPickup: 25
  },

  // Item pickups
  items: {
    passive: [
      { name: 'HP Potion', effect: 'heal', value: 20, rarity: 'common' },
      { name: 'Strength Potion', effect: 'stat', value: 5, type: 'damage', rarity: 'uncommon' },
      { name: 'Health Potion', effect: 'stat', value: 10, type: 'armor', rarity: 'uncommon' },
      { name: 'Speed Potion', effect: 'stat', value: 5, type: 'speed', rarity: 'uncommon' },
      { name: 'Evasion Potion', effect: 'stat', value: 10, type: 'evasion', rarity: 'uncommon' },
      { name: 'Regeneration Potion', effect: 'stat', value: 2, type: 'regen', rarity: 'rare' },
      { name: 'Critical Potion', effect: 'stat', value: 10, type: 'crit_chance', rarity: 'rare' }
    ],
    active: [
      { name: 'Healing Shot', type: 'heal', cooldown: 6, duration: 0 },
      { name: 'Shield', type: 'shield', cooldown: 8, duration: 0 },
      { name: 'Sniper Shot', type: 'crit', cooldown: 10, duration: 0 },
      { name: 'Berserk Rage', type: 'rage', cooldown: 12, duration: 0 },
      { name: 'Dash', type: 'dash', cooldown: 4, duration: 0.2 },
      { name: 'Teleport', type: 'teleport', cooldown: 12, duration: 0 },
      { name: 'Ground Slam', type: 'aoe', cooldown: 8, duration: 0 },
      { name: 'Adrenaline Rush', type: 'speed', cooldown: 12, duration: 4 },
      { name: 'Smoke Screen', type: 'invisibility', cooldown: 15, duration: 3 },
      { name: 'Whirlwind', type: 'whirlwind', cooldown: 10, duration: 2 },
      { name: 'Divine Protection', type: 'immunity', cooldown: 20, duration: 2 },
      { name: 'Overload', type: 'damage_boost', cooldown: 15, duration: 5 }
    ]
  },

  // Particles
  particles: {
    types: ['spark', 'spark_small', 'smoke', 'spark_green', 'spark_purple', 'spark_orange'],
    colors: ['#ffffff', '#888888', '#555555', '#00ff00', '#9d00ff', '#ff8800']
  },

  // Pickup values (matching pickup.js)
  pickups: {
    health: { value: 20, color: '#44ff44' },
    shield: { value: 10, color: '#4444ff' },
    speed: { value: 5, color: '#ffff44' },
    damage: { value: 2, color: '#ff4444' }
  },

  // Game settings
  maxScore: Infinity,
  frameRate: 60,
  showFPS: true
};

export default GAME_CONFIG;
