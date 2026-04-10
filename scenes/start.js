// Start Scene

class StartScene {
  constructor(sceneManager, config) {
    this.sceneManager = sceneManager;
    this.config = config;
  }

  update(deltaTime) {
    return false; // Exit scene after 3 seconds
  }

  render(ctx) {
    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('Simple Claude Game', GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2 - 50);

    // Draw subtitle
    ctx.font = '24px "Courier New"';
    ctx.fillText('Select a build to start', GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2 + 10);

    // Draw build buttons
    const builds = ['fighter', 'caster', 'assault'];
    const buttonHeight = 60;
    const spacing = 40;

    builds.forEach((build, index) => {
      const y = GAME_CONFIG.HEIGHT / 2 + 150 + index * buttonHeight + spacing;
      const x = GAME_CONFIG.WIDTH / 2 - 150;

      // Draw button
      ctx.fillStyle = '#222';
      ctx.fillRect(x, y, 300, buttonHeight);
      ctx.strokeStyle = '#444';
      ctx.strokeRect(x, y, 300, buttonHeight);

      // Draw text
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(build.charAt(0).toUpperCase() + build.slice(1), GAME_CONFIG.WIDTH / 2, y + buttonHeight / 2 + 10);
    });
  }
}

module.exports = { StartScene };
