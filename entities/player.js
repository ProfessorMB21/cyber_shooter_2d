// Player Entity with Stats and Level System

import { Entity } from '../systems/entity.js';

// Player Builds Configuration
const BUILDS = {
  fighter: {
    name: 'Fighter',
    description: 'Balanced with high health and damage',
    color: '#00ff00',
    stats: {
      hp: 500,
      maxHp: 500,
      damage: 20,
      speed: 3,
      armor: 20,
      evasion: 5,
      criticalChance: 0,
      criticalDamage: 1.0,
      regen: 2,
      cooldown: 1
    },
    abilities: ['HEALING SHOT'],
    passive: 'Toughen Up - 10% HP gain per level'
  },
  glass_cannon: {
    name: 'Glass Cannon',
    description: 'Extreme damage but fragile',
    color: '#ff00ff',
    stats: {
      hp: 280,
      maxHp: 280,
      damage: 65,
      speed: 5,
      armor: 5,
      evasion: 15,
      criticalChance: 0.20,
      criticalDamage: 2.0,
      regen: 1,
      cooldown: 1
    },
    abilities: ['HEALING SHOT'],
    passive: 'Overclock - 12% damage per level'
  },
  tank: {
    name: 'Tank',
    description: 'Massive health pool, slow',
    color: '#4444ff',
    stats: {
      hp: 800,
      maxHp: 800,
      damage: 15,
      speed: 2,
      armor: 60,
      evasion: 0,
      criticalChance: 0,
      criticalDamage: 0,
      regen: 3,
      cooldown: 1
    },
    abilities: ['SHIELD'],
    passive: 'Iron Skin - 15% HP gain per level'
  },
  balanced: {
    name: 'Balanced',
    description: 'Versatile all-rounder',
    color: '#ffff00',
    stats: {
      hp: 450,
      maxHp: 450,
      damage: 28,
      speed: 4,
      armor: 25,
      evasion: 12,
      criticalChance: 0.10,
      criticalDamage: 1.5,
      regen: 2,
      cooldown: 1
    },
    abilities: ['SHIELD'],
    passive: 'Adaptability - 8% all stats per level'
  },
  sniper: {
    name: 'Sniper',
    description: 'High crit chance, precision attacks',
    color: '#00ffff',
    stats: {
      hp: 320,
      maxHp: 320,
      damage: 25,
      speed: 4,
      armor: 15,
      evasion: 20,
      criticalChance: 0.25,
      criticalDamage: 2.5,
      regen: 1.5,
      cooldown: 1
    },
    abilities: ['SNIPER SHOT'],
    passive: 'Sharpshooter - 10% crit chance per level'
  },
  berserker: {
    name: 'Berserker',
    description: 'Rage builds over time',
    color: '#ff0000',
    stats: {
      hp: 480,
      maxHp: 480,
      damage: 35,
      speed: 4.5,
      armor: 18,
      evasion: 10,
      criticalChance: 0.18,
      criticalDamage: 2.2,
      regen: 1.8,
      cooldown: 1
    },
    abilities: ['BERSERK RAGE'],
    passive: 'Adrenaline - 10% damage per rage, max 150%'
  },
  guardian: {
    name: 'Guardian',
    description: 'High armor, support capabilities',
    color: '#888888',
    stats: {
      hp: 650,
      maxHp: 650,
      damage: 18,
      speed: 3,
      armor: 55,
      evasion: 8,
      criticalChance: 0,
      criticalDamage: 0,
      regen: 3,
      cooldown: 1
    },
    abilities: ['SHIELD', 'REVIVE'],
    passive: 'Protector - 12% armor per level'
  }
};

