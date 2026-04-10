// Level Up Scene

class LevelUpScene {
  constructor() {
    this.level = 1;
  }

  // Update
  update(deltaTime) {
    return true;
  }

  // Draw
  draw(ctx) {
    // Draw level up particles
    particles.spawnExplosion(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 100, 20, '#ffff00');

    // Draw level text
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 48px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL UP!', GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 80);

    // Draw level
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${this.level - 1} -> ${this.level}`, GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 30);

    // Draw stats
    ctx.fillStyle = '#888';
    ctx.font = '16px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('Strength, Health, and Speed have increased', GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT + 10);
  }
}
