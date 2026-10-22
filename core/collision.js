// Collision System

import { nearestTo } from '../systems/entity.js';
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
    // Hot path: this runs for every projectile against every enemy each
    // frame, so it avoids getCenter() (which allocates) and stops at the
    // first hit for non-piercing shots.
    const enemies = this.game.enemies;
    for (let i = 0; i < enemies.length; i++) {
      if (p.dead) break;
      const e = enemies[i];
      if (e.dead || p.hits.includes(e)) continue;

      const dx = p.x - (e.x + e.width / 2);
      const dy = p.y - (e.y + e.height / 2);
      const radius = p.size + e.width / 2;
      if (dx * dx + dy * dy < radius * radius) {
        e.takeDamage(p.damage);
        if (!p.piercing) p.dead = true;
        else p.hits.push(e);
        if (e.dead) this.game.onKill(e);
      }
    }

    // Player projectile hits bosses
    const bosses = this.game.bosses;
    for (let i = 0; i < bosses.length; i++) {
      if (p.dead) break;
      const b = bosses[i];
      if (b.dead || p.hits.includes(b)) continue;

      const dx = p.x - (b.x + b.width / 2);
      const dy = p.y - (b.y + b.height / 2);
      const radius = p.size + 25;
      if (dx * dx + dy * dy < radius * radius) {
        b.takeDamage(p.damage);
        if (!p.piercing) p.dead = true;
        else p.hits.push(b);
        if (b.dead) this.game.onBossKill(b);
      }
    }
  }

  checkEnemyProjectileCollisions(p, deltaTime) {
    const players = this.game.players;
    // No players means no run in progress (e.g. after quitting to the menu)
    if (!players || players.length === 0) return;

    // A shot can hit any of the players in the run. It stops at the first
    // one it reaches, so it cannot damage two of them at once.
    for (const player of players) {
      if (player.dead) continue;
      const dx = p.x - (player.x + player.width / 2);
      const dy = p.y - (player.y + player.height / 2);
      const radius = p.size + 15;
      if (dx * dx + dy * dy < radius * radius) {
        if (p.aoe) {
          player.takeDamage(p.damage * deltaTime * 5);
          this.game.addShake(1.5);
        } else {
          player.takeDamage(p.damage);
          this.game.addShake(1);
          p.dead = true;
        }
        break;
      }
    }
  }

  handleBossAttack(b) {
    // The boss aims at whoever is closest.
    const target = nearestTo(b.x, b.y, this.game.players) || this.game.player;
    const projectiles = b.getProjectiles(target);
    projectiles.forEach(p => {
      this.game.projectiles.push(new Projectile(
        p.x, p.y, p.vx, p.vy, p.damage, p.color, false,
        {
          size: p.size,
          piercing: p.piercing,
          aoe: p.aoe,
          expand: p.expand,
          maxSize: p.maxSize,
          duration: p.duration,
          bounds: this.game.worldBounds
        }
      ));
    });
  }
}

export { CollisionSystem };
