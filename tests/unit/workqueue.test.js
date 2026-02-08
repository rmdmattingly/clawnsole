const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { enqueueItem, claimNext, loadState } = require('../../lib/workqueue');

function tempRoot() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-wq-'));
  process.env.OPENCLAW_HOME = dir; // isolate
  return dir;
}

test('workqueue: enqueue + claim-next claims exactly one item', () => {
  tempRoot();

  enqueueItem(null, { queue: 'dev', title: 'a', instructions: 'do a', priority: 0 });
  enqueueItem(null, { queue: 'dev', title: 'b', instructions: 'do b', priority: 0 });

  const first = claimNext(null, { agentId: 'agent-1', queues: ['dev'], leaseMs: 60_000 });
  const second = claimNext(null, { agentId: 'agent-2', queues: ['dev'], leaseMs: 60_000 });

  assert.ok(first);
  assert.ok(second);
  assert.notEqual(first.id, second.id);

  const state = loadState(null);
  const claimed = state.items.filter((it) => it.status === 'claimed');
  assert.equal(claimed.length, 2);
});
