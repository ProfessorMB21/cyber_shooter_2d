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

## The multiplayer server

The online mode needs a server. The one in `server/` serves the game over
HTTP and runs the networked worlds over a WebSocket on the same port:

```bash
npm start          # node server/index.js
# then open http://localhost:8080
```

It has no dependencies. The WebSocket is hand written in
`server/websocket.js` - the project has no build step and no `node_modules`,
so a library was not an option. `PORT` and `HOST` are read from the
environment.

## Controls

The mouse works on **every** screen - the main menu, the build select, the
wingman select, the settings, the lobby, the pause menu and the game over
screen. Hovering an entry selects it and clicking activates it. The
keyboard always works as well, so no screen is mouse-only.

### Input schemes

What the keyboard and the mouse do *in a run* is chosen in Settings and is
remembered between sessions.

| Scheme | Move | Aim | Shoot | Abilities |
|---|---|---|---|---|
| Keyboard Only | `WASD` / arrows | Straight up | `SPACE` | `1` and `2` |
| Keyboard + Mouse | `WASD` / arrows | The mouse | Left click | `1` and `2` |
| Mouse + QER | The mouse | The mouse | Left click | `Q` and `E` |

In the mouse schemes the ship steers towards the pointer: it eases into it
rather than snapping to it, and it stops when the pointer is on top of the
ship. The pointer is drawn as a crosshair, and in the Keyboard + Mouse
scheme a line runs from the ship to it.

The scheme is the same in a networked run - the input the client sends to
the server is built by the same code, so the server needs to know nothing
about it.

### Main menu
| Key | Action |
|---|---|
| `UP` / `DOWN` | Choose the game mode |
| `SPACE` | Select the mode |
| `S` | Settings |
| Mouse | Click an entry to open it |

### The menus are never quite still
The main menu, the build select and the settings screen keep moving
while nothing is being pressed. The starfield drifts, clouds of colour
drift behind it, and a band of light crosses the screen every fourteen
seconds. The title glow breathes, the marker beside the selected entry
blinks, the outline of the row the cursor is on pulses, and the hint
line at the bottom fades in and out.

It is the same backdrop the game is drawn over, so the menu looks like a
place rather than a picture of one.

### Build / difficulty select
| Key | Action |
|---|---|
| `UP` / `DOWN` | Choose build (7) |
| `LEFT` / `RIGHT` | Choose difficulty (4) |
| `SPACE` | Start the run (in dualist, go to the wingman screen) |
| `ESC` | Back to the main menu |
| Mouse | Click a build, a difficulty, or START / BACK |

### Wingman select (dualist only)
| Key | Action |
|---|---|
| `UP` / `DOWN` | Choose the wingman's build (7) |
| `SPACE` | Start the run |
| `ESC` | Back to the build select |
| Mouse | Click a build, or START / BACK |

### The online lobby
| Key | Action |
|---|---|
| `UP` / `DOWN` | Choose a room |
| `SPACE` | Join the chosen room |
| `C` | Create a room |
| `ESC` | Back to the main menu |
| Mouse | Click a room to join it, or CREATE / BACK |

### In a room
| Key | Action |
|---|---|
| `UP` / `DOWN` | Choose your callsign |
| `LEFT` / `RIGHT` | Choose your build |
| `ENTER` | Start the run |
| `ESC` | Leave the room |
| Mouse | Click the arrows to change the callsign and the build, or START / LEAVE |

### Settings
| Key | Action |
|---|---|
| `UP` / `DOWN` | Choose a performance profile or an input scheme |
| `SPACE` | Select (confirms on a second press) |
| `ESC` | Back to the main menu |
| Mouse | Click an entry, or APPLY / CANCEL / BACK |

