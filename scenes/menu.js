// Menu Scene - Main menu, mode select, build select and wingman select

import { BUILDS } from '../entities/player.js';
import { DIFFICULTIES, GAME_MODES, DEFAULT_MODE } from '../config/index.js';

class MenuScene {
  constructor(game) {
    this.game = game;
    this.buildSelection = 0;
    this.difficultySelection = 1;
    this.buildNames = Object.keys(BUILDS);
    this.difficulties = Object.keys(DIFFICULTIES);

    // 'main' | 'build_select' | 'wingman_select'
    this.menuState = 'main';

    // The mode the main menu is pointing at, and the mode the run being
    // set up is in
    this.modeSelection = 0;
    this.mode = DEFAULT_MODE;

    // The wingman's build, chosen on its own screen
    this.allySelection = 0;

    // What the wingman screen has to remember about the run being set up
    this.pendingBuild = null;
    this.pendingDifficulty = null;
  }

  // The main menu is a list: every mode, then the settings.
  menuEntries() {
    const modes = Object.keys(GAME_MODES).map(id => ({ kind: 'mode', id }));
    return [...modes, { kind: 'settings', id: 'settings' }];
  }

  update(input) {
    if (this.menuState === 'main') {
      return this.updateMain(input);
    }
    if (this.menuState === 'build_select') {
      return this.updateBuildSelect(input);
    }
    return this.updateWingmanSelect(input);
  }

  updateMain(input) {
    const entries = this.menuEntries();

    if (input.isKeyPressed('ArrowUp')) {
      this.modeSelection = (this.modeSelection - 1 + entries.length) % entries.length;
    }
    if (input.isKeyPressed('ArrowDown')) {
      this.modeSelection = (this.modeSelection + 1) % entries.length;
    }
    if (input.isKeyPressed(' ')) {
      const entry = entries[this.modeSelection];
      if (entry.kind === 'settings') return { action: 'show_settings' };
      // An online mode has no build select - it has a lobby, and the
      // build is picked there, in the room.
      if (GAME_MODES[entry.id].online) return { action: 'show_lobby', mode: entry.id };
      return { action: 'show_builds', mode: entry.id };
    }
    if (input.isKeyPressed('s')) {
      return { action: 'show_settings' };
    }
    return null;
  }

  updateBuildSelect(input) {
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
      const build = this.buildNames[this.buildSelection];
      const difficulty = this.difficulties[this.difficultySelection];
      // In dualist the wingman has a build of its own, and it is chosen on
      // the next screen.
      if (this.mode === 'dualist') {
        this.pendingBuild = build;
        this.pendingDifficulty = difficulty;
        return { action: 'show_wingman' };
      }
      return { action: 'start', build, difficulty, options: { mode: this.mode } };
    }
    if (input.isKeyPressed('escape')) {
      this.menuState = 'main';
    }
    return null;
  }

  updateWingmanSelect(input) {
    if (input.isKeyPressed('ArrowUp')) {
      this.allySelection = (this.allySelection - 1 + this.buildNames.length) % this.buildNames.length;
    }
    if (input.isKeyPressed('ArrowDown')) {
      this.allySelection = (this.allySelection + 1) % this.buildNames.length;
    }
    if (input.isKeyPressed(' ')) {
      return {
        action: 'start',
        build: this.pendingBuild,
        difficulty: this.pendingDifficulty,
        options: { mode: 'dualist', allyBuild: this.buildNames[this.allySelection] }
      };
    }
    if (input.isKeyPressed('escape')) {
      this.menuState = 'build_select';
    }
    return null;
  }

  render(ctx, width, height) {
    // NOTE: the background (starfield) and the ambient particles are drawn by
    // the game loop before the scene is rendered. Filling the canvas here
    // would paint over both of them.

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
    } else if (this.menuState === 'build_select') {
      this.renderBuildSelect(ctx, width, height);
    } else {
      this.renderWingmanSelect(ctx, width, height);
    }
  }

  renderMainMenu(ctx, width, height) {
    const entries = this.menuEntries();
    const startY = height / 2 - 100;

    entries.forEach((entry, i) => {
      const y = startY + i * 55;
      const selected = i === this.modeSelection;
      const mode = entry.kind === 'mode' ? GAME_MODES[entry.id] : null;
      const label = mode ? mode.name.toUpperCase() : 'SETTINGS';

      if (selected) {
        ctx.fillStyle = '#0f0';
        ctx.fillRect(width / 2 - 160, y - 26, 320, 46);
        ctx.fillStyle = '#000';
      } else {
        ctx.fillStyle = '#0f0';
      }
      ctx.font = selected ? 'bold 22px monospace' : '22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, width / 2, y + 2);
    });

    // What the highlighted entry does
    const highlighted = entries[this.modeSelection];
    const mode = highlighted.kind === 'mode' ? GAME_MODES[highlighted.id] : null;
    ctx.fillStyle = '#888';
    ctx.font = '15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      mode ? mode.description : 'Performance profile, particles and UI density.',
      width / 2, startY + entries.length * 55 + 10
    );

    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText('[UP/DOWN] Choose  [SPACE] Select  [S] Settings', width / 2, height - 40);
  }

  renderBuildSelect(ctx, width, height) {
    // Which mode this screen is setting up
    const mode = GAME_MODES[this.mode];
    ctx.fillStyle = mode ? '#0f0' : '#888';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(mode ? mode.name.toUpperCase() : this.mode.toUpperCase(), width / 2, 160);

    // Difficulty selection
    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.fillText('Select Difficulty:', width / 2, 200);

    const difficultyColors = {
      'easy': '#4f4',
      'normal': '#ff0',
      'hard': '#f80',
      'nightmare': '#f00'
    };

    this.difficulties.forEach((diff, i) => {
      const y = 230 + i * 35;
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
    ctx.fillText('Select Build:', width / 2, 400);

    this.buildNames.forEach((build, i) => {
      const buildData = BUILDS[build];
      const y = 430 + i * 45;
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

  renderWingmanSelect(ctx, width, height) {
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT WINGMAN BUILD', width / 2, 180);

    ctx.fillStyle = '#888';
    ctx.font = '15px monospace';
    ctx.fillText('Your build: ' + (BUILDS[this.pendingBuild]?.name || '-'), width / 2, 210);

    this.buildNames.forEach((build, i) => {
      const buildData = BUILDS[build];
      const y = 260 + i * 45;
      const selected = i === this.allySelection;

      ctx.fillStyle = selected ? '#0f0' : '#222';
      ctx.fillRect(width / 2 - 150, y - 25, 300, 38);

      ctx.strokeStyle = selected ? '#fff' : '#444';
      ctx.lineWidth = 2;
      ctx.strokeRect(width / 2 - 150, y - 25, 300, 38);

      ctx.fillStyle = selected ? '#000' : buildData.color;
      ctx.font = selected ? 'bold 16px monospace' : '16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(buildData.name, width / 2 - 140, y - 5);

      ctx.fillStyle = selected ? '#333' : '#888';
      ctx.font = '12px monospace';
      ctx.fillText(buildData.description.substring(0, 35), width / 2 - 140, y + 10);
    });

    const instructionY = height - 60;
    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▲ UP/DOWN ▼  Select the wingman\'s build', width / 2, instructionY);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('Press [SPACE] to Start! [ESC] Back', width / 2, instructionY + 30);
  }
}

export { MenuScene };
