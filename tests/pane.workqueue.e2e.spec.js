const { test, expect } = require('@playwright/test');
const { installPageFailureAssertions } = require('./helpers/pw-assertions');
const { startClawnsoleTestApp } = require('./helpers/pw-app');

let app;

test.beforeAll(async () => {
  app = await startClawnsoleTestApp();
});

test.afterAll(() => {
  app?.stop?.();
});

test('pane: workqueue renders + core controls visible', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.addInitScript(() => {
    localStorage.setItem(
      'clawnsole.admin.panes.v1',
      JSON.stringify([{ key: 'ptestchat01', kind: 'chat', agentId: 'main' }])
    );
  });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await expect(page.getByTestId('add-pane-btn')).toBeVisible();
  const paneGrid = page.getByTestId('pane-grid');
  await expect(paneGrid).toHaveAttribute('aria-label', 'Chat panes');

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-workqueue-scope').selectOption('all');
  await page.getByTestId('pane-add-menu-workqueue').click();
  await expect(paneGrid).toHaveAttribute('aria-label', 'Panes');

  const panes = page.locator('[data-pane]');
  const wqPane = panes.last();

  await expect(wqPane).toHaveAttribute('data-pane-kind', 'workqueue');
  await expect(wqPane.locator('.wq-pane')).toHaveCount(1);
  await expect(wqPane.locator('[data-wq-refresh]')).toBeVisible();
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeVisible();
  await expect(wqPane.locator('[data-wq-status]')).toBeVisible();
  const listHeader = wqPane.locator('.wq-list-header');
  await expect(listHeader.locator('[data-wq-sort="title"]')).toHaveText('Task');
  await expect(listHeader.locator('[data-wq-sort="status"]')).toHaveText('Status');
  await expect(listHeader.locator('[data-wq-sort="priority"]')).toHaveText('Priority');
  await expect(listHeader.locator('[data-wq-sort="attempts"]')).toHaveText('Attempts');
  await expect(listHeader.locator('[data-wq-sort="claimedBy"]')).toHaveText('Claimed by');
  await expect(listHeader.locator('[data-wq-sort="leaseUntil"]')).toHaveText('Lease expires');
  await expect(listHeader.locator('[data-wq-sort="attempts"]')).toHaveAttribute(
    'title',
    /how many times this task has been claimed/
  );
  await expect(listHeader.locator('[data-wq-sort="leaseUntil"]')).toHaveAttribute(
    'title',
    /when the current claim expires/
  );

  // Layout regression: toolbar + list should consume full thread height (no dead space below).
  const thread = wqPane.locator('[data-pane-thread]');
  const toolbar = wqPane.locator('.wq-pane .wq-toolbar');
  const layout = wqPane.locator('.wq-pane .wq-layout');
  await expect(toolbar).toBeVisible();
  await expect(layout).toBeVisible();

  const [threadBox, toolbarBox, layoutBox] = await Promise.all([
    thread.boundingBox(),
    toolbar.boundingBox(),
    layout.boundingBox()
  ]);
  expect(threadBox).toBeTruthy();
  expect(toolbarBox).toBeTruthy();
  expect(layoutBox).toBeTruthy();

  // Allow for padding/gap inside the thread; main invariant is that layout reaches the bottom.
  const threadTop = threadBox.y;
  const threadBottom = threadBox.y + threadBox.height;
  const toolbarTop = toolbarBox.y;
  const layoutBottom = layoutBox.y + layoutBox.height;
  expect(Math.abs(toolbarTop - threadTop)).toBeLessThan(20);
  expect(Math.abs(layoutBottom - threadBottom)).toBeLessThan(20);

  const list = wqPane.locator('.wq-pane .wq-list').first();
  const listBody = wqPane.locator('.wq-pane [data-wq-list-body]').first();
  // List body exists even when empty; after refresh it should be scrollable.
  await expect(list).toBeVisible();
  await expect(listBody).toHaveCount(1);

  const itemsResP = page.waitForResponse((res) => res.url().includes('/api/workqueue/items') && res.ok(), { timeout: 15000 });
  await wqPane.locator('[data-wq-refresh]').click();
  await itemsResP;

  const listOverflowY = await list.evaluate((el) => getComputedStyle(el).overflowY);
  expect(listOverflowY).toBe('auto');

  // Workqueue pane should not show chat composer controls.
  await expect(wqPane.locator('[data-pane-input]')).toBeHidden();
});

