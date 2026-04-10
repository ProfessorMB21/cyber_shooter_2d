# Changelog

All changes, bug fixes, and improvements made to the Cyber Shooter game.

## Initial Implementation (2026-04-10)

### Core Systems Created

#### Base Entity System (`systems/entity.js`)
- Created base `Entity` class with physics, collision, and rendering
- Implemented health, damage, armor mechanics
- Added AABB and circle collision detection
- Support for velocity, friction, and rotation

#### Particle System (`systems/particles.js`)
- `Particle` class with types: explosion, trail, spark, text
- `ParticleSystem` manager for spawning and updating particles
- Explosion effects with random colors and physics
- Trail effects for projectiles
- Text particles for damage numbers and notifications

#### Input Handler (`input.js`)
- Keyboard input tracking (WASD, arrows, space)
- Mouse position tracking
- Movement vector calculation with diagonal normalization
- One-shot key press detection for menus

### Entities

#### Player (`entities/player.js`)
- 7 unique player builds:
  1. **Fighter** - Balanced, high HP, healing shot ability
  2. **Glass Cannon** - High damage, fragile, damage scaling
  3. **Tank** - Massive HP, slow, shield ability
  4. **Balanced** - Versatile, all-stats scaling
  5. **Sniper** - High crit chance, precision attacks
  6. **Berserker** - Rage mechanic, damage increases with rage
  7. **Guardian** - High armor, support abilities

- Stats system: HP, damage, speed, armor, evasion, crit chance/damage, regen
- Leveling system with XP gain from kills
- Passive abilities per build
- Active abilities with cooldowns
- Shield mechanic (absorbs damage before HP)

#### Enemy (`entities/enemy.js`)
- 5 enemy types: Grunt, Fast, Tank, Shooter, Elite
- AI: Move towards player, keep distance (shooters), contact damage
- Health bars for tank/elite enemies
- Hit flash animation on damage
- Pulsing animation

#### Boss (`entities/boss.js`)
- 7 bosses with escalating difficulty
- Attack patterns: Swarm, Beam, Orbit, Nova, Crush
- Two-phase system (enraged phase at 50% HP)
- Shield system
- Boss-specific movement AI

### Game Engine (`game.js`)

#### Main Game Class
- Canvas setup and context management
- Game states: menu, playing, paused, gameover, levelup
- Menu system: Build selection (7 builds), difficulty selection (4 levels)
- Game loop with delta time
- Entity management (player, enemies, bosses, projectiles, pickups)

#### Combat System
- Projectile management (player and enemy)
- Collision detection between entities
- Damage calculation with armor reduction
- Critical hit system
- Combo system for consecutive kills

#### Spawning System
- Enemy wave spawning with increasing difficulty
- Boss spawning at configured intervals (15, 30, 45, 60, 75, 90, 100 "minutes")
- Random pickup drops
- Spawn rate increases over time

#### Scoring & Progression
- Score from kills (with difficulty multiplier)
- Combo multipliers (up to 5x)
- XP system for leveling
- Stat growth per level based on build

### Pickups
- Health pickup (+50 HP)
- Shield pickup (+25 shield)
- Speed pickup (+20 speed)
- Damage pickup (+5 damage)
- Magnetic effect (attract to player when close)

### UI
- Score, time, wave, kill counter
- Health bar with color gradients
- XP bar
- Shield indicator
- Combo display
- Ability cooldowns
- Build/difficulty selection menu
- Game over screen with stats
- Level up notification

### Configuration (`config.js`)
- Game settings (width, height, FPS)
- 7 player build configurations
- 4 difficulty levels with stat multipliers
- Boss configuration (levels, HP multipliers, patterns)
- Score calculation settings
- Item/pickup definitions

### Browser Compatibility Fix (2026-04-10)

### ES Module Conversion
**Problem**: `Uncaught ReferenceError: require is not defined` - Browsers don't support CommonJS `require`/`module.exports`

**Solution**: Converted entire codebase to ES modules:

#### Files Converted:
1. **All system files** (`systems/*.js`): `module.exports` → `export`, `require` → `import`
2. **All entity files** (`entities/*.js`): Converted class exports
3. **Main game files**: `game.js`, `main.js`, `index.js`
4. **Config file**: `config.js`: `module.exports` → `export default`
5. **Entry file**: `index.html`: Added `type="module"` to script tag

#### Import/Export Pattern Changes:
```javascript
// Before (CommonJS)
const Entity = require('./systems/entity').Entity;
module.exports = { Player };

// After (ES Modules)
import { Entity } from './systems/entity.js';
export { Player };
```

**Important**: ES modules require full file paths including `.js` extension

### Browser Requirements
- Modern browsers supporting ES6 modules (Chrome 61+, Firefox 60+, Safari 10.1+, Edge 16+)
- Must run from a web server (file:// protocol has CORS restrictions with ES modules)
- Use `python -m http.server` or VS Code Live Server for local testing

## Controls

- **WASD / Arrow Keys** - Move player
- **SPACE** - Shoot
- **UP/DOWN** - Navigate build selection
- **LEFT/RIGHT** - Navigate difficulty selection

## File Structure

```
simple_claude_game/
├── index.html              # Main HTML entry point
├── main.js                 # Entry point, initializes game
├── game.js                 # Main Game class
├── config.js               # Game configuration
├── input.js                # Input handling
├── entities.js             # Entity exports
├── README.md               # Documentation
├── CHANGELOG.md            # This file
├── entities/
│   ├── player.js           # Player builds and stats
│   ├── enemy.js            # Enemy types
│   └── boss.js             # Boss patterns
└── systems/
    ├── entity.js           # Base entity class
    ├── particles.js        # Particle effects
    ├── collision.js        # Collision detection
    ├── projectiles.js      # Projectile management
    ├── enemies.js          # Enemy manager
    ├── bosses.js           # Boss manager
    ├── pickups.js          # Pickup system
    └── game.js             # Game state (legacy)
```

## Known Issues

None currently reported.

## Future Improvements

- [ ] Sound effects and music
- [ ] Save/load high scores
- [ ] Additional enemy types
- [ ] Weapon upgrades and drops
- [ ] Multiplayer support
- [ ] Mobile touch controls
- [ ] Screen shake effects
- [ ] More particle effects
- [ ] Achievements system