### In game
| Key | Action |
|---|---|
| `WASD` / arrow keys | Move (the mouse moves the ship in the Mouse + QER scheme) |
| Mouse | Aim (Keyboard + Mouse and Mouse + QER) |
| Left click | Shoot (Keyboard + Mouse and Mouse + QER) |
| `SPACE` | Shoot (Keyboard Only) |
| `1` / `2` | Build ability 1 / 2 (Keyboard Only and Keyboard + Mouse) |
| `Q` / `E` | Build ability 1 / 2 (Mouse + QER) |
| `ESC` or `P` | Pause |
| `F` | Toggle the debug overlay |

The two ability panels in the corner of the screen are buttons as well -
click one to fire that ability.

### Pause menu
| Key | Action |
|---|---|
| `ESC` or `P` | Resume |
| `R` | Restart the run (same build and difficulty) |
| `Q` | Quit to the main menu |
| Mouse | Click RESUME, RESTART or QUIT |

Quitting abandons the current run and returns to the main menu. The app
keeps running - no reload, no restart.

### Game over
| Key | Action |
|---|---|
| `SPACE` | Return to the main menu |
| Mouse | Click RETURN TO THE MENU |

## Game modes

The main menu is a list of modes. `UP`/`DOWN` moves through it and `SPACE`
picks one.

| Mode | Players | Where the world runs |
|---|---|---|
| Single Player | 1 | On your machine |
| Dualist | 2 - you and an AI wingman | On your machine |
| Multiplayer | 1 - 5, over the network | On the server |

### Dualist
You and a wingman fly the same field. The wingman is a full player: it
takes damage, it levels up, it collects pickups, it uses its abilities, and
it can die. It is driven by `systems/ai.js` rather than by the keyboard, and
it has a build of its own, chosen on its own screen after yours.

Kills and XP are shared. Every living player gets the XP for a kill and
the score for it, and the level penalty is worked out from the *average*
level of the living players - so a dualist run levels both of you up at
about the rate one player would level up at.

A panel in the top right lists the other players - their name, their level
and their health - and every player but your own has a name tag over their
ship.

### Multiplayer
Up to five players in one room, over the network. It needs the server:

```bash
npm start          # node server/index.js
```

The server is the authority. **One** world is simulated - on the server -
and the clients send their input and are sent snapshots of what happened.
That is what keeps everybody looking at the same fight: if each client
simulated its own copy, they would drift apart within a second or two.

- The world ticks at 60 Hz. The snapshots go out at 20 Hz, because nobody
  can see the difference and the bandwidth is real.
- The client draws the world one snapshot behind and interpolates between
  the two most recent ones, so the movement is smooth.
- The shared world is 1280x720. Every client draws it scaled to fit its own
  window, so the field is the same for everybody.
- A client's input goes stale after half a second without a refresh, so a
  client that stalls stops moving rather than running on forever.
- When the last player in a room dies, the run is over and the room goes
  back to being a lobby.

The client never simulates the world. The snapshots are turned into the
real entity objects the renderer already knows how to draw, so the drawing
code does not know that the run is online.

**There is no pausing in an online run** - the world keeps running on the
server whether you like it or not. Once you are down you can watch the
rest of the fight, and `ESC` leaves the room.

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
| Guardian | 450 | 10 | 2.2 | 40 | 8 | - | Shield, Divine Protection | +10% armor, excess armor speeds up cooldowns |

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

### The guardian's aura

Armor 50 is where the 75% damage reduction is maxed out, so any armor past
that point is **excess** - it cannot make the guardian any harder to kill.
The guardian spends the excess on a cooldown-reduction aura instead:

- The aura is **off until the damage reduction is maxed out** (guardian
  level 4, armor 52).
- Each point of excess armor is worth 0.4% of cooldown reduction, up to a
  50% cap. At level 20 the guardian has 66 excess armor and its cooldowns
  are 26.4% shorter; at level 50 the reduction is capped at 50%.
- The aura reaches 260 pixels and covers the guardian and any other player
  inside it. With one player in the game that means the guardian itself -
  the aura is the co-op hook.
