// Boss Configuration

const BOSS_PATTERNS = [
  { name: 'Cyber Drone', hp: 1200, damage: 40, speed: 60, pattern: 'beam', projectileCount: 12, projectileSpeed: 80, interval: 2.5 },
  { name: 'Cyber Drone Alpha', hp: 2000, damage: 95, speed: 60, pattern: 'swarm', projectileCount: 8, projectileSpeed: 150, interval: 2 },
  { name: 'Neon Destroyer', hp: 5000, damage: 50, speed: 50, pattern: 'beam', projectileCount: 5, projectileSpeed: 200, interval: 3 },
  { name: 'Orbital Warden', hp: 10000, damage: 70, speed: 40, pattern: 'orbit', projectileCount: 6, projectileSpeed: 120, interval: 2.5 },
  { name: 'Nova Prime', hp: 20000, damage: 100, speed: 35, pattern: 'nova', projectileCount: 12, projectileSpeed: 180, interval: 2 },
  { name: 'Crush Titan', hp: 40000, damage: 150, speed: 30, pattern: 'crush', projectileCount: 1, projectileSpeed: 300, interval: 4 },
  { name: 'Swarm Overlord', hp: 80000, damage: 200, speed: 45, pattern: 'swarm', projectileCount: 20, projectileSpeed: 150, interval: 1.5 },
  { name: 'Cyber Core', hp: 150000, damage: 300, speed: 70, pattern: 'crush', projectileCount: 3, projectileSpeed: 250, interval: 1 }
];

const BOSS_CONFIG = {
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
};

export { BOSS_PATTERNS, BOSS_CONFIG };

