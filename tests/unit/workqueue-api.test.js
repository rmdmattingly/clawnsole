const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');

const { createClawnsoleServer } = require('../../clawnsole-server');
const { enqueueItem } = require('../../lib/workqueue');

function mkTempEnv() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-wq-api-'));
  // IMPORTANT: do not mutate HOME in tests. Playwright and other tooling use HOME for caches.
  // Instead, point Clawnsole/OpenClaw state at an isolated OPENCLAW_HOME.
  const openclawHome = path.join(dir, '.openclaw');
  process.env.OPENCLAW_HOME = openclawHome;
  return { dir, openclawHome };
}

function adminCookie({ password = 'admin', authVersion = 'test', role = 'admin' } = {}) {
  const auth = Buffer.from(`${password}::${authVersion}`, 'utf8').toString('base64');
  return `clawnsole_auth=${auth}; clawnsole_role=${role}`;
}

function httpGetJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: 'GET', headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk.toString()));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {}
        resolve({ status: res.statusCode, json: parsed, raw: data });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function httpPostJson(url, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload ?? {});
    const req = http.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(body),
          ...headers
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk.toString()));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {}
          resolve({ status: res.statusCode, json: parsed, raw: data });
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function startServer({ openclawHome } = {}) {
  return new Promise((resolve) => {
    const { server } = createClawnsoleServer({ portRaw: 0, openclawHome });
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = addr && typeof addr === 'object' ? addr.port : null;
      resolve({ server, port });
    });
  });
}

test('workqueue API: requires auth', async () => {
  const { openclawHome } = mkTempEnv();
  enqueueItem(null, { queue: 'dev-team', title: 't', instructions: 'do', priority: 1 });

  const { server, port } = await startServer({ openclawHome });
  try {
    const res = await httpGetJson(`http://127.0.0.1:${port}/api/workqueue/items?queue=dev-team`);
    assert.equal(res.status, 401);
    assert.equal(res.json?.error, 'unauthorized');
  } finally {
    server.close();
  }
});

test('workqueue API: lists items for admin cookie', async () => {
  const { openclawHome } = mkTempEnv();
  // Create minimal clawnsole config.
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  enqueueItem(null, { queue: 'dev-team', title: 't1', instructions: 'do1', priority: 1 });
  enqueueItem(null, { queue: 'dev-team', title: 't2', instructions: 'do2', priority: 2 });

  const { server, port } = await startServer({ openclawHome });
  try {
    const res = await httpGetJson(`http://127.0.0.1:${port}/api/workqueue/items?queue=dev-team`, {
      Cookie: adminCookie()
    });
    assert.equal(res.status, 200);
    assert.equal(res.json?.ok, true);
    assert.ok(Array.isArray(res.json?.items));
    assert.equal(res.json.items.length, 2);
  } finally {
    server.close();
  }
});

test('workqueue API: summary returns counts + active list', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  enqueueItem(null, { queue: 'dev-team', title: 't1', instructions: 'do1', priority: 1 });
  enqueueItem(null, { queue: 'dev-team', title: 't2', instructions: 'do2', priority: 2 });

  // Claim one item to make it active.
  const { claimNext } = require('../../lib/workqueue');
  claimNext(null, { agentId: 'agent-1', queues: ['dev-team'], leaseMs: 60_000 });

  const { server, port } = await startServer();
  try {
    const res = await httpGetJson(`http://127.0.0.1:${port}/api/workqueue/summary?queue=dev-team`, {
      Cookie: adminCookie()
    });
    assert.equal(res.status, 200);
    assert.equal(res.json?.ok, true);
    assert.ok(res.json?.counts);
    assert.ok(Array.isArray(res.json?.active));
    assert.ok(res.json.active.length >= 1);
  } finally {
    server.close();
  }
});

