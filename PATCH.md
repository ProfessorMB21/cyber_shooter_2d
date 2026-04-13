# Patch History

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