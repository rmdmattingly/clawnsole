const assert = require('assert/strict');
const test = require('node:test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { EventEmitter } = require('events');

const { createClawnsoleServer } = require('../../clawnsole-server.js');

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

class FakeReq extends EventEmitter {
  constructor({ url, method = 'GET', headers = {}, body = null } = {}) {
    super();
    this.url = url;
    this.method = method;
    this.headers = headers;
    this._body = body;
  }

  start() {
    if (this._body !== null && this._body !== undefined) {
      this.emit('data', Buffer.from(String(this._body)));
    }
    this.emit('end');
  }
}

class FakeRes {
  constructor(onEnd) {
    this.statusCode = 200;
    this.headers = {};
    this.body = Buffer.from('');
    this._onEnd = onEnd;
  }

  setHeader(name, value) {
    this.headers[String(name).toLowerCase()] = value;
  }

  writeHead(statusCode, headers) {
    this.statusCode = statusCode;
    if (headers && typeof headers === 'object') {
      Object.entries(headers).forEach(([k, v]) => this.setHeader(k, v));
    }
  }

  end(data) {
    if (data === undefined) data = '';
    this.body = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
    if (typeof this._onEnd === 'function') this._onEnd();
  }
}

function parseCookiesFromSetCookie(setCookieHeader) {
  const arr = Array.isArray(setCookieHeader) ? setCookieHeader : [];
  return arr
    .map((cookie) => String(cookie).split(';')[0])
    .filter(Boolean)
    .join('; ');
}

function invoke(handleRequest, { url, method = 'GET', headers = {}, body = null } = {}) {
  return new Promise((resolve) => {
    const req = new FakeReq({ url, method, headers, body });
    const res = new FakeRes(() => resolve(res));
    handleRequest(req, res);
    req.start();
  });
}

function makeTempHome() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-unit-'));
  const openclawDir = path.join(dir, '.openclaw');
  fs.mkdirSync(openclawDir, { recursive: true });
  return { homeDir: dir, openclawDir };
}

test('GET /meta returns gateway urls and port', async () => {
  const { homeDir, openclawDir } = makeTempHome();
  writeJson(path.join(openclawDir, 'openclaw.json'), {
    gateway: { port: 19999, auth: { mode: 'token', token: 't' } }
  });
  writeJson(path.join(openclawDir, 'clawnsole.json'), {
    adminPassword: 'admin',
    guestPassword: 'guest',
    guestAgentId: 'clawnsole-guest',
    authVersion: '1'
  });

  const { handleRequest } = createClawnsoleServer({ homeDir });
  const res = await invoke(handleRequest, { url: '/meta' });
  assert.equal(res.statusCode, 200);
  const data = JSON.parse(res.body.toString('utf8'));
  assert.equal(data.wsUrl, 'ws://127.0.0.1:19999');
  assert.equal(data.adminWsUrl, '/admin-ws');
  assert.equal(data.guestWsUrl, '/guest-ws');
  assert.equal(data.guestAgentId, 'clawnsole-guest');
  assert.equal(data.port, 19999);
});

test('login sets cookies; /auth/role uses auth cookie', async () => {
  const { homeDir, openclawDir } = makeTempHome();
  writeJson(path.join(openclawDir, 'openclaw.json'), { gateway: { port: 18789, auth: { mode: 'token', token: 't' } } });
  writeJson(path.join(openclawDir, 'clawnsole.json'), { adminPassword: 'admin', guestPassword: 'guest', authVersion: 'v1' });

  const { handleRequest } = createClawnsoleServer({ homeDir });

  const role0 = await invoke(handleRequest, { url: '/auth/role' });
  assert.equal(JSON.parse(role0.body.toString('utf8')).role, null);

  const invalidJson = await invoke(handleRequest, {
    url: '/auth/login',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{not-json'
  });
  assert.equal(invalidJson.statusCode, 400);
  assert.equal(JSON.parse(invalidJson.body.toString('utf8')).error, 'invalid_request');

  const badLogin = await invoke(handleRequest, {
    url: '/auth/login',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'admin', password: 'wrong' })
  });
  assert.equal(badLogin.statusCode, 401);
  assert.equal(JSON.parse(badLogin.body.toString('utf8')).error, 'invalid_credentials');

  const login = await invoke(handleRequest, {
    url: '/auth/login',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'admin', password: 'admin' })
  });
  assert.equal(login.statusCode, 200);
  const setCookie = login.headers['set-cookie'];
  assert.ok(Array.isArray(setCookie), 'expected Set-Cookie array');
  const cookieHeader = parseCookiesFromSetCookie(setCookie);
  assert.match(cookieHeader, /clawnsole_auth=/);

  const role1 = await invoke(handleRequest, { url: '/auth/role', headers: { cookie: cookieHeader } });
  assert.equal(JSON.parse(role1.body.toString('utf8')).role, 'admin');
});

