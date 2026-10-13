const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { test } = require('node:test');

const ROOT = path.resolve(__dirname, '..', '..');
const WORKER = path.join(ROOT, 'scripts', 'recurring-prompts-worker.py');
const API_WORKER = path.join(ROOT, 'scripts', 'recurring_prompts_worker.py');

function runWorker(args) {
  return spawnSync('python3', [WORKER, ...args], {
    cwd: ROOT,
    encoding: 'utf8'
  });
}

function parseJsonLines(stdout) {
  return stdout
    .trim()
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function waitForFile(file, timeoutMs = 5000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (fs.existsSync(file)) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`timed out waiting for ${file}`));
        return;
      }
      setTimeout(tick, 25);
    };
    tick();
  });
}

test('recurring prompts worker exits with config error when scheduler is missing', () => {
  const result = runWorker(['--once', '--schedulerJs', path.join(os.tmpdir(), 'missing-recurring-scheduler.js')]);

  assert.equal(result.status, 2);
  const [event] = parseJsonLines(result.stdout);
  assert.equal(event.event, 'config_error');
  assert.match(event.message, /schedulerJs not found/);
});

test('recurring prompts worker retries failed scheduler ticks before succeeding', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-recurring-worker-'));
  const attemptsPath = path.join(dir, 'attempts.json');
  const schedulerPath = path.join(dir, 'scheduler.js');
  fs.writeFileSync(
    schedulerPath,
    `
const fs = require('fs');
const attemptsPath = ${JSON.stringify(attemptsPath)};
let attempts = 0;
try { attempts = JSON.parse(fs.readFileSync(attemptsPath, 'utf8')).attempts || 0; } catch {}
attempts += 1;
fs.writeFileSync(attemptsPath, JSON.stringify({ attempts }));
if (attempts < 2) {
  console.error('temporary scheduler failure');
  process.exit(7);
}
console.log('scheduler ok');
`,
    'utf8'
  );

  const result = runWorker([
    '--once',
    '--schedulerJs',
    schedulerPath,
    '--maxRetries',
    '2',
    '--backoffBaseSeconds',
    '0',
    '--backoffJitterSeconds',
    '0'
  ]);

  assert.equal(result.status, 0, result.stderr);
  const events = parseJsonLines(result.stdout);
  assert.deepEqual(
    events.map((event) => event.event),
    ['tick_retry', 'tick_ok']
  );
  assert.equal(events[0].code, 7);
  assert.match(events[0].output, /temporary scheduler failure/);
  assert.equal(events[1].attempt, 1);
  assert.match(events[1].output, /scheduler ok/);
});

test('recurring prompts API worker polls due prompts and retries trigger with idempotency key', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-recurring-api-worker-'));
  const portPath = path.join(dir, 'port.txt');
  const requestsPath = path.join(dir, 'requests.json');
  const serverPath = path.join(dir, 'server.js');
  const promptId = 'prompt-1';
  const scheduledAt = Date.now() - 60_000;

  fs.writeFileSync(
    serverPath,
    `
const http = require('http');
const fs = require('fs');
let triggerAttempts = 0;
const requests = [];
const requestsPath = ${JSON.stringify(requestsPath)};
const server = http.createServer((req, res) => {
  let raw = '';
  req.on('data', (chunk) => { raw += chunk; });
  req.on('end', () => {
    requests.push({ method: req.method, url: req.url, cookie: req.headers.cookie || '', idempotencyKey: req.headers['idempotency-key'] || '', body: raw });
    fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2));
    if (req.method === 'POST' && req.url === '/auth/login') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': 'clawnsole_admin=ok; Path=/; HttpOnly' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    if (req.method === 'GET' && req.url === '/api/recurring-prompts') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ prompts: [{ id: ${JSON.stringify(promptId)}, enabled: true, nextRunAt: ${scheduledAt}, title: 'Due', message: 'Ship status' }] }));
      return;
    }
    if (req.method === 'POST' && req.url === '/api/recurring-prompts/${promptId}/trigger') {
      triggerAttempts += 1;
      res.writeHead(triggerAttempts === 1 ? 503 : 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(triggerAttempts === 1 ? { ok: false, error: 'temporary gateway error' } : { ok: true, duplicate: false }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found' }));
  });
});
server.listen(0, '127.0.0.1', () => {
  fs.writeFileSync(${JSON.stringify(portPath)}, String(server.address().port));
});
process.on('SIGTERM', () => server.close(() => process.exit(0)));
`,
    'utf8'
  );

  const server = spawn(process.execPath, [serverPath], { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await waitForFile(portPath);
    const baseUrl = `http://127.0.0.1:${fs.readFileSync(portPath, 'utf8')}`;
    const result = spawnSync('python3', [
      API_WORKER,
      '--once',
      '--base-url',
      baseUrl,
      '--admin-password',
      'admin',
      '--retries',
      '1',
      '--backoff',
      '0',
      '--max-backoff',
      '0',
      '--device-label',
      'unit-worker'
    ], {
      cwd: ROOT,
      encoding: 'utf8'
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.deepEqual(JSON.parse(result.stdout), {
      ok: true,
      due: 1,
      delivered: 1,
      duplicates: 0,
      errors: []
    });

    const requests = JSON.parse(fs.readFileSync(requestsPath, 'utf8'));
    const triggerRequests = requests.filter((req) => req.url.endsWith('/trigger'));
    assert.equal(triggerRequests.length, 2);
    assert.equal(triggerRequests[0].idempotencyKey, `${promptId}:${scheduledAt}`);
    assert.equal(triggerRequests[1].idempotencyKey, `${promptId}:${scheduledAt}`);
    assert.match(triggerRequests[0].body, /"deviceLabel": "unit-worker"/);
  } finally {
    server.kill('SIGTERM');
  }
});
