// Pickup Entity

// Stat caps (matching player.js STAT_CAPS)
const MAX_SPEED = 300;
const MAX_SHIELD = 150;
const MAX_DAMAGE = 800;

class Pickup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.dead = false;
    this.width = 24;
    this.height = 24;
    this.bob = 0;

    switch (type) {
      case 'health':
        this.value = 20;    // Reduced from 50
        this.color = '#44ff44';
        break;
      case 'shield':
        this.value = 10;    // Reduced from 25
        this.color = '#4444ff';
        break;
      case 'speed':
        this.value = 5;     // Reduced from 20
        this.color = '#ffff44';
        break;
      case 'damage':
        this.value = 2;     // Reduced from 5
        this.color = '#ff4444';
        break;
      default:
        this.value = 5;
        this.color = '#ffffff';
    }
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

export { Pickup, MAX_SPEED, MAX_SHIELD, MAX_DAMAGE };
