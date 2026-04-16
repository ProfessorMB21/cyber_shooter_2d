// Game Over Scene

class GameOverScene {
  constructor(game) {
    this.game = game;
  }

  update(input) {
    if (input.isKeyPressed(' ')) {
      return { action: 'menu' };
    }
    return null;
  }

  render(ctx, width, height) {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#f00';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', width / 2, height / 2 - 50);

    // Stats
    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText(`Final Score: ${Math.floor(this.game.score)}`, width / 2, height / 2 + 10);
    ctx.fillText(`Time Survived: ${Math.floor(this.game.gameTime)}s`, width / 2, height / 2 + 40);
    ctx.fillText(`Kills: ${this.game.kills}`, width / 2, height / 2 + 70);

    // Restart
    ctx.fillStyle = '#888';
    ctx.font = '18px monospace';
    ctx.fillText('Press SPACE to restart', width / 2, height / 2 + 120);
  }
}

export { GameOverScene };
