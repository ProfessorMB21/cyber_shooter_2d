# Patch History

## 2026-10-23 - The Menus Are Never Quite Still

### New
- **The menus are never still.** The starfield drifts behind the menus,
  the backdrop has clouds that sway and a band of light that crosses the
  screen every fourteen seconds, the title glow breathes, the marker
  blinks and the hint line fades in and out.

### Changed
- `core/game.js` - a clock that advances every frame whatever the game
  is doing, and the time since the last frame worked out at the top of
  the loop so every branch has it.
- `core/visual-effects.js` - the menu backdrop, and a `drawMenuBackdrop`
  that the menus use instead of the plain game background.
- `scenes/menu.js` - the breathing title, the blinking selection
  marker, the pulsing row outlines and the breathing hint.
- `scenes/ui.js` - `pulse`, `drawGlowText`, `fitText` and `wrapText`,
  shared by the screens.
- `README.md` - the menu animation, under the main menu.

### Fixed
- **The menu was a still picture.** The starfield was only updated while
  a run was going, and the menus drew the plain game background.

## 2026-10-23 - The Mouse And The Input Schemes

### New
- **`core/controls.js` - the input builder.** One place that turns the
  keyboard and the mouse into the input object the simulation already
  understood. It knows the three schemes, converts the pointer into world
  coordinates and works out the aim angle.
- **`scenes/ui.js` - the shared mouse plumbing.** A registry of clickable
  rectangles, a helper that lays out a row of buttons, and the button
  drawing itself.
- **The mouse on every screen.** The main menu, the build select, the
  wingman select, the settings, the lobby, the room, the pause menu and
  the game over screen. Hovering selects an entry, clicking activates it.
- **Three input schemes**, chosen in Settings and remembered between
  sessions: *Keyboard Only*, *Keyboard + Mouse* and *Mouse + QER*.
- **The ability panels are buttons.** Click one in the corner of the
  screen and that ability fires.

### Changed
- `core/settings.js` - the three schemes, saved to `localStorage` under
  `gameInputScheme` like the performance profile is.
- `input.js` - the click position is kept, so a click is handled where
  it happened rather than where the pointer ended up, and it comes from
  the event itself rather than from the last move; a "the mouse moved"
  flag so a screen can follow the pointer without the keyboard fighting
  it; the right button is ignored and the browser's own context menu is
  suppressed over the canvas. `getMouseDirection()` deleted - it was
  dead code.
- `core/game.js` - the local input goes through the new builder, and a
  click on an ability panel in the HUD becomes that ability's input flag.
- `core/renderer.js` - the crosshair, the line from the ship to the
  pointer, and the ability panels are collected as they are drawn so the
  mouse can find them.
- `entities/player.js` - `drawCooldowns()` returns the rectangles it
  drew.
- `core/online-session.js` - the input that goes to the server is built
  by the same code, so a networked run behaves like a local one.
- `scenes/menu.js`, `scenes/settings.js`, `scenes/lobby.js`,
  `scenes/pause.js`, `scenes/gameover.js` - each screen computes its
  layout once and both draws it and hit-tests against it.

### Fixed
- **The mouse used to be tracked and thrown away.** The shots were
  hardcoded straight up in `core/combat.js` and `input.getMouseDirection()`
  was dead code. Both are gone.
- **A button could drift from what it activated.** The hit test and the
  drawing now come from the same layout, so they cannot disagree, and the
  hit test is no longer a frame behind the drawing.
- **A click in the game could press a button in the pause menu.** Click
  and press `ESC` in the same frame and the pause menu opened on top of
  the click that was still in flight, and pressed whatever was under the
  pointer - quitting the run, without the player touching the mouse
  again. The click belongs to the game, so the game takes it when it
  pauses.
- **A click landed on whatever the pointer was over, not on what was
  pressed.** The screens matched the click against the item under the
  pointer *now*. If the pointer drifted between the button going down
  and the frame that handled it, the wrong thing was chosen. The click
  is now matched against the position the click happened at, and the
  press position comes from the event rather than from the last move.
- **The settings screen and the lobby drew their buttons from
  coordinates that were written out a second time.** The drawing and
  the hit test now share one set of numbers, so they cannot disagree.

### Notes
- The scheme is chosen in Settings. The three performance profiles and the
  three schemes are on the same screen, and a change is confirmed before
  it is applied.
- In the mouse schemes the ship steers towards the pointer: it eases into
  it rather than snapping to it, and it stops when the pointer is on top
  of the ship.
