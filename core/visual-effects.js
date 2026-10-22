// Visual Effects System

class VisualEffectsSystem {
  constructor(game) {
    this.game = game;
    this.stars = this.generateStars();
    this.shakeAmount = 0;
    this.shakeDecay = 5;
    this.cameraX = 0;
    this.cameraY = 0;

    // The backdrop behind the menus. The clouds drift and the band of
    // light crosses the screen, so a menu is never quite still.
    this.clouds = this.generateClouds();
    this.backdropTime = 0;
    this.sweep = 0;
    this.sweepBand = 220;
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

  // The clouds of colour behind the menus.
  //
  // Their positions are fractions of the screen, so a resize does not
  // throw them about.
  generateClouds() {
    return [
      { baseX: 0.18, baseY: 0.24, r: 0.55, colour: '58, 16, 120', sway: 0.10, speed: 0.07, phase: 0.0 },
      { baseX: 0.84, baseY: 0.46, r: 0.48, colour: '0, 70, 110', sway: 0.08, speed: 0.05, phase: 2.1 },
      { baseX: 0.44, baseY: 0.88, r: 0.62, colour: '110, 20, 70', sway: 0.09, speed: 0.04, phase: 4.2 }
    ];
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

  // Move the backdrop on.
  //
  // The clouds sway rather than travel, so there is never a moment when
  // one pops from one side of the screen to the other.
  updateBackdrop(deltaTime) {
    this.backdropTime += deltaTime;
    for (const cloud of this.clouds) {
      const t = this.backdropTime * cloud.speed + cloud.phase;
      cloud.x = cloud.baseX + Math.sin(t) * cloud.sway;
      cloud.y = cloud.baseY + Math.cos(t * 0.7) * cloud.sway * 0.5;
    }
    // The band of light crosses the screen every fourteen seconds.
    this.sweep = (this.sweep + deltaTime / 14) % 1;
  }

  // The gradient at the back of everything.
  drawSky(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#0a0a0f');
    gradient.addColorStop(1, '#050510');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.game.width, this.game.height);
  }

  // Draw background with parallax stars (optimized)
  drawStars(ctx) {
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

  // The gradient of a cloud. It is made once and moved, and made again
  // only when the screen is a different size.
  cloudGradient(ctx, cloud, radius) {
    if (!cloud.gradient || cloud.gradientRadius !== radius) {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, `rgba(${cloud.colour}, 0.22)`);
      gradient.addColorStop(0.45, `rgba(${cloud.colour}, 0.09)`);
      gradient.addColorStop(1, `rgba(${cloud.colour}, 0)`);
      cloud.gradient = gradient;
      cloud.gradientRadius = radius;
    }
    return cloud.gradient;
  }

  // The clouds of colour behind the stars.
  drawClouds(ctx) {
    const span = Math.max(this.game.width, this.game.height);
    for (const cloud of this.clouds) {
      const radius = Math.max(1, Math.round(cloud.r * span));
      ctx.save();
      ctx.translate(cloud.x * this.game.width, cloud.y * this.game.height);
      ctx.fillStyle = this.cloudGradient(ctx, cloud, radius);
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
      ctx.restore();
    }
  }

  // The gradient of the band of light that sweeps down the screen. It is
  // made once and moved with the band.
  sweepGradient(ctx) {
    if (!this.sweepGradientCache) {
      const gradient = ctx.createLinearGradient(0, 0, 0, this.sweepBand);
      gradient.addColorStop(0, 'rgba(150, 210, 255, 0)');
      gradient.addColorStop(0.5, 'rgba(150, 210, 255, 0.055)');
      gradient.addColorStop(1, 'rgba(150, 210, 255, 0)');
      this.sweepGradientCache = gradient;
    }
    return this.sweepGradientCache;
  }

  // The band of light, crossing the screen.
  drawSweep(ctx) {
    const band = this.sweepBand;
    const y = this.sweep * (this.game.height + band) - band;
    ctx.save();
    ctx.translate(0, y);
    ctx.fillStyle = this.sweepGradient(ctx);
    ctx.fillRect(0, 0, this.game.width, band);
    ctx.restore();
  }

  // The background of a run: the sky and the stars.
  drawBackground(ctx) {
    this.drawSky(ctx);
    this.drawStars(ctx);
  }

  // The background of a menu: the sky, the drifting clouds, the sweep
  // and the stars over the top of them.
  drawMenuBackdrop(ctx) {
    this.drawSky(ctx);
    this.drawClouds(ctx);
    this.drawSweep(ctx);
    this.drawStars(ctx);
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
