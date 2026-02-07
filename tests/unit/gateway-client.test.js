const assert = require('assert/strict');
const test = require('node:test');

const { GatewayClient } = require('../../gateway-client.js');

class FakeTimers {
  constructor() {
    this.now = 0;
    this.nextId = 1;
    this.tasks = new Map();
  }

  setTimeout(fn, ms) {
    const id = this.nextId++;
    this.tasks.set(id, { id, fn, time: this.now + Math.max(0, ms | 0), interval: false, every: 0 });
    return id;
  }

  clearTimeout(id) {
    this.tasks.delete(id);
  }

  setInterval(fn, ms) {
    const id = this.nextId++;
    const every = Math.max(1, ms | 0);
    this.tasks.set(id, { id, fn, time: this.now + every, interval: true, every });
    return id;
  }

  clearInterval(id) {
    this.tasks.delete(id);
  }

  tick(ms) {
    const target = this.now + Math.max(0, ms | 0);
    while (true) {
      let next = null;
      for (const task of this.tasks.values()) {
        if (task.time <= target && (!next || task.time < next.time)) {
          next = task;
        }
      }
      if (!next) break;
      this.now = next.time;
      if (!this.tasks.has(next.id)) continue;
      try {
        next.fn();
      } catch (err) {
        throw err;
      }
      if (next.interval) {
        next.time = this.now + next.every;
        this.tasks.set(next.id, next);
      } else {
        this.tasks.delete(next.id);
      }
    }
    this.now = target;
  }
}

class FakeWebSocket {
  static instances = [];
  static OPEN = 1;

  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.sent = [];
    this.listeners = new Map();
    FakeWebSocket.instances.push(this);
  }

  addEventListener(type, cb) {
    const list = this.listeners.get(type) || [];
    list.push(cb);
    this.listeners.set(type, list);
  }

  send(data) {
    this.sent.push(String(data));
  }

  close(code = 1000, reason = '') {
    this.readyState = 3;
    this._emit('close', { code, reason });
  }

  _emit(type, event) {
    const list = this.listeners.get(type) || [];
    list.forEach((cb) => cb(event));
  }

  _open() {
    this.readyState = 1;
    this._emit('open', {});
  }

  _message(obj) {
    const data = typeof obj === 'string' ? obj : JSON.stringify(obj);
    this._emit('message', { data });
  }

  _error() {
    this._emit('error', {});
  }
}

function makeClient({
  timers,
  onStatus = () => {},
  checkAuth = null,
  isAuthed = () => true,
  prepare = async () => {},
  keepAlive = null,
  isOnline = () => true,
  buildConnectParams = () => ({ minProtocol: 3, maxProtocol: 3, client: { id: 'unit' } }),
  WebSocketImpl = FakeWebSocket
} = {}) {
  const status = [];
  const connected = [];
  const disconnected = [];

  const client = new GatewayClient({
    WebSocketImpl,
    timers,
    prepare,
    getUrl: () => 'ws://unit-test',
    buildConnectParams,
    keepAlive,
    onStatus: (s, meta) => {
      status.push({ s, meta });
      onStatus(s, meta);
    },
    onFrame: () => {},
    onConnected: () => connected.push(true),
    onDisconnected: () => disconnected.push(true),
    isAuthed,
    checkAuth,
    onAuthExpired: () => status.push({ s: 'auth-expired', meta: '' }),
    isOnline,
    challengeWaitMs: 800,
    handshakeTimeoutMs: 5000,
    requestTimeoutMs: 1000,
    keepAliveMs: 25000,
    reconnectBaseMs: 100,
    reconnectFactor: 2,
    reconnectJitter: 0,
    maxReconnectMs: 1000
  });

  return { client, status, connected, disconnected };
}

test('handshake prefers connect.challenge (no early connect before challenge)', async () => {
  FakeWebSocket.instances.length = 0;
  const timers = new FakeTimers();
  const { client, connected } = makeClient({ timers });

  await client.connect();
  const ws = FakeWebSocket.instances.at(-1);
  assert(ws, 'expected websocket instance');
  ws._open();

  timers.tick(299);
  assert.equal(ws.sent.length, 0, 'should not send connect before challenge');

  ws._message({ type: 'event', event: 'connect.challenge', payload: { nonce: 'x' } });
  assert.equal(ws.sent.length, 1, 'should send connect immediately after challenge');

  const req = JSON.parse(ws.sent[0]);
  assert.equal(req.type, 'req');
  assert.equal(req.method, 'connect');

  // Ensure the fallback timer was cleared (no second connect at 800ms).
  timers.tick(800);
  assert.equal(ws.sent.length, 1, 'should not send connect twice');

  ws._message({ type: 'res', id: req.id, ok: true, payload: { protocol: 3 } });
  await Promise.resolve();
  assert.equal(connected.length, 1, 'should mark connected after connect res');
});

