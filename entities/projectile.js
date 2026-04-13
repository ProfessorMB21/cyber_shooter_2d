// Projectile Entity

class Projectile {
  constructor(x, y, vx, vy, damage, color, isPlayer = false, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.color = color;
    this.isPlayer = isPlayer;
    this.dead = false;
    this.size = options.size || 6;
    this.piercing = options.piercing || false;
    this.aoe = options.aoe || false;
    this.expand = options.expand || false;
    this.maxSize = options.maxSize || this.size;
    this.duration = options.duration || 0;
    this.hits = [];

    if (this.aoe) {
      this.size = 0;
    }
  }

  update(deltaTime) {
    if (this.dead) return false;

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // AOE expansion
    if (this.expand && this.size < this.maxSize) {
      this.size += this.maxSize * deltaTime;
    }

    // Duration countdown
    if (this.duration > 0) {
      this.duration -= deltaTime;
      if (this.duration <= 0) {
        this.dead = true;
      }
    }

    // Out of bounds
    if (this.x < -50 || this.x > 850 || this.y < -50 || this.y > 650) {
      if (!this.aoe) {
        this.dead = true;
      }
    }

    return !this.dead;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Trail effect
    if (!this.aoe) {
      ctx.fillStyle = this.color + '44';
      ctx.beginPath();
      ctx.arc(this.x - this.vx * 0.02, this.y - this.vy * 0.02, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export { Projectile };
