// Collision System

import { Projectile } from '../entities/projectile.js';

class CollisionSystem {
  constructor(game) {
    this.game = game;
  }

  checkProjectileCollisions(p, deltaTime) {
    if (p.isPlayer) {
      this.checkPlayerProjectileCollisions(p);
    } else {
      this.checkEnemyProjectileCollisions(p, deltaTime);
    }
  }

  checkPlayerProjectileCollisions(p) {
    // Player projectile hits enemies
    this.game.enemies.forEach(e => {
      if (!p.hits.includes(e) && !e.dead) {
        const dx = p.x - e.getCenter().x;
        const dy = p.y - e.getCenter().y;
        if (dx * dx + dy * dy < (p.size + e.width / 2) ** 2) {
          e.takeDamage(p.damage);
          if (!p.piercing) p.dead = true;
          else p.hits.push(e);
          if (e.dead) this.game.onKill(e);
        }
      }
    });

    // Player projectile hits bosses
    this.game.bosses.forEach(b => {
      if (!p.hits.includes(b) && !b.dead) {
        const dx = p.x - b.getCenter().x;
        const dy = p.y - b.getCenter().y;
        if (dx * dx + dy * dy < (p.size + 25) ** 2) {
          b.takeDamage(p.damage);
          if (!p.piercing) p.dead = true;
          else p.hits.push(b);
          if (b.dead) this.game.onBossKill(b);
        }
      }
    });
  }

  checkEnemyProjectileCollisions(p, deltaTime) {
    const pc = this.game.player.getCenter();
    const dx = p.x - pc.x;
    const dy = p.y - pc.y;
    if (dx * dx + dy * dy < (p.size + 15) ** 2) {
      if (p.aoe) {
        this.game.player.takeDamage(p.damage * deltaTime * 5);
        this.game.addShake(1.5);
      } else {
        this.game.player.takeDamage(p.damage);
        this.game.addShake(1);
        p.dead = true;
      }
    }
  }

  handleBossAttack(b) {
    const projectiles = b.getProjectiles(this.game.player);
    projectiles.forEach(p => {
      this.game.projectiles.push(new Projectile(
        p.x, p.y, p.vx, p.vy, p.damage, p.color, false,
        { size: p.size, piercing: p.piercing, aoe: p.aoe, expand: p.expand, maxSize: p.maxSize, duration: p.duration }
      ));
    });
  }
}

export { CollisionSystem };