- The reduction applies to the whole cooldown, not just the readout, so
  the ability really does come back sooner.

The aura is drawn as a faint ring around the guardian, and the ability
panel shows `AURA -26% CD` while it is active.

Level-ups are announced with a short fading notice and a particle burst at
the player. **Play is never interrupted by a level up.**

Pickup bonuses (damage, speed) are permanent and survive level ups - they
are kept in a separate pool from the stats that are recomputed from the
build's base values.

## The friendly AI

`systems/ai.js` drives a player the way a person would: pick a target, move
around it, shoot at it, and use an ability when the build says the moment
is right. It produces the same input object the keyboard produces, so
nothing downstream - the player entity, the combat system, the cooldowns -
knows or cares whether a person or the AI is in charge.

An AI player is a full player. It takes damage, it levels up, it collects
pickups, it uses its abilities, and it can die.

### How each build fights

| Build | Range | Strafing | Stays with the party | Aggression |
|---|---|---|---|---|
| Fighter | 220 | 0.70 | 380 | 0.65 |
| Glass Cannon | 300 | 0.80 | 380 | 0.55 |
| Tank | 150 | 0.40 | 320 | 0.75 |
| Balanced | 210 | 0.60 | 360 | 0.65 |
| Sniper | 430 | 0.50 | 420 | 0.45 |
| Berserker | 110 | 0.30 | 300 | 0.95 |
| Guardian | 190 | 0.50 | 200 | 0.50 |

- **Range** is the distance it tries to hold from its target. The berserker
  wants to be on top of the enemy, the sniper wants to be far away, and the
  glass cannon sits in between - far enough to survive, close enough to
  shoot.
- **Strafing** is how much it circles while it fights. The glass cannon
  circles the most, the berserker barely at all.
- **Stays with the party** is how close it stays to the other players. The
  guardian keeps closest of all - it is the support build, and its aura
  only reaches 260 pixels.
- **Aggression** is how hard it pushes towards the target rather than away
  from it.

On top of that it swerves away from the enemies that are on top of it,
goes for a health pickup when it is hurt, and stays off the edges of the
world. It keeps its target for 0.6 seconds at a time so it does not flip
between two equally close enemies every frame, and a boss wins the
contest if it is within 700 pixels - a boss is worth more than a grunt.

### When it uses an ability

The abilities fire on rules, not on a timer. The rule reads what the AI
can see - how hurt it is, how many enemies are close, and how its ally is
doing:

| Ability | Uses it when |
|---|---|
| Healing Shot | below 65% HP |
| Dash | an enemy is within 95px and it is below 60% HP, or 3+ enemies are on top of it |
| Overload | 2+ enemies are nearby, or it is below 50% HP with a target |
| Teleport | below 35% HP, or 3+ enemies are on top of it |
| Shield | below 60% HP, or an enemy is within 80px |
| Ground Slam | 3+ enemies are nearby |
| Adrenaline Rush | the target is further than 380px and it is above 50% HP, or it is below 40% HP |
| Sniper Shot | it has a target within 600px |
| Smoke Screen | below 50% HP, or 3+ enemies are on top of it |
| Berserk Rage | below 50% HP, or its rage is low and something is nearby |
| Whirlwind | 3+ enemies are on top of it, or 4+ are nearby |
| Divine Protection | below 40% HP, or 4+ enemies are on top of it, or its ally is in danger |

The rules are keyed by the ability's display name, so they live in one
table in `systems/ai.js` and every build's pair of abilities finds its
entry there. A rule that does not exist for an ability means the AI never
uses it.

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

The Settings screen holds both the performance profiles and the input
schemes. A change is confirmed before it is applied, and it is saved to
`localStorage` straight away.

## Project structure

