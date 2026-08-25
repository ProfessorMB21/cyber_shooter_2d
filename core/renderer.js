// Core Rendering System

class RenderingSystem {
  constructor(game) {
    this.game = game;
  }

  render() {
    const ctx = this.game.ctx;
    const settings = this.game.settings;

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

    // Draw enemies (with quality-based culling)
    if (settings.getSetting('entityCulling')) {
      // Performance/Balanced: culling enabled
      this.game.enemies.forEach(e => {
        if (e.x > -100 && e.x < this.game.width + 100 && e.y > -100 && e.y < this.game.height + 100) {
          e.draw(ctx);
        }
      });
    } else {
      // Quality: draw all (no culling)
      this.game.enemies.forEach(e => e.draw(ctx));
    }

    // Draw bosses (usually visible)
    this.game.bosses.forEach(b => {
      b.draw(ctx);
    });

    // Draw projectiles (with culling)
    if (settings.getSetting('entityCulling')) {
      this.game.projectiles.forEach(p => {
        if (p.x > -50 && p.x < this.game.width + 50 && p.y > -50 && p.y < this.game.height + 50) {
          p.draw(ctx);
        }
      });
    } else {
      this.game.projectiles.forEach(p => p.draw(ctx));
    }

    ctx.restore();

    // UI (not affected by shake)
    this.renderUI(ctx);
  }

  renderUI(ctx) {
    const settings = this.game.settings;

    // Quality mode: full UI with frames and details
    if (settings.getQuality() === 'quality') {
      this.renderUIQuality(ctx);
      return;
    }

    // Balanced mode: medium UI
    if (settings.getQuality() === 'balanced') {
      this.renderUIBalanced(ctx);
      return;
    }

    // Performance mode: minimal UI
    this.renderUIPerformance(ctx);
  }

  renderUIPerformance(ctx) {
    ctx.save();
    ctx.font = '14px monospace';

    // Minimal top-left info
    ctx.fillStyle = '#0f0';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.game.score} | ${Math.floor(this.game.gameTime)}s | W${this.game.wave}`, 10, 20);

    // Combo only if active
    if (this.game.combo > 1) {
      ctx.fillStyle = '#ff0';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`x${this.game.combo}`, 10, 40);
    }

    // Player stats (minimal)
    if (this.game.player) {
      const p = this.game.player;
      const y = this.game.height - 20;

      let dmg = p.currentStats.damage;
      if (p.overloadActive && Date.now() < p.overloadEndTime) dmg *= 2;

      ctx.font = '12px monospace';
      ctx.fillStyle = '#0f0';
      ctx.fillText(`❤ ${Math.floor(p.hp)} ⚔ ${Math.floor(dmg)} Lv${p.level}`, 10, y);

      // Tiny XP bar
      const xp = Math.round((p.xp / p.xpToNextLevel) * 100);
      ctx.fillStyle = xp < 50 ? '#666' : xp < 90 ? '#ff0' : '#0f0';
      ctx.fillRect(10, y + 5, Math.max(1, (xp / 100) * 40), 4);
    }

    // Quick ability cooldowns
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

  renderUIBalanced(ctx) {
    ctx.save();

    // Top-left info panel with frame
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

    // Combo
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
      const overloadActive = p.overloadActive && now < p.overloadEndTime;
      if (overloadActive) displayDamage *= 2;

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

      ctx.fillStyle = '#fff';
      ctx.fillText(`⭐ Lv${p.level}`, 15, this.game.height - 40);

      // XP bar with frame
      const xpPercent = p.xp / p.xpToNextLevel;
      ctx.fillStyle = '#000';
      ctx.fillRect(10, this.game.height - 12, 190, 8);
      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, this.game.height - 12, 190, 8);
      ctx.fillStyle = '#0f0';
      ctx.fillRect(10, this.game.height - 12, 190 * xpPercent, 8);
    }

    // Abilities
    if (this.game.player && this.game.player.build) {
      this.game.player.drawCooldowns(ctx, this.game.width - 150, this.game.height - 100);
    }

    ctx.restore();
  }

  renderUIQuality(ctx) {
    ctx.save();

    // Top-left info panel with enhanced styling
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, 5, 280, 110);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, 280, 110);

    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`📊 Score: ${Math.floor(this.game.score)}`, 15, 28);
    ctx.fillText(`⏱️  Time: ${Math.floor(this.game.gameTime)}s`, 15, 48);
    ctx.fillText(`🌊 Wave: ${this.game.wave}`, 15, 68);
    ctx.fillText(`💀 Kills: ${this.game.kills}`, 15, 88);

    // Combo (large)
    if (this.game.combo > 1) {
      ctx.fillStyle = '#ff0';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff0';
      ctx.shadowBlur = 10;
      ctx.fillText(`COMBO x${this.game.combo}`, this.game.width / 2, 50);
      ctx.shadowBlur = 0;
    }

    // Player stats panel (bottom-left) - FULL
    if (this.game.player) {
      const p = this.game.player;
      const now = Date.now();

      let displayDamage = p.currentStats.damage;
      let displaySpeed = p.currentStats.speed;
      const overloadActive = p.overloadActive && now < p.overloadEndTime;
      const speedBoostActive = p.speedBoostActive && now < p.speedBoostEndTime;

      if (overloadActive) displayDamage *= 2;
      if (speedBoostActive) displaySpeed *= 1.5;

      // Enhanced stats frame
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(5, this.game.height - 130, 220, 125);
      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 3;
      ctx.strokeRect(5, this.game.height - 130, 220, 125);

      // Stats with full details
      ctx.fillStyle = '#0f0';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`❤️  HP: ${Math.floor(p.hp)}/${p.currentStats.maxHp}`, 15, this.game.height - 105);

      ctx.fillStyle = overloadActive ? '#ff8800' : '#fff';
      ctx.fillText(`⚔️  DMG: ${Math.floor(displayDamage)}`, 15, this.game.height - 85);

      ctx.fillStyle = speedBoostActive ? '#00ffff' : '#fff';
      ctx.fillText(`💨 SPD: ${Math.floor(displaySpeed)}`, 15, this.game.height - 65);

      ctx.fillStyle = '#fff';
      ctx.fillText(`⭐ Level: ${p.level}`, 15, this.game.height - 45);

      // Build name with color
      ctx.fillStyle = p.color;
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`🎮 ${p.build.name.toUpperCase()}`, 15, this.game.height - 25);

      // XP bar with enhanced styling
      const xpPercent = p.xp / p.xpToNextLevel;
      ctx.fillStyle = '#000';
      ctx.fillRect(10, this.game.height - 8, 200, 6);
      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, this.game.height - 8, 200, 6);
      ctx.fillStyle = '#0f0';
      ctx.fillRect(10, this.game.height - 8, 200 * xpPercent, 6);
    }

    // Abilities (full display)
    if (this.game.player && this.game.player.build) {
      this.game.player.drawCooldowns(ctx, this.game.width - 160, this.game.height - 110);
    }

    ctx.restore();
  }
}

export { RenderingSystem };
