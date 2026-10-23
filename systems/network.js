// The network client
//
// It is the other half of the multiplayer server: a WebSocket, the message
// types from shared/protocol.js, and a set of handlers the game and the
// lobby attach themselves to.
//
// The client never simulates the world. It sends its input and it is told
// what happened, which is what keeps every player in a room looking at the
// same fight.

import { C2S, S2C } from '../shared/protocol.js';

// Where the server is. The page is served by the same server in the normal
// case, so the game's own address is the address of the socket too.
function defaultUrl() {
  if (typeof location === 'undefined') return 'ws://localhost:8080/';
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${location.host}/`;
}

class NetworkClient {
  constructor(url) {
    this.url = url || defaultUrl();
    this.socket = null;
    // 'closed' | 'connecting' | 'open'
    this.state = 'closed';
    this.playerId = null;
    this.playerName = null;
    this.lastError = null;

    // message type -> the handlers for it
    this.handlers = new Map();
    this.onDisconnect = null;
  }

  // Open the socket and say hello. The server answers with a welcome that
  // carries the player id everything else is keyed by.
  connect({ name = 'PILOT', build = 'fighter' } = {}) {
    if (this.state === 'connecting' || this.state === 'open') return;
    this.state = 'connecting';
    this.lastError = null;

    let socket;
    try {
      socket = new WebSocket(this.url);
    } catch (e) {
      this.state = 'closed';
      this.lastError = 'Could not reach the server.';
      this.emit(S2C.ERROR, { message: this.lastError });
      return;
    }
    this.socket = socket;

    socket.addEventListener('open', () => {
      this.state = 'open';
      this.send({ t: C2S.HELLO, name, build });
    });

    socket.addEventListener('message', (event) => {
      let message = null;
      try {
        message = JSON.parse(event.data);
      } catch {
        return; // a message that is not JSON is not one of ours
      }
      if (!message || typeof message.t !== 'string') return;
      if (message.t === S2C.WELCOME) {
        this.playerId = message.playerId;
        this.playerName = message.name;
      }
      this.emit(message.t, message);
    });

    socket.addEventListener('close', () => {
      this.state = 'closed';
      this.socket = null;
      if (this.onDisconnect) this.onDisconnect();
    });

    socket.addEventListener('error', () => {
      // The close event always follows an error, and that is where the
      // state is settled - doing it here as well would report the drop
      // twice.
    });
  }

  // Close the socket. The server takes the player out of its room.
  disconnect() {
    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // already gone
      }
    }
    this.socket = null;
    this.state = 'closed';
  }

  send(message) {
    if (!this.socket || this.state !== 'open') return false;
    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch {
      return false;
    }
  }

  // The input for this frame. It is the same shape the AI produces and the
  // same shape the server expects.
  sendInput(input) {
    return this.send({
      t: C2S.INPUT,
      dx: input.dx || 0,
      dy: input.dy || 0,
      shoot: !!input.shoot,
      ability1: !!input.ability1,
      ability2: !!input.ability2,
      aim: input.aim === undefined ? null : input.aim
    });
  }

  // Listen for a kind of message. Several listeners can share a type.
  on(type, handler) {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type).push(handler);
  }

  emit(type, message) {
    const list = this.handlers.get(type);
    if (!list) return;
    for (const handler of list) {
      try {
        handler(message);
      } catch (e) {
        console.error('Network handler failed:', e);
      }
    }
  }
}

export { NetworkClient, defaultUrl };