test('handshake falls back to sending connect when no challenge arrives', async () => {
  FakeWebSocket.instances.length = 0;
  const timers = new FakeTimers();
  const { client, connected } = makeClient({ timers });

  await client.connect();
  const ws = FakeWebSocket.instances.at(-1);
  ws._open();

  timers.tick(799);
  assert.equal(ws.sent.length, 0, 'should not send connect before fallback delay');

  timers.tick(1);
  assert.equal(ws.sent.length, 1, 'should send connect at fallback delay');

  const req = JSON.parse(ws.sent[0]);
  ws._message({ type: 'res', id: req.id, ok: true, payload: { protocol: 3 } });
  await Promise.resolve();
  assert.equal(connected.length, 1, 'should connect after fallback connect + res');
});

test('handshake timeout schedules reconnect (single timer)', async () => {
  FakeWebSocket.instances.length = 0;
  const timers = new FakeTimers();

  const { client, status } = makeClient({
    timers,
    checkAuth: async () => ({ reachable: true, authed: true })
  });
  client.handshakeTimeoutMs = 500;

  await client.connect();
  const ws = FakeWebSocket.instances.at(-1);
  ws._open();

  timers.tick(500);
  await Promise.resolve();
  assert(status.some((e) => e.s === 'error' && String(e.meta).includes('handshake timeout')));
  assert(client.reconnectTimer, 'expected reconnect timer');

  const countBefore = FakeWebSocket.instances.length;
  timers.tick(200);
  await Promise.resolve();
  assert(FakeWebSocket.instances.length > countBefore, 'expected reconnect attempt to create new socket');
});

test('manual disconnect does not schedule reconnect', async () => {
  FakeWebSocket.instances.length = 0;
  const timers = new FakeTimers();

  const { client } = makeClient({
    timers,
    checkAuth: async () => ({ reachable: true, authed: true })
  });
  client.handshakeTimeoutMs = 200;

  await client.connect();
  const ws = FakeWebSocket.instances.at(-1);
  ws._open();

  client.disconnect(true);
  assert.equal(client.manualDisconnect, true);
  assert.equal(client.reconnectTimer, null);

  const countBefore = FakeWebSocket.instances.length;
  timers.tick(5000);
  assert.equal(FakeWebSocket.instances.length, countBefore, 'should not reconnect after manual disconnect');
});

test('buildConnectParams receives connect.challenge payload', async () => {
  FakeWebSocket.instances.length = 0;
  const timers = new FakeTimers();
  let seenChallenge = null;
  const { client } = makeClient({
    timers,
    buildConnectParams: (challenge) => {
      seenChallenge = challenge;
      return { minProtocol: 3, maxProtocol: 3, client: { id: 'unit' } };
    }
  });

  await client.connect();
  const ws = FakeWebSocket.instances.at(-1);
  ws._open();

  const challengePayload = { nonce: 'abc', ts: 123 };
  ws._message({ type: 'event', event: 'connect.challenge', payload: challengePayload });
  assert.deepEqual(seenChallenge, challengePayload);
});

test('request times out and clears pending', async () => {
  FakeWebSocket.instances.length = 0;
  const timers = new FakeTimers();
  const { client } = makeClient({ timers });

  await client.connect();
  const ws = FakeWebSocket.instances.at(-1);
  ws._open();

  client.requestTimeoutMs = 200;
  const p = client.request('sessions.resolve', { key: 'k' });
  assert.equal(ws.sent.length, 1);
  const req = JSON.parse(ws.sent[0]);
  assert.equal(req.method, 'sessions.resolve');

  timers.tick(200);
  const res = await p;
  assert.equal(res.ok, false);
  assert.equal(res.error.message, 'request timeout');
  assert.equal(client.pending.size, 0);
});

