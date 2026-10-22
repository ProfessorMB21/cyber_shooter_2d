# Changelog

All changes, bug fixes, and improvements made to the Cyber Shooter game.

## The Settings Screen Shows What Is In Force (2026-10-23)

### The settings screen says what is in force
There were two different things on the screen and only one of them was
marked: the cursor moved, but nothing said which profile or scheme was
actually in use. Now:

- The option that is in force carries an `ACTIVE` badge. The cursor
  keeps its own marker, so the two are not confused for each other.
- The line under the title reads `IN USE: ...` and names both settings
  that are in force.

### The input schemes are a row of cards
The three schemes were a column of text in a list, which is the least
clear way to choose between them. They are now **three cards in a row**,
each with a picture of the scheme in it - the keys that are used lit up,
the mouse and the crosshair where they apply.

The pictures are SVG files in `assets/input-schemes/`, so they stay sharp
at any size and cost nothing to load. A picture that has not arrived yet
is replaced by the name of the scheme, so the screen is never blank.

### The back button no longer sits on the hints
The `BACK` button in the settings panel overlapped the key hints. The
hints are now two lines on the left of the panel and the button is on
the right, so they cannot run into each other.

### Files Modified
- `scenes/settings.js` - the row of cards, the `IN USE` line, the
  active badge and the panel that no longer overlaps
- `scenes/settings-options.js` - new: how the options are drawn
- `scenes/scheme-images.js` - new: loads the SVG pictures
- `core/settings.js` - the scheme descriptions, shortened to fit a card
- `assets/input-schemes/*.svg` - new: the three pictures

## The Menus Are Never Quite Still (2026-10-23)

### The menus are never still
The main menu used to be a picture. The starfield behind it was only
updated while a run was going, the backdrop was the plain game
background, and the title sat there with a fixed glow. The menu now
runs on the same clock as the world does.

- The starfield drifts behind the menus, not just in a run.
- The backdrop has clouds of colour that sway and a band of light that
  crosses the screen every fourteen seconds.
- The title glow breathes, the marker beside the selected entry blinks,
  the outline of the row the cursor is on pulses, and the hint line
  fades in and out.

`core/game.js` keeps a clock that advances every frame whatever the game
is doing, and the time since the last frame is worked out at the top of
the loop so every branch has it.

### Files Modified
- `core/visual-effects.js` - the menu backdrop: the clouds, the sweep
  and the menu's own draw path
- `core/game.js` - the clock, and the delta at the top of the loop
- `scenes/menu.js` - the breathing title, the blinking marker, the
  pulsing rows
- `scenes/ui.js` - `pulse`, `drawGlowText`, `fitText` and `wrapText`

## The Mouse And The Input Schemes (2026-10-23)

### The feature
The mouse now works on **every** screen, and what the mouse and the
keyboard do in a run is the player's choice. There are three schemes, and
the one in use is chosen in Settings and remembered between sessions.

| Scheme | Move | Aim | Shoot | Abilities |
|---|---|---|---|---|
| Keyboard Only | `WASD` / arrows | Straight up | `SPACE` | `1` and `2` |
| Keyboard + Mouse | `WASD` / arrows | The mouse | Left click | `1` and `2` |
| Mouse + QER | The mouse | The mouse | Left click | `Q` and `E` |

The mouse used to be tracked and thrown away. Shots were hardcoded
straight up in `core/combat.js` and `input.getMouseDirection()` was dead
code. Both are gone; the shots now go where the pointer is.

### The mouse on every screen
The main menu, the build select, the wingman select, the settings, the
lobby, the room, the pause menu and the game over screen all take the
pointer: hovering selects an entry and clicking activates it. The ability
panels in the corner of the screen are buttons too - click one and that
ability fires.

The keyboard still works everywhere, so nothing became mouse-only.

### One layout, drawn and clicked
Every screen computes its layout once and then both draws it and hit-tests
against it. The rectangle the mouse hits and the rectangle the player
sees are the same numbers, so a button cannot drift away from the thing
it activates - and the hit test is not a frame behind the drawing, because
the layout is recomputed when the screen is updated rather than recorded
when it is rendered.

`scenes/ui.js` holds the shared plumbing: a registry of clickable
rectangles, a helper that lays a row of buttons out, and the button
drawing itself.