test('login scopes cookies by instance name', async () => {
  const { homeDir, openclawDir } = makeTempHome();
  writeJson(path.join(openclawDir, 'openclaw.json'), { gateway: { port: 18789, auth: { mode: 'token', token: 't' } } });
  writeJson(path.join(openclawDir, 'clawnsole.json'), { adminPassword: 'admin', guestPassword: 'guest', authVersion: 'v1' });

  const { handleRequest } = createClawnsoleServer({ homeDir, instance: 'qa' });

  const login = await invoke(handleRequest, {
    url: '/auth/login',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'admin', password: 'admin' })
  });
  assert.equal(login.statusCode, 200);
  const setCookie = login.headers['set-cookie'];
  assert.ok(Array.isArray(setCookie), 'expected Set-Cookie array');
  const cookieHeader = parseCookiesFromSetCookie(setCookie);
  assert.match(cookieHeader, /(?:^|;\s*)clawnsole_auth_qa=/);
  assert.match(cookieHeader, /(?:^|;\s*)clawnsole_role_qa=/);

  const role1 = await invoke(handleRequest, { url: '/auth/role', headers: { cookie: cookieHeader } });
  assert.equal(JSON.parse(role1.body.toString('utf8')).role, 'admin');
});

test('/token is admin-only (guest forbidden)', async () => {
  const { homeDir, openclawDir } = makeTempHome();
  writeJson(path.join(openclawDir, 'openclaw.json'), { gateway: { port: 18789, auth: { mode: 'token', token: 'secret' } } });
  writeJson(path.join(openclawDir, 'clawnsole.json'), { adminPassword: 'admin', guestPassword: 'guest', authVersion: 'v1' });

  const { handleRequest } = createClawnsoleServer({ homeDir });

  const noAuth = await invoke(handleRequest, { url: '/token' });
  assert.equal(noAuth.statusCode, 401);

  const guestLogin = await invoke(handleRequest, {
    url: '/auth/login',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'guest', password: 'guest' })
  });
  const guestCookie = parseCookiesFromSetCookie(guestLogin.headers['set-cookie']);

  const guestToken = await invoke(handleRequest, { url: '/token', headers: { cookie: guestCookie } });
  assert.equal(guestToken.statusCode, 403);
  assert.equal(JSON.parse(guestToken.body.toString('utf8')).error, 'forbidden');

  const adminLogin = await invoke(handleRequest, {
    url: '/auth/login',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'admin', password: 'admin' })
  });
  const adminCookie = parseCookiesFromSetCookie(adminLogin.headers['set-cookie']);

  const adminToken = await invoke(handleRequest, { url: '/token', headers: { cookie: adminCookie } });
  assert.equal(adminToken.statusCode, 200);
  const payload = JSON.parse(adminToken.body.toString('utf8'));
  assert.equal(payload.token, 'secret');
  assert.equal(payload.mode, 'token');
});

test('/token returns token_not_found when gateway token missing', async () => {
  const { homeDir, openclawDir } = makeTempHome();
  writeJson(path.join(openclawDir, 'openclaw.json'), { gateway: { port: 18789, auth: { mode: 'token', token: '' } } });
  writeJson(path.join(openclawDir, 'clawnsole.json'), { adminPassword: 'admin', guestPassword: 'guest', authVersion: 'v1' });

  const { handleRequest } = createClawnsoleServer({ homeDir });
  const adminLogin = await invoke(handleRequest, {
    url: '/auth/login',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'admin', password: 'admin' })
  });
  const adminCookie = parseCookiesFromSetCookie(adminLogin.headers['set-cookie']);
  const res = await invoke(handleRequest, { url: '/token', headers: { cookie: adminCookie } });
  assert.equal(res.statusCode, 404);
  assert.equal(JSON.parse(res.body.toString('utf8')).error, 'token_not_found');
});

