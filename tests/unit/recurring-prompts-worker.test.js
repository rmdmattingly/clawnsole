const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const ROOT = path.resolve(__dirname, '..', '..');
const WORKER = path.join(ROOT, 'scripts', 'recurring-prompts-worker.py');

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
