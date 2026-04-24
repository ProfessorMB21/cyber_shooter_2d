// Enemy Entity

import { Entity } from '../systems/entity.js';

// Elite Affixes - Random modifiers on elite enemies
const ELITE_AFFIXES = {
  fire: {
    name: 'Fire Enchanted',
    color: '#ff6600',
    damageMultiplier: 1.3,
    effect: 'burn', // Deals burn damage over time
    visual: 'flames'
  },
  frozen: {
    name: 'Frozen',
    color: '#00ffff',
    damageMultiplier: 1.0,
    effect: 'slow', // Slows player on hit
    visual: 'ice'
  },
  shielded: {
    name: 'Shielded',
    color: '#00ff00',
    damageMultiplier: 1.0,
    effect: 'shield', // Has extra shield HP
    visual: 'shield'
  },
  reflective: {
    name: 'Reflective',
    color: '#ff00ff',
    damageMultiplier: 1.2,
    effect: 'reflect', // Reflects % of damage back to player
    visual: 'mirror'
  },
  venomous: {
    name: 'Venomous',
    color: '#66ff00',
    damageMultiplier: 1.1,
    effect: 'poison', // Applies poison DoT
    visual: 'venom'
  },
  electrified: {
    name: 'Electrified',
    color: '#ffff00',
    damageMultiplier: 1.25,
    effect: 'chain', // Chains lightning to nearby enemies
    visual: 'lightning'
  }
};

// Enemy types - BUFFED for extreme difficulty
const ENEMY_TYPES = {
  grunt: {
    name: 'Grunt',
    hp: 150,        
    damage: 25,     
    speed: 120,     
    size: 12,
    color: '#3a99e7',
    xp: 10,
    score: 10
  },
  fast: {
    name: 'Fast',
    hp: 80,         
    damage: 18,     
    speed: 250,     
    size: 10,
    color: '#9fe95a',
    xp: 15,
    score: 15
  },
  tank: {
    name: 'Tank',
    hp: 450,        
    damage: 20,     
    speed: 80,      
    size: 18,
    color: '#756767',
    xp: 30,
    score: 30
  },
  shooter: {
    name: 'Shooter',
    hp: 120,        
    damage: 15,     
    speed: 100,     
    size: 12,
    color: '#6518ca',
    xp: 20,
    score: 20,
    shoots: true
  },
  elite: {
    name: 'Elite',
    hp: 550,        
    damage: 20,    
    speed: 120,    
    size: 16,
    color: '#aa0000',
    xp: 100,
    score: 100,
    shoots: true
  },
  // NEW: Summoner - Spawns additional enemies
  summoner: {
    name: 'Summoner',
    hp: 200,
    damage: 15,
    speed: 90,
    size: 14,
    color: '#ff00ff',
    xp: 50,
    score: 50,
    shoots: false,
    special: 'summon'
  },
  // NEW: Healer - Heals nearby enemies
  healer: {
    name: 'Healer',
    hp: 180,
    damage: 10,
    speed: 100,
    size: 12,
    color: '#00ff88',
    xp: 40,
    score: 40,
    shoots: false,
    special: 'heal'
  },
  // NEW: Kamikaze - Rushes player and explodes
  kamikaze: {
    name: 'Kamikaze',
    hp: 60,
    damage: 80,
    speed: 350,
    size: 10,
    color: '#ff4400',
    xp: 25,
    score: 25,
    shoots: false,
    special: 'explode'
  },
  // NEW: Teleporter - Teleports around the battlefield
  teleporter: {
    name: 'Teleporter',
    hp: 140,
    damage: 25,
    speed: 110,
    size: 12,
    color: '#aa00ff',
    xp: 35,
    score: 35,
    shoots: true,
    special: 'teleport'
  }
};

class Enemy extends Entity {
  constructor(type, x, y, difficultyMultiplier = 1, affixes = []) {
    const config = ENEMY_TYPES[type] || ENEMY_TYPES.grunt;

    super({
      x: x - config.size,
      y: y - config.size,
      width: config.size * 2,
      height: config.size * 2,
      color: config.color,
      name: config.name,
      hp: config.hp * difficultyMultiplier,
      maxHp: config.hp * difficultyMultiplier,
      damage: config.damage * difficultyMultiplier,
      speed: config.speed,
      armor: 0
    });

    this.type = type;
    this.config = config;
    this.xp = config.xp;
    this.score = config.score;
    this.shoots = config.shoots || false;
    this.shootCooldown = 0;
    this.special = config.special || null;
    
    // Elite affixes
    this.affixes = affixes;
    this.applyAffixes();

    // Special ability timers
    this.specialTimer = 0;
    this.teleportTimer = 0;
    this.summonTimer = 0;
    this.healTimer = 0;
    this.explodeRadius = 0;
    this.isExploding = false;

    // Animation
    this.pulse = 0;
    this.hitFlash = 0;
  }
  
