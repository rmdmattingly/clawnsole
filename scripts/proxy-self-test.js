const assert = require('assert/strict');
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

  constructor(url) {
    super();
    this.url = url;
    this.sent = [];
    this.closed = false;
    FakeWebSocket.instances.push(this);
  }

  send(data) {
    this.sent.push(String(data));
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.emit('close');
  }
}

function parseLastJson(arr) {
  const raw = arr[arr.length - 1];
  return raw ? JSON.parse(raw) : null;
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

  const { handleGuestProxy, handleAdminProxy } = createProxyHandlers({
    WebSocket: FakeWebSocket,
    getRoleFromCookies,
    readToken,
    gatewayWsUrl,
    heartbeatMs: 25
  });

  const guestClient = new FakeSocket();
  handleGuestProxy(guestClient, { role: 'guest' });
  const guestUpstream = FakeWebSocket.instances[0];
  if (!guestUpstream) {
    throw new Error('guest upstream not created');
  }
  guestUpstream.emit('open');
  guestClient.emit(
    'message',
    JSON.stringify({
      type: 'req',
      id: 'connect-1',
      method: 'connect',
      params: { client: { id: 'test' } }
    })
  );
  const guestConnect = JSON.parse(guestUpstream.sent[0]);
  assert.equal(guestConnect.params.auth.token, tokenValue);
  assert.ok(guestConnect.params.scopes.includes('operator.write'));

  guestClient.emit(
    'message',
    JSON.stringify({
      type: 'req',
      id: 'forbidden-1',
      method: 'tools.run',
      params: {}
    })
  );
  const forbidden = parseLastJson(guestClient.sent);
  assert.equal(forbidden.ok, false);
  assert.equal(forbidden.error.code, 'FORBIDDEN');

  guestUpstream.emit(
    'message',
    JSON.stringify({ type: 'event', event: 'connect.challenge', payload: { foo: 'bar' } })
  );
  const forwarded = parseLastJson(guestClient.sent);
  assert.equal(forwarded.event, 'connect.challenge');

  await delay(40);
  const activity = guestClient.sent.map((item) => JSON.parse(item)).find((msg) => msg.event === 'activity');
  assert.ok(activity, 'activity event not emitted');

  const adminClient = new FakeSocket();
  handleAdminProxy(adminClient, { role: 'admin' });
  const adminUpstream = FakeWebSocket.instances[1];
  if (!adminUpstream) {
    throw new Error('admin upstream not created');
  }
  adminUpstream.emit('open');
  adminClient.emit(
    'message',
    JSON.stringify({
      type: 'req',
      id: 'connect-2',
      method: 'connect',
      params: { client: { id: 'test-admin' } }
    })
  );
  const adminConnect = JSON.parse(adminUpstream.sent[0]);
  assert.equal(adminConnect.params.auth.token, tokenValue);

  guestClient.close();
  guestUpstream.close();
  adminClient.close();
  adminUpstream.close();
  console.log('proxy-self-test: ok');
  clearTimeout(hardTimeout);
  process.exit(0);
}

run().catch((err) => {
  console.error('proxy-self-test: failed');
  console.error(err);
  process.exit(1);
});
