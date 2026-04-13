# Changelog

All changes, bug fixes, and improvements made to the Cyber Shooter game.

## Pause Feature & Skill Stats Display (2026-04-13)

### Pause Feature
- **Pause Menu**: Press ESC or P to pause/resume
- **Stats Display**: Shows current score, time survived, and kills while paused
- **Options**: Resume with ESC/P or restart with R
- Visual: Semi-transparent overlay with game frozen in background

### Skill Effects on Stats Board
- **Overload**: Damage stat shows `(2x)` in orange when active
- **Speed Boost**: Speed stat shows `(1.5x)` in cyan when active
- **Active Buffs List**: Shows all active buffs with remaining time:
  - Overload (lightning icon)
  - Speed Boost (lightning icon)
  - Divine Protection (shield icon)
  - Invisibility/Smoke Screen (ghost icon)
  - Whirlwind (tornado icon)
  - Max Rage (flame icon)
- Color-coded buff indicators with countdown timers

### Files Modified
- `game.js` - Pause menu, skill effects display
- `CLAUDE.md` - Controls documentation

## Skill System Implementation (2026-04-13)

### New Skill System
Each build now has 2 active skills with cooldowns:
- **Fighter**: Healing Shot, Dash
- **Glass Cannon**: Overload, Teleport  
- **Tank**: Shield, Ground Slam
- **Balanced**: Shield, Adrenaline Rush
- **Sniper**: Sniper Shot, Smoke Screen
- **Berserker**: Berserk Rage, Whirlwind
- **Guardian**: Shield, Divine Protection

Skills activated with keys **1** and **2**.

### Skill Details
- Each skill has unique cooldown (4-20 seconds)
- Skills have visual effects (particles, screen shake)
- UI shows skill cooldowns with key labels [1] and [2]
- Temporary effects (Overload, Speed Boost, etc.) auto-expire

### Files Modified
- `entities/player.js` - 14 new skills implemented
- `game.js` - Skill activation, effect handling

## Bug Fix & Graphics Update (2026-04-13)

### Bug Fixes
- **Canvas Resize Bug Fixed**: Player and enemies now work correctly on the right half of the screen
  - Issue: Game dimensions weren't syncing with canvas on window resize
  - Fix: Updated resize handler to properly update game.width/game.height

### Graphics Improvements
- **Screen Shake**: Subtle shake effect on damage, kills, and boss kills
- **Parallax Background**: Starfield with depth and glow effects
- **Muzzle Flash**: Visual effect when player shoots
- **Engine Thruster**: Animated thruster on player ship
- **Glow Effects**: All entities now have glowing visuals
- **Improved Trails**: Better projectile trails with fading
- **Background Gradient**: Deep space gradient

### Files Modified
- `main.js` - Fixed resize bug
- `game.js` - Screen shake, stars, muzzle flashes
- `entities/player.js` - Glow, thruster
- `entities/enemy.js` - Glow
- `entities/boss.js` - Glow
- `entities/projectile.js` - Glow, trails
- `entities/pickup.js` - Glow

## Code Refactoring & Balance Update (2026-04-13)

### Architecture Improvements
- **Extracted entity classes** to dedicated files for better organization:
  - `entities/projectile.js` - Projectile class with physics and rendering
  - `entities/pickup.js` - Pickup class with stat cap enforcement
  - `systems/projectiles.js` and `systems/pickups.js` now re-export from entities
  - Removed ~290 lines of duplicated code from `game.js`

### Player Changes
- **Damage Cap**: Increased from 80 to 210
- **HP Growth**: Multiplier increased from 1.1 to 1.2 per level
- **Armor Buffs**:
  - Heavy build: 18 → 22
  - Glass Cannon: 3 → 8
- **Ability Cooldowns**:
  - Healing Shot: 10s → 6s
  - Shield: 15s → 8s (value reduced to 80 from 100)

### Enemy Changes
- **Visual Updates**: New colors for better distinction
  - Grunt: #ff4444 → #3a99e7 (blue)
  - Dasher: #ff8800 → #9fe95a (green)
  - Tank: #aa4444 → #756767 (gray)
  - Shooter: #ff00ff → #6518ca (purple)
- **Elite**: Now shoots projectiles, damage reduced: 100 → 65
- **Tank**: Speed increased: 60 → 80

### Boss Changes
- **New Boss**: Level 5 "Cyber Drone" - Early boss encounter with 1200 HP
- **Damage Buffs**: All bosses have increased damage output
- **Final Boss** (Cyber Core): Speed 25 → 70, attack interval 2s → 1s
- **Phase Threshold**: Enraged phase now at 45% HP (was 50%)

### Files Modified
- `entities/player.js`, `entities/enemy.js`, `entities/boss.js`
- `game.js` (import updates, removed inline classes)
- `systems/projectiles.js`, `systems/pickups.js` (now re-exports)
- `config.js`

### New Files
- `entities/projectile.js`
- `entities/pickup.js`

## Game Balance Update (2026-04-10)

### Player Changes
- **Nerfed base stats**: All builds have reduced HP, damage, and speed (30-50% reduction)
- **SPEED_SCALE_FACTOR**: Reduced from 80 to 30
- **Stat Caps Added**:
  - maxSpeed: 300
  - maxShield: 150
  - maxHp: 1500
  - maxDamage: 80
- Shield bar display now capped to prevent screen overflow

### Enemy Changes
- **Buffed stats 2.5-3x**: HP, damage, speed increased across all enemy types
- **Increased spawn rate**: Doubled spawn count, max 40 enemies on screen
- **Earlier hard enemies**: Fast at 30s (was 60s), Tank at 60s (was 120s), etc.
- **More aggressive AI**:
  - 50% faster movement
  - Higher acceleration
  - Unpredictable movement patterns (wobble + random direction changes)
- **Shooters**: Reduced cooldown (2s → 1s), increased range (400 → 500)

### Buff/Pickup Changes
- **Spawn rates reduced**: Random 0.5% → 0.1%, enemy drops 10% → 3%
- **Pickup values nerfed**: Health 50→20, Shield 25→10, Speed 20→5, Damage 5→2
- All pickups now respect stat caps

### XP Scaling
- **Level penalty**: -5% XP per level from regular enemies (min 20%)
- **Boss XP penalty**: -3% per level (min 30%)

### UI/UX Improvements
- **Fullscreen canvas**: Canvas now fills entire browser window
- **Responsive**: Handles window resize automatically
- **Menu improvements**: Instructions in visible bordered box with keyboard icons

### Files Modified
- `entities/player.js` - Stat caps, nerfed values, SPEED_SCALE_FACTOR
- `entities/enemy.js` - Buffed stats, aggressive AI, unpredictable movement
- `game.js` - Reduced buff values, XP scaling, cap enforcement, UI improvements
- `index.html` - Fullscreen canvas styles
- `main.js` - Responsive canvas with resize handling

### New Files
- `PATCH.md` - Created to track all game balance and feature changes

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
