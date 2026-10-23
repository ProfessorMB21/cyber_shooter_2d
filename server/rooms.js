// The rooms
//
// A room is a lobby and a world. Players join a room, pick a build, and
// when somebody starts the run the room creates a Simulation, adds every
// player to it, and ticks it. The room is the authority: the clients send
// their input and are told what happened.

import { Simulation, EMPTY_INPUT } from '../core/simulation.js';
import { BUILDS } from '../entities/player.js';
import {
  TICK_RATE, SNAPSHOT_RATE, MAX_PLAYERS, INPUT_TIMEOUT, WORLD_WIDTH, WORLD_HEIGHT
} from '../shared/protocol.js';

// A build that does not exist would throw when the world is built, and the
// throw would take the whole room with it. A client cannot be trusted with
// this one, so the name is checked here.
function safeBuild(build) {
  return BUILDS[build] ? build : 'fighter';
}

class Room {
  constructor(id) {
    this.id = id;
    this.createdAt = Date.now();

    // playerId -> { id, name, build, connection, input, inputTime }
    this.members = new Map();

    this.running = false;
    this.simulation = null;
    this.tick = 0;
    this.over = false;

    // A stable id for every entity the clients have to tell apart. The
    // map is weak, so an entity that dies is forgotten on its own.
    this.entityIds = new WeakMap();
    this.nextEntityId = 1;
  }

  get playerCount() { return this.members.size; }
  get isFull() { return this.members.size >= MAX_PLAYERS; }

  addMember(playerId, name, build, connection) {
    const member = {
      id: playerId,
      name: name,
      build: safeBuild(build),
      connection: connection,
      input: EMPTY_INPUT,
      inputTime: 0,
      // The ability presses that have not been used by a tick yet. A press
      // is a single frame on the wire, and the tick that reads it may not
      // happen between the frame that sent it and the next one - so it is
      // latched here and consumed by the next tick. The ability's own
      // cooldown stops it firing twice.
      pending: { ability1: false, ability2: false }
    };
    this.members.set(playerId, member);
    return member;
  }

  removeMember(playerId) {
    const member = this.members.get(playerId);
    if (!member) return null;
    this.members.delete(playerId);
    if (this.simulation) this.simulation.removePlayer(playerId);
    return member;
  }

  setBuild(playerId, build) {
    const member = this.members.get(playerId);
    if (!member) return false;
    member.build = safeBuild(build);
    return true;
  }

  setName(playerId, name) {
    const member = this.members.get(playerId);
    if (!member) return false;
    member.name = name;
    return true;
  }

  setInput(playerId, input) {
    const member = this.members.get(playerId);
    if (!member) return;
    member.input = {
      dx: Number(input.dx) || 0,
      dy: Number(input.dy) || 0,
      shoot: !!input.shoot,
      ability1: false,
      ability2: false,
      aim: input.aim === null || input.aim === undefined ? null : Number(input.aim)
    };
    // The ability presses are latched rather than passed straight through.
    // The client holds them down for a single frame, and the tick that
    // reads them may not fall between that frame and the next one.
    if (input.ability1) member.pending.ability1 = true;
    if (input.ability2) member.pending.ability2 = true;
    member.inputTime = Date.now();
  }

  // Put everybody in the world and start the run.
  start() {
    if (this.running || this.members.size === 0) return false;

    this.simulation = new Simulation({
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      headless: true
    });
    this.simulation.difficulty = 'normal';
    this.simulation.mode = 'multiplayer';

    // Spread the players along the bottom of the world so they do not
    // start inside each other.
    const count = this.members.size;
    const spacing = WORLD_WIDTH / (count + 1);
    let index = 0;
    for (const member of this.members.values()) {
      this.simulation.addPlayer({
        playerId: member.id,
        buildName: member.build,
        x: spacing * (++index),
        y: WORLD_HEIGHT - 110,
        playerName: member.name
      });
    }

    this.running = true;
    this.over = false;
    this.tick = 0;
    return true;
  }

  // Back to the lobby. The world is thrown away.
  reset() {
    this.running = false;
    this.over = false;
    this.simulation = null;
    this.tick = 0;
    for (const member of this.members.values()) {
      member.input = EMPTY_INPUT;
      member.inputTime = 0;
    }
  }

