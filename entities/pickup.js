// Pickup Entity

import config from '../config.js';

// Use stat caps from config
const MAX_SPEED = config.STAT_CAPS.maxSpeed;
const MAX_SHIELD = config.STAT_CAPS.maxShield;
const MAX_DAMAGE = config.STAT_CAPS.maxDamage;

class Pickup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.dead = false;
    this.width = 24;
    this.height = 24;
    this.bob = 0;

    // Get pickup values from config
    const pickupConfig = config.pickups[type] || { value: 5, color: '#ffffff' };
    this.value = pickupConfig.value;
    this.color = pickupConfig.color;
  }

  update(deltaTime, player) {
    this.bob += deltaTime * 5;

    // Float towards player if close
    const dx = player.getCenter().x - this.x;
    const dy = player.getCenter().y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 100) {
      this.x += (dx / distance) * 100 * deltaTime;
      this.y += (dy / distance) * 100 * deltaTime;
    }

    // Collision
    if (distance < 30) {
      this.applyEffect(player);
      this.dead = true;
    }

    return !this.dead;
  }

  applyEffect(player) {
    switch (this.type) {
      case 'health':
        player.heal(this.value);
        break;
      case 'shield':
        // Cap shield at max
        player.shield = Math.min(player.shield + this.value, MAX_SHIELD);
        break;
      case 'speed':
        // Cap speed at max
        player.currentStats.speed = Math.min(player.currentStats.speed + this.value, MAX_SPEED);
        break;
      case 'damage':
        // Cap damage at max
        player.currentStats.damage = Math.min(player.currentStats.damage + this.value, MAX_DAMAGE);
        break;
    }
  }

  draw(ctx) {
    const bobOffset = Math.sin(this.bob) * 3;

    ctx.save();

    // Outer glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color + '44';
    ctx.beginPath();
    ctx.arc(this.x, this.y + bobOffset, 18, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    ctx.shadowBlur = 8;
    ctx.fillStyle = this.color + '66';
    ctx.beginPath();
    ctx.arc(this.x, this.y + bobOffset, 12, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.shadowBlur = 5;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - 8, this.y - 8 + bobOffset, 16, 16);

    ctx.restore();

    // Icon
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    const icon = this.type === 'health' ? '+' : this.type === 'shield' ? 'S' : this.type === 'speed' ? '>' : '!';
    ctx.fillText(icon, this.x, this.y + 4 + bobOffset);
  }
}

export { Pickup, MAX_SPEED, MAX_SHIELD, MAX_DAMAGE };
