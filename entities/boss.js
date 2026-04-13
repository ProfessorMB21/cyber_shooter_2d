// Boss Entity with Attack Patterns

import { Enemy } from './enemy.js';

// Boss configurations per level
const BOSS_PATTERNS = [
  // Level 5 - First boss
  {
    name: 'Cyber Drone',
    hp: 1200,
    damage: 40,
    speed: 60,
    pattern: 'beam',
    projectileCount: 12,
    projectileSpeed: 80,
    interval: 2.5
  },
  // Level 15 - Second boss
  {
    name: 'Cyber Drone Alpha',
    hp: 2000,
    damage: 95,
    speed: 60,
    pattern: 'swarm',
    projectileCount: 8,
    projectileSpeed: 150,
    interval: 2
  },
  // Level 30
  {
    name: 'Neon Destroyer',
    hp: 5000,
    damage: 50,
    speed: 50,
    pattern: 'beam',
    projectileCount: 5,
    projectileSpeed: 200,
    interval: 3
  },
  // Level 45
  {
    name: 'Orbital Warden',
    hp: 10000,
    damage: 70,
    speed: 40,
    pattern: 'orbit',
    projectileCount: 6,
    projectileSpeed: 120,
    interval: 2.5
  },
  // Level 60
  {
    name: 'Nova Prime',
    hp: 20000,
    damage: 100,
    speed: 35,
    pattern: 'nova',
    projectileCount: 12,
    projectileSpeed: 180,
    interval: 2
  },
  // Level 75
  {
    name: 'Crush Titan',
    hp: 40000,
    damage: 150,
    speed: 30,
    pattern: 'crush',
    projectileCount: 1,
    projectileSpeed: 300,
    interval: 4
  },
  // Level 90
  {
    name: 'Swarm Overlord',
    hp: 80000,
    damage: 200,
    speed: 45,
    pattern: 'swarm',
    projectileCount: 20,
    projectileSpeed: 150,
    interval: 1.5
  },
  // Level 100 - Final boss
  {
    name: 'Cyber Core',
    hp: 150000,
    damage: 300,
    speed: 70,
    pattern: 'crush',
    projectileCount: 3,
    projectileSpeed: 250,
    interval: 1
  }
];

class Boss extends Enemy {
  constructor(levelIndex, x, y, difficultyMultiplier = 1) {
    const config = BOSS_PATTERNS[Math.min(levelIndex - 1, BOSS_PATTERNS.length - 1)];

    super('elite', x, y, difficultyMultiplier);

    this.levelIndex = levelIndex;
    this.name = config.name;
    this.baseHp = config.hp * difficultyMultiplier;
    this.hp = this.baseHp;
    this.maxHp = this.baseHp;
    this.damage = config.damage * difficultyMultiplier;
    this.speed = config.speed;
    this.pattern = config.pattern;
    this.projectileCount = config.projectileCount;
    this.projectileSpeed = config.projectileSpeed;
    this.attackInterval = config.interval;

    this.width = 50;
    this.height = 50;
    this.color = '#ff0000';

    // State
    this.phase = 1;
    this.phaseThreshold = 0.45; // Switch phase at 45% HP
    this.shield = 0;
    this.attackTimer = 0;
    this.angle = 0;
    this.spinSpeed = 1;

    // Movement
    this.targetX = x;
    this.targetY = y;
    this.moveTimer = 0;

    // Pattern-specific data
    this.orbitProjectiles = [];
    this.crushRadius = 0;
    this.crushActive = false;
  }

  update(deltaTime, player, canvasWidth, canvasHeight) {
    if (this.dead) return false;

    // Phase transition
    if (this.phase === 1 && this.hp <= this.maxHp * this.phaseThreshold) {
      this.phase = 2;
      this.damage *= 1.3;
      this.speed *= 1.2;
      this.shield = this.maxHp * 0.1;
    }

    // Update angle for spiral patterns
    this.angle += deltaTime * this.spinSpeed * (this.phase === 2 ? 2 : 1);

    // Movement - hover around center or follow player
    this.moveTimer -= deltaTime;
    if (this.moveTimer <= 0) {
      this.moveTimer = 3;
      if (this.pattern === 'crush') {
        // Crush boss follows player
        this.targetX = player.x;
        this.targetY = player.y;
      } else {
        // Other bosses pick random positions
        this.targetX = Math.random() * (canvasWidth - 200) + 100;
        this.targetY = Math.random() * (canvasHeight * 0.4) + 50;
      }
    }

    // Smooth movement
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    this.vx += dx * deltaTime * 0.5;
    this.vy += dy * deltaTime * 0.5;

    // Apply physics
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.vx *= 0.95;
    this.vy *= 0.95;

    // Bounds
    this.x = Math.max(50, Math.min(this.x, canvasWidth - 50));
    this.y = Math.max(50, Math.min(this.y, canvasHeight - 50));

    // Attacking
    this.attackTimer -= deltaTime;
    if (this.attackTimer <= 0) {
      this.attackTimer = this.attackInterval;
      return { action: 'attack', pattern: this.pattern, boss: this };
    }

    // Contact damage
    const center = this.getCenter();
    const playerCenter = player.getCenter ? player.getCenter() : { x: player.x, y: player.y };
    const distDx = center.x - playerCenter.x;
    const distDy = center.y - playerCenter.y;
    const distance = Math.sqrt(distDx * distDx + distDy * distDy);

    if (distance < 50) {
      player.takeDamage(this.damage * deltaTime * 2);
    }

    return true;
  }

