const assert = require('assert/strict');

// Self-test runs against a fake ws:// gateway URL.
process.env.CLAWNSOLE_ALLOW_INSECURE_TRANSPORT = '1';

const { EventEmitter } = require('events');
const { createProxyHandlers } = require('../proxy');

class FakeSocket extends EventEmitter {
  constructor() {
    super();
    this.sent = [];
    this.closed = false;
  }

  send(data) {
    this.sent.push(String(data));
    this.emit('sent', data);
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.emit('close');
  }
}

class FakeWebSocket extends EventEmitter {
  static instances = [];
  static OPEN = 1;

  constructor(url, options = {}) {
    super();
    this.url = url;
    this.options = options;
    this.sent = [];
    this.closed = false;
    this.readyState = 0;
    FakeWebSocket.instances.push(this);
  }

  send(data) {
    this.sent.push(String(data));
  }

  close(code = 1000, reason = '') {
    if (this.closed) return;
    this.closed = true;
    this.readyState = 3;
    this.emit('close', code, Buffer.from(String(reason)));
  }

  open() {
    this.readyState = 1;
    this.emit('open');
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const hardTimeout = setTimeout(() => {
    console.error('proxy-self-test: timeout');
    process.exit(1);
  }, 2000);

  const tokenValue = 'token-123';
  const getRoleFromCookies = (req) => req.role;
  const readToken = () => ({ token: tokenValue });
  const gatewayWsUrl = () => 'ws://gateway';

  const { handleAdminProxy } = createProxyHandlers({
    WebSocket: FakeWebSocket,
    getRoleFromCookies,
    readToken,
    gatewayWsUrl,
    heartbeatMs: 25
  });

  // Unauthorized client should be closed immediately.
  const badClient = new FakeSocket();
  handleAdminProxy(badClient, { role: null });
  assert.equal(badClient.closed, true);

  // Admin proxy should connect upstream and buffer until open.
  const adminClient = new FakeSocket();
  handleAdminProxy(adminClient, { role: 'admin' });
  const upstream = FakeWebSocket.instances[0];
  assert.ok(upstream, 'admin upstream not created');
  assert.equal(upstream.options?.headers?.Origin, 'http://gateway');

  // Buffer connect request until upstream is open.
  adminClient.emit(
    'message',
    JSON.stringify({ type: 'req', id: 'connect-1', method: 'connect', params: { client: { id: 'device-1' } } })
  );
  assert.equal(upstream.sent.length, 0);

  upstream.open();
  assert.equal(upstream.sent.length, 1);
  const connect = JSON.parse(upstream.sent[0]);
  assert.equal(connect.method, 'connect');
  assert.equal(connect.params.auth.token, tokenValue);
  assert.ok(connect.params.scopes.includes('operator.write'));

  // Heartbeat should emit activity events.
  await delay(30);
  const activity = adminClient.sent.map((raw) => JSON.parse(raw)).find((msg) => msg.type === 'event' && msg.event === 'activity');
  assert.ok(activity);

  // Cleanup: close sockets so proxy heartbeat interval is cleared.
  try {
    adminClient.close();
  } catch {}
  try {
    upstream.close();
  } catch {}

  clearTimeout(hardTimeout);
  console.log('proxy-self-test: ok');
  // The proxy sets up background timers (e.g. heartbeats). Ensure the
  // self-test terminates promptly in CI.
  process.exit(0);
}

run().catch((err) => {
  console.error('proxy-self-test: failed', err);
  process.exit(1);
});
