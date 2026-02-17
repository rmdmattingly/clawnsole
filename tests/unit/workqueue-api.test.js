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

function httpPostJson(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body ?? {});
    const req = http.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
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
    req.write(payload);
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
    const cookie = Buffer.from('admin::test', 'utf8').toString('base64');
    const res = await httpGetJson(`http://127.0.0.1:${port}/api/workqueue/items?queue=dev-team`, {
      Cookie: `clawnsole_auth=${cookie}; clawnsole_role=admin`
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

  const a = enqueueItem(null, { queue: 'dev-team', title: 't1', instructions: 'do1', priority: 1 });
  const b = enqueueItem(null, { queue: 'dev-team', title: 't2', instructions: 'do2', priority: 2 });

  // Claim one item to make it active.
  const { claimNext } = require('../../lib/workqueue');
  claimNext(null, { agentId: 'agent-1', queues: ['dev-team'], leaseMs: 60_000 });

  const { server, port } = await startServer();
  try {
    const cookie = Buffer.from('admin::test', 'utf8').toString('base64');
    const res = await httpGetJson(`http://127.0.0.1:${port}/api/workqueue/summary?queue=dev-team`, {
      Cookie: `clawnsole_auth=${cookie}; clawnsole_role=admin`
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


test('workqueue API: enqueue creates item', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  const { server, port } = await startServer({ openclawHome });
  try {
    const cookie = Buffer.from('admin::test', 'utf8').toString('base64');
    const res = await httpPostJson(
      'http://127.0.0.1:' + port + '/api/workqueue/enqueue',
      { queue: 'dev-team', title: 't3', instructions: 'do3', priority: 3, dedupeKey: 'k1' },
      { Cookie: 'clawnsole_auth=' + cookie + '; clawnsole_role=admin' }
    );
    assert.equal(res.status, 200);
    assert.equal(res.json?.ok, true);
    assert.equal(res.json?.item?.queue, 'dev-team');
    assert.equal(res.json?.item?.dedupeKey, 'k1');
  } finally {
    server.close();
  }
});

test('workqueue API: claim-next claims a ready item', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  enqueueItem(null, { queue: 'dev-team', title: 't1', instructions: 'do1', priority: 1 });

  const { server, port } = await startServer({ openclawHome });
  try {
    const cookie = Buffer.from('admin::test', 'utf8').toString('base64');
    const res = await httpPostJson(
      'http://127.0.0.1:' + port + '/api/workqueue/claim-next',
      { agentId: 'agent-1', queue: 'dev-team', leaseMs: 60000 },
      { Cookie: 'clawnsole_auth=' + cookie + '; clawnsole_role=admin' }
    );
    assert.equal(res.status, 200);
    assert.equal(res.json?.ok, true);
    assert.equal(res.json?.item?.status, 'claimed');
    assert.equal(res.json?.item?.claimedBy, 'agent-1');
  } finally {
    server.close();
  }
});

test('workqueue API: update edits item fields', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  const it = enqueueItem(null, { queue: 'dev-team', title: 'old', instructions: 'old-i', priority: 1 });

  const { server, port } = await startServer({ openclawHome });
  try {
    const cookie = Buffer.from('admin::test', 'utf8').toString('base64');
    const res = await httpPostJson(
      'http://127.0.0.1:' + port + '/api/workqueue/update',
      { itemId: it.id, patch: { title: 'new', priority: 5, status: 'pending' } },
      { Cookie: 'clawnsole_auth=' + cookie + '; clawnsole_role=admin' }
    );
    assert.equal(res.status, 200);
    assert.equal(res.json?.ok, true);
    assert.equal(res.json?.item?.title, 'new');
    assert.equal(res.json?.item?.priority, 5);
    assert.equal(res.json?.item?.status, 'pending');
  } finally {
    server.close();
  }
});

test('workqueue API: delete removes item', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  const it = enqueueItem(null, { queue: 'dev-team', title: 't1', instructions: 'do1', priority: 1 });

  const { server, port } = await startServer({ openclawHome });
  try {
    const cookie = Buffer.from('admin::test', 'utf8').toString('base64');
    const res = await httpPostJson(
      'http://127.0.0.1:' + port + '/api/workqueue/delete',
      { itemId: it.id },
      { Cookie: 'clawnsole_auth=' + cookie + '; clawnsole_role=admin' }
    );
    assert.equal(res.status, 200);
    assert.equal(res.json?.ok, true);

    const list = await httpGetJson(`http://127.0.0.1:${port}/api/workqueue/items?queue=dev-team`, {
      Cookie: `clawnsole_auth=${cookie}; clawnsole_role=admin`
    });
    assert.equal(list.status, 200);
    assert.equal(list.json?.ok, true);
    assert.equal(list.json.items.length, 0);
  } finally {
    server.close();
  }
});

test('workqueue API: item endpoint returns one item', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  const it = enqueueItem(null, { queue: 'dev-team', title: 't1', instructions: 'do1', priority: 1 });

  const { server, port } = await startServer({ openclawHome });
  try {
    const cookie = Buffer.from('admin::test', 'utf8').toString('base64');
    const res = await httpGetJson(`http://127.0.0.1:${port}/api/workqueue/item/${it.id}`, {
      Cookie: `clawnsole_auth=${cookie}; clawnsole_role=admin`
    });
    assert.equal(res.status, 200);
    assert.equal(res.json?.ok, true);
    assert.equal(res.json?.item?.id, it.id);
  } finally {
    server.close();
  }
});

test('workqueue API: transition updates status', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  enqueueItem(null, { queue: 'dev-team', title: 't1', instructions: 'do1', priority: 1 });

  const { server, port } = await startServer({ openclawHome });
  try {
    const cookie = Buffer.from('admin::test', 'utf8').toString('base64');

    const claim = await httpPostJson(
      'http://127.0.0.1:' + port + '/api/workqueue/claim-next',
      { agentId: 'agent-1', queues: ['dev-team'], leaseMs: 60000 },
      { Cookie: 'clawnsole_auth=' + cookie + '; clawnsole_role=admin' }
    );
    assert.equal(claim.status, 200);
    assert.equal(claim.json?.ok, true);
    assert.equal(claim.json?.item?.claimedBy, 'agent-1');

    const itemId = claim.json.item.id;

    const progress = await httpPostJson(
      'http://127.0.0.1:' + port + '/api/workqueue/transition',
      { itemId, agentId: 'agent-1', status: 'in_progress', note: 'working', leaseMs: 60000 },
      { Cookie: 'clawnsole_auth=' + cookie + '; clawnsole_role=admin' }
    );
    assert.equal(progress.status, 200);
    assert.equal(progress.json?.ok, true);
    assert.equal(progress.json?.item?.status, 'in_progress');
    assert.equal(progress.json?.item?.lastNote, 'working');

    const done = await httpPostJson(
      'http://127.0.0.1:' + port + '/api/workqueue/transition',
      { itemId, agentId: 'agent-1', status: 'done', result: { ok: true } },
      { Cookie: 'clawnsole_auth=' + cookie + '; clawnsole_role=admin' }
    );
    assert.equal(done.status, 200);
    assert.equal(done.json?.ok, true);
    assert.equal(done.json?.item?.status, 'done');
    assert.deepEqual(done.json?.item?.result, { ok: true });
  } finally {
    server.close();
  }
});