### The scheme is the same online
`core/controls.js` turns the keyboard and the mouse into the input object
the simulation already understood. Both the local game and the online
client build their input with it, so a networked run behaves exactly like
a local one and the server needs to know nothing about the scheme.

The pointer is in canvas coordinates and the shared world is drawn scaled
to fit the window, so the position is converted into world coordinates
before it is used.

### Files Modified
- `core/controls.js` - new: the one place the keyboard and the mouse
  become the input object
- `scenes/ui.js` - new: the clickable item registry and the buttons
- `core/settings.js` - the three schemes, and they are saved to
  `localStorage` like the performance profile is
- `input.js` - the click position, the "the mouse moved" flag, the
  right button ignored and the browser's own menu suppressed;
  `getMouseDirection()` deleted
- `core/game.js` - the local input, the ability buttons in the HUD, and
  the click that belongs to the game rather than to the pause menu
- `core/renderer.js` - the crosshair, the line from the ship to the
  pointer, and the ability panels collected as they are drawn
- `entities/player.js` - the ability panels return their rectangles, so
  the mouse can find them
- `core/online-session.js` - the input that goes to the server is built
  by the same code
- `scenes/menu.js`, `scenes/settings.js`, `scenes/lobby.js`,
  `scenes/pause.js`, `scenes/gameover.js` - the mouse on every screen

### Fixed
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
- **The mouse used to be tracked and thrown away.** The shots were
  hardcoded straight up in `core/combat.js` and `input.getMouseDirection()`
  was dead code. Both are gone.

### Verified
A new headless probe drives the real game with a real mouse: the three
schemes are offered, a click on the menu opens the settings, the settings
apply a scheme and remember it, the mouse aims the shot and the
projectile travels at that angle, a click shoots, the mouse moves the
ship, `Q` and `E` fire the abilities, the ability buttons in the HUD
take a click, a click from the game does not press a pause button, a
click lands where the button went down, the pause menu's QUIT button
works, the game over button works, and nothing throws. **26 assertions,
26 passing.**

The existing suite is unchanged: 55 assertions, 55 passing. The mode
probe: 12, 12. The dualist probe: 8, 8. The AI probe: 42, 42. The
simulation probe: 4, 4. The online probe: 17, 17. The performance is
unchanged: 253.42 fills per frame against a baseline of 253.18, one
`requestAnimationFrame` callback per frame, no errors.

## The Online Client (2026-10-23)

### The feature
The third game mode is playable: **Multiplayer**, up to five players in one
room over the network. The main menu is now a list of three modes, and
picking Multiplayer opens a lobby instead of the build select.

```
Main menu -> MULTIPLAYER -> the lobby -> a room -> your callsign and build -> play
```

### The lobby
- The room list, with the number of players in each room. `C` creates one.
- In a room: the roster, and the two pickers - your callsign (up and down)
  and your build (left and right). `ENTER` starts the run for everybody in
  the room, `ESC` leaves it.
- The callsigns are picked from a list rather than typed, so the roster
  stays readable.

### The client never simulates the world
The server sends snapshots and the client draws them. The snapshots are
turned into the real entity objects - the same `Enemy`, `Boss`,
`Projectile` and `Pickup` classes the local modes use - so the drawing
code does not have to know that the run is online, and the renderer needed
no changes beyond the world transform.

- The world is drawn one snapshot behind and the positions are
  interpolated between the two most recent snapshots, so the movement is
  smooth at 20 snapshots a second.
- The shared world is 1280x720 and every client draws it scaled to fit its
  own window, so the field is the same for everybody.
- The snapshot carries the player's XP, their damage and the seconds left
  on each of their ability cooldowns, so the HUD is right without the
  client having to work anything out.
- A dead player is not drawn, and the roster shows them as `DOWN`.

### Online runs cannot be paused
The world keeps running on the server whether you like it or not, so `ESC`
says so instead of pausing. Once you are down you can watch the rest of
the fight, and `ESC` leaves the room.

### Files Modified
- `systems/network.js` - new: the client side of the socket
- `core/online-world.js` - new: the snapshots turned into entities
- `scenes/lobby.js` - new: the lobby, the room and the two pickers
- `scenes/index.js` - exports the lobby, and the scene manager tells a
  scene when it is shown and when it is left
- `scenes/menu.js` - an online mode opens the lobby
- `config/game-modes.js` - the multiplayer mode
- `core/game.js` - the online run, the input that goes to the server and
  the world transform
