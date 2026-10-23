// Enemy Entity

import { Entity, nearestTo } from '../systems/entity.js';
import { ENEMY_TYPES } from '../config/index.js';

// Shooter AI: the distance at which shooters start backing off, and how much
// faster they retreat than they approach.
const SHOOTER_RETREAT_RANGE = 200;
const SHOOTER_RETREAT_FACTOR = 2;

// How long an enemy sticks with the player it has picked.
//
// The target is re-picked on a timer instead of every frame. Which player
// is the nearest one changes all the time in a run with two of them - over
// a forty second run it changed about a hundred and thirty times - and an
// enemy that changes its mind that often never presses either of them.
// Holding on for a moment cuts the changes by two thirds.
const TARGET_LOCK_TIME = 1.5;

// The pause between two bites from the same enemy.
const CONTACT_COOLDOWN = 0.5;

// What a bite costs, as a fraction of the enemy's damage. Running into a
// ship hurts, but not as much as being shot by it.
const CONTACT_DAMAGE_SCALE = 0.25;

class Enemy extends Entity {
  constructor(type, x, y, difficultyMultiplier = 1) {
    const config = ENEMY_TYPES[type] || ENEMY_TYPES.grunt;

    super({
      x: x - config.size,
      y: y - config.size,
      width: config.size * 2,
      height: config.size * 2,
      color: config.color,
      name: config.name,
      hp: config.hp * difficultyMultiplier,
      maxHp: config.hp * difficultyMultiplier,
      damage: config.damage * difficultyMultiplier,
      speed: config.speed,
      armor: 0
    });

    this.type = type;
    this.config = config;
    this.xp = config.xp;
    this.score = config.score;
    this.shoots = config.shoots || false;
    this.shootCooldown = 0;

    // The player this enemy is going for, and how long it holds on to it.
    this.target = null;
    this.targetTimer = 0;
    // How long until this enemy can bite again.
    this.contactCooldown = 0;

    // Animation
    this.pulse = 0;
    this.hitFlash = 0;
  }

  // The player this enemy is chasing.
  //
  // It keeps the one it has for a moment, so that in a run with two
  // players it presses one of them instead of swaying between the two and
  // reaching neither.
  pickTarget(center, targets, deltaTime) {
    this.targetTimer -= deltaTime;
    const holding = this.target && !this.target.dead &&
      (Array.isArray(targets) ? targets.includes(this.target) : targets === this.target);
    if (holding && this.targetTimer > 0) return this.target;

    this.targetTimer = TARGET_LOCK_TIME;
    this.target = nearestTo(center.x, center.y, targets);
    return this.target;
  }

  // `targets` is the list of players in the run, or a single player. The
  // enemy goes after the nearest one - that is what makes a shared world
  // work, whoever is closest is the one being chased - and keeps that
  // choice for a moment at a time.
  update(deltaTime, targets, canvasWidth, canvasHeight) {
    if (this.dead) return false;

    this.pulse += deltaTime * 5;
    this.hitFlash = Math.max(0, this.hitFlash - deltaTime);

    // Calculate direction to player
    const center = this.getCenter();
    const player = this.pickTarget(center, targets, deltaTime);
    if (!player) return true;

    const playerCenter = player.getCenter ? player.getCenter() : { x: player.x, y: player.y };

    const dx = playerCenter.x - center.x;
    const dy = playerCenter.y - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Movement - MORE AGGRESSIVE with UNPREDICTABILITY
    if (distance > 0) {
      let speed = this.speed * 2.5; // 50% faster movement

      // Shooter keeps distance but more aggressively. The retreat has to be
      // faster than the approach or they close in and stop shooting, but not
      // so fast that they pin themselves against the screen edge.
      if (this.shoots && distance < SHOOTER_RETREAT_RANGE) {
        speed = -speed * SHOOTER_RETREAT_FACTOR;
      }

      // Add unpredictability - random deviation from direct path
      const wobble = Math.sin(Date.now() / 200 + this.id.charCodeAt(0)) * 0.3;
      const angleToPlayer = Math.atan2(dy, dx);
      const angleWithWobble = angleToPlayer + wobble;

      // Higher acceleration for more aggressive chasing
      this.vx += Math.cos(angleWithWobble) * speed * deltaTime * 1.5;
      this.vy += Math.sin(angleWithWobble) * speed * deltaTime * 1.5;

      // Occasionally change direction randomly for unpredictability
      if (Math.random() < 0.02) {
        this.vx += (Math.random() - 0.5) * speed * 0.5;
        this.vy += (Math.random() - 0.5) * speed * 0.5;
      }
    }

    // Apply physics
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Bounds
    this.clampToBounds(canvasWidth, canvasHeight);

    // Shooting - more aggressive (reduced cooldown)
    let shot = false;
    if (this.shoots) {
      this.shootCooldown -= deltaTime;
      if (this.shootCooldown <= 0 && distance < 450) { // Shooting range
        this.shootCooldown = 1.75; // Reduced cooldown from 2 to 1
        shot = true;
      }
    }

    // Contact damage.
    //
    // A bite is a real hit and not a trickle. The old code scaled the
    // damage by the frame time, which the invulnerability window then
    // swallowed: an enemy could sit on a player for a second and cost it
    // a fraction of a health point, which is why the wingman in a
    // dualist run was never in any danger.
    this.contactCooldown = Math.max(0, this.contactCooldown - deltaTime);
    let hit = null;
    if (this.contactCooldown <= 0 && this.collidesWithCircle(playerCenter.x, playerCenter.y, 20)) {
      const landed = player.takeDamage(this.damage * CONTACT_DAMAGE_SCALE);
      this.contactCooldown = CONTACT_COOLDOWN;
      if (landed > 0) hit = { target: player, damage: landed };
    }

    // An enemy can shoot and bite in the same frame, so the result carries
    // both: `action` is what the world has to do about the shooting, and
    // `hit` says that somebody was bitten.
    if (shot || hit) return { action: shot ? 'shoot' : null, target: player, hit };
    return true;
  }

  takeDamage(amount) {
    const actual = super.takeDamage(amount);
    this.hitFlash = 0.1;
    return actual;
  }

  draw(ctx) {
    const center = this.getCenter();

    ctx.save();

    // Hit flash
    if (this.hitFlash > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = this.hitFlash * 10;
      ctx.beginPath();
      ctx.arc(center.x, center.y, this.width * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Body with glow
    const pulseScale = 1 + Math.sin(this.pulse) * 0.05;

    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(center.x, center.y, (this.width / 2) * pulseScale, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(center.x, center.y, (this.width / 3) * pulseScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Shooter indicator - glowing ring
    if (this.shoots) {
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff00ff';
      ctx.beginPath();
      ctx.arc(center.x, center.y, this.width * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    // Health bar for tank/elite enemies
    if (this.type === 'tank' || this.type === 'elite') {
      this.drawHealthBar(ctx, center.x, this.y - 5, 30, 4);
    }
  }
}

export { Enemy, ENEMY_TYPES };
