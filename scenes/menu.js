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
  }

  update(input) {
    // Handle input
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

    // Difficulty selection
    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.fillText('Select Difficulty:', width / 2, 180);

    this.difficulties.forEach((diff, i) => {
      const y = 210 + i * 35;
      const selected = i === this.difficultySelection;

      if (selected) {
        ctx.fillStyle = '#0f0';
        ctx.fillRect(width / 2 - 100, y - 20, 200, 28);
        ctx.fillStyle = '#000';
      } else {
        ctx.fillStyle = '#444';
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
    ctx.fillText('Press [SPACE] to Start!', width / 2, instructionY + 65);
  }
}

export { MenuScene };
