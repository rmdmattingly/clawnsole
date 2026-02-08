const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');

const { createClawnsoleServer } = require('../../clawnsole-server');
const { enqueueItem } = require('../../lib/workqueue');

function mkTempHome() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-wq-api-'));
  process.env.HOME = dir;
  return dir;
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

function startServer() {
  return new Promise((resolve) => {
    const { server } = createClawnsoleServer({ portRaw: 0 });
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = addr && typeof addr === 'object' ? addr.port : null;
      resolve({ server, port });
    });
  });
}

test('workqueue API: requires auth', async () => {
  mkTempHome();
  enqueueItem(null, { queue: 'dev-team', title: 't', instructions: 'do', priority: 1 });

  const { server, port } = await startServer();
  try {
    const res = await httpGetJson(`http://127.0.0.1:${port}/api/workqueue/items?queue=dev-team`);
    assert.equal(res.status, 401);
    assert.equal(res.json?.error, 'unauthorized');
  } finally {
    server.close();
  }
});

test('workqueue API: lists items for admin cookie', async () => {
  const home = mkTempHome();
  // Create minimal clawnsole config.
  const cfgDir = path.join(home, '.openclaw');
  fs.mkdirSync(cfgDir, { recursive: true });
  fs.writeFileSync(path.join(cfgDir, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  enqueueItem(null, { queue: 'dev-team', title: 't1', instructions: 'do1', priority: 1 });
  enqueueItem(null, { queue: 'dev-team', title: 't2', instructions: 'do2', priority: 2 });

  const { server, port } = await startServer();
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
  const home = mkTempHome();
  const cfgDir = path.join(home, '.openclaw');
  fs.mkdirSync(cfgDir, { recursive: true });
  fs.writeFileSync(path.join(cfgDir, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

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