- The pointer is in canvas coordinates and the shared world is drawn
  scaled to fit the window, so the position is converted into world
  coordinates before it is used.
- The server needed no changes - it already applied the `aim` and the
  `dx`/`dy` it was sent.

### Verified
- A new headless probe drives the real game with a real mouse: the
  schemes are offered, the settings apply one and remember it, the mouse
  aims the shot and the projectile travels at that angle, a click shoots,
  the mouse moves the ship, `Q` and `E` fire the abilities, the HUD
  ability buttons take a click, a click from the game does not press a
  pause button, a click lands where the button went down, the pause and
  game over buttons work, and nothing throws. **26 assertions, 26
  passing.**
- The existing suite is unchanged: 55 assertions, 55 passing. The mode
  probe: 12, 12. The dualist probe: 8, 8. The AI probe: 42, 42. The
  simulation probe: 4, 4. The online probe: 17, 17. The performance is
  unchanged: 253.42 fills per frame against a baseline of 253.18, one
  `requestAnimationFrame` callback per frame, no errors.

## 2026-10-23 - The Online Client

### New
- **Multiplayer mode is playable.** The main menu is a list of three modes
  now, and picking Multiplayer opens a lobby instead of the build select.
- **`scenes/lobby.js` - the lobby.** The room list, the roster, and the
  two pickers a player fills in before a run: the callsign (up and down)
  and the build (left and right). `ENTER` starts the run for everybody in
  the room.
- **`systems/network.js` - the client side of the socket.** It finds the
  server through the page's own address, says hello, and hands the
  messages to whoever is listening for them.
- **`core/online-world.js` - the snapshots turned into entities.** The
  server's snapshots become the real `Enemy`, `Boss`, `Projectile` and
  `Pickup` objects the renderer already knows how to draw, so the drawing
  code is the same in every mode.

### Changed
- `config/game-modes.js` - the multiplayer mode: up to five players, and
  the world runs on the server.
- `scenes/menu.js` - an online mode opens the lobby.
- `scenes/index.js` - exports the lobby, and the scene manager tells a
  scene when it is shown and when it is left. The lobby needs both - it
  opens a socket when it is shown and closes it when it is left.
- `core/game.js` - the online run: the input goes to the server, the
  snapshots come back, and the shared world is drawn scaled to fit the
  window.
- `core/renderer.js` - the world transform, the dead players, and a
  notice that says things in the middle of a run.
- `core/simulation.js` - a player who is out of the run does not move and
  does not shoot.
- `server/rooms.js`, `server/index.js`, `shared/protocol.js` - the
  callsign, the fuller player snapshot, the latched ability presses, and
  a check on the build name so a bad one cannot take a room down.

### Notes
- The client never simulates the world. The server sends snapshots and the
  client draws them.
- The world is drawn one snapshot behind and the positions are
  interpolated between the two most recent ones, so the movement is
  smooth at 20 snapshots a second.
- The shared world is 1280x720 and every client draws it scaled to fit its
  own window.
- **An online run cannot be paused** - the world keeps running on the
  server. `ESC` says so, and once you are down it leaves the room.

### Verified
- A new headless probe starts the real server and drives the real client
  against it: the menu, the lobby, the connection, the room, the build,
  the start, the enemies and the projectiles coming back, the world being
  scaled, the player moving, and the run not throwing. **17 assertions,
  17 passing.**
- The existing suite is unchanged: 55 assertions, 55 passing. The mode
  probe is unchanged: 12 assertions, 12 passing. The performance is
  unchanged: 253.13 fills per frame against a baseline of 252.81-253.6,
  one `requestAnimationFrame` callback per frame, no errors.

## 2026-10-23 - The Multiplayer Server

### New
- **`server/index.js`** - the server. It serves the game over HTTP and
  runs the networked worlds over a WebSocket on the same port, so one
  process is the whole thing. `npm start` runs it.
- **`server/websocket.js`** - a hand written RFC 6455 WebSocket server.
  The project has no build step and no `node_modules`, so a library was not
  an option. This is the part of the RFC the game needs: the opening
  handshake, text frames, fragmentation, ping, pong and close.
- **`server/rooms.js`** - the rooms. A room is a lobby and a world:
  players join, pick a build, and when somebody starts the run the room
  creates a `Simulation` and ticks it. Up to five players a room.
- **`shared/protocol.js`** - the wire protocol, shared by the browser and
  the server so the two can never disagree about what a message means.
- **`npm start`** - a script that runs the server.

