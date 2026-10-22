// Game Over Scene

import { ScreenItems, readMouse, drawButton } from './ui.js';

class GameOverScene {
  constructor(game) {
    this.game = game;
    this.items = new ScreenItems();
    this.hoveredId = null;
  }

  layout(width, height) {
    this.items.reset();
    const buttons = this.items.buttonRow(['menu'], height / 2 + 130, width, 36);
    return { buttons };
  }

  update(input) {
    this.layout(this.game.width, this.game.height);

    const mouse = readMouse(this.items, input);
    this.hoveredId = mouse.hovered ? mouse.hovered.id : null;
    if (mouse.clicked && mouse.clicked.id === 'menu') {
      return { action: 'menu' };
    }

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

    // Return to the main menu
    const layout = this.layout(width, height);
    drawButton(ctx, { ...layout.buttons.menu, label: 'RETURN TO THE MENU (SPACE)', hovered: this.hoveredId === 'menu' });
  }
}

export { GameOverScene };
