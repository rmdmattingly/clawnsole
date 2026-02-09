const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { saveState, loadState, resolveClaimQueues } = require('../../lib/workqueue');

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-wq-resolve-'));
}

test('resolveClaimQueues: prefers explicitly-requested queues', () => {
  const root = tempRoot();
  const resolved = resolveClaimQueues(root, {
    agentId: 'agent-1',
    requestedQueues: [' qa ', '', 'dev-team'],
    defaultQueues: ['dev-team']
  });
  assert.deepEqual(resolved.queues, ['qa', 'dev-team']);
  assert.equal(resolved.source, 'requested');
});

test('resolveClaimQueues: uses assignments when queues omitted', () => {
  const root = tempRoot();
  const state = loadState(root);
  state.assignments = { 'agent-1': ['dev-team', 'qa'] };
  saveState(root, state);

  const resolved = resolveClaimQueues(root, {
    agentId: 'agent-1',
    requestedQueues: [],
    defaultQueues: ['dev-team']
  });
  assert.deepEqual(resolved.queues, ['dev-team', 'qa']);
  assert.equal(resolved.source, 'assignment');
});

test('resolveClaimQueues: falls back to defaults when no assignment', () => {
  const root = tempRoot();
  const resolved = resolveClaimQueues(root, {
    agentId: 'agent-1',
    requestedQueues: [],
    defaultQueues: ['dev-team']
  });
  assert.deepEqual(resolved.queues, ['dev-team']);
  assert.equal(resolved.source, 'default');
});

test('resolveClaimQueues: returns NO_QUEUES when nothing resolves', () => {
  const root = tempRoot();
  const resolved = resolveClaimQueues(root, {
    agentId: 'agent-1',
    requestedQueues: [],
    defaultQueues: []
  });
  assert.deepEqual(resolved.queues, []);
  assert.equal(resolved.reason, 'NO_QUEUES');
});
