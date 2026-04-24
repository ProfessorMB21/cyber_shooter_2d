// Game State Management System

import { DamageNumberSystem } from './damagenumbers.js';

class GameState {
  constructor() {
    this.state = 'menu'; // menu, playing, paused, gameover, levelup
    this.buildSelection = 0;
    this.difficultySelection = 1;
    this.difficulties = ['easy', 'normal', 'hard', 'nightmare'];
    
    // Game data
    this.player = null;
    this.enemies = [];
    this.bosses = [];
    this.projectiles = [];
    this.pickups = [];
    
    // Timing
    this.gameTime = 0;
    this.wave = 1;
    
    // Spawning
    this.spawnTimer = 0;
    this.spawnInterval = 2;
    this.bossSpawned = [];
    
    // Score
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.kills = 0;
    
    // Screen shake
    this.shakeAmount = 0;
    this.shakeDecay = 5;
    this.cameraX = 0;
    this.cameraY = 0;
    
    // Damage numbers
    this.damageNumbers = new DamageNumberSystem();
    
    // Boss health bars (for displaying multiple bosses)
    this.bossHealthBars = [];
  }
  
  reset() {
    this.state = 'menu';
    this.buildSelection = 0;
    this.difficultySelection = 1;
    this.player = null;
    this.enemies = [];
    this.bosses = [];
    this.projectiles = [];
    this.pickups = [];
    this.gameTime = 0;
    this.wave = 1;
    this.spawnTimer = 0;
    this.bossSpawned = [];
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.kills = 0;
    this.shakeAmount = 0;
    this.cameraX = 0;
    this.cameraY = 0;
    this.damageNumbers.clear();
    this.bossHealthBars = [];
  }
  
  startGame(player, difficulty) {
    this.player = player;
    this.difficulty = difficulty;
    this.enemies = [];
    this.bosses = [];
    this.projectiles = [];
    this.pickups = [];
    this.gameTime = 0;
    this.wave = 1;
    this.score = 0;
    this.combo = 0;
    this.kills = 0;
    this.bossSpawned = [];
    this.spawnTimer = 0;
    this.state = 'playing';
  }
  
  addShake(amount) {
    this.shakeAmount = Math.min(this.shakeAmount + amount, 20);
  }
  
  updateShake(deltaTime) {
    if (this.shakeAmount > 0) {
      this.cameraX = (Math.random() - 0.5) * this.shakeAmount;
      this.cameraY = (Math.random() - 0.5) * this.shakeAmount;
      this.shakeAmount = Math.max(0, this.shakeAmount - this.shakeDecay * deltaTime);
    } else {
      this.cameraX = 0;
      this.cameraY = 0;
    }
  }
  
  addDamageNumber(x, y, damage, isCrit = false, color = '#ffffff') {
    this.damageNumbers.addDamage(x, y, damage, isCrit, color);
  }
  
  updateDamageNumbers(deltaTime) {
    this.damageNumbers.update(deltaTime);
  }
  
  drawDamageNumbers(ctx) {
    this.damageNumbers.draw(ctx);
  }
}

export { GameState };