### Changed
- `package.json` - a `start` script.

### Notes
- The server is the authority. A room runs **one** simulation, on the
  server; the clients send their input and are sent snapshots, so they
  cannot drift apart.
- The world ticks at 60 Hz and the snapshots go out at 20 Hz. Nobody can
  see the difference between the two and the bandwidth is real.
- A client's input goes stale after half a second without a refresh, so a
  client that stalls stops moving rather than running on forever.
- The static file server refuses to serve anything outside the project
  directory. Four different traversal attempts were checked by hand and
  all of them come back 404.

### Verified
- A new headless probe starts the real server as a child process and
  drives it with two real WebSocket clients: connect, welcome, create a
  room, join it, start the run, watch the world be simulated, watch the
  snapshots arrive with the players in them and moving, then drop one
  client and check the server keeps going. **16 assertions, 16 passing.**
- The existing suite is unchanged: 55 assertions, 55 passing.

## 2026-10-23 - Game Modes and Dualist

### New
- **The main menu is a list of game modes.** `UP`/`DOWN` moves through it
  and `SPACE` picks one.
- **`config/game-modes.js`** - the modes, their player limits and whether
  they are online. The menu reads the list, so adding a mode is a config
  change as much as a code change.
- **Dualist mode** - you and an AI wingman on the same field. The wingman
  is a full player: it takes damage, it levels up, it collects pickups, it
  uses its abilities, and it can die. It has a build of its own, chosen on
  its own screen after yours.
- **A roster panel** in the top right listing the other players in the run
  - their name, their level and their health. A dead player shows as
  `DOWN`.
- **Name tags** over every player but your own, so the wingman and the
  remote players can be told apart at a glance.

### Changed
- `scenes/menu.js` - the main menu is a mode list, and there is a new
  wingman select screen. The build select screen is unchanged for a single
  player run, so the existing flow - `SPACE`, `SPACE` - still starts a
  game.
- `core/game.js` - handles the two new scene actions and passes the mode
  and the wingman's build into the run.
- `core/renderer.js` - the roster panel and the name tags.
- **The guardian's aura now has somebody to cover.** It reaches 260
  pixels, and the wingman stands inside it when it keeps close.

### Notes
- Kills and XP are shared across the living players, and the level penalty
  comes from their *average* level. A single player run is numerically
  identical to the one it replaced; a dualist run levels both players up
  at about the rate one player would level up at.
- The local player's bullets are yellow; everyone else's take their build
  colour.

### Verified
- A new headless probe drives the real menu: it opens the build select,
  starts a single player run, goes back, picks the second mode, picks a
  build, picks a *different* wingman build, and checks the run that comes
  out has two players, that the wingman is an AI player with a controller,
  and that the two builds were chosen independently. **12 assertions, 12
  passing.**
- The existing suite is unchanged: 55 assertions, 55 passing.

## 2026-10-23 - The Friendly AI

### New
- **`systems/ai.js` - the AI controller.** It drives a player the way a
  person would: pick a target, move around it, shoot at it, and use an
  ability when the build says the moment is right. It produces the same
  input object the keyboard produces, so nothing downstream knows the
  difference.
- **An AI player is a full player.** It takes damage, it levels up, it
  collects pickups, it uses its abilities, and it can die.
- **A per-build table of how to fight** - range, strafing, how close to
  stay to the party, and aggression. The berserker wants to be on top of
  the enemy, the sniper wants to be far away, the guardian stays closest
  to the party because its aura only reaches 260 pixels.
- **A rule per ability**, keyed by the ability's display name, so all
  twelve live in one table and every build's pair finds its entry there.
  The rules read what the AI can see: how hurt it is, how many enemies are
  close, and how its ally is doing.
- **The AI aims.** `combat.playerShoot(player, aim)` already took an
  angle, so the AI's bullets go where it is looking while the human's
  still go straight up.

### Changed
- `core/game.js` - a map of controllers keyed by player id. A player
  flagged `isAI` gets one in `start()`, and `buildInputs()` routes it
  through its controller instead of the keyboard. The frame time is
  threaded through `buildInputs(deltaTime)` rather than stored on the
  game, so a controller can be driven from a test without a frame loop.

### Verified
- `probe-ai.mjs` runs the controller against a real `Simulation` for each
  of the seven builds - 15 seconds each, with a ring of enemies around the
  AI. Every build has to move, shoot, damage the enemies, use an ability
  and survive. **42 assertions, 42 passing.**
