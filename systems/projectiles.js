// Projectile System

class Projectile {
  constructor(x, y, velocity, color, isPlayer = false, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = velocity.x || velocity.vx || 0;
    this.vy = velocity.y || velocity.vy || 0;
    this.color = color || '#ffff00';
    this.isPlayer = isPlayer;
    this.dead = false;
    this.size = options.size || 6;
    this.damage = options.damage || 10;
    this.homing = options.homing || false;
    this.piercing = options.piercing || false;
    this.aoe = options.aoe || false;
    this.orbit = options.orbit || false;
    this.hits = [];
    this.life = options.life || 5; // Seconds before auto-remove
  }

  update(deltaTime, player) {
    if (this.dead) return false;

    this.life -= deltaTime;
    if (this.life <= 0) {
      this.dead = true;
      return false;
    }

    // Homing behavior
    if (this.homing && player) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 300) {
        const trackSpeed = 150;
        this.vx += (dx / distance) * trackSpeed * deltaTime;
        this.vy += (dy / distance) * trackSpeed * deltaTime;
      }
    }

    // Move
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Out of bounds
    if (this.x < -100 || this.x > 900 || this.y < -100 || this.y > 700) {
      this.dead = true;
      return false;
    }

    return true;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Trail
    if (!this.aoe) {
      ctx.fillStyle = this.color + '44';
      ctx.beginPath();
      ctx.arc(this.x - this.vx * 0.02, this.y - this.vy * 0.02, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

class ProjectileManager {
  constructor(game, config) {
    this.game = game;
    this.config = config;
    this.projectiles = [];
    this.bullets = [];
  }

  update(deltaTime) {
    // Update all projectiles
    this.projectiles = this.projectiles.filter(p => {
      const alive = p.update(deltaTime, this.game.player);
      return alive;
    });

    // Update bullets
    this.bullets = this.bullets.filter(b => {
      const alive = b.update(deltaTime, this.game.player);
      return alive;
    });
  }

  add(projectile) {
    this.projectiles.push(projectile);
  }

  addBullet(bullet) {
    this.bullets.push(bullet);
  }

  get() {
    return [...this.projectiles, ...this.bullets];
  }

  clear() {
    this.projectiles = [];
    this.bullets = [];
  }
}

export { Projectile, ProjectileManager };
