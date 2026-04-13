// Start Scene
// NOTE: This scene is not currently integrated. Game uses inline render methods.
// To integrate: import config and pass game instance references.

import config from '../config.js';

class StartScene {
  constructor(game) {
    this.game = game;
  }

  update(deltaTime) {
    return true;
  }

  render(ctx) {
    const width = this.game.width;
    const height = this.game.height;

    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(config.TITLE, width / 2, height / 2 - 50);

    // Draw subtitle
    ctx.font = '24px "Courier New"';
    ctx.fillText('Select a build to start', width / 2, height / 2 + 10);

    // Draw build buttons
    const builds = config.builds.slice(0, 3); // Show first 3 builds
    const buttonHeight = 60;
    const spacing = 40;

    builds.forEach((build, index) => {
      const y = height / 2 + 150 + index * buttonHeight + spacing;
      const x = width / 2 - 150;

      // Draw button
      ctx.fillStyle = '#222';
      ctx.fillRect(x, y, 300, buttonHeight);
      ctx.strokeStyle = '#444';
      ctx.strokeRect(x, y, 300, buttonHeight);

      // Draw text
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(build.display, width / 2, y + buttonHeight / 2 + 10);
    });
  }
}

export { StartScene };
