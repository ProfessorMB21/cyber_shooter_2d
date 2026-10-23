// Lobby Scene - the online multiplayer lobby
//
// It is the room list, the room itself, and the two pickers a player fills
// in before a run: the callsign and the build. The run itself is started
// by the server - the lobby asks, and the server answers with a start
// message, which the game turns into a networked run.

import { BUILDS } from '../entities/player.js';
import { C2S, S2C, MAX_PLAYERS } from '../shared/protocol.js';
import { ScreenItems, readMouse, drawButton } from './ui.js';

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

    // The clickable parts of the screen, and the one the pointer is on
    this.items = new ScreenItems();
    this.hoveredId = null;

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

  // Where the room list is. The drawing and the mouse both work from it.
  layoutRooms(width, height) {
    this.items.reset();
    const entries = this.roomEntries();
    const startY = height / 2 - 120;

    const rows = entries.map((entry, i) => {
      const y = startY + i * 45;
      this.items.add('room', width / 2 - 250, y - 24, 500, 38, { index: i, kind: 'room' });
      return { entry, y };
    });

    const buttons = this.items.buttonRow(['back'], height - 70, width);
    return { entries, startY, rows, buttons };
  }

  // Where the pickers and the buttons are in a room.
  layoutRoom(width, height) {
    this.items.reset();
    const pickerX = width / 2 + 60;

    // An arrow on each side of the two pickers
    const arrows = {
      callsign_prev: { x: pickerX - 115, y: 222, w: 34, h: 34 },
      callsign_next: { x: pickerX + 81, y: 222, w: 34, h: 34 },
      build_prev: { x: pickerX - 115, y: 342, w: 34, h: 34 },
      build_next: { x: pickerX + 81, y: 342, w: 34, h: 34 }
    };
    for (const [id, rect] of Object.entries(arrows)) {
      this.items.add(id, rect.x, rect.y, rect.w, rect.h, { kind: 'arrow' });
    }

    const buttons = this.items.buttonRow(['start', 'leave'], height - 70, width);
    return { pickerX, arrows, buttons };
  }

  // The connecting and the disconnected screen. The only thing to click
  // on the disconnected one is the way back in.
  layoutConnecting(width, height, withRetry) {
    this.items.reset();
    const ids = withRetry ? ['retry', 'back'] : ['back'];
    const buttons = this.items.buttonRow(ids, height / 2 + 40, width);
    return { buttons };
  }

  update(input) {
    if (this.state === 'disconnected') {
      this.layoutConnecting(this.game.width, this.game.height, true);
      const mouse = readMouse(this.items, input);
      this.hoveredId = mouse.hovered ? mouse.hovered.id : null;
      if (mouse.clicked) {
        if (mouse.clicked.id === 'retry') this.enter();
        if (mouse.clicked.id === 'back') return { action: 'back_to_menu' };
      }
      if (input.isKeyPressed(' ')) this.enter();
      if (input.isKeyPressed('escape')) return { action: 'back_to_menu' };
      return null;
    }

    if (this.state === 'connecting') {
      this.layoutConnecting(this.game.width, this.game.height, false);
      const mouse = readMouse(this.items, input);
      this.hoveredId = mouse.hovered ? mouse.hovered.id : null;
      if (mouse.clicked && mouse.clicked.id === 'back') {
        return { action: 'back_to_menu' };
      }
      if (input.isKeyPressed('escape')) return { action: 'back_to_menu' };
      return null;
    }

    if (this.state === 'rooms') return this.updateRooms(input);
    return this.updateRoom(input);
  }

  updateRooms(input) {
    const layout = this.layoutRooms(this.game.width, this.game.height);
    const entries = layout.entries;

    if (input.isKeyPressed('ArrowUp')) {
      this.selection = (this.selection - 1 + entries.length) % entries.length;
    }
    if (input.isKeyPressed('ArrowDown')) {
      this.selection = (this.selection + 1) % entries.length;
    }

    const mouse = readMouse(this.items, input);
    this.hoveredId = mouse.hovered ? mouse.hovered.id : null;
    if (mouse.hovered && mouse.moved && mouse.hovered.kind === 'room') {
      this.selection = mouse.hovered.index;
    }
    if (mouse.clicked) {
      const clicked = mouse.clicked;
      if (clicked.kind === 'room') {
        this.selection = clicked.index;
        this.joinEntry(entries[this.selection]);
      } else if (clicked.id === 'back') {
        return { action: 'back_to_menu' };
      }
    }

    if (input.isKeyPressed(' ')) {
      this.joinEntry(entries[this.selection]);
    }
    if (input.isKeyPressed('c')) {
      this.game.network.send({ t: C2S.CREATE_ROOM });
    }
    if (input.isKeyPressed('escape')) return { action: 'back_to_menu' };
    return null;
  }

  // Create a room, or join one that is already there.
  joinEntry(entry) {
    if (entry.kind === 'create') {
      this.game.network.send({ t: C2S.CREATE_ROOM });
    } else {
      this.game.network.send({ t: C2S.JOIN_ROOM, roomId: entry.id });
    }
  }

  updateRoom(input) {
    this.layoutRoom(this.game.width, this.game.height);

    if (input.isKeyPressed('ArrowUp')) {
      this.cycleCallsign(-1);
    }
    if (input.isKeyPressed('ArrowDown')) {
      this.cycleCallsign(1);
    }
    if (input.isKeyPressed('ArrowLeft')) {
      this.cycleBuild(-1);
    }
    if (input.isKeyPressed('ArrowRight')) {
      this.cycleBuild(1);
    }

    const mouse = readMouse(this.items, input);
    this.hoveredId = mouse.hovered ? mouse.hovered.id : null;
    if (mouse.clicked) {
      const id = mouse.clicked.id;
      if (id === 'callsign_prev') this.cycleCallsign(-1);
      else if (id === 'callsign_next') this.cycleCallsign(1);
      else if (id === 'build_prev') this.cycleBuild(-1);
      else if (id === 'build_next') this.cycleBuild(1);
      else if (id === 'start') this.game.network.send({ t: C2S.START });
      else if (id === 'leave') {
        this.leaveRoom();
        return null;
      }
    }

    if (input.isKeyPressed('Enter')) {
      this.game.network.send({ t: C2S.START });
    }
    if (input.isKeyPressed('escape')) {
      this.leaveRoom();
    }
    return null;
  }

  // Leave the room and go back to the list of rooms.
  leaveRoom() {
    this.game.network.send({ t: C2S.LEAVE_ROOM });
    this.room = null;
    this.state = 'rooms';
    this.game.network.send({ t: C2S.ROOMS });
  }

  cycleCallsign(step) {
    this.callsignSelection = (this.callsignSelection + step + CALLSIGNS.length) % CALLSIGNS.length;
    this.sendCallsign();
  }

  cycleBuild(step) {
    this.buildSelection = (this.buildSelection + step + this.buildNames.length) % this.buildNames.length;
    this.sendBuild();
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
    ctx.fillText('[ESC] Back to the menu', width / 2, height - 110);

    const layout = this.layoutConnecting(width, height, false);
    drawButton(ctx, { ...layout.buttons.back, label: 'BACK (ESC)', hovered: this.hoveredId === 'back' });
  }

  renderDisconnected(ctx, width, height) {
    ctx.fillStyle = '#f44';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DISCONNECTED', width / 2, height / 2);
    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText('[SPACE] Try again  [ESC] Back to the menu', width / 2, height / 2 - 30);

    const layout = this.layoutConnecting(width, height, true);
    drawButton(ctx, { ...layout.buttons.retry, label: 'TRY AGAIN (SPACE)', hovered: this.hoveredId === 'retry' });
    drawButton(ctx, { ...layout.buttons.back, label: 'BACK (ESC)', hovered: this.hoveredId === 'back' });
  }

  renderRooms(ctx, width, height) {
    const layout = this.layoutRooms(width, height);
    const { entries, startY, rows, buttons } = layout;

    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ROOMS', width / 2, startY - 40);

    rows.forEach(({ entry, y }, i) => {
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
    ctx.fillText('[UP/DOWN] Choose  [SPACE] Join  [C] Create  [ESC] Back', width / 2, height - 105);

    drawButton(ctx, { ...buttons.back, label: 'BACK (ESC)', hovered: this.hoveredId === 'back' });
  }

  renderRoom(ctx, width, height) {
    const layout = this.layoutRoom(width, height);
    const { pickerX, arrows, buttons } = layout;

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

    // The arrows on either side of the pickers
    this.drawArrow(ctx, 'callsign_prev', arrows.callsign_prev, '◀');
    this.drawArrow(ctx, 'callsign_next', arrows.callsign_next, '▶');
    this.drawArrow(ctx, 'build_prev', arrows.build_prev, '◀');
    this.drawArrow(ctx, 'build_next', arrows.build_next, '▶');

    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText(
      `[UP/DOWN] Callsign  [LEFT/RIGHT] Build  [ENTER] Start the run  [ESC] Leave`,
      width / 2, height - 105
    );

    drawButton(ctx, { ...buttons.start, label: 'START THE RUN (ENTER)', hovered: this.hoveredId === 'start' });
    drawButton(ctx, { ...buttons.leave, label: 'LEAVE (ESC)', hovered: this.hoveredId === 'leave' });
  }

  // An arrow on either side of a picker.
  drawArrow(ctx, id, rect, label) {
    const { x, y, w, h } = rect;
    const hovered = this.hoveredId === id;
    ctx.fillStyle = hovered ? '#0f0' : 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = hovered ? '#000' : '#0f0';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h - 10);
  }
}

export { LobbyScene, CALLSIGNS };
