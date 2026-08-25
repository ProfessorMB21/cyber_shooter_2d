// Core Rendering System

class RenderingSystem {
  constructor(game) {
    this.game = game;
  }

  render() {
    const ctx = this.game.ctx;

    // Clear and draw background
    this.game.drawBackground(ctx);

    // Apply camera shake
    ctx.save();
    ctx.translate(this.game.cameraX, this.game.cameraY);

    // Draw particles (background)
    this.game.particles.draw(ctx);

    // Draw pickups (with culling)
    this.game.pickups.forEach(p => {
      if (p.x > -50 && p.x < this.game.width + 50 && p.y > -50 && p.y < this.game.height + 50) {
        p.draw(ctx);
      }
    });

    // Draw player
    if (this.game.player) {
      this.game.player.draw(ctx);
    }

    // Draw enemies (with culling)
    this.game.enemies.forEach(e => {
      if (e.x > -100 && e.x < this.game.width + 100 && e.y > -100 && e.y < this.game.height + 100) {
        e.draw(ctx);
      }
    });

    // Draw bosses (usually visible)
    this.game.bosses.forEach(b => {
      b.draw(ctx);
    });

    // Draw projectiles (with culling)
    this.game.projectiles.forEach(p => {
      if (p.x > -50 && p.x < this.game.width + 50 && p.y > -50 && p.y < this.game.height + 50) {
        p.draw(ctx);
      }
    });

    ctx.restore();

    // UI (not affected by shake)
    this.renderUI(ctx);
  }

  renderUI(ctx) {
    ctx.save();
    ctx.font = '14px monospace';

    // Top-left panel - only update score/wave/time (cheap text)
    ctx.fillStyle = '#0f0';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.game.score} | ${Math.floor(this.game.gameTime)}s | W${this.game.wave}`, 10, 20);

    // Combo - only if active
    if (this.game.combo > 1) {
      ctx.fillStyle = '#ff0';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`x${this.game.combo}`, 10, 40);
    }

    // Player stats (minimal, no frames)
    if (this.game.player) {
      const p = this.game.player;
      const now = Date.now();
      const y = this.game.height - 20;

      let dmg = p.currentStats.damage;
      if (p.overloadActive && now < p.overloadEndTime) dmg *= 2;

      ctx.font = '12px monospace';
      ctx.fillStyle = '#0f0';
      ctx.fillText(`❤ ${Math.floor(p.hp)} ⚔ ${Math.floor(dmg)} Lv${p.level}`, 10, y);

      // XP bar (tiny, simple)
      const xp = Math.round((p.xp / p.xpToNextLevel) * 100);
      ctx.fillStyle = xp < 50 ? '#666' : xp < 90 ? '#ff0' : '#0f0';
      ctx.fillRect(10, y + 5, Math.max(1, (xp / 100) * 40), 4);
    }

    // Quick ability cooldowns (bottom-right, minimal)
    if (this.game.player && this.game.player.build) {
      const p = this.game.player;
      const x = this.game.width - 100;
      const y = this.game.height - 30;
      ctx.font = '11px monospace';

      p.build.abilities.forEach((ability, i) => {
        const cd = p.getCooldown(ability);
        ctx.fillStyle = cd > 0 ? '#666' : '#0f0';
        ctx.fillText(`[${i + 1}] ${cd > 0 ? cd.toFixed(1) : 'OK'}`, x, y - i * 15);
      });
    }

    ctx.restore();
  }
}

export { RenderingSystem };
