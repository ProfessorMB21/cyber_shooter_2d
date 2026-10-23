// Menu Scene - Main menu, mode select, build select and wingman select

import { BUILDS } from '../entities/player.js';
import { DIFFICULTIES, GAME_MODES, DEFAULT_MODE } from '../config/index.js';
import { ScreenItems, readMouse, drawButton, pulse, drawGlowText } from './ui.js';

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

    // The clickable parts of the screen, and the one the pointer is on
    this.items = new ScreenItems();
    this.hoveredId = null;
  }

  // The clock the screen animates against. It runs whatever the game is
  // doing, so the menu keeps moving when nothing is being pressed.
  get time() {
    return this.game.clock;
  }

  // The main menu is a list: every mode, then the settings.
  menuEntries() {
    const modes = Object.keys(GAME_MODES).map(id => ({ kind: 'mode', id }));
    return [...modes, { kind: 'settings', id: 'settings' }];
  }

  // Where everything on the current screen is. The drawing and the mouse
  // both work from this, so a click always lands on what is on the screen.
  layout(width, height) {
    this.items.reset();
    if (this.menuState === 'main') return this.layoutMain(width, height);
    if (this.menuState === 'build_select') return this.layoutBuildSelect(width, height);
    return this.layoutWingman(width, height);
  }

  layoutMain(width, height) {
    const entries = this.menuEntries();
    const startY = height / 2 - 100;

    const rows = entries.map((entry, i) => {
      const y = startY + i * 55;
      this.items.add('entry', width / 2 - 160, y - 26, 320, 46, { index: i, kind: 'entry' });
      return { entry, y };
    });

    return { entries, startY, rows };
  }

  layoutBuildSelect(width, height) {
    const panelTop = height - 150;

    const difficulties = this.difficulties.map((diff, i) => {
      const y = 215 + i * 35;
      this.items.add('difficulty', width / 2 - 100, y - 20, 200, 28, { index: i, kind: 'difficulty' });
      return { diff, y };
    });

    // The build list takes whatever room is left between the difficulty
    // list and the panel at the bottom.
    const buildTop = 380;
    const spacing = Math.max(26, Math.min(45, (panelTop - buildTop - 20) / this.buildNames.length));
    const rowHeight = Math.max(20, spacing - 7);

    const builds = this.buildNames.map((build, i) => {
      const y = buildTop + i * spacing;
      this.items.add('build', width / 2 - 150, y - rowHeight / 2, 300, rowHeight, { index: i, kind: 'build' });
      return { build, y };
    });

    const buttonY = height - 70;
    const buttons = this.items.buttonRow(['start', 'back'], buttonY, width);

    return {
      difficulties, builds, panelTop, buttons,
      buildRowHeight: rowHeight,
      showDescription: rowHeight >= 32
    };
  }

  layoutWingman(width, height) {
    const panelTop = height - 120;
    const buildTop = 250;
    const spacing = Math.max(26, Math.min(45, (panelTop - buildTop - 20) / this.buildNames.length));
    const rowHeight = Math.max(20, spacing - 7);

    const builds = this.buildNames.map((build, i) => {
      const y = buildTop + i * spacing;
      this.items.add('build', width / 2 - 150, y - rowHeight / 2, 300, rowHeight, { index: i, kind: 'build' });
      return { build, y };
    });

    const buttonY = height - 60;
    const buttons = this.items.buttonRow(['start', 'back'], buttonY, width);

    return { builds, panelTop, buttons, buildRowHeight: rowHeight, showDescription: rowHeight >= 32 };
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
    this.layout(this.game.width, this.game.height);

    if (input.isKeyPressed('ArrowUp')) {
      this.modeSelection = (this.modeSelection - 1 + entries.length) % entries.length;
    }
    if (input.isKeyPressed('ArrowDown')) {
      this.modeSelection = (this.modeSelection + 1) % entries.length;
    }

    // The mouse points at an entry and confirms it in one click.
    const mouse = readMouse(this.items, input);
    this.hoveredId = mouse.hovered ? mouse.hovered.id : null;
    if (mouse.hovered && mouse.moved && mouse.hovered.index !== undefined) {
      this.modeSelection = mouse.hovered.index;
    }
    if (mouse.clicked) {
      const index = mouse.clicked.index !== undefined ? mouse.clicked.index : this.modeSelection;
      this.modeSelection = index;
      return this.activateEntry(entries[index]);
    }

    if (input.isKeyPressed(' ')) {
      return this.activateEntry(entries[this.modeSelection]);
    }
    if (input.isKeyPressed('s')) {
      return { action: 'show_settings' };
    }
    return null;
  }

  // What the chosen entry does.
  activateEntry(entry) {
    if (entry.kind === 'settings') return { action: 'show_settings' };
    // An online mode has no build select - it has a lobby, and the
    // build is picked there, in the room.
    if (GAME_MODES[entry.id].online) return { action: 'show_lobby', mode: entry.id };
    return { action: 'show_builds', mode: entry.id };
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

    const mouse = readMouse(this.items, input);
    this.hoveredId = mouse.hovered ? mouse.hovered.id : null;
    if (mouse.hovered && mouse.moved) {
      const hovered = mouse.hovered;
      if (hovered.kind === 'difficulty') this.difficultySelection = hovered.index;
      else if (hovered.kind === 'build') this.buildSelection = hovered.index;
    }
    if (mouse.clicked) {
      const clicked = mouse.clicked;
      if (clicked.kind === 'difficulty') this.difficultySelection = clicked.index;
      else if (clicked.kind === 'build') this.buildSelection = clicked.index;
      else if (clicked.id === 'start') return this.startRun();
      else if (clicked.id === 'back') {
        this.menuState = 'main';
        return null;
      }
    }

    if (input.isKeyPressed(' ')) {
      return this.startRun();
    }
    if (input.isKeyPressed('escape')) {
      this.menuState = 'main';
    }
    return null;
  }

  // Start the run with what is chosen. In dualist the wingman has a build
  // of its own, and it is chosen on the next screen.
  startRun() {
    const build = this.buildNames[this.buildSelection];
    const difficulty = this.difficulties[this.difficultySelection];
    if (this.mode === 'dualist') {
      this.pendingBuild = build;
      this.pendingDifficulty = difficulty;
      return { action: 'show_wingman' };
    }
    return { action: 'start', build, difficulty, options: { mode: this.mode } };
  }

  updateWingmanSelect(input) {
    if (input.isKeyPressed('ArrowUp')) {
      this.allySelection = (this.allySelection - 1 + this.buildNames.length) % this.buildNames.length;
    }
    if (input.isKeyPressed('ArrowDown')) {
      this.allySelection = (this.allySelection + 1) % this.buildNames.length;
    }

    const mouse = readMouse(this.items, input);
    this.hoveredId = mouse.hovered ? mouse.hovered.id : null;
    if (mouse.hovered && mouse.moved && mouse.hovered.kind === 'build') {
      this.allySelection = mouse.hovered.index;
    }
    if (mouse.clicked) {
      const clicked = mouse.clicked;
      if (clicked.kind === 'build') this.allySelection = clicked.index;
      else if (clicked.id === 'start') return this.startWingmanRun();
      else if (clicked.id === 'back') {
        this.menuState = 'build_select';
        return null;
      }
    }

    if (input.isKeyPressed(' ')) {
      return this.startWingmanRun();
    }
    if (input.isKeyPressed('escape')) {
      this.menuState = 'build_select';
    }
    return null;
  }

  startWingmanRun() {
    return {
      action: 'start',
      build: this.pendingBuild,
      difficulty: this.pendingDifficulty,
      options: { mode: 'dualist', allyBuild: this.buildNames[this.allySelection] }
    };
  }

  render(ctx, width, height) {
    // NOTE: the background (starfield) and the ambient particles are drawn by
    // the game loop before the scene is rendered. Filling the canvas here
    // would paint over both of them.

    // The title breathes - the glow moves, the letters do not.
    drawGlowText(ctx, 'CYBER SHOOTER', width / 2, 100, {
      blur: 6 + pulse(this.time, 1.1) * 22
    });

    ctx.fillStyle = '#888';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.6 + pulse(this.time, 0.8) * 0.4;
    ctx.fillText('A Retro Space Shooter', width / 2, 130);
    ctx.globalAlpha = 1;

    if (this.menuState === 'main') {
      this.renderMainMenu(ctx, width, height);
    } else if (this.menuState === 'build_select') {
      this.renderBuildSelect(ctx, width, height);
    } else {
      this.renderWingmanSelect(ctx, width, height);
    }
  }

  renderMainMenu(ctx, width, height) {
    const layout = this.layout(width, height);
    const { entries, startY, rows } = layout;

    rows.forEach(({ entry, y }, i) => {
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

    // A marker that blinks on the entry the player is on, so the
    // selection can be found without reading the list.
    const selectedY = rows[this.modeSelection].y;
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = `rgba(0, 255, 0, ${pulse(this.time, 3) > 0.5 ? 1 : 0.2})`;
    ctx.fillText('▸', width / 2 - 180, selectedY + 2);

    // What the highlighted entry does
    const highlighted = entries[this.modeSelection];
    const mode = highlighted.kind === 'mode' ? GAME_MODES[highlighted.id] : null;
    ctx.fillStyle = '#888';
    ctx.font = '15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      mode ? mode.description : 'Performance profile, input scheme and particles.',
      width / 2, startY + entries.length * 55 + 10
    );

    // The hint breathes, so the screen is never quite still.
    ctx.globalAlpha = 0.35 + pulse(this.time, 0.9) * 0.5;
    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[UP/DOWN] Choose  [SPACE] Select  [S] Settings  or click', width / 2, height - 40);
    ctx.globalAlpha = 1;
  }

  renderBuildSelect(ctx, width, height) {
    const layout = this.layout(width, height);
    const { difficulties, builds, panelTop, buttons, buildRowHeight, showDescription } = layout;

    // Which mode this screen is setting up
    const mode = GAME_MODES[this.mode];
    ctx.fillStyle = mode ? '#0f0' : '#888';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(mode ? mode.name.toUpperCase() : this.mode.toUpperCase(), width / 2, 150);

    // Difficulty selection
    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.fillText('Select Difficulty:', width / 2, 185);

    const difficultyColors = {
      'easy': '#4f4',
      'normal': '#ff0',
      'hard': '#f80',
      'nightmare': '#f00'
    };

    difficulties.forEach(({ diff, y }, i) => {
      const selected = i === this.difficultySelection;
      const color = difficultyColors[diff] || '#888';

      if (selected) {
        ctx.fillStyle = color;
        ctx.fillRect(width / 2 - 100, y - 20, 200, 28);
        // The outline pulses on the row the player is on.
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.3 + pulse(this.time, 2.4) * 0.7).toFixed(2)})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(width / 2 - 100, y - 20, 200, 28);
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
    ctx.fillText('Select Build:', width / 2, 350);

    builds.forEach(({ build, y }, i) => {
      const buildData = BUILDS[build];
      const selected = i === this.buildSelection;
      const top = y - buildRowHeight / 2;

      // Box
      ctx.fillStyle = selected ? '#0f0' : '#222';
      ctx.fillRect(width / 2 - 150, top, 300, buildRowHeight);

      // Border. On the row the player is on it pulses.
      ctx.strokeStyle = selected
        ? `rgba(255, 255, 255, ${(0.4 + pulse(this.time, 2.4) * 0.6).toFixed(2)})`
        : '#444';
      ctx.lineWidth = 2;
      ctx.strokeRect(width / 2 - 150, top, 300, buildRowHeight);

      // Name
      ctx.fillStyle = selected ? '#000' : buildData.color;
      ctx.font = selected ? 'bold 16px monospace' : '16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(buildData.name, width / 2 - 140, showDescription ? y - 5 : y + 5);

      // Description
      if (showDescription) {
        ctx.fillStyle = selected ? '#333' : '#888';
        ctx.font = '12px monospace';
        ctx.fillText(buildData.description.substring(0, 35), width / 2 - 140, y + 10);
      }
    });

    // The panel at the bottom, with the keys and the buttons
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width / 2 - 250, panelTop, 500, height - 40 - panelTop);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 250, panelTop, 500, height - 40 - panelTop);

    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('◀ LEFT/RIGHT ▸  Change Difficulty', width / 2, panelTop + 25);
    ctx.fillText('▲ UP/DOWN ▼    Select Build', width / 2, panelTop + 50);

    drawButton(ctx, { ...buttons.start, label: 'START (SPACE)', hovered: this.hoveredId === 'start' });
    drawButton(ctx, { ...buttons.back, label: 'BACK (ESC)', hovered: this.hoveredId === 'back' });
  }

  renderWingmanSelect(ctx, width, height) {
    const layout = this.layout(width, height);
    const { builds, panelTop, buttons, buildRowHeight, showDescription } = layout;

    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT WINGMAN BUILD', width / 2, 170);

    ctx.fillStyle = '#888';
    ctx.font = '15px monospace';
    ctx.fillText('Your build: ' + (BUILDS[this.pendingBuild]?.name || '-'), width / 2, 200);

    builds.forEach(({ build, y }, i) => {
      const buildData = BUILDS[build];
      const selected = i === this.allySelection;
      const top = y - buildRowHeight / 2;

      ctx.fillStyle = selected ? '#0f0' : '#222';
      ctx.fillRect(width / 2 - 150, top, 300, buildRowHeight);

      // Border. On the row the player is on it pulses.
      ctx.strokeStyle = selected
        ? `rgba(255, 255, 255, ${(0.4 + pulse(this.time, 2.4) * 0.6).toFixed(2)})`
        : '#444';
      ctx.lineWidth = 2;
      ctx.strokeRect(width / 2 - 150, top, 300, buildRowHeight);

      ctx.fillStyle = selected ? '#000' : buildData.color;
      ctx.font = selected ? 'bold 16px monospace' : '16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(buildData.name, width / 2 - 140, y - 5);

      if (showDescription) {
        ctx.fillStyle = selected ? '#333' : '#888';
        ctx.font = '12px monospace';
        ctx.fillText(buildData.description.substring(0, 35), width / 2 - 140, y + 10);
      }
    });

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width / 2 - 250, panelTop, 500, height - 30 - panelTop);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 250, panelTop, 500, height - 30 - panelTop);

    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▲ UP/DOWN ▼  Select the wingman\'s build', width / 2, panelTop + 25);

    drawButton(ctx, { ...buttons.start, label: 'START (SPACE)', hovered: this.hoveredId === 'start' });
    drawButton(ctx, { ...buttons.back, label: 'BACK (ESC)', hovered: this.hoveredId === 'back' });
  }
}

export { MenuScene };
