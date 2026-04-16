# Patch History

## 2026-04-16 - Codebase Consistency Update

### Configuration Centralization
**Goal**: Single source of truth for all game balance values

**Changes**:
- Moved all player build stats to `config.js`
- Moved all enemy type stats to `config.js`
- Added `STAT_CAPS`, `STAT_GROWTH`, `SPEED_SCALE_FACTOR` to config
- Updated all entity files to import from config

**Files Modified**:
- `config.js` - Now contains all gameplay values
- `entities/player.js` - Imports builds from config
- `entities/enemy.js` - Imports enemy types from config
- `entities/pickup.js` - Imports stat caps from config
- `entities/projectile.js` - Fixed hardcoded bounds

**Impact**: No gameplay changes - values remain the same, just centralized

## 2026-04-13 - Pause Feature & Skill Stats Display

### Pause Feature
- Added pause menu accessible with **ESC** or **P** keys
- Pause menu shows current game stats (score, time, kills)
- Can resume or restart from pause menu
- Game renders frozen in background while paused

### Skill Effects on Stats Board
- Active skill effects now displayed on player stats board:
  - **Overload**: Shows `(2x)` next to damage stat
  - **Speed Boost**: Shows `(1.5x)` next to speed stat
  - **Divine Protection**: Gold indicator with remaining time
  - **Smoke Screen**: Grey indicator with remaining time
  - **Whirlwind**: Red indicator with remaining time
  - **Max Rage**: Red flame indicator for Berserker
- Buffs show remaining duration in seconds
- Buffed stats highlighted with color coding

### Files Modified
- `game.js` - Pause menu, skill effects display, stats board updates
- `CLAUDE.md` - Documentation updates

## 2026-04-13 - Skill System Implementation

### New Skill System
Each build now has 2 active skills with cooldowns, activated with keys 1 and 2:

**Fighter:**
- Healing Shot (6s): Heal 25% max HP
- Dash (4s): Quick dash with brief invulnerability

**Glass Cannon:**
- Overload (15s): Double damage for 5 seconds
- Teleport (12s): Teleport to random safe position

**Tank:**
- Shield (10s): Gain 100 shield
- Ground Slam (8s): AOE damage to nearby enemies

**Balanced:**
- Shield (8s): Gain 80 shield
- Adrenaline Rush (12s): 50% speed boost for 4 seconds

**Sniper:**
- Sniper Shot (10s): Guaranteed crit + piercing next shot
- Smoke Screen (15s): Brief invisibility (3 seconds)

**Berserker:**
- Berserk Rage (12s): Max rage instantly
- Whirlwind (10s): Spin attack for 2 seconds

**Guardian:**
- Shield (8s): Gain 80 shield
- Divine Protection (20s): Heal 50% + damage immunity for 2 seconds

### Files Modified
- `entities/player.js` - Added 14 new skills, updated ability system
- `game.js` - Added skill activation (keys 1/2), skill effect handling
- `input.js` - Already supports key 1/2

## 2026-04-13 - Bug Fix & Graphics Update

### Bug Fixes
- **Canvas Resize Bug Fixed**: Player/enemies now work correctly on the right half of the screen
  - Root cause: Game dimensions not syncing with canvas on window resize
  - Fix: Updated resize handler in main.js to properly update game.width/game.height

### Graphics Improvements
- **Screen Shake**: Added subtle screen shake on damage, kills, and boss kills
- **Background Stars**: Parallax starfield with glow effects
- **Muzzle Flash**: Visual effect when player shoots
- **Engine Thruster**: Animated thruster effect on player ship
- **Glow Effects**: All entities (player, enemies, bosses, projectiles, pickups) now have glow
- **Improved Trails**: Better projectile trails with fading segments
- **AOE Visualization**: Improved crush attack AOE effect
- **Background Gradient**: Deep space gradient instead of solid color

### Files Modified
- `main.js` - Fixed resize handler bug
- `game.js` - Added screen shake, background stars, muzzle flashes
- `entities/player.js` - Added glow effects, engine thruster
- `entities/enemy.js` - Added glow effects
- `entities/boss.js` - Added glow effects
- `entities/projectile.js` - Added glow, improved trails
- `entities/pickup.js` - Added glow effects