test('workqueue API mutations: enqueue requires auth', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  const { server, port } = await startServer({ openclawHome });
  try {
    const res = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/enqueue`, {
      queue: 'dev-team',
      title: 't',
      instructions: 'do',
      priority: 1
    });
    assert.equal(res.status, 401);
    assert.equal(res.json?.error, 'unauthorized');
  } finally {
    server.close();
  }
});

test('workqueue API mutations: forbidden when role is not admin', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  const { server, port } = await startServer({ openclawHome });
  try {
    const res = await httpPostJson(
      `http://127.0.0.1:${port}/api/workqueue/enqueue`,
      { queue: 'dev-team', title: 't', instructions: 'do', priority: 1 },
      { Cookie: adminCookie({ role: 'user' }) }
    );
    assert.equal(res.status, 403);
    assert.equal(res.json?.error, 'forbidden');
  } finally {
    server.close();
  }
});

test('workqueue API mutations: happy path enqueue → claim-next → in_progress → done/failed', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  const { server, port } = await startServer({ openclawHome });
  try {
    const cookie = { Cookie: adminCookie() };

    const enq = await httpPostJson(
      `http://127.0.0.1:${port}/api/workqueue/enqueue`,
      { queue: 'dev-team', title: 't1', instructions: 'do1', priority: 5 },
      cookie
    );
    assert.equal(enq.status, 200);
    assert.equal(enq.json?.ok, true);
    assert.ok(enq.json?.item?.id);

    const claim = await httpPostJson(
      `http://127.0.0.1:${port}/api/workqueue/claim-next`,
      { agentId: 'agent-1', queues: ['dev-team'], leaseMs: 60_000 },
      cookie
    );
    assert.equal(claim.status, 200);
    assert.equal(claim.json?.ok, true);
    assert.equal(claim.json?.item?.claimedBy, 'agent-1');

    const prog = await httpPostJson(
      `http://127.0.0.1:${port}/api/workqueue/transition`,
      { itemId: claim.json.item.id, agentId: 'agent-1', status: 'in_progress', note: 'started', leaseMs: 60_000 },
      cookie
    );
    assert.equal(prog.status, 200);
    assert.equal(prog.json?.ok, true);
    assert.equal(prog.json?.item?.status, 'in_progress');

    const done = await httpPostJson(
      `http://127.0.0.1:${port}/api/workqueue/transition`,
      { itemId: claim.json.item.id, agentId: 'agent-1', status: 'done', result: { ok: true } },
      cookie
    );
    assert.equal(done.status, 200);
    assert.equal(done.json?.ok, true);
    assert.equal(done.json?.item?.status, 'done');

    const enq2 = await httpPostJson(
      `http://127.0.0.1:${port}/api/workqueue/enqueue`,
      { queue: 'dev-team', title: 't2', instructions: 'do2', priority: 1 },
      cookie
    );
    const claim2 = await httpPostJson(
      `http://127.0.0.1:${port}/api/workqueue/claim-next`,
      { agentId: 'agent-2', queues: ['dev-team'], leaseMs: 60_000 },
      cookie
    );
    const fail = await httpPostJson(
      `http://127.0.0.1:${port}/api/workqueue/transition`,
      { itemId: claim2.json.item.id, agentId: 'agent-2', status: 'failed', error: 'nope' },
      cookie
    );
    assert.equal(fail.status, 200);
    assert.equal(fail.json?.ok, true);
    assert.equal(fail.json?.item?.status, 'failed');
    assert.equal(fail.json?.item?.lastError, 'nope');
  } finally {
    server.close();
  }
});

test('workqueue API mutations: input validation', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  const { server, port } = await startServer({ openclawHome });
  try {
    const cookie = { Cookie: adminCookie() };

    const badEnq = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/enqueue`, { title: 'x' }, cookie);
    assert.equal(badEnq.status, 400);
    assert.equal(badEnq.json?.error, 'invalid_request');

    const badClaim = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/claim-next`, { queues: ['dev-team'] }, cookie);
    assert.equal(badClaim.status, 400);
    assert.equal(badClaim.json?.error, 'invalid_request');

    const badTransition = await httpPostJson(
      `http://127.0.0.1:${port}/api/workqueue/transition`,
      { itemId: 'x', agentId: 'a', status: 'nope' },
      cookie
    );
    assert.equal(badTransition.status, 400);
    assert.equal(badTransition.json?.error, 'invalid_request');
  } finally {
    server.close();
  }
});
