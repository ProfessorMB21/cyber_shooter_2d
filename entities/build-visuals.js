// Build-Specific Player Visuals
//
// Each of the 7 player builds gets a unique silhouette drawn around the
// ship so the player can tell at a glance which build they are flying.
// Geometry is expressed relative to the ship centre and its half-width.

// ctx, x, y, halfWidth, color
const BUILD_VISUALS = {
  // Shield fin on the left
  fighter(ctx, x, y, w, color) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(x - w - 2, y - 5);
    ctx.lineTo(x - w - 2, y + 5);
    ctx.lineTo(x - w + 3, y);
    ctx.closePath();
    ctx.fill();
  },

  // Energy ring
  glass_cannon(ctx, x, y, w, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(x, y, w + 5, 0, Math.PI * 2);
    ctx.stroke();
  },

  // Armour plating
  tank(ctx, x, y, w, color) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x - w, y - 3, w * 2, 6);
  },

  // Neutral cross
  balanced(ctx, x, y, w, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y - w);
    ctx.lineTo(x, y + w);
    ctx.moveTo(x - w, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
  },

  // Targeting barrel
  sniper(ctx, x, y, w, color) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x + 2, y - 1.5, w + 3, 3);
  },

  // Radiating spikes
  berserker(ctx, x, y, w, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const sx = x + Math.cos(angle) * (w + 2);
      const sy = y + Math.sin(angle) * (w + 2);
      const ex = x + Math.cos(angle) * (w + 6);
      const ey = y + Math.sin(angle) * (w + 6);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  },

  // Protective aura
  guardian(ctx, x, y, w, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, w + 5, 0, Math.PI * 2);
    ctx.stroke();
  }
};

// Draw the visual overlay for a build. Does nothing for unknown builds.
function drawBuildVisual(ctx, buildName, center, halfWidth, color) {
  const draw = BUILD_VISUALS[buildName];
  if (!draw) return;

  ctx.save();
  draw(ctx, center.x, center.y, halfWidth, color);
  ctx.restore();
}

export { drawBuildVisual, BUILD_VISUALS };
