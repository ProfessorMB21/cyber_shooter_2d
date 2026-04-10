// Enemy Entity

import { Entity } from '../systems/entity.js';

// Enemy types
const ENEMY_TYPES = {
  grunt: {
    name: 'Grunt',
    hp: 50,
    damage: 10,
    speed: 80,
    size: 12,
    color: '#ff4444',
    xp: 10,
    score: 10
  },
  fast: {
    name: 'Fast',
    hp: 30,
    damage: 8,
    speed: 150,
    size: 10,
    color: '#ff8800',
    xp: 15,
    score: 15
  },
  tank: {
    name: 'Tank',
    hp: 150,
    damage: 20,
    speed: 40,
    size: 18,
    color: '#aa4444',
    xp: 30,
    score: 30
  },
  shooter: {
    name: 'Shooter',
    hp: 40,
    damage: 15,
    speed: 60,
    size: 12,
    color: '#ff00ff',
    xp: 20,
    score: 20,
    shoots: true
  },
  elite: {
    name: 'Elite',
    hp: 300,
    damage: 35,
    speed: 70,
    size: 16,
    color: '#aa0000',
    xp: 100,
    score: 100
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

    // Movement
    if (distance > 0) {
      let speed = this.speed;

      // Shooter keeps distance
      if (this.shoots && distance < 200) {
        speed = -speed * 0.3; // Back away
      }

      this.vx += (dx / distance) * speed * deltaTime;
      this.vy += (dy / distance) * speed * deltaTime;
    }

    // Apply physics
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Bounds
    this.clampToBounds(canvasWidth, canvasHeight);

    // Shooting
    if (this.shoots) {
      this.shootCooldown -= deltaTime;
      if (this.shootCooldown <= 0 && distance < 400) {
        this.shootCooldown = 2;
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