- `probe-dualist.mjs` boots the real `Game` class with a human player and
  an AI wingman: the wingman is driven by a controller, moves on its own,
  shoots the enemies, and the run renders without throwing. **8
  assertions, 8 passing.**
- The existing suite is unchanged: 55 assertions, 55 passing.
- The performance harness is unchanged: 254.06 canvas fills per frame
  (baseline 252.81-253.6), one rAF callback per frame, 0 errors.

## 2026-10-23 - Simulation / Presentation Split

### New
- **`core/simulation.js` - the world with no rendering.** A new
  `Simulation` class holds the players, the enemies, the bosses, the
  projectiles and the pickups, and advances them from a set of inputs. It
  knows nothing about canvas, the keyboard or the scenes.
- **`Game extends Simulation`.** `core/game.js` is now that simulation plus
  a canvas, an input handler and the screens. A single player run behaves
  exactly as it did.
- **A frozen input contract** for every player, human or AI:
  `{ dx, dy, shoot, ability1, ability2, aim }`. `Simulation.update()` takes
  a map from player id to that object; a player with no input gets
  `EMPTY_INPUT`.
- **`nearestTo(x, y, candidates)`** in `systems/entity.js`. It accepts a
  single entity or a list and skips the dead ones, so enemies, bosses,
  pickups and enemy projectiles all target the nearest *living* player.
- **`package.json`** with `"type": "module"` and no dependencies, so Node
  can import the game's ES modules. No build step, no bundler, no lockfile.

### Why
A networked run has to be simulated in exactly one place, or the clients
drift apart within a second or two. The server has to run the *same*
physics, combat, collision, spawning and scoring code the browser runs, and
the only way to guarantee that is to run the same module.

### Changed
- `core/combat.js` - `playerShoot(player, aim)` takes an optional angle.
  The local player passes `null` and shoots straight up as before; the AI
  passes a real angle. The local player's bullets stay yellow, everyone
  else's take their build colour.
- `core/collision.js` - enemy projectiles hit the nearest living player.
- `core/events.js` - XP and score are shared across the living players, and
  the level penalty comes from their *average* level, so a solo run is
  numerically identical to the one it replaced.
- `core/renderer.js` - draws every player in `game.players`; culls
  projectiles and pickups against the world size.
- `core/spawning.js` - spawns against the world size.
- `entities/player.js` - the input may be a plain object, not just an
  `InputHandler`.
- `entities/enemy.js`, `entities/boss.js`, `entities/pickup.js` - target the
  nearest living player.

### Verified
- The headless suite: **55 assertions, 55 passing** - unchanged.
- The performance harness: 253.94 canvas fills per frame (baseline
  252.81-253.6), one `requestAnimationFrame` callback per frame, 0 errors.
- A DOM-free probe imports `core/simulation.js` into plain Node, runs 120
  steps with two players (a fighter and a guardian), and checks that the
  world advances, both players survive and the grunts take damage from the
  players' shots. 4 assertions, 4 passing.

## 2026-10-22 - The Guardian's Cooldown Aura

### New
- **The guardian spends its excess armour on a cooldown-reduction aura.**
  Armour reduces damage by 1.5% per point up to 75%, so armour past 50 is
  excess - it cannot make the guardian any harder to kill. That excess is
  now worth cooldown reduction instead: 0.4% per point of excess armour,
  capped at 50%.
- **The aura only starts once the damage reduction is maxed out.** The
  guardian reaches armour 52 at level 4; below that the excess is zero
  and so is the reduction.
- **The aura reaches 260 pixels** and covers the guardian and any other
  player inside it. The game has one player, so the aura is the seam a
  second player would use.
- **The reduction applies to the whole cooldown**, not just the readout.
  Divine Protection's 20 seconds becomes 14.72 seconds at a 26.4%
  reduction.
- The aura is drawn as a faint ring around the guardian, and the ability
  panel shows `AURA -26% CD` while it is active.

### Fixed
- **Half the abilities never showed a cooldown.** `Player.getCooldown()`
  looked the cooldown up under the ability name lowercased with the
  spaces stripped, but the abilities stored it under a camelCase key -
  `divineProtection` against a lookup for `divineprotection`. Seven of the
  twelve distinct abilities always read "READY" in the HUD, and
  `isAbilityReady()` was always true for them. The key is now derived
  once, in `Player.cooldownKey()`, and the reader and the writer both use
  it.
