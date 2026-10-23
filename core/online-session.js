// The online session
//
// Everything a networked run needs that a local one does not: the socket
// to the server, the snapshots turned into entities, and the lifecycle of
// a run that somebody else is simulating.
//
// The game holds one of these and asks it to start, to end and to update.

import { NetworkClient } from '../systems/network.js';
import { OnlineWorld } from './online-world.js';
import { C2S, S2C, WORLD_WIDTH, WORLD_HEIGHT } from '../shared/protocol.js';

class OnlineSession {
  constructor(game) {
    this.game = game;
    this.network = new NetworkClient();

    // The snapshots arrive between frames, not inside them, so they are
    // applied the moment they land.
    this.network.on(S2C.SNAPSHOT, (message) => {
      if (this.game.onlineWorld) this.game.onlineWorld.apply(message.world);
    });
  }

  // Start a networked run. The world is on the server - this only sets up
  // the client side of it: the local player, the place the snapshots are
  // put, and the shape of the screen the world is drawn on.
  start(room) {
    const game = this.game;
    game.mode = 'multiplayer';
    game.runOptions = { mode: 'multiplayer', roomId: room ? room.id : null };

    // The shared world has a fixed size, whatever the window is.
    game.worldWidth = WORLD_WIDTH;
    game.worldHeight = WORLD_HEIGHT;

    game.clearRunState();

    const me = room && room.players
      ? room.players.find(p => p.id === this.network.playerId)
      : null;

    game.player = game.addPlayer({
      playerId: this.network.playerId || 'local',
      buildName: me ? me.build : game.buildNames[0],
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT - 100,
      playerName: me ? me.name : 'YOU'
    });

    game.onlineWorld = new OnlineWorld(game);
    this.updateTransform();

    window.gameInstance = game;
    game.state = 'playing';
    game.lastTime = performance.now();
  }

  // The run is over. The room goes back to being a lobby and so does the
  // client.
  end() {
    this.game.mode = 'single';
    this.game.state = 'lobby';
    this.game.clearRunState();
    this.game.onlineWorld = null;
    this.game.sceneManager.switchTo('lobby');
  }

  // Leave a run before it is over.
  leave() {
    this.network.send({ t: C2S.LEAVE_ROOM });
    this.end();
  }

  // One frame of a networked run: the input goes to the server and the
  // snapshots are drawn where they landed.
  update(deltaTime) {
    this.sendInput();

    const world = this.game.onlineWorld;
    if (world) {
      world.render(world.alpha());
      world.animate(deltaTime);
    }

    this.game.particles.update(deltaTime);

    if (this.game.noticeTimer > 0) this.game.noticeTimer -= deltaTime;
  }

  // The local player's input, on its way to the server. It is built the
  // same way the local game builds it, so the input scheme works the same
  // in a networked run.
  sendInput() {
    if (this.network.state !== 'open') return;
    this.network.sendInput(this.game.localInput());
  }

  // The shared world is a fixed size. The client draws it scaled to fit
  // the canvas, so everybody sees the same field whatever their window is.
  updateTransform() {
    const game = this.game;
    if (game.mode !== 'multiplayer') {
      game.worldScale = 1;
      game.worldOffsetX = 0;
      game.worldOffsetY = 0;
      return;
    }
    const scale = Math.min(game.width / game.worldWidth, game.height / game.worldHeight);
    game.worldScale = scale;
    game.worldOffsetX = (game.width - game.worldWidth * scale) / 2;
    game.worldOffsetY = (game.height - game.worldHeight * scale) / 2;
  }
}

export { OnlineSession };
