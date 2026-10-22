// Lobby Scene - the online multiplayer lobby
//
// It is the room list, the room itself, and the two pickers a player fills
// in before a run: the callsign and the build. The run itself is started
// by the server - the lobby asks, and the server answers with a start
// message, which the game turns into a networked run.

import { BUILDS } from '../entities/player.js';
import { C2S, S2C, MAX_PLAYERS } from '../shared/protocol.js';

// The callsigns a player can pick from. Picking one is easier than typing
// one, and it keeps the roster readable.
const CALLSIGNS = [
  'VIPER', 'FALCON', 'HORNET', 'RAVEN',
  'COBALT', 'ONYX', 'TITAN', 'ZEPHYR'
];

class LobbyScene {
  constructor(game) {
    this.game = game;
    this.buildNames = Object.keys(BUILDS);

    // 'connecting' | 'rooms' | 'room' | 'disconnected'
    this.state = 'connecting';
    this.rooms = [];
    this.room = null;
    this.selection = 0;
    this.buildSelection = 0;
    this.callsignSelection = 0;
    this.error = null;
    this.status = '';

    const net = game.network;

    net.on(S2C.ROOMS, (message) => {
      this.rooms = message.rooms || [];
      if (this.state === 'connecting') this.state = 'rooms';
      this.error = null;
    });

    net.on(S2C.ROOM, (message) => {
      this.room = message.room;
      this.state = 'room';
      this.error = null;
      // A room that is not running any more means the run is over and the
      // room has gone back to being a lobby.
      if (!message.room.running && this.game.mode === 'multiplayer') {
        this.game.endOnlineRun();
      }
    });

    net.on(S2C.PLAYER_JOINED, (message) => {
      this.status = `${message.player.name} joined the room`;
    });

    net.on(S2C.PLAYER_LEFT, () => {
      this.status = 'A player left the room';
    });

    net.on(S2C.ERROR, (message) => {
      this.error = message.message;
    });

    net.on(S2C.START, (message) => {
      this.game.startOnline(message.room);
    });

    net.onDisconnect = () => {
      this.state = 'disconnected';
    };
  }

  // The lobby is being shown. Connect if we are not already.
  enter() {
    this.error = null;
    const net = this.game.network;
    if (net.state === 'open') {
      this.state = this.room ? 'room' : 'rooms';
      net.send({ t: C2S.ROOMS });
      return;
    }
    this.state = 'connecting';
    net.connect({
      name: CALLSIGNS[this.callsignSelection],
      build: this.buildNames[this.buildSelection]
    });
  }

  // The lobby is being left. The socket goes with it.
  exit() {
    this.game.network.disconnect();
    this.room = null;
    this.rooms = [];
    this.state = 'connecting';
  }

  // The room list: the entry that creates a room, then the rooms that
  // exist.
  roomEntries() {
    const entries = [{ kind: 'create', id: 'create' }];
    for (const room of this.rooms) {
      entries.push({ kind: 'room', id: room.id, room });
    }
    return entries;
  }

  update(input) {
    if (this.state === 'disconnected') {
      if (input.isKeyPressed(' ')) this.enter();
      if (input.isKeyPressed('escape')) return { action: 'back_to_menu' };
      return null;
    }

    if (this.state === 'connecting') {
      if (input.isKeyPressed('escape')) return { action: 'back_to_menu' };
      return null;
    }

    if (this.state === 'rooms') return this.updateRooms(input);
    return this.updateRoom(input);
  }

  updateRooms(input) {
    const entries = this.roomEntries();
    if (input.isKeyPressed('ArrowUp')) {
      this.selection = (this.selection - 1 + entries.length) % entries.length;
    }
    if (input.isKeyPressed('ArrowDown')) {
      this.selection = (this.selection + 1) % entries.length;
    }
    if (input.isKeyPressed(' ')) {
      const entry = entries[this.selection];
      if (entry.kind === 'create') {
        this.game.network.send({ t: C2S.CREATE_ROOM });
      } else {
        this.game.network.send({ t: C2S.JOIN_ROOM, roomId: entry.id });
      }
    }
    if (input.isKeyPressed('c')) {
      this.game.network.send({ t: C2S.CREATE_ROOM });
    }
    if (input.isKeyPressed('escape')) return { action: 'back_to_menu' };
    return null;
  }

  updateRoom(input) {
    if (input.isKeyPressed('ArrowUp')) {
      this.callsignSelection = (this.callsignSelection - 1 + CALLSIGNS.length) % CALLSIGNS.length;
      this.sendCallsign();
    }
    if (input.isKeyPressed('ArrowDown')) {
      this.callsignSelection = (this.callsignSelection + 1) % CALLSIGNS.length;
      this.sendCallsign();
    }
    if (input.isKeyPressed('ArrowLeft')) {
      this.buildSelection = (this.buildSelection - 1 + this.buildNames.length) % this.buildNames.length;
      this.sendBuild();
    }
    if (input.isKeyPressed('ArrowRight')) {
      this.buildSelection = (this.buildSelection + 1) % this.buildNames.length;
      this.sendBuild();
    }
    if (input.isKeyPressed('Enter')) {
      this.game.network.send({ t: C2S.START });
    }
    if (input.isKeyPressed('escape')) {
      this.game.network.send({ t: C2S.LEAVE_ROOM });
      this.room = null;
      this.state = 'rooms';
      this.game.network.send({ t: C2S.ROOMS });
    }
    return null;
  }

