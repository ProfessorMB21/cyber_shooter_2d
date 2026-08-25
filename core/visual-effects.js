// Visual Effects System

class VisualEffectsSystem {
  constructor(game) {
    this.game = game;
    this.stars = this.generateStars();
    this.shakeAmount = 0;
    this.shakeDecay = 5;
    this.cameraX = 0;
    this.cameraY = 0;
  }

  // Generate background stars
  generateStars() {
    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * this.game.width,
        y: Math.random() * this.game.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        brightness: Math.random()
      });
    }
    return stars;
  }

  // Trigger screen shake
  addShake(amount) {
    this.shakeAmount = Math.min(this.shakeAmount + amount, 20);
  }

  // Update screen shake
  updateShake(deltaTime) {
    if (this.shakeAmount > 0) {
      this.cameraX = (Math.random() - 0.5) * this.shakeAmount;
      this.cameraY = (Math.random() - 0.5) * this.shakeAmount;
      this.shakeAmount = Math.max(0, this.shakeAmount - this.shakeDecay * deltaTime);
    } else {
      this.cameraX = 0;
      this.cameraY = 0;
    }
  }

  // Update background stars
  updateStars(deltaTime) {
    this.stars.forEach(star => {
      star.y += star.speed * 60 * deltaTime;
      if (star.y > this.game.height) {
        star.y = 0;
        star.x = Math.random() * this.game.width;
      }
    });
  }

  // Draw background with parallax stars (optimized)
  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#0a0a0f');
    gradient.addColorStop(1, '#050510');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    ctx.save();
    // Draw all stars without glow for performance
    ctx.fillStyle = '#ffffff';
    this.stars.forEach(star => {
      ctx.globalAlpha = 0.3 + star.brightness * 0.7;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // Apply camera shake to context
  applyCamera(ctx) {
    ctx.translate(this.cameraX, this.cameraY);
  }

  // Reset camera
  resetCamera(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

export { VisualEffectsSystem };
