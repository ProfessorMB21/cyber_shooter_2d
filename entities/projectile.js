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

    // Bounds configuration - larger than typical canvas for safety
    this.bounds = options.bounds || {
      minX: -100,
      maxX: 2000,
      minY: -100,
      maxY: 1500
    };

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

    // Out of bounds check
    if (this.x < this.bounds.minX || this.x > this.bounds.maxX ||
        this.y < this.bounds.minY || this.y > this.bounds.maxY) {
      if (!this.aoe) {
        this.dead = true;
      }
    }

    return !this.dead;
  }

  draw(ctx) {
    ctx.save();

    // AOE effect (crush attack)
    if (this.aoe) {
      ctx.fillStyle = this.color + '33';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Regular projectile with glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;

      // Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Outer glow
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      // Trail effect
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = this.color;
      const trailLength = Math.min(20, Math.sqrt(this.vx * this.vx + this.vy * this.vy) * 0.05);
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(
          this.x - this.vx * 0.015 * i,
          this.y - this.vy * 0.015 * i,
          this.size * (1 - i * 0.2),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

export { Projectile };
