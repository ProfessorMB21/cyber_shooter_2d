# Cyber Shooter

A retro-style 2D space shooter. Vanilla JavaScript, HTML5 Canvas 2D, ES
modules. No build step, no bundler, no dependencies.

## Running it

ES modules cannot be loaded over `file://`, so the game needs to be served
over HTTP:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Any static file server works (Live Server, `npx serve`, etc.). A modern
browser with ES module support is required (Chrome 61+, Firefox 60+,
Safari 10.1+, Edge 16+).

The canvas fills the browser window and resizes with it.

## Controls

### Main menu
| Key | Action |
|---|---|
| `SPACE` | Play |
| `S` | Settings |

### Build / difficulty select
| Key | Action |
|---|---|
| `UP` / `DOWN` | Choose build (7) |
| `LEFT` / `RIGHT` | Choose difficulty (4) |
| `SPACE` | Start the run |
| `ESC` | Back to the main menu |

### Settings
| Key | Action |
|---|---|
| `UP` / `DOWN` | Choose performance profile |
| `SPACE` | Select (confirms on a second press) |
| `ESC` | Back to the main menu |

### In game
| Key | Action |
|---|---|
| `WASD` / arrow keys | Move |
| `SPACE` | Shoot |
| `1` / `2` | Build ability 1 / 2 |
| `ESC` or `P` | Pause |
| `F` | Toggle the debug overlay |

### Pause menu
| Key | Action |
|---|---|
| `ESC` or `P` | Resume |
| `R` | Restart the run (same build and difficulty) |
| `Q` | Quit to the main menu |

Quitting abandons the current run and returns to the main menu. The app
keeps running - no reload, no restart.

### Game over
| Key | Action |
|---|---|
| `SPACE` | Return to the main menu |

## Builds

Seven builds, each with two active abilities and a per-level passive.

| Build | HP | Damage | Speed | Armor | Evasion | Crit | Abilities | Per-level growth |
|---|---|---|---|---|---|---|---|---|
| Fighter | 350 | 12 | 2.5 | 15 | 5 | - | Healing Shot, Dash | +8% HP |
| Glass Cannon | 200 | 35 | 3.5 | 8 | 15 | 20% / x2.0 | Overload, Teleport | +10% damage |
| Tank | 550 | 8 | 1.8 | 45 | 0 | - | Shield, Ground Slam | +12% HP, +5% armor |
| Balanced | 300 | 15 | 3.0 | 22 | 12 | 10% / x1.5 | Shield, Adrenaline Rush | +6% HP, damage, armor |
| Sniper | 220 | 14 | 3.0 | 10 | 20 | 25% / x2.5 | Sniper Shot, Smoke Screen | +8% crit chance |
| Berserker | 320 | 18 | 3.2 | 12 | 10 | 18% / x2.2 | Berserk Rage, Whirlwind | +5% damage, +8% per rage point |
| Guardian | 450 | 10 | 2.2 | 40 | 8 | - | Shield, Divine Protection | +10% armor |

Base values live in `config/player-builds.js`. Speed is scaled by
`SPEED_SCALE_FACTOR` (30) at load time.

### Leveling and stat growth

Kills award XP. Each level threshold is 1.5x the previous one, and a level
up restores 30% of max HP. A single award can span several thresholds - a
boss kill at low level can grant multiple levels at once.

Each build declares which of its stats grow per level, and by what fraction
of its base value (the "per-level growth" column above). **The growth is
never capped.** A stat that grows keeps growing for the whole run, so a
glass cannon's damage at level 50 is 206 and still climbing, and a tank
reaches 3784 HP. The one exception is the sniper's crit chance, which stops
at 100% because a chance above 100% cannot mean anything.

Armor is a second exception in effect, not in value: the damage reduction
it grants is capped at 75%, so armor past 50 keeps rising as a number but
stops reducing any more damage. The cap is on the reduction, not on the
stat.

Level-ups are announced with a short fading notice and a particle burst at
the player. **Play is never interrupted by a level up.**

Pickup bonuses (damage, speed) are permanent and survive level ups - they
are kept in a separate pool from the stats that are recomputed from the
build's base values.

## Difficulty

| Difficulty | Enemy speed | Enemy damage | Enemy HP | Score |
|---|---|---|---|---|
| Easy | x0.7 | x0.6 | x0.8 | x0.5 |
| Normal | x1.0 | x1.0 | x1.0 | x1.0 |
| Hard | x1.4 | x1.4 | x1.4 | x1.5 |
| Nightmare | x1.8 | x2.0 | x2.0 | x2.5 |

## Enemies

| Type | HP | Damage | Speed | XP | Notes |
|---|---|---|---|---|---|
| Grunt | 150 | 25 | 120 | 10 | Basic |
| Fast | 80 | 18 | 250 | 15 | From 30s |
| Tank | 450 | 20 | 80 | 80 | From 60s |
| Shooter | 120 | 25 | 100 | 55 | From 90s, keeps distance and fires |
| Elite | 550 | 20 | 120 | 130 | From 120s, fires |

