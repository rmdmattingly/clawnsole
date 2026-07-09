const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const { startTestEnv, loginAdmin, attachConsoleErrorAsserts, addPane } = require('./_helpers');

let env;

test.beforeAll(async () => {
  env = await startTestEnv();
});

test.afterAll(() => {
  env?.stop?.();
});

test.afterEach(async ({ page }) => {
  if (page.__consoleAsserts) {
    page.__consoleAsserts.assertNoErrors();
  }
});

function seedAgentsForWorkqueuePicker() {
  const configPath = path.join(env.tempHome, '.openclaw', 'openclaw.json');
  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  cfg.agents = {
    ...(cfg.agents || {}),
    list: [
      { id: 'main', name: 'main' },
      { id: 'dev', name: 'Dev' },
      { id: 'dev-2', name: 'Dev-2' }
    ]
  };
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
}

function seedLegacyDuplicateWorkqueueItems(queue) {
  const dir = path.join(env.tempHome, '.openclaw', 'clawnsole');
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date();
  const iso = (offsetMs) => new Date(now.getTime() + offsetMs).toISOString();
  const mkItem = (id, patch = {}) => ({
    id,
    queue,
    title: '[issue] rmdmattingly/clawnsole#290 duplicate health',
    instructions: 'Repo: rmdmattingly/clawnsole\nIssue: https://github.com/rmdmattingly/clawnsole/issues/290',
    priority: 10,
    status: 'ready',
    claimedBy: '',
    claimedAt: '',
    leaseUntil: 0,
    attempts: 0,
    lastError: '',
    createdAt: iso(-60000),
    updatedAt: iso(-60000),
    dedupeKey: 'legacy-freeform-key-' + id,
    ...patch
  });

  const data = {
    version: 1,
    queues: { [queue]: { name: queue, createdAt: iso(-120000) } },
    assignments: {},
    items: [
      mkItem('legacy-dup-low', { priority: 5, updatedAt: iso(-30000) }),
      mkItem('legacy-dup-keep', { priority: 50, updatedAt: iso(-20000) }),
      mkItem('legacy-dup-pending', { priority: 1, status: 'pending', updatedAt: iso(-10000) }),
      mkItem('legacy-other-issue', {
        title: '[issue] rmdmattingly/clawnsole#291 unrelated',
        instructions: 'https://github.com/rmdmattingly/clawnsole/issues/291',
        dedupeKey: 'legacy-other-issue'
      })
    ]
  };
  fs.writeFileSync(path.join(dir, 'work-queues.json'), JSON.stringify(data, null, 2));
}

function seedLegacyIssueTitleVariants(queue) {
  const dir = path.join(env.tempHome, '.openclaw', 'clawnsole');
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date();
  const iso = (offsetMs) => new Date(now.getTime() + offsetMs).toISOString();
  const mkItem = (id, title, offsetMs) => ({
    id,
    queue,
    title,
    instructions: 'Repo: rmdmattingly/clawnsole\nIssue: #280',
    priority: 10,
    status: 'ready',
    claimedBy: '',
    claimedAt: '',
    leaseUntil: 0,
    attempts: 0,
    lastError: '',
    createdAt: iso(offsetMs),
    updatedAt: iso(offsetMs),
    dedupeKey: `legacy-title-variant-${id}`
  });

  const data = {
    version: 1,
    queues: { [queue]: { name: queue, createdAt: iso(-120000) } },
    assignments: {},
    items: [
      mkItem('legacy-title-a', '[issue] rmdmattingly/clawnsole#280 Normalize row titles', -30000),
      mkItem('legacy-title-b', 'Open issue: Normalize row titles', -20000),
      mkItem('legacy-title-c', 'Issue coverage: Normalize row titles', -10000)
    ]
  };
  fs.writeFileSync(path.join(dir, 'work-queues.json'), JSON.stringify(data, null, 2));
}

