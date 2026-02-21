const test = require('node:test');
const assert = require('node:assert/strict');

const {
  escapeHtml,
  fmtRemaining,
  sortWorkqueueItems,
  inferPaneCols,
  normalizePaneKind,
  deriveAuthOverlayState,
  deriveGlobalConnectionState,
  deriveDisconnectButtonState,
  extractChatText,
  normalizeHistoryEntries
} = require('../../lib/app-core.js');

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

  // For ties without timestamps, preserve input order.
  const byPrio = sortWorkqueueItems(items, { sortKey: 'priority', sortDir: 'desc' });
  assert.deepEqual(byPrio.map((it) => it.id), ['a', 'b', 'c']);
});

test('sortWorkqueueItems priority sort uses updatedAt desc tie-breaker', () => {
  const items = [
    { id: 'a', priority: 10, updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'b', priority: 10, updatedAt: '2026-01-03T00:00:00Z' },
    { id: 'c', priority: 20, updatedAt: '2026-01-02T00:00:00Z' }
  ];

  const sorted = sortWorkqueueItems(items, { sortKey: 'priority', sortDir: 'desc' });
  assert.deepEqual(sorted.map((it) => it.id), ['c', 'b', 'a']);
});

test('inferPaneCols maps pane counts to sensible layout widths', () => {
  assert.equal(inferPaneCols(0), 1);
  assert.equal(inferPaneCols(1), 1);
  assert.equal(inferPaneCols(2), 2);
  assert.equal(inferPaneCols(3), 3);
  assert.equal(inferPaneCols(4), 2);
  assert.equal(inferPaneCols(5), 3);
  assert.equal(inferPaneCols(12), 3);
});

test('normalizePaneKind handles aliases safely', () => {
  assert.equal(normalizePaneKind('chat'), 'chat');
  assert.equal(normalizePaneKind('workqueue'), 'workqueue');
  assert.equal(normalizePaneKind('w'), 'workqueue');
  assert.equal(normalizePaneKind('cron'), 'cron');
  assert.equal(normalizePaneKind('cr'), 'cron');
  assert.equal(normalizePaneKind('timeline'), 'timeline');
  assert.equal(normalizePaneKind('ti'), 'timeline');
  assert.equal(normalizePaneKind('x'), 'chat');
});

test('deriveAuthOverlayState captures auth/role transition flags', () => {
  assert.deepEqual(deriveAuthOverlayState({ authed: true, role: 'admin' }), {
    isAdmin: true,
    startAgentAutoRefresh: true,
    stopAgentAutoRefresh: false,
    rolePillText: 'signed in',
    rolePillAdmin: true,
    showAdminControls: true,
    logoutEnabled: true,
    logoutOpacity: '1'
  });

  assert.equal(deriveAuthOverlayState({ authed: false, role: 'admin' }).startAgentAutoRefresh, false);
  assert.equal(deriveAuthOverlayState({ authed: true, role: 'guest' }).rolePillText, 'guest');
  assert.equal(deriveAuthOverlayState({ authed: false, role: 'guest' }).logoutOpacity, '0.5');
});

test('extractChatText converts attachment/file payloads to markdown links', () => {
  const message = {
    content: [
      { text: 'Hello' },
      { type: 'image_url', image_url: { url: 'https://example.com/photo.png' } },
      { type: 'file', name: 'notes.txt', url: 'https://example.com/notes.txt' }
    ]
  };

  const text = extractChatText(message);
  assert.equal(text.includes('Hello'), true);
  assert.equal(text.includes('![](https://example.com/photo.png)'), true);
  assert.equal(text.includes('[notes.txt](https://example.com/notes.txt)'), true);
});

test('normalizeHistoryEntries supports gateway payload variants', () => {
  const entries = normalizeHistoryEntries({
    items: [
      { role: 'system', text: 'boot' },
      { role: 'assistant', content: [{ text: 'hi' }] },
      { isUser: true, message: { content: [{ text: 'me' }] } }
    ]
  });

  assert.deepEqual(entries, [
    { role: 'system', text: 'boot' },
    { role: 'assistant', text: 'hi' },
    { role: 'user', text: 'me' }
  ]);
});

test('deriveGlobalConnectionState handles signed-out, reconnecting, and hard error transitions', () => {
  assert.deepEqual(deriveGlobalConnectionState({ authed: false, panes: [{ connected: true }] }), {
    state: 'disconnected',
    meta: 'sign in required'
  });

  assert.deepEqual(deriveGlobalConnectionState({ authed: true, panes: [] }), {
    state: 'disconnected',
    meta: ''
  });

  assert.deepEqual(
    deriveGlobalConnectionState({
      authed: true,
      panes: [
        { connected: true, statusState: 'connected' },
        { connected: false, statusState: 'reconnecting' }
      ]
    }),
    { state: 'reconnecting', meta: 'panes: 1/2 connected' }
  );

  assert.deepEqual(
    deriveGlobalConnectionState({
      authed: true,
      panes: [
        { connected: false, statusState: 'error', statusMeta: 'auth expired' },
        { connected: false, statusState: 'error', statusMeta: 'gateway disconnected' }
      ]
    }),
    { state: 'error', meta: 'auth expired' }
  );
});

test('deriveDisconnectButtonState tracks active gateway sessions', () => {
  assert.deepEqual(deriveDisconnectButtonState({ authed: false, panes: [{ statusState: 'connected' }] }), {
    disabled: true,
    text: 'Reconnect'
  });

  assert.deepEqual(deriveDisconnectButtonState({ authed: true, panes: [{ statusState: 'error' }] }), {
    disabled: false,
    text: 'Reconnect'
  });

  assert.deepEqual(deriveDisconnectButtonState({ authed: true, panes: [{ statusState: 'connecting' }] }), {
    disabled: false,
    text: 'Disconnect'
  });
});
