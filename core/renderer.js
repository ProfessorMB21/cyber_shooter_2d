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
    // Score
    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${Math.floor(this.game.score)}`, 10, 25);
    ctx.fillText(`Time: ${Math.floor(this.game.gameTime)}s`, 10, 45);
    ctx.fillText(`Wave: ${this.game.wave}`, 10, 65);
    ctx.fillText(`Kills: ${this.game.kills}`, 10, 85);

    // Combo
    if (this.game.combo > 1) {
      ctx.fillStyle = '#ff0';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`COMBO x${this.game.combo}`, 10, 110);
    }

    // Player stats
    if (this.game.player) {
      const p = this.game.player;
      const now = Date.now();

      // Calculate effective stats with buffs
      let displayDamage = p.currentStats.damage;
      let displaySpeed = p.currentStats.speed;

      // Check for active buffs
      const overloadActive = p.overloadActive && now < p.overloadEndTime;
      const speedBoostActive = p.speedBoostActive && now < p.speedBoostEndTime;

      if (overloadActive) displayDamage *= 2;
      if (speedBoostActive) displaySpeed *= 1.5;

      // Base stats display
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`HP: ${Math.floor(p.hp)}/${p.currentStats.maxHp}`, 10, this.game.height - 60);

      // Damage with buff indicator
      if (overloadActive) {
        ctx.fillStyle = '#ff8800'; // Orange for buffed damage
        ctx.fillText(`DMG: ${Math.floor(displayDamage)} (2x)`, 10, this.game.height - 45);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillText(`DMG: ${Math.floor(displayDamage)}`, 10, this.game.height - 45);
      }

      // Speed with buff indicator
      if (speedBoostActive) {
        ctx.fillStyle = '#00ffff'; // Cyan for buffed speed
        ctx.fillText(`SPD: ${Math.floor(displaySpeed)} (1.5x)`, 10, this.game.height - 30);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillText(`SPD: ${Math.floor(displaySpeed)}`, 10, this.game.height - 30);
      }

      ctx.fillStyle = '#fff';
      ctx.fillText(`LVL: ${p.level}`, 10, this.game.height - 15);

      // Shield
      if (p.shield > 0) {
        ctx.fillStyle = '#44f';
        ctx.fillText(`Shield: ${Math.floor(p.shield)}`, 120, this.game.height - 60);
      }

      // Active buffs list
      let buffY = this.game.height - 135;
      ctx.font = '12px monospace';

      if (overloadActive) {
        const remaining = Math.ceil((p.overloadEndTime - now) / 1000);
        ctx.fillStyle = '#ff8800';
        ctx.fillText(`⚡ OVERLOAD (${remaining}s)`, 10, buffY);
        buffY -= 15;
      }

      if (speedBoostActive) {
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

      // XP bar
      const xpPercent = p.xp / p.xpToNextLevel;
      ctx.fillStyle = '#333';
      ctx.fillRect(10, this.game.height - 10, 200, 6);
      ctx.fillStyle = '#4f4';
      ctx.fillRect(10, this.game.height - 10, 200 * xpPercent, 6);
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
  }
}

export { RenderingSystem };
