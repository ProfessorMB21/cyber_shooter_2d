// Combat System - Enhanced with visual effects

class CombatSystem {
  constructor(game) {
    this.game = game;
  }

  // Player shooting
  playerShoot() {
    const player = this.game.player;
    if (!player || player.shootCooldown > 0) return null;

    const center = player.getCenter();
    const angle = -Math.PI / 2; // Shooting upward by default
    
    // Find nearest enemy for auto-aim (optional)
    let targetAngle = angle;
    if (this.game.enemies.length > 0) {
      const nearest = this.findNearestEnemy(player);
      if (nearest) {
        const dx = nearest.x + nearest.width/2 - center.x;
        const dy = nearest.y + nearest.height/2 - center.y;
        targetAngle = Math.atan2(dy, dx);
      }
    }

    // Create projectile
    const damage = player.getDamage();
    const isCrit = player.nextShotCrit || Math.random() < player.criticalChance;
    const piercing = player.nextShotPiercing || false;
    
    this.game.projectiles.push({
      x: center.x,
      y: center.y,
      vx: Math.cos(targetAngle) * 500,
      vy: Math.sin(targetAngle) * 500,
      damage: isCrit ? damage * player.criticalDamage : damage,
      isPlayer: true,
      isCrit: isCrit,
      piercing: piercing,
      size: 4,
      color: isCrit ? '#ffff00' : '#00ff00',
      life: 3,
      update: function(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.life -= deltaTime;
        return this.life > 0 && 
               this.x > 0 && this.x < this.game?.width || 800 && 
               this.y > 0 && this.y < this.game?.height || 600;
      },
      draw: function(ctx) {
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Visual effects
    this.game.visuals.addMuzzleFlash(center.x, center.y, targetAngle);
    this.game.visuals.addShellCasing(center.x, center.y, targetAngle);
    this.game.addShake(1);

    // Reset crit/piercing flags
    player.nextShotCrit = false;
    player.nextShotPiercing = false;

    // Set cooldown
    player.shootCooldown = 0.15;

    return { fired: true, damage, isCrit };
  }

  // Find nearest enemy
  findNearestEnemy(player) {
    const playerCenter = player.getCenter();
    let nearest = null;
    let minDist = Infinity;

    this.game.enemies.forEach(enemy => {
      const enemyCenter = enemy.getCenter();
      const dx = enemyCenter.x - playerCenter.x;
      const dy = enemyCenter.y - playerCenter.y;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    });

    return nearest;
  }

  // Enemy shooting
  enemyShoot(enemy, target) {
    if (!enemy || !target) return null;

    const enemyCenter = enemy.getCenter();
    const targetCenter = target.getCenter ? target.getCenter() : { x: target.x, y: target.y };
    
    const dx = targetCenter.x - enemyCenter.x;
    const dy = targetCenter.y - enemyCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return null;

    const speed = 200;
    const projectile = {
      x: enemyCenter.x,
      y: enemyCenter.y,
      vx: (dx / distance) * speed,
      vy: (dy / distance) * speed,
      damage: enemy.damage,
      isPlayer: false,
      size: 5,
      color: '#ff4444',
      life: 5,
      update: function(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.life -= deltaTime;
        return this.life > 0 && 
               this.x > 0 && this.x < 800 && 
               this.y > 0 && this.y < 600;
      },
      draw: function(ctx) {
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    this.game.projectiles.push(projectile);
    return projectile;
  }

  // Activate skill
  activateSkill(slot) {
    const player = this.game.player;
    if (!player || !player.build) return null;

    const abilities = player.build.abilities;
    if (slot >= abilities.length) return null;

    const abilityName = abilities[slot];
    const result = player.activateAbility(abilityName);

    if (result.activated) {
      // Apply ability effects
      switch (result.effect) {
        case 'aoe_damage':
          // Deal damage to all nearby enemies
          this.game.enemies.forEach(enemy => {
            const center = enemy.getCenter();
            const playerCenter = player.getCenter();
            const dx = center.x - playerCenter.x;
            const dy = center.y - playerCenter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= result.radius) {
              enemy.takeDamage(result.damage);
              this.game.visuals.addDamageNumber(center.x, center.y, result.damage, false);
            }
          });
          this.game.addShake(5);
          break;

        case 'teleport':
          // Teleport in movement direction or random
          const moveDir = this.game.input.getMovement();
          let newX = player.x;
          let newY = player.y;
          if (moveDir.dx !== 0 || moveDir.dy !== 0) {
            newX += moveDir.dx * 150;
            newY += moveDir.dy * 150;
          } else {
            newX += (Math.random() - 0.5) * 200;
            newY += (Math.random() - 0.5) * 200;
          }
          // Clamp to bounds
          player.x = Math.max(0, Math.min(this.game.width - player.width, newX));
          player.y = Math.max(0, Math.min(this.game.height - player.height, newY));
          this.game.particles.spawnExplosion(player.x + player.width/2, player.y + player.height/2, 20, '#00ffff');
          break;

        case 'dash':
          // Dash in movement direction
          const dashDir = this.game.input.getMovement();
          if (dashDir.dx !== 0 || dashDir.dy !== 0) {
            player.vx = dashDir.dx * 800;
            player.vy = dashDir.dy * 800;
          } else {
            player.vx = 800;
            player.vy = 0;
          }
          break;

        case 'whirlwind':
          // Spin attack hitting all nearby enemies
          this.game.enemies.forEach(enemy => {
            const center = enemy.getCenter();
            const playerCenter = player.getCenter();
            const dx = center.x - playerCenter.x;
            const dy = center.y - playerCenter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= 100) {
              enemy.takeDamage(result.damage * 0.5);
              this.game.visuals.addDamageNumber(center.x, center.y, result.damage * 0.5, false);
            }
          });
          this.game.addShake(3);
          break;
      }

      // Add visual feedback
      this.game.particles.spawnExplosion(
        player.x + player.width/2, 
        player.y + player.height/2, 
        15, 
        '#00ff00'
      );
    }

    return result;
  }
}

export { CombatSystem };