At most 30 enemies are on screen at once. The spawn batch scales from 10 up
to 25 enemies as the run goes on.

## Bosses

Seven bosses, one every 15 minutes of survival (15, 30, 45, 60, 75, 90 and
100 minutes):

| Boss | HP | Pattern |
|---|---|---|
| Cyber Drone | 1200 | Beam |
| Cyber Drone Alpha | 2000 | Swarm |
| Neon Destroyer | 5000 | Beam |
| Orbital Warden | 10000 | Orbit |
| Nova Prime | 20000 | Nova |
| Crush Titan | 40000 | Crush |
| Swarm Overlord | 80000 | Swarm |

Bosses enter an enraged phase 2 at 45% HP: +30% damage, +20% speed and a
shield worth 10% of max HP.

## Pickups

Health (+20), shield (+10), speed (+5) and damage (+2). They drop from
enemies and spawn randomly on the field. Shield, speed and damage pickups
are permanent and are not capped; health pickups heal.

## Performance profiles

Chosen in Settings and persisted to `localStorage`.

| Profile | Build visuals | Particles | UI frames | Star glow | Entity culling |
|---|---|---|---|---|---|
| Performance | off | 200 | off | off | on |
| Balanced | on | 300 | on | off | on |
| Quality | on | 400 | on | on | off |

On top of the selected profile, the game drops build visuals automatically
when the measured frame rate falls below 45 fps.

## Project structure

```
index.html            Entry point, loads main.js as a module
main.js               Bootstrap: creates the canvas, wires up resize, starts the loop
game.js               Re-export shim for core/game.js
index.js              Legacy shim
entities.js           Legacy re-export shim

core/
  game.js             The Game class: state machine, update loop, scene dispatch
  combat.js           Player shooting, enemy shooting, ability activation
  collision.js        Projectile/enemy/pickup collision tests
  spawning.js         Enemy, boss and pickup spawning
  events.js           Kill handling, scoring, XP
  renderer.js         Draw order, HUD, quality-specific UI
  visual-effects.js   Starfield, screen shake, background
  performance.js      Frame-time sampling and FPS
  settings.js         Quality presets and localStorage persistence
  debug-overlay.js    F-key overlay: fps, draw counts, entity counts
  spatial.js          Grid index (not currently used)
  index.js            Re-exports the core systems

entities/
  player.js           Player entity, stats, levelling
  enemy.js            Enemy types and AI
  boss.js             Boss entity and phase logic
  boss-patterns.js    Attack pattern generation
  pickup.js           Pickups and their permanent bonuses
  projectile.js       Projectile physics and rendering
  abilities.js        The 14 active abilities
  build-visuals.js    Per-build ship decoration

scenes/
  index.js            SceneManager and re-exports
  menu.js             Main menu and build/difficulty select
  settings.js         Performance profile select
  pause.js            Pause overlay
  gameover.js         Results screen

systems/
  entity.js           Base Entity class (physics, damage, health bar)
  particles.js        Pooled particle system

config/
  index.js            Re-exports every config module
  player-builds.js    The 7 build stat blocks
  enemy-types.js      The 5 enemy stat blocks
  difficulties.js     The 4 difficulty multipliers
  bosses.js           Boss stats, patterns and spawn schedule
  pickups.js          Pickup values and item definitions
  constants.js        Speed scale, growth, score points
  game.js             Global settings
```

`systems/collision.js`, `systems/projectiles.js`, `systems/enemies.js`,
`systems/bosses.js`, `systems/pickups.js`, `systems/camera.js` and
`systems/game.js` are legacy files that are no longer imported by the
running game. They are candidates for deletion.

## Technical notes

- **Rendering**: Canvas 2D, full-window, `requestAnimationFrame` at display
  rate. Delta time is clamped to 100 ms so a tab switch cannot teleport
  entities.
- **The loop**: `Game` owns the `requestAnimationFrame` chain exclusively.
  Nothing else may schedule it - two chains make the chain grow by one every
  frame and the scene gets drawn hundreds of times per frame.
- **Audio**: none. Not implemented.
- **Mouse**: tracked but unused. Shots travel straight up; aiming is
  keyboard-only.

## Known issues

- Roughly 400 lines of dead code (the legacy `systems/*` managers, plus
  `core/spatial.js` and the root shims).
- `BOSS_PATTERNS[7]` ("Cyber Core") is unreachable - only seven boss levels
  are scheduled.
- `core/spawning.js` picks the enemy type with sequential `if` statements,
  so the later checks override the earlier ones instead of being independent
  rolls. Its comment also says 40 enemies while the code caps at 30.
- `config/constants.js` exports `PARTICLES` and `STAT_GROWTH`, which nothing
  reads.
- `GAME_SETTINGS.TITLE` still says "Simple Claude Game".
- The mouse is not used for aiming.

## Development

There is no test framework in the repository. Behaviour is verified with a
headless Node harness that stubs the DOM and drives the real `main.js`
against a virtual clock - see the `Headless test harness` note in the
project memory.

## Credits

Built with HTML5 Canvas and vanilla JavaScript.
