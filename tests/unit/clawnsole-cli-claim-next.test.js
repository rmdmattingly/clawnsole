const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function tempHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-cli-'));
}

function run(args, env = {}) {
  const bin = path.join(__dirname, '..', '..', 'bin', 'clawnsole.js');
  const out = execFileSync('node', [bin, ...args], {
    env: { ...process.env, ...env },
    encoding: 'utf8'
  });
  return out;
}

test('clawnsole workqueue claim-next: when --queues omitted uses assignments for agent', () => {
  const home = tempHome();
  const env = { OPENCLAW_HOME: path.join(home, '.openclaw') };

  // Create two items in different queues.
  run(['workqueue', 'enqueue', '--queue', 'dev-team', '--title', 'a', '--instructions', 'x', '--priority', '0'], env);
  run(['workqueue', 'enqueue', '--queue', 'qa', '--title', 'b', '--instructions', 'y', '--priority', '5'], env);

  // Assign agent to only qa.
  run(['workqueue', 'assignments', 'set', '--agent', 'agent-1', '--queues', 'qa'], env);

  const claimOut = run(['workqueue', 'claim-next', '--agent', 'agent-1'], env);
  const claimJson = JSON.parse(claimOut);
  assert.equal(claimJson.ok, true);
  assert.ok(claimJson.item);
  assert.equal(claimJson.item.queue, 'qa');
});

test("clawnsole workqueue claim-next: returns {ok:true,item:null,reason:'NO_QUEUES'} when no queues resolve", () => {
  const home = tempHome();
  const env = {
    OPENCLAW_HOME: path.join(home, '.openclaw'),
    CLAWNSOLE_DEFAULT_QUEUES: ''
  };

  const claimOut = run(['workqueue', 'claim-next', '--agent', 'agent-1'], env);
  const claimJson = JSON.parse(claimOut);
  assert.equal(claimJson.ok, true);
  assert.equal(claimJson.item, null);
  assert.equal(claimJson.reason, 'NO_QUEUES');
});
