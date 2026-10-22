// A WebSocket server, hand written.
//
// The project has no dependencies and no build step, so the multiplayer
// server cannot pull in a library. This is the part of RFC 6455 the game
// actually needs: the opening handshake, unfragmented and fragmented text
// frames, ping, pong and close. Binary frames are read but not used - the
// game speaks JSON.
//
// The frames the server sends are never masked; the ones it receives
// always are, and the mask is undone as they are parsed.

import { createHash } from 'node:crypto';

// The magic string from the RFC. The accept key is the SHA-1 of the
// client's key plus this, in base64.
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const OPCODE = {
  CONTINUATION: 0x0,
  TEXT: 0x1,
  BINARY: 0x2,
  CLOSE: 0x8,
  PING: 0x9,
  PONG: 0xa
};

// The largest message the server will read. A player sends a handful of
// numbers a frame; anything bigger is a mistake or an attack.
const MAX_MESSAGE_BYTES = 64 * 1024;

class WebSocketConnection {
  constructor(socket) {
    this.socket = socket;
    this.buffer = Buffer.alloc(0);
    this.fragmentBuffer = null;
    this.fragmentOpcode = null;
    this.closed = false;

    // message handlers and close handlers
    this.onMessage = null;
    this.onClose = null;

    socket.on('data', (chunk) => this.handleData(chunk));
    socket.on('close', () => this.finish());
    socket.on('error', () => this.finish());
  }

  handleData(chunk) {
    if (this.closed) return;
    this.buffer = this.buffer.length ? Buffer.concat([this.buffer, chunk]) : chunk;
    // A chunk can hold half a frame or several frames. Keep going until the
    // buffer runs out of whole frames.
    while (!this.closed && this.readFrame()) { /* keep reading */ }
  }

  // Read one frame off the front of the buffer. Returns false when there
  // is not enough of a frame there yet.
  readFrame() {
    const buf = this.buffer;
    if (buf.length < 2) return false;

    const fin = (buf[0] & 0x80) !== 0;
    const opcode = buf[0] & 0x0f;
    const masked = (buf[1] & 0x80) !== 0;
    let length = buf[1] & 0x7f;
    let offset = 2;

    if (length === 126) {
      if (buf.length < offset + 2) return false;
      length = buf.readUInt16BE(offset);
      offset += 2;
    } else if (length === 127) {
      if (buf.length < offset + 8) return false;
      length = Number(buf.readBigUInt64BE(offset));
      offset += 8;
    }

    let maskKey = null;
    if (masked) {
      if (buf.length < offset + 4) return false;
      maskKey = buf.subarray(offset, offset + 4);
      offset += 4;
    }

    if (length > MAX_MESSAGE_BYTES) {
      this.close(1009, 'message too big');
      return false;
    }
    if (buf.length < offset + length) return false;

    const payload = Buffer.from(buf.subarray(offset, offset + length));
    if (maskKey) {
      for (let i = 0; i < payload.length; i++) payload[i] ^= maskKey[i % 4];
    }
    this.buffer = buf.subarray(offset + length);

    this.handleFrame(fin, opcode, payload);
    return true;
  }

  handleFrame(fin, opcode, payload) {
    switch (opcode) {
      case OPCODE.PING:
        this.sendFrame(OPCODE.PONG, payload);
        return;
      case OPCODE.PONG:
        return;
      case OPCODE.CLOSE:
        this.close();
        return;
      case OPCODE.CONTINUATION:
        if (!this.fragmentBuffer) return;
        this.fragmentBuffer = Buffer.concat([this.fragmentBuffer, payload]);
        if (fin) {
          this.deliver(this.fragmentBuffer, this.fragmentOpcode);
          this.fragmentBuffer = null;
          this.fragmentOpcode = null;
        }
        return;
      default:
        if (!fin) {
          // The first frame of a fragmented message
          this.fragmentOpcode = opcode;
          this.fragmentBuffer = payload;
          return;
        }
        this.deliver(payload, opcode);
    }
  }

  deliver(payload, opcode) {
    if (opcode !== OPCODE.TEXT) return;
    if (!this.onMessage) return;
    let message = null;
    try {
      message = JSON.parse(payload.toString('utf8'));
    } catch {
      return; // a message that is not JSON is not one of ours
    }
    this.onMessage(message);
  }

  sendFrame(opcode, payload) {
    if (this.closed) return;
    const length = payload.length;
    let header;
    if (length < 126) {
      header = Buffer.alloc(2);
      header[1] = length;
    } else if (length < 65536) {
      header = Buffer.alloc(4);
      header[1] = 126;
      header.writeUInt16BE(length, 2);
    } else {
      header = Buffer.alloc(10);
      header[1] = 127;
      header.writeBigUInt64BE(BigInt(length), 2);
    }
    header[0] = 0x80 | opcode;
    try {
      this.socket.write(Buffer.concat([header, payload]));
    } catch {
      this.finish();
    }
  }

  send(data) {
    this.sendFrame(OPCODE.TEXT, Buffer.from(JSON.stringify(data), 'utf8'));
  }

  close(code = 1000, reason = '') {
    if (this.closed) return;
    const reasonBytes = Buffer.from(reason, 'utf8');
    const payload = Buffer.alloc(2 + reasonBytes.length);
    payload.writeUInt16BE(code, 0);
    reasonBytes.copy(payload, 2);
    this.sendFrame(OPCODE.CLOSE, payload);
    this.finish();
  }

  finish() {
    if (this.closed) return;
    this.closed = true;
    try {
      this.socket.end();
    } catch {
      // already gone
    }
    if (this.onClose) this.onClose();
  }
}

// Take an HTTP upgrade request and turn it into a WebSocket connection.
// Returns the connection, or null if the request was not a valid
// WebSocket handshake.
function accept(request, socket, head) {
  const key = request.headers['sec-websocket-key'];
  const upgrade = String(request.headers.upgrade || '').toLowerCase();
  if (!key || upgrade !== 'websocket') {
    socket.write('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
    socket.destroy();
    return null;
  }

  const acceptKey = createHash('sha1').update(key + GUID).digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${acceptKey}\r\n\r\n`
  );
  // The game sends a small message every frame; Nagle would hold them
  // back waiting for more.
  socket.setNoDelay(true);

  const connection = new WebSocketConnection(socket);
  if (head && head.length) connection.handleData(head);
  return connection;
}

export { accept, WebSocketConnection, OPCODE };
