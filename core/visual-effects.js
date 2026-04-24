// Visual Effects System - Enhanced with damage numbers, hit markers, and more

class VisualEffectsSystem {
  constructor(game) {
    this.game = game;
    this.stars = this.generateStars();
    this.shakeAmount = 0;
    this.shakeDecay = 5;
    this.cameraX = 0;
    this.cameraY = 0;
    this.damageNumbers = [];
    this.hitMarkers = [];
    this.muzzleFlashes = [];
    this.shellCasings = [];
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

  // Add floating damage number
  addDamageNumber(x, y, damage, isCrit = false) {
    this.damageNumbers.push({
      x, y,
      value: Math.floor(damage),
      life: 1,
      vy: -30,
      isCrit,
      scale: isCrit ? 1.5 : 1,
      color: isCrit ? '#ffcc00' : '#ffffff'
    });
  }

  // Add hit marker
  addHitMarker(x, y, isKill = false) {
    this.hitMarkers.push({
      x, y,
      life: 0.5,
      isKill,
      scale: 1
    });
  }

  // Add muzzle flash
  addMuzzleFlash(x, y, angle) {
    this.muzzleFlashes.push({
      x, y,
      angle,
      life: 0.1,
      size: Math.random() * 10 + 15
    });
  }

  // Add shell casing
  addShellCasing(x, y, angle) {
    this.shellCasings.push({
      x, y,
      vx: Math.cos(angle + Math.PI) * 100 + (Math.random() - 0.5) * 50,
      vy: Math.sin(angle + Math.PI) * 100 - 50,
      rotation: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 10,
      life: 2,
      color: '#ffd700'
    });
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

  // Update damage numbers
  updateDamageNumbers(deltaTime) {
    this.damageNumbers = this.damageNumbers.filter(dn => {
      dn.y += dn.vy * deltaTime;
      dn.vy *= 0.95;
      dn.life -= deltaTime * 1.5;
      dn.scale *= 0.98;
      return dn.life > 0;
    });
  }

  // Update hit markers
  updateHitMarkers(deltaTime) {
    this.hitMarkers = this.hitMarkers.filter(hm => {
      hm.life -= deltaTime;
      hm.scale = 1 + (0.5 - hm.life) * 0.5;
      return hm.life > 0;
    });
  }

  // Update muzzle flashes
  updateMuzzleFlashes(deltaTime) {
    this.muzzleFlashes = this.muzzleFlashes.filter(mf => {
      mf.life -= deltaTime;
      mf.size *= 0.85;
      return mf.life > 0;
    });
  }

  // Update shell casings
  updateShellCasings(deltaTime) {
    this.shellCasings = this.shellCasings.filter(sc => {
      sc.x += sc.vx * deltaTime;
      sc.y += sc.vy * deltaTime;
      sc.vy += 200 * deltaTime; // gravity
      sc.rotation += sc.vr * deltaTime;
      sc.life -= deltaTime;
      // Bounce off floor
      if (sc.y > this.game.height - 10 && sc.vy > 0) {
        sc.y = this.game.height - 10;
        sc.vy *= -0.3;
        sc.vx *= 0.7;
      }
      return sc.life > 0;
    });
  }

  // Draw background with parallax stars
  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#0a0a0f');
    gradient.addColorStop(1, '#050510');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    ctx.save();
    this.stars.forEach(star => {
      const alpha = 0.3 + star.brightness * 0.7;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      if (star.size > 1.5) {
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = '#88ccff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  // Draw damage numbers
  drawDamageNumbers(ctx) {
    ctx.save();
    this.damageNumbers.forEach(dn => {
      ctx.globalAlpha = dn.life;
      ctx.fillStyle = dn.color;
      ctx.font = `bold ${16 * dn.scale}px 'Courier New'`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw glow
      ctx.shadowBlur = 8;
      ctx.shadowColor = dn.color;
      ctx.fillText(dn.isCrit ? `CRIT ${dn.value}!` : `${dn.value}`, dn.x, dn.y);
    });
    ctx.restore();
  }

  // Draw hit markers
  drawHitMarkers(ctx) {
    ctx.save();
    this.hitMarkers.forEach(hm => {
      ctx.globalAlpha = hm.life * 2;
      ctx.strokeStyle = hm.isKill ? '#ff4444' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 4;
      ctx.shadowColor = hm.isKill ? '#ff0000' : '#ffffff';
      
      const size = 12 * hm.scale;
      ctx.beginPath();
      ctx.moveTo(hm.x - size, hm.y - size);
      ctx.lineTo(hm.x + size, hm.y + size);
      ctx.moveTo(hm.x + size, hm.y - size);
      ctx.lineTo(hm.x - size, hm.y + size);
      ctx.stroke();
      
      if (hm.isKill) {
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('X', hm.x, hm.y - 15);
      }
    });
    ctx.restore();
  }

  // Draw muzzle flashes
  drawMuzzleFlashes(ctx) {
    ctx.save();
    this.muzzleFlashes.forEach(mf => {
      ctx.globalAlpha = mf.life * 3;
      ctx.translate(mf.x, mf.y);
      ctx.rotate(mf.angle);
      
      ctx.fillStyle = '#ffff00';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff8800';
      
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const r = mf.size * (0.5 + Math.random() * 0.5);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    });
    ctx.restore();
  }

  // Draw shell casings
  drawShellCasings(ctx) {
    ctx.save();
    this.shellCasings.forEach(sc => {
      ctx.globalAlpha = sc.life / 2;
      ctx.translate(sc.x, sc.y);
      ctx.rotate(sc.rotation);
      
      ctx.fillStyle = sc.color;
      ctx.fillRect(-3, -1.5, 6, 3);
      
      ctx.setTransform(1, 0, 0, 1, 0, 0);
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

  // Clear all effects
  clearAll() {
    this.damageNumbers = [];
    this.hitMarkers = [];
    this.muzzleFlashes = [];
    this.shellCasings = [];
  }
}

export { VisualEffectsSystem };