- `core/renderer.js` - the world transform, dead players and the notice
- `core/simulation.js` - a player who is out of the run does not move and
  does not shoot
- `server/rooms.js`, `server/index.js`, `shared/protocol.js` - the callsign,
  the fuller player snapshot, the latched ability presses and the build
  name check

### Verified
A new headless probe starts the real server and drives the real client
against it: the menu opens the lobby, the client connects and is given an
id, the room list arrives, it creates a room, the roster shows it, the
build reaches the server, the run starts, the enemies and the projectiles
come back from the server, the world is the shared size and is scaled to
fit, the local player moves when the key is held, and the run does not
throw. **17 assertions, 17 passing.**

The existing suite is unchanged: 55 assertions, 55 passing. The mode
probe is unchanged: 12 assertions, 12 passing. The performance is
unchanged: 253.13 fills per frame against a baseline of 252.81-253.6, one
`requestAnimationFrame` callback per frame, no errors.

## The Multiplayer Server (2026-10-23)

### The feature
A server that serves the game over HTTP and runs the networked worlds over
a WebSocket on the same port. It has no dependencies at all.

```bash
npm start          # node server/index.js
# then open http://localhost:8080
```

### What is in it
- **`server/websocket.js`** - a hand written RFC 6455 WebSocket server.
  The project has no build step and no `node_modules`, so a library was not
  an option. This is the part of the RFC the game needs: the opening
  handshake, text frames in both directions, fragmentation, ping, pong and
  close. The frames the server sends are never masked; the ones it receives
  always are, and the mask is undone as they are parsed.
- **`server/rooms.js`** - the rooms. A room is a lobby and a world: players
  join it, pick a build, and when somebody starts the run the room creates
  a `Simulation`, adds every player to it, and ticks it. A room holds up to
  five players.
- **`server/index.js`** - the HTTP server, the WebSocket upgrade, the
  message handling and the ticker. One timer drives every room.
- **`shared/protocol.js`** - the messages the two sides exchange, shared by
  both so they can never disagree about what a message means.

### The server is the authority
A networked room runs **one** simulation, on the server. The clients send
their input and are sent snapshots of the world; they never simulate it
themselves, so they cannot drift apart.

- The world ticks at 60 Hz. The snapshots go out at 20 Hz - nobody can see
  the difference between the two and the bandwidth is real.
- A snapshot carries the players, the enemies, the bosses, the projectiles
  and the pickups, with the positions in each entity's own centre.
- A client's input goes stale after half a second without a refresh. A
  client that stalls stops moving rather than running on forever.
- When the last player in a room dies the run is over and the room goes
  back to being a lobby.

### Files Modified
- `server/index.js` - new: the HTTP server, the WebSocket upgrade and the
  60 Hz ticker
- `server/websocket.js` - new: the hand written WebSocket
- `server/rooms.js` - new: the lobby rooms and the worlds they run
- `shared/protocol.js` - new: the wire protocol
- `package.json` - a `start` script

### Verified
A new headless probe starts the real server as a child process and drives
it with two real WebSocket clients: they connect, are welcomed with
different ids, one creates a room, the other joins it, the run starts, the
world is simulated on the server, the snapshots reach both clients with
the players in them and the players moving, and a disconnect takes the
player out of the world without stopping the server. **16 assertions, 16
passing.**

The static server was checked by hand too: the game files are served with
the right content types, a missing file is a 404, and four different
path-traversal attempts (raw and percent-encoded) all come back 404
rather than reaching outside the project directory.

The existing suite is unchanged: 55 assertions, 55 passing.

## Game Modes and Dualist (2026-10-23)

### The feature
The main menu is now a list of game modes. `UP`/`DOWN` moves through it
and `SPACE` picks one. Two modes are playable today:

| Mode | Players | Where the world runs |
|---|---|---|
| Single Player | 1 | On your machine |
| Dualist | 2 - you and an AI wingman | On your machine |

### Dualist
You and a wingman fly the same field. The wingman is a full player - it
takes damage, it levels up, it collects pickups, it uses its abilities,
and it can die. It is driven by the AI rather than by the keyboard, and it
has a build of its own, chosen on its own screen after yours:

```
Main menu -> DUALIST -> your build + difficulty -> the wingman's build -> play
```

