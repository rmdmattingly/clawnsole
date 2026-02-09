const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { enqueueItem, claimNext, loadState, saveState, transitionItem } = require('../../lib/workqueue');

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-wq-'));
}

test('workqueue: enqueue + claim-next claims distinct items', () => {
  const root = tempRoot();

  enqueueItem(root, { queue: 'dev', title: 'a', instructions: 'do a', priority: 0 });
  enqueueItem(root, { queue: 'dev', title: 'b', instructions: 'do b', priority: 0 });

  const first = claimNext(root, { agentId: 'agent-1', queues: ['dev'], leaseMs: 60_000 });
  const second = claimNext(root, { agentId: 'agent-2', queues: ['dev'], leaseMs: 60_000 });

  assert.ok(first);
  assert.ok(second);
  assert.notEqual(first.id, second.id);

  const state = loadState(root);
  const claimed = state.items.filter((it) => it.status === 'claimed');
  assert.equal(claimed.length, 2);
});

test('workqueue: priority ordering (higher priority claimed first)', () => {
  const root = tempRoot();

  const low = enqueueItem(root, { queue: 'dev', title: 'low', instructions: 'l', priority: 0 });
  const high = enqueueItem(root, { queue: 'dev', title: 'high', instructions: 'h', priority: 5 });

  const claimed = claimNext(root, { agentId: 'agent-1', queues: ['dev'], leaseMs: 60_000 });
  assert.ok(claimed);
  assert.equal(claimed.id, high.id);

  const claimed2 = claimNext(root, { agentId: 'agent-2', queues: ['dev'], leaseMs: 60_000 });
  assert.ok(claimed2);
  assert.equal(claimed2.id, low.id);
});

test('workqueue: lease expiry reaps claimed items back to ready', () => {
  const root = tempRoot();

  const item = enqueueItem(root, { queue: 'dev', title: 'a', instructions: 'x', priority: 0 });

  // Claim with a short lease, then force-expire by editing state.
  const claimed = claimNext(root, { agentId: 'agent-1', queues: ['dev'], leaseMs: 1 });
  assert.ok(claimed);
  assert.equal(claimed.id, item.id);

  const state = loadState(root);
  const it = state.items.find((x) => x.id === item.id);
  assert.ok(it);
  it.leaseUntil = Date.now() - 1; // expired
  saveState(root, state);

  // Next claim should reap the expired lease and allow a new agent to claim.
  const reclaimed = claimNext(root, { agentId: 'agent-2', queues: ['dev'], leaseMs: 60_000 });
  assert.ok(reclaimed);
  assert.equal(reclaimed.id, item.id);
  assert.equal(reclaimed.claimedBy, 'agent-2');
});

test('workqueue: claimed-by-other enforced for terminal transitions (done/failed)', () => {
  const root = tempRoot();

  enqueueItem(root, { queue: 'dev', title: 'a', instructions: 'x', priority: 0 });
  const claimed = claimNext(root, { agentId: 'agent-1', queues: ['dev'], leaseMs: 60_000 });
  assert.ok(claimed);

  assert.throws(
    () => transitionItem(root, { itemId: claimed.id, agentId: 'agent-2', status: 'done', result: { ok: true } }),
    (err) => err && err.code === 'CLAIMED_BY_OTHER'
  );

  assert.throws(
    () => transitionItem(root, { itemId: claimed.id, agentId: 'agent-2', status: 'failed', error: 'nope' }),
    (err) => err && err.code === 'CLAIMED_BY_OTHER'
  );

  const done = transitionItem(root, { itemId: claimed.id, agentId: 'agent-1', status: 'done', result: { ok: true } });
  assert.equal(done.status, 'done');
});

test('workqueue: enqueue supports dedupeKey idempotency', () => {
  const root = tempRoot();

  const first = enqueueItem(root, {
    queue: 'dev',
    title: 'Review open PRs',
    instructions: 'review',
    priority: 0,
    dedupeKey: 'hourly-pr-review:2026-02-08T21'
  });

  const second = enqueueItem(root, {
    queue: 'dev',
    title: 'Review open PRs (duplicate)',
    instructions: 'review',
    priority: 0,
    dedupeKey: 'hourly-pr-review:2026-02-08T21'
  });

  assert.equal(second.id, first.id);
  assert.equal(second.queue, first.queue);
  assert.equal(second.dedupeKey, first.dedupeKey);
  assert.equal(second._deduped, true);

  const state = loadState(root);
  assert.equal(state.items.length, 1);
});