  applyAffixes() {
    let hpMultiplier = 1;
    let damageMultiplier = 1;
    
    for (const affixKey of this.affixes) {
      const affix = ELITE_AFFIXES[affixKey];
      if (affix) {
        if (affix.effect === 'shield') {
          this.shield = this.maxHp * 0.3; // 30% extra shield HP
        }
        damageMultiplier *= affix.damageMultiplier;
      }
    }
    
    this.damage *= damageMultiplier;
    this.maxHp *= hpMultiplier;
    this.hp = this.maxHp; // Reset HP after applying affixes
  }

  update(deltaTime, player, canvasWidth, canvasHeight, game = null) {
    if (this.dead) return false;

    this.pulse += deltaTime * 5;
    this.hitFlash = Math.max(0, this.hitFlash - deltaTime);

    // Calculate direction to player
    const center = this.getCenter();
    const playerCenter = player.getCenter ? player.getCenter() : { x: player.x, y: player.y };

    const dx = playerCenter.x - center.x;
    const dy = playerCenter.y - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Handle special abilities
    if (this.special) {
      const specialResult = this.updateSpecial(deltaTime, player, center, playerCenter, distance, game);
      if (specialResult) return specialResult;
    }

    // Movement - MORE AGGRESSIVE with UNPREDICTABILITY
    if (distance > 0) {
      let speed = this.speed * 2.5; // 50% faster movement

      // Kamikaze always rushes at full speed
      if (this.type === 'kamikaze') {
        speed = this.speed * 4;
      }

      // Shooter keeps distance but more aggressively
      if (this.shoots && distance < 200) {
        speed = -speed * 7.5; // Back away faster
      }

      // Add unpredictability - random deviation from direct path
      const wobble = Math.sin(Date.now() / 200 + this.id.charCodeAt(0)) * 0.3;
      const angleToPlayer = Math.atan2(dy, dx);
      const angleWithWobble = angleToPlayer + wobble;

      // Higher acceleration for more aggressive chasing
      this.vx += Math.cos(angleWithWobble) * speed * deltaTime * 1.5;
      this.vy += Math.sin(angleWithWobble) * speed * deltaTime * 1.5;

      // Occasionally change direction randomly for unpredictability
      if (Math.random() < 0.02) {
        this.vx += (Math.random() - 0.5) * speed * 0.5;
        this.vy += (Math.random() - 0.5) * speed * 0.5;
      }
    }

    // Apply physics
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Bounds
    this.clampToBounds(canvasWidth, canvasHeight);

    // Shooting - more aggressive (reduced cooldown)
    if (this.shoots) {
      this.shootCooldown -= deltaTime;
      if (this.shootCooldown <= 0 && distance < 450) { // Shooting range
        this.shootCooldown = 1.75; // Reduced cooldown from 2 to 1
        return { action: 'shoot', target: player };
      }
    }

    // Contact damage
    if (this.collidesWithCircle(playerCenter.x, playerCenter.y, 20)) {
      player.takeDamage(this.damage * deltaTime);
    }

    return true;
  }
  