The build select screen is unchanged for a single player run, so the
existing flow - `SPACE`, `SPACE` - still starts a game.

### Shared kills and XP
A kill grants XP and score to every living player. The level penalty is
worked out from the *average* level of the living players, so a single
player run is numerically identical to the one it replaced, and a dualist
run levels both players up at about the rate one player would level up at.

The guardian's cooldown aura now has somebody to cover: it reaches 260
pixels, and the wingman stands inside it when it keeps close.

### Reading the screen
- A panel in the top right lists the other players in the run - their name,
  their level and their health. A dead player shows as `DOWN`.
- Every player but your own has a name tag over their ship, so the wingman
  and the remote players can be told apart at a glance.
- The local player's bullets are yellow; everyone else's take their build
  colour.

### Files Modified
- `config/game-modes.js` - new: the modes, their player limits and whether
  they are online
- `config/index.js` - re-exports them
- `scenes/menu.js` - the main menu is a mode list, and there is a new
  wingman select screen
- `core/game.js` - handles the two new scene actions
- `core/renderer.js` - the roster panel and the name tags

### Verified
A new headless probe drives the real menu: it opens the build select, starts
a single player run, goes back, picks the second mode, picks a build, picks
a different wingman build, and checks the run that comes out has two
players, that the wingman is an AI player with a controller, and that the
two builds were chosen independently. **12 assertions, 12 passing.**

The existing suite is unchanged: 55 assertions, 55 passing.

## The Friendly AI (2026-10-23)

### The feature
`systems/ai.js` is a new controller that drives a player the way a person
would: pick a target, move around it, shoot at it, and use an ability when
the build says the moment is right. It produces the same input object the
keyboard produces, so nothing downstream - the player entity, the combat
system, the cooldowns - knows whether a person or the AI is in charge.

An AI player is a full player. It takes damage, it levels up, it collects
pickups, it uses its abilities, and it can die.

### How each build fights
Every build has its own idea of a fight, in one table:

| Build | Range | Strafing | Stays with the party | Aggression |
|---|---|---|---|---|
| Fighter | 220 | 0.70 | 380 | 0.65 |
| Glass Cannon | 300 | 0.80 | 380 | 0.55 |
| Tank | 150 | 0.40 | 320 | 0.75 |
| Balanced | 210 | 0.60 | 360 | 0.65 |
| Sniper | 430 | 0.50 | 420 | 0.45 |
| Berserker | 110 | 0.30 | 300 | 0.95 |
| Guardian | 190 | 0.50 | 200 | 0.50 |

The range is the distance it holds from its target - the berserker wants to
be on top of the enemy, the sniper wants to be far away, the glass cannon
sits in between. Strafing is how much it circles. "Stays with the party" is
how close it keeps to the other players, and the guardian keeps closest of
all because its aura only reaches 260 pixels. Aggression is how hard it
pushes towards the target rather than away from it.

On top of that it swerves away from the enemies that are on top of it,
goes for a health pickup when it is hurt, and stays off the edges of the
world. It holds its target for 0.6 seconds at a time so it does not flip
between two equally close enemies every frame, and a boss wins the contest
if it is within 700 pixels.

### When it uses an ability
The abilities fire on rules rather than on a timer. Each rule reads what
the AI can see - how hurt it is, how many enemies are close, how its ally
is doing:

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

The rules are keyed by the ability's display name, so all twelve live in
one table in `systems/ai.js` and every build's pair of abilities finds its
entry there.

### How it is wired in
- `core/game.js` keeps a map of controllers, keyed by player id. A player
  flagged `isAI` gets one in `start()`, and `buildInputs()` routes that
  player through its controller instead of the keyboard.
- The frame time is threaded through `buildInputs(deltaTime)` rather than
  stored on the game, so a controller can be driven from a test without a
  frame loop.
- The AI aims. `combat.playerShoot(player, aim)` already took an angle, so
  the AI's bullets go where it is looking while the human's still go
  straight up.

### Files Modified
- `systems/ai.js` - new: the controller, the per-build table, the ability
  rules
- `core/game.js` - the controller map, and `buildInputs()` routes the AI
  players

### Verified
Two new headless probes:
- `probe-ai.mjs` runs the controller against a real `Simulation` for each
  of the seven builds - 15 seconds each, with a ring of enemies around the
  AI. Every build has to move, shoot, damage the enemies, use an ability
  and survive. **42 assertions, 42 passing.**
