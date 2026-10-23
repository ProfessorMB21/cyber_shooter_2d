// Player Abilities System

class PlayerAbilities {
  constructor(player) {
    this.player = player;
    this.cooldowns = player.cooldowns;
  }

  // Start a cooldown, shortened by the player's cooldown reduction. The
  // reduction is applied to the whole cooldown rather than to the readout,
  // so the ability really does come back sooner.
  setCooldown(abilityName, now, durationMs) {
    const reduction = this.player.cooldownReduction || 0;
    this.cooldowns[this.player.cooldownKey(abilityName)] = now + durationMs * (1 - reduction);
  }

  // Whether the ability is off cooldown.
  //
  // The key has to be the one `setCooldown()` writes - the name lowercased
  // with the spaces stripped - or the ability never sees its own cooldown
  // and fires again on every press while the readout counts it down.
  isReady(abilityName, now) {
    const until = this.cooldowns[this.player.cooldownKey(abilityName)];
    return !until || now > until;
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
    if (this.isReady('HEALING SHOT', now)) {
      this.player.heal(this.player.currentStats.maxHp * 0.25);
      this.setCooldown('HEALING SHOT', now, 6000);
      return { activated: true, effect: 'heal', value: this.player.currentStats.maxHp * 0.25 };
    }
    return { activated: false };
  }

  // Fighter: Dash
  dash(now) {
    if (this.isReady('DASH', now)) {
      this.setCooldown('DASH', now, 4000);
      this.player.invulnerable = 0.3;
      return { activated: true, effect: 'dash', duration: 0.2 };
    }
    return { activated: false };
  }

  // Glass Cannon: Overload
  overload(now) {
    if (this.isReady('OVERLOAD', now)) {
      this.player.overloadActive = true;
      this.player.overloadEndTime = now + 5000;
      this.setCooldown('OVERLOAD', now, 15000);
      return { activated: true, effect: 'damage_boost', multiplier: 2, duration: 5 };
    }
    return { activated: false };
  }

  // Glass Cannon: Teleport
  teleport(now) {
    if (this.isReady('TELEPORT', now)) {
      this.setCooldown('TELEPORT', now, 12000);
      this.player.invulnerable = 0.5;
      return { activated: true, effect: 'teleport' };
    }
    return { activated: false };
  }

  // Tank: Shield
  shield(now) {
    if (this.isReady('SHIELD', now)) {
      const shieldValue = 100;
      this.player.addShield(shieldValue);
      this.setCooldown('SHIELD', now, 10000);
      return { activated: true, effect: 'shield', value: shieldValue };
    }
    return { activated: false };
  }

  // Tank: Ground Slam
  groundSlam(now) {
    if (this.isReady('GROUND SLAM', now)) {
      this.setCooldown('GROUND SLAM', now, 8000);
      return { activated: true, effect: 'aoe_damage', damage: this.player.currentStats.damage * 3, radius: 150 };
    }
    return { activated: false };
  }

  // Balanced: Adrenaline Rush
  adrenalineRush(now) {
    if (this.isReady('ADRENALINE RUSH', now)) {
      this.player.speedBoostActive = true;
      this.player.speedBoostEndTime = now + 4000;
      this.setCooldown('ADRENALINE RUSH', now, 12000);
      return { activated: true, effect: 'speed_boost', multiplier: 1.5, duration: 4 };
    }
    return { activated: false };
  }

  // Sniper: Sniper Shot
  sniperShot(now) {
    if (this.isReady('SNIPER SHOT', now)) {
      this.player.nextShotCrit = true;
      this.player.nextShotPiercing = true;
      this.setCooldown('SNIPER SHOT', now, 10000);
      return { activated: true, effect: 'crit_shot' };
    }
    return { activated: false };
  }

  // Sniper: Smoke Screen
  smokeScreen(now) {
    if (this.isReady('SMOKE SCREEN', now)) {
      this.player.smokeScreenActive = true;
      this.player.smokeScreenEndTime = now + 3000;
      this.setCooldown('SMOKE SCREEN', now, 15000);
      return { activated: true, effect: 'invisibility', duration: 3 };
    }
    return { activated: false };
  }

  // Berserker: Berserk Rage
  berserkRage(now) {
    if (this.isReady('BERSERK RAGE', now)) {
      this.player.rage = this.player.maxRage;
      this.setCooldown('BERSERK RAGE', now, 12000);
      return { activated: true, effect: 'max_rage' };
    }
    return { activated: false };
  }

  // Berserker: Whirlwind
  whirlwind(now) {
    if (this.isReady('WHIRLWIND', now)) {
      this.player.whirlwindActive = true;
      this.player.whirlwindEndTime = now + 2000;
      this.setCooldown('WHIRLWIND', now, 10000);
      return { activated: true, effect: 'whirlwind', damage: this.player.currentStats.damage, duration: 2 };
    }
    return { activated: false };
  }

  // Guardian: Divine Protection
  divineProtection(now) {
    if (this.isReady('DIVINE PROTECTION', now)) {
      this.player.heal(this.player.currentStats.maxHp * 0.5);
      this.player.divineProtectionActive = true;
      this.player.divineProtectionEndTime = now + 2000;
      this.setCooldown('DIVINE PROTECTION', now, 20000);
      return { activated: true, effect: 'damage_immunity', duration: 2 };
    }
    return { activated: false };
  }
}

export { PlayerAbilities };
