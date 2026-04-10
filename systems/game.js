// Game System (Legacy - use game.js instead)

import { Player, BUILDS } from '../entities/player.js';

class GameState {
  constructor(game) {
    this.game = game;
    this.currentScene = 'start';
    this.sceneQueue = [];
    this.transitions = [];
  }
}

class PlayerManager {
  constructor(game, config) {
    this.game = game;
    this.config = config;
    this.player = null;
    this.projectiles = [];
    this.enemies = [];
    this.bosses = [];
    this.pickups = [];
  }

  update(deltaTime) {
    // Legacy update method
    if (this.player) {
      this.player.update(deltaTime, this.game.input, this.game.width, this.game.height);
    }
  }

  render(ctx) {
    // Draw background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    // Draw entities
    if (this.player) {
      this.player.draw(ctx);
    }
  }
}

export { GameState, Player, PlayerManager, BUILDS };