- `probe-dualist.mjs` boots the real `Game` class with a human player and
  an AI wingman and checks the wingman is driven by a controller, moves on
  its own, shoots the enemies, and that the run renders without throwing.
  **8 assertions, 8 passing.**

The existing suite is unchanged: 55 assertions, 55 passing. The
performance harness is unchanged too: 254.06 canvas fills per frame
(baseline 252.81-253.6), one `requestAnimationFrame` callback per frame,
0 errors.

## Simulation / Presentation Split (2026-10-23)

### The feature
The game world has been lifted out of the canvas. `core/simulation.js` is a
new, DOM-free `Simulation` class that holds the players, the enemies, the
bosses, the projectiles and the pickups, and advances them from a set of
inputs. `core/game.js` now *is* that simulation - `Game extends Simulation` -
with a canvas, an input handler and the screens attached on top.

Nothing about the game changed for the player: a single player run behaves
exactly as it did. What changed is that the world can now be run by
something that has no screen.

### Why
A networked run has to be simulated in exactly one place. If every client
simulated its own copy of the world, they would drift apart within a second
or two - two enemies killed by two different clients, a boss dead on one
screen and alive on the next. The server needs to run the *same* physics,
combat, collision, spawning and scoring code the browser runs, and the only
way to guarantee that is to run the same module.

The split is therefore the prerequisite for multiplayer, not a refactor for
its own sake.

### The input contract
Every player - human, AI or remote - is driven by the same frozen input
object:

```js
{ dx, dy, shoot, ability1, ability2, aim }
```

`Simulation.update(deltaTime, inputs)` takes a map from player id to that
object. The local player builds one from the keyboard, the AI builds one
from what it can see, and the server builds one from what a client sent over
the wire. A player with no input for this frame gets `EMPTY_INPUT` - no
movement, no shooting.

### What else changed
- **`nearestTo(x, y, candidates)`** in `systems/entity.js` is now how
  everything picks a target. It accepts a single entity or a list and skips
  the dead ones, so enemies, bosses, pickups and enemy projectiles all
  target the nearest *living* player. In a solo run that is the same player
  as before.
- **`combat.playerShoot(player, aim)`** takes an optional angle. The local
  player passes `null` and shoots straight up exactly as before; the AI
  passes a real angle. The local player's bullets stay yellow; everyone
  else's take their build colour.
- **XP and score are shared.** A kill grants XP and score to every living
  player. The level penalty is derived from the *average* level of the
  living players, so with one player the numbers are identical to the
  single player run they replaced.
- **The renderer draws every player** in `game.players`, and culls
  projectiles and pickups against the world size rather than the canvas size.
- **`package.json`** is new, with `"type": "module"` and no dependencies.
  It is what lets Node import the game's ES modules for the server; without
  it Node would treat them as CommonJS and the import would fail. There is
  still no build step, no bundler and no lockfile.
- **The Simulation is verified without a DOM.** A probe imports
  `core/simulation.js` into plain Node, runs 120 steps with two players
  (a fighter and a guardian) and checks that the world advances, both
  players survive and the grunts take damage from the players' shots.

### Files Modified
- `core/simulation.js` - new: the DOM-free world, `EMPTY_INPUT`,
  `NullParticles`
- `core/game.js` - `Game extends Simulation`; the canvas, input, scenes and
  level-up notice stay here
- `core/combat.js` - `playerShoot` takes an aim angle
- `core/collision.js` - enemy projectiles hit the nearest living player
- `core/events.js` - shared XP and score, penalty from the average level
- `core/spawning.js`, `core/renderer.js` - world size instead of canvas size
- `entities/player.js` - the input may be a plain object
- `entities/enemy.js`, `entities/boss.js`, `entities/pickup.js` - target the
  nearest living player
- `systems/entity.js` - `nearestTo()`
- `package.json` - new

### Verified
The headless suite is at 55 assertions, 55 passing - unchanged from before
the split. The performance harness is unchanged too: 253.94 canvas fills per
frame (baseline 252.81-253.6), one `requestAnimationFrame` callback per
frame, 0 errors.

## The Guardian's Cooldown Aura (2026-10-22)

### The feature
Armor reduces incoming damage by 1.5% per point, up to 75%. Armor 50 is
where that reduction is maxed out, so armor past 50 is **excess** - it
cannot make the guardian any harder to kill. The guardian now spends the
excess on a cooldown-reduction aura:

