const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { loadAssignments, saveAssignments, resolveQueuesForAgent } = require('../../lib/workqueue-assignments');

function tempHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-assign-'));
}

test('workqueue-assignments: load normalizes missing/invalid fields', () => {
  const home = tempHome();
  const prev = process.env.OPENCLAW_HOME;
  process.env.OPENCLAW_HOME = home;

  try {
    const a = loadAssignments();
    assert.equal(a.version, 1);
    assert.deepEqual(a.agents, {});
    assert.deepEqual(a.defaults, { queues: [] });

    // Write junk and ensure we still normalize.
    const dir = path.join(home, 'clawnsole');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'work-queue-assignments.json'), '{not json', 'utf8');

    const b = loadAssignments();
    assert.equal(b.version, 1);
    assert.deepEqual(b.agents, {});
    assert.deepEqual(b.defaults, { queues: [] });
  } finally {
    if (prev === undefined) delete process.env.OPENCLAW_HOME;
    else process.env.OPENCLAW_HOME = prev;
  }
});

test('workqueue-assignments: save+load roundtrip normalizes queues', () => {
  const home = tempHome();
  const prev = process.env.OPENCLAW_HOME;
  process.env.OPENCLAW_HOME = home;

  try {
    saveAssignments(null, {
      version: 999,
      agents: {
        'dev-2': { queues: [' dev-team ', '', 'prod'] },
        'bad': { queues: 'nope' }
      },
      defaults: { queues: ['  ', 'qa'] }
    });

    const a = loadAssignments();
    assert.equal(a.version, 1);
    assert.deepEqual(a.agents['dev-2'].queues, ['dev-team', 'prod']);
    assert.deepEqual(a.agents.bad.queues, []);
    assert.deepEqual(a.defaults.queues, ['qa']);
  } finally {
    if (prev === undefined) delete process.env.OPENCLAW_HOME;
    else process.env.OPENCLAW_HOME = prev;
  }
});

test('workqueue-assignments: resolveQueuesForAgent uses agent override then defaults then param fallback', () => {
  const home = tempHome();
  const prev = process.env.OPENCLAW_HOME;
  process.env.OPENCLAW_HOME = home;

  try {
    // With no file -> param fallback
    assert.deepEqual(resolveQueuesForAgent('a1', { defaultQueues: ['x'] }), ['x']);

    // With defaults
    saveAssignments(null, { defaults: { queues: ['d'] } });
    assert.deepEqual(resolveQueuesForAgent('a1', { defaultQueues: ['x'] }), ['d']);

    // With per-agent override
    saveAssignments(null, { agents: { a1: { queues: ['q1', 'q2'] } }, defaults: { queues: ['d'] } });
    assert.deepEqual(resolveQueuesForAgent('a1', { defaultQueues: ['x'] }), ['q1', 'q2']);

    // Unknown agent falls back to defaults
    assert.deepEqual(resolveQueuesForAgent('nope', { defaultQueues: ['x'] }), ['d']);
  } finally {
    if (prev === undefined) delete process.env.OPENCLAW_HOME;
    else process.env.OPENCLAW_HOME = prev;
  }
});
