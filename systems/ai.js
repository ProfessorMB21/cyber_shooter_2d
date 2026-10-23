// The AI Controller
//
// It drives one player the way a person would: pick a target, move around
// it, shoot at it, and use an ability when the build says the moment is
// right. Every build gets its own idea of what that moment is.
//
// The controller produces the same input shape the keyboard produces, so
// nothing downstream - the player entity, the combat system, the cooldowns
// - knows or cares whether a person or the AI is in charge.

// How each build fights. `range` is the distance it tries to keep from its
// target, `strafe` is how much it circles while it fights, `stickToParty`
// is how close it stays to the other players, and `aggression` is how hard
// it pushes towards the target rather than away from it.
const BUILD_AI = {
  fighter:      { range: 220, strafe: 0.70, stickToParty: 380, aggression: 0.65 },
  glass_cannon: { range: 300, strafe: 0.80, stickToParty: 380, aggression: 0.55 },
  tank:         { range: 150, strafe: 0.40, stickToParty: 320, aggression: 0.75 },
  balanced:     { range: 210, strafe: 0.60, stickToParty: 360, aggression: 0.65 },
  sniper:       { range: 430, strafe: 0.50, stickToParty: 420, aggression: 0.45 },
  berserker:    { range: 110, strafe: 0.30, stickToParty: 300, aggression: 0.95 },
  guardian:     { range: 190, strafe: 0.50, stickToParty: 200, aggression: 0.50 }
};

// When each ability is worth using. The context carries what the AI can
// see: how hurt it is, how many enemies are close, and how its allies are
// doing.
const ABILITY_RULES = {
  'HEALING SHOT': (c) => c.hpPercent < 0.65,
  'DASH': (c) => (c.closestEnemyDistance < 95 && c.hpPercent < 0.6) || c.surrounding >= 3,
  'OVERLOAD': (c) => c.nearby >= 2 || (c.hpPercent < 0.5 && !!c.target),
  'TELEPORT': (c) => c.hpPercent < 0.35 || c.surrounding >= 3,
  // The shield is a panic button: it goes up when an enemy is on top of
  // the AI, before the damage lands, not after.
  'SHIELD': (c) => c.hpPercent < 0.6 || c.closestEnemyDistance < 80,
  'GROUND SLAM': (c) => c.nearby >= 3,
  'ADRENALINE RUSH': (c) => (c.targetDistance > 380 && c.hpPercent > 0.5) || c.hpPercent < 0.4,
  'SNIPER SHOT': (c) => !!c.target && c.targetDistance < 600,
  'SMOKE SCREEN': (c) => c.hpPercent < 0.5 || c.surrounding >= 3,
  'BERSERK RAGE': (c) => c.hpPercent < 0.5 || (c.rage < 30 && c.nearby >= 1),
  'WHIRLWIND': (c) => c.surrounding >= 3 || c.nearby >= 4,
  'DIVINE PROTECTION': (c) => c.hpPercent < 0.4 || c.surrounding >= 4 || c.allyInDanger
};

class AIController {
  constructor(player, game) {
    this.player = player;
    this.game = game;
    this.config = BUILD_AI[player.buildName] || BUILD_AI.balanced;

    // The enemy being fought. It is kept for a while so the AI does not
    // flip between two equally close enemies every frame.
    this.target = null;
    this.targetTimer = 0;

    // Which way it circles. It changes every couple of seconds so the
    // movement is not a perfect circle.
    this.strafeSign = 1;
    this.strafeTimer = 0;

    this.input = { dx: 0, dy: 0, shoot: false, ability1: false, ability2: false, aim: null };
  }