- The aura is **off until the damage reduction is maxed out**. The
  guardian reaches armor 52 at level 4, so the aura starts there. Before
  that the excess is zero and the reduction is zero.
- Each point of excess armor is worth 0.4% of cooldown reduction, capped
  at 50%. Level 4 gives 0.8%, level 10 gives 10.4%, level 20 gives 26.4%
  (66 excess armor), and level 50 is capped at 50%.
- The aura reaches 260 pixels and covers the guardian and any other player
  inside it. The game has one player, so today that means the guardian
  itself - the aura is the seam a second player would use.
- The reduction applies to the whole cooldown rather than to the readout,
  so the ability really does come back sooner: Divine Protection's 20
  seconds becomes 14.72 seconds at a 26.4% reduction.
- The aura is drawn as a faint ring around the guardian, and the ability
  panel shows `AURA -26% CD` while it is active.

### Fixed along the way
- **Half the abilities never showed a cooldown.** `Player.getCooldown()`
  read `cooldowns[namelowercasedwithoutspaces]`, but the abilities stored
  their cooldowns under camelCase keys - `divineProtection` against a
  lookup for `divineprotection`. Seven of the twelve distinct abilities
  (Healing Shot, Ground Slam, Adrenaline Rush, Sniper Shot, Smoke Screen,
  Berserk Rage, Divine Protection) therefore always read "READY" in the
  HUD, and `isAbilityReady()` was always true for them. The key is now
  derived in one place, `Player.cooldownKey()`, and both the reader and
  the writer use it.
- `Player.takeDamage()` hardcoded the armour reduction as `armor * 0.015`
  capped at `0.75`. Those numbers now come from
  `config/constants.js` as `ARMOR_DAMAGE_REDUCTION`,
  `ARMOR_MAX_REDUCTION` and the derived `ARMOR_EXCESS_THRESHOLD`, so the
  damage formula and the aura cannot drift apart.

### Files Modified
- `config/constants.js` - armour reduction constants
- `config/index.js` - exports them
- `config/player-builds.js` - the guardian's `aura` block
- `entities/player.js` - `excessArmor`, `ownCooldownReduction()`,
  `updateCooldownAura()`, the aura ring, the aura readout
- `entities/abilities.js` - `setCooldown()` applies the reduction
- `core/game.js` - `game.players`, and the aura is recomputed each frame

### Verified
The headless suite is at 55 assertions, 55 passing. The new ones cover:
no aura before the damage reduction is maxed out, the aura starting
after it, the real cooldown being shortened, a player inside the aura
getting the reduction and one outside not getting it, other builds having
no aura, every one of the 14 abilities reporting a cooldown, and a live
guardian run applying the aura without throwing.

## Uncapped Per-Build Stat Growth (2026-10-22)

### The reported bug
"Glass cannon cannot exceed 80 damage."

Measured, there was no 80-damage cap in the code. Three separate things
produced that number:

- The glass cannon's damage curve passes through **exactly 80 at level 14**
  (`35 * (1 + 0.10 * 13) = 80.5`, floored to 80). Anything past it came
  only from the next level up.
- Damage **pickups** were capped at 210 in total, and the cap was applied
  to `currentStats.damage`.
- Every level up recomputed `currentStats.damage` from the build's base
  value, so **a damage pickup was wiped by the next level up**. The glass
  cannon is the build whose damage is recomputed on every level, so for it
  damage pickups contributed nothing lasting.

The pickup path was therefore dead, and the level path was easy to mistake
for a ceiling.

### What changed
- `config/player-builds.js`: each build now declares a `growth` object -
  which of its stats grow per level, and by what fraction of its base
  value. The `passive` string stays next to it.
- `entities/player.js`: `calculateDerivedStats()` is now one generic
  derivation driven by that object - `base * (1 + growth * (level - 1)) +
  bonus` - instead of a `switch` over the build name. **Nothing is
  capped.**
- `entities/player.js`: pickup bonuses live in a separate `bonusStats`
  pool, so levelling up cannot wipe them. `addBonus(stat, amount)` is the
  new entry point.
- `entities/pickup.js`: damage and speed pickups call `addBonus()`. The
  `MAX_SPEED` / `MAX_SHIELD` / `MAX_DAMAGE` constants are gone.
