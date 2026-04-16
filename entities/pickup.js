// Pickup Entity

import { PICKUPS, STAT_CAPS } from '../config/index.js';

const MAX_SPEED = STAT_CAPS.maxSpeed;
const MAX_SHIELD = STAT_CAPS.maxShield;
const MAX_DAMAGE = STAT_CAPS.maxDamage;

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
    const pickupConfig = PICKUPS[type] || { value: 5, color: '#ffffff' };
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

class PickupManager {
  constructor(game, config) {
    this.game = game;
    this.config = config;
    this.pickups = [];
  }

  update(deltaTime) {
    // Update all pickups
    this.pickups = this.pickups.filter(p => {
      const alive = p.update(deltaTime, this.game.player);
      if (!alive && this.game.particles) {
        this.game.particles.spawnExplosion(p.x, p.y, 5, p.color);
      }
      return alive;
    });
  }

  add(x, y, type) {
    const pickup = new Pickup(x, y, type);
    this.pickups.push(pickup);
    return pickup;
  }

  get() {
    return this.pickups;
  }

  clear() {
    this.pickups = [];
  }
}

export { Pickup, PickupManager, MAX_SPEED, MAX_SHIELD, MAX_DAMAGE };
