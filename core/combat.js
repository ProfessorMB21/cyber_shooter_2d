// Core Combat System

import { Projectile } from '../entities/projectile.js';

class CombatSystem {
  constructor(game) {
    this.game = game;
  }

  playerShoot() {
    let damage = this.game.player.getDamage();

    // Apply overload bonus if active
    const now = Date.now();
    if (this.game.player.overloadActive && now < this.game.player.overloadEndTime) {
      damage *= 2;
    } else {
      this.game.player.overloadActive = false;
    }

    const center = this.game.player.getCenter();

    // Muzzle flash effect
    this.game.particles.spawnExplosion(center.x, center.y - 20, 5, '#ffff00', 0.1);

    // Light recoil shake
    this.game.addShake(0.5);

    // Check for piercing
    const piercing = this.game.player.nextShotPiercing || false;
    this.game.player.nextShotPiercing = false;

    // Base shot
    this.game.projectiles.push(new Projectile(
      center.x, center.y - 20,
      0, -400,
      damage, '#ffff00', true, { size: 6, piercing }
    ));

    // Multishot
    const projectileCount = this.game.player.currentStats.projectileCount || 1;
    if (projectileCount > 1) {
      for (let i = 1; i < projectileCount; i++) {
        const angle = (i % 2 === 1 ? 1 : -1) * Math.ceil(i / 2) * 0.2;
        this.game.projectiles.push(new Projectile(
          center.x, center.y - 20,
          Math.sin(angle) * 400, -Math.cos(angle) * 400,
          damage, '#ffff00', true, { size: 6, piercing }
        ));
      }
    }

    this.game.player.shootCooldown = 0.25;
  }

  activateSkill(slot) {
    if (!this.game.player || !this.game.player.build.abilities[slot]) return;

    const abilityName = this.game.player.build.abilities[slot];
    const result = this.game.player.activateAbility(abilityName);

    if (result && result.activated) {
      const center = this.game.player.getCenter();

      // Handle effects that need game context
      switch (result.effect) {
        case 'dash':
          // Dash forward
          const movement = this.game.input.getMovement();
          const dashSpeed = 800;
          if (movement.dx !== 0 || movement.dy !== 0) {
            this.game.player.vx += movement.dx * dashSpeed;
            this.game.player.vy += movement.dy * dashSpeed;
          } else {
            // Dash upward if not moving
            this.game.player.vy -= dashSpeed;
          }
          // Trail effect
          this.game.particles.spawnExplosion(center.x, center.y, 10, '#00ffff', 0.3);
          break;

        case 'teleport':
          // Teleport to random safe position
          this.game.player.x = Math.random() * (this.game.width - 100) + 50;
          this.game.player.y = Math.random() * (this.game.height * 0.5) + this.game.height * 0.3;
          this.game.particles.spawnExplosion(center.x, center.y, 15, '#ff00ff', 0.5);
          break;

        case 'aoe_damage':
          // Deal damage to all nearby enemies
          const aoeRadius = result.radius;
          this.game.enemies.forEach(e => {
            const dist = this.game.player.distanceTo(e);
            if (dist < aoeRadius) {
              e.takeDamage(result.damage * (1 - dist / aoeRadius));
              if (e.dead) this.game.onKill(e);
            }
          });
          // Visual effect
          this.game.particles.spawnExplosion(center.x, center.y, 20, '#ff8800', 0.5);
          this.game.addShake(2);
          break;

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
    }
  }

  enemyShoot(enemy, target) {
    const center = enemy.getCenter();
    const tc = target.getCenter ? target.getCenter() : { x: target.x, y: target.y };
    const angle = Math.atan2(tc.y - center.y, tc.x - center.x);

    this.game.projectiles.push(new Projectile(
      center.x, center.y,
      Math.cos(angle) * 200, Math.sin(angle) * 200,
      enemy.damage, '#ff4444', false, { size: 5 }
    ));
  }
}

export { CombatSystem };
