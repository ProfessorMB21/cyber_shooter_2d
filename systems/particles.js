// Particle System for Visual Effects with Object Pooling

class Particle {
  constructor(x, y, type, config = {}) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.config = { ...config };
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
        this.velocity = { x: 0, y: 0 };
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
        this.velocity = { x: (Math.random() - 0.5) * 0.3, y: -Math.random() * 1.5 };
        this.color = '#44ff44';
        this.size = this.config.size || Math.random() * 4 + 2;
        this.life = this.config.life || 1;
        this.decay = this.config.decay || 0.02;
        break;

      case 'buff':
        this.velocity = { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 };
        this.color = '#ff9944';
        this.size = this.config.size || Math.random() * 6 + 4;
        this.life = this.config.life || 1.2;
        this.decay = this.config.decay || 0.015;
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
        this.segments = [{ x: 0, y: 0 }];
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
    this.x += this.velocity.x * deltaTime * 60;
    this.y += this.velocity.y * deltaTime * 60;

    if (this.type === 'explosion') {
      this.velocity.y += 0.05 * deltaTime * 60;
    }

    if (this.type === 'critical') {
      this.rotation += this.rotationSpeed;
    }

    this.life -= this.decay * deltaTime * 60;
    this.size *= (0.98 ** (deltaTime * 60));

    return this.life > 0 && this.size > 0.1;
  }
}

class ParticleSystem {
  constructor(width = 800, height = 600) {
    this.particles = [];
    this.gameWidth = width;
    this.gameHeight = height;
    this.pool = [];
    this.poolSize = 300;
    this.preAllocatePool();
  }

  preAllocatePool() {
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push(new Particle(0, 0, 'explosion'));
    }
  }

  spawn(type, count, options = {}) {
    const x = options.x || this.gameWidth / 2;
    const y = options.y || this.gameHeight / 2;

    for (let i = 0; i < count; i++) {
      let p = this.pool.length > 0 ? this.pool.pop() : new Particle(x, y, type, options);
      p.x = x;
      p.y = y;
      p.type = type;
      p.config = { ...options };
      p.init();
      this.particles.push(p);
    }
  }

  spawnExplosion(x, y, count = 15, color = null) {
    return this.spawn('explosion', count, { x, y, spread: 2.5, life: 1, color: color || null });
  }

  spawnTrail(x, y, count = 3) {
    return this.spawn('trail', count, { x, y, color: '#888888', life: 0.8 });
  }

  spawnScreenShake() {
    return this.spawn('spark', 10, { spread: 1, life: 0.5, color: '#ffffff' });
  }

  spawnText(text, x, y, color = '#ffffff') {
    return this.spawn('text', 1, { text, x, y, color });
  }

  spawnCritical(x, y, count = 8) {
    return this.spawn('critical', count, { x, y, spread: 2, life: 0.8 });
  }

  spawnHealing(x, y, count = 6) {
    return this.spawn('healing', count, { x, y, life: 1 });
  }

  spawnBuff(x, y, count = 5) {
    return this.spawn('buff', count, { x, y, life: 1.2 });
  }

  spawnElectric(x, y, count = 4) {
    return this.spawn('electric', count, { x, y, spread: 3, life: 0.6 });
  }

  update(deltaTime = 1/60) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p.update(deltaTime) || p.x < -50 || p.x > this.gameWidth + 50 || p.y < -50 || p.y > this.gameHeight + 50) {
        this.pool.push(this.particles[i]);
        this.particles.splice(i, 1);
      }
    }
    return this.particles;
  }

  draw(ctx) {
    const byType = {};
    this.particles.forEach(p => {
      if (!byType[p.type]) byType[p.type] = [];
      byType[p.type].push(p);
    });

    Object.entries(byType).forEach(([type, particles]) => {
      this.drawBatch(ctx, type, particles);
    });
  }

  drawBatch(ctx, type, particles) {
    if (particles.length === 0) return;
    ctx.save();

    if (type === 'explosion' || type === 'spark' || type === 'trail') {
      particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (type === 'text') {
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillText(p.config.text || '', p.x, p.y);
      });
    } else if (type === 'critical') {
      particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = '#ffff44';
        ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
      });
    } else if (type === 'healing') {
      particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = '#44ff44';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (type === 'buff') {
      particles.forEach(p => {
        ctx.globalAlpha = p.life * 0.5;
        ctx.fillStyle = '#ff9944';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (type === 'electric') {
      particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        if (p.segments && p.segments[0]) {
          ctx.lineTo(p.segments[0].x, p.segments[0].y);
        }
        ctx.stroke();
      });
    }

    ctx.restore();
  }

  getActiveParticleCount() {
    return this.particles.length;
  }

  clear() {
    this.particles = [];
  }

  resize(width, height) {
    this.gameWidth = width;
    this.gameHeight = height;
  }
}

export { Particle, ParticleSystem };
