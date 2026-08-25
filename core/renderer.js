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

    // Draw pickups
    this.game.pickups.forEach(p => p.draw(ctx));

    // Draw player
    if (this.game.player) {
      this.game.player.draw(ctx);
    }

    // Draw enemies
    this.game.enemies.forEach(e => e.draw(ctx));

    // Draw bosses
    this.game.bosses.forEach(b => b.draw(ctx));

    // Draw projectiles
    this.game.projectiles.forEach(p => p.draw(ctx));

    // Draw particles (foreground)

    ctx.restore();

    // UI (not affected by shake)
    this.renderUI(ctx);
  }

  renderUI(ctx) {
    ctx.save();

    // Top-left info panel (minimal redraws)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(5, 5, 240, 100);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, 240, 100);

    ctx.fillStyle = '#0f0';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${Math.floor(this.game.score)}`, 15, 25);
    ctx.fillText(`Time: ${Math.floor(this.game.gameTime)}s`, 15, 45);
    ctx.fillText(`Wave: ${this.game.wave}`, 15, 65);
    ctx.fillText(`Kills: ${this.game.kills}`, 15, 85);

    // Combo (only draw if active)
    if (this.game.combo > 1) {
      ctx.fillStyle = '#ff0';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`COMBO x${this.game.combo}`, 10, 115);
    }

    // Player stats panel (bottom-left)
    if (this.game.player) {
      const p = this.game.player;
      const now = Date.now();

      let displayDamage = p.currentStats.damage;
      let displaySpeed = p.currentStats.speed;

      const overloadActive = p.overloadActive && now < p.overloadEndTime;
      const speedBoostActive = p.speedBoostActive && now < p.speedBoostEndTime;

      if (overloadActive) displayDamage *= 2;
      if (speedBoostActive) displaySpeed *= 1.5;

      // Stats frame
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(5, this.game.height - 105, 200, 100);
      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(5, this.game.height - 105, 200, 100);

      // Stats with emoji
      ctx.fillStyle = '#0f0';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`❤️  ${Math.floor(p.hp)}/${p.currentStats.maxHp}`, 15, this.game.height - 85);

      ctx.fillStyle = overloadActive ? '#ff8800' : '#fff';
      ctx.fillText(`⚔️  ${Math.floor(displayDamage)}`, 15, this.game.height - 70);

      ctx.fillStyle = speedBoostActive ? '#00ffff' : '#fff';
      ctx.fillText(`💨 ${Math.floor(displaySpeed)}`, 15, this.game.height - 55);

      ctx.fillStyle = '#fff';
      ctx.fillText(`⭐ Lv${p.level}`, 15, this.game.height - 40);

      // Build name
      ctx.fillStyle = p.color;
      ctx.font = 'bold 12px monospace';
      ctx.fillText(p.build.name.toUpperCase(), 15, this.game.height - 22);

      // Shield (only if active)
      if (p.shield > 0) {
        ctx.fillStyle = '#4444ff';
        ctx.font = '12px monospace';
        ctx.fillText(`🛡️ ${Math.floor(p.shield)}`, 120, this.game.height - 85);
      }

      // XP bar
      const xpPercent = p.xp / p.xpToNextLevel;
      ctx.fillStyle = '#000';
      ctx.fillRect(10, this.game.height - 12, 190, 8);
      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, this.game.height - 12, 190, 8);
      ctx.fillStyle = '#0f0';
      ctx.fillRect(10, this.game.height - 12, 190 * xpPercent, 8);
    }

    // Active buffs (only draw active ones)
    if (this.game.player) {
      const p = this.game.player;
      const now = Date.now();
      let buffY = this.game.height - 125;
      ctx.font = '12px monospace';

      if (p.overloadActive && now < p.overloadEndTime) {
        const remaining = Math.ceil((p.overloadEndTime - now) / 1000);
        ctx.fillStyle = '#ff8800';
        ctx.fillText(`⚡ OVERLOAD (${remaining}s)`, 10, buffY);
        buffY -= 15;
      }

      if (p.speedBoostActive && now < p.speedBoostEndTime) {
        const remaining = Math.ceil((p.speedBoostEndTime - now) / 1000);
        ctx.fillStyle = '#00ffff';
        ctx.fillText(`⚡ SPEED BOOST (${remaining}s)`, 10, buffY);
        buffY -= 15;
      }

      if (p.divineProtectionActive && now < p.divineProtectionEndTime) {
        const remaining = Math.ceil((p.divineProtectionEndTime - now) / 1000);
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`🛡️ DIVINE (${remaining}s)`, 10, buffY);
        buffY -= 15;
      }

      if (p.smokeScreenActive && now < p.smokeScreenEndTime) {
        const remaining = Math.ceil((p.smokeScreenEndTime - now) / 1000);
        ctx.fillStyle = '#888888';
        ctx.fillText(`👻 INVISIBLE (${remaining}s)`, 10, buffY);
        buffY -= 15;
      }

      if (p.whirlwindActive && now < p.whirlwindEndTime) {
        const remaining = Math.ceil((p.whirlwindEndTime - now) / 1000);
        ctx.fillStyle = '#ff0000';
        ctx.fillText(`🌪️ WHIRLWIND (${remaining}s)`, 10, buffY);
        buffY -= 15;
      }

      if (p.rage >= p.maxRage * 0.8 && p.buildName === 'berserker') {
        ctx.fillStyle = '#ff0000';
        ctx.fillText(`🔥 MAX RAGE`, 10, buffY);
      }
    }

    // Abilities
    if (this.game.player && this.game.player.build) {
      this.game.player.drawCooldowns(ctx, this.game.width - 150, this.game.height - 100);
    }

    // Controls hint
    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('WASD: Move | SPACE: Shoot | 1/2: Skills | ESC/P: Pause', 10, this.game.height - 135);

    ctx.restore();
  }
}

export { RenderingSystem };