test('pane: workqueue golden path (list + inspect)', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-workqueue-scope').selectOption('all');
  await page.getByTestId('pane-add-menu-workqueue').click();

  const wqPane = page.locator('[data-pane]').last();
  await expect(wqPane).toHaveAttribute('data-pane-kind', 'workqueue');

  const itemsResP = page.waitForResponse((res) => res.url().includes('/api/workqueue/items') && res.ok(), { timeout: 15000 });
  await wqPane.locator('[data-wq-refresh]').click();
  await itemsResP;

  const runId = String(Date.now());
  const title = `pw-e2e-wq-${runId}`;
  const instructions = `instructions ${runId}`;

  await wqPane.locator('details.wq-enqueue > summary').click();
  await expect(wqPane.locator('.wq-enqueue .wq-label', { hasText: 'Assign to' })).toBeVisible();
  await expect(wqPane.locator('.wq-enqueue .hint', { hasText: 'Who should pick this up' })).toBeVisible();
  await wqPane.locator('[data-wq-enqueue-title]').fill(title);
  await wqPane.locator('[data-wq-enqueue-instructions]').fill(instructions);

  const enqueueResP = page.waitForResponse(
    (res) => res.url().includes('/api/workqueue/enqueue') && res.request().method() === 'POST',
    { timeout: 15000 }
  );
  await wqPane.locator('[data-wq-enqueue-submit]').click();
  const enqueueRes = await enqueueResP;
  expect(enqueueRes.ok()).toBeTruthy();
  await expect(wqPane.locator('[data-wq-enqueue-status]')).toContainText('Queued for main');

  // Close the enqueue details so it can't block clicks on the list.
  await wqPane.locator('details.wq-enqueue > summary').click();

  // Wait for the row to appear in the list.
  const row = wqPane.locator('.wq-row', { hasText: title });
  await expect(row).toBeVisible();

  // Select the row to open the inspect panel.
  // Sticky list headers can overlap pointer hit testing, so activate via keyboard instead of mouse.
  await row.focus();
  await page.keyboard.press('Enter');
  await expect(wqPane.locator('[data-wq-inspect]')).toContainText(title);
  await expect(wqPane.locator('[data-wq-inspect]')).toContainText(instructions);
});

