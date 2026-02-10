const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { enqueueItem, claimNext, loadState, saveState, transitionItem } = require('../../lib/workqueue');

function withFakeNow(ms, fn) {
  const realNow = Date.now;
  Date.now = () => ms;
  try {
    return fn();
  } finally {
    Date.now = realNow;
  }
}

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

test('workqueue: priority ordering tie-breaker is FIFO by createdAt', () => {
  const root = tempRoot();

  const first = enqueueItem(root, { queue: 'dev', title: 'first', instructions: 'a', priority: 5 });
  const second = enqueueItem(root, { queue: 'dev', title: 'second', instructions: 'b', priority: 5 });

  // Make ordering deterministic by explicitly setting createdAt.
  const state = loadState(root);
  const a = state.items.find((x) => x.id === first.id);
  const b = state.items.find((x) => x.id === second.id);
  assert.ok(a);
  assert.ok(b);

  a.createdAt = '2026-01-01T00:00:00.000Z';
  b.createdAt = '2026-01-01T00:00:01.000Z';
  saveState(root, state);

  const claimed = claimNext(root, { agentId: 'agent-1', queues: ['dev'], leaseMs: 60_000 });
  assert.ok(claimed);
  assert.equal(claimed.id, first.id);
});

test('workqueue: priority tie-breaker is deterministic when createdAt is equal', () => {
  const root = tempRoot();

  const a = enqueueItem(root, { queue: 'dev', title: 'a', instructions: 'a', priority: 5 });
  const b = enqueueItem(root, { queue: 'dev', title: 'b', instructions: 'b', priority: 5 });

  // Force equal createdAt so the final tie-breaker is exercised.
  const state = loadState(root);
  const ia = state.items.find((x) => x.id === a.id);
  const ib = state.items.find((x) => x.id === b.id);
  assert.ok(ia);
  assert.ok(ib);
  ia.createdAt = '2026-01-01T00:00:00.000Z';
  ib.createdAt = '2026-01-01T00:00:00.000Z';
  saveState(root, state);

  const claimed = claimNext(root, { agentId: 'agent-1', queues: ['dev'], leaseMs: 60_000 });
  assert.ok(claimed);

  const expected = String(a.id).localeCompare(String(b.id)) <= 0 ? a.id : b.id;
  assert.equal(claimed.id, expected);
});

test('workqueue: claim-next considers all requested queues when ordering', () => {
  const root = tempRoot();

  const low = enqueueItem(root, { queue: 'a', title: 'low', instructions: 'l', priority: 1 });
  const high = enqueueItem(root, { queue: 'b', title: 'high', instructions: 'h', priority: 10 });

  const claimed = claimNext(root, { agentId: 'agent-1', queues: ['a', 'b'], leaseMs: 60_000 });
  assert.ok(claimed);
  assert.equal(claimed.id, high.id);

  const claimed2 = claimNext(root, { agentId: 'agent-2', queues: ['a', 'b'], leaseMs: 60_000 });
  assert.ok(claimed2);
  assert.equal(claimed2.id, low.id);
});

test('workqueue: lease expiry reaps claimed items back to ready', () => {
  withFakeNow(1_700_000_000_000, () => {
    const root = tempRoot();

    const item = enqueueItem(root, { queue: 'dev', title: 'a', instructions: 'x', priority: 0 });

    // Claim with a short lease, then force-expire by editing state.
    const claimed = claimNext(root, { agentId: 'agent-1', queues: ['dev'], leaseMs: 1 });
    assert.ok(claimed);
    assert.equal(claimed.id, item.id);

    const state = loadState(root);
    const it = state.items.find((x) => x.id === item.id);
    assert.ok(it);
    it.leaseUntil = 1_700_000_000_000 - 1; // expired relative to fake now
    saveState(root, state);

    // Next claim should reap the expired lease and allow a new agent to claim.
    const reclaimed = claimNext(root, { agentId: 'agent-2', queues: ['dev'], leaseMs: 60_000 });
    assert.ok(reclaimed);
    assert.equal(reclaimed.id, item.id);
    assert.equal(reclaimed.claimedBy, 'agent-2');
  });
});

test('workqueue: lease expiry reaps in_progress items back to ready', () => {
  withFakeNow(1_700_000_000_000, () => {
    const root = tempRoot();

    const item = enqueueItem(root, { queue: 'dev', title: 'a', instructions: 'x', priority: 0 });
    const claimed = claimNext(root, { agentId: 'agent-1', queues: ['dev'], leaseMs: 60_000 });
    assert.ok(claimed);
    assert.equal(claimed.id, item.id);

    // Move to in_progress and then force-expire by editing state.
    transitionItem(root, { itemId: item.id, agentId: 'agent-1', status: 'in_progress', note: 'working' });

    const state = loadState(root);
    const it = state.items.find((x) => x.id === item.id);
    assert.ok(it);
    assert.equal(it.status, 'in_progress');
    it.leaseUntil = 1_700_000_000_000 - 1; // expired relative to fake now
    saveState(root, state);

    const reclaimed = claimNext(root, { agentId: 'agent-2', queues: ['dev'], leaseMs: 60_000 });
    assert.ok(reclaimed);
    assert.equal(reclaimed.id, item.id);
    assert.equal(reclaimed.claimedBy, 'agent-2');
  });
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

  assert.throws(
    () => transitionItem(root, { itemId: claimed.id, agentId: 'agent-2', status: 'in_progress', note: 'yoink' }),
    (err) => err && err.code === 'CLAIMED_BY_OTHER'
  );

  const done = transitionItem(root, { itemId: claimed.id, agentId: 'agent-1', status: 'done', result: { ok: true } });
  assert.equal(done.status, 'done');
});

test('workqueue: progress/terminal transitions require an explicit claim', () => {
  const root = tempRoot();

  const item = enqueueItem(root, { queue: 'dev', title: 'a', instructions: 'x', priority: 0 });

  assert.throws(
    () => transitionItem(root, { itemId: item.id, agentId: 'agent-1', status: 'in_progress', note: 'starting' }),
    (err) => err && err.code === 'NOT_CLAIMED'
  );

  assert.throws(
    () => transitionItem(root, { itemId: item.id, agentId: 'agent-1', status: 'done', result: { ok: true } }),
    (err) => err && err.code === 'NOT_CLAIMED'
  );

  assert.throws(
    () => transitionItem(root, { itemId: item.id, agentId: 'agent-1', status: 'failed', error: 'nope' }),
    (err) => err && err.code === 'NOT_CLAIMED'
  );
});

test('workqueue: claim-next treats pending as ready', () => {
  const root = tempRoot();

  const item = enqueueItem(root, { queue: 'dev', title: 'a', instructions: 'x', priority: 0 });

  // Force status to pending.
  const state = loadState(root);
  const it = state.items.find((x) => x.id === item.id);
  assert.ok(it);
  it.status = 'pending';
  saveState(root, state);

  const claimed = claimNext(root, { agentId: 'agent-1', queues: ['dev'], leaseMs: 60_000 });
  assert.ok(claimed);
  assert.equal(claimed.id, item.id);
  assert.equal(claimed.claimedBy, 'agent-1');
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
