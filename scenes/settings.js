// Settings Scene - Performance profile and input scheme

import { QUALITY_PRESETS, INPUT_SCHEMES } from '../core/settings.js';
import { ScreenItems, readMouse, drawButton } from './ui.js';

class SettingsScene {
  constructor(game) {
    this.game = game;
    // The list is flat: the performance profiles first, then the input
    // schemes. One list means one selection to move around.
    this.selection = 0;
    this.qualityNames = Object.keys(QUALITY_PRESETS);
    this.schemeNames = Object.keys(INPUT_SCHEMES);
    this.showConfirm = false;
    this.items = new ScreenItems();
    this.hoveredId = null;
  }

  // What the highlighted entry is.
  selected() {
    if (this.selection < this.qualityNames.length) {
      const name = this.qualityNames[this.selection];
      return { kind: 'quality', name, label: QUALITY_PRESETS[name].name };
    }
    const name = this.schemeNames[this.selection - this.qualityNames.length];
    return { kind: 'scheme', name, label: INPUT_SCHEMES[name].name };
  }

  // Where everything on the screen is. The drawing and the mouse both work
  // from this, so a click always lands on what is on the screen.
  layout(width, height) {
    this.items.reset();

    const boxWidth = 520;
    const boxHeight = Math.max(38, Math.min(76, (height - 230 - 52 - 40 - 20) / 6));
    const gap = 8;
    const headerHeight = 26;
    const x = width / 2 - boxWidth / 2;

    const contentHeight = 2 * headerHeight + 6 * boxHeight + 5 * gap + 20;
    const top = Math.max(100, (height - 110 - contentHeight) / 2);

    const qualityTop = top + headerHeight;
    const qualities = this.qualityNames.map((name, i) => {
      const y = qualityTop + i * (boxHeight + gap);
      this.items.add('quality', x, y, boxWidth, boxHeight, { index: i, kind: 'quality' });
      return { name, y };
    });

    const schemeHeader = qualityTop + this.qualityNames.length * (boxHeight + gap) + 20;
    const schemeTop = schemeHeader + headerHeight;
    const schemes = this.schemeNames.map((name, i) => {
      const y = schemeTop + i * (boxHeight + gap);
      this.items.add('scheme', x, y, boxWidth, boxHeight, {
        index: this.qualityNames.length + i, kind: 'scheme'
      });
      return { name, y };
    });

    // The panel at the bottom, with the keys and the way back
    const panelTop = height - 110;
    const back = { x: width / 2 + 120, y: panelTop + 12, w: 160, h: 36 };
    this.items.add('back', back.x, back.y, back.w, back.h, { kind: 'button' });

    // The confirmation, over everything
    let dialog = null;
    let apply = null;
    let cancel = null;
    if (this.showConfirm) {
      const dialogY = height / 2 - 70;
      apply = { x: width / 2 - 220, y: dialogY + 80, w: 200, h: 34 };
      cancel = { x: width / 2 + 20, y: dialogY + 80, w: 200, h: 34 };
      this.items.add('apply', apply.x, apply.y, apply.w, apply.h, { kind: 'button' });
      this.items.add('cancel', cancel.x, cancel.y, cancel.w, cancel.h, { kind: 'button' });
      dialog = { x: width / 2 - 300, y: dialogY, w: 600, h: 140 };
    }

    return { qualities, schemes, x, boxWidth, boxHeight, gap, top, qualityTop, schemeHeader, schemeTop, panelTop, dialog, back, apply, cancel };
  }

