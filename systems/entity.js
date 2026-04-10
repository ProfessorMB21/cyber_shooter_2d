// Base Entity Class

class Entity {
  constructor(options = {}) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 32;
    this.height = options.height || 32;
    this.color = options.color || '#ffffff';
    this.name = options.name || 'Entity';
    this.dead = false;
    this.id = Math.random().toString(36).substr(2, 9);

    // Physics
    this.vx = 0;
    this.vy = 0;
    this.friction = options.friction || 0.9;

    // Stats
    this.hp = options.hp || 100;
    this.maxHp = options.maxHp || 100;
    this.damage = options.damage || 10;
    this.speed = options.speed || 100;
    this.armor = options.armor || 0;

    // Visual
    this.alpha = 1;
    this.scale = 1;
    this.rotation = 0;
  }

  // Get center position
  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  // Get bounding box
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  // Distance to another entity
  distanceTo(other) {
    const dx = this.getCenter().x - other.getCenter().x;
    const dy = this.getCenter().y - other.getCenter().y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Angle to another entity
  angleTo(other) {
    const dx = other.getCenter().x - this.getCenter().x;
    const dy = other.getCenter().y - this.getCenter().y;
    return Math.atan2(dy, dx);
  }

  // Move towards target
  moveTowards(targetX, targetY, deltaTime) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.vx += (dx / distance) * this.speed * deltaTime;
      this.vy += (dy / distance) * this.speed * deltaTime;
    }
  }

  // Apply velocity with friction
  applyPhysics(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    this.vx *= this.friction;
    this.vy *= this.friction;
  }

  // Clamp to canvas bounds
  clampToBounds(canvasWidth, canvasHeight) {
    this.x = Math.max(0, Math.min(this.x, canvasWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, canvasHeight - this.height));
  }

  // Take damage
  takeDamage(amount) {
    // Armor reduces damage (1 armor = 1.5% reduction, max 75%)
    const damageReduction = Math.min(0.75, this.armor * 0.015);
    const actualDamage = amount * (1 - damageReduction);

    this.hp -= actualDamage;

    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
    }

    return actualDamage;
  }

  // Heal
  heal(amount) {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  // Check collision with another entity (AABB)
  collidesWith(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  // Check collision with circle
  collidesWithCircle(cx, cy, radius) {
    const center = this.getCenter();
    const dx = center.x - cx;
    const dy = center.y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Approximate entity as circle with radius = half of larger dimension
    const entityRadius = Math.max(this.width, this.height) / 2;
    return distance < entityRadius + radius;
  }

  // Update (override in subclasses)
  update(deltaTime) {
    this.applyPhysics(deltaTime);
  }

  // Draw (override in subclasses)
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;

    // Translate to center for rotation
    const center = this.getCenter();
    ctx.translate(center.x, center.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    // Draw body
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    ctx.restore();
  }

  // Draw health bar
  drawHealthBar(ctx, x, y, width = 40, height = 6) {
    const hpPercent = this.hp / this.maxHp;

    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(x - width / 2, y - height / 2, width, height);

    // Health color based on percentage
    if (hpPercent > 0.6) {
      ctx.fillStyle = '#44ff44';
    } else if (hpPercent > 0.3) {
      ctx.fillStyle = '#ffff44';
    } else {
      ctx.fillStyle = '#ff4444';
    }

    ctx.fillRect(x - width / 2, y - height / 2, width * hpPercent, height);
  }

  // Destroy
  destroy() {
    this.dead = true;
  }
}

export { Entity };
