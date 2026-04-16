// Player Abilities System

class PlayerAbilities {
  constructor(player) {
    this.player = player;
    this.cooldowns = player.cooldowns;
  }

  // Activate ability by name
  activate(abilityName) {
    const now = Date.now();

    switch (abilityName) {
      // Fighter abilities
      case 'HEALING SHOT':
        return this.healingShot(now);
      case 'DASH':
        return this.dash(now);

      // Glass Cannon abilities
      case 'OVERLOAD':
        return this.overload(now);
      case 'TELEPORT':
        return this.teleport(now);

      // Tank abilities
      case 'SHIELD':
        return this.shield(now);
      case 'GROUND SLAM':
        return this.groundSlam(now);

      // Balanced abilities
      case 'ADRENALINE RUSH':
        return this.adrenalineRush(now);

      // Sniper abilities
      case 'SNIPER SHOT':
        return this.sniperShot(now);
      case 'SMOKE SCREEN':
        return this.smokeScreen(now);

      // Berserker abilities
      case 'BERSERK RAGE':
        return this.berserkRage(now);
      case 'WHIRLWIND':
        return this.whirlwind(now);

      // Guardian abilities
      case 'DIVINE PROTECTION':
        return this.divineProtection(now);
    }
    return { activated: false };
  }

  // Fighter: Healing Shot
  healingShot(now) {
    if (!this.cooldowns.healingShot || now > this.cooldowns.healingShot) {
      this.player.heal(this.player.currentStats.maxHp * 0.25);
      this.cooldowns.healingShot = now + 6000;
      return { activated: true, effect: 'heal', value: this.player.currentStats.maxHp * 0.25 };
    }
    return { activated: false };
  }

  // Fighter: Dash
  dash(now) {
    if (!this.cooldowns.dash || now > this.cooldowns.dash) {
      this.cooldowns.dash = now + 4000;
      this.player.invulnerable = 0.3;
      return { activated: true, effect: 'dash', duration: 0.2 };
    }
    return { activated: false };
  }

  // Glass Cannon: Overload
  overload(now) {
    if (!this.cooldowns.overload || now > this.cooldowns.overload) {
      this.player.overloadActive = true;
      this.player.overloadEndTime = now + 5000;
      this.cooldowns.overload = now + 15000;
      return { activated: true, effect: 'damage_boost', multiplier: 2, duration: 5 };
    }
    return { activated: false };
  }

  // Glass Cannon: Teleport
  teleport(now) {
    if (!this.cooldowns.teleport || now > this.cooldowns.teleport) {
      this.cooldowns.teleport = now + 12000;
      this.player.invulnerable = 0.5;
      return { activated: true, effect: 'teleport' };
    }
    return { activated: false };
  }

  // Tank: Shield
  shield(now) {
    if (!this.cooldowns.shield || now > this.cooldowns.shield) {
      const shieldValue = 100;
      this.player.addShield(shieldValue);
      this.cooldowns.shield = now + 10000;
      return { activated: true, effect: 'shield', value: shieldValue };
    }
    return { activated: false };
  }

  // Tank: Ground Slam
  groundSlam(now) {
    if (!this.cooldowns.groundSlam || now > this.cooldowns.groundSlam) {
      this.cooldowns.groundSlam = now + 8000;
      return { activated: true, effect: 'aoe_damage', damage: this.player.currentStats.damage * 3, radius: 150 };
    }
    return { activated: false };
  }

  // Balanced: Adrenaline Rush
  adrenalineRush(now) {
    if (!this.cooldowns.adrenalineRush || now > this.cooldowns.adrenalineRush) {
      this.player.speedBoostActive = true;
      this.player.speedBoostEndTime = now + 4000;
      this.cooldowns.adrenalineRush = now + 12000;
      return { activated: true, effect: 'speed_boost', multiplier: 1.5, duration: 4 };
    }
    return { activated: false };
  }

  // Sniper: Sniper Shot
  sniperShot(now) {
    if (!this.cooldowns.sniperShot || now > this.cooldowns.sniperShot) {
      this.player.nextShotCrit = true;
      this.player.nextShotPiercing = true;
      this.cooldowns.sniperShot = now + 10000;
      return { activated: true, effect: 'crit_shot' };
    }
    return { activated: false };
  }

  // Sniper: Smoke Screen
  smokeScreen(now) {
    if (!this.cooldowns.smokeScreen || now > this.cooldowns.smokeScreen) {
      this.player.smokeScreenActive = true;
      this.player.smokeScreenEndTime = now + 3000;
      this.cooldowns.smokeScreen = now + 15000;
      return { activated: true, effect: 'invisibility', duration: 3 };
    }
    return { activated: false };
  }

  // Berserker: Berserk Rage
  berserkRage(now) {
    if (!this.cooldowns.berserkRage || now > this.cooldowns.berserkRage) {
      this.player.rage = this.player.maxRage;
      this.cooldowns.berserkRage = now + 12000;
      return { activated: true, effect: 'max_rage' };
    }
    return { activated: false };
  }

  // Berserker: Whirlwind
  whirlwind(now) {
    if (!this.cooldowns.whirlwind || now > this.cooldowns.whirlwind) {
      this.player.whirlwindActive = true;
      this.player.whirlwindEndTime = now + 2000;
      this.cooldowns.whirlwind = now + 10000;
      return { activated: true, effect: 'whirlwind', damage: this.player.currentStats.damage, duration: 2 };
    }
    return { activated: false };
  }

  // Guardian: Divine Protection
  divineProtection(now) {
    if (!this.cooldowns.divineProtection || now > this.cooldowns.divineProtection) {
      this.player.heal(this.player.currentStats.maxHp * 0.5);
      this.player.divineProtectionActive = true;
      this.player.divineProtectionEndTime = now + 2000;
      this.cooldowns.divineProtection = now + 20000;
      return { activated: true, effect: 'damage_immunity', duration: 2 };
    }
    return { activated: false };
  }
}

export { PlayerAbilities };
