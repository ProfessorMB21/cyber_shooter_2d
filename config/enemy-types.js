// Enemy Type Configurations

const ENEMY_TYPES = {
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
    xp: 80,
    score: 30
  },
  shooter: {
    name: 'Shooter',
    hp: 120,
    damage: 25,
    speed: 100,
    size: 12,
    color: '#6518ca',
    xp: 55,
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
    xp: 130,
    score: 100,
    shoots: true
  }
};

export { ENEMY_TYPES };
