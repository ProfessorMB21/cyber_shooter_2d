// Difficulty Settings

const DIFFICULTIES = {
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
};

export { DIFFICULTIES };
