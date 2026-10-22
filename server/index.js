// The multiplayer server
//
// It serves the game over HTTP and runs the worlds over a WebSocket on the
// same port. The world is simulated here and nowhere else: the clients
// send their input and are told what happened, so every player sees the
// same fight.
//
//   npm start
//   then open http://localhost:8080
//
// There are no dependencies. The WebSocket is the one in server/websocket.js,
// and the rooms are in server/rooms.js.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { accept } from './websocket.js';
import { RoomManager, TICK_RATE, SNAPSHOT_RATE } from './rooms.js';
import { C2S, S2C, MAX_PLAYERS } from '../shared/protocol.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

const rooms = new RoomManager();

// ------------------------------------------------------------------ static
async function serveStatic(request, response) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain' });
    response.end('bad request');
    return;
  }
  if (pathname === '/') pathname = '/index.html';

  // The path has to stay inside the project directory. The check after the
  // join is the one that matters - normalize alone does not stop a
  // traversal.
  const filePath = join(ROOT, normalize(pathname));
  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403, { 'Content-Type': 'text/plain' });
    response.end('forbidden');
    return;
  }

  try {
    const data = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    response.end(data);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('not found');
  }
}

// ----------------------------------------------------------------- session
let nextPlayerId = 1;

class Session {
  constructor(connection) {
    this.connection = connection;
    this.id = 'p' + (nextPlayerId++);
    this.name = 'PILOT';
    this.build = 'fighter';
    this.room = null;
  }

  send(message) {
    this.connection.send(message);
  }
}

// Tell everybody in a room about it.
function broadcastRoom(room, exceptSession = null) {
  if (!room) return;
  const description = room.describe();
  for (const member of room.members.values()) {
    if (member.connection === exceptSession) continue;
    member.connection.send({ t: S2C.ROOM, room: description });
  }
}

// Tell the clients who are in the room.
function broadcastRoster(room) {
  if (!room) return;
  const description = room.describe();
  for (const member of room.members.values()) {
    member.connection.send({ t: S2C.ROOM, room: description });
  }
}

function broadcastRooms() {
  const list = rooms.list();
  for (const session of sessions.values()) {
    if (session.room) continue; // the ones in a room get the room, not the list
    session.send({ t: S2C.ROOMS, rooms: list });
  }
}

const sessions = new Map();

function leaveRoom(session) {
  const room = session.room;
  if (!room) return;
  session.room = null;
  room.removeMember(session.id);
  for (const member of room.members.values()) {
    member.connection.send({ t: S2C.PLAYER_LEFT, playerId: session.id });
  }
  broadcastRoster(room);
  if (room.playerCount === 0) {
    rooms.removeRoom(room.id);
  } else {
    broadcastRooms();
  }
}

function joinRoom(session, room) {
  if (session.room) leaveRoom(session);
  if (room.isFull) {
    session.send({ t: S2C.ERROR, message: 'That room is full.' });
    return false;
  }
  room.addMember(session.id, session.name, session.build, session.connection);
  session.room = room;
  for (const member of room.members.values()) {
    member.connection.send({
      t: S2C.PLAYER_JOINED,
      player: { id: session.id, name: session.name, build: session.build }
    });
  }
  broadcastRoster(room);
  broadcastRooms();
  return true;
}

function handleMessage(session, message) {
  if (!message || typeof message.t !== 'string') return;

  switch (message.t) {
    case C2S.HELLO:
      if (typeof message.name === 'string' && message.name.trim()) {
        session.name = message.name.trim().slice(0, 16).toUpperCase();
      }
      if (typeof message.build === 'string') session.build = message.build;
      session.send({ t: S2C.WELCOME, playerId: session.id, name: session.name });
      session.send({ t: S2C.ROOMS, rooms: rooms.list() });
      break;

    case C2S.ROOMS:
      session.send({ t: S2C.ROOMS, rooms: rooms.list() });
      break;

    case C2S.CREATE_ROOM: {
      const room = rooms.createRoom();
      joinRoom(session, room);
      break;
    }

    case C2S.JOIN_ROOM: {
      const room = rooms.getRoom(message.roomId);
      if (!room) {
        session.send({ t: S2C.ERROR, message: 'That room is gone.' });
        session.send({ t: S2C.ROOMS, rooms: rooms.list() });
        break;
      }
      joinRoom(session, room);
      break;
    }

    case C2S.LEAVE_ROOM:
      leaveRoom(session);
      session.send({ t: S2C.ROOMS, rooms: rooms.list() });
      break;

    case C2S.SET_BUILD:
      if (typeof message.build === 'string') {
        session.build = message.build;
        if (session.room) {
          session.room.setBuild(session.id, session.build);
          broadcastRoster(session.room);
        }
      }
      break;

    case C2S.START: {
      const room = session.room;
      if (!room) {
        session.send({ t: S2C.ERROR, message: 'You are not in a room.' });
        break;
      }
      if (room.running) {
        session.send({ t: S2C.ERROR, message: 'That run has already started.' });
        break;
      }
      if (!room.start()) break;
      for (const member of room.members.values()) {
        member.connection.send({ t: S2C.START, room: room.describe() });
      }
      break;
    }

    case C2S.INPUT:
      if (session.room) session.room.setInput(session.id, message);
      break;

    case C2S.PING:
      session.send({ t: S2C.PONG, time: message.time });
      break;
  }
}

function handleConnection(connection) {
  const session = new Session(connection);
  sessions.set(session, session);

  connection.onMessage = (message) => {
    try {
      handleMessage(session, message);
    } catch (e) {
      console.error('[server] message failed:', e.message);
      session.send({ t: S2C.ERROR, message: 'The server had a problem with that.' });
    }
  };

  connection.onClose = () => {
    leaveRoom(session);
    sessions.delete(session);
  };
}

// ------------------------------------------------------------------- world
// One timer drives every room. The world runs at the game's own rate; the
// snapshots go out more slowly, because nobody can see the difference.
const TICKS_PER_SNAPSHOT = Math.max(1, Math.round(TICK_RATE / SNAPSHOT_RATE));
let lastTime = Date.now();

setInterval(() => {
  const now = Date.now();
  let deltaTime = (now - lastTime) / 1000;
  lastTime = now;
  // A long pause must not teleport everything across the screen.
  if (deltaTime > 0.1) deltaTime = 0.1;
  if (deltaTime <= 0) return;

  for (const room of rooms.rooms.values()) {
    if (!room.running) continue;
    const finished = room.update(deltaTime);

    if (room.tick % TICKS_PER_SNAPSHOT === 0 || finished) {
      const world = room.snapshot();
      if (world) {
        for (const member of room.members.values()) {
          member.connection.send({ t: S2C.SNAPSHOT, tick: room.tick, world });
        }
      }
    }

    if (finished) {
      // The run is over. The room goes back to being a lobby.
      room.reset();
      broadcastRoster(room);
    }
  }
}, 1000 / TICK_RATE);

// ------------------------------------------------------------------ listen
const server = createServer(serveStatic);

server.on('upgrade', (request, socket, head) => {
  const connection = accept(request, socket, head);
  if (connection) handleConnection(connection);
});

server.listen(PORT, HOST, () => {
  console.log(`[server] Cyber Shooter on http://localhost:${PORT}`);
  console.log(`[server] rooms hold up to ${MAX_PLAYERS} players`);
});
