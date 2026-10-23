// Core Combat System

import { Projectile } from '../entities/projectile.js';

// The direction a shot travels when nobody asks for a different one: straight
// up. Angles are in radians, 0 is right and -PI/2 is up.
const STRAIGHT_UP = -Math.PI / 2;
const SHOT_SPEED = 400;

class CombatSystem {
  constructor(game) {
    this.game = game;
  }

  // `player` is whoever is shooting. `aim` is the angle to shoot at, or
  // null for straight up - the local player shoots straight up, the AI
  // aims at a target.
  playerShoot(player, aim = null) {
    const shooter = player || this.game.player;
    if (!shooter) return;

    let damage = shooter.getDamage();

    // Apply overload bonus if active
    const now = Date.now();
    if (shooter.overloadActive && now < shooter.overloadEndTime) {
      damage *= 2;
    } else {
      shooter.overloadActive = false;
    }

    const center = shooter.getCenter();

    // Muzzle flash effect
    this.game.particles.spawnExplosion(center.x, center.y - 20, 5, '#ffff00', 0.1);

    // Light recoil shake, in pixels
    this.game.addShake(1.5);

    // Check for piercing
    const piercing = shooter.nextShotPiercing || false;
    shooter.nextShotPiercing = false;

    // The local player's shots are yellow. Everyone else's are in their own
    // colour, so you can tell whose bullets are whose.
    const color = shooter === this.game.player ? '#ffff00' : shooter.color;

    const angle = aim === null || aim === undefined ? STRAIGHT_UP : aim;
    const vx = Math.cos(angle) * SHOT_SPEED;
    const vy = Math.sin(angle) * SHOT_SPEED;

    // Base shot
    this.game.projectiles.push(new Projectile(
      center.x, center.y - 20,
      vx, vy,
      damage, color, true,
      { size: 6, piercing, bounds: this.game.worldBounds }
    ));

    // Multishot
    const projectileCount = shooter.currentStats.projectileCount || 1;
    if (projectileCount > 1) {
      for (let i = 1; i < projectileCount; i++) {
        const offset = (i % 2 === 1 ? 1 : -1) * Math.ceil(i / 2) * 0.2;
        const spread = angle + offset;
        this.game.projectiles.push(new Projectile(
          center.x, center.y - 20,
          Math.cos(spread) * SHOT_SPEED, Math.sin(spread) * SHOT_SPEED,
          damage, color, true,
          { size: 6, piercing, bounds: this.game.worldBounds }
        ));
      }
    }

    shooter.shootCooldown = 0.25;
  }

  // `player` is whoever is using the ability and `input` is the input that
  // triggered it - the dash needs to know which way the player is moving.
  activateSkill(slot, player = null, input = null) {
    const user = player || this.game.player;
    if (!user || !user.build.abilities[slot]) return null;

    const abilityName = user.build.abilities[slot];
    const result = user.activateAbility(abilityName);
    if (!result || !result.activated) return result;

    const center = user.getCenter();

    // Handle effects that need game context
    switch (result.effect) {
      case 'dash': {
        // Dash forward
        const movement = input && input.dx !== undefined
          ? input
          : (this.game.input ? this.game.input.getMovement() : { dx: 0, dy: 0 });
        const dashSpeed = 800;
        if (movement.dx !== 0 || movement.dy !== 0) {
          user.vx += movement.dx * dashSpeed;
          user.vy += movement.dy * dashSpeed;
        } else {
          // Dash upward if not moving
          user.vy -= dashSpeed;
        }
        // Trail effect
        this.game.particles.spawnExplosion(center.x, center.y, 10, '#00ffff', 0.3);
        break;
      }

      case 'teleport':
        // Teleport to random safe position
        user.x = Math.random() * (this.game.worldWidth - 100) + 50;
        user.y = Math.random() * (this.game.worldHeight * 0.5) + this.game.worldHeight * 0.3;
        this.game.particles.spawnExplosion(center.x, center.y, 15, '#ff00ff', 0.5);
        break;

      case 'aoe_damage': {
        // Deal damage to all nearby enemies
        const aoeRadius = result.radius;
        this.game.enemies.forEach(e => {
          const dist = user.distanceTo(e);
          if (dist < aoeRadius) {
            e.takeDamage(result.damage * (1 - dist / aoeRadius));
            if (e.dead) this.game.onKill(e);
          }
        });
        // Visual effect
        this.game.particles.spawnExplosion(center.x, center.y, 20, '#ff8800', 0.5);
        this.game.addShake(9);
        break;
      }

      case 'whirlwind':
        // Whirlwind visual
        this.game.particles.spawnExplosion(center.x, center.y, 15, '#ff0000', 0.5);
        break;

      case 'heal':
      case 'shield':
      case 'damage_boost':
      case 'speed_boost':
      case 'crit_shot':
      case 'invisibility':
      case 'max_rage':
      case 'damage_immunity':
        // These are handled internally by the player
        break;
    }

    return result;
  }

  enemyShoot(enemy, target) {
    const center = enemy.getCenter();
    const tc = target.getCenter ? target.getCenter() : { x: target.x, y: target.y };
    const angle = Math.atan2(tc.y - center.y, tc.x - center.x);

    this.game.projectiles.push(new Projectile(
      center.x, center.y,
      Math.cos(angle) * 200, Math.sin(angle) * 200,
      enemy.damage, '#ff4444', false,
      { size: 5, bounds: this.game.worldBounds }
    ));
  }
}

export { CombatSystem };
