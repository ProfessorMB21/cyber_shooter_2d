// Player Build Configurations

const PLAYER_BUILDS = [
  {
    name: 'fighter',
    display: 'Fighter',
    description: 'Balanced with high health and damage',
    color: '#00ff00',
    stats: {
      hp: 350, maxHp: 350, damage: 12, speed: 2.5, armor: 15,
      evasion: 5, criticalChance: 0, criticalDamage: 1.0, regen: 1, cooldown: 1
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
      hp: 200, maxHp: 200, damage: 35, speed: 3.5, armor: 8,
      evasion: 15, criticalChance: 0.20, criticalDamage: 2.0, regen: 0.5, cooldown: 1
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
      hp: 550, maxHp: 550, damage: 8, speed: 1.8, armor: 45,
      evasion: 0, criticalChance: 0, criticalDamage: 0, regen: 1.5, cooldown: 1
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
      hp: 300, maxHp: 300, damage: 15, speed: 3, armor: 22,
      evasion: 12, criticalChance: 0.10, criticalDamage: 1.5, regen: 1, cooldown: 1
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
      hp: 220, maxHp: 220, damage: 14, speed: 3, armor: 10,
      evasion: 20, criticalChance: 0.25, criticalDamage: 2.5, regen: 0.8, cooldown: 1
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
      hp: 320, maxHp: 320, damage: 18, speed: 3.2, armor: 12,
      evasion: 10, criticalChance: 0.18, criticalDamage: 2.2, regen: 1, cooldown: 1
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
      hp: 450, maxHp: 450, damage: 10, speed: 2.2, armor: 40,
      evasion: 8, criticalChance: 0, criticalDamage: 0, regen: 1.5, cooldown: 1
    },
    abilities: ['SHIELD', 'DIVINE PROTECTION'],
    passive: 'Protector - 10% armor per level'
  }
];

// Transform to BUILDS object format used by the game
const BUILDS = {};
PLAYER_BUILDS.forEach(build => {
  BUILDS[build.name] = {
    name: build.display,
    description: build.description,
    color: build.color,
    stats: { ...build.stats },
    abilities: build.abilities,
    passive: build.passive
  };
});

export { PLAYER_BUILDS, BUILDS };
