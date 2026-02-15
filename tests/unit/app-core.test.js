const test = require('node:test');
const assert = require('node:assert/strict');

const { escapeHtml, fmtRemaining, sortWorkqueueItems } = require('../../lib/app-core.js');

test('escapeHtml escapes html special chars', () => {
  assert.equal(escapeHtml('<div a="b">Tom & Jerry</div>'), '&lt;div a=&quot;b&quot;&gt;Tom &amp; Jerry&lt;/div&gt;');
  assert.equal(escapeHtml("O'Reilly"), 'O&#39;Reilly');
  assert.equal(escapeHtml(null), '');
});

test('fmtRemaining formats remaining time', () => {
  assert.equal(fmtRemaining(NaN), '');
  assert.equal(fmtRemaining(-1), 'expired');
  assert.equal(fmtRemaining(0), 'expired');
  assert.equal(fmtRemaining(999), '0s');
  assert.equal(fmtRemaining(1000), '1s');
  assert.equal(fmtRemaining(61_000), '1m 1s');
  assert.equal(fmtRemaining(3_600_000), '1h 0m');
  assert.equal(fmtRemaining(3_660_000), '1h 1m');
});

test('sortWorkqueueItems default groups by status then priority then timestamps', () => {
  const items = [
    { id: 'a', status: 'ready', priority: 1, updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'b', status: 'in_progress', priority: 0, updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'c', status: 'claimed', priority: 99, updatedAt: '2026-01-02T00:00:00Z' },
    { id: 'd', status: 'claimed', priority: 5, updatedAt: '2026-01-03T00:00:00Z' },
    { id: 'e', status: 'ready', priority: 10, updatedAt: '2026-01-04T00:00:00Z' }
  ];

  const sorted = sortWorkqueueItems(items);
  assert.deepEqual(sorted.map((it) => it.id), ['b', 'c', 'd', 'e', 'a']);
});

test('sortWorkqueueItems supports explicit sort keys and stable ordering fallback', () => {
  const items = [
    { id: 'a', title: 'b', priority: 1 },
    { id: 'b', title: 'a', priority: 1 },
    { id: 'c', title: 'a', priority: 1 }
  ];

  const byTitleAsc = sortWorkqueueItems(items, { sortKey: 'title', sortDir: 'asc' });
  assert.deepEqual(byTitleAsc.map((it) => it.id), ['b', 'c', 'a']);

  // For ties, preserve input order.
  const byPrio = sortWorkqueueItems(items, { sortKey: 'priority', sortDir: 'desc' });
  assert.deepEqual(byPrio.map((it) => it.id), ['a', 'b', 'c']);
});
