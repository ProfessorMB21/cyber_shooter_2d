// Pause Scene - Pause menu overlay

class PauseScene {
  constructor(game) {
    this.game = game;
  }

  update(input) {
    if (input.isKeyPressed('escape') || input.isKeyPressed('p')) {
      return { action: 'resume' };
    }
    if (input.isKeyPressed('r')) {
      return { action: 'restart' };
    }
    return null;
  }

  render(ctx, width, height, game) {
    // Keep rendering the game in background (frozen)
    game.render();

    // Semi-transparent dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);

    // Pause menu container
    const menuWidth = 400;
    const menuHeight = 250;
    const menuX = (width - menuWidth) / 2;
    const menuY = (height - menuHeight) / 2;

    // Menu background
    ctx.fillStyle = 'rgba(20, 20, 30, 0.95)';
    ctx.fillRect(menuX, menuY, menuWidth, menuHeight);

    // Menu border
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 3;
    ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);

    // Title
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', width / 2, menuY + 50);

    // Game stats
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText(`Score: ${Math.floor(game.score)}`, width / 2, menuY + 90);
    ctx.fillText(`Time: ${Math.floor(game.gameTime)}s`, width / 2, menuY + 115);
    ctx.fillText(`Kills: ${game.kills}`, width / 2, menuY + 140);

    // Instructions
    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText('Press ESC or P to Resume', width / 2, menuY + 185);
    ctx.fillText('Press R to Restart', width / 2, menuY + 210);
  }
}

export { PauseScene };
