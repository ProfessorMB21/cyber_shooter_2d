// Player Entity with Stats and Level System

import { Entity } from '../systems/entity.js';
import { BUILDS, STAT_GROWTH, SPEED_SCALE_FACTOR, ARMOR_DAMAGE_REDUCTION, ARMOR_MAX_REDUCTION, ARMOR_EXCESS_THRESHOLD } from '../config/index.js';
import { PlayerAbilities } from './abilities.js';
import { drawBuildVisual } from './build-visuals.js';

class Player extends Entity {
  constructor(buildName, x, y) {
    const build = BUILDS[buildName];
    if (!build) throw new Error(`Unknown build: ${buildName}`);
    super({ x, y, width: 30, height: 30, color: build.color, name: build.name, hp: build.stats.hp, maxHp: build.stats.maxHp, damage: build.stats.damage, speed: build.stats.speed * SPEED_SCALE_FACTOR, armor: build.stats.armor });
    this.buildName = buildName;
    this.build = build;
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 100;
    this.baseStats = { ...build.stats };
    this.currentStats = { ...build.stats };
    // Bonuses collected from pickups. They are kept apart from the derived
    // stats because levelling up recomputes those from the build's base
    // values - a bonus stored in currentStats would be thrown away.
    this.bonusStats = { maxHp: 0, damage: 0, speed: 0, armor: 0 };
    this.evasion = build.stats.evasion;
    this.criticalChance = build.stats.criticalChance;
    this.criticalDamage = build.stats.criticalDamage;
    this.regen = build.stats.regen;
    this.shield = 0;
    this.rage = 0;
    this.maxRage = 100;
    // Fraction by which this player's ability cooldowns are shortened, by
    // its own excess armour or by a guardian aura.
    this.cooldownReduction = 0;
    this.cooldowns = {};
    this.invulnerable = 0;
    this.cooldownTime = 0;
    this.shootCooldown = 0;
    this.passiveEffects = [];
    this.abilities = new PlayerAbilities(this);
    this.calculateDerivedStats();
  }

  // Recompute the stats that scale with the level.
  //
  // Each build declares which of its stats grow per level, and by what
  // fraction of its base value, in config/player-builds.js. Nothing here is
  // capped: a stat that grows keeps growing for as long as the player
  // survives, and the bonuses collected from pickups are added on top of
  // the scaled base rather than being overwritten by it.
  calculateDerivedStats() {
    const base = this.baseStats;
    const bonus = this.bonusStats;
    const growth = this.build.growth || {};
    const levels = this.level - 1;

    this.currentStats.maxHp = Math.floor(base.maxHp * (1 + (growth.maxHp || 0) * levels)) + bonus.maxHp;
    this.currentStats.damage = Math.floor(base.damage * (1 + (growth.damage || 0) * levels)) + bonus.damage;
    this.currentStats.armor = Math.floor(base.armor * (1 + (growth.armor || 0) * levels)) + bonus.armor;
    this.currentStats.speed = base.speed * SPEED_SCALE_FACTOR + bonus.speed;
    this.currentStats.hp = this.currentStats.maxHp;

    // A crit chance above 100% cannot mean anything, so that one stays
    // bounded. Every other stat is free to grow.
    this.criticalChance = Math.min(1, base.criticalChance + (growth.criticalChance || 0) * levels);

    // Keep the base entity's copies in step - the health bar reads maxHp.
    this.maxHp = this.currentStats.maxHp;
    this.damage = this.currentStats.damage;
    this.armor = this.currentStats.armor;
    this.speed = this.currentStats.speed;

    this.hp = Math.min(this.hp, this.currentStats.maxHp);
  }

  // Add a permanent bonus from a pickup. Bonuses live in their own pool so
  // that levelling up - which recomputes the derived stats from the build's
  // base values - does not throw them away.
  addBonus(stat, amount) {
    if (this.bonusStats[stat] === undefined) return;
    this.bonusStats[stat] += amount;
    this.calculateDerivedStats();
  }

  // The armour that has already maxed out the 75% damage reduction. It
  // cannot make the player any harder to kill, so the guardian spends it
  // on cooldown reduction instead.
  get excessArmor() {
    return Math.max(0, this.currentStats.armor - ARMOR_EXCESS_THRESHOLD);
  }

