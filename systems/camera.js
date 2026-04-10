// Camera System

class Camera {
  constructor(config) {
    this.config = config;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.smoothness = 0.1;
    this.zoom = 1;
  }

  // Update
  update(targetX, targetY, deltaTime) {
    // Smoothly interpolate to target
    this.targetX = targetX;
    this.targetY = targetY;

    this.x += (this.targetX - this.x) * this.smoothness;
    this.y += (this.targetY - this.y) * this.smoothness;

    // Clamp to canvas
    this.x = Math.max(0, Math.min(this.x, this.config.WIDTH));
    this.y = Math.max(0, Math.min(this.y, this.config.HEIGHT));
  }

  // Draw
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.zoom, this.zoom);
  }

  // Restore
  restore(ctx) {
    ctx.restore();
  }
}

// Export
module.exports = { Camera };