  // The enemy the AI is fighting. A boss counts for more than a grunt, so
  // it wins if it is not far away.
  updateTarget(deltaTime) {
    this.targetTimer -= deltaTime;
    const stillValid = this.target && !this.target.dead &&
      this.player.distanceTo(this.target) < 900;
    if (stillValid && this.targetTimer > 0) return;
    this.targetTimer = 0.6;

    const enemies = this.game.enemies;
    let best = null;
    let bestDistance = Infinity;
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      const distance = this.player.distanceTo(enemy);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = enemy;
      }
    }
    for (const boss of this.game.bosses) {
      if (boss.dead) continue;
      const distance = this.player.distanceTo(boss);
      if (distance < 700 && distance < bestDistance * 1.4) {
        best = boss;
        bestDistance = distance;
      }
    }
    this.target = best;
  }

  // The other player it is fighting alongside. The local player comes first
  // - the guardian's aura is worth more on the person you are playing than
  // on another AI.
  ally() {
    const game = this.game;
    if (game.player && game.player !== this.player && !game.player.dead) return game.player;
    let best = null;
    let bestDistance = Infinity;
    for (const other of game.players) {
      if (other === this.player || other.dead) continue;
      const distance = this.player.distanceTo(other);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = other;
      }
    }
    return best;
  }

  // What the AI can see: how hurt it is, how many enemies are close, and
  // how its allies are doing.
  buildContext() {
    const player = this.player;
    const game = this.game;
    let nearby = 0;
    let surrounding = 0;
    let closest = Infinity;

    const count = (enemy) => {
      if (enemy.dead) return;
      const distance = player.distanceTo(enemy);
      if (distance < 200) nearby++;
      if (distance < 120) surrounding++;
      if (distance < closest) closest = distance;
    };
    for (const enemy of game.enemies) count(enemy);
    for (const boss of game.bosses) count(boss);

    const ally = this.ally();
    return {
      player,
      target: this.target,
      targetDistance: this.target ? player.distanceTo(this.target) : Infinity,
      hpPercent: player.currentStats.maxHp > 0 ? player.hp / player.currentStats.maxHp : 1,
      nearby,
      surrounding,
      closestEnemyDistance: closest,
      ally,
      allyInDanger: !!ally && ally.currentStats.maxHp > 0 && ally.hp / ally.currentStats.maxHp < 0.35,
      rage: player.rage || 0
    };
  }

  update(deltaTime) {
    const player = this.player;
    const game = this.game;
    const input = this.input;

    input.dx = 0;
    input.dy = 0;
    input.shoot = false;
    input.ability1 = false;
    input.ability2 = false;
    input.aim = null;

    if (player.dead) return input;

    this.updateTarget(deltaTime);

    this.strafeTimer -= deltaTime;
    if (this.strafeTimer <= 0) {
      this.strafeTimer = 1.2 + Math.random() * 1.6;
      this.strafeSign = Math.random() < 0.5 ? -1 : 1;
    }

    const center = player.getCenter();
    const target = this.target;
    const targetCenter = target ? target.getCenter() : null;
    const targetDistance = target ? player.distanceTo(target) : Infinity;

    // --- steering ---------------------------------------------------------
    let fx = 0;
    let fy = 0;
    const add = (x, y, weight) => {
      fx += x * weight;
      fy += y * weight;
    };

    if (targetCenter) {
      const dx = targetCenter.x - center.x;
      const dy = targetCenter.y - center.y;
      const length = Math.hypot(dx, dy) || 1;
      const ux = dx / length;
      const uy = dy / length;
      const range = this.config.range;

      if (targetDistance > range) {
        // Close the distance
        add(ux, uy, this.config.aggression);
      } else if (targetDistance < range * 0.5) {
        // Too close - back off, but not far. Backing off hard enough to
        // keep the enemy at arm's length made the AI untouchable: the
        // enemies could never so much as reach it.
        add(-ux, -uy, 0.5);
      }
      // Circle the target
      add(-uy * this.strafeSign, ux * this.strafeSign, this.config.strafe);
    }

    // Get away from an enemy that is on top of it. This is a panic, not a
    // standing rule - it has to be weak enough that the AI still fights
    // with its back to the wall.
    for (const enemy of game.enemies) {
      if (enemy.dead) continue;
      const distance = player.distanceTo(enemy);
      if (distance < 70 && distance > 0) {
        const ec = enemy.getCenter();
        add((center.x - ec.x) / distance, (center.y - ec.y) / distance, (1 - distance / 70) * 1.0);
      }
    }

    // Stay with the party, but not on top of them
    const ally = this.ally();
    if (ally) {
      const ac = ally.getCenter();
      const distance = player.distanceTo(ally);
      const stick = this.config.stickToParty;
      if (distance > stick) {
        const d = distance || 1;
        add((ac.x - center.x) / d, (ac.y - center.y) / d, Math.min(1, (distance - stick) / 200) * 1.1);
      } else if (distance < 70) {
        const d = distance || 1;
        add((center.x - ac.x) / d, (center.y - ac.y) / d, 0.8);
      }
    }

    // Go for a health pickup when it is hurt
    if (player.currentStats.maxHp > 0 && player.hp / player.currentStats.maxHp < 0.6) {
      let best = null;
      let bestDistance = Infinity;
      for (const pickup of game.pickups) {
        if (pickup.dead || pickup.type !== 'health') continue;
        const distance = player.distanceTo(pickup);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = pickup;
        }
      }
      if (best && bestDistance < 420) {
        const pc = best.getCenter();
        const d = Math.hypot(pc.x - center.x, pc.y - center.y) || 1;
        add((pc.x - center.x) / d, (pc.y - center.y) / d, 0.9);
      }
    }

    // Stay off the edges
    const margin = 80;
    if (center.x < margin) add(1, 0, (margin - center.x) / margin);
    if (center.x > game.worldWidth - margin) add(-1, 0, (center.x - (game.worldWidth - margin)) / margin);
    if (center.y < margin) add(0, 1, (margin - center.y) / margin);
    if (center.y > game.worldHeight - margin) add(0, -1, (center.y - (game.worldHeight - margin)) / margin);

    const magnitude = Math.hypot(fx, fy);
    if (magnitude > 0.001) {
      input.dx = fx / magnitude;
      input.dy = fy / magnitude;
    }

    // --- shooting ---------------------------------------------------------
    if (target && targetDistance < 700) {
      input.shoot = true;
      input.aim = Math.atan2(targetCenter.y - center.y, targetCenter.x - center.x);
    }

    // --- abilities --------------------------------------------------------
    const context = this.buildContext();
    const abilities = player.build.abilities;
    for (let slot = 0; slot < abilities.length; slot++) {
      const name = abilities[slot];
      if (player.getCooldown(name) > 0) continue;
      const rule = ABILITY_RULES[name];
      if (!rule || !rule(context)) continue;
      if (slot === 0) input.ability1 = true;
      else if (slot === 1) input.ability2 = true;
    }

    return input;
  }
}

export { AIController, BUILD_AI, ABILITY_RULES };