test('authVersion rotation invalidates existing cookies', async () => {
  const { homeDir, openclawDir } = makeTempHome();
  const cfgPath = path.join(openclawDir, 'clawnsole.json');
  writeJson(path.join(openclawDir, 'openclaw.json'), { gateway: { port: 18789, auth: { mode: 'token', token: 't' } } });
  writeJson(cfgPath, { adminPassword: 'admin', guestPassword: 'guest', authVersion: 'v1' });

  const { handleRequest, encodeAuthCookie } = createClawnsoleServer({ homeDir });
  const cookieHeader = `clawnsole_auth=${encodeAuthCookie('admin', 'v1')}`;

  const role1 = await invoke(handleRequest, { url: '/auth/role', headers: { cookie: cookieHeader } });
  assert.equal(JSON.parse(role1.body.toString('utf8')).role, 'admin');

  writeJson(cfgPath, { adminPassword: 'admin', guestPassword: 'guest', authVersion: 'v2' });
  const role2 = await invoke(handleRequest, { url: '/auth/role', headers: { cookie: cookieHeader } });
  assert.equal(JSON.parse(role2.body.toString('utf8')).role, null);
});

test('/config/guest-prompt requires admin and persists updates', async () => {
  const { homeDir, openclawDir } = makeTempHome();
  const cfgPath = path.join(openclawDir, 'clawnsole.json');
  writeJson(path.join(openclawDir, 'openclaw.json'), { gateway: { port: 18789, auth: { mode: 'token', token: 't' } } });
  writeJson(cfgPath, {
    adminPassword: 'admin',
    guestPassword: 'guest',
    guestPrompt: 'initial prompt',
    authVersion: 'v1'
  });

  const { handleRequest } = createClawnsoleServer({ homeDir });

  const noAuth = await invoke(handleRequest, { url: '/config/guest-prompt' });
  assert.equal(noAuth.statusCode, 403);

  const guestLogin = await invoke(handleRequest, {
    url: '/auth/login',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'guest', password: 'guest' })
  });
  const guestCookie = parseCookiesFromSetCookie(guestLogin.headers['set-cookie']);
  const guestGet = await invoke(handleRequest, { url: '/config/guest-prompt', headers: { cookie: guestCookie } });
  assert.equal(guestGet.statusCode, 403);

  const adminLogin = await invoke(handleRequest, {
    url: '/auth/login',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'admin', password: 'admin' })
  });
  const adminCookie = parseCookiesFromSetCookie(adminLogin.headers['set-cookie']);

  const get1 = await invoke(handleRequest, { url: '/config/guest-prompt', headers: { cookie: adminCookie } });
  assert.equal(get1.statusCode, 200);
  assert.equal(JSON.parse(get1.body.toString('utf8')).prompt, 'initial prompt');

  const post = await invoke(handleRequest, {
    url: '/config/guest-prompt',
    method: 'POST',
    headers: { cookie: adminCookie, 'content-type': 'application/json' },
    body: JSON.stringify({ prompt: 'updated prompt' })
  });
  assert.equal(post.statusCode, 200);
  assert.equal(JSON.parse(post.body.toString('utf8')).ok, true);

  const tooLong = await invoke(handleRequest, {
    url: '/config/guest-prompt',
    method: 'POST',
    headers: { cookie: adminCookie, 'content-type': 'application/json' },
    body: JSON.stringify({ prompt: 'x'.repeat(4001) })
  });
  assert.equal(tooLong.statusCode, 400);
  assert.equal(JSON.parse(tooLong.body.toString('utf8')).error, 'prompt_too_long');

  const get2 = await invoke(handleRequest, { url: '/config/guest-prompt', headers: { cookie: adminCookie } });
  assert.equal(JSON.parse(get2.body.toString('utf8')).prompt, 'updated prompt');

  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  assert.equal(cfg.guestPrompt, 'updated prompt');
});

