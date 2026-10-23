// Settings Scene - Performance profile and input scheme

import { QUALITY_PRESETS, INPUT_SCHEMES } from '../core/settings.js';
import { ScreenItems, readMouse, drawButton, pulse, drawGlowText } from './ui.js';
import { drawProfileOption, drawSchemeCard } from './settings-options.js';

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

  // The clock the screen animates against. It runs whatever the game is
  // doing, so the screen keeps moving when nothing is being pressed.
  get time() {
    return this.game.clock;
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

  // Is this the option that is in force right now?
  //
  // The cursor and the setting in force are two different things - the
  // cursor can be on any of them - and the screen shows both.
  isActive(kind, name) {
    if (kind === 'quality') return this.game.settings.getQuality() === name;
    return this.game.settings.getInputScheme() === name;
  }

  // The two settings that are in force, written out.
  inUse() {
    const quality = QUALITY_PRESETS[this.game.settings.getQuality()];
    const scheme = INPUT_SCHEMES[this.game.settings.getInputScheme()];
    if (!quality || !scheme) return '';
    return `${quality.name}  |  ${scheme.name}`;
  }

  // Where everything on the screen is. The drawing and the mouse both work
  // from this, so a click always lands on what is on the screen.
  layout(width, height) {
    this.items.reset();

    const boxWidth = 520;
    const gap = 8;
    const headerHeight = 26;
    const x = width / 2 - boxWidth / 2;

    // The panel at the bottom, and the room the list has above it.
    const panelTop = height - 110;
    const panelHeight = 64;

    // The three input schemes are a row of cards, each one with the
    // picture of the scheme in it.
    const cardGap = 20;
    const cardWidth = Math.max(150, Math.min(280, (width - 280 - 2 * cardGap) / 3));
    const pictureWidth = cardWidth - 32;
    const pictureHeight = pictureWidth * 150 / 320;
    const cardHeight = pictureHeight + 100;

    // The profile boxes take what is left above the cards.
    const space = panelTop - 20 - 112;
    const cardsHeight = headerHeight + cardHeight;
    const boxesHeight = space - cardsHeight - 20 - headerHeight - 2 * gap;
    const boxHeight = Math.max(30, Math.min(76, Math.floor((boxesHeight - 2 * gap) / 3)));

    const contentHeight = headerHeight + 3 * boxHeight + 2 * gap + 20 + cardsHeight;
    const top = Math.max(112, (panelTop - 20 - contentHeight) / 2);

    const qualityTop = top + headerHeight;
    const qualities = this.qualityNames.map((name, i) => {
      const y = qualityTop + i * (boxHeight + gap);
      this.items.add('quality', x, y, boxWidth, boxHeight, { index: i, kind: 'quality' });
      return { name, y };
    });

    const schemeHeader = qualityTop + this.qualityNames.length * (boxHeight + gap) + 20;
    const schemeTop = schemeHeader + headerHeight;
    const cardLeft = width / 2 - (3 * cardWidth + 2 * cardGap) / 2;
    const schemes = this.schemeNames.map((name, i) => {
      const cardX = cardLeft + i * (cardWidth + cardGap);
      this.items.add('scheme', cardX, schemeTop, cardWidth, cardHeight, {
        index: this.qualityNames.length + i, kind: 'scheme'
      });
      return { name, x: cardX, y: schemeTop };
    });

    // The way back. It is on the right of the panel, and the keys are on
    // the left, so the two cannot run into each other.
    const back = { x: width / 2 + 100, y: panelTop + 14, w: 180, h: 36 };
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

    return {
      qualities, schemes, x, boxWidth, boxHeight, gap, top, qualityTop,
      schemeHeader, schemeTop, panelTop, panelHeight, dialog, back, apply, cancel,
      cardWidth, cardHeight, cardGap, pictureWidth, pictureHeight,
      qualityCount: this.qualityNames.length
    };
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

    // The title breathes - the glow moves, the letters do not.
    drawGlowText(ctx, 'GAME SETTINGS', width / 2, 70, {
      blur: 6 + pulse(this.time, 1.1) * 22
    });

    const layout = this.layout(width, height);

    // The two groups
    ctx.fillStyle = '#888';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PERFORMANCE PROFILE', width / 2, layout.top + 18);
    ctx.fillText('INPUT SCHEME', width / 2, layout.schemeHeader + 18);

    // What is in force right now. The badge on the option says it too,
    // but this is the one line that answers it without hunting.
    ctx.fillStyle = '#0ff';
    ctx.font = '13px monospace';
    ctx.fillText('IN USE:  ' + this.inUse(), width / 2, 95);

    layout.qualities.forEach(({ name }, i) => {
      const preset = QUALITY_PRESETS[name];
      drawProfileOption(ctx, layout, {
        width,
        index: i,
        title: preset.name,
        description: preset.description,
        selected: i === this.selection,
        active: this.isActive('quality', name),
        time: this.time
      });
    });

    layout.schemes.forEach(({ name, x, y }, i) => {
      const scheme = INPUT_SCHEMES[name];
      drawSchemeCard(ctx, layout, {
        x, y, id: name, scheme,
        selected: this.qualityNames.length + i === this.selection,
        active: this.isActive('scheme', name),
        time: this.time
      });
    });

    // The panel at the bottom
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width / 2 - 300, layout.panelTop, 600, layout.panelHeight);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 300, layout.panelTop, 600, layout.panelHeight);

    // The keys, on the left of the panel. The button is on the right, so
    // the text cannot end up underneath it.
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('▲ UP/DOWN ▼  Select', width / 2 - 280, layout.panelTop + 24);
    ctx.fillText('[SPACE] Confirm     [ESC] Back', width / 2 - 280, layout.panelTop + 46);

    drawButton(ctx, { ...layout.back, label: 'BACK (ESC)', hovered: this.hoveredId === 'back' });

    // The confirmation
    if (layout.dialog) {
      const d = layout.dialog;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(d.x, d.y, d.w, d.h);
      ctx.strokeStyle = `rgba(0, 255, 0, ${(0.5 + pulse(this.time, 2.4) * 0.5).toFixed(2)})`;
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
}

export { SettingsScene };