- `Player.takeDamage()` hardcoded the armour reduction (`armor * 0.015`,
  capped at `0.75`). It now comes from `config/constants.js`
  (`ARMOR_DAMAGE_REDUCTION`, `ARMOR_MAX_REDUCTION`, and the derived
  `ARMOR_EXCESS_THRESHOLD`), so the damage formula and the aura cannot
  drift apart.

### Measured

| Guardian level | Armor | Damage reduction | Excess armor | Cooldown reduction |
|---|---|---|---|---|
| 1 | 40 | 60.0% | 0 | 0.0% |
| 3 | 48 | 72.0% | 0 | 0.0% |
| 4 | 52 | 75.0% | 2 | 0.8% |
| 10 | 76 | 75.0% | 26 | 10.4% |
| 20 | 116 | 75.0% | 66 | 26.4% |
| 50 | 236 | 75.0% | 186 | 50.0% (capped) |

### Files Modified
- `config/constants.js` - armour reduction constants
- `config/index.js` - exports them
- `config/player-builds.js` - the guardian's `aura` block
- `entities/player.js` - `excessArmor`, `ownCooldownReduction()`,
  `updateCooldownAura()`, `cooldownKey()`, the aura ring and readout
- `entities/abilities.js` - `setCooldown()` applies the reduction
- `core/game.js` - `game.players`, and the aura is recomputed each frame

## 2026-10-22 - Uncapped Per-Build Stat Growth

### Critical
- **Pickup bonuses were wiped by every level up.** `calculateDerivedStats()`
  recomputed `currentStats` from the build's base values, so anything a
  pickup had added was thrown away on the next level. The glass cannon
  reports the symptom: its damage is recomputed on every level, so damage
  pickups never actually raised its damage. Bonuses now live in a separate
  `bonusStats` pool and are added on top of the derived stats.
- **The reported "glass cannon cannot exceed 80 damage"** was not a cap.
  The glass cannon's curve passes through exactly 80 at level 14, and
  damage pickups were capped at 210 on top of that. There was no 80 cap
  anywhere in the code. The pickup path was dead, which is what made it
  look like a ceiling.

### Changed
- **Stat growth is data-driven and uncapped.** Each build declares a
  `growth` object in `config/player-builds.js` - which of its stats grow
  per level, and by what fraction of the base value. `calculateDerivedStats()`
  is now one generic derivation (`base * (1 + growth * (level - 1)) +
  bonus`) instead of a `switch` over the build name. A stat that grows
  keeps growing for the whole run.
- **The berserker had no level scaling at all** - its damage, HP and armor
  were identical at level 50 and level 1. It now gains 5% damage per
  level, alongside the existing rage bonus.
- **Pickup bonuses are permanent and uncapped.** Damage, speed and shield
  pickups now go through `player.addBonus()` / `player.addShield()`.
- **The player's health bar overflowed its own width** from the first level
  up: it read `Entity.maxHp`, which was never updated when the derived max
  HP grew. The derived stats now keep it in step.

### Removed
- `STAT_CAPS` (`config/constants.js`) - `maxSpeed` 300, `maxShield` 150,
  `maxHp` 1500, `maxDamage` 210. `maxHp` was never enforced anyway.
- The `MAX_SPEED` / `MAX_SHIELD` / `MAX_DAMAGE` constants in
  `entities/pickup.js` and their re-exports.
- The `currentStats.speed = baseStats.speed * SPEED_SCALE_FACTOR` line in
  `Game.start()` - the derivation owns speed now, and the line would have
  wiped the speed bonus on the first level up.

### Measured

| Stat | L1 | L14 | L20 | L50 |
|---|---|---|---|---|
| Glass cannon damage | 35 | 80 | 101 | 206 |
| Fighter HP | 350 | 714 | 882 | 1722 |
| Tank HP | 550 | 1408 | 1804 | 3784 |
| Tank armor | 45 | 74 | 87 | 155 |
| Balanced HP | 300 | 534 | 641 | 1182 |
| Balanced damage | 15 | 26 | 32 | 59 |
| Balanced armor | 22 | 39 | 47 | 86 |
| Berserker damage | 18 | 29 | 35 | 62 |
| Guardian armor | 40 | 92 | 116 | 236 |

### Still bounded
- The sniper's crit chance stops at 100% - a probability above 100% cannot
  mean anything.
- Armor's damage reduction stops at 75%. The cap is on the reduction, not
  on the stat: guardian armor keeps climbing as a number but stops
  reducing damage. Removing it would make the player heal when hit.

