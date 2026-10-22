// How the settings screen draws its options.
//
// The scene keeps the state and the layout; this file draws the two
// kinds of option - a performance profile and an input scheme - and the
// badge that says which one of them is in force.

import { pulse, fitText, wrapText } from './ui.js';
import { schemePicture } from './scheme-images.js';

// One profile box.
//
// Three things are on it: the option itself, the marker that says the
// cursor is on it, and the badge that says it is the one in force. The
// cursor can be on any of them, so the two are drawn differently.
function drawProfileOption(ctx, layout, options) {
  const { width, index, title, description, selected, active, time } = options;
  const x = layout.x;
  const step = layout.boxHeight + layout.gap;
  const y = index < layout.qualityCount
    ? layout.qualityTop + index * step
    : layout.schemeTop + (index - layout.qualityCount) * step;

  // A short box cannot carry the big lettering.
  const big = layout.boxHeight >= 56;
  const titleSize = big ? 20 : 16;
  const descSize = big ? 13 : 11;
  const titleY = y + layout.boxHeight / 2 - (big ? 4 : 2);
  const descY = y + layout.boxHeight / 2 + (big ? 18 : 14);

  // The box
  ctx.fillStyle = selected ? '#0f0' : '#1a1a2e';
  ctx.fillRect(x, y, layout.boxWidth, layout.boxHeight);
  ctx.fillStyle = selected ? '#000' : '#0f0';

  // The border. On the option the cursor is on it pulses, so the cursor
  // is easy to find.
  ctx.strokeStyle = selected
    ? `rgba(255, 255, 255, ${(0.4 + pulse(time, 2.4) * 0.6).toFixed(2)})`
    : '#666';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, layout.boxWidth, layout.boxHeight);

  // The name
  ctx.font = selected ? `bold ${titleSize}px monospace` : `${titleSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, titleY);

  // The description
  ctx.fillStyle = selected ? '#333' : '#888';
  ctx.font = `${descSize}px monospace`;
  ctx.fillText(fitText(description, layout.boxWidth - 24, descSize), width / 2, descY);

  // The marker for the option the cursor is on
  if (selected) {
    ctx.fillStyle = '#000';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('▸', x + 10, titleY);
  }

  // The badge for the option that is in force
  if (active) drawActiveBadge(ctx, x + layout.boxWidth - 76, y + 4);
}

// One input scheme card: the picture of the scheme, its name and what it
// does. The three of them sit in a row, not in a column - the pictures
// are the point, and they are easier to compare side by side.
function drawSchemeCard(ctx, layout, options) {
  const { x, y, id, scheme, selected, active, time } = options;
  const w = layout.cardWidth;
  const h = layout.cardHeight;

  // The card
  ctx.fillStyle = selected ? '#123012' : '#1a1a2e';
  ctx.fillRect(x, y, w, h);

  // The border. Green when the cursor is on it, cyan when it is the one
  // in force, dim otherwise.
  ctx.strokeStyle = selected
    ? `rgba(0, 255, 0, ${(0.55 + pulse(time, 2.4) * 0.45).toFixed(2)})`
    : (active ? '#0ff' : '#555');
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // The picture
  const picture = schemePicture(id);
  const px = x + 16;
  const py = y + 8;
  if (picture.ready) {
    ctx.drawImage(picture.image, px, py, layout.pictureWidth, layout.pictureHeight);
  } else {
    // The picture has not arrived yet. The name stands in for it.
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(scheme.name.toUpperCase(), x + w / 2, py + layout.pictureHeight / 2);
  }

  // The name
  ctx.fillStyle = '#0f0';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(scheme.name.toUpperCase(), x + w / 2, y + layout.pictureHeight + 30);

  // What it does
  ctx.fillStyle = selected ? '#b8b8b8' : '#888';
  ctx.font = '12px monospace';
  const lines = wrapText(scheme.description, Math.floor((w - 24) / 7));
  lines.slice(0, 2).forEach((line, i) => {
    const last = i === 1 && lines.length > 2;
    ctx.fillText(last ? line.slice(0, -3) + '...' : line,
      x + w / 2, y + layout.pictureHeight + 48 + i * 15);
  });

  // The badge for the scheme that is in force
  if (active) drawActiveBadge(ctx, x + w / 2 - 32, y + h - 24);
}

// The badge that says this option is the one in force.
function drawActiveBadge(ctx, x, y) {
  const w = 64;
  const h = 16;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#0ff';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = '#0ff';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ACTIVE', x + w / 2, y + h / 2 + 4);
}

export { drawProfileOption, drawSchemeCard, drawActiveBadge };
