// Player Entity with Stats and Level System

import { Entity } from '../systems/entity.js';
import config from '../config.js';

// Extract constants from config
const SPEED_SCALE_FACTOR = config.SPEED_SCALE_FACTOR;
const STAT_CAPS = config.STAT_CAPS;
const STAT_GROWTH = config.STAT_GROWTH;

// Transform config builds to BUILDS format used by the game
const BUILDS = {};
config.builds.forEach(build => {
  BUILDS[build.name] = {
    name: build.display,
    description: build.description,
    color: build.color,
    stats: { ...build.stats },
    abilities: build.abilities,
    passive: build.passive
  };
});

class Player extends Entity {
  constructor(buildName, x, y) {
    const build = BUILDS[buildName];
    if (!build) {
      throw new Error(`Unknown build: ${buildName}`);
    }

    super({
      x,
      y,
      width: 30,
      height: 30,
      color: build.color,
      name: build.name,
      hp: build.stats.hp,
      maxHp: build.stats.maxHp,
      damage: build.stats.damage,
      speed: build.stats.speed * SPEED_SCALE_FACTOR,
      armor: build.stats.armor
    });

    this.buildName = buildName;
    this.build = build;
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 100;

    // Stats
    this.baseStats = { ...build.stats };
    this.currentStats = { ...build.stats };
    this.evasion = build.stats.evasion;
    this.criticalChance = build.stats.criticalChance;
    this.criticalDamage = build.stats.criticalDamage;
    this.regen = build.stats.regen;

    // Combat
    this.shield = 0;
    this.rage = 0;
    this.maxRage = 100;
    this.cooldowns = {};
    this.invulnerable = 0;

    // Movement
    this.cooldownTime = 0;
    this.shootCooldown = 0;

    // Passive effects
    this.passiveEffects = [];

    this.calculateDerivedStats();
  }

  // Calculate derived stats from base stats
  calculateDerivedStats() {
    const levelMultiplier = 1 + (this.level - 1) * 0.1;

    // Apply build-specific passive
    switch (this.buildName) {
      case 'fighter':
        this.currentStats.maxHp = Math.floor(this.baseStats.maxHp * (1 + (this.level - 1) * 0.08));
        break;
      case 'glass_cannon':
        this.currentStats.damage = Math.floor(this.baseStats.damage * (1 + (this.level - 1) * 0.10));
        break;
      case 'tank':
        this.currentStats.maxHp = Math.floor(this.baseStats.maxHp * (1 + (this.level - 1) * 0.12));
        this.currentStats.armor = Math.floor(this.baseStats.armor * (1 + (this.level - 1) * 0.05));
        break;
      case 'balanced':
        this.currentStats.maxHp = Math.floor(this.baseStats.maxHp * (1 + (this.level - 1) * 0.06));
        this.currentStats.damage = Math.floor(this.baseStats.damage * (1 + (this.level - 1) * 0.06));
        this.currentStats.armor = Math.floor(this.baseStats.armor * (1 + (this.level - 1) * 0.06));
        break;
      case 'sniper':
        this.criticalChance = Math.min(1, this.baseStats.criticalChance + (this.level - 1) * 0.08);
        break;
      case 'berserker':
        // Rage-based scaling applied during update
        break;
      case 'guardian':
        this.currentStats.armor = Math.floor(this.baseStats.armor * (1 + (this.level - 1) * 0.10));
        break;
    }

    // Ensure HP doesn't exceed max
    this.hp = Math.min(this.hp, this.currentStats.maxHp);
  }

  // Get effective damage with crit
  getDamage() {
    let damage = this.currentStats.damage;

    // Berserker rage bonus
    if (this.buildName === 'berserker') {
      damage *= (1 + (this.rage / this.maxRage) * 1.5);
    }

    // Check for critical hit
    if (Math.random() < this.criticalChance) {
      damage *= this.criticalDamage;
    }

    return Math.floor(damage);
  }