// Stat growth per level
const STAT_GROWTH = {
  hpMultiplier: 1.1,
  damageMultiplier: 1.08,
  armorMultiplier: 1.05,
  speedMultiplier: 1.02,
  cap: 100
};

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
      speed: build.stats.speed * 80, // Scale speed for game
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
        this.currentStats.maxHp = Math.floor(this.baseStats.maxHp * (1 + (this.level - 1) * 0.1));
        break;
      case 'glass_cannon':
        this.currentStats.damage = Math.floor(this.baseStats.damage * (1 + (this.level - 1) * 0.12));
        break;
      case 'tank':
        this.currentStats.maxHp = Math.floor(this.baseStats.maxHp * (1 + (this.level - 1) * 0.15));
        this.currentStats.armor = Math.floor(this.baseStats.armor * (1 + (this.level - 1) * 0.05));
        break;
      case 'balanced':
        this.currentStats.maxHp = Math.floor(this.baseStats.maxHp * (1 + (this.level - 1) * 0.08));
        this.currentStats.damage = Math.floor(this.baseStats.damage * (1 + (this.level - 1) * 0.08));
        this.currentStats.armor = Math.floor(this.baseStats.armor * (1 + (this.level - 1) * 0.08));
        break;
      case 'sniper':
        this.criticalChance = Math.min(1, this.baseStats.criticalChance + (this.level - 1) * 0.1);
        break;
      case 'berserker':
        // Rage-based scaling applied during update
        break;
      case 'guardian':
        this.currentStats.armor = Math.floor(this.baseStats.armor * (1 + (this.level - 1) * 0.12));
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

  // Add shield
  addShield(amount) {
    this.shield += amount;
  }

  // Activate ability
  activateAbility(abilityName) {
    const now = Date.now();

    switch (abilityName) {
      case 'HEALING SHOT':
        if (!this.cooldowns.healingShot || now > this.cooldowns.healingShot) {
          this.heal(this.currentStats.maxHp * 0.2);
          this.cooldowns.healingShot = now + 10000; // 10 seconds
          return true;
        }
        break;
      case 'SHIELD':
        if (!this.cooldowns.shield || now > this.cooldowns.shield) {
          this.addShield(100);
          this.cooldowns.shield = now + 15000; // 15 seconds
          return true;
        }
        break;
      case 'SNIPER SHOT':
        if (!this.cooldowns.sniperShot || now > this.cooldowns.sniperShot) {
          // Guaranteed crit next shot
          this.nextShotCrit = true;
          this.cooldowns.sniperShot = now + 20000; // 20 seconds
          return true;
        }
        break;
      case 'BERSERK RAGE':
        if (!this.cooldowns.berserkRage || now > this.cooldowns.berserkRage) {
          this.rage = this.maxRage;
          this.cooldowns.berserkRage = now + 30000; // 30 seconds
          return true;
        }
        break;
      case 'REVIVE':
        // Passive - auto-trigger on death
        break;
    }
    return false;
  }

  // Get cooldown remaining (seconds)
  getCooldown(abilityName) {
    const now = Date.now();
    const cooldown = this.cooldowns[abilityName.toLowerCase().replace(' ', '')];
    if (!cooldown) return 0;
    return Math.max(0, (cooldown - now) / 1000);
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
    // Update cooldowns
    this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);
    this.invulnerable = Math.max(0, this.invulnerable - deltaTime);

    // Regeneration
    if (this.regen > 0) {
      this.hp = Math.min(this.hp + this.regen * deltaTime, this.currentStats.maxHp);
    }

    // Movement
    if (input) {
      const movement = input.getMovement();
      this.vx += movement.dx * this.currentStats.speed * deltaTime * 60;
      this.vy += movement.dy * this.currentStats.speed * deltaTime * 60;
    }

    // Physics
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Bounds
    this.clampToBounds(canvasWidth, canvasHeight);

    // Rage decay (berserker)
    if (this.buildName === 'berserker' && this.rage > 0) {
      this.rage = Math.max(0, this.rage - deltaTime * 5);
    }

    return true;
  }

  // Draw player
  draw(ctx) {
    // Shield glow
    if (this.shield > 0) {
      ctx.strokeStyle = '#4444ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.getCenter().x, this.getCenter().y, 22, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Invulnerability flash
    if (this.invulnerable > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Berserker rage indicator
    if (this.buildName === 'berserker' && this.rage > 0) {
      ctx.fillStyle = `rgba(255, 0, 0, ${this.rage / this.maxRage * 0.5})`;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    ctx.globalAlpha = 1;

    // Health bar
    const center = this.getCenter();
    this.drawHealthBar(ctx, center.x, this.y - 10, 40, 6);

    // Shield bar
    if (this.shield > 0) {
      ctx.fillStyle = '#4444ff';
      ctx.fillRect(center.x - 20, this.y - 18, 40 * (this.shield / 200), 4);
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
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    abilities.forEach((ability, i) => {
      const cd = this.getCooldown(ability);
      const yPos = y + i * 20;

      if (cd > 0) {
        ctx.fillStyle = '#666';
        ctx.fillText(`${ability}: ${cd.toFixed(1)}s`, x, yPos);
      } else {
        ctx.fillStyle = '#4f4';
        ctx.fillText(`${ability}: READY`, x, yPos);
      }
    });
  }
}

export { Player, BUILDS, STAT_GROWTH };
