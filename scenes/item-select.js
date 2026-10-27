// Item Selection Scene - Overlay for choosing items on level-up/boss kill

import { ITEMS, RARITY_COLORS, RARITY_STARS } from '../config/items.js';
import { ScreenItems, readMouse, drawButton, pulse, drawGlowText, wrapText } from './ui.js';

class ItemSelectScene {
  constructor(game) {
    this.game = game;
    this.items = new ScreenItems();
    this.choices = [];
    this.hoveredId = null;
    this.selectedCallback = null;
    this.trigger = null; // 'levelup' or 'bosskill'
  }

  // Show the item selection overlay
  show(choices, trigger, callback) {
    this.choices = choices;
    this.trigger = trigger;
    this.selectedCallback = callback;
    this.hoveredId = null;
  }

  // Hide the overlay
  hide() {
    this.choices = [];
    this.trigger = null;
    this.selectedCallback = null;
    this.hoveredId = null;
  }

  get time() {
    return this.game.clock;
  }

  layout(width, height) {
    this.items.reset();

    const itemCount = this.choices.length;
    if (itemCount === 0) return null;

    const cardWidth = 200;
    const cardHeight = 300;
    const gap = 20;
    const totalWidth = itemCount * cardWidth + (itemCount - 1) * gap;
    const startX = (width - totalWidth) / 2;
    const startY = (height - cardHeight) / 2 - 40;

    const cards = this.choices.map((item, i) => {
      const x = startX + i * (cardWidth + gap);
      const rect = { x, y: startY, w: cardWidth, h: cardHeight };
      this.items.add(item.id, x, startY, cardWidth, cardHeight, { kind: 'item', index: i });
      return { item, rect };
    });

    return { cards, cardWidth, cardHeight, startY };
  }

  update(input) {
    if (this.choices.length === 0) return null;

    this.layout(this.game.width, this.game.height);

    const mouse = readMouse(this.items, input);
    this.hoveredId = mouse.hovered ? mouse.hovered.id : null;

    // Keyboard navigation
    const hoveredIndex = mouse.hovered?.index ?? -1;
    const itemCount = this.choices.length;
    if (input.isKeyPressed('ArrowLeft') || input.isKeyPressed('a')) {
      this.hoveredId = this.choices[Math.max(0, hoveredIndex - 1)]?.id || this.choices[0]?.id;
    }
    if (input.isKeyPressed('ArrowRight') || input.isKeyPressed('d')) {
      this.hoveredId = this.choices[Math.min(itemCount - 1, hoveredIndex + 1)]?.id || this.choices[itemCount - 1]?.id;
    }

    // Selection
    if (mouse.clicked && mouse.clicked.kind === 'item') {
      return this.selectItem(mouse.clicked.id);
    }
    if (input.isKeyPressed(' ') || input.isKeyPressed('Enter')) {
      const selectedId = this.hoveredId || this.choices[0]?.id;
      if (selectedId) return this.selectItem(selectedId);
    }

    return null;
  }

  selectItem(itemId) {
    const callback = this.selectedCallback;
    this.hide();
    if (callback) callback(itemId);
    return { action: 'item_selected', itemId };
  }

  render(ctx, width, height) {
    const layout = this.layout(width, height);
    if (!layout) return;

    const { cards, cardWidth, cardHeight, startY } = layout;

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, width, height);

    // Title
    const title = this.trigger === 'levelup' ? '⚡ LEVEL UP! Choose Your Item ⚡' : '💀 BOSS DEFEATED! Choose Your Reward 💀';
    drawGlowText(ctx, title, width / 2, startY - 60, {
      font: 'bold 28px monospace',
      color: '#0f0',
      blur: 10 + pulse(this.time, 1.5) * 8
    });

    // Draw each item card
    for (const { item, rect } of cards) {
      this.drawItemCard(ctx, item, rect, this.hoveredId === item.id);
    }

    // Hint
    ctx.globalAlpha = 0.35 + pulse(this.time, 0.9) * 0.5;
    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[←/→] Navigate  [SPACE/ENTER] Select  or click', width / 2, startY + cardHeight + 60);
    ctx.globalAlpha = 1;
  }

  drawItemCard(ctx, item, rect, hovered) {
    const { x, y, w, h } = rect;
    const rarityColor = RARITY_COLORS[item.rarity];
    const starCount = RARITY_STARS[item.rarity];

    // Card background
    ctx.fillStyle = hovered ? '#1a1a2e' : '#0d0d1a';
    ctx.fillRect(x, y, w, h);

    // Glowing border on hover
    ctx.strokeStyle = hovered ? rarityColor : '#333';
    ctx.lineWidth = hovered ? 3 : 2;
    if (hovered) {
      ctx.shadowColor = rarityColor;
      ctx.shadowBlur = 15;
    }
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;

    // SVG Icon placeholder (draw colored rectangle for now)
    const iconSize = 60;
    const iconX = x + (w - iconSize) / 2;
    const iconY = y + 20;
    ctx.fillStyle = rarityColor;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(iconX, iconY, iconSize, iconSize);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = rarityColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(iconX, iconY, iconSize, iconSize);

    // Name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(item.name, x + w / 2, iconY + iconSize + 20);

    // Rarity stars
    const stars = '★'.repeat(starCount);
    ctx.fillStyle = rarityColor;
    ctx.font = '12px monospace';
    ctx.fillText(stars, x + w / 2, iconY + iconSize + 38);

    // Rarity label
    ctx.fillStyle = rarityColor;
    ctx.font = 'bold 11px monospace';
    ctx.fillText(item.rarity.toUpperCase(), x + w / 2, iconY + iconSize + 54);

    // Stats
    let statY = iconY + iconSize + 75;
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';

    const stats = [];
    if (item.stats.atkDmg) stats.push(`+${item.stats.atkDmg} ATK`);
    if (item.stats.ap) stats.push(`+${item.stats.ap} AP`);
    if (item.stats.hpPercent) stats.push(`+${Math.round(item.stats.hpPercent * 100)}% HP`);
    if (item.stats.armor) stats.push(`+${item.stats.armor} Armor`);
    if (item.stats.magicResist) stats.push(`+${item.stats.magicResist} MR`);
    if (item.stats.speed) stats.push(`+${Math.round(item.stats.speed * 100)}% Speed`);
    if (item.stats.critChance) stats.push(`+${Math.round(item.stats.critChance * 100)}% Crit`);
    if (item.stats.cdReduction) stats.push(`+${Math.round(item.stats.cdReduction * 100)}% CDR`);

    ctx.fillStyle = '#4f4';
    stats.slice(0, 4).forEach((stat, i) => {
      ctx.fillText(stat, x + 15, statY + i * 16);
    });

    // Passive description
    if (item.passives && item.passives.length > 0) {
      const passive = item.passives[0];
      statY += stats.length > 0 ? stats.slice(0, 4).length * 16 + 10 : 0;

      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(passive.name + ':', x + 15, statY);

      ctx.fillStyle = '#aaa';
      ctx.font = '9px monospace';
      const lines = wrapText(passive.description, 25);
      lines.forEach((line, i) => {
        ctx.fillText(line, x + 15, statY + 14 + i * 12);
      });
    }

    // Equip button
    if (hovered) {
      const btnY = y + h - 40;
      drawButton(ctx, {
        x: x + 20,
        y: btnY,
        w: w - 40,
        h: 30,
        label: 'EQUIP',
        hovered: true,
        color: rarityColor
      });
    }
  }
}

export { ItemSelectScene };
