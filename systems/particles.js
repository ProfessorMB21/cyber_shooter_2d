// Particle System for Visual Effects

class Particle {
  constructor(x, y, type, config = {}) {
    this.x = x;
    this.y = y;
    this.type = type; // 'explosion', 'trail', 'text', 'spark'
    this.config = { ...config };

    // Randomize properties based on type
    this.init();
  }

  init() {
    switch (this.type) {
      case 'explosion':
        this.velocity = {
          x: (Math.random() - 0.5) * this.config.spread * 2,
          y: (Math.random() - 0.5) * this.config.spread * 2
        };
        this.color = this.config.color || this.getRandomExplosionColor();
        this.size = this.config.size || Math.random() * 6 + 2;
        this.life = this.config.life || 1;
        this.decay = this.config.decay || Math.random() * 0.02 + 0.02;
        break;

      case 'trail':
        this.velocity = {
          x: 0,
          y: 0
        };
        this.color = this.config.color || '#ffffff';
        this.size = this.config.size || 2;
        this.life = this.config.life || 0.5;
        this.decay = this.config.decay || 0.05;
        break;

      case 'spark':
        this.velocity = {
          x: (Math.random() - 0.5) * this.config.spread * 3,
          y: (Math.random() - 0.5) * this.config.spread * 3
        };
        this.color = this.getRandomSparkColor();
        this.size = this.config.size || Math.random() * 3 + 1;
        this.life = this.config.life || 0.3;
        this.decay = this.config.decay || 0.08;
        break;

      case 'text':
        this.color = this.config.color || '#ffffff';
        this.size = this.config.size || 16;
        this.life = 1;
        this.decay = 0.01;
        this.fontSize = this.config.fontSize || this.size;
        break;

      case 'critical':
        this.velocity = {
          x: (Math.random() - 0.5) * this.config.spread * 2,
          y: (Math.random() - 0.5) * this.config.spread * 2 - 1
        };
        this.color = '#ffff44';
        this.size = this.config.size || Math.random() * 5 + 3;
        this.life = this.config.life || 0.8;
        this.decay = this.config.decay || 0.03;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        break;

      case 'healing':
        this.velocity = {
          x: (Math.random() - 0.5) * 0.3,
          y: -Math.random() * 1.5
        };
        this.color = '#44ff44';
        this.size = this.config.size || Math.random() * 4 + 2;
        this.life = this.config.life || 1;
        this.decay = this.config.decay || 0.02;
        this.maxSize = this.size * 2;
        break;

      case 'buff':
        this.velocity = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5
        };
        this.color = '#ff9944';
        this.size = this.config.size || Math.random() * 6 + 4;
        this.life = this.config.life || 1.2;
        this.decay = this.config.decay || 0.015;
        this.glowRadius = this.size * 1.5;
        break;

      case 'electric':
        this.velocity = {
          x: (Math.random() - 0.5) * this.config.spread * 2.5,
          y: (Math.random() - 0.5) * this.config.spread * 2.5
        };
        this.color = '#00ffff';
        this.size = this.config.size || Math.random() * 4 + 2;
        this.life = this.config.life || 0.6;
        this.decay = this.config.decay || 0.04;
        this.segments = [];
        for (let i = 0; i < 4; i++) {
          this.segments.push({
            x: this.x + (Math.random() - 0.5) * 20,
            y: this.y + (Math.random() - 0.5) * 20
          });
        }
        break;
    }
  }

  getRandomExplosionColor() {
    const colors = ['#ff4444', '#44ff44', '#ffff44', '#ff00ff', '#00ffff', '#9d00ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getRandomSparkColor() {
    return Math.random() > 0.5 ? '#ffffff' : '#ffd700';
  }

  update(deltaTime) {
    // Apply velocity scaled by deltaTime
    this.x += this.velocity.x * deltaTime * 60;
    this.y += this.velocity.y * deltaTime * 60;

    // Add some gravity for explosions
    if (this.type === 'explosion') {
      this.velocity.y += 0.05 * deltaTime * 60;
    }

    // Update rotation for critical particles
    if (this.type === 'critical') {
      this.rotation += this.rotationSpeed;
    }

    // Update electric segments
    if (this.type === 'electric') {
      this.segments.forEach(seg => {
        seg.x += (Math.random() - 0.5) * 2;
        seg.y += (Math.random() - 0.5) * 2;
      });
    }

    // Decay life
    this.life -= this.decay * deltaTime * 60;
    this.size *= (0.98 ** (deltaTime * 60));

    // Return false when done
    if (this.life <= 0 || this.size <= 0.1) {
      return false;
    }
    return true;
  }

  draw(ctx) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;

    if (this.type === 'text') {
      ctx.font = `bold ${this.fontSize}px 'Courier New'`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.config.text || '', this.x, this.y);
    } else if (this.type === 'critical') {
      // Draw rotating star
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * this.size;
        const y = Math.sin(angle) * this.size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (this.type === 'healing') {
      // Draw expanding circle
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (this.type === 'buff') {
      // Draw glowing orb with halo
      ctx.save();
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.glowRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (this.type === 'electric') {
      // Draw jagged lightning bolts
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(1, this.size * 0.5);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      this.segments.forEach(seg => {
        ctx.lineTo(seg.x, seg.y);
      });
      ctx.stroke();
    } else {
      // Draw circle/ellipse (for explosion, trail, spark)
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  constructor(width = 800, height = 600) {
    this.particles = [];
    this.gameWidth = width;
    this.gameHeight = height;
  }

  // Spawn particles of specified type
  spawn(type, count, options = {}) {
    const x = options.x || this.gameWidth / 2 || 400;
    const y = options.y || this.gameHeight / 2 || 300;

    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, type, options));
    }
  }

  // Spawn explosion particles at position
  spawnExplosion(x, y, count = 15, color = null) {
    return this.spawn('explosion', count, {
      x,
      y,
      spread: 2.5,
      life: 1,
      color: color || null
    });
  }

  // Spawn trail particles
  spawnTrail(x, y, count = 3) {
    return this.spawn('trail', count, {
      x,
      y,
      color: '#888888',
      life: 0.8
    });
  }

  // Spawn screen shake
  spawnScreenShake() {
    return this.spawn('spark', 10, {
      spread: 1,
      life: 0.5,
      color: '#ffffff'
    });
  }

  // Spawn text particles
  spawnText(text, x, y, color = '#ffffff') {
    return this.spawn('text', 1, {
      text,
      x,
      y,
      color
    });
  }

  // Spawn critical hit particles (yellow stars)
  spawnCritical(x, y, count = 8) {
    return this.spawn('critical', count, {
      x,
      y,
      spread: 2,
      life: 0.8
    });
  }

  // Spawn healing particles (green circles)
  spawnHealing(x, y, count = 6) {
    return this.spawn('healing', count, {
      x,
      y,
      life: 1
    });
  }

  // Spawn buff particles (orange glows)
  spawnBuff(x, y, count = 5) {
    return this.spawn('buff', count, {
      x,
      y,
      life: 1.2
    });
  }

  // Spawn electric particles (cyan lightning)
  spawnElectric(x, y, count = 4) {
    return this.spawn('electric', count, {
      x,
      y,
      spread: 3,
      life: 0.6
    });
  }

  update(deltaTime = 1/60) {
    // Update all particles
    this.particles = this.particles.filter(p => {
      return p.update(deltaTime);
    });
    return this.particles;
  }

  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }

  getActiveParticleCount() {
    return this.particles.length;
  }

  // Clear all particles (debug)
  clear() {
    this.particles = [];
  }

  // Resize (called when canvas size changes)
  resize(width, height) {
    this.gameWidth = width;
    this.gameHeight = height;
  }
}

export { Particle, ParticleSystem };
