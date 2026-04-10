# Patch History

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

### Files Modified
- `entities/player.js` - Stat caps, nerfed values, SPEED_SCALE_FACTOR
- `entities/enemy.js` - Buffed stats, aggressive AI, unpredictable movement
- `game.js` - Reduced buff values, XP scaling, cap enforcement, UI improvements
- `index.html` - Fullscreen canvas styles
- `main.js` - Responsive canvas with resize handling