- `config/constants.js`: `STAT_CAPS` is deleted outright - `maxSpeed` 300,
  `maxShield` 150, `maxHp` 1500, `maxDamage` 210. (`maxHp` was never
  enforced anyway: the tank passed 1800 HP at level 20.)
- `core/game.js`: the `currentStats.speed = baseStats.speed *
  SPEED_SCALE_FACTOR` line in `start()` is gone - the derivation owns speed
  now, and the line would have wiped the speed bonus on the first level
  up.
- `entities/player.js`: the player's own health bar read `Entity.maxHp`,
  which was never updated when the derived max HP grew, so the bar
  overflowed its own width from the first level up. The derived stats now
  keep `maxHp` in step.

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

A glass cannon at level 50 with twenty damage pickups deals 246 - past the
old 210 cap, which a hundred damage pickups would once have hit and stopped
at. The shield is uncapped too, and the speed bonus is uncapped.

The **berserker used to have no level scaling at all** - its damage, HP and
armor were the same at level 50 as at level 1. It now gains 5% damage per
level.

### What is still bounded, and why
- **The sniper's crit chance stops at 100%.** A probability above 100%
  cannot mean anything.
- **Armor's damage reduction stops at 75%.** The cap is on the reduction,
  not on the stat: guardian armor keeps climbing past 50 as a number, but
  past that point it no longer reduces any more damage. Removing the cap
  would mean a reduction over 100%, which would make the player *heal*
  when hit.

### Verified
The headless suite is at 46 assertions, 46 passing. The new ones cover:
glass cannon damage passing 80 and continuing to grow, damage and speed
pickups surviving a level up, damage/shield/speed no longer being capped,
every build's stat matching its declared rate and still growing at level
50, the sniper's crit chance reaching but not passing 100%, the berserker
scaling, and the health bar reference tracking the growing max HP.

## Bug Fix Pass and Quit-to-Menu (2026-10-22)

### Runaway render loop (critical)
**Issue**: `main.js` scheduled a `requestAnimationFrame` chain *and*
`Game.loop` rescheduled itself, so the chain grew by one callback every
frame. By frame 630 the scene was being rendered 633 times per frame, and
every one of those renders threw an exception (see the pause soft-lock
below), so the errors repeated 633 times per frame as well.

**Fix**: `Game` now owns the `requestAnimationFrame` chain exclusively.
`startLoop()` schedules it once; `loop()` schedules the next frame and
nothing else may schedule it.

**Measured** (headless harness, 600 frames, 1920x1080):

| Metric | Before | After |
|---|---|---|
| `game.update()` calls per frame | 333 | 1 |
| Scene renders per frame | 333 (633 peak) | 1 |
| Canvas fills per frame | 149,679 | 254 |
| Fills using `shadowBlur` | 149,663 | 253 |
| Worst frame (blurred draws) | 667,815 | 304 |
| Reported FPS | 1800 | 60 |

### Pause soft-lock (critical)
**Issue**: `ESC` set `state = 'paused'` without activating the pause scene.
`PauseScene.update` never ran, so `ESC` could not unpause, the main menu was
drawn over the frozen game, and `MenuScene.render` received the *Game*
object as its `particles` argument - throwing `game.draw is not a function`
633 times per frame, forever.

**Fix**: pausing now switches to the `pause` scene as well as setting the
state, so the pause menu receives input and unpauses cleanly.

### Quit to main menu
`Q` in the pause menu abandons the run and returns to the main menu. The
`Game` instance and the animation loop stay alive - only the run state is
cleared - so a new run can be started immediately without reloading the app.
`R` restarts the run with the same build and difficulty.

### Level-up no longer interrupts play
The level-up overlay froze the game for two seconds per level gained, and a
multi-level award cost the player several separate freezes. It was also
unreachable in practice: `Player.addXP()` already applies the level-up, so
the XP threshold the scene waited for had usually been consumed before the
game could notice it.

Level-ups are now announced with a fading notice and a particle burst at the
player. Nothing pauses, nothing overlays the action. `scenes/levelup.js` is
deleted.

### One bullet, one enemy
A player projectile could damage every enemy it overlapped in the same frame.
Projectiles are now marked dead after their first hit, so a bullet damages
exactly one enemy.

