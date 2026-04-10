// Pickup System

class Pickup {
  constructor(x, y, type, value) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.value = value || this.getDefaultValue(type);
    this.dead = false;
    this.width = 24;
    this.height = 24;
    this.bob = 0;
    this.color = this.getColor(type);
  }

  getDefaultValue(type) {
    switch (type) {
      case 'health': return 50;
      case 'shield': return 25;
      case 'speed': return 20;
      case 'damage': return 5;
      default: return 10;
    }
  }

  getColor(type) {
    switch (type) {
      case 'health': return '#44ff44';
      case 'shield': return '#4444ff';
      case 'speed': return '#ffff44';
      case 'damage': return '#ff4444';
      default: return '#ffffff';
    }
  }

  update(deltaTime, player) {
    this.bob += deltaTime * 5;

    // Float towards player if close
    const pc = player.getCenter ? player.getCenter() : { x: player.x, y: player.y };
    const dx = pc.x - this.x;
    const dy = pc.y - this.y;
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
        player.addShield(this.value);
        break;
      case 'speed':
        player.currentStats.speed += this.value;
        break;
      case 'damage':
        player.currentStats.damage += this.value;
        break;
    }
  }

  draw(ctx) {
    const bobOffset = Math.sin(this.bob) * 3;

    // Glow
    ctx.fillStyle = this.color + '33';
    ctx.beginPath();
    ctx.arc(this.x, this.y + bobOffset, 18, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - 10, this.y - 10 + bobOffset, 20, 20);

    // Icon
    ctx.fillStyle = '#000';
    ctx.font = '12px monospace';
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
    this.pickups = this.pickups.filter(p => {
      const alive = p.update(deltaTime, this.game.player);
      if (!alive && this.game.particles) {
        this.game.particles.spawnExplosion(p.x, p.y, 5, p.color);
      }
      return alive;
    });
  }

  spawn(x, y, type, value) {
    const pickup = new Pickup(x, y, type, value);
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

export { Pickup, PickupManager };