### Files Modified
- `config/player-builds.js` - per-build `growth` objects
- `config/constants.js` - `STAT_CAPS` deleted
- `config/index.js` - `STAT_CAPS` exports removed
- `entities/player.js` - generic uncapped derivation, `bonusStats`,
  `addBonus()`, uncapped `addShield()`, health bar fix
- `entities/pickup.js` - pickups use `addBonus()` / `addShield()`
- `core/game.js` - speed line removed
- `entities.js`, `systems/pickups.js` - stale re-exports removed

## 2026-10-22 - Render Loop, Pause and Level-Up Fixes

### Critical
- **Runaway render loop**: `main.js` and `Game.loop` both scheduled
  `requestAnimationFrame`, so the chain grew by one callback every frame
  and the scene was rendered 633 times per frame by frame 630. `Game` now
  owns the chain exclusively (`startLoop()` schedules it once).
- **Pause soft-lock**: `ESC` set the paused state without activating the
  pause scene, so the pause menu never received input, `ESC` could not
  unpause, and `MenuScene.render` was handed the `Game` object as its
  `particles` argument - throwing 633 exceptions per frame.
- **Level-up freeze**: the level-up overlay stopped play for two seconds per
  level gained, and a multi-level award cost several separate freezes. It
  was also usually unreachable, because `Player.addXP()` applies the
  level-up before the game's XP check can fire. Replaced with a fading
  notice and a particle burst; play is never interrupted.

### Measured
Headless harness, 600 frames at 1920x1080:

| Metric | Before | After |
|---|---|---|
| `game.update()` calls per frame | 333 | 1 |
| Scene renders per frame | 333 (633 peak) | 1 |
| Canvas fills per frame | 149,679 | 254 |
| Fills using `shadowBlur` | 149,663 | 253 |
| Worst frame (blurred draws) | 667,815 | 304 |
| Reported FPS | 1800 | 60 |

### Gameplay
- **Quit to main menu**: `Q` in the pause menu abandons the run and returns
  to the main menu. The app keeps running - the run state is cleared, not
  the page. A new run can be started straight away.
- **Restart from pause**: `R` restarts the run with the same build and
  difficulty.
- **One bullet, one enemy**: a player projectile could damage every enemy it
  overlapped in the same frame. Projectiles are now marked dead after their
  first hit.

### Fixes
- A key tap that begins and ends between two frames is no longer dropped;
  `keysPressed` is consumed by `isKeyPressed()` rather than cleared on
  keyup.
- The debug overlay is drawn once by the game loop, on top of everything,
  instead of once in `renderUI` and again by the pause scene.
- The menu and settings scenes no longer fill the canvas opaquely, which
  painted over the starfield and ambient particles the loop had drawn.
- The `text` particle type gained a velocity - `Particle.update()` reads
  `this.velocity` for every type and would have thrown on first use.
- `CollisionSystem` tolerates a null player.
- The FPS meter measures the real frame interval and discards outlier
  samples.
- Shooters retreat at a sane speed.
- The game-over screen now says what SPACE actually does.

### New
- `core/debug-overlay.js` - `F` toggles an overlay with fps, frame time,
  draw counts and entity counts.
- `entities/build-visuals.js` - per-build ship decoration, extracted from
  `player.js`.

### Removed
- `scenes/levelup.js` - the level-up screen is gone.

## 2026-04-21 - Game Startup Fix

### Critical Bug Fix
**Issue**: Game not starting properly due to timing issues with DOM initialization and scene rendering

**Changes**:
- Fixed timing issues with canvas initialization and event listener attachment
- Corrected initial timestamp initialization to prevent large deltaTimes on first frame
- Fixed scene rendering parameter passing for proper menu display
- Improved game loop initialization with proper context binding

**Technical Details**:
- Added setTimeout delays in main.js to ensure canvas is properly added to DOM before InputHandler attaches event listeners
- Modified InputHandler constructor to delay event listener setup
- Changed `lastTime` initialization from 0 to `performance.now()` 
- Fixed parameter passing to scene render methods:
  - MenuScene now correctly receives particles parameter for ambient effects
  - Other scenes receive appropriate parameters (game instance when needed)
- Improved game loop initialization with proper context binding in requestAnimationFrame calls

**Files Modified**:
- `main.js` - Fixed canvas initialization timing and game loop setup
- `input.js` - Delayed event listener attachment to ensure canvas is in DOM
- `core/game.js` - Fixed initial timestamp and scene rendering parameter passing

**Impact**: Game now starts properly and displays the menu correctly. Players can select builds and difficulties, then start the game with SPACE key.

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