  // Advance the world by one step.
  update(deltaTime) {
    if (!this.running || !this.simulation) return;

    const inputs = new Map();
    const now = Date.now();
    for (const member of this.members.values()) {
      // An input that has gone stale is no input. A client that stalls
      // stops moving rather than running on forever.
      const fresh = (now - member.inputTime) / 1000 < INPUT_TIMEOUT;
      const input = fresh ? { ...member.input } : { ...EMPTY_INPUT };
      // Hand the latched ability presses to the world and take them back,
      // so a press is used exactly once.
      input.ability1 = input.ability1 || member.pending.ability1;
      input.ability2 = input.ability2 || member.pending.ability2;
      member.pending.ability1 = false;
      member.pending.ability2 = false;
      inputs.set(member.id, input);
    }

    this.simulation.update(deltaTime, inputs);
    this.tick++;

    // The run ends when there is nobody left to play it.
    const alive = this.simulation.players.some(p => !p.dead);
    if (!alive) {
      this.over = true;
      return true;
    }
    return false;
  }

  // The id the clients use for an entity.
  idFor(entity) {
    let id = this.entityIds.get(entity);
    if (id === undefined) {
      id = this.nextEntityId++;
      this.entityIds.set(entity, id);
    }
    return id;
  }

  // The world as the clients need to see it.
  snapshot() {
    const sim = this.simulation;
    if (!sim) return null;

    const world = {
      tick: this.tick,
      time: sim.gameTime,
      gameTime: sim.gameTime,
      wave: sim.wave,
      score: sim.score,
      kills: sim.kills,
      combo: sim.combo,
      over: this.over,
      players: [],
      enemies: [],
      bosses: [],
      projectiles: [],
      pickups: []
    };

    for (const player of sim.players) {
      const center = player.getCenter();
      world.players.push({
        id: player.playerId,
        name: player.playerName,
        build: player.buildName,
        x: center.x,
        y: center.y,
        hp: player.hp,
        maxHp: player.currentStats.maxHp,
        damage: player.currentStats.damage,
        level: player.level,
        xp: player.xp,
        xpToNextLevel: player.xpToNextLevel,
        dead: player.dead,
        color: player.color,
        // The cooldowns go over as the seconds left on each one, not as
        // timestamps - the client's clock is not the server's.
        cooldowns: this.cooldownsLeft(player)
      });
    }

    for (const enemy of sim.enemies) {
      const center = enemy.getCenter();
      world.enemies.push({
        id: this.idFor(enemy),
        type: enemy.type,
        x: center.x,
        y: center.y,
        hp: enemy.hp,
        maxHp: enemy.maxHp
      });
    }

    for (const boss of sim.bosses) {
      const center = boss.getCenter();
      world.bosses.push({
        id: this.idFor(boss),
        type: boss.type || 'boss',
        // The level is what the client needs to build the same boss, since
        // the pattern and the stats both come from it.
        levelIndex: boss.levelIndex,
        x: center.x,
        y: center.y,
        hp: boss.hp,
        maxHp: boss.maxHp
      });
    }

    for (const projectile of sim.projectiles) {
      world.projectiles.push({
        id: this.idFor(projectile),
        x: projectile.x,
        y: projectile.y,
        vx: projectile.vx,
        vy: projectile.vy,
        color: projectile.color,
        isPlayer: projectile.isPlayer,
        size: projectile.size,
        aoe: projectile.aoe
      });
    }

    for (const pickup of sim.pickups) {
      const center = pickup.getCenter();
      world.pickups.push({
        id: this.idFor(pickup),
        type: pickup.type,
        x: center.x,
        y: center.y
      });
    }

    return world;
  }

  // The seconds left on each of a player's ability cooldowns.
  cooldownsLeft(player) {
    const now = Date.now();
    const left = {};
    for (const [key, timestamp] of Object.entries(player.cooldowns)) {
      const remaining = (timestamp - now) / 1000;
      if (remaining > 0) left[key] = remaining;
    }
    return left;
  }

  // The lobby view of the room.
  describe() {
    return {
      id: this.id,
      players: [...this.members.values()].map(m => ({
        id: m.id,
        name: m.name,
        build: m.build
      })),
      maxPlayers: MAX_PLAYERS,
      running: this.running
    };
  }
}

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.nextRoomId = 1;
  }

  createRoom() {
    const id = 'room-' + this.nextRoomId++;
    const room = new Room(id);
    this.rooms.set(id, room);
    return room;
  }

  getRoom(id) {
    return this.rooms.get(id);
  }

  removeRoom(id) {
    this.rooms.delete(id);
  }

  // A room with nobody in it is not a room.
  removeEmptyRooms() {
    for (const [id, room] of this.rooms) {
      if (room.members.size === 0) this.rooms.delete(id);
    }
  }

  // The list the lobby shows.
  list() {
    return [...this.rooms.values()].map(room => ({
      id: room.id,
      players: room.playerCount,
      maxPlayers: MAX_PLAYERS,
      running: room.running
    }));
  }
}

export { Room, RoomManager, TICK_RATE, SNAPSHOT_RATE, safeBuild };
