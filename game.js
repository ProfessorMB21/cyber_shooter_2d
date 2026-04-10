// Main Game Engine

import { InputHandler } from './input.js';
import { ParticleSystem } from './systems/particles.js';
import { Player, BUILDS } from './entities/player.js';
import { Enemy, ENEMY_TYPES } from './entities/enemy.js';
import { Boss, BOSS_PATTERNS } from './entities/boss.js';
import config from './config.js';

// Projectile class
class Projectile {
  constructor(x, y, vx, vy, damage, color, isPlayer = false, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.color = color;
    this.isPlayer = isPlayer;
    this.dead = false;
    this.size = options.size || 6;
    this.piercing = options.piercing || false;
    this.aoe = options.aoe || false;
    this.expand = options.expand || false;
    this.maxSize = options.maxSize || this.size;
    this.duration = options.duration || 0;
    this.hits = [];

    if (this.aoe) {
      this.size = 0;
    }
  }

  update(deltaTime) {
    if (this.dead) return false;

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // AOE expansion
    if (this.expand && this.size < this.maxSize) {
      this.size += this.maxSize * deltaTime;
    }

    // Duration countdown
    if (this.duration > 0) {
      this.duration -= deltaTime;
      if (this.duration <= 0) {
        this.dead = true;
      }
    }

    // Out of bounds
    if (this.x < -50 || this.x > 850 || this.y < -50 || this.y > 650) {
      if (!this.aoe) {
        this.dead = true;
      }
    }

    return !this.dead;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Trail effect
    if (!this.aoe) {
      ctx.fillStyle = this.color + '44';
      ctx.beginPath();
      ctx.arc(this.x - this.vx * 0.02, this.y - this.vy * 0.02, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Pickup class
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
        this.value = 50;
        this.color = '#44ff44';
        break;
      case 'shield':
        this.value = 25;
        this.color = '#4444ff';
        break;
      case 'speed':
        this.value = 20;
        this.color = '#ffff44';
        break;
      case 'damage':
        this.value = 5;
        this.color = '#ff4444';
        break;
      default:
        this.value = 10;
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

// Main Game class
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Input
    this.input = new InputHandler(canvas);

    // Particles
    this.particles = new ParticleSystem(this.width, this.height);

    // Game state
    this.state = 'menu'; // menu, playing, paused, gameover, levelup
    this.buildSelection = 0;
    this.difficultySelection = 1;
    this.difficulties = ['easy', 'normal', 'hard', 'nightmare'];

    // Game data
    this.player = null;
    this.enemies = [];
    this.bosses = [];
    this.projectiles = [];
    this.pickups = [];

    // Timing
    this.lastTime = 0;
    this.gameTime = 0;
    this.wave = 1;

    // Spawning
    this.spawnTimer = 0;
    this.spawnInterval = 2;
    this.bossSpawned = [];

    // Score
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.kills = 0;

    // Difficulty
    this.difficulty = this.difficulties[this.difficultySelection];
    this.difficultyMultipliers = {
      easy: { enemyHp: 0.8, enemyDamage: 0.6, enemySpeed: 0.7, score: 0.5 },
      normal: { enemyHp: 1, enemyDamage: 1, enemySpeed: 1, score: 1 },
      hard: { enemyHp: 1.4, enemyDamage: 1.4, enemySpeed: 1.4, score: 1.5 },
      nightmare: { enemyHp: 2, enemyDamage: 2, enemySpeed: 1.8, score: 2.5 }
    };

    // Build names
    this.buildNames = Object.keys(BUILDS);

    // Bind loop
    this.loop = this.loop.bind(this);
  }

  start(buildName, difficulty) {
    this.difficulty = difficulty || 'normal';
    const mult = this.difficultyMultipliers[this.difficulty];

    // Create player
    this.player = new Player(buildName, this.width / 2, this.height - 100);
    this.player.currentStats.speed = this.player.baseStats.speed * 80;

    // Reset game data
    this.enemies = [];
    this.bosses = [];
    this.projectiles = [];
    this.pickups = [];
    this.particles.clear();

    this.gameTime = 0;
    this.wave = 1;
    this.score = 0;
    this.combo = 0;
    this.kills = 0;
    this.bossSpawned = [];
    this.spawnTimer = 0;

    this.state = 'playing';
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  loop(timestamp) {
    if (this.state !== 'playing') {
      if (this.state === 'menu') {
        this.renderMenu();
        requestAnimationFrame(this.loop);
      } else if (this.state === 'gameover') {
        this.renderGameOver();
        requestAnimationFrame(this.loop);
      } else if (this.state === 'levelup') {
        this.renderLevelUp();
        requestAnimationFrame(this.loop);
      }
      return;
    }

    const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.loop);
  }

  update(deltaTime) {
    this.gameTime += deltaTime;
    this.comboTimer -= deltaTime;
    if (this.comboTimer <= 0) {
      this.combo = 0;
    }

    const mult = this.difficultyMultipliers[this.difficulty];

    // Update player
    this.player.update(deltaTime, this.input, this.width, this.height);

    // Shooting
    if (this.input.isKeyDown(' ') && this.player.shootCooldown <= 0) {
      this.playerShoot();
    }

    // Update projectiles
    this.projectiles = this.projectiles.filter(p => {
      const alive = p.update(deltaTime);
      if (alive) {
        // Check collisions
        if (p.isPlayer) {
          // Player projectile hits enemies
          this.enemies.forEach(e => {
            if (!p.hits.includes(e) && !e.dead) {
              const dx = p.x - e.getCenter().x;
              const dy = p.y - e.getCenter().y;
              if (dx * dx + dy * dy < (p.size + e.width / 2) ** 2) {
                e.takeDamage(p.damage);
                if (!p.piercing) {
                  p.dead = true;
                } else {
                  p.hits.push(e);
                }

                if (e.dead) {
                  this.onKill(e);
                }
              }
            }
          });

          // Player projectile hits bosses
          this.bosses.forEach(b => {
            if (!p.hits.includes(b) && !b.dead) {
              const dx = p.x - b.getCenter().x;
              const dy = p.y - b.getCenter().y;
              if (dx * dx + dy * dy < (p.size + 25) ** 2) {
                b.takeDamage(p.damage);
                if (!p.piercing) {
                  p.dead = true;
                } else {
                  p.hits.push(b);
                }

                if (b.dead) {
                  this.onBossKill(b);
                }
              }
            }
          });
        } else {
          // Enemy projectile hits player
          const pc = this.player.getCenter();
          const dx = p.x - pc.x;
          const dy = p.y - pc.y;
          if (dx * dx + dy * dy < (p.size + 15) ** 2) {
            if (p.aoe) {
              this.player.takeDamage(p.damage * deltaTime * 5);
            } else {
              this.player.takeDamage(p.damage);
              p.dead = true;
            }
          }
        }
      }
      return alive;
    });

    // Update enemies
    this.enemies = this.enemies.filter(e => {
      const result = e.update(deltaTime, this.player, this.width, this.height);
      if (result && result.action === 'shoot') {
        this.enemyShoot(e, result.target);
      }
      return !e.dead;
    });

    // Update bosses
    this.bosses = this.bosses.filter(b => {
      const result = b.update(deltaTime, this.player, this.width, this.height);
      if (result && result.action === 'attack') {
        const projectiles = b.getProjectiles(this.player);
        projectiles.forEach(p => {
          this.projectiles.push(new Projectile(
            p.x, p.y, p.vx, p.vy, p.damage, p.color, false,
            { size: p.size, piercing: p.piercing, aoe: p.aoe, expand: p.expand, maxSize: p.maxSize, duration: p.duration }
          ));
        });
      }
      return !b.dead;
    });

    // Update pickups
    this.pickups = this.pickups.filter(p => p.update(deltaTime, this.player));

    // Update particles
    this.particles.update(deltaTime);

    // Spawning
    this.spawnTimer -= deltaTime;
    if (this.spawnTimer <= 0) {
      this.spawnEnemies();
      this.spawnTimer = Math.max(0.5, this.spawnInterval - this.gameTime * 0.01);
    }

    // Boss spawning
    config.bosses.levels.forEach((level, index) => {
      if (Math.floor(this.gameTime / 60) >= level && !this.bossSpawned.includes(index)) {
        this.spawnBoss(index + 1);
        this.bossSpawned.push(index);
      }
    });

    // Random pickups
    if (Math.random() < 0.005) {
      const types = ['health', 'shield', 'speed', 'damage'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.pickups.push(new Pickup(
        Math.random() * (this.width - 100) + 50,
        Math.random() * (this.height - 100) + 50,
        type
      ));
    }

    // Check game over
    if (this.player.dead) {
      this.state = 'gameover';
    }

    // Level up check
    if (this.player.xp >= this.player.xpToNextLevel) {
      this.player.levelUp();
      this.state = 'levelup';
      setTimeout(() => {
        if (this.state === 'levelup') {
          this.state = 'playing';
        }
      }, 2000);
    }
  }

  playerShoot() {
    const center = this.player.getCenter();
    const damage = this.player.getDamage();

    // Base shot
    this.projectiles.push(new Projectile(
      center.x, center.y - 20,
      0, -400,
      damage, '#ffff00', true, { size: 6 }
    ));

    // Multishot
    const projectileCount = this.player.currentStats.projectileCount || 1;
    if (projectileCount > 1) {
      for (let i = 1; i < projectileCount; i++) {
        const angle = (i % 2 === 1 ? 1 : -1) * Math.ceil(i / 2) * 0.2;
        this.projectiles.push(new Projectile(
          center.x, center.y - 20,
          Math.sin(angle) * 400, -Math.cos(angle) * 400,
          damage, '#ffff00', true, { size: 6 }
        ));
      }
    }

    this.player.shootCooldown = 0.25;
  }

  enemyShoot(enemy, target) {
    const center = enemy.getCenter();
    const tc = target.getCenter ? target.getCenter() : { x: target.x, y: target.y };
    const angle = Math.atan2(tc.y - center.y, tc.x - center.x);

    this.projectiles.push(new Projectile(
      center.x, center.y,
      Math.cos(angle) * 200, Math.sin(angle) * 200,
      enemy.damage, '#ff4444', false, { size: 5 }
    ));
  }

  spawnEnemies() {
    const mult = this.difficultyMultipliers[this.difficulty];
    const types = Object.keys(ENEMY_TYPES);

    // Spawn count based on wave
    const count = Math.min(5 + Math.floor(this.gameTime / 30), 15);

    for (let i = 0; i < count; i++) {
      // Choose enemy type based on game time
      let typeIndex = 0;
      const rand = Math.random();
      if (this.gameTime > 60 && rand < 0.2) typeIndex = 1; // Fast
      if (this.gameTime > 120 && rand < 0.1) typeIndex = 2; // Tank
      if (this.gameTime > 180 && rand < 0.15) typeIndex = 3; // Shooter
      if (this.gameTime > 240 && rand < 0.05) typeIndex = 4; // Elite

      const type = types[typeIndex];
      const x = Math.random() * (this.width - 100) + 50;
      const y = Math.random() * 200 - 50;

      this.enemies.push(new Enemy(type, x, y, mult.enemyHp));
    }
  }

  spawnBoss(index) {
    const mult = this.difficultyMultipliers[this.difficulty];
    const x = this.width / 2;
    const y = 100;

    this.bosses.push(new Boss(index, x, y, mult.enemyHp));
  }

  onKill(enemy) {
    this.kills++;
    this.combo++;
    this.comboTimer = 3;

    const mult = this.difficultyMultipliers[this.difficulty];
    const baseScore = enemy.score || 10;
    const comboMultiplier = Math.min(5, 1 + this.combo * 0.1);
    this.score += Math.floor(baseScore * mult.score * comboMultiplier);

    this.player.addXP(enemy.xp || 10);

    // Spawn particles
    const center = enemy.getCenter();
    this.particles.spawnExplosion(center.x, center.y, 8, enemy.color);

    // Random pickup drop
    if (Math.random() < 0.1) {
      const types = ['health', 'shield'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.pickups.push(new Pickup(center.x, center.y, type));
    }
  }

  onBossKill(boss) {
    const mult = this.difficultyMultipliers[this.difficulty];
    this.score += Math.floor(1000 * mult.score);
    this.player.addXP(500);

    // Lots of particles
    const center = boss.getCenter();
    this.particles.spawnExplosion(center.x, center.y, 30, '#ff00ff');

    // Guaranteed pickups
    for (let i = 0; i < 3; i++) {
      const types = ['health', 'shield', 'speed', 'damage'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.pickups.push(new Pickup(
        center.x + (Math.random() - 0.5) * 100,
        center.y + (Math.random() - 0.5) * 100,
        type
      ));
    }
  }

  render() {
    const ctx = this.ctx;

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw particles (background)
    this.particles.draw(ctx);

    // Draw pickups
    this.pickups.forEach(p => p.draw(ctx));

    // Draw player
    if (this.player) {
      this.player.draw(ctx);
    }

    // Draw enemies
    this.enemies.forEach(e => e.draw(ctx));

    // Draw bosses
    this.bosses.forEach(b => b.draw(ctx));

    // Draw projectiles
    this.projectiles.forEach(p => p.draw(ctx));

    // Draw particles (foreground)

    // UI
    this.renderUI(ctx);
  }

  renderUI(ctx) {
    // Score
    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${Math.floor(this.score)}`, 10, 25);
    ctx.fillText(`Time: ${Math.floor(this.gameTime)}s`, 10, 45);
    ctx.fillText(`Wave: ${this.wave}`, 10, 65);
    ctx.fillText(`Kills: ${this.kills}`, 10, 85);

    // Combo
    if (this.combo > 1) {
      ctx.fillStyle = '#ff0';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`COMBO x${this.combo}`, 10, 110);
    }

    // Player stats
    if (this.player) {
      const p = this.player;
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.fillText(`HP: ${Math.floor(p.hp)}/${p.currentStats.maxHp}`, 10, this.height - 60);
      ctx.fillText(`DMG: ${p.currentStats.damage}`, 10, this.height - 45);
      ctx.fillText(`SPD: ${Math.floor(p.currentStats.speed)}`, 10, this.height - 30);
      ctx.fillText(`LVL: ${p.level}`, 10, this.height - 15);

      // Shield
      if (p.shield > 0) {
        ctx.fillStyle = '#44f';
        ctx.fillText(`Shield: ${Math.floor(p.shield)}`, 120, this.height - 60);
      }

      // XP bar
      const xpPercent = p.xp / p.xpToNextLevel;
      ctx.fillStyle = '#333';
      ctx.fillRect(10, this.height - 10, 200, 6);
      ctx.fillStyle = '#4f4';
      ctx.fillRect(10, this.height - 10, 200 * xpPercent, 6);
    }

    // Abilities
    if (this.player && this.player.build) {
      this.player.drawCooldowns(ctx, this.width - 150, this.height - 60);
    }

    // Controls hint
    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.fillText('WASD/Arrows: Move | SPACE: Shoot', 10, this.height - 80);
  }

  renderMenu() {
    const ctx = this.ctx;

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw some ambient particles
    this.particles.update(1/60);
    this.particles.draw(ctx);

    // Title
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CYBER SHOOTER', this.width / 2, 100);

    ctx.fillStyle = '#888';
    ctx.font = '20px monospace';
    ctx.fillText('A Retro Space Shooter', this.width / 2, 130);

    // Difficulty selection
    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.fillText('Select Difficulty:', this.width / 2, 180);

    this.difficulties.forEach((diff, i) => {
      const y = 210 + i * 35;
      const selected = i === this.difficultySelection;

      // Highlight
      if (selected) {
        ctx.fillStyle = '#0f0';
        ctx.fillRect(this.width / 2 - 100, y - 20, 200, 28);
        ctx.fillStyle = '#000';
      } else {
        ctx.fillStyle = '#444';
      }

      ctx.font = selected ? 'bold 18px monospace' : '18px monospace';
      ctx.fillText(diff.toUpperCase(), this.width / 2, y);
    });

    // Build selection
    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.fillText('Select Build:', this.width / 2, 380);

    this.buildNames.forEach((build, i) => {
      const buildData = BUILDS[build];
      const y = 410 + i * 45;
      const selected = i === this.buildSelection;

      // Box
      ctx.fillStyle = selected ? '#0f0' : '#222';
      ctx.fillRect(this.width / 2 - 150, y - 25, 300, 38);

      // Border
      ctx.strokeStyle = selected ? '#fff' : '#444';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.width / 2 - 150, y - 25, 300, 38);

      // Name
      ctx.fillStyle = selected ? '#000' : buildData.color;
      ctx.font = selected ? 'bold 16px monospace' : '16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(buildData.name, this.width / 2 - 140, y - 5);

      // Description
      ctx.fillStyle = selected ? '#333' : '#888';
      ctx.font = '12px monospace';
      ctx.fillText(buildData.description.substring(0, 35), this.width / 2 - 140, y + 10);
    });

    // Instructions
    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Use UP/DOWN to select build, LEFT/RIGHT for difficulty', this.width / 2, this.height - 60);
    ctx.fillText('Press SPACE to start', this.width / 2, this.height - 40);

    // Handle input
    if (this.input.isKeyPressed('ArrowUp')) {
      this.buildSelection = (this.buildSelection - 1 + this.buildNames.length) % this.buildNames.length;
    }
    if (this.input.isKeyPressed('ArrowDown')) {
      this.buildSelection = (this.buildSelection + 1) % this.buildNames.length;
    }
    if (this.input.isKeyPressed('ArrowLeft')) {
      this.difficultySelection = (this.difficultySelection - 1 + this.difficulties.length) % this.difficulties.length;
    }
    if (this.input.isKeyPressed('ArrowRight')) {
      this.difficultySelection = (this.difficultySelection + 1) % this.difficulties.length;
    }
    if (this.input.isKeyPressed(' ')) {
      this.start(this.buildNames[this.buildSelection], this.difficulties[this.difficultySelection]);
    }
  }

  renderGameOver() {
    const ctx = this.ctx;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Title
    ctx.fillStyle = '#f00';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 50);

    // Stats
    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText(`Final Score: ${Math.floor(this.score)}`, this.width / 2, this.height / 2 + 10);
    ctx.fillText(`Time Survived: ${Math.floor(this.gameTime)}s`, this.width / 2, this.height / 2 + 40);
    ctx.fillText(`Kills: ${this.kills}`, this.width / 2, this.height / 2 + 70);

    // Restart
    ctx.fillStyle = '#888';
    ctx.font = '18px monospace';
    ctx.fillText('Press SPACE to restart', this.width / 2, this.height / 2 + 120);

    if (this.input.isKeyPressed(' ')) {
      this.state = 'menu';
    }
  }

  renderLevelUp() {
    const ctx = this.ctx;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 50, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Title
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL UP!', this.width / 2, this.height / 2);

    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText(`Level ${this.player.level}`, this.width / 2, this.height / 2 + 50);

    // Passive text
    ctx.fillStyle = '#ff0';
    ctx.font = '16px monospace';
    ctx.fillText(this.player.build.passive, this.width / 2, this.height / 2 + 90);
  }
}

export { Game };
