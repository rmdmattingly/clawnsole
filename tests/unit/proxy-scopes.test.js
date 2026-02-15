const test = require('node:test');
const assert = require('node:assert/strict');

const { createProxyHandlers } = require('../../proxy');

function makeWsPair() {
  const handlers = { message: [], close: [] };
  const ws = {
    readyState: 1,
    sent: [],
    on(evt, fn) {
      (handlers[evt] ||= []).push(fn);
    },
    send(data) {
      this.sent.push(String(data));
    },
    close(code, reason) {
      (handlers.close || []).forEach((fn) => fn(code, reason));
    },
    _emitMessage(data) {
      (handlers.message || []).forEach((fn) => fn(data));
    }
  };
  return ws;
}

class FakeUpstreamWs {
  constructor() {
    this.readyState = 1;
    this.sent = [];
    this.handlers = { open: [], message: [], close: [], error: [] };
  }
  on(evt, fn) {
    (this.handlers[evt] ||= []).push(fn);
  }
  send(data) {
    this.sent.push(String(data));
  }
  close() {}
}

class FakeWebSocketCtor {
  constructor(_url, _opts) {
    const ws = new FakeUpstreamWs();
    // emulate ws library constructor returning a socket instance
    return ws;
  }
}

function getLastUpstreamConnectFrame(upstream) {
  const frames = upstream.sent.map((s) => JSON.parse(s));
  return frames.reverse().find((f) => f && f.type === 'req' && f.method === 'connect');
}

test('admin proxy injects token + operator scopes including operator.admin on connect', async () => {
  const upstreams = [];
  function WebSocket(url, opts) {
    const ws = new FakeUpstreamWs();
    ws.url = url;
    ws.opts = opts;
    upstreams.push(ws);
    return ws;
  }

  const handlers = createProxyHandlers({
    WebSocket,
    getRoleFromCookies: () => 'admin',
    readToken: () => ({ token: 'tok_test' }),
    gatewayWsUrl: () => 'ws://127.0.0.1:18789'
  });

  const client = makeWsPair();
  handlers.handleAdminProxy(client, { headers: { cookie: 'role=admin' } });

  // Simulate the browser sending a connect frame without scopes/auth.
  client._emitMessage(
    JSON.stringify({
      type: 'req',
      method: 'connect',
      params: {
        client: { id: 'clawnsole', instanceId: 'test' },
        role: 'operator'
      }
    })
  );

  assert.equal(upstreams.length, 1);
  const upstream = upstreams[0];
  const connect = getLastUpstreamConnectFrame(upstream);
  assert.ok(connect, 'expected upstream connect frame');

  assert.equal(connect.params.auth.token, 'tok_test');
  assert.ok(Array.isArray(connect.params.scopes), 'expected scopes array');
  assert.ok(connect.params.scopes.includes('operator.read'));
  assert.ok(connect.params.scopes.includes('operator.write'));
  assert.ok(connect.params.scopes.includes('operator.admin'));

  // Cleanup: stop proxy heartbeat interval.
  client.close(1000, 'done');
});