  // Take damage with armor reduction
  takeDamage(amount) {
    if (this.invulnerable > 0) return 0;

    // Evasion check
    if (Math.random() * 100 < this.evasion) {
      return 0; // Dodged!
    }

    // Shield absorbs damage first
    if (this.shield > 0) {
      const shieldAbsorb = Math.min(this.shield, amount);
      this.shield -= shieldAbsorb;
      amount -= shieldAbsorb;
    }

    // Armor reduction
    const reduction = Math.min(0.75, this.currentStats.armor * 0.015);
    const actualDamage = amount * (1 - reduction);

    this.hp -= actualDamage;

    // Build rage on damage (berserker)
    if (this.buildName === 'berserker') {
      this.rage = Math.min(this.maxRage, this.rage + actualDamage * 0.5);
    }

    // Brief invulnerability
    this.invulnerable = 0.1;

    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
    }

    return actualDamage;
  }

  // Heal
  heal(amount) {
    this.hp = Math.min(this.hp + amount, this.currentStats.maxHp);
  }

  // Add shield (capped at STAT_CAPS.maxShield)
  addShield(amount) {
    this.shield = Math.min(this.shield + amount, STAT_CAPS.maxShield);
  }

  // Activate ability
  activateAbility(abilityName) {
    const now = Date.now();

    switch (abilityName) {
      // Fighter abilities
      case 'HEALING SHOT':
        if (!this.cooldowns.healingShot || now > this.cooldowns.healingShot) {
          this.heal(this.currentStats.maxHp * 0.25);
          this.cooldowns.healingShot = now + 6000; // 6 seconds
          return { activated: true, effect: 'heal', value: this.currentStats.maxHp * 0.25 };
        }
        break;
      case 'DASH':
        if (!this.cooldowns.dash || now > this.cooldowns.dash) {
          // Dash forward in movement direction (handled by game)
          this.cooldowns.dash = now + 4000; // 4 seconds
          this.invulnerable = 0.3; // Brief invulnerability
          return { activated: true, effect: 'dash', duration: 0.2 };
        }
        break;

      // Glass Cannon abilities
      case 'OVERLOAD':
        if (!this.cooldowns.overload || now > this.cooldowns.overload) {
          // Double damage for 5 seconds
          this.overloadActive = true;
          this.overloadEndTime = now + 5000;
          this.cooldowns.overload = now + 15000; // 15 seconds
          return { activated: true, effect: 'damage_boost', multiplier: 2, duration: 5 };
        }
        break;
      case 'TELEPORT':
        if (!this.cooldowns.teleport || now > this.cooldowns.teleport) {
          // Teleport to safety (random position, handled by game)
          this.cooldowns.teleport = now + 12000; // 12 seconds
          this.invulnerable = 0.5; // Brief invulnerability after teleport
          return { activated: true, effect: 'teleport' };
        }
        break;

      // Tank abilities
      case 'SHIELD':
        if (!this.cooldowns.shield || now > this.cooldowns.shield) {
          const shieldValue = 100;
          this.addShield(shieldValue);
          this.cooldowns.shield = now + 10000; // 10 seconds
          return { activated: true, effect: 'shield', value: shieldValue };
        }
        break;
      case 'GROUND SLAM':
        if (!this.cooldowns.groundSlam || now > this.cooldowns.groundSlam) {
          // AOE damage around player (handled by game)
          this.cooldowns.groundSlam = now + 8000; // 8 seconds
          return { activated: true, effect: 'aoe_damage', damage: this.currentStats.damage * 3, radius: 150 };
        }
        break;

      // Balanced abilities
      case 'ADRENALINE RUSH':
        if (!this.cooldowns.adrenalineRush || now > this.cooldowns.adrenalineRush) {
          // Speed boost for 4 seconds
          this.speedBoostActive = true;
          this.speedBoostEndTime = now + 4000;
          this.cooldowns.adrenalineRush = now + 12000; // 12 seconds
          return { activated: true, effect: 'speed_boost', multiplier: 1.5, duration: 4 };
        }
        break;

      // Sniper abilities
      case 'SNIPER SHOT':
        if (!this.cooldowns.sniperShot || now > this.cooldowns.sniperShot) {
          // Guaranteed crit next shot + piercing
          this.nextShotCrit = true;
          this.nextShotPiercing = true;
          this.cooldowns.sniperShot = now + 10000; // 10 seconds
          return { activated: true, effect: 'crit_shot' };
        }
        break;
      case 'SMOKE SCREEN':
        if (!this.cooldowns.smokeScreen || now > this.cooldowns.smokeScreen) {
          // Brief invisibility and enemies lose target
          this.smokeScreenActive = true;
          this.smokeScreenEndTime = now + 3000;
          this.cooldowns.smokeScreen = now + 15000; // 15 seconds
          return { activated: true, effect: 'invisibility', duration: 3 };
        }
        break;

      // Berserker abilities
      case 'BERSERK RAGE':
        if (!this.cooldowns.berserkRage || now > this.cooldowns.berserkRage) {
          this.rage = this.maxRage;
          this.cooldowns.berserkRage = now + 12000; // 12 seconds
          return { activated: true, effect: 'max_rage' };
        }
        break;
      case 'WHIRLWIND':
        if (!this.cooldowns.whirlwind || now > this.cooldowns.whirlwind) {
          // Rapid spin attack (handled by game)
          this.whirlwindActive = true;
          this.whirlwindEndTime = now + 2000;
          this.cooldowns.whirlwind = now + 10000; // 10 seconds
          return { activated: true, effect: 'whirlwind', damage: this.currentStats.damage, duration: 2 };
        }
        break;

      // Guardian abilities
      case 'DIVINE PROTECTION':
        if (!this.cooldowns.divineProtection || now > this.cooldowns.divineProtection) {
          // Full heal and damage immunity for 2 seconds
          this.heal(this.currentStats.maxHp * 0.5);
          this.divineProtectionActive = true;
          this.divineProtectionEndTime = now + 2000;
          this.cooldowns.divineProtection = now + 20000; // 20 seconds
          return { activated: true, effect: 'damage_immunity', duration: 2 };
        }
        break;
      case 'REVIVE':
        // Passive - auto-trigger on death
        break;
    }
    return { activated: false };
  }

  // Get cooldown remaining (seconds)
  getCooldown(abilityName) {
    const now = Date.now();
    const key = abilityName.toLowerCase().replace(/\s+/g, '');
    const cooldown = this.cooldowns[key];
    if (!cooldown) return 0;
    return Math.max(0, (cooldown - now) / 1000);
  }

  // Check if ability is ready
  isAbilityReady(abilityName) {
    return this.getCooldown(abilityName) === 0;
  }

  // Add XP
  addXP(amount) {
    this.xp += amount;
    if (this.xp >= this.xpToNextLevel) {
      this.levelUp();
    }
  }

  // Level up
  levelUp() {
    this.level++;
    this.xp -= this.xpToNextLevel;
    this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);

    this.calculateDerivedStats();

    // Heal on level up
    this.heal(this.currentStats.maxHp * 0.3);

    return this.level;
  }

  // Update player
  update(deltaTime, input, canvasWidth, canvasHeight) {
    const now = Date.now();

    // Update cooldowns
    this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);
    this.invulnerable = Math.max(0, this.invulnerable - deltaTime);

    // Handle temporary skill effects

    // Overload damage boost
    if (this.overloadActive && now >= this.overloadEndTime) {
      this.overloadActive = false;
    }

    // Speed boost
    if (this.speedBoostActive && now >= this.speedBoostEndTime) {
      this.speedBoostActive = false;
    }

    // Smoke screen invisibility
    if (this.smokeScreenActive && now >= this.smokeScreenEndTime) {
      this.smokeScreenActive = false;
    }

    // Divine protection
    if (this.divineProtectionActive && now >= this.divineProtectionEndTime) {
      this.divineProtectionActive = false;
    }

    // Whirlwind active
    if (this.whirlwindActive && now >= this.whirlwindEndTime) {
      this.whirlwindActive = false;
    }

    // Regeneration
    if (this.regen > 0) {
      this.hp = Math.min(this.hp + this.regen * deltaTime, this.currentStats.maxHp);
    }

    // Calculate effective speed (with boosts)
    let effectiveSpeed = this.currentStats.speed;
    if (this.speedBoostActive) {
      effectiveSpeed *= 1.5;
    }

    // Movement
    if (input) {
      const movement = input.getMovement();
      this.vx += movement.dx * effectiveSpeed * deltaTime * 60;
      this.vy += movement.dy * effectiveSpeed * deltaTime * 60;
    }

    // Physics
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Bounds
    this.clampToBounds(canvasWidth, canvasHeight);

    // Rage decay (berserker) - slower during whirlwind
    if (this.buildName === 'berserker' && this.rage > 0) {
      const decayRate = this.whirlwindActive ? 2 : 5;
      this.rage = Math.max(0, this.rage - deltaTime * decayRate);
    }

    // Divine protection - damage immunity
    if (this.divineProtectionActive) {
      this.invulnerable = Math.max(this.invulnerable, 0.1);
    }

    return true;
  }

  // Draw player with glow effects
  draw(ctx) {
    const center = this.getCenter();

    // Shield glow
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

    // Invulnerability flash
    if (this.invulnerable > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Engine thruster effect
    ctx.save();
    ctx.fillStyle = `rgba(100, 200, 255, ${0.5 + Math.sin(Date.now() / 50) * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(center.x, this.y + this.height + 5);
    ctx.lineTo(center.x - 8, this.y + this.height + 15);
    ctx.lineTo(center.x + 8, this.y + this.height + 15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Body with glow
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Inner core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.x + 8, this.y + 8, this.width - 16, this.height - 16);
    ctx.restore();

    // Berserker rage indicator
    if (this.buildName === 'berserker' && this.rage > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 0, 0, ${this.rage / this.maxRage * 0.6})`;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }

    ctx.globalAlpha = 1;

    // Health bar
    this.drawHealthBar(ctx, center.x, this.y - 10, 40, 6);

    // Shield bar (max width capped)
    if (this.shield > 0) {
      ctx.fillStyle = '#4444ff';
      const shieldPercent = Math.min(this.shield / STAT_CAPS.maxShield, 1);
      ctx.fillRect(center.x - 20, this.y - 18, 40 * shieldPercent, 4);
    }

    // Level indicator
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Lv${this.level}`, center.x, this.y + this.height + 12);
  }

  // Draw ability cooldowns
  drawCooldowns(ctx, x, y) {
    const abilities = this.build.abilities;
    const keyLabels = ['[1]', '[2]'];

    abilities.forEach((ability, i) => {
      const cd = this.getCooldown(ability);
      const yPos = y + i * 35;
      const keyLabel = keyLabels[i] || '';

      // Background box
      ctx.fillStyle = cd > 0 ? '#222' : '#1a3a1a';
      ctx.fillRect(x, yPos - 20, 140, 30);

      // Border
      ctx.strokeStyle = cd > 0 ? '#444' : '#4f4';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, yPos - 20, 140, 30);

      // Key label
      ctx.fillStyle = cd > 0 ? '#666' : '#888';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(keyLabel, x + 5, yPos - 8);

      // Ability name
      ctx.fillStyle = cd > 0 ? '#888' : '#fff';
      ctx.font = '11px monospace';
      ctx.fillText(ability.substring(0, 12), x + 30, yPos - 8);

      // Cooldown indicator
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
  }
}

export { Player, BUILDS, STAT_GROWTH, STAT_CAPS, SPEED_SCALE_FACTOR };
