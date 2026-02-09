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

function httpPostJson(url, { headers = {}, body } = {}) {
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

  enqueueItem(null, { queue: 'dev-team', title: 't1', instructions: 'do1', priority: 1 });
  enqueueItem(null, { queue: 'dev-team', title: 't2', instructions: 'do2', priority: 2 });

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

test('workqueue API: supports enqueue + claim-next + progress + done', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  const { server, port } = await startServer({ openclawHome });
  try {
    const cookie = Buffer.from('admin::test', 'utf8').toString('base64');
    const headers = { Cookie: `clawnsole_auth=${cookie}; clawnsole_role=admin` };

    const enq = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/enqueue`, {
      headers,
      body: { queue: 'dev-team', title: 't1', instructions: 'do1', priority: 2 }
    });
    assert.equal(enq.status, 200);
    assert.equal(enq.json?.ok, true);
    assert.ok(enq.json?.item?.id);

    const claim = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/claim-next`, {
      headers,
      body: { agentId: 'agent-1', queues: ['dev-team'], leaseMs: 60_000 }
    });
    assert.equal(claim.status, 200);
    assert.equal(claim.json?.ok, true);
    assert.equal(claim.json?.item?.claimedBy, 'agent-1');

    const itemId = claim.json.item.id;

    const prog = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/progress`, {
      headers,
      body: { itemId, agentId: 'agent-1', note: 'working', leaseMs: 60_000 }
    });
    assert.equal(prog.status, 200);
    assert.equal(prog.json?.ok, true);
    assert.equal(prog.json?.item?.status, 'in_progress');

    const done = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/done`, {
      headers,
      body: { itemId, agentId: 'agent-1', result: { ok: true }, note: 'done' }
    });
    assert.equal(done.status, 200);
    assert.equal(done.json?.ok, true);
    assert.equal(done.json?.item?.status, 'done');
    assert.deepEqual(done.json?.item?.result, { ok: true });
  } finally {
    server.close();
  }
});

test('workqueue API: supports fail + returns ownership errors', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  enqueueItem(null, { queue: 'dev-team', title: 't1', instructions: 'do1', priority: 1 });

  const { server, port } = await startServer({ openclawHome });
  try {
    const cookie = Buffer.from('admin::test', 'utf8').toString('base64');
    const headers = { Cookie: `clawnsole_auth=${cookie}; clawnsole_role=admin` };

    const badEnq = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/enqueue`, { headers, body: { title: 'x' } });
    assert.equal(badEnq.status, 400);
    assert.ok(badEnq.json?.error);

    const badClaim = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/claim-next`, { headers, body: { queues: ['dev-team'] } });
    assert.equal(badClaim.status, 400);
    assert.ok(badClaim.json?.error);

    const badAssignments = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/assignments`, {
      headers,
      body: { agentId: 'a', queues: [] }
    });
    assert.equal(badAssignments.status, 400);
    assert.ok(badAssignments.json?.error);

    const claim = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/claim-next`, {
      headers,
      body: { agentId: 'agent-1', queues: ['dev-team'], leaseMs: 60_000 }
    });
    const itemId = claim.json.item.id;

    const conflict = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/fail`, {
      headers,
      body: { itemId, agentId: 'agent-2', error: 'nope' }
    });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.json?.error, 'claimed_by_other');

    const fail = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/fail`, {
      headers,
      body: { itemId, agentId: 'agent-1', error: 'boom', note: 'failed' }
    });
    assert.equal(fail.status, 200);
    assert.equal(fail.json?.ok, true);
    assert.equal(fail.json?.item?.status, 'failed');
    assert.equal(fail.json?.item?.lastError, 'boom');
  } finally {
    server.close();
  }
});

test('workqueue API claim-next: when queues omitted falls back to defaults', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  enqueueItem(null, { queue: 'dev-team', title: 't', instructions: 'do', priority: 1 });

  const { server, port } = await startServer({ openclawHome });
  try {
    const cookie = { Cookie: adminCookie() };
    const claim = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/claim-next`, { agentId: 'agent-1' }, cookie);
    assert.equal(claim.status, 200);
    assert.equal(claim.json?.ok, true);
    assert.ok(claim.json?.item);
    assert.equal(claim.json?.item?.queue, 'dev-team');
    assert.equal(claim.json?.queuesSource, 'default');
  } finally {
    server.close();
  }
});

test('workqueue API claim-next: when queues omitted uses assignments for agent', async () => {
  const { openclawHome } = mkTempEnv();
  fs.mkdirSync(openclawHome, { recursive: true });
  fs.writeFileSync(path.join(openclawHome, 'clawnsole.json'), JSON.stringify({ adminPassword: 'admin', authVersion: 'test' }));

  enqueueItem(null, { queue: 'dev-team', title: 'a', instructions: 'x', priority: 0 });
  enqueueItem(null, { queue: 'qa', title: 'b', instructions: 'y', priority: 5 });

  const { server, port } = await startServer({ openclawHome });
  try {
    const cookie = { Cookie: adminCookie() };

    const set = await httpPostJson(
      `http://127.0.0.1:${port}/api/workqueue/assignments`,
      { agentId: 'agent-1', queues: ['qa'] },
      cookie
    );
    assert.equal(set.status, 200);
    assert.equal(set.json?.ok, true);

    const claim = await httpPostJson(`http://127.0.0.1:${port}/api/workqueue/claim-next`, { agentId: 'agent-1' }, cookie);
    assert.equal(claim.status, 200);
    assert.equal(claim.json?.ok, true);
    assert.ok(claim.json?.item);
    assert.equal(claim.json?.item?.queue, 'qa');
    assert.equal(claim.json?.queuesSource, 'assignment');

    const list = await httpGetJson(`http://127.0.0.1:${port}/api/workqueue/assignments`, cookie);
    assert.equal(list.status, 200);
    assert.equal(list.json?.ok, true);
    assert.deepEqual(list.json?.assignments?.['agent-1'], ['qa']);
  } finally {
    server.close();
  }
});
