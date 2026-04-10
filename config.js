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

  // Player builds
  builds: [
    {
      name: 'fighter',
      display: 'Fighter',
      description: 'Balanced with high health and damage',
      hp: 500,
      maxHp: 500,
      damage: 20,
      speed: 3,
      armor: 20,
      evasion: 5,
      criticalChance: 0,
      criticalDamage: 1.0,
      regen: 2,
      cooldown: 1,
      abilities: ['HEALING SHOT'],
      passive: 'Toughen Up - 10% HP gain per level'
    },
    {
      name: 'glass_cannon',
      display: 'Glass Cannon',
      description: 'Extreme damage but fragile',
      hp: 280,
      maxHp: 280,
      damage: 65,
      speed: 5,
      armor: 5,
      evasion: 15,
      criticalChance: 0.20,
      criticalDamage: 2.0,
      regen: 1,
      cooldown: 1,
      abilities: ['HEALING SHOT'],
      passive: 'Overclock - 12% damage per level'
    },
    {
      name: 'tank',
      display: 'Tank',
      description: 'Massive health pool, slow',
      hp: 800,
      maxHp: 800,
      damage: 15,
      speed: 2,
      armor: 60,
      evasion: 0,
      criticalChance: 0,
      criticalDamage: 0,
      regen: 3,
      cooldown: 1,
      abilities: ['SHIELD'],
      passive: 'Iron Skin - 15% HP gain per level'
    },
    {
      name: 'balanced',
      display: 'Balanced',
      description: 'Versatile all-rounder',
      hp: 450,
      maxHp: 450,
      damage: 28,
      speed: 4,
      armor: 25,
      evasion: 12,
      criticalChance: 0.10,
      criticalDamage: 1.5,
      regen: 2,
      cooldown: 1,
      abilities: ['SHIELD'],
      passive: 'Adaptability - 8% all stats per level'
    },
    {
      name: 'sniper',
      display: 'Sniper',
      description: 'High crit chance, precision attacks',
      hp: 320,
      maxHp: 320,
      damage: 25,
      speed: 4,
      armor: 15,
      evasion: 20,
      criticalChance: 0.25,
      criticalDamage: 2.5,
      regen: 1.5,
      cooldown: 1,
      abilities: ['SNIPER SHOT'],
      passive: 'Sharpshooter - 10% crit chance per level'
    },
    {
      name: 'berserker',
      display: 'Berserker',
      description: 'Rage builds over time',
      hp: 480,
      maxHp: 480,
      damage: 35,
      speed: 4.5,
      armor: 18,
      evasion: 10,
      criticalChance: 0.18,
      criticalDamage: 2.2,
      regen: 1.8,
      cooldown: 1,
      abilities: ['BERSERK RAGE'],
      passive: 'Adrenaline - 10% damage per rage, max 150%'
    },
    {
      name: 'guardian',
      display: 'Guardian',
      description: 'High armor, support capabilities',
      hp: 650,
      maxHp: 650,
      damage: 18,
      speed: 3,
      armor: 55,
      evasion: 8,
      criticalChance: 0,
      criticalDamage: 0,
      regen: 3,
      cooldown: 1,
      abilities: ['SHIELD', 'REVIVE'],
      passive: 'Protector - 12% armor per level'
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
      { name: 'HP Potion', effect: 'heal', value: 100, rarity: 'common' },
      { name: 'MP Potion', effect: 'mana', value: 50, rarity: 'common' },
      { name: 'Strength Potion', effect: 'stat', value: 5, type: 'damage', rarity: 'uncommon' },
      { name: 'Health Potion', effect: 'stat', value: 10, type: 'armor', rarity: 'uncommon' },
      { name: 'Speed Potion', effect: 'stat', value: 5, type: 'speed', rarity: 'uncommon' },
      { name: 'Evasion Potion', effect: 'stat', value: 10, type: 'evasion', rarity: 'uncommon' },
      { name: 'Regeneration Potion', effect: 'stat', value: 2, type: 'regen', rarity: 'rare' },
      { name: 'Critical Potion', effect: 'stat', value: 10, type: 'crit_chance', rarity: 'rare' }
    ],
    active: [
      { name: 'Healing Shot', type: 'heal', cooldown: 10, duration: 30 },
      { name: 'Shield', type: 'shield', cooldown: 15, duration: 60 },
      { name: 'Sniper Shot', type: 'crit', cooldown: 20, duration: 0 },
      { name: 'Berserk Rage', type: 'rage', cooldown: 30, duration: 0 }
    ]
  },

  // Particles
  particles: {
    types: ['spark', 'spark_small', 'smoke', 'spark_green', 'spark_purple', 'spark_orange'],
    colors: ['#ffffff', '#888888', '#555555', '#00ff00', '#9d00ff', '#ff8800']
  },

  // Game settings
  maxScore: Infinity,
  frameRate: 60,
  showFPS: false
};

export default GAME_CONFIG;