  // Generate projectiles based on pattern
  getProjectiles(player) {
    const projectiles = [];
    const center = this.getCenter();
    const playerCenter = player.getCenter ? player.getCenter() : { x: player.x, y: player.y };

    switch (this.pattern) {
      case 'swarm':
        // Multiple projectiles in arc
        for (let i = 0; i < this.projectileCount; i++) {
          const angle = (Math.PI * 2 / this.projectileCount) * i + this.angle;
          projectiles.push({
            x: center.x,
            y: center.y,
            vx: Math.cos(angle) * this.projectileSpeed,
            vy: Math.sin(angle) * this.projectileSpeed,
            damage: this.damage * 0.5,
            color: '#ff4444',
            size: 8
          });
        }
        break;

      case 'beam':
        // Fast piercing beam
        const beamAngle = Math.atan2(playerCenter.y - center.y, playerCenter.x - center.x);
        for (let i = 0; i < this.projectileCount; i++) {
          const offset = (i - this.projectileCount / 2) * 0.1;
          projectiles.push({
            x: center.x,
            y: center.y,
            vx: Math.cos(beamAngle + offset) * this.projectileSpeed * 1.5,
            vy: Math.sin(beamAngle + offset) * this.projectileSpeed * 1.5,
            damage: this.damage,
            color: '#ff00ff',
            size: 12,
            piercing: true
          });
        }
        break;

      case 'orbit':
        // Orbiting projectiles that eventually fire outward
        for (let i = 0; i < this.projectileCount; i++) {
          const orbitAngle = this.angle + (Math.PI * 2 / this.projectileCount) * i;
          projectiles.push({
            x: center.x + Math.cos(orbitAngle) * 60,
            y: center.y + Math.sin(orbitAngle) * 60,
            vx: Math.cos(orbitAngle) * this.projectileSpeed * 0.8,
            vy: Math.sin(orbitAngle) * this.projectileSpeed * 0.8,
            damage: this.damage * 0.7,
            color: '#9d00ff',
            size: 10,
            orbit: true
          });
        }
        break;

      case 'nova':
        // Burst of projectiles in all directions
        const novaCount = this.projectileCount * (this.phase === 2 ? 2 : 1);
        for (let i = 0; i < novaCount; i++) {
          const angle = (Math.PI * 2 / novaCount) * i;
          projectiles.push({
            x: center.x,
            y: center.y,
            vx: Math.cos(angle) * this.projectileSpeed,
            vy: Math.sin(angle) * this.projectileSpeed,
            damage: this.damage * 0.4,
            color: '#ffff00',
            size: 6
          });
        }
        break;

      case 'crush':
        // AOE crush attack
        projectiles.push({
          x: center.x,
          y: center.y,
          vx: 0,
          vy: 0,
          damage: this.damage * 2,
          color: '#aa0000',
          size: 100,
          aoe: true,
          expand: true,
          maxSize: 150,
          duration: 1
        });
        break;
    }

    return projectiles;
  }

  takeDamage(amount) {
    // Shield absorbs damage first
    if (this.shield > 0) {
      const absorb = Math.min(this.shield, amount);
      this.shield -= absorb;
      amount -= absorb;
    }

    const actual = super.takeDamage(amount);
    return actual;
  }

  draw(ctx) {
    const center = this.getCenter();

    // Phase 2 aura
    if (this.phase === 2) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(center.x, center.y, 35 + Math.sin(this.angle * 2) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Shield
    if (this.shield > 0) {
      ctx.strokeStyle = '#4444ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(center.x, center.y, 40, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(center.x, center.y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = this.phase === 2 ? '#ff00ff' : '#ff8888';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Health bar
    const barWidth = 80;
    const barHeight = 8;
    const barX = center.x - barWidth / 2;
    const barY = this.y - 20;

    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health
    const hpPercent = this.hp / this.maxHp;
    ctx.fillStyle = hpPercent > 0.5 ? '#44ff44' : hpPercent > 0.25 ? '#ffff44' : '#ff4444';
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

    // Shield bar
    if (this.shield > 0) {
      ctx.fillStyle = '#4444ff';
      ctx.fillRect(barX, barY - 5, barWidth * (this.shield / (this.maxHp * 0.1)), 3);
    }

    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, center.x, barY - 10);

    // Phase indicator
    if (this.phase === 2) {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('PHASE 2', center.x, barY - 22);
    }
  }
}

export { Boss, BOSS_PATTERNS };