test('/upload stores files and /uploads serves them (auth required)', async () => {
  const { homeDir, openclawDir } = makeTempHome();
  writeJson(path.join(openclawDir, 'openclaw.json'), { gateway: { port: 18789, auth: { mode: 'token', token: 't' } } });
  writeJson(path.join(openclawDir, 'clawnsole.json'), { adminPassword: 'admin', guestPassword: 'guest', authVersion: 'v1' });

  const { handleRequest } = createClawnsoleServer({ homeDir });

  const adminLogin = await invoke(handleRequest, {
    url: '/auth/login',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'admin', password: 'admin' })
  });
  const adminCookie = parseCookiesFromSetCookie(adminLogin.headers['set-cookie']);

  const unauthUpload = await invoke(handleRequest, {
    url: '/upload',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ files: [] })
  });
  assert.equal(unauthUpload.statusCode, 401);

  const getUpload = await invoke(handleRequest, { url: '/upload', headers: { cookie: adminCookie } });
  assert.equal(getUpload.statusCode, 405);

  const content = 'hello upload';
  const upload = await invoke(handleRequest, {
    url: '/upload',
    method: 'POST',
    headers: { cookie: adminCookie, 'content-type': 'application/json' },
    body: JSON.stringify({
      files: [
        {
          name: '../../evil.txt',
          type: 'text/plain',
          data: Buffer.from(content, 'utf8').toString('base64')
        }
      ]
    })
  });
  assert.equal(upload.statusCode, 200);
  const payload = JSON.parse(upload.body.toString('utf8'));
  assert.equal(payload.files.length, 1);
  assert.ok(!payload.files[0].name.includes('/'));
  assert.match(payload.files[0].url, /^\/uploads\//);

  const served = await invoke(handleRequest, { url: payload.files[0].url, headers: { cookie: adminCookie } });
  assert.equal(served.statusCode, 200);
  assert.equal(served.body.toString('utf8'), content);

  const traversal = await invoke(handleRequest, { url: '/uploads/../openclaw.json', headers: { cookie: adminCookie } });
  assert.equal(traversal.statusCode, 403);
});

test('/auth/logout clears auth cookies', async () => {
  const { homeDir, openclawDir } = makeTempHome();
  writeJson(path.join(openclawDir, 'openclaw.json'), { gateway: { port: 18789, auth: { mode: 'token', token: 't' } } });
  writeJson(path.join(openclawDir, 'clawnsole.json'), { adminPassword: 'admin', guestPassword: 'guest', authVersion: 'v1' });

  const { handleRequest } = createClawnsoleServer({ homeDir });
  const res = await invoke(handleRequest, { url: '/auth/logout', method: 'POST' });
  assert.equal(res.statusCode, 200);
  const cookies = res.headers['set-cookie'];
  assert.ok(Array.isArray(cookies));
  const joined = cookies.join('\n');
  assert.ok(joined.includes('clawnsole_auth=; Path=/'));
  assert.match(joined, /Max-Age=0/);
});

test('GET /admin and /guest serve the kiosk shell (index.html)', async () => {
  const { homeDir, openclawDir } = makeTempHome();
  writeJson(path.join(openclawDir, 'openclaw.json'), { gateway: { port: 18789, auth: { mode: 'token', token: 't' } } });
  writeJson(path.join(openclawDir, 'clawnsole.json'), { adminPassword: 'admin', guestPassword: 'guest', authVersion: 'v1' });

  const { handleRequest } = createClawnsoleServer({ homeDir });

  const admin = await invoke(handleRequest, { url: '/admin' });
  assert.equal(admin.statusCode, 200);
  assert.match(String(admin.headers['content-type'] || ''), /text\/html/);
  assert.match(admin.body.toString('utf8'), /<title>Clawnsole<\/title>/);

  const guest = await invoke(handleRequest, { url: '/guest' });
  assert.equal(guest.statusCode, 200);
  assert.match(String(guest.headers['content-type'] || ''), /text\/html/);
  assert.match(guest.body.toString('utf8'), /<title>Clawnsole<\/title>/);
});

