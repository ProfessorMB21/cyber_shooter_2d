// Enemy Entity

import { Entity } from '../systems/entity.js';

// Enemy types - BUFFED for extreme difficulty
const ENEMY_TYPES = {
  grunt: {
    name: 'Grunt',
    hp: 150,        // Was 50 (3x)
    damage: 35,     // Was 10 (3.5x)
    speed: 120,     // Was 80 (1.5x)
    size: 12,
    color: '#3a99e7',
    xp: 10,
    score: 10
  },
  fast: {
    name: 'Fast',
    hp: 80,         // Was 30 (2.7x)
    damage: 25,     // Was 8 (3x)
    speed: 250,     // Was 150 (1.7x)
    size: 10,
    color: '#9fe95a',
    xp: 15,
    score: 15
  },
  tank: {
    name: 'Tank',
    hp: 450,        // Was 150 (3x)
    damage: 60,     // Was 20 (3x)
    speed: 80,      // Was 40 (1.5x)
    size: 18,
    color: '#756767',
    xp: 30,
    score: 30
  },
  shooter: {
    name: 'Shooter',
    hp: 120,        // Was 40 (3x)
    damage: 45,     // Was 15 (3x)
    speed: 100,     // Was 60 (1.7x)
    size: 12,
    color: '#6518ca',
    xp: 20,
    score: 20,
    shoots: true
  },
  elite: {
    name: 'Elite',
    hp: 900,        // Was 300 (3x)
    damage: 65,    // Was 35 (2.9x)
    speed: 120,     // Was 70 (1.7x)
    size: 16,
    color: '#aa0000',
    xp: 100,
    score: 100,
    shoots: true
  }
};

class Enemy extends Entity {
  constructor(type, x, y, difficultyMultiplier = 1) {
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

    // Animation
    this.pulse = 0;
    this.hitFlash = 0;
  }

  update(deltaTime, player, canvasWidth, canvasHeight) {
    if (this.dead) return false;

    this.pulse += deltaTime * 5;
    this.hitFlash = Math.max(0, this.hitFlash - deltaTime);

    // Calculate direction to player
    const center = this.getCenter();
    const playerCenter = player.getCenter ? player.getCenter() : { x: player.x, y: player.y };

    const dx = playerCenter.x - center.x;
    const dy = playerCenter.y - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Movement - MORE AGGRESSIVE with UNPREDICTABILITY
    if (distance > 0) {
      let speed = this.speed * 2.5; // 50% faster movement

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

  takeDamage(amount) {
    const actual = super.takeDamage(amount);
    this.hitFlash = 0.1;
    return actual;
  }

  draw(ctx) {
    const center = this.getCenter();

    // Hit flash
    if (this.hitFlash > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = this.hitFlash * 10;
      ctx.beginPath();
      ctx.arc(center.x, center.y, this.width * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Body
    ctx.fillStyle = this.color;
    const pulseScale = 1 + Math.sin(this.pulse) * 0.05;

    ctx.beginPath();
    ctx.arc(center.x, center.y, (this.width / 2) * pulseScale, 0, Math.PI * 2);
    ctx.fill();

    // Shooter indicator
    if (this.shoots) {
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(center.x, center.y, this.width * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Health bar for tank/elite enemies
    if (this.type === 'tank' || this.type === 'elite') {
      this.drawHealthBar(ctx, center.x, this.y - 5, 30, 4);
    }
  }
}

export { Enemy, ENEMY_TYPES };
