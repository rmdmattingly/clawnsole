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

function seedFilterSummaryWorkqueueItems(queue) {
  const dir = path.join(env.tempHome, '.openclaw', 'clawnsole');
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date();
  const iso = (offsetMs) => new Date(now.getTime() + offsetMs).toISOString();
  const mkItem = (id, patch = {}) => ({
    id,
    queue,
    title: '[issue] rmdmattingly/clawnsole#323 filter summary',
    instructions: 'Repo: rmdmattingly/clawnsole\nIssue: https://github.com/rmdmattingly/clawnsole/issues/323',
    priority: 10,
    status: 'ready',
    claimedBy: '',
    claimedAt: '',
    leaseUntil: 0,
    attempts: 0,
    lastError: '',
    createdAt: iso(-60000),
    updatedAt: iso(-60000),
    dedupeKey: `filter-summary-${id}`,
    ...patch
  });

  const data = {
    version: 1,
    queues: { [queue]: { name: queue, createdAt: iso(-120000) } },
    assignments: {},
    items: [
      mkItem('summary-clawnsole-ready'),
      mkItem('summary-other-ready', {
        title: '[issue] other/repo#9 alternate repo',
        instructions: 'Repo: other/repo\nIssue: https://github.com/other/repo/issues/9',
        dedupeKey: 'filter-summary-other'
      }),
      mkItem('summary-clawnsole-failed', {
        title: '[issue] rmdmattingly/clawnsole#324 failed row',
        status: 'failed',
        dedupeKey: 'filter-summary-failed'
      })
    ]
  };
  fs.writeFileSync(path.join(dir, 'work-queues.json'), JSON.stringify(data, null, 2));
}

function seedExactDuplicateWorkqueueItems(queue) {
  const dir = path.join(env.tempHome, '.openclaw', 'clawnsole');
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date();
  const iso = (offsetMs) => new Date(now.getTime() + offsetMs).toISOString();
  const title = '[issue] rmdmattingly/clawnsole#348 exact duplicate collapse';
  const mkItem = (id, patch = {}) => ({
    id,
    queue,
    title,
    instructions: 'Repo: rmdmattingly/clawnsole\nIssue: https://github.com/rmdmattingly/clawnsole/issues/348',
    priority: 10,
    status: 'ready',
    claimedBy: '',
    claimedAt: '',
    leaseUntil: 0,
    attempts: 0,
    lastError: '',
    createdAt: iso(-120000),
    updatedAt: iso(-120000),
    dedupeKey: 'rmdmattingly/clawnsole#348',
    ...patch
  });

  const data = {
    version: 1,
    queues: { [queue]: { name: queue, createdAt: iso(-180000) } },
    assignments: {},
    items: [
      mkItem('exact-dup-old', { priority: 20, updatedAt: iso(-90000) }),
      mkItem('exact-dup-latest', { priority: 5, attempts: 2, updatedAt: iso(-10000) }),
      mkItem('exact-dup-different-status', { status: 'pending', updatedAt: iso(-5000) }),
      mkItem('exact-dup-different-title', {
        title: '[issue] rmdmattingly/clawnsole#348 exact duplicate collapse follow-up',
        updatedAt: iso(-3000)
      })
    ]
  };
  fs.writeFileSync(path.join(dir, 'work-queues.json'), JSON.stringify(data, null, 2));
}

function seedLargeRoutineWorkqueueItems(queue) {
  const dir = path.join(env.tempHome, '.openclaw', 'clawnsole');
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date();
  const iso = (offsetMs) => new Date(now.getTime() + offsetMs).toISOString();
  const items = Array.from({ length: 22 }, (_, ix) => ({
    id: `routine-sweep-${ix}`,
    queue,
    title: `[routine] PR review sweep ${ix + 1}`,
    instructions: 'Recurring dev-team PR review sweep',
    priority: ix === 7 ? 99 : 10 + ix,
    status: ix % 3 === 0 ? 'pending' : 'ready',
    claimedBy: ix === 5 ? 'dev-2' : '',
    claimedAt: '',
    leaseUntil: 0,
    attempts: ix,
    lastError: '',
    createdAt: iso(-120000 + ix * 1000),
    updatedAt: iso(-90000 + ix * 1000),
    dedupeKey: 'pr-review:sweep'
  }));

  const data = {
    version: 1,
    queues: { [queue]: { name: queue, createdAt: iso(-180000) } },
    assignments: {},
    items
  };
  fs.writeFileSync(path.join(dir, 'work-queues.json'), JSON.stringify(data, null, 2));
}

