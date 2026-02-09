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

function parseLastJson(arr) {
  const raw = arr[arr.length - 1];
  return raw ? JSON.parse(raw) : null;
}

function findEvent(arr, eventName) {
  return arr
    .map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .find((msg) => msg.type === 'event' && msg.event === eventName);
}

function findChatRun(arr, runId) {
  return arr
    .map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .find((msg) => msg.type === 'event' && msg.event === 'chat' && msg.payload?.runId === runId);
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
    heartbeatMs: 25,
    getGuestPrompt: () => 'guest prompt',
    getGuestAgentId: () => 'clawnsole-guest'
  });

  const guestClient = new FakeSocket();
  handleGuestProxy(guestClient, { role: 'guest' });
  const guestUpstream = FakeWebSocket.instances[0];
  if (!guestUpstream) {
    throw new Error('guest upstream not created');
  }
  assert.equal(guestUpstream.options?.headers?.Origin, 'http://gateway');

  // Forbidden methods should be rejected even before the upstream connects.
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

  // Buffer messages until upstream is open (startup reliability).
  guestClient.emit(
    'message',
    JSON.stringify({
      type: 'req',
      id: 'connect-1',
      method: 'connect',
      params: { client: { id: 'test', instanceId: 'device-1' } }
    })
  );
  guestClient.emit(
    'message',
    JSON.stringify({
      type: 'req',
      id: 'chat-1',
      method: 'chat.send',
      params: { sessionKey: 'override-me', message: 'hi' }
    })
  );

  assert.equal(guestUpstream.sent.length, 0, 'should buffer frames until upstream open');
  guestUpstream.open();

  const guestConnect = JSON.parse(guestUpstream.sent[0]);
  assert.equal(guestConnect.params.auth.token, tokenValue);
  assert.ok(guestConnect.params.scopes.includes('operator.write'));
  assert.equal(guestConnect.params.role, 'operator');

  const guestChat = JSON.parse(guestUpstream.sent[1]);
  assert.equal(guestChat.params.sessionKey, 'agent:clawnsole-guest:guest:device-1');

  guestUpstream.emit(
    'message',
    JSON.stringify({ type: 'event', event: 'connect.challenge', payload: { foo: 'bar' } })
  );
  const forwarded = parseLastJson(guestClient.sent);
  assert.equal(forwarded.event, 'connect.challenge');

  // Guest should not see chat events for other sessions.
  guestUpstream.emit(
    'message',
    JSON.stringify({
      type: 'event',
      event: 'chat',
      payload: {
        runId: 'run-wrong-session',
        sessionKey: 'agent:main:admin:device-1',
        seq: 0,
        state: 'final',
        message: { content: [{ text: 'nope' }] }
      }
    })
  );
  assert.equal(findChatRun(guestClient.sent, 'run-wrong-session'), undefined);

  guestUpstream.emit(
    'message',
    JSON.stringify({
      type: 'event',
      event: 'chat',
      payload: {
        runId: 'run-right-session',
        sessionKey: 'agent:clawnsole-guest:guest:device-1',
        seq: 0,
        state: 'final',
        message: { content: [{ text: 'ok' }] }
      }
    })
  );
  assert.ok(findChatRun(guestClient.sent, 'run-right-session'));

  // Non-chat, non-connect.* events should be filtered from guest.
  guestUpstream.emit('message', JSON.stringify({ type: 'event', event: 'presence', payload: { any: 'data' } }));
  assert.equal(findEvent(guestClient.sent, 'presence'), undefined);

  guestUpstream.emit('message', JSON.stringify({ type: 'res', id: 'connect-1', ok: true, payload: {} }));
  const reset = JSON.parse(guestUpstream.sent[2]);
  const injected = JSON.parse(guestUpstream.sent[3]);
  assert.equal(reset.method, 'sessions.reset');
  assert.equal(reset.params.key, 'agent:clawnsole-guest:guest:device-1');
  assert.equal(injected.method, 'chat.inject');
  assert.equal(injected.params.sessionKey, 'agent:clawnsole-guest:guest:device-1');
  assert.equal(injected.params.message, 'guest prompt');

  // Injection should only happen once per connect.
  guestUpstream.emit('message', JSON.stringify({ type: 'res', id: 'connect-1', ok: true, payload: {} }));
  assert.equal(guestUpstream.sent.length, 4);

  // Guest clients cannot call chat.inject themselves.
  guestClient.emit(
    'message',
    JSON.stringify({
      type: 'req',
      id: 'forbidden-inject-1',
      method: 'chat.inject',
      params: { sessionKey: 'override-me', message: 'nope' }
    })
  );
  const forbiddenInject = parseLastJson(guestClient.sent);
  assert.equal(forbiddenInject.ok, false);
  assert.equal(forbiddenInject.error.code, 'FORBIDDEN');

  await delay(40);
  const activity = guestClient.sent.map((item) => JSON.parse(item)).find((msg) => msg.event === 'activity');
  assert.ok(activity, 'activity event not emitted');

  const adminClient = new FakeSocket();
  handleAdminProxy(adminClient, { role: 'admin' });
  const adminUpstream = FakeWebSocket.instances[1];
  if (!adminUpstream) {
    throw new Error('admin upstream not created');
  }
  assert.equal(adminUpstream.options?.headers?.Origin, 'http://gateway');
  adminClient.emit(
    'message',
    JSON.stringify({
      type: 'req',
      id: 'connect-2',
      method: 'connect',
      params: { client: { id: 'test-admin' } }
    })
  );
  assert.equal(adminUpstream.sent.length, 0, 'should buffer admin frames until upstream open');
  adminUpstream.open();
  const adminConnect = JSON.parse(adminUpstream.sent[0]);
  assert.equal(adminConnect.params.auth.token, tokenValue);

  // Admin should only see chat events for its active session (derived from connect).
  adminUpstream.emit(
    'message',
    JSON.stringify({
      type: 'event',
      event: 'chat',
      payload: {
        runId: 'run-admin-wrong-session',
        sessionKey: 'agent:clawnsole-guest:guest:device-1',
        seq: 0,
        state: 'final',
        message: { content: [{ text: 'nope' }] }
      }
    })
  );
  assert.equal(findChatRun(adminClient.sent, 'run-admin-wrong-session'), undefined);

  adminUpstream.emit(
    'message',
    JSON.stringify({
      type: 'event',
      event: 'chat',
      payload: {
        runId: 'run-admin-right-session',
        sessionKey: 'agent:main:admin:test-admin',
        seq: 0,
        state: 'final',
        message: { content: [{ text: 'ok' }] }
      }
    })
  );
  assert.ok(findChatRun(adminClient.sent, 'run-admin-right-session'));

  // Multiple admin clients must not see each other's chat events, even if the gateway broadcasts.
  const adminMultiA = new FakeSocket();
  handleAdminProxy(adminMultiA, { role: 'admin' });
  const upstreamMultiA = FakeWebSocket.instances[2];
  assert.ok(upstreamMultiA, 'admin multi upstream A not created');
  upstreamMultiA.open();

  const adminMultiB = new FakeSocket();
  handleAdminProxy(adminMultiB, { role: 'admin' });
  const upstreamMultiB = FakeWebSocket.instances[3];
  assert.ok(upstreamMultiB, 'admin multi upstream B not created');
  upstreamMultiB.open();

  adminMultiA.emit(
    'message',
    JSON.stringify({
      type: 'req',
      id: 'multi-connect-a',
      method: 'connect',
      params: { client: { id: 'multi-a', instanceId: 'shared-device' } }
    })
  );
  adminMultiB.emit(
    'message',
    JSON.stringify({
      type: 'req',
      id: 'multi-connect-b',
      method: 'connect',
      params: { client: { id: 'multi-b', instanceId: 'shared-device' } }
    })
  );

  adminMultiA.emit(
    'message',
    JSON.stringify({
      type: 'req',
      id: 'multi-resolve-a',
      method: 'sessions.resolve',
      params: { key: 'agent:main:admin:shared-device-pane-a' }
    })
  );
  adminMultiB.emit(
    'message',
    JSON.stringify({
      type: 'req',
      id: 'multi-resolve-b',
      method: 'sessions.resolve',
      params: { key: 'agent:main:admin:shared-device-pane-b' }
    })
  );

  const broadcastA = {
    type: 'event',
    event: 'chat',
    payload: {
      runId: 'run-multi-a',
      sessionKey: 'agent:main:admin:shared-device-pane-a',
      seq: 0,
      state: 'final',
      message: { content: [{ text: 'a' }] }
    }
  };
  upstreamMultiA.emit('message', JSON.stringify(broadcastA));
  upstreamMultiB.emit('message', JSON.stringify(broadcastA));
  assert.ok(findChatRun(adminMultiA.sent, 'run-multi-a'));
  assert.equal(findChatRun(adminMultiB.sent, 'run-multi-a'), undefined);

  const broadcastB = {
    type: 'event',
    event: 'chat',
    payload: {
      runId: 'run-multi-b',
      sessionKey: 'agent:main:admin:shared-device-pane-b',
      seq: 0,
      state: 'final',
      message: { content: [{ text: 'b' }] }
    }
  };
  upstreamMultiA.emit('message', JSON.stringify(broadcastB));
  upstreamMultiB.emit('message', JSON.stringify(broadcastB));
  assert.ok(findChatRun(adminMultiB.sent, 'run-multi-b'));
  assert.equal(findChatRun(adminMultiA.sent, 'run-multi-b'), undefined);

  guestClient.close();
  guestUpstream.close();
  adminClient.close();
  adminUpstream.close();
  adminMultiA.close();
  upstreamMultiA.close();
  adminMultiB.close();
  upstreamMultiB.close();
  console.log('proxy-self-test: ok');
  clearTimeout(hardTimeout);
  process.exit(0);
}

run().catch((err) => {
  console.error('proxy-self-test: failed');
  console.error(err);
  process.exit(1);
});
