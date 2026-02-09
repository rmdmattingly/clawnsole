const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function tempHome() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-cli-'));
  return dir;
}

function run(args, env = {}) {
  const bin = path.join(__dirname, '..', '..', 'bin', 'clawnsole.js');
  const out = execFileSync('node', [bin, ...args], {
    env: { ...process.env, ...env },
    encoding: 'utf8'
  });
  return out;
}

test('clawnsole workqueue assignments set/list prints expected json and normalizes queues', () => {
  const home = tempHome();
  const env = { OPENCLAW_HOME: path.join(home, '.openclaw') };

  const setOut = run(['workqueue', 'assignments', 'set', '--agent', 'agent-1', '--queues', ' dev-team, ,qa  ,dev-team  '], env);
  const setJson = JSON.parse(setOut);
  assert.equal(setJson.ok, true);
  assert.equal(setJson.agentId, 'agent-1');
  assert.deepEqual(setJson.queues, ['dev-team', 'qa', 'dev-team']);

  const listOut = run(['workqueue', 'assignments', 'list'], env);
  const listJson = JSON.parse(listOut);
  assert.equal(listJson.ok, true);
  assert.deepEqual(listJson.assignments['agent-1'], ['dev-team', 'qa', 'dev-team']);
});

test('clawnsole workqueue assignments set requires non-empty queues', () => {
  const home = tempHome();
  const env = { OPENCLAW_HOME: path.join(home, '.openclaw') };

  assert.throws(
    () => run(['workqueue', 'assignments', 'set', '--agent', 'agent-1', '--queues', ' ,  '], env),
    /assignments set requires --queues/
  );
});