test('socket close flushes pending requests', async () => {
  FakeWebSocket.instances.length = 0;
  const timers = new FakeTimers();
  const { client } = makeClient({
    timers,
    checkAuth: async () => ({ reachable: true, authed: true })
  });

  await client.connect();
  const ws = FakeWebSocket.instances.at(-1);
  ws._open();

  client.requestTimeoutMs = 5000;
  const p = client.request('sessions.resolve', { key: 'k' });
  ws.close();

  const res = await p;
  assert.equal(res.ok, false);
  assert.equal(res.error.message, 'socket closed');
});

test('keepAlive sends periodic requests only while connected', async () => {
  FakeWebSocket.instances.length = 0;
  const timers = new FakeTimers();
  const keepAliveCalls = [];
  const { client } = makeClient({
    timers,
    keepAlive: () => {
      keepAliveCalls.push(timers.now);
      return { method: 'sessions.resolve', params: { key: 'agent:main:main' } };
    }
  });
  client.keepAliveMs = 100;
  client.requestTimeoutMs = 50;

  await client.connect();
  const ws = FakeWebSocket.instances.at(-1);
  ws._open();
  ws._message({ type: 'event', event: 'connect.challenge', payload: { nonce: 'x' } });
  const connectReq = JSON.parse(ws.sent[0]);
  ws._message({ type: 'res', id: connectReq.id, ok: true, payload: { protocol: 3 } });
  await Promise.resolve();
  assert.equal(client.connected, true);

  timers.tick(99);
  assert.equal(keepAliveCalls.length, 0);

  timers.tick(1);
  assert.equal(keepAliveCalls.length, 1);
  assert.equal(ws.sent.length, 2, 'connect + first keepalive');

  client.disconnect(true);
  const sentBefore = ws.sent.length;
  timers.tick(500);
  assert.equal(ws.sent.length, sentBefore, 'should not send keepalive after disconnect');
});

test('maybeReconnect: offline does not schedule reconnect', async () => {
  const timers = new FakeTimers();
  const { client, status } = makeClient({
    timers,
    isOnline: () => false,
    checkAuth: async () => ({ reachable: true, authed: true })
  });

  await client.maybeReconnect('disconnected');
  assert.equal(client.reconnectTimer, null);
  assert(status.some((e) => e.s === 'offline'));
});

test('maybeReconnect: auth expired calls onAuthExpired and does not reconnect', async () => {
  const timers = new FakeTimers();
  const { client, status } = makeClient({
    timers,
    checkAuth: async () => ({ reachable: true, authed: false })
  });

  await client.maybeReconnect('disconnected');
  assert.equal(client.reconnectTimer, null);
  assert(status.some((e) => e.s === 'auth-expired'));
});

test('prepare failure sets error and schedules reconnect', async () => {
  FakeWebSocket.instances.length = 0;
  const timers = new FakeTimers();
  const { client, status } = makeClient({
    timers,
    prepare: async () => {
      throw new Error('boom');
    },
    checkAuth: async () => ({ reachable: true, authed: true })
  });

  await client.connect();
  assert.equal(FakeWebSocket.instances.length, 0, 'should not create websocket when prepare fails');
  assert(status.some((e) => e.s === 'error' && String(e.meta).includes('boom')));
  assert(client.reconnectTimer, 'expected reconnect timer after prepare failure');
});

test('connect: sign-in required short-circuits without creating socket', async () => {
  FakeWebSocket.instances.length = 0;
  const timers = new FakeTimers();
  const { client, status } = makeClient({
    timers,
    isAuthed: () => false
  });

  await client.connect();
  assert.equal(FakeWebSocket.instances.length, 0);
  assert(status.some((e) => e.s === 'disconnected' && String(e.meta).includes('sign in')));
});

test('unauthorized close triggers onAuthExpired and does not reconnect', async () => {
  FakeWebSocket.instances.length = 0;
  const timers = new FakeTimers();
  const { client, status } = makeClient({
    timers,
    checkAuth: async () => ({ reachable: true, authed: true })
  });

  await client.connect();
  const ws = FakeWebSocket.instances.at(-1);
  ws._open();

  ws.close(4401, 'unauthorized');
  assert(status.some((e) => e.s === 'auth-expired'));
  assert.equal(client.reconnectTimer, null);
});