function seedLongTitleWorkqueueItem(queue, title) {
  const dir = path.join(env.tempHome, '.openclaw', 'clawnsole');
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date();
  const iso = now.toISOString();
  const data = {
    version: 1,
    queues: { [queue]: { name: queue, createdAt: iso } },
    assignments: {},
    items: [
      {
        id: 'long-title-affordance',
        queue,
        title,
        instructions: 'Long title affordance coverage',
        priority: 42,
        status: 'ready',
        claimedBy: '',
        claimedAt: '',
        leaseUntil: 0,
        attempts: 0,
        lastError: '',
        createdAt: iso,
        updatedAt: iso,
        dedupeKey: 'long-title-affordance'
      }
    ]
  };
  fs.writeFileSync(path.join(dir, 'work-queues.json'), JSON.stringify(data, null, 2));
}

test('workqueue pane: renders + has queue dropdown + does not show chat composer', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  await addPane(page, 'Workqueue pane');

  const panes = page.locator('[data-pane]');
  const wqPane = panes.last();

  await expect(wqPane.locator('.wq-pane')).toHaveCount(1);
  await expect(wqPane.locator('[data-wq-queue-search]')).toBeVisible();
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeVisible();

  // Header target should describe queue context (not agent).
  await expect(wqPane.locator('[data-pane-target-label]')).toHaveText('Queue');

  // Refreshing agent list should not flip the workqueue header back to Agent.
  await page.getByLabel('Refresh agent list').click();
  await expect(wqPane.locator('[data-pane-target-label]')).toHaveText('Queue');

  // Workqueue pane should not render the chat composer UI.
  await expect(wqPane.locator('.chat-input-row')).toBeHidden();
  await expect(wqPane.locator('[data-pane-input]')).toBeHidden();
});

test('workqueue pane: pane grid label switches from chat-only to generic panes', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await page.addInitScript(() => {
    localStorage.setItem(
      'clawnsole.admin.panes.v1',
      JSON.stringify([{ key: 'ptestchat', kind: 'chat', agentId: 'main' }])
    );
  });

  await loginAdmin(page, env.serverPort);

  const grid = page.getByTestId('pane-grid');
  await expect(grid).toHaveAttribute('aria-label', 'Chat panes');

  await addPane(page, 'Workqueue pane');

  await expect(page.locator('[data-pane-kind="workqueue"]').last()).toBeVisible();
  await expect(grid).toHaveAttribute('aria-label', 'Panes');
});

test('workqueue pane: status filter uses human labels and queue-scoped counts', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const baseUrl = `http://127.0.0.1:${env.serverPort}`;
  const enqueue = async (queue, title) => {
    const res = await page.request.post(`${baseUrl}/api/workqueue/enqueue`, {
      data: {
        queue,
        title,
        instructions: `seed ${title}`,
        priority: 1
      }
    });
    expect(res.ok()).toBeTruthy();
  };

  await enqueue('pane-status-dev', 'pane dev item');
  await enqueue('pane-status-qa', 'pane qa item');

  await addPane(page, 'Workqueue pane');

  const wqPane = page.locator('[data-pane]').last();
  const queueSelect = wqPane.locator('[data-wq-queue-select]');
  const customQueue = wqPane.locator('[data-wq-queue-custom]');
  await queueSelect.selectOption('__custom__');
  await customQueue.fill('pane-status-dev');
  await customQueue.press('Enter');

  await expect(wqPane.locator('[data-wq-statusline]')).toContainText('1 item');
  await wqPane.locator('[data-wq-status-details] summary').click();

  await expect(wqPane.locator('[data-wq-status-options] .wq-status-chip', { hasText: 'In progress (' })).toHaveCount(1);
  await expect(wqPane.locator('[data-wq-status-options] .wq-status-chip', { hasText: 'in_progress' })).toHaveCount(0);
  await expect(wqPane.locator('[data-wq-status-options] .wq-status-chip', { hasText: 'Ready (1)' })).toHaveCount(1);

  await queueSelect.selectOption('__custom__');
  await customQueue.fill('pane-status-qa');
  await customQueue.press('Enter');
  await expect(wqPane.locator('[data-wq-statusline]')).toContainText('1 item');
  await expect(wqPane.locator('[data-wq-status-options] .wq-status-chip', { hasText: 'Ready (1)' })).toHaveCount(1);
});