## 2026-04-13 - Code Refactoring & Balance Update

### Architecture Changes
- **Extracted classes to dedicated entity files**:
  - Created `entities/projectile.js` - Moved Projectile class from game.js
  - Created `entities/pickup.js` - Moved Pickup class from game.js
  - Updated `systems/projectiles.js` and `systems/pickups.js` to re-export from entities
  - Removed ~290 lines of duplicate code

### Player Changes
- **Damage Cap**: Increased from 80 to 210
- **HP Growth**: Multiplier increased from 1.1 to 1.2 per level
- **Armor Buffs**:
  - Heavy: 18 → 22
  - Glass Cannon: 3 → 8
- **Ability Cooldowns**:
  - Healing Shot: 10s → 6s
  - Shield: 15s → 8s (value reduced: 100 → 80)

## 2026-04-10 - Game Balance Update

### Player Changes
- Nerfed base stats across all builds (HP, damage, speed reduced by ~30-50%)
- Added `SPEED_SCALE_FACTOR` constant (30, down from 80)
- Implemented stat caps:
  - maxSpeed: 300
  - maxShield: 150
  - maxHp: 1500
  - maxDamage: 80
- Shield bar display now capped to prevent screen overflow

### Enemy Changes
- Buffed enemy stats 2.5-3x (HP, damage, speed)
- Increased spawn rate:
  - Doubled spawn count
  - Max 40 enemies on screen (prevents filling)
  - Harder enemy types spawn earlier (Fast at 30s vs 60s, etc.)
- More aggressive AI:
  - 50% faster movement
  - Higher acceleration
  - Unpredictable movement patterns (wobble + random direction changes)
- Shooter enemies:
  - Reduced cooldown: 2s → 1s
  - Increased range: 400 → 500
- **Visual Updates**: New colors for better distinction
  - Grunt: red → blue (#3a99e7)
  - Dasher: orange → green (#9fe95a)
  - Tank: red → gray (#756767)
  - Shooter: magenta → purple (#6518ca)
- **Elite**: Now shoots projectiles, damage reduced (100 → 65)

### Buff/Pickup Changes
- Reduced spawn rates:
  - Random pickups: 0.5% → 0.1%
  - Enemy drops: 10% → 3%
- Nerfed pickup values:
  - Health: 50 → 20
  - Shield: 25 → 10
  - Speed: 20 → 5
  - Damage: 5 → 2
- All pickups now respect stat caps

### XP Changes
- Added level penalty system:
  - Regular enemies: -5% XP per player level (min 20%)
  - Bosses: -3% XP per player level (min 30%)

### UI/UX Changes
- Canvas now full browser size with resize handling
- Menu instructions improved:
  - Added visible bordered box with background
  - Keyboard icons (arrows) for clarity
  - Better text hierarchy and colors

### Boss Changes
- **New Boss**: Level 5 "Cyber Drone" - First boss encounter with 1200 HP
- **Damage Buffs**: All bosses have increased damage
  - Level 15: 30 → 95
  - Level 25: 80 → 120
  - Level 35: 80 (unchanged)
  - Level 50: 150 → 190
- **Final Boss** (Level 100 Cyber Core):
  - Speed: 25 → 70
  - Attack interval: 2s → 1s
- **Phase Threshold**: Enraged phase now triggers at 45% HP (was 50%)

### Files Modified
- `entities/player.js` - Stat caps, nerfed values, SPEED_SCALE_FACTOR
- `entities/enemy.js` - Buffed stats, aggressive AI, unpredictable movement
- `entities/boss.js` - New boss, damage buffs, phase threshold change
- `game.js` - Reduced buff values, XP scaling, cap enforcement, UI improvements, imports
- `index.html` - Fullscreen canvas styles
- `main.js` - Responsive canvas with resize handling
- `systems/projectiles.js` - Now re-exports from entities/projectile.js
- `systems/pickups.js` - Now re-exports from entities/pickup.js
- `config.js` - Import fixes

### New Files
- `entities/projectile.js` - Projectile entity class
- `entities/pickup.js` - Pickup entity class with stat cap enforcement