### Other fixes
- A key tap that begins and ends between two frames is no longer dropped.
- `keysPressed` is consumed by `isKeyPressed()` rather than cleared on
  keyup, so the tap survives until the frame that reads it.
- The debug overlay is drawn once by the game loop, on top of everything,
  instead of once inside `renderUI` and once again by the pause scene.
- The menu and settings scenes no longer fill the canvas with an opaque
  rectangle, which was painting over the starfield and ambient particles
  the loop had already drawn.
- The `text` particle type gained a velocity, because `Particle.update()`
  reads `this.velocity` for every particle type and would have thrown on
  the first use.
- `CollisionSystem` tolerates a null player, so quitting to the menu cannot
  throw from a collision check.
- The FPS meter now measures the real frame interval instead of callback
  scheduling jitter, and discards outlier samples (tab switches).
- Shooters retreat at a sane speed instead of accelerating away.
- The game-over screen says "Press SPACE to return to main menu", which is
  what it actually does.

### New
- `core/debug-overlay.js` - press `F` for fps, frame time, draw counts and
  entity counts.
- `entities/build-visuals.js` - per-build ship decoration, extracted from
  `player.js`.

## Codebase Consistency Update (2026-04-16)

### Configuration Centralization
- **Single Source of Truth**: All game balance values now come from `config.js`
  - Player build stats (hp, damage, speed, armor, etc.)
  - Enemy type stats (hp, damage, speed, xp values)
  - Stat caps (maxSpeed, maxShield, maxHp, maxDamage)
  - Speed scaling factor (SPEED_SCALE_FACTOR: 30)
  - Stat growth multipliers per level

### Updated Config Values
- **config.js** now contains the actual gameplay values (nerfed stats from recent balance):
  - Fighter: 350 HP, 12 damage (was 500/20)
  - Glass Cannon: 200 HP, 35 damage (was 280/65)
  - Tank: 550 HP, 8 damage (was 800/15)
  - All 7 builds updated with correct values
- **Enemy types** added to config with current buffed stats:
  - Grunt: 150 HP, 25 damage
  - Fast: 80 HP, 250 speed
  - Tank: 450 HP, 20 damage
  - Shooter/Elite: Updated values
- **Pickup values** in config match gameplay:
  - Health: 20 (was 50)
  - Shield: 10 (was 25)
  - Speed: 5 (was 20)
  - Damage: 2 (was 5)

### Code Refactoring
- **player.js**: Now imports `BUILDS`, `STAT_CAPS`, `STAT_GROWTH`, `SPEED_SCALE_FACTOR` from config
- **enemy.js**: Now imports `ENEMY_TYPES` from config
- **pickup.js**: Now imports `STAT_CAPS` from config for pickup value caps
- All stat constants defined once in config, used everywhere

### Projectile Bounds Fix
- **projectile.js**: Replaced hardcoded magic numbers (`-50` to `850/650`) with configurable bounds
- Bounds now default to `-100` to `2000x1500` to support larger screens
- Can be overridden per projectile via `options.bounds`

### Files Modified
- `config.js` - Added all gameplay values, stat caps, enemy types
- `entities/player.js` - Now imports from config instead of hardcoding
- `entities/enemy.js` - Now imports enemy types from config
- `entities/pickup.js` - Now imports stat caps from config
- `entities/projectile.js` - Fixed hardcoded bounds
- `entities.js` - Updated exports
- `CHANGELOG.md` - This update

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
- Game states: menu, settings, playing, paused, gameover
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
- **1 / 2** - Active abilities
- **ESC or P** - Pause (and resume)
- **R** - Restart the run from the pause menu
- **Q** - Quit to the main menu from the pause menu
- **F** - Toggle the debug overlay
- **UP/DOWN** - Navigate build selection
- **LEFT/RIGHT** - Navigate difficulty selection
- **S** - Settings from the main menu

## File Structure

See the project structure section of README.md - it is the current one. The
tree below is the historical layout from the initial implementation and is
kept for reference only.

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

See the known issues section of README.md for the current list. As of
2026-10-22 it covers dead code, an unreachable boss, unused config exports
and a stale constant.

## Future Improvements

- [ ] Sound effects and music
- [ ] Save/load high scores
- [ ] Additional enemy types
- [ ] Weapon upgrades and drops
- [ ] Multiplayer support
- [ ] Mobile touch controls
- [x] Screen shake effects
- [ ] More particle effects
- [ ] Achievements system