test('workqueue pane: queue target supports search + recent persistence', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const firstPane = page.locator('[data-pane]').last();
  const search = firstPane.locator('[data-wq-queue-search]');
  const select = firstPane.locator('[data-wq-queue-select]');

  await search.fill('dev');
  const visibleDevOption = select.locator('option:not([hidden])', { hasText: 'dev-team' }).first();
  await expect(visibleDevOption).toHaveCount(1);

  await select.selectOption('__custom__');
  const custom = firstPane.locator('[data-wq-queue-custom]');
  await custom.fill('qa-hotfix');
  await custom.press('Enter');

  await addPane(page, 'Workqueue pane');
  const secondPane = page.locator('[data-pane]').last();
  const secondSelect = secondPane.locator('[data-wq-queue-select]');
  await expect(secondSelect.locator('option', { hasText: '★ qa-hotfix' })).toHaveCount(1);
});

test('workqueue pane: enqueue assignment target supports search, keyboard select, and recents', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  seedAgentsForWorkqueuePicker();
  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const firstPane = page.locator('[data-pane]').last();
  await firstPane.locator('details.wq-enqueue summary').click();

  const pickerSearch = firstPane.locator('[data-wq-claim-agent-search]');
  const pickerList = firstPane.locator('[data-wq-claim-agent-list]');
  await pickerSearch.fill('dev-2');
  await expect(pickerList.locator('.wq-agent-picker-option')).toHaveCount(1);
  await expect(pickerList.locator('.wq-agent-picker-option')).toContainText('Dev-2');

  await pickerSearch.press('Enter');
  await expect(firstPane.locator('[data-wq-claim-agent]')).toHaveValue('dev-2');

  await pickerSearch.click();

  const recentHeading = firstPane.locator('[data-wq-claim-agent-list] .wq-agent-picker-heading', { hasText: 'Recent' });
  await expect(recentHeading).toBeVisible();
  const firstRecent = firstPane.locator('[data-wq-claim-agent-list] .wq-agent-picker-option').first();
  await expect(firstRecent).toContainText('Dev-2');
  await expect(firstRecent.locator('.wq-agent-picker-badge')).toHaveText('recent');
});

test('workqueue pane: scope filter toggles assigned/unassigned/all deterministically', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const queue = `scope-filter-${Date.now()}`;
  await page.evaluate(async ({ queue }) => {
    const post = async (url, body) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`${url} failed: ${res.status}`);
      const data = await res.json();
      if (!data?.ok) throw new Error(`${url} failed: ${data?.error || 'not ok'}`);
      return data;
    };

    await post('/api/workqueue/enqueue', { queue, title: 'scope a', instructions: 'x', priority: 1 });
    await post('/api/workqueue/enqueue', { queue, title: 'scope b', instructions: 'x', priority: 1 });
    await post('/api/workqueue/enqueue', { queue, title: 'scope c', instructions: 'x', priority: 1 });
    await post('/api/workqueue/claim-next', { agentId: 'main', queues: [queue], leaseMs: 900000 });
  }, { queue });

  const wqPane = page.locator('[data-pane]').last();
  await wqPane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await wqPane.locator('[data-wq-queue-custom]').fill(queue);
  await wqPane.locator('[data-wq-queue-custom]').press('Enter');
  await wqPane.locator('[data-wq-refresh]').click();

  const rows = wqPane.locator('[data-wq-list-body] .wq-row');
  await wqPane.locator('[data-wq-scope="all"]').click();
  await expect(rows).toHaveCount(3);
  await wqPane.locator('[data-wq-scope="assigned"]').click();
  await expect(rows).toHaveCount(1);
  await wqPane.locator('[data-wq-scope="unassigned"]').click();
  await expect(rows).toHaveCount(2);
});

