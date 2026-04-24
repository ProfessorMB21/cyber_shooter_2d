// Damage Numbers System - Floating combat text

class DamageNumber {
  constructor(x, y, damage, isCrit = false, color = '#ffffff') {
    this.x = x;
    this.y = y;
    this.damage = Math.floor(damage);
    this.isCrit = isCrit;
    this.color = color;
    this.life = 1.0; // seconds
    this.decay = 0.8; // how fast it fades
    this.velocityY = -50; // float upward
    this.scale = isCrit ? 1.5 : 1.0;
  }

  update(deltaTime) {
    this.y += this.velocityY * deltaTime;
    this.velocityY *= 0.95; // slow down
    this.life -= this.decay * deltaTime;
    return this.life > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    
    const alpha = Math.max(0, this.life);
    ctx.globalAlpha = alpha;
    
    // Critical hit effect
    if (this.isCrit) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
    }
    
    ctx.fillStyle = this.color;
    ctx.font = this.isCrit ? 'bold 20px monospace' : 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw damage number
    const text = this.isCrit ? `CRIT ${this.damage}!` : `${this.damage}`;
    ctx.fillText(text, 0, 0);
    
    ctx.restore();
  }
}

class DamageNumberSystem {
  constructor() {
    this.numbers = [];
    this.maxNumbers = 50; // Limit to prevent performance issues
  }

  addDamage(x, y, damage, isCrit = false, color = '#ffffff') {
    // Skip if too many numbers
    if (this.numbers.length >= this.maxNumbers) {
      // Remove oldest
      this.numbers.shift();
    }
    
    this.numbers.push(new DamageNumber(x, y, damage, isCrit, color));
  }

  update(deltaTime) {
    this.numbers = this.numbers.filter(n => n.update(deltaTime));
  }

  draw(ctx) {
    this.numbers.forEach(n => n.draw(ctx));
  }

  clear() {
    this.numbers = [];
  }
}

export { DamageNumberSystem };
