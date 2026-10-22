// The wire protocol
//
// Every message between the client and the server is a JSON object with a
// `t` field naming its type. This file is shared by both sides - the
// browser imports it through a relative path, the server imports it as an
// ES module - so the two can never disagree about what a message means.

// Client to server
const C2S = {
  HELLO: 'hello',             // { name, build }
  ROOMS: 'rooms',             // {} - ask for the room list
  CREATE_ROOM: 'create_room', // {}
  JOIN_ROOM: 'join_room',     // { roomId }
  LEAVE_ROOM: 'leave_room',   // {}
  SET_BUILD: 'set_build',     // { build }
  START: 'start',             // {}
  INPUT: 'input',             // { dx, dy, shoot, ability1, ability2, aim }
  PING: 'ping'                // { time }
};

// Server to client
const S2C = {
  WELCOME: 'welcome',             // { playerId, name }
  ROOMS: 'rooms',                 // { rooms: [...] }
  ROOM: 'room',                   // { room }
  ERROR: 'error',                 // { message }
  START: 'start',                 // { room, world }
  SNAPSHOT: 'snapshot',           // { tick, world }
  PLAYER_JOINED: 'player_joined', // { player }
  PLAYER_LEFT: 'player_left',     // { playerId }
  PONG: 'pong'                    // { time }
};

// How often the server advances the world, and how often it tells the
// clients about it. The world runs at the game's own rate; the snapshots
// go out more slowly, because nobody can see the difference and the
// bandwidth is real.
const TICK_RATE = 60;
const SNAPSHOT_RATE = 20;

// The most players a room holds.
const MAX_PLAYERS = 5;

// How long a client's input stays valid without a refresh, in seconds. A
// client that stalls stops moving rather than running on forever.
const INPUT_TIMEOUT = 0.5;

// The world size the server simulates. The clients draw it at whatever
// size their window is.
const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 720;

export { C2S, S2C, TICK_RATE, SNAPSHOT_RATE, MAX_PLAYERS, INPUT_TIMEOUT, WORLD_WIDTH, WORLD_HEIGHT };