  sendBuild() {
    this.game.network.send({ t: C2S.SET_BUILD, build: this.buildNames[this.buildSelection] });
  }

  sendCallsign() {
    this.game.network.send({ t: C2S.SET_NAME, name: CALLSIGNS[this.callsignSelection] });
  }

  render(ctx, width, height) {
    // NOTE: the background (starfield) and the ambient particles are drawn by
    // the game loop before the scene is rendered. Filling the canvas here
    // would paint over both of them.

    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ONLINE MULTIPLAYER', width / 2, 90);

    if (this.error) {
      ctx.fillStyle = '#f44';
      ctx.font = '16px monospace';
      ctx.fillText(this.error, width / 2, 130);
    } else if (this.status) {
      ctx.fillStyle = '#888';
      ctx.font = '14px monospace';
      ctx.fillText(this.status, width / 2, 130);
    }

    if (this.state === 'connecting') {
      this.renderConnecting(ctx, width, height);
    } else if (this.state === 'disconnected') {
      this.renderDisconnected(ctx, width, height);
    } else if (this.state === 'rooms') {
      this.renderRooms(ctx, width, height);
    } else {
      this.renderRoom(ctx, width, height);
    }
  }

  renderConnecting(ctx, width, height) {
    ctx.fillStyle = '#ff0';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CONNECTING...', width / 2, height / 2);
    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText('[ESC] Back to the menu', width / 2, height - 40);
  }

  renderDisconnected(ctx, width, height) {
    ctx.fillStyle = '#f44';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DISCONNECTED', width / 2, height / 2);
    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText('[SPACE] Try again  [ESC] Back to the menu', width / 2, height / 2 + 40);
  }

  renderRooms(ctx, width, height) {
    const entries = this.roomEntries();
    const startY = height / 2 - 120;

    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ROOMS', width / 2, startY - 40);

    entries.forEach((entry, i) => {
      const y = startY + i * 45;
      const selected = i === this.selection;

      if (selected) {
        ctx.fillStyle = '#0f0';
        ctx.fillRect(width / 2 - 250, y - 24, 500, 38);
        ctx.fillStyle = '#000';
      } else {
        ctx.fillStyle = '#222';
        ctx.fillRect(width / 2 - 250, y - 24, 500, 38);
      }
      ctx.strokeStyle = selected ? '#fff' : '#444';
      ctx.lineWidth = 2;
      ctx.strokeRect(width / 2 - 250, y - 24, 500, 38);

      ctx.font = selected ? 'bold 16px monospace' : '16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(entry.kind === 'create' ? 'CREATE A NEW ROOM' : entry.id, width / 2 - 240, y);

      if (entry.kind === 'room') {
        ctx.textAlign = 'right';
        ctx.fillText(
          `${entry.room.players}/${entry.room.maxPlayers || MAX_PLAYERS}${entry.room.running ? '  IN PLAY' : ''}`,
          width / 2 + 240, y
        );
      }
    });

    if (entries.length === 1) {
      ctx.fillStyle = '#888';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No rooms yet. Create one and wait for the others.', width / 2, startY + 80);
    }

    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[UP/DOWN] Choose  [SPACE] Join  [C] Create  [ESC] Back', width / 2, height - 40);
  }

  renderRoom(ctx, width, height) {
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.room ? this.room.id.toUpperCase() : 'ROOM', width / 2, 160);

    // The roster
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('PILOTS', 120, 210);

    const players = (this.room && this.room.players) || [];
    players.forEach((p, i) => {
      const y = 240 + i * 28;
      const build = BUILDS[p.build];
      ctx.fillStyle = build ? build.color : '#888';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(p.name, 120, y);
      ctx.fillStyle = '#888';
      ctx.font = '13px monospace';
      ctx.fillText(build ? build.name : p.build, 280, y);
    });

    // The two pickers
    const pickerX = width / 2 + 60;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('YOUR CALLSIGN', pickerX, 210);
    ctx.fillText('YOUR BUILD', pickerX, 330);

    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(CALLSIGNS[this.callsignSelection], pickerX, 245);

    const build = BUILDS[this.buildNames[this.buildSelection]];
    ctx.fillStyle = build ? build.color : '#0f0';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(build ? build.name : '-', pickerX, 365);
    ctx.fillStyle = '#888';
    ctx.font = '13px monospace';
    ctx.fillText(build ? build.description : '', pickerX, 390);

    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText(
      `[UP/DOWN] Callsign  [LEFT/RIGHT] Build  [ENTER] Start the run  [ESC] Leave`,
      width / 2, height - 40
    );
  }
}

export { LobbyScene, CALLSIGNS };