test('workqueue pane: queue switch updates pane identity everywhere', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  const queue = `identity-${Date.now()}`;
  await loginAdmin(page, env.serverPort);

  const pane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();
  await expect(pane.getByTestId('pane-type-label')).toHaveText(/^B Workqueue · dev-team$/);

  await pane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await pane.locator('[data-wq-queue-custom]').fill(queue);
  await pane.locator('[data-wq-queue-custom]').press('Enter');

  await expect(pane.getByTestId('pane-type-label')).toHaveText(`B Workqueue · ${queue}`);
  await expect(pane.getByTestId('pane-name-target')).toHaveText(` · ${queue}`);

  await page.keyboard.press('Control+P');
  const managerRow = page.locator('.pane-manager-row[data-pane-kind="workqueue"]').first();
  await expect(managerRow.locator('.pane-manager-kind-label')).toHaveText(`B Workqueue · ${queue}`);
  await expect(managerRow).not.toContainText('main');
});

function seedKeyboardTriageWorkqueueItems(queue) {
  const dir = path.join(env.tempHome, '.openclaw', 'clawnsole');
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date();
  const iso = (offsetMs) => new Date(now.getTime() + offsetMs).toISOString();
  const mkItem = (id, title, priority) => ({
    id,
    queue,
    title,
    instructions: `Keyboard triage seed ${title}`,
    priority,
    status: 'ready',
    claimedBy: '',
    claimedAt: '',
    leaseUntil: 0,
    attempts: 0,
    lastError: '',
    createdAt: iso(-60000 + priority),
    updatedAt: iso(-60000 + priority),
    dedupeKey: `keyboard-triage-${id}`
  });

  const data = {
    version: 1,
    queues: { [queue]: { name: queue, createdAt: iso(-120000) } },
    assignments: {},
    items: [
      mkItem('keyboard-triage-a', 'keyboard triage alpha', 30),
      mkItem('keyboard-triage-b', 'keyboard triage beta', 20)
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

test('workqueue pane: keyboard mode navigates rows and updates status', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  const queue = `keyboard-triage-${Date.now()}`;
  seedKeyboardTriageWorkqueueItems(queue);
  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const pane = page.locator('[data-pane]').last();
  await pane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await pane.locator('[data-wq-queue-custom]').fill(queue);
  await pane.locator('[data-wq-queue-custom]').press('Enter');

  const rows = pane.locator('[data-wq-list-body] .wq-row');
  await expect(rows).toHaveCount(2);
  await pane.locator('[data-wq-keyboard-mode]').click();
  await expect(pane.locator('[data-wq-keyboard-mode]')).toHaveAttribute('aria-pressed', 'true');
  await expect(rows.nth(0)).toHaveClass(/selected/);

  await page.keyboard.press('j');
  await expect(rows.nth(1)).toHaveClass(/selected/);

  await page.keyboard.press('Enter');
  await expect(pane.locator('[data-wq-inspect]')).toContainText('keyboard triage beta');

  await page.keyboard.press('2');
  await expect(rows.nth(1).locator('.wq-col.status')).toContainText('in_progress');

  await page.keyboard.press('3');
  await expect(rows.nth(1).locator('.wq-col.status')).toContainText('blocked');

  let editPromptMessage = '';
  page.once('dialog', async (dialog) => {
    editPromptMessage = dialog.message();
    await dialog.dismiss();
  });
  await page.keyboard.press('e');
  expect(editPromptMessage).toContain('Edit title');

  await pane.locator('[data-wq-queue-search]').fill('triage');
  await page.keyboard.press('k');
  await expect(rows.nth(1)).toHaveClass(/selected/);

  const res = await page.request.get(`http://127.0.0.1:${env.serverPort}/api/workqueue/items?queue=${encodeURIComponent(queue)}&status=ready,blocked,in_progress`);
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  const beta = data.items.find((item) => item.id === 'keyboard-triage-b');
  expect(beta?.status).toBe('blocked');
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

test('workqueue pane: filter summary chips show counts and remove filters', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  const queue = `filter-summary-${Date.now()}`;
  seedFilterSummaryWorkqueueItems(queue);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const wqPane = page.locator('[data-pane]').last();
  await wqPane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await wqPane.locator('[data-wq-queue-custom]').fill(queue);
  await wqPane.locator('[data-wq-queue-custom]').press('Enter');

  const summary = wqPane.locator('[data-wq-filter-summary]');
  await expect(wqPane.locator('[data-wq-statusline]')).toContainText('Showing 2 of 3 items');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText(`Queue ${queue}`);
  await expect(summary).toContainText('Scope Unassigned');
  await expect(summary).toContainText('Status Ready');
  await expect(wqPane.locator('.wq-row')).toHaveCount(2);

  await wqPane.locator('[data-wq-preset-clawnsole]').click();
  await expect(wqPane.locator('[data-wq-statusline]')).toContainText('Showing 1 of 3 items');
  await expect(summary).toContainText('Repo rmdmattingly/clawnsole');
  await expect(wqPane.locator('.wq-row')).toHaveCount(1);

  await summary.getByRole('button', { name: /Remove repo filter rmdmattingly\/clawnsole/ }).click();
  await expect(wqPane.locator('[data-wq-statusline]')).toContainText('Showing 2 of 3 items');
  await expect(summary).not.toContainText('Repo rmdmattingly/clawnsole');
  await expect(wqPane.locator('.wq-row')).toHaveCount(2);

  await wqPane.locator('[data-wq-search]').fill('alternate repo');
  await expect(wqPane.locator('[data-wq-statusline]')).toContainText('Showing 1 of 3 items');
  await expect(summary).toContainText('Search alternate repo');

  await summary.locator('[data-wq-clear-all-filters]').click();
  await expect(wqPane.locator('[data-wq-statusline]')).toContainText('Showing 2 of 3 items');
  await expect(summary).not.toContainText('Search alternate repo');
  await expect(wqPane.locator('[data-wq-queue-custom]')).toHaveValue(queue);
});

test('workqueue pane: default rows collapse exact duplicates with expandable members', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  const queue = `exact-duplicates-${Date.now()}`;
  seedExactDuplicateWorkqueueItems(queue);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const wqPane = page.locator('[data-pane]').last();
  await wqPane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await wqPane.locator('[data-wq-queue-custom]').fill(queue);
  await wqPane.locator('[data-wq-queue-custom]').press('Enter');
  await wqPane.locator('[data-wq-scope="all"]').click();

  const rows = wqPane.locator('[data-wq-list-body] .wq-row');
  const duplicateRow = wqPane.locator('[data-wq-duplicate-row]').first();

  await expect(wqPane.locator('[data-wq-group-mode="auto"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(wqPane.locator('[data-wq-statusline]')).toContainText('Showing 4 items');
  await expect(rows).toHaveCount(3);
  await expect(duplicateRow).toContainText('x2');
  await expect(duplicateRow).toContainText('duplicate collapse');
  await expect(duplicateRow).toHaveAttribute('data-wq-item', 'exact-dup-latest');
  await expect(wqPane.locator('[data-wq-list-body] .wq-row-child')).toHaveCount(0);

  await duplicateRow.press('Enter');
  await expect(duplicateRow).toHaveAttribute('aria-expanded', 'true');
  await expect(wqPane.locator('[data-wq-list-body] .wq-row-child')).toHaveCount(2);
});

test('workqueue pane: auto view groups large repetitive routine queues', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  const queue = `large-routine-${Date.now()}`;
  seedLargeRoutineWorkqueueItems(queue);
  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const pane = page.locator('[data-pane]').last();
  await pane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await pane.locator('[data-wq-queue-custom]').fill(queue);
  await pane.locator('[data-wq-queue-custom]').press('Enter');
  await pane.locator('[data-wq-scope="all"]').click();

  const groupRow = pane.locator('[data-wq-group-row="pr-review:sweep"]');
  await expect(pane.locator('[data-wq-group-mode="auto"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(groupRow).toBeVisible();
  await expect(groupRow).toContainText('22 rows');
  await expect(groupRow.locator('.wq-col.status')).toContainText('Ready');
  await expect(groupRow.locator('.wq-col.status')).toContainText('Pending');
  await expect(groupRow.locator('.wq-col.prio')).toHaveText('99');
  await expect(pane.locator('.wq-row')).toHaveCount(1);

  await groupRow.focus();
  await page.keyboard.press('Enter');
  await expect(groupRow).toHaveAttribute('aria-expanded', 'true');
  await expect(pane.locator('.wq-row-child')).toHaveCount(22);
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

test('workqueue pane: long table titles stay discoverable on hover and focus', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  const queue = `long-title-${Date.now()}`;
  const title = '[ISSUE] rmdmattingly/clawnsole#297 - Workqueue title readability affordance with a very long synthetic title that should truncate visually while remaining fully available to pointer and keyboard users';
  const stateDir = path.join(env.tempHome, '.openclaw', 'clawnsole');
  fs.mkdirSync(stateDir, { recursive: true });
  const now = new Date().toISOString();
  fs.writeFileSync(
    path.join(stateDir, 'work-queues.json'),
    JSON.stringify({
      version: 1,
      queues: { [queue]: { name: queue, createdAt: now } },
      assignments: {},
      items: [{
        id: 'long-title-item',
        queue,
        title,
        instructions: 'fixture item',
        priority: 100,
        status: 'ready',
        claimedBy: '',
        claimedAt: '',
        leaseUntil: 0,
        attempts: 3,
        lastError: '',
        createdAt: now,
        updatedAt: now,
        meta: { repo: 'rmdmattingly/clawnsole' }
      }]
    }, null, 2)
  );

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const pane = page.locator('[data-pane]').last();
  await pane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await pane.locator('[data-wq-queue-custom]').fill(queue);
  await pane.locator('[data-wq-queue-custom]').press('Enter');

  const row = pane.locator('.wq-row').first();
  const titleText = row.locator('.wq-title-text');
  await expect(row).toBeVisible();
  await expect(titleText).toHaveAttribute('title', title);
  await expect(row).toHaveAttribute('title', title);
  await expect(row).toHaveAttribute('aria-label', `Workqueue item: ${title}`);
  await row.focus();
  await expect(row).toBeFocused();

  const titleLayout = await titleText.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      overflow: cs.overflow,
      textOverflow: cs.textOverflow,
      whiteSpace: cs.whiteSpace,
      clipped: el.scrollWidth > el.clientWidth
    };
  });
  expect(titleLayout).toMatchObject({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    clipped: true
  });
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

test('workqueue pane: default rows auto-collapse exact duplicates with count and member expansion', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  const queue = `exact-duplicates-${Date.now()}`;
  seedExactDuplicateWorkqueueItems(queue);
  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const pane = page.locator('[data-pane]').last();
  await pane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await pane.locator('[data-wq-queue-custom]').fill(queue);
  await pane.locator('[data-wq-queue-custom]').press('Enter');

  const duplicateRow = pane.locator('[data-wq-duplicate-row]').first();
  await expect(pane.locator('[data-wq-group-mode="auto"]')).toHaveClass(/active/);
  await expect(duplicateRow).toBeVisible();
  await expect(duplicateRow).toContainText('x2');
  await expect(duplicateRow).toHaveAttribute('data-wq-item', 'exact-dup-latest');
  await expect(pane.locator('.wq-row')).toHaveCount(3);
  await expect(pane.locator('[data-wq-item="exact-dup-different-status"]')).toBeVisible();

  await duplicateRow.focus();
  await page.keyboard.press('Enter');
  await expect(pane.locator('[data-wq-inspect]')).toContainText('exact-dup-latest');
  await expect(pane.locator('.wq-row-child', { hasText: 'exact duplicate collapse' })).toHaveCount(2);
});

test('workqueue pane: grouped mode collapses duplicate issue rows and expands child actions', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  const queue = `group-mode-${Date.now()}`;
  seedLegacyDuplicateWorkqueueItems(queue);
  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const pane = page.locator('[data-pane]').last();
  await pane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await pane.locator('[data-wq-queue-custom]').fill(queue);
  await pane.locator('[data-wq-queue-custom]').press('Enter');

  await expect(pane.locator('.wq-row')).toHaveCount(4);
  await pane.locator('[data-wq-group-mode="grouped"]').click();
  await expect(pane.locator('[data-wq-group-row="rmdmattingly/clawnsole#290"]')).toBeVisible();
  await expect(pane.locator('.wq-row')).toHaveCount(2);
  await expect(pane.locator('[data-wq-group-row="rmdmattingly/clawnsole#290"]')).toContainText('3 rows');
  await expect(pane.locator('.wq-row', { hasText: 'unrelated' })).toHaveCount(1);

  const groupRow = pane.locator('[data-wq-group-row="rmdmattingly/clawnsole#290"]');
  await groupRow.focus();
  await page.keyboard.press('Enter');
  await expect(pane.locator('.wq-row')).toHaveCount(5);

  const child = pane.locator('.wq-row-child', { hasText: 'duplicate health' }).first();
  await child.focus();
  await page.keyboard.press('Enter');
  await expect(pane.locator('[data-wq-inspect]')).toContainText('legacy-dup');
});

test('workqueue pane: controls toolbar is sticky and list scrolls independently', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const wqPane = page.locator('[data-pane]').last();
  const toolbar = wqPane.locator('.wq-pane .wq-toolbar');
  const list = wqPane.locator('.wq-pane .wq-list').first();
  const listHeader = list.locator('.wq-list-header');
  const listBody = wqPane.locator('.wq-pane [data-wq-list-body]').first();

  await expect(toolbar).toBeVisible();
  await expect(listHeader).toBeVisible();
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

  await listBody.evaluate((el) => {
    el.scrollTop = 160;
  });

  const headerStyles = await listHeader.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const listRect = el.parentElement.getBoundingClientRect();
    return {
      position: cs.position,
      top: cs.top,
      zIndex: cs.zIndex,
      backgroundColor: cs.backgroundColor,
      headerTop: Math.round(rect.top),
      listTop: Math.round(listRect.top)
    };
  });

  expect(headerStyles.position).toBe('sticky');
  expect(headerStyles.top).toBe('0px');
  expect(Number(headerStyles.zIndex)).toBeGreaterThanOrEqual(4);
  expect(headerStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(headerStyles.headerTop).toBeGreaterThanOrEqual(headerStyles.listTop);

  await listHeader.locator('[data-wq-sort="title"]').click();
  await expect(listHeader.locator('[data-wq-sort="title"]')).toHaveClass(/active/);

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

  const guard = pane.locator('[data-wq-all-scope-guard]');
  await page.evaluate(() => localStorage.setItem('clawnsole.admin.workqueue.allScopeGuardThreshold', '600'));
  await pane.locator('[data-wq-scope="all"]').click();
  await expect(guard).toBeHidden();

  await page.evaluate(() => localStorage.setItem('clawnsole.admin.workqueue.allScopeGuardThreshold', '200'));
  await pane.locator('[data-wq-scope="assigned"]').click();
  await pane.locator('[data-wq-scope="all"]').click();
  await expect(guard).toBeVisible();
  await expect(guard).toContainText('Viewing all items (505). Narrow scope?');

  await guard.locator('[data-wq-downscope="assigned"]').click();
  await expect(pane.locator('[data-wq-scope="assigned"]')).toHaveClass(/active/);
  await expect(guard).toBeHidden();
  await expect(pane.locator('.wq-row')).toHaveCount(0);

  await pane.locator('[data-wq-scope="all"]').click();
  await expect(guard).toBeVisible();
  await guard.locator('[data-wq-downscope="unassigned"]').click();
  await expect(pane.locator('[data-wq-scope="unassigned"]')).toHaveClass(/active/);
  await expect(guard).toBeHidden();

  await pane.locator('[data-wq-scope="all"]').click();
  await expect(guard).toBeVisible();
  await guard.locator('[data-wq-guard-dismiss]').click();
  await expect(guard).toBeHidden();
  await pane.locator('[data-wq-scope="assigned"]').click();
  await pane.locator('[data-wq-scope="all"]').click();
  await expect(guard).toBeHidden();

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