  update(input) {
    this.layout(this.game.width, this.game.height);
    const count = this.qualityNames.length + this.schemeNames.length;

    if (this.showConfirm) {
      const mouse = readMouse(this.items, input);
      this.hoveredId = mouse.hovered ? mouse.hovered.id : null;
      if (mouse.clicked) {
        if (mouse.clicked.id === 'apply') return this.apply();
        if (mouse.clicked.id === 'cancel') {
          this.showConfirm = false;
          return null;
        }
      }
      if (input.isKeyPressed(' ')) return this.apply();
      if (input.isKeyPressed('escape')) this.showConfirm = false;
      return null;
    }

    if (input.isKeyPressed('ArrowUp')) {
      this.selection = (this.selection - 1 + count) % count;
    }
    if (input.isKeyPressed('ArrowDown')) {
      this.selection = (this.selection + 1) % count;
    }

    const mouse = readMouse(this.items, input);
    this.hoveredId = mouse.hovered ? mouse.hovered.id : null;
    // The pointer moves the selection, and a click is on whatever was
    // under the pointer when the button went down - not on whatever it
    // is over now.
    if (mouse.hovered && mouse.moved && mouse.hovered.index !== undefined) {
      this.selection = mouse.hovered.index;
    }
    if (mouse.clicked) {
      if (mouse.clicked.index !== undefined) {
        this.selection = mouse.clicked.index;
        this.showConfirm = true;
      } else if (mouse.clicked.id === 'back') {
        return { action: 'back_to_menu' };
      }
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

  apply() {
    const selected = this.selected();
    this.showConfirm = false;
    if (selected.kind === 'quality') {
      return { action: 'apply_quality', quality: selected.name };
    }
    return { action: 'apply_input_scheme', scheme: selected.name };
  }

  render(ctx, width, height) {
    // NOTE: the background (starfield) and the ambient particles are drawn by
    // the game loop before the scene is rendered. Filling the canvas here
    // would paint over both of them.

    // Title
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME SETTINGS', width / 2, 70);

    const layout = this.layout(width, height);

    // The two groups
    ctx.fillStyle = '#888';
    ctx.font = '16px monospace';
    ctx.fillText('PERFORMANCE PROFILE', width / 2, layout.top + 18);
    ctx.fillText('INPUT SCHEME', width / 2, layout.schemeHeader + 18);

    layout.qualities.forEach(({ name }, i) => {
      const preset = QUALITY_PRESETS[name];
      this.drawOption(ctx, layout, width, i, preset.name, preset.description);
    });

    layout.schemes.forEach(({ name }, i) => {
      const scheme = INPUT_SCHEMES[name];
      this.drawOption(ctx, layout, width, this.qualityNames.length + i, scheme.name, scheme.description);
    });

    // The panel at the bottom
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width / 2 - 300, layout.panelTop, 600, 60);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 300, layout.panelTop, 600, 60);

    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▲ UP/DOWN ▼  Select | [SPACE] Confirm | [ESC] Back', width / 2 - 60, layout.panelTop + 36);
    drawButton(ctx, { ...layout.back, label: 'BACK (ESC)', hovered: this.hoveredId === 'back' });

    // The confirmation
    if (layout.dialog) {
      const d = layout.dialog;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(d.x, d.y, d.w, d.h);
      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 3;
      ctx.strokeRect(d.x, d.y, d.w, d.h);

      ctx.fillStyle = '#0f0';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Confirm ' + this.selected().label + '?', width / 2, d.y + 40);

      ctx.fillStyle = '#888';
      ctx.font = '14px monospace';
      ctx.fillText('[SPACE] Apply  [ESC] Cancel', width / 2, d.y + 66);

      drawButton(ctx, { ...layout.apply, label: 'APPLY', hovered: this.hoveredId === 'apply' });
      drawButton(ctx, { ...layout.cancel, label: 'CANCEL', hovered: this.hoveredId === 'cancel' });
    }
  }

  // One option box. The profile that is on and the scheme that is on are
  // marked, so the player can see what is in force.
  drawOption(ctx, layout, width, index, title, description) {
    const isSelected = index === this.selection;
    const x = layout.x;
    const step = layout.boxHeight + layout.gap;
    const y = index < this.qualityNames.length
      ? layout.qualityTop + index * step
      : layout.schemeTop + (index - this.qualityNames.length) * step;

    if (isSelected) {
      ctx.fillStyle = '#0f0';
      ctx.fillRect(x, y, layout.boxWidth, layout.boxHeight);
      ctx.fillStyle = '#000';
    } else {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(x, y, layout.boxWidth, layout.boxHeight);
      ctx.fillStyle = '#444';
    }

    ctx.strokeStyle = isSelected ? '#0f0' : '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, layout.boxWidth, layout.boxHeight);

    ctx.fillStyle = isSelected ? '#000' : '#0f0';
    ctx.font = isSelected ? 'bold 20px monospace' : '18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, y + layout.boxHeight / 2 - 4);

    ctx.fillStyle = isSelected ? '#333' : '#888';
    ctx.font = '13px monospace';
    ctx.fillText(description, width / 2, y + layout.boxHeight / 2 + 18);
  }
}

export { SettingsScene };
