// Startup Scene

class StartupScene {
  constructor() {
    this.title = GAME_CONFIG.TITLE;
    this.subtitle = GAME_CONFIG.SUBTITLE;
    this.backgroundMusic = null;

    // Track mouse position for menu
    this.menuCursor = 0;
    this.menuDirection = 1;
  }

  // Update
  update(deltaTime) {
    // Track mouse for menu navigation
    if (mouseX !== null && mouseY !== null) {
      this.menuCursor = mouseY;
      // Calculate which menu option is under cursor
      const menuHeight = 80;
      const menuY = GAME_CONFIG.HEIGHT / 2 - menuHeight / 2 + 40;
      const selectedIndex = Math.floor((mouseY - menuY) / menuHeight);

      if (selectedIndex >= 0 && selectedIndex < GAME_CONFIG.MENU_OPTIONS.length) {
        GAME_CONFIG.selectedMenuOption = GAME_CONFIG.MENU_OPTIONS[selectedIndex];
      }
    }

    // Animate title
    if (!this.titleAnimated) {
      this.titleAnimated = true;
      this.titleOpacity = 1;
    }

    // Animate subtitle
    if (!this.subtitleAnimated) {
      this.subtitleAnimated = true;
      this.subtitleOpacity = 1;
    }

    return true;
  }

  // Draw
  draw(ctx) {
    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);

    // Draw title
    ctx.fillStyle = `rgba(157, 0, 255, ${this.titleOpacity})`;
    ctx.font = 'bold 48px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(this.title, GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2 - 60);

    // Draw subtitle
    ctx.fillStyle = `rgba(255, 255, 255, ${this.subtitleOpacity})`;
    ctx.font = '20px "Courier New"';
    ctx.fillText(this.subtitle, GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2 + 10);

    // Draw menu options
    const menuY = GAME_CONFIG.HEIGHT / 2 - 120;
    const menuOptions = GAME_CONFIG.MENU_OPTIONS;

    for (let i = 0; i < menuOptions.length; i++) {
      const isSelected = GAME_CONFIG.selectedMenuOption === menuOptions[i];
      const yOffset = i * 40;
      const y = menuY + yOffset;
      const x = GAME_CONFIG.WIDTH / 2 - 140;

      // Background for selected
      if (isSelected) {
        ctx.fillStyle = `rgba(157, 0, 255, 0.3)`;
        ctx.fillRect(x, y, 280, 30);
      } else if (i === Math.floor((mouseY - menuY) / 40)) {
        ctx.fillStyle = `rgba(255, 255, 255, 0.1)`;
        ctx.fillRect(x, y, 280, 30);
      }

      // Text
      ctx.fillStyle = isSelected ? '#9d00ff' : '#ffffff';
      ctx.font = 'bold 16px "Courier New"';
      ctx.fillText(menuOptions[i], GAME_CONFIG.WIDTH / 2, y + 16);

      // Border highlight for selected
      if (isSelected) {
        ctx.strokeStyle = '#9d00ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 5, y + 5, 270, 20);
      }
    }

    // Draw credits
    ctx.fillStyle = `rgba(255, 255, 255, ${this.subtitleOpacity})`;
    ctx.font = '12px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(`v${GAME_CONFIG.VERSION}`, GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 20);
  }

  // Handle input
  handleInput(key) {
    // Escape - quit
    if (key === 'Escape') {
      return 'quit';
    }

    // Enter - start
    if (key === 'Enter' && GAME_CONFIG.selectedMenuOption === 'start') {
      return 'start';
    }

    // Arrow keys - navigate menu
    if (key === 'ArrowUp') {
      const currentIndex = GAME_CONFIG.MENU_OPTIONS.indexOf(GAME_CONFIG.selectedMenuOption);
      if (currentIndex > 0) {
        GAME_CONFIG.selectedMenuOption = GAME_CONFIG.MENU_OPTIONS[currentIndex - 1];
      }
      return 'navigate';
    }

    if (key === 'ArrowDown') {
      const currentIndex = GAME_CONFIG.MENU_OPTIONS.indexOf(GAME_CONFIG.selectedMenuOption);
      if (currentIndex < GAME_CONFIG.MENU_OPTIONS.length - 1) {
        GAME_CONFIG.selectedMenuOption = GAME_CONFIG.MENU_OPTIONS[currentIndex + 1];
      }
      return 'navigate';
    }
  }

  // Check if should transition
  checkTransition() {
    if (this.titleOpacity < 0) {
      this.titleOpacity = 0;
      return 'menu';
    }
    if (this.subtitleOpacity < 0) {
      this.subtitleOpacity = 0;
      return 'menu';
    }
    return null;
  }
}

const startupScene = new StartupScene();