  updateSpecial(deltaTime, player, center, playerCenter, distance, game) {
    this.specialTimer -= deltaTime;
    
    // Kamikaze explosion logic
    if (this.type === 'kamikaze') {
      if (this.isExploding) {
        this.explodeRadius += deltaTime * 200;
        if (this.explodeRadius > 80) {
          this.dead = true;
          return false;
        }
        // Check AOE damage to player
        const distDx = center.x - playerCenter.x;
        const distDy = center.y - playerCenter.y;
        const dist = Math.sqrt(distDx * distDx + distDy * distDy);
        if (dist < this.explodeRadius) {
          player.takeDamage(this.damage * deltaTime * 3);
        }
        return true;
      }
      
      if (distance < 30 && !this.isExploding) {
        this.isExploding = true;
        this.explodeRadius = 10;
      }
    }
    
    // Teleporter logic
    if (this.type === 'teleporter') {
      this.teleportTimer -= deltaTime;
      if (this.teleportTimer <= 0) {
        this.teleportTimer = 3 + Math.random() * 2;
        // Teleport to random location near player
        const angle = Math.random() * Math.PI * 2;
        const teleportDist = 150 + Math.random() * 100;
        this.x = playerCenter.x + Math.cos(angle) * teleportDist - this.width / 2;
        this.y = playerCenter.y + Math.sin(angle) * teleportDist - this.height / 2;
        this.vx = 0;
        this.vy = 0;
      }
    }
    
    // Summoner logic
    if (this.type === 'summoner') {
      this.summonTimer -= deltaTime;
      if (this.summonTimer <= 0 && game && game.spawnEnemy) {
        this.summonTimer = 6;
        // Spawn a grunt nearby
        const angle = Math.random() * Math.PI * 2;
        const spawnDist = 50;
        const spawnX = center.x + Math.cos(angle) * spawnDist;
        const spawnY = center.y + Math.sin(angle) * spawnDist;
        game.spawnEnemy('grunt', spawnX, spawnY);
      }
    }
    
    // Healer logic
    if (this.type === 'healer') {
      this.healTimer -= deltaTime;
      if (this.healTimer <= 0 && game && game.enemies) {
        this.healTimer = 4;
        // Heal nearby enemies
        const healAmount = 30;
        const healRadius = 100;
        for (const enemy of game.enemies) {
          const distDx = enemy.getCenter().x - center.x;
          const distDy = enemy.getCenter().y - center.y;
          const dist = Math.sqrt(distDx * distDx + distDy * distDy);
          if (dist < healRadius && enemy !== this) {
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
          }
        }
      }
    }
    
    return null;
  }

  takeDamage(amount) {
    // Reflective affix - reflect damage back to player
    for (const affixKey of this.affixes) {
      if (affixKey === 'reflective' && Math.random() < 0.3) {
        // 30% chance to reflect damage
        return 0; // No damage taken
      }
    }
    
    const actual = super.takeDamage(amount);
    this.hitFlash = 0.1;
    return actual;
  }

  draw(ctx) {
    const center = this.getCenter();

    ctx.save();

    // Draw explosion effect for kamikaze
    if (this.type === 'kamikaze' && this.isExploding) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff4400';
      const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, this.explodeRadius);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, '#ffaa00');
      gradient.addColorStop(1, 'rgba(255, 68, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(center.x, center.y, this.explodeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Hit flash
    if (this.hitFlash > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = this.hitFlash * 10;
      ctx.beginPath();
      ctx.arc(center.x, center.y, this.width * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Body with glow
    const pulseScale = 1 + Math.sin(this.pulse) * 0.05;

    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(center.x, center.y, (this.width / 2) * pulseScale, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(center.x, center.y, (this.width / 3) * pulseScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Draw affix indicators
    for (const affixKey of this.affixes) {
      const affix = ELITE_AFFIXES[affixKey];
      if (affix) {
        ctx.strokeStyle = affix.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 6;
        ctx.shadowColor = affix.color;
        ctx.beginPath();
        ctx.arc(center.x, center.y, (this.width / 2) * pulseScale + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Shooter indicator - glowing ring
    if (this.shoots) {
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff00ff';
      ctx.beginPath();
      ctx.arc(center.x, center.y, this.width * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Special type indicators
    if (this.type === 'summoner') {
      ctx.fillStyle = '#ff00ff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★', center.x, center.y - this.height);
    }
    if (this.type === 'healer') {
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('+', center.x, center.y - this.height);
    }
    if (this.type === 'teleporter') {
      ctx.fillStyle = '#aa00ff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('◈', center.x, center.y - this.height);
    }

    ctx.restore();

    // Health bar for tank/elite/special enemies
    if (this.type === 'tank' || this.type === 'elite' || this.special) {
      this.drawHealthBar(ctx, center.x, this.y - 5, 30, 4);
    }
    
    // Draw shield bar if has shield
    if (this.shield > 0) {
      const shieldPercent = this.shield / (this.maxHp * 0.3);
      ctx.fillStyle = '#4444ff';
      ctx.fillRect(center.x - 15, this.y - 10, 30 * shieldPercent, 3);
    }
  }
}

export { Enemy, ENEMY_TYPES, ELITE_AFFIXES };
