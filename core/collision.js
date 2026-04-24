// Collision System - Enhanced with visual effects

class CollisionSystem {
  constructor(game) {
    this.game = game;
  }

  // Check projectile collisions
  checkProjectileCollisions(projectile, deltaTime) {
    if (projectile.isPlayer) {
      // Player projectile hitting enemies
      for (const enemy of this.game.enemies) {
        if (this.checkCircleRectCollision(
          projectile.x, projectile.y, projectile.size,
          enemy.x, enemy.y, enemy.width, enemy.height
        )) {
          const damage = projectile.damage;
          const isCrit = projectile.isCrit;
          enemy.takeDamage(damage);
          
          // Visual feedback
          this.game.visuals.addDamageNumber(
            enemy.getCenter().x, 
            enemy.getCenter().y, 
            damage, 
            isCrit
          );
          this.game.visuals.addHitMarker(
            projectile.x, 
            projectile.y, 
            enemy.hp <= 0
          );
          
          if (!projectile.piercing) {
            projectile.life = 0;
          }
          
          if (enemy.hp <= 0 && !enemy.dead) {
            enemy.dead = true;
            this.game.onKill(enemy);
            this.game.particles.spawnExplosion(
              enemy.getCenter().x,
              enemy.getCenter().y,
              20,
              enemy.color
            );
            this.game.addShake(2);
          }
          break;
        }
      }

      // Check bosses
      for (const boss of this.game.bosses) {
        if (this.checkCircleRectCollision(
          projectile.x, projectile.y, projectile.size,
          boss.x, boss.y, boss.width, boss.height
        )) {
          const damage = projectile.damage;
          const isCrit = projectile.isCrit;
          boss.takeDamage(damage);
          
          this.game.visuals.addDamageNumber(
            boss.getCenter().x,
            boss.getCenter().y,
            damage,
            isCrit
          );
          
          if (!projectile.piercing) {
            projectile.life = 0;
          }
          
          if (boss.hp <= 0 && !boss.dead) {
            boss.dead = true;
            this.game.onBossKill(boss);
            this.game.particles.spawnExplosion(
              boss.getCenter().x,
              boss.getCenter().y,
              50,
              boss.color
            );
            this.game.addShake(10);
          }
          break;
        }
      }
    } else {
      // Enemy projectile hitting player
      const player = this.game.player;
      if (player && this.checkCircleRectCollision(
        projectile.x, projectile.y, projectile.size,
        player.x, player.y, player.width, player.height
      )) {
        player.takeDamage(projectile.damage);
        this.game.addShake(3);
        this.game.visuals.addHitMarker(player.getCenter().x, player.getCenter().y, false);
        projectile.life = 0;
      }
    }
  }

  // Check circle-rectangle collision
  checkCircleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (cr * cr);
  }

  // Handle boss attacks
  handleBossAttack(boss) {
    // Boss melee/contact damage handled separately
    // This is for special boss abilities
    if (boss.pattern === 'nova') {
      this.game.addShake(5);
    }
  }

  // Check entity collisions (player vs enemies)
  checkEntityCollisions() {
    const player = this.game.player;
    if (!player) return;

    // Player vs enemies contact damage
    for (const enemy of this.game.enemies) {
      if (this.checkRectCollision(
        player.x, player.y, player.width, player.height,
        enemy.x, enemy.y, enemy.width, enemy.height
      )) {
        // Contact damage already handled in enemy.update()
      }
    }

    // Player vs pickups
    this.game.pickups = this.game.pickups.filter(pickup => {
      if (this.checkRectCollision(
        player.x, player.y, player.width, player.height,
        pickup.x, pickup.y, pickup.width, pickup.height
      )) {
        pickup.collect(player);
        this.game.visuals.addDamageNumber(
          player.getCenter().x,
          player.getCenter().y - 20,
          pickup.type === 'health' ? '+HP' : 
          pickup.type === 'shield' ? '+SHIELD' :
          pickup.type === 'damage' ? '+DMG' : '+SPD',
          false
        );
        return false;
      }
      return true;
    });
  }

  // Check rectangle-rectangle collision
  checkRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }
}

export { CollisionSystem };
