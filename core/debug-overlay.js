// Debug Overlay
//
// Toggle with F. Reports the real frame rate and how much the scene is
// actually drawing, so performance work is driven by measurements instead
// of guesswork.

class DebugOverlay {
  constructor(game) {
    this.game = game;
    this.visible = false;
  }

  toggle() {
    this.visible = !this.visible;
  }

  render(ctx) {
    if (!this.visible) return;

    const game = this.game;
    const perf = game.perf;
    const counts = game.renderer.drawCounts;
    const particles = game.particles.getActiveParticleCount();

    const lines = [
      `${perf.fps} fps  ${perf.avgFrameTime.toFixed(2)} ms`,
      `state ${game.state}  ${game.settings.getQuality()}`,
      `drawn e${counts.enemies} b${counts.bosses} p${counts.projectiles} k${counts.pickups}`,
      `particles ${particles}/${game.particles.poolSize}`,
      `total e${game.enemies.length} b${game.bosses.length} p${game.projectiles.length}`
    ];

    const height = 16 * lines.length + 12;
    const y = game.height - height - 8;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(4, y, 260, height);
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, y, 260, height);
    ctx.fillStyle = '#0ff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    lines.forEach((line, i) => {
      ctx.fillText(line, 12, y + 18 + i * 16);
    });
    ctx.restore();
  }
}

export { DebugOverlay };