test('workqueue pane: source chips + clawnsole preset filter items without reload', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const pane = page.locator('[data-pane]').last();

  const enqueue = async (title, instructions) => {
    await page.evaluate(async ({ title, instructions }) => {
      await fetch('/api/workqueue/enqueue', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue: 'dev-team', title, instructions, priority: 50 })
      });
    }, { title, instructions });
  };

  await enqueue('[ISSUE] clawnsole issue item', 'https://github.com/rmdmattingly/clawnsole/issues/177');
  await enqueue('[ROUTINE] speechee routine item', 'https://github.com/rmdmattingly/speechee/pull/37');

  await pane.locator('[data-wq-refresh]').click();
  await expect(pane.locator('.wq-row')).toHaveCount(2);

  await pane.locator('[data-wq-source="issue"]').click();
  await expect(pane.locator('.wq-row')).toHaveCount(1);
  await expect(pane.locator('.wq-row .wq-col.title')).toContainText(/clawnsole issue item/i);

  await pane.locator('[data-wq-clear-quick]').click();
  await expect(pane.locator('.wq-row')).toHaveCount(2);

  await pane.locator('[data-wq-preset-clawnsole]').click();
  await expect(pane.locator('.wq-row')).toHaveCount(1);
  await expect(pane.locator('.wq-row .wq-col.title')).toContainText(/clawnsole issue item/i);
});

test('workqueue pane: normalizes mixed legacy issue title prefixes', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  const queue = `title-normalize-${Date.now()}`;
  seedLegacyIssueTitleVariants(queue);
  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const pane = page.locator('[data-pane]').last();
  await pane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await pane.locator('[data-wq-queue-custom]').fill(queue);
  await pane.locator('[data-wq-queue-custom]').press('Enter');

  await expect(pane.locator('.wq-row')).toHaveCount(3);
  await expect(pane.locator('.wq-row .wq-col.title')).toHaveText([
    '[ISSUE] rmdmattingly/clawnsole#280 - Normalize row titles',
    '[ISSUE] rmdmattingly/clawnsole#280 - Normalize row titles',
    '[ISSUE] rmdmattingly/clawnsole#280 - Normalize row titles'
  ]);
});

test('workqueue pane: long table titles keep full-title hover and focus affordance', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  const queue = `long-title-${Date.now()}`;
  const longTitle = '[issue] rmdmattingly/clawnsole#297 UX: Workqueue table readability pass with a deliberately very long synthetic title that should truncate in the row while remaining fully discoverable';
  const displayTitle = '[ISSUE] rmdmattingly/clawnsole#297 - UX: Workqueue table readability pass with a deliberately very long synthetic title that should truncate in the row while remaining fully discoverable';
  seedLongTitleWorkqueueItem(queue, longTitle);
  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await page.setViewportSize({ width: 1280, height: 800 });
  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const pane = page.locator('[data-pane]').last();
  await pane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await pane.locator('[data-wq-queue-custom]').fill(queue);
  await pane.locator('[data-wq-queue-custom]').press('Enter');

  const row = pane.locator('.wq-row').first();
  const title = row.locator('[data-wq-title]');
  await expect(row).toBeVisible();
  await expect(title).toContainText('Workqueue table readability pass');
  await expect(row).toHaveAttribute('title', displayTitle);
  await expect(row).toHaveAttribute('aria-label', `Open workqueue item: ${displayTitle}`);
  await expect(title).toHaveAttribute('title', displayTitle);
  await expect(title).toHaveAttribute('aria-label', displayTitle);

  await row.focus();
  await expect(row).toBeFocused();
  await expect(row).toHaveAttribute('aria-label', `Open workqueue item: ${displayTitle}`);
  expect(await title.evaluate((el) => el.scrollWidth > el.clientWidth)).toBeTruthy();
});