test('workqueue modal: golden path covers filters, kanban status, edit, and delete', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const runId = String(Date.now());
  const title = `pw-e2e-modal-wq-${runId}`;
  const instructions = `modal golden-path instructions ${runId}`;

  const seedRes = await page.request.post(`http://127.0.0.1:${app.serverPort}/api/workqueue/enqueue`, {
    data: { queue: 'dev-team', title, instructions, priority: 73 }
  });
  expect(seedRes.ok()).toBeTruthy();

  await page.evaluate(() => window.__debug.openWorkqueueModal());
  const modal = page.getByTestId('workqueue-modal');
  await expect(modal).toHaveClass(/open/);
  await expect(page.getByTestId('workqueue-modal-queue')).toBeVisible();
  await expect(page.getByTestId('workqueue-modal-status-filters')).toContainText('Ready');
  await expect(page.getByTestId('workqueue-modal-status-filters')).toContainText('In progress');

  const queue = page.getByTestId('workqueue-modal-queue');
  await expect(queue.locator('option', { hasText: 'dev-team' })).toHaveCount(1);
  const itemsResP = page.waitForResponse((res) => res.url().includes('/api/workqueue/items') && res.ok(), { timeout: 15000 });
  await queue.selectOption('dev-team');
  await itemsResP;

  let card = page.getByTestId('workqueue-modal-card').filter({ hasText: title });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.getByTestId('workqueue-modal-inspect')).toContainText(title);
  await expect(page.getByTestId('workqueue-modal-inspect')).toContainText(instructions);

  const statusResP = page.waitForResponse(
    (res) => res.url().includes('/api/workqueue/update') && res.request().method() === 'POST',
    { timeout: 15000 }
  );
  const itemId = await card.getAttribute('data-wq-item');
  expect(itemId).toBeTruthy();
  await page.evaluate((id) => {
    const cardEl = document.querySelector(`[data-testid="workqueue-modal-card"][data-wq-item="${CSS.escape(id)}"]`);
    const laneEl = document.querySelector('[data-testid="workqueue-modal-lane-in_progress"]');
    if (!cardEl || !laneEl) throw new Error('missing workqueue drag/drop targets');
    const dataTransfer = new DataTransfer();
    cardEl.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }));
    laneEl.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer }));
    laneEl.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
  }, itemId);
  const statusRes = await statusResP;
  expect(statusRes.ok()).toBeTruthy();
  card = page.getByTestId('workqueue-modal-lane-in_progress').getByTestId('workqueue-modal-card').filter({ hasText: title });
  await expect(card).toBeVisible();
  await expect(card).toContainText('in_progress');
  await card.click();
  await expect(page.getByTestId('workqueue-modal-inspect')).toContainText('in_progress');

  const editedTitle = `${title} edited`;
  const editedInstructions = `${instructions} edited`;
  const promptAnswers = [editedTitle, editedInstructions, '74', 'ready'];
  const promptHandler = async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    await dialog.accept(promptAnswers.shift());
  };
  page.on('dialog', promptHandler);
  const editResP = page.waitForResponse(
    (res) => res.url().includes('/api/workqueue/update') && res.request().method() === 'POST',
    { timeout: 15000 }
  );
  await page.getByTestId('workqueue-modal-edit').click();
  const editRes = await editResP;
  page.off('dialog', promptHandler);
  expect(editRes.ok()).toBeTruthy();
  await expect(page.getByTestId('workqueue-modal-inspect')).toContainText(editedTitle);
  await expect(page.getByTestId('workqueue-modal-inspect')).toContainText(editedInstructions);
  await expect(page.getByTestId('workqueue-modal-lane-ready').getByTestId('workqueue-modal-card').filter({ hasText: editedTitle })).toBeVisible();

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    await dialog.accept();
  });
  const deleteResP = page.waitForResponse(
    (res) => res.url().includes('/api/workqueue/delete') && res.request().method() === 'POST',
    { timeout: 15000 }
  );
  await page.getByTestId('workqueue-modal-delete').click();
  const deleteRes = await deleteResP;
  expect(deleteRes.ok()).toBeTruthy();
  await expect(page.getByTestId('workqueue-modal-card').filter({ hasText: editedTitle })).toHaveCount(0);
  await expect(page.getByTestId('workqueue-modal-inspect')).toContainText('Select an item to inspect.');
});

test('pane: workqueue scope filter toggles deterministic row counts', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-workqueue').click();
  const wqPane = page.locator('[data-pane]').last();

  const runId = `scope-${Date.now()}`;
  const mkTitle = (s) => `pw-e2e-${runId}-${s}`;
  const chooseAssignTarget = async (query, expectedValue) => {
    const pickerSearch = wqPane.locator('[data-wq-claim-agent-search]');
    await pickerSearch.fill(query);
    await pickerSearch.press('Enter');
    await expect(wqPane.locator('[data-wq-claim-agent]')).toHaveValue(expectedValue);
  };

  await wqPane.locator('details.wq-enqueue > summary').click();

  // Enqueue one unassigned item.
  await wqPane.locator('[data-wq-enqueue-title]').fill(mkTitle('unassigned'));
  await wqPane.locator('[data-wq-enqueue-instructions]').fill('scope test unassigned');
  await chooseAssignTarget('Unassigned', '');
  await wqPane.locator('[data-wq-enqueue-submit]').click();
  await expect(wqPane.locator('[data-wq-enqueue-status]')).toContainText('Queued');

  // Enqueue one assigned-to-main item.
  await wqPane.locator('[data-wq-enqueue-title]').fill(mkTitle('assigned-main'));
  await wqPane.locator('[data-wq-enqueue-instructions]').fill('scope test assigned');
  await chooseAssignTarget('main', 'main');
  await wqPane.locator('[data-wq-enqueue-submit]').click();
  await expect(wqPane.locator('[data-wq-enqueue-status]')).toContainText('Queued');

  await wqPane.locator('details.wq-enqueue > summary').click();

  const refreshResP = page.waitForResponse((res) => res.url().includes('/api/workqueue/items') && res.ok(), { timeout: 15000 });
  await wqPane.locator('[data-wq-refresh]').click();
  await refreshResP;

  const rowsWithPrefix = () => wqPane.locator('.wq-row').filter({ hasText: `pw-e2e-${runId}-` });

  await wqPane.locator('[data-wq-scope="all"]').click();
  await expect(rowsWithPrefix()).toHaveCount(2);

  await wqPane.locator('[data-wq-scope="unassigned"]').click();
  await expect(rowsWithPrefix()).toHaveCount(2);

  await wqPane.locator('[data-wq-scope="assigned"]').click();
  await expect(rowsWithPrefix()).toHaveCount(0);

  const statusLine = wqPane.locator('[data-wq-statusline]');
  await expect(statusLine).toContainText(/Showing 0 of \d+ items/);
  await expect(wqPane.locator('[data-wq-empty]')).toContainText('No items match current filters.');

  await wqPane.locator('[data-wq-scope="all"]').click();
  await wqPane.locator('[data-wq-search]').fill(mkTitle('unassigned'));
  await expect(rowsWithPrefix()).toHaveCount(1);
  await expect(statusLine).toContainText(/Showing 1 of \d+ items .*hidden:.*search \d+/);

  await wqPane.locator('[data-wq-search]').fill(`missing-${runId}`);
  await expect(rowsWithPrefix()).toHaveCount(0);
  await expect(statusLine).toContainText(/Showing 0 of \d+ items .*hidden:.*search \d+/);
  await expect(wqPane.locator('[data-wq-empty]')).toContainText('No items match current filters.');
});

