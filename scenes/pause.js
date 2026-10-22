// Pause Scene - Pause menu overlay

import { ScreenItems, readMouse, drawButton } from './ui.js';

class PauseScene {
  constructor(game) {
    this.game = game;
    this.items = new ScreenItems();
    this.hoveredId = null;
  }

  // Where the buttons are. They sit in the pause box in the middle of the
  // screen.
  layout(width, height) {
    this.items.reset();
    const menuWidth = 460;
    const menuHeight = 300;
    const menuX = (width - menuWidth) / 2;
    const menuY = (height - menuHeight) / 2;
    const buttons = this.items.buttonRow(['resume', 'restart', 'quit'], menuY + 195, menuWidth, 36, 16, menuX);
    return { menuWidth, menuHeight, menuX, menuY, buttons };
  }

  update(input) {
    this.layout(this.game.width, this.game.height);

    const mouse = readMouse(this.items, input);
    this.hoveredId = mouse.hovered ? mouse.hovered.id : null;
    if (mouse.clicked) {
      if (mouse.clicked.id === 'resume') return { action: 'resume' };
      if (mouse.clicked.id === 'restart') return { action: 'restart' };
      if (mouse.clicked.id === 'quit') return { action: 'quit' };
    }

    if (input.isKeyPressed('escape') || input.isKeyPressed('p')) {
      return { action: 'resume' };
    }
    if (input.isKeyPressed('r')) {
      return { action: 'restart' };
    }
    if (input.isKeyPressed('q')) {
      return { action: 'quit' };
    }
    return null;
  }

  render(ctx, width, height, game) {
    // Keep rendering the game in background (frozen)
    game.render();

    // Semi-transparent dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);

    const layout = this.layout(width, height);
    const { menuWidth, menuHeight, menuX, menuY, buttons } = layout;

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

    // The three ways out
    drawButton(ctx, { ...buttons.resume, label: 'RESUME (ESC)', hovered: this.hoveredId === 'resume' });
    drawButton(ctx, { ...buttons.restart, label: 'RESTART (R)', hovered: this.hoveredId === 'restart' });
    drawButton(ctx, { ...buttons.quit, label: 'QUIT (Q)', color: '#f66', hovered: this.hoveredId === 'quit' });
  }
}

export { PauseScene };
