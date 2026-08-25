// Settings Scene - Quality/Performance Selection

import { QUALITY_PRESETS } from '../core/settings.js';

class SettingsScene {
  constructor(game) {
    this.game = game;
    this.selection = 0;
    this.qualityNames = Object.keys(QUALITY_PRESETS);
    this.showConfirm = false;
  }

  update(input) {
    if (this.showConfirm) {
      if (input.isKeyPressed(' ')) {
        return { action: 'apply_quality', quality: this.qualityNames[this.selection] };
      }
      if (input.isKeyPressed('escape')) {
        this.showConfirm = false;
      }
      return null;
    }

    // Navigation
    if (input.isKeyPressed('ArrowUp')) {
      this.selection = (this.selection - 1 + this.qualityNames.length) % this.qualityNames.length;
    }
    if (input.isKeyPressed('ArrowDown')) {
      this.selection = (this.selection + 1) % this.qualityNames.length;
    }

    // Select
    if (input.isKeyPressed(' ')) {
      this.showConfirm = true;
    }

    // Back to menu
    if (input.isKeyPressed('escape')) {
      return { action: 'back_to_menu' };
    }

    return null;
  }

  render(ctx, width, height) {
    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME SETTINGS', width / 2, 80);

    ctx.fillStyle = '#888';
    ctx.font = '18px monospace';
    ctx.fillText('Select Performance Profile', width / 2, 120);

    // Quality options
    const startY = 200;
    const optionHeight = 100;

    this.qualityNames.forEach((name, i) => {
      const preset = QUALITY_PRESETS[name];
      const y = startY + i * optionHeight;
      const isSelected = i === this.selection;

      // Box
      if (isSelected) {
        ctx.fillStyle = '#0f0';
        ctx.fillRect(width / 2 - 300, y - 40, 600, 80);
        ctx.fillStyle = '#000';
      } else {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(width / 2 - 300, y - 40, 600, 80);
        ctx.fillStyle = '#444';
      }

      ctx.strokeStyle = isSelected ? '#0f0' : '#666';
      ctx.lineWidth = 2;
      ctx.strokeRect(width / 2 - 300, y - 40, 600, 80);

      // Text
      ctx.fillStyle = isSelected ? '#000' : '#0f0';
      ctx.font = isSelected ? 'bold 20px monospace' : '18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(preset.name, width / 2, y - 10);

      ctx.fillStyle = isSelected ? '#333' : '#888';
      ctx.font = '14px monospace';
      ctx.fillText(preset.description, width / 2, y + 20);
    });

    // Confirmation prompt
    if (this.showConfirm) {
      const preset = QUALITY_PRESETS[this.qualityNames[this.selection]];
      const confirmY = height / 2 + 150;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(width / 2 - 300, confirmY - 60, 600, 120);
      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 3;
      ctx.strokeRect(width / 2 - 300, confirmY - 60, 600, 120);

      ctx.fillStyle = '#0f0';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Confirm ' + preset.name + '?', width / 2, confirmY - 20);

      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.fillText('[SPACE] Apply  [ESC] Cancel', width / 2, confirmY + 20);
    }

    // Instructions
    const instructY = height - 80;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width / 2 - 300, instructY - 30, 600, 60);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 300, instructY - 30, 600, 60);

    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▲ UP/DOWN ▼  Select | [SPACE] Confirm | [ESC] Back', width / 2, instructY + 10);
  }
}

export { SettingsScene };