  // The cooldown reduction this player grants from its own excess armour.
  // Zero for every build without an aura.
  ownCooldownReduction() {
    const aura = this.build.aura;
    if (!aura) return 0;
    return Math.min(aura.maxCooldownReduction, this.excessArmor * aura.cooldownPerArmor);
  }

  // Recompute the cooldown reduction this player is under: its own excess
  // armour, or the strongest guardian aura covering it. The guardian is
  // inside its own aura, so the two are the same number and are not
  // added together.
  updateCooldownAura(players) {
    let reduction = this.ownCooldownReduction();
    for (const other of players) {
      if (other === this || !other.build?.aura) continue;
      if (this.distanceTo(other) > other.build.aura.radius) continue;
      reduction = Math.max(reduction, other.ownCooldownReduction());
    }
    this.cooldownReduction = reduction;
  }

  getDamage() {
    let damage = this.currentStats.damage;
    if (this.buildName === 'berserker') damage *= (1 + (this.rage / this.maxRage) * 1.5);
    if (Math.random() < this.criticalChance) damage *= this.criticalDamage;
    return Math.floor(damage);
  }

  takeDamage(amount) {
    if (this.invulnerable > 0) return 0;
    if (Math.random() * 100 < this.evasion) return 0;
    if (this.shield > 0) {
      const shieldAbsorb = Math.min(this.shield, amount);
      this.shield -= shieldAbsorb;
      amount -= shieldAbsorb;
    }
    // Armor reduces damage. The reduction is capped at 75% so that armor
    // can never make the player invulnerable - past that point the armor
    // number keeps growing but stops adding anything, and the guardian
    // turns the excess into a cooldown aura instead.
    const reduction = Math.min(ARMOR_MAX_REDUCTION, this.currentStats.armor * ARMOR_DAMAGE_REDUCTION);
    const actualDamage = amount * (1 - reduction);
    this.hp -= actualDamage;
    if (this.buildName === 'berserker') this.rage = Math.min(this.maxRage, this.rage + actualDamage * 0.5);
    this.invulnerable = 0.1;
    if (this.hp <= 0) { this.hp = 0; this.dead = true; }
    return actualDamage;
  }

  heal(amount) { this.hp = Math.min(this.hp + amount, this.currentStats.maxHp); }
  addShield(amount) { this.shield += amount; }
  activateAbility(abilityName) { return this.abilities.activate(abilityName); }

  // Cooldowns are keyed by the ability name lowercased with the spaces
  // stripped. The reader and the writer must agree on this, or a
  // cooldown is set under one key and read under another and the ability
  // never shows as recharging.
  cooldownKey(abilityName) { return abilityName.toLowerCase().replace(/\s+/g, ''); }

  getCooldown(abilityName) {
    const now = Date.now(), cooldown = this.cooldowns[this.cooldownKey(abilityName)];
    if (!cooldown) return 0;
    return Math.max(0, (cooldown - now) / 1000);
  }

  isAbilityReady(abilityName) { return this.getCooldown(abilityName) === 0; }

  addXP(amount) {
    this.xp += amount;
    // A single award can span several level thresholds (a boss kill at low
    // level), so keep levelling until the XP is below the next threshold.
    let levelsGained = 0;
    while (this.xp >= this.xpToNextLevel) {
      this.levelUp();
      levelsGained++;
    }
    return levelsGained;
  }

  levelUp() {
    this.level++;
    this.xp -= this.xpToNextLevel;
    this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
    this.calculateDerivedStats();
    this.heal(this.currentStats.maxHp * 0.3);
    return this.level;
  }

