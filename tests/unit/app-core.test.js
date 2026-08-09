const test = require('node:test');
const assert = require('node:assert/strict');

const {
  escapeHtml,
  fmtRemaining,
  formatWorkqueueIssueTitle,
  summarizeExactWorkqueueDuplicateRows,
  sortWorkqueueItems,
  inferPaneCols,
  normalizePaneKind,
  normalizeAdminDestination,
  paneNeedsAttention,
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

test('normalizeAdminDestination accepts only fresh same-origin admin destinations', () => {
  const origin = 'https://clawnsole.test';
  const now = 2_000_000;

  assert.deepEqual(
    normalizeAdminDestination(
      { href: '/admin?pane=workqueue#item-1', activePaneKey: 'pabc', createdAt: now - 1000 },
      { origin, now }
    ),
    { ok: true, href: '/admin?pane=workqueue#item-1', activePaneKey: 'pabc' }
  );

  assert.equal(
    normalizeAdminDestination({ href: 'https://evil.test/admin', createdAt: now }, { origin, now }).reason,
    'external'
  );
  assert.equal(
    normalizeAdminDestination({ href: '/settings', createdAt: now }, { origin, now }).reason,
    'outside_admin'
  );
  assert.equal(
    normalizeAdminDestination({ href: '/admin', createdAt: now - 700_000 }, { origin, now, ttlMs: 600_000 }).reason,
    'stale'
  );
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

test('formatWorkqueueIssueTitle normalizes mixed legacy issue prefixes', () => {
  const base = {
    queue: 'dev-team',
    instructions: 'Repo: rmdmattingly/clawnsole\nIssue: #280'
  };

  assert.equal(
    formatWorkqueueIssueTitle({
      ...base,
      title: '[issue] rmdmattingly/clawnsole#280 UX: Normalize issue-backed Workqueue row titles'
    }),
    '[ISSUE] rmdmattingly/clawnsole#280 - UX: Normalize issue-backed Workqueue row titles'
  );
  assert.equal(
    formatWorkqueueIssueTitle({
      ...base,
      title: 'Open issue: UX: Normalize issue-backed Workqueue row titles'
    }),
    '[ISSUE] rmdmattingly/clawnsole#280 - UX: Normalize issue-backed Workqueue row titles'
  );
  assert.equal(
    formatWorkqueueIssueTitle({
      ...base,
      title: 'Issue coverage: UX: Normalize issue-backed Workqueue row titles'
    }),
    '[ISSUE] rmdmattingly/clawnsole#280 - UX: Normalize issue-backed Workqueue row titles'
  );
});

test('sortWorkqueueItems title sort uses normalized issue display titles', () => {
  const items = [
    {
      id: 'b',
      title: 'Open issue: Beta',
      instructions: 'Repo: rmdmattingly/clawnsole\nIssue: #281'
    },
    {
      id: 'a',
      title: '[issue] rmdmattingly/clawnsole#280 Alpha',
      instructions: 'Repo: rmdmattingly/clawnsole\nIssue: #280'
    }
  ];

  const sorted = sortWorkqueueItems(items, { sortKey: 'title', sortDir: 'asc' });
  assert.deepEqual(sorted.map((it) => it.id), ['a', 'b']);
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

test('summarizeExactWorkqueueDuplicateRows collapses same dedupe key title and status only', () => {
  const items = [
    {
      id: 'a',
      title: 'Open issue: Duplicate health',
      status: 'ready',
      updatedAt: '2026-01-01T00:00:00Z',
      meta: { dedupeKey: 'rmdmattingly/clawnsole#348', repo: 'rmdmattingly/clawnsole', issueNumber: 348 }
    },
    {
      id: 'b',
      title: '[issue] rmdmattingly/clawnsole#348 Duplicate health',
      status: 'ready',
      updatedAt: '2026-01-02T00:00:00Z',
      meta: { dedupeKey: 'rmdmattingly/clawnsole#348', repo: 'rmdmattingly/clawnsole', issueNumber: 348 }
    },
    {
      id: 'c',
      title: 'Open issue: Duplicate health',
      status: 'claimed',
      meta: { dedupeKey: 'rmdmattingly/clawnsole#348', repo: 'rmdmattingly/clawnsole', issueNumber: 348 }
    },
    {
      id: 'd',
      title: 'Open issue: Different title',
      status: 'ready',
      meta: { dedupeKey: 'rmdmattingly/clawnsole#348', repo: 'rmdmattingly/clawnsole', issueNumber: 348 }
    },
    {
      id: 'e',
      title: 'No dedupe key',
      status: 'ready'
    }
  ];

  const rows = summarizeExactWorkqueueDuplicateRows(items);
  assert.deepEqual(rows.map((row) => row.kind), ['exact_duplicate', 'item', 'item', 'item']);
  assert.deepEqual(rows[0].items.map((item) => item.id), ['b', 'a']);
  assert.equal(rows[0].representative.id, 'b');
  assert.equal(rows[0].count, 2);
  assert.equal(rows[0].dedupeKey, 'rmdmattingly/clawnsole#348');
  assert.deepEqual(rows.slice(1).map((row) => row.item.id), ['c', 'd', 'e']);
});

test('summarizeExactWorkqueueDuplicateRows falls back to normalized title and status', () => {
  const items = [
    {
      id: 'a',
      title: '  Repeat   title  ',
      status: 'ready',
      updatedAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 'b',
      title: 'repeat title',
      status: 'ready',
      updatedAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 'c',
      title: 'repeat title',
      status: 'done',
      updatedAt: '2026-01-03T00:00:00Z'
    }
  ];

  const rows = summarizeExactWorkqueueDuplicateRows(items);
  assert.deepEqual(rows.map((row) => row.kind), ['exact_duplicate', 'item']);
  assert.deepEqual(rows[0].items.map((item) => item.id), ['a', 'b']);
  assert.equal(rows[0].representative.id, 'a');
  assert.equal(rows[0].count, 2);
  assert.equal(rows[0].dedupeKey, '');
  assert.equal(rows[1].item.id, 'c');
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
    authState: 'signed_in',
    startAgentAutoRefresh: true,
    stopAgentAutoRefresh: false,
    rolePillText: 'Signed in - Admin - local',
    rolePillAdmin: true,
    rolePillLocked: false,
    rolePillSignedOut: false,
    rolePillActionLabel: 'Open session details',
    rolePillTooltip: 'Session context: signed in as Admin in local. Click for session details.',
    authLabel: 'Signed in',
    principalLabel: 'Admin',
    environmentLabel: 'local',
    showAdminControls: true,
    authActionText: 'Logout',
    authActionLabel: 'Log out',
    logoutEnabled: true,
    logoutOpacity: '1'
  });

  assert.equal(deriveAuthOverlayState({ authed: false, role: 'admin' }).startAgentAutoRefresh, false);
  assert.equal(deriveAuthOverlayState({ authed: false, role: 'admin' }).rolePillText, 'Locked');
  assert.equal(deriveAuthOverlayState({ authed: false, role: 'admin' }).showAdminControls, false);
  assert.equal(deriveAuthOverlayState({ authed: false, role: 'admin' }).authActionText, 'Unlock');
  assert.equal(deriveAuthOverlayState({ authed: true, role: 'guest', environment: 'qa' }).rolePillText, 'Signed in - Guest - qa');
  assert.equal(deriveAuthOverlayState({ authed: false, role: 'guest' }).logoutOpacity, '1');
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
    {
      state: 'reconnecting',
      meta: '1 connected · 1 disconnected · 1 attention',
      connectedCount: 1,
      disconnectedCount: 1,
      unreadCount: 0,
      attentionCount: 1,
      total: 2,
      ariaLabel: '1 of 2 panes connected; 1 disconnected; 0 unread items; 1 pane needs attention'
    }
  );

  assert.deepEqual(
    deriveGlobalConnectionState({
      authed: true,
      panes: [
        { connected: false, statusState: 'error', statusMeta: 'auth expired' },
        { connected: false, statusState: 'error', statusMeta: 'gateway disconnected' }
      ]
    }),
    {
      state: 'error',
      meta: '0 connected · 2 disconnected · 2 attention',
      connectedCount: 0,
      disconnectedCount: 2,
      unreadCount: 0,
      attentionCount: 2,
      total: 2,
      ariaLabel: '0 of 2 panes connected; 2 disconnected; 0 unread items; 2 panes need attention'
    }
  );
});

test('deriveGlobalConnectionState counts unread attention for screen readers', () => {
  assert.equal(paneNeedsAttention({ connected: true, statusState: 'connected', unreadCount: 0 }), false);
  assert.equal(paneNeedsAttention({ connected: true, statusState: 'connected', unreadCount: 2 }), true);

  assert.deepEqual(
    deriveGlobalConnectionState({
      authed: true,
      panes: [
        { connected: true, statusState: 'connected', unreadCount: 2 },
        { connected: true, statusState: 'connected', unreadCount: 0 }
      ]
    }),
    {
      state: 'connected',
      meta: '2 connected · 0 disconnected · 1 attention',
      connectedCount: 2,
      disconnectedCount: 0,
      unreadCount: 2,
      attentionCount: 1,
      total: 2,
      ariaLabel: '2 of 2 panes connected; 0 disconnected; 2 unread items; 1 pane needs attention'
    }
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