test('pane: workqueue triage mode preset applies and persists queue scope statuses and sort', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.addInitScript(() => {
    if (sessionStorage.getItem('pw-triage-preset-seeded') === '1') return;
    sessionStorage.setItem('pw-triage-preset-seeded', '1');
    localStorage.setItem(
      'clawnsole.admin.panes.v1',
      JSON.stringify([
        {
          key: 'pw-triage-preset',
          kind: 'workqueue',
          queue: 'custom-review',
          statusFilter: ['claimed', 'in_progress'],
          scopeFilter: 'assigned',
          sortKey: 'updatedAt',
          sortDir: 'asc'
        }
      ])
    );
  });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();
  const triageBtn = wqPane.locator('[data-wq-preset-triage]');

  const refreshResP = page.waitForResponse((res) => res.url().includes('/api/workqueue/items') && res.ok(), { timeout: 15000 });
  await triageBtn.click();
  await refreshResP;

  await expect(triageBtn).toHaveAttribute('aria-pressed', 'true');
  await expect(wqPane.getByTestId('wq-triage-chip')).toBeVisible();
  await expect(wqPane.locator('[data-wq-queue-select]')).toHaveValue('dev-team');
  await expect(wqPane.locator('[data-wq-scope="unassigned"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(wqPane.locator('.wq-sort [data-wq-sort="priority"]')).toHaveClass(/active/);

  await wqPane.locator('[data-wq-status-details] > summary').click();
  const statusOptions = wqPane.locator('[data-wq-status-options]');
  await expect(statusOptions.getByRole('checkbox', { name: /^Ready \(/ })).toBeChecked();
  await expect(statusOptions.getByRole('checkbox', { name: /^Pending \(/ })).toBeChecked();
  await expect(statusOptions.getByRole('checkbox', { name: /^Claimed \(/ })).not.toBeChecked();
  await expect(statusOptions.getByRole('checkbox', { name: /^In progress \(/ })).not.toBeChecked();

  await page.reload();
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });
  await expect(page.getByTestId('login-overlay')).toBeHidden();

  const persistedPane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();
  await expect(persistedPane.locator('[data-wq-preset-triage]')).toHaveAttribute('aria-pressed', 'true');
  await expect(persistedPane.getByTestId('wq-triage-chip')).toBeVisible();
  await expect(persistedPane.locator('[data-wq-queue-select]')).toHaveValue('dev-team');
  await expect(persistedPane.locator('[data-wq-scope="unassigned"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(persistedPane.locator('.wq-sort [data-wq-sort="priority"]')).toHaveClass(/active/);
});