  update(deltaTime, input, canvasWidth, canvasHeight) {
    const now = Date.now();
    this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);
    this.invulnerable = Math.max(0, this.invulnerable - deltaTime);
    if (this.overloadActive && now >= this.overloadEndTime) this.overloadActive = false;
    if (this.speedBoostActive && now >= this.speedBoostEndTime) this.speedBoostActive = false;
    if (this.smokeScreenActive && now >= this.smokeScreenEndTime) this.smokeScreenActive = false;
    if (this.divineProtectionActive && now >= this.divineProtectionEndTime) this.divineProtectionActive = false;
    if (this.whirlwindActive && now >= this.whirlwindEndTime) this.whirlwindActive = false;
    if (this.regen > 0) this.hp = Math.min(this.hp + this.regen * deltaTime, this.currentStats.maxHp);
    let effectiveSpeed = this.currentStats.speed;
    if (this.speedBoostActive) effectiveSpeed *= 1.5;
    if (input) {
      const movement = input.getMovement();
      this.vx += movement.dx * effectiveSpeed * deltaTime * 60;
      this.vy += movement.dy * effectiveSpeed * deltaTime * 60;
    }
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.clampToBounds(canvasWidth, canvasHeight);
    if (this.buildName === 'berserker' && this.rage > 0) {
      this.rage = Math.max(0, this.rage - deltaTime * (this.whirlwindActive ? 2 : 5));
    }
    if (this.divineProtectionActive) this.invulnerable = Math.max(this.invulnerable, 0.1);
    return true;
  }

  draw(ctx) {
    const center = this.getCenter();
    // Guardian aura - the radius the cooldown reduction reaches. Faint, so
    // it never gets in the way of the fight.
    if (this.cooldownReduction > 0 && this.build.aura) {
      ctx.save();
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = 0.12 + this.cooldownReduction * 0.3;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(center.x, center.y, this.build.aura.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (this.shield > 0) {
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#4444ff';
      ctx.strokeStyle = '#6666ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(center.x, center.y, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (this.invulnerable > 0 && Math.floor(Date.now() / 50) % 2 === 0) ctx.globalAlpha = 0.5;
    ctx.save();
    ctx.fillStyle = `rgba(100, 200, 255, ${0.5 + Math.sin(Date.now() / 50) * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(center.x, this.y + this.height + 5);
    ctx.lineTo(center.x - 8, this.y + this.height + 15);
    ctx.lineTo(center.x + 8, this.y + this.height + 15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.x + 8, this.y + 8, this.width - 16, this.height - 16);
    ctx.restore();
    if (this.buildName === 'berserker' && this.rage > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 0, 0, ${this.rage / this.maxRage * 0.6})`;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    this.drawHealthBar(ctx, center.x, this.y - 10, 40, 6);
    if (this.shield > 0) {
      // The bar is scaled against the health pool, so it stays meaningful
      // as both the shield and the max HP grow.
      ctx.fillStyle = '#4444ff';
      ctx.fillRect(center.x - 20, this.y - 18, 40 * Math.min(this.shield / this.currentStats.maxHp, 1), 4);
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Lv${this.level}`, center.x, this.y + this.height + 12);

    // Draw build-specific visuals based on quality setting
    if (this.shouldDrawBuildVisuals()) {
      this.drawBuildSpecific(ctx, center);
    }
  }

  shouldDrawBuildVisuals() {
    // Only draw build visuals in quality mode
    return this.color && this.build &&
           typeof window !== 'undefined' &&
           window.gameInstance &&
           window.gameInstance.settings &&
           window.gameInstance.settings.getQuality() !== 'performance';
  }

  // Draw build-specific visual designs
  drawBuildSpecific(ctx, center) {
    // Skip expensive visuals if frame rate is low (dynamic quality scaling)
    if (this.skipBuildVisuals) return;

    drawBuildVisual(ctx, this.buildName, center, this.width / 2, this.color);
  }

  // Draw ability cooldowns
  drawCooldowns(ctx, x, y) {
    const abilities = this.build.abilities, keyLabels = ['[1]', '[2]'];
    abilities.forEach((ability, i) => {
      const cd = this.getCooldown(ability), yPos = y + i * 35;
      ctx.fillStyle = cd > 0 ? '#222' : '#1a3a1a';
      ctx.fillRect(x, yPos - 20, 140, 30);
      ctx.strokeStyle = cd > 0 ? '#444' : '#4f4';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, yPos - 20, 140, 30);
      ctx.fillStyle = cd > 0 ? '#666' : '#888';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(keyLabels[i] || '', x + 5, yPos - 8);
      ctx.fillStyle = cd > 0 ? '#888' : '#fff';
      ctx.font = '11px monospace';
      ctx.fillText(ability.substring(0, 12), x + 30, yPos - 8);
      if (cd > 0) {
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`${cd.toFixed(1)}s`, x + 5, yPos + 5);
      } else {
        ctx.fillStyle = '#44ff44';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('READY', x + 5, yPos + 5);
      }
    });
    if (this.cooldownReduction > 0) {
      ctx.fillStyle = this.color;
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`AURA -${Math.round(this.cooldownReduction * 100)}% CD`, x + 5, y + 65);
    }
  }
}

export { Player, BUILDS, STAT_GROWTH, SPEED_SCALE_FACTOR };
