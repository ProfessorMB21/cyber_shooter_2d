// Boss Entity with Attack Patterns

import { Enemy } from './enemy.js';
import { BOSS_PATTERNS } from '../config/bosses.js';
import { BossPatternGenerator } from './boss-patterns.js';

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
    this.phase = 1;
    this.phaseThreshold = 0.45;
    this.shield = 0;
    this.attackTimer = 0;
    this.angle = 0;
    this.spinSpeed = 1;
    this.targetX = x;
    this.targetY = y;
    this.moveTimer = 0;
  }

  update(deltaTime, player, canvasWidth, canvasHeight) {
    if (this.dead) return false;
    if (this.phase === 1 && this.hp <= this.maxHp * this.phaseThreshold) {
      this.phase = 2;
      this.damage *= 1.3;
      this.speed *= 1.2;
      this.shield = this.maxHp * 0.1;
    }
    this.angle += deltaTime * this.spinSpeed * (this.phase === 2 ? 2 : 1);
    this.moveTimer -= deltaTime;
    if (this.moveTimer <= 0) {
      this.moveTimer = 3;
      if (this.pattern === 'crush') {
        this.targetX = player.x;
        this.targetY = player.y;
      } else {
        this.targetX = Math.random() * (canvasWidth - 200) + 100;
        this.targetY = Math.random() * (canvasHeight * 0.4) + 50;
      }
    }
    const dx = this.targetX - this.x, dy = this.targetY - this.y;
    this.vx += dx * deltaTime * 0.5;
    this.vy += dy * deltaTime * 0.5;
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.vx *= 0.95;
    this.vy *= 0.95;
    this.x = Math.max(50, Math.min(this.x, canvasWidth - 50));
    this.y = Math.max(50, Math.min(this.y, canvasHeight - 50));
    this.attackTimer -= deltaTime;
    if (this.attackTimer <= 0) {
      this.attackTimer = this.attackInterval;
      return { action: 'attack', pattern: this.pattern, boss: this };
    }
    const center = this.getCenter();
    const playerCenter = player.getCenter ? player.getCenter() : { x: player.x, y: player.y };
    const dist = Math.hypot(center.x - playerCenter.x, center.y - playerCenter.y);
    if (dist < 50) player.takeDamage(this.damage * deltaTime * 2);
    return true;
  }

  getProjectiles(player) {
    return BossPatternGenerator.generate(this.pattern, this, player);
  }

  takeDamage(amount) {
    if (this.shield > 0) {
      const absorb = Math.min(this.shield, amount);
      this.shield -= absorb;
      amount -= absorb;
    }
    return super.takeDamage(amount);
  }

  draw(ctx) {
    const center = this.getCenter(), barWidth = 80, barHeight = 8;
    const barX = center.x - barWidth / 2, barY = this.y - 20;
    ctx.save();
    if (this.phase === 2) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff0000';
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(center.x, center.y, 35 + Math.sin(this.angle * 2) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (this.shield > 0) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#4444ff';
      ctx.strokeStyle = '#6666ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(center.x, center.y, 40, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(center.x, center.y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.phase === 2 ? '#ff00ff' : '#ff8888';
    ctx.fillStyle = this.phase === 2 ? '#ff00ff' : '#ff8888';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    const hpPercent = this.hp / this.maxHp;
    ctx.fillStyle = hpPercent > 0.5 ? '#44ff44' : hpPercent > 0.25 ? '#ffff44' : '#ff4444';
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
    if (this.shield > 0) {
      ctx.fillStyle = '#4444ff';
      ctx.fillRect(barX, barY - 5, barWidth * (this.shield / (this.maxHp * 0.1)), 3);
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, center.x, barY - 10);
    if (this.phase === 2) {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('PHASE 2', center.x, barY - 22);
    }
  }
}

export { Boss, BOSS_PATTERNS };
