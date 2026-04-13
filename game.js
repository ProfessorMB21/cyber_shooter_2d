// Main Game Engine

import { InputHandler } from './input.js';
import { ParticleSystem } from './systems/particles.js';
import { Player, BUILDS, SPEED_SCALE_FACTOR } from './entities/player.js';
import { Enemy, ENEMY_TYPES } from './entities/enemy.js';
import { Boss, BOSS_PATTERNS } from './entities/boss.js';
import { Projectile } from './entities/projectile.js';
import { Pickup } from './entities/pickup.js';
import { Collision } from './systems/collision.js';
import config from './config.js';

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

    // Difficulty - use config as single source of truth
    this.difficulty = this.difficulties[this.difficultySelection];

    // Build names
    this.buildNames = Object.keys(BUILDS);

    // Screen shake effect
    this.shakeAmount = 0;
    this.shakeDecay = 5;

    // Camera offset for shake
    this.cameraX = 0;
    this.cameraY = 0;

    // Background stars
    this.stars = this.generateStars();

    // Bind loop
    this.loop = this.loop.bind(this);
  }

  // Generate background stars
  generateStars() {
    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
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
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    });
  }

  // Draw background with parallax stars
  drawBackground(ctx) {
    // Deep space gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#0a0a0f');
    gradient.addColorStop(1, '#050510');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw stars with glow
    ctx.save();
    this.stars.forEach(star => {
      const alpha = 0.3 + star.brightness * 0.7;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Star glow for larger stars
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

  start(buildName, difficulty) {
    this.difficulty = difficulty || 'normal';
    const mult = config.difficulties[this.difficulty];

    // Create player
    this.player = new Player(buildName, this.width / 2, this.height - 100);
    this.player.currentStats.speed = this.player.baseStats.speed * SPEED_SCALE_FACTOR;

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

    // Update visual effects
    this.updateShake(deltaTime);
    this.updateStars(deltaTime);

    const mult = config.difficulties[this.difficulty];

    // Update player
    this.player.update(deltaTime, this.input, this.width, this.height);

    // Shooting
    if (this.input.isKeyDown(' ') && this.player.shootCooldown <= 0) {
      this.playerShoot();
    }

    // Skill activation (keys 1 and 2)
    if (this.input.isKeyPressed('1')) {
      this.activateSkill(0);
    }
    if (this.input.isKeyPressed('2')) {
      this.activateSkill(1);
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
              this.addShake(1.5); // Screen shake on AOE hit
            } else {
              this.player.takeDamage(p.damage);
              this.addShake(1); // Screen shake on hit
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

    // Random pickups (reduced spawn rate from 0.005 to 0.001)
    if (Math.random() < 0.001) {
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
    let damage = this.player.getDamage();

    // Apply overload bonus if active
    const now = Date.now();
    if (this.player.overloadActive && now < this.player.overloadEndTime) {
      damage *= 2;
    } else {
      this.player.overloadActive = false;
    }

    const center = this.player.getCenter();

    // Muzzle flash effect
    this.particles.spawnExplosion(center.x, center.y - 20, 5, '#ffff00', 0.1);

    // Light recoil shake
    this.addShake(0.5);

    // Check for piercing
    const piercing = this.player.nextShotPiercing || false;
    this.player.nextShotPiercing = false;

    // Base shot
    this.projectiles.push(new Projectile(
      center.x, center.y - 20,
      0, -400,
      damage, '#ffff00', true, { size: 6, piercing }
    ));

    // Multishot
    const projectileCount = this.player.currentStats.projectileCount || 1;
    if (projectileCount > 1) {
      for (let i = 1; i < projectileCount; i++) {
        const angle = (i % 2 === 1 ? 1 : -1) * Math.ceil(i / 2) * 0.2;
        this.projectiles.push(new Projectile(
          center.x, center.y - 20,
          Math.sin(angle) * 400, -Math.cos(angle) * 400,
          damage, '#ffff00', true, { size: 6, piercing }
        ));
      }
    }

    this.player.shootCooldown = 0.25;
  }

  activateSkill(slot) {
    if (!this.player || !this.player.build.abilities[slot]) return;

    const abilityName = this.player.build.abilities[slot];
    const result = this.player.activateAbility(abilityName);

    if (result && result.activated) {
      const center = this.player.getCenter();

      // Handle effects that need game context
      switch (result.effect) {
        case 'dash':
          // Dash forward
          const movement = this.input.getMovement();
          const dashSpeed = 800;
          if (movement.dx !== 0 || movement.dy !== 0) {
            this.player.vx += movement.dx * dashSpeed;
            this.player.vy += movement.dy * dashSpeed;
          } else {
            // Dash upward if not moving
            this.player.vy -= dashSpeed;
          }
          // Trail effect
          this.particles.spawnExplosion(center.x, center.y, 10, '#00ffff', 0.3);
          break;

        case 'teleport':
          // Teleport to random safe position
          this.player.x = Math.random() * (this.width - 100) + 50;
          this.player.y = Math.random() * (this.height * 0.5) + this.height * 0.3;
          this.particles.spawnExplosion(center.x, center.y, 15, '#ff00ff', 0.5);
          break;

        case 'aoe_damage':
          // Deal damage to all nearby enemies
          const aoeRadius = result.radius;
          this.enemies.forEach(e => {
            const dist = this.player.distanceTo(e);
            if (dist < aoeRadius) {
              e.takeDamage(result.damage * (1 - dist / aoeRadius));
              if (e.dead) this.onKill(e);
            }
          });
          // Visual effect
          this.particles.spawnExplosion(center.x, center.y, 20, '#ff8800', 0.5);
          this.addShake(2);
          break;

        case 'whirlwind':
          // Whirlwind visual
          this.particles.spawnExplosion(center.x, center.y, 15, '#ff0000', 0.5);
          break;

        case 'heal':
        case 'shield':
        case 'damage_boost':
        case 'speed_boost':
        case 'crit_shot':
        case 'invisibility':
        case 'max_rage':
        case 'damage_immunity':
          // These are handled internally by the player
          break;
      }
    }
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
    const mult = config.difficulties[this.difficulty];
    const types = Object.keys(ENEMY_TYPES);

    // Spawn count based on wave - INCREASED (doubled)
    const count = Math.min(10 + Math.floor(this.gameTime / 20), 25);

    for (let i = 0; i < count; i++) {
      // Choose enemy type based on game time - MORE DIFFICULT TYPES
      let typeIndex = 0;
      const rand = Math.random();
      if (this.gameTime > 30 && rand < 0.5) typeIndex = 1; // Fast (was 60s, now 30s)
      if (this.gameTime > 60 && rand < 0.35) typeIndex = 2; // Tank (was 120s, now 60s)
      if (this.gameTime > 90 && rand < 0.3) typeIndex = 3; // Shooter (was 180s, now 90s)
      if (this.gameTime > 120 && rand < 0.25) typeIndex = 4; // Elite (was 240s, now 120s)

      // Limit total enemies to prevent screen filling (max 40 enemies)
      if (this.enemies.length >= 30) break;

      const type = types[typeIndex];
      const x = Math.random() * (this.width - 100) + 50;
      const y = Math.random() * 200 - 50;

      this.enemies.push(new Enemy(type, x, y, mult.enemyHp));
    }
  }

  spawnBoss(index) {
    const mult = config.difficulties[this.difficulty];
    const x = this.width / 2;
    const y = 100;

    this.bosses.push(new Boss(index, x, y, mult.enemyHp));
  }

  onKill(enemy) {
    this.kills++;
    this.combo++;
    this.comboTimer = 3;

    const mult = config.difficulties[this.difficulty];
    const baseScore = enemy.score || 10;
    const comboMultiplier = Math.min(5, 1 + this.combo * 0.1);
    this.score += Math.floor(baseScore * mult.scoreMultiplier * comboMultiplier);

    // XP reduction as player progresses (higher level = less XP from low-level enemies)
    const levelPenalty = Math.max(0.5, 1 - (this.player.level - 0.8) * 0.05);
    this.player.addXP((enemy.xp || 10) * levelPenalty);

    // Spawn particles
    const center = enemy.getCenter();
    this.particles.spawnExplosion(center.x, center.y, 12, enemy.color);

    // Small screen shake on kill
    this.addShake(0.5);

    // Random pickup drop (reduced from 10% to 3%)
    if (Math.random() < 0.03) {
      const types = ['health', 'shield'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.pickups.push(new Pickup(center.x, center.y, type));
    }
  }

  onBossKill(boss) {
    const mult = config.difficulties[this.difficulty];
    this.score += Math.floor(1000 * mult.scoreMultiplier);
    // XP reduction as player progresses
    const bossLevelPenalty = Math.max(0.7, 1 - (this.player.level - 0.6) * 0.03);
    this.player.addXP(500 * bossLevelPenalty);

    // Lots of particles
    const center = boss.getCenter();
    this.particles.spawnExplosion(center.x, center.y, 50, '#ff00ff');

    // Strong screen shake on boss kill
    this.addShake(3);

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

    // Clear and draw background
    this.drawBackground(ctx);

    // Apply camera shake
    ctx.save();
    ctx.translate(this.cameraX, this.cameraY);

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

    ctx.restore();

    // UI (not affected by shake)
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
      this.player.drawCooldowns(ctx, this.width - 150, this.height - 100);
    }

    // Controls hint
    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('WASD/Arrows: Move | SPACE: Shoot | 1/2: Skills', 10, this.height - 120);
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

    // Instructions - MORE VISIBLE with background
    const instructionY = this.height - 100;

    // Draw background box for instructions
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.width / 2 - 250, instructionY - 35, 500, 70);

    // Border
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.width / 2 - 250, instructionY - 35, 500, 70);

    // Text
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('◀ LEFT/RIGHT ▸  Change Difficulty', this.width / 2, instructionY - 10);
    ctx.fillText('▲ UP/DOWN ▼    Select Build', this.width / 2, instructionY + 15);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('Press [SPACE] to Start!', this.width / 2, instructionY + 65);

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
