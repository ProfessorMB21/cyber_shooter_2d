// Menu Scene - Main menu with build and difficulty selection

import { BUILDS } from '../entities/player.js';
import { DIFFICULTIES } from '../config/index.js';

class MenuScene {
  constructor(game) {
    this.game = game;
    this.buildSelection = 0;
    this.difficultySelection = 1;
    this.buildNames = Object.keys(BUILDS);
    this.difficulties = Object.keys(DIFFICULTIES);
    this.menuState = 'main'; // 'main' or 'build_select'
  }

  update(input) {
    if (this.menuState === 'main') {
      // Main menu - Settings/Play options
      if (input.isKeyPressed(' ')) {
        return { action: 'show_builds' };
      }
      if (input.isKeyPressed('s')) {
        return { action: 'show_settings' };
      }
      return null;
    }

    // Build/difficulty selection state
    if (input.isKeyPressed('ArrowUp')) {
      this.buildSelection = (this.buildSelection - 1 + this.buildNames.length) % this.buildNames.length;
    }
    if (input.isKeyPressed('ArrowDown')) {
      this.buildSelection = (this.buildSelection + 1) % this.buildNames.length;
    }
    if (input.isKeyPressed('ArrowLeft')) {
      this.difficultySelection = (this.difficultySelection - 1 + this.difficulties.length) % this.difficulties.length;
    }
    if (input.isKeyPressed('ArrowRight')) {
      this.difficultySelection = (this.difficultySelection + 1) % this.difficulties.length;
    }
    if (input.isKeyPressed(' ')) {
      return {
        action: 'start',
        build: this.buildNames[this.buildSelection],
        difficulty: this.difficulties[this.difficultySelection]
      };
    }
    if (input.isKeyPressed('escape')) {
      this.menuState = 'main';
    }
    return null;
  }

  render(ctx, width, height, particles) {
    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Draw ambient particles
    if (particles) {
      particles.update(1/60);
      particles.draw(ctx);
    }

    // Title
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CYBER SHOOTER', width / 2, 100);

    ctx.fillStyle = '#888';
    ctx.font = '20px monospace';
    ctx.fillText('A Retro Space Shooter', width / 2, 130);

    if (this.menuState === 'main') {
      this.renderMainMenu(ctx, width, height);
    } else {
      this.renderBuildSelect(ctx, width, height);
    }
  }

  renderMainMenu(ctx, width, height) {
    const centerY = height / 2;

    // Play button
    let playY = centerY - 60;
    ctx.fillStyle = '#0f0';
    ctx.fillRect(width / 2 - 120, playY - 30, 240, 50);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PLAY', width / 2, playY + 8);

    // Settings button
    let settingsY = centerY + 40;
    ctx.fillStyle = '#0f0';
    ctx.fillRect(width / 2 - 120, settingsY - 30, 240, 50);
    ctx.fillStyle = '#000';
    ctx.fillText('SETTINGS', width / 2, settingsY + 8);

    // Instructions
    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[SPACE] Play  [S] Settings', width / 2, height - 40);
  }

  renderBuildSelect(ctx, width, height) {
    // Difficulty selection
    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.fillText('Select Difficulty:', width / 2, 180);

    const difficultyColors = {
      'easy': '#4f4',
      'normal': '#ff0',
      'hard': '#f80',
      'nightmare': '#f00'
    };

    this.difficulties.forEach((diff, i) => {
      const y = 210 + i * 35;
      const selected = i === this.difficultySelection;
      const color = difficultyColors[diff] || '#888';

      if (selected) {
        ctx.fillStyle = color;
        ctx.fillRect(width / 2 - 100, y - 20, 200, 28);
        ctx.fillStyle = '#000';
      } else {
        ctx.fillStyle = color;
      }

      ctx.font = selected ? 'bold 18px monospace' : '18px monospace';
      ctx.fillText(diff.toUpperCase(), width / 2, y);
    });

    // Build selection
    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.fillText('Select Build:', width / 2, 380);

    this.buildNames.forEach((build, i) => {
      const buildData = BUILDS[build];
      const y = 410 + i * 45;
      const selected = i === this.buildSelection;

      // Box
      ctx.fillStyle = selected ? '#0f0' : '#222';
      ctx.fillRect(width / 2 - 150, y - 25, 300, 38);

      // Border
      ctx.strokeStyle = selected ? '#fff' : '#444';
      ctx.lineWidth = 2;
      ctx.strokeRect(width / 2 - 150, y - 25, 300, 38);

      // Name
      ctx.fillStyle = selected ? '#000' : buildData.color;
      ctx.font = selected ? 'bold 16px monospace' : '16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(buildData.name, width / 2 - 140, y - 5);

      // Description
      ctx.fillStyle = selected ? '#333' : '#888';
      ctx.font = '12px monospace';
      ctx.fillText(buildData.description.substring(0, 35), width / 2 - 140, y + 10);
    });

    // Instructions
    const instructionY = height - 100;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width / 2 - 250, instructionY - 35, 500, 70);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 250, instructionY - 35, 500, 70);

    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('◀ LEFT/RIGHT ▸  Change Difficulty', width / 2, instructionY - 10);
    ctx.fillText('▲ UP/DOWN ▼    Select Build', width / 2, instructionY + 15);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('Press [SPACE] to Start! [ESC] Back', width / 2, instructionY + 65);
  }
}

export { MenuScene };