test('work queues: create queue, add item, claim, and update state', async () => {
  const { homeDir, openclawDir } = makeTempHome();
  writeJson(path.join(openclawDir, 'openclaw.json'), { gateway: { port: 18789, auth: { mode: 'token', token: 't' } } });
  writeJson(path.join(openclawDir, 'clawnsole.json'), { adminPassword: 'admin', guestPassword: 'guest', authVersion: 'v1' });

  const workQueuesPath = path.join(openclawDir, 'clawnsole-work-queues.test.json');
  const { handleRequest } = createClawnsoleServer({ homeDir, workQueuesPath });

  const login = await invoke(handleRequest, {
    url: '/auth/login',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'admin', password: 'admin' })
  });
  assert.equal(login.statusCode, 200);
  const cookie = parseCookiesFromSetCookie(login.headers['set-cookie']);

  const list0 = await invoke(handleRequest, { url: '/work-queues', headers: { cookie } });
  assert.equal(list0.statusCode, 200);
  assert.deepEqual(JSON.parse(list0.body.toString('utf8')).queues, []);

  const created = await invoke(handleRequest, {
    url: '/work-queues',
    method: 'POST',
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Inbox', assignedAgents: ['main'] })
  });
  assert.equal(created.statusCode, 200);
  const createdQueue = JSON.parse(created.body.toString('utf8')).queue;
  assert.ok(createdQueue.id);
  assert.equal(createdQueue.name, 'Inbox');

  const added = await invoke(handleRequest, {
    url: `/work-queues/${createdQueue.id}/items`,
    method: 'POST',
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify({ prompt: 'Do the thing' })
  });
  assert.equal(added.statusCode, 200);
  const item = JSON.parse(added.body.toString('utf8')).item;
  assert.equal(item.state, 'pending');

  const claim = await invoke(handleRequest, {
    url: `/work-queues/${createdQueue.id}/claim`,
    method: 'POST',
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify({ agentId: 'main', leaseMs: 60000 })
  });
  assert.equal(claim.statusCode, 200);
  const claimed = JSON.parse(claim.body.toString('utf8')).item;
  assert.equal(claimed.id, item.id);
  assert.equal(claimed.state, 'claimed');
  assert.equal(claimed.claimedBy, 'main');

  const done = await invoke(handleRequest, {
    url: `/work-queues/${createdQueue.id}/items/${item.id}`,
    method: 'POST',
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify({ state: 'done' })
  });
  assert.equal(done.statusCode, 200);
  const doneItem = JSON.parse(done.body.toString('utf8')).item;
  assert.equal(doneItem.state, 'done');
  assert.ok(typeof doneItem.doneAt === 'number');

  // Ensure persistence file got written (persist is debounced).
  await new Promise((resolve) => setTimeout(resolve, 350));
  assert.ok(fs.existsSync(workQueuesPath));
});

test('GET /agents is admin-only and returns agent ids', async () => {
  const { homeDir, openclawDir } = makeTempHome();
  const opsWorkspace = path.join(homeDir, 'ops-workspace');
  fs.mkdirSync(opsWorkspace, { recursive: true });
  fs.writeFileSync(
    path.join(opsWorkspace, 'IDENTITY.md'),
    '# IDENTITY.md - Who Am I?\n\n- **Name:** Ops Bot\n- **Emoji:** 🛠️\n',
    'utf8'
  );

  writeJson(path.join(openclawDir, 'openclaw.json'), {
    gateway: { port: 18789, auth: { mode: 'token', token: 't' } },
    agents: {
      defaults: { workspace: path.join(homeDir, 'main-workspace') },
      list: [
        { id: 'main' },
        { id: 'ops', name: 'Ops', workspace: opsWorkspace },
        { id: 'dev' }
      ]
    }
  });
  writeJson(path.join(openclawDir, 'clawnsole.json'), { adminPassword: 'admin', guestPassword: 'guest', authVersion: 'v1' });

  const { handleRequest } = createClawnsoleServer({ homeDir });

  const noAuth = await invoke(handleRequest, { url: '/agents' });
  assert.equal(noAuth.statusCode, 401);

  const guestLogin = await invoke(handleRequest, {
    url: '/auth/login',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'guest', password: 'guest' })
  });
  const guestCookie = parseCookiesFromSetCookie(guestLogin.headers['set-cookie']);
  const guestAgents = await invoke(handleRequest, { url: '/agents', headers: { cookie: guestCookie } });
  assert.equal(guestAgents.statusCode, 403);

  const adminLogin = await invoke(handleRequest, {
    url: '/auth/login',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'admin', password: 'admin' })
  });
  const adminCookie = parseCookiesFromSetCookie(adminLogin.headers['set-cookie']);
  const res = await invoke(handleRequest, { url: '/agents', headers: { cookie: adminCookie } });
  assert.equal(res.statusCode, 200);
  const payload = JSON.parse(res.body.toString('utf8'));
  assert.ok(Array.isArray(payload.agents));
  const ids = payload.agents.map((a) => a.id);
  assert.ok(ids.includes('main'));
  assert.ok(ids.includes('ops'));
  assert.ok(ids.includes('dev'));

  const ops = payload.agents.find((agent) => agent.id === 'ops');
  assert.equal(ops.displayName, 'Ops Bot');
  assert.equal(ops.emoji, '🛠️');
});