test('workqueue pane: duplicate health summary cleans legacy issue duplicates', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  const queue = `dup-health-${Date.now()}`;
  seedLegacyDuplicateWorkqueueItems(queue);
  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const pane = page.locator('[data-pane]').last();
  await pane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await pane.locator('[data-wq-queue-custom]').fill(queue);
  await pane.locator('[data-wq-queue-custom]').press('Enter');
  await expect(pane.locator('[data-wq-statusline]')).toContainText('4 item');

  const duplicateHealth = pane.locator('[data-wq-duplicate-health]');
  await expect(duplicateHealth).toBeVisible();
  await expect(duplicateHealth).toContainText('Duplicates:');
  await expect(duplicateHealth).toContainText('2 rows across 1 issue');

  page.once('dialog', (dialog) => dialog.accept());
  await duplicateHealth.locator('[data-wq-clean-duplicates]').click();
  await expect(duplicateHealth).toBeHidden();

  const res = await page.request.get(`http://127.0.0.1:${env.serverPort}/api/workqueue/items?queue=${encodeURIComponent(queue)}`);
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  const issue290 = data.items.filter((it) => String(it.instructions || '').includes('/issues/290'));
  expect(issue290.filter((it) => it.status !== 'failed')).toHaveLength(1);
  expect(issue290.find((it) => it.id === 'legacy-dup-keep')?.status).toBe('ready');
  expect(issue290.filter((it) => it.status === 'failed').every((it) => String(it.lastError || '').includes('duplicate-cleanup:rmdmattingly/clawnsole#290'))).toBeTruthy();
});

test('workqueue pane: controls toolbar is sticky and list scrolls independently', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const wqPane = page.locator('[data-pane]').last();
  const toolbar = wqPane.locator('.wq-pane .wq-toolbar');
  const listBody = wqPane.locator('.wq-pane [data-wq-list-body]').first();

  await expect(toolbar).toBeVisible();
  await expect(listBody).toHaveCount(1);

  const itemsResP = page.waitForResponse((res) => res.url().includes('/api/workqueue/items') && res.ok(), { timeout: 15000 });
  await wqPane.locator('[data-wq-refresh]').click();
  await itemsResP;

  const styles = await toolbar.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      position: cs.position,
      top: cs.top,
      zIndex: cs.zIndex,
      backgroundColor: cs.backgroundColor
    };
  });

  expect(styles.position).toBe('sticky');
  expect(styles.top).toBe('0px');
  expect(Number(styles.zIndex)).toBeGreaterThanOrEqual(5);
  expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');

  const listStyles = await listBody.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return { overflowY: cs.overflowY };
  });
  expect(['auto', 'scroll']).toContain(listStyles.overflowY);
});

test('workqueue pane: large queues render an initial capped slice and load more incrementally', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  const queue = `large-render-${Date.now()}`;
  const stateDir = path.join(env.tempHome, '.openclaw', 'clawnsole');
  fs.mkdirSync(stateDir, { recursive: true });
  const now = new Date().toISOString();
  const items = Array.from({ length: 505 }, (_, ix) => ({
    id: `large-${ix}`,
    queue,
    title: ix === 504 ? 'needle large list item' : `large list item ${String(ix).padStart(3, '0')}`,
    instructions: 'fixture item',
    priority: ix,
    status: 'ready',
    claimedBy: '',
    claimedAt: '',
    leaseUntil: 0,
    attempts: 0,
    lastError: '',
    createdAt: now,
    updatedAt: now,
    meta: { repo: ix === 504 ? 'rmdmattingly/clawnsole' : 'example/other' }
  }));
  fs.writeFileSync(
    path.join(stateDir, 'work-queues.json'),
    JSON.stringify({ version: 1, queues: { [queue]: { name: queue, createdAt: now } }, items, assignments: {} }, null, 2)
  );

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const pane = page.locator('[data-pane]').last();
  await pane.locator('[data-wq-queue-select]').selectOption(queue);

  const refreshResP = page.waitForResponse((res) => res.url().includes('/api/workqueue/items') && res.ok(), { timeout: 15000 });
  await pane.locator('[data-wq-refresh]').click();
  await refreshResP;

  await expect(pane.locator('.wq-row')).toHaveCount(100);
  await expect(pane.locator('[data-wq-load-more]')).toHaveText('Load more (100/505)');

  await pane.locator('[data-wq-load-more]').click();
  await expect(pane.locator('.wq-row')).toHaveCount(200);
  await expect(pane.locator('[data-wq-load-more]')).toHaveText('Load more (200/505)');

  await pane.locator('[data-wq-preset-clawnsole]').click();
  await expect(pane.locator('.wq-row')).toHaveCount(1);
  await expect(pane.locator('.wq-row .wq-col.title')).toContainText('needle large list item');
  await expect(pane.locator('[data-wq-load-more]')).toHaveCount(0);
});