```
index.html            Entry point, loads main.js as a module
main.js               Bootstrap: creates the canvas, wires up resize, starts the loop
game.js               Re-export shim for core/game.js
index.js              Legacy shim
entities.js           Legacy re-export shim
package.json          "type": "module" so Node can import the game's modules

core/
  simulation.js       The world with no rendering: players, enemies, pickups, update
  game.js             The Game class: the Simulation plus a canvas, input and scenes
  online-world.js     Turns the server's snapshots into the entities the renderer draws
  combat.js           Player shooting, enemy shooting, ability activation
  collision.js        Projectile/enemy/pickup collision tests
  spawning.js         Enemy, boss and pickup spawning
  events.js           Kill handling, scoring, XP
  renderer.js         Draw order, HUD, quality-specific UI
  controls.js         Turns the keyboard and the mouse into the input object
  visual-effects.js   Starfield, screen shake, background
  performance.js      Frame-time sampling and FPS
  settings.js         Quality presets, input schemes and localStorage persistence
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
  ui.js               The shared mouse plumbing: the item registry and the buttons
  menu.js             Main menu and build/difficulty select
  lobby.js            The online lobby: rooms, callsign, build
  settings.js         Performance profile and input scheme select
  pause.js            Pause overlay
  gameover.js         Results screen

systems/
  entity.js           Base Entity class (physics, damage, health bar)
  particles.js        Pooled particle system
  ai.js               The friendly AI controller and the per-build rules
  network.js          The client side of the socket to the server

config/
  index.js            Re-exports every config module
  player-builds.js    The 7 build stat blocks
  enemy-types.js      The 5 enemy stat blocks
  difficulties.js     The 4 difficulty multipliers
  bosses.js           Boss stats, patterns and spawn schedule
  pickups.js          Pickup values and item definitions
  game-modes.js       The game modes and their player limits
  constants.js        Speed scale, armour reduction, growth, score points
  game.js             Global settings

shared/
  protocol.js         The messages the client and the server exchange

server/
  index.js            The HTTP server, the WebSocket upgrade and the ticker
  websocket.js        A hand written RFC 6455 WebSocket server
  rooms.js            The lobby rooms and the worlds they run
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
- **Simulation and presentation are separate.** `core/simulation.js` holds
  the world - players, enemies, pickups, the update logic - and knows nothing
  about canvas, the keyboard or the scenes. `core/game.js` is that
  simulation plus a canvas, an input handler and the screens. The split is
  what lets the same world code run on a server with no DOM at all, which is
  what a networked run needs: the world has to be simulated in exactly one
  place, or the clients drift apart.
- **The server is the authority.** A networked room runs one `Simulation` on
  the server. The clients send their input and are sent snapshots of the
  world; they never simulate it themselves. The world ticks at 60 Hz and the
  snapshots go out at 20 Hz, because nobody can see the difference between
  the two and the bandwidth is real.
- **The client draws a snapshot, it does not simulate it.** The snapshots
  become the real entity objects - the same `Enemy`, `Boss`, `Projectile`
  and `Pickup` classes the local modes use - so the drawing code is the
  same in every mode. The positions are interpolated between the two most
  recent snapshots, which is why the world is drawn a snapshot behind.
- **Audio**: none. Not implemented.
- **Mouse**: fully supported, on every screen and in every mode. The
  pointer position is converted into world coordinates before it is used,
  so aiming works the same in the local modes and in a networked run,
  where the shared world is drawn scaled to fit the window.
- **One layout, drawn and clicked.** Every screen computes its layout
  once and both draws it and hit-tests against it, so a button cannot
  drift from the rectangle the mouse actually hits. A click is matched
  against the position the click happened at, not against wherever the
  pointer happens to be when the frame runs.

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

## Development

There is no test framework in the repository. Behaviour is verified with a
headless Node harness that stubs the DOM and drives the real `main.js`
against a virtual clock - see the `Headless test harness` note in the
project memory.

## Credits

Built with HTML5 Canvas and vanilla JavaScript.
