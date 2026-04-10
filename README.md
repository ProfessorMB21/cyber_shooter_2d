# Cyber Shooter

A fully-featured 2D retro-style space shooter built with HTML5 Canvas and JavaScript.

## Features

### 7 Unique Player Builds
1. **Fighter** - Balanced with high health and damage
2. **Glass Cannon** - Extreme damage but fragile
3. **Tank** - Massive health pool, slow
4. **Balanced** - Versatile all-rounder
5. **Sniper** - High crit chance, precision attacks
6. **Berserker** - Rage builds over time, damage increases with rage
7. **Guardian** - High armor, support capabilities

### 4 Difficulty Levels
- **Easy** - For newcomers (0.7x enemy stats)
- **Normal** - Standard difficulty (1x enemy stats)
- **Hard** - For experienced players (1.4x enemy stats)
- **Nightmare** - For true masters (2x enemy stats)

### Enemy Types
- **Grunt** - Basic enemy, balanced stats
- **Fast** - Quick but fragile
- **Tank** - Slow but durable
- **Shooter** - Ranged attacks, keeps distance
- **Elite** - Stronger variant with high rewards

### Boss System
7 bosses spawn at specific intervals with unique attack patterns:
- **Swarm** - Multiple projectiles in arc
- **Beam** - Fast piercing beams
- **Orbit** - Orbiting projectiles
- **Nova** - Burst of projectiles in all directions
- **Crush** - Large AOE attack

### Game Systems
- **Particle Effects** - Explosions, trails, and visual feedback
- **Leveling System** - Gain XP from kills, level up for stat increases
- **Combo System** - Chain kills for score multipliers
- **Pickups** - Health, shield, speed, and damage boosts
- **Shield Mechanic** - Absorbs damage before HP
- **Critical Hits** - Based on build stats
- **Evasion** - Chance to dodge attacks
- **Abilities** - Each build has unique active abilities

## Controls

- **WASD / Arrow Keys** - Move
- **SPACE** - Shoot
- **UP/DOWN** - Menu navigation (build selection)
- **LEFT/RIGHT** - Difficulty selection

## How to Play

1. Open `index.html` in a web browser
2. Select difficulty (LEFT/RIGHT arrows)
3. Select build (UP/DOWN arrows)
4. Press SPACE to start
5. Survive waves of enemies and defeat bosses!

## Project Structure

```
/
├── index.html          # Main HTML entry point
├── main.js             # Entry point, initializes game
├── game.js             # Main Game class with all logic
├── config.js           # Game configuration (builds, difficulties, bosses)
├── input.js            # Input handling (keyboard, mouse)
├── entities.js         # Entity exports
├── entities/
│   ├── player.js       # Player builds and stats
│   ├── enemy.js        # Enemy types and behavior
│   └── boss.js         # Boss patterns and AI
└── systems/
    ├── entity.js       # Base Entity class
    ├── particles.js    # Particle effects system
    ├── collision.js    # Collision detection utilities
    ├── projectiles.js  # Projectile management
    ├── enemies.js      # Enemy manager (legacy)
    ├── bosses.js       # Boss manager (legacy)
    └── pickups.js      # Pickup system
```

## Technical Details

- **Canvas Size**: 800x600
- **Frame Rate**: 60 FPS (using requestAnimationFrame)
- **Delta Time**: Used for frame-rate independent movement
- **Module System**: CommonJS (Node.js style)
- **No External Dependencies**: Pure JavaScript

## Game Loop

1. Process input
2. Update entities (player, enemies, bosses, projectiles, pickups)
3. Check collisions
4. Spawn enemies/bosses
5. Update particles
6. Render everything
7. Repeat

## Build Stats

Each build has unique base stats:
- **HP/Max HP** - Health points
- **Damage** - Base attack damage
- **Speed** - Movement speed
- **Armor** - Damage reduction percentage
- **Evasion** - Dodge chance
- **Critical Chance** - Chance for critical hits
- **Critical Damage** - Critical hit multiplier
- **Regen** - Health regeneration per second

## Passive Abilities

- **Fighter**: 10% HP gain per level
- **Glass Cannon**: 12% damage per level
- **Tank**: 15% HP gain per level
- **Balanced**: 8% all stats per level
- **Sniper**: 10% crit chance per level
- **Berserker**: 10% damage per rage (max 150%)
- **Guardian**: 12% armor per level

## Scoring

- Base enemy kill: 10 points (adjusted for difficulty)
- Boss kill: 1000+ points
- Combo multiplier: Up to 5x with consecutive kills
- Difficulty multiplier: 0.5x to 2.5x

## Credits

Built with HTML5 Canvas and vanilla JavaScript.
