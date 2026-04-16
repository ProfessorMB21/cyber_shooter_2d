// Level Up Scene

class LevelUpScene {
  constructor(game) {
    this.game = game;
  }

  update() {
    // Auto-dismiss after 2 seconds
    return null;
  }

  render(ctx, width, height) {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 50, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL UP!', width / 2, height / 2);

    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText(`Level ${this.game.player.level}`, width / 2, height / 2 + 50);

    // Passive text
    ctx.fillStyle = '#ff0';
    ctx.font = '16px monospace';
    ctx.fillText(this.game.player.build.passive, width / 2, height / 2 + 90);
  }
}

export { LevelUpScene };
