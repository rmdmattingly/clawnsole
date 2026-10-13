const { test, expect } = require('@playwright/test');

const { startTestEnv, loginAdmin, attachConsoleErrorAsserts } = require('./_helpers');

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

test('workqueue modal: status filters use human labels and queue-scoped counts', async ({ page }) => {
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

  await enqueue('dev-team', 'dev item');
  await enqueue('qa-team', 'qa item one');
  await enqueue('qa-team', 'qa item two');

  await page.evaluate(() => window.openWorkqueue?.());
  await expect(page.locator('#workqueueModal')).toHaveClass(/open/);

  await expect(page.locator('[data-wq-modal-sort="title"]')).toHaveText('Task');
  await expect(page.locator('[data-wq-modal-sort="priority"]')).toHaveText('Priority');
  await expect(page.locator('[data-wq-modal-sort="attempts"]')).toHaveText('Attempts');
  await expect(page.locator('[data-wq-modal-sort="claimedBy"]')).toHaveText('Claimed by');
  await expect(page.locator('[data-wq-modal-sort="leaseUntil"]')).toHaveText('Lease expires');
  await expect(page.locator('[data-wq-modal-sort="attempts"]')).toHaveAttribute(
    'title',
    /how many times this task has been claimed/
  );
  await expect(page.locator('[data-wq-modal-sort="leaseUntil"]')).toHaveAttribute(
    'title',
    /when the current claim expires/
  );

  // Humanized labels (no raw snake_case token in display text).
  await expect(page.locator('#wqStatusFilters .wq-status-chip', { hasText: 'In progress (' })).toHaveCount(1);
  await expect(page.locator('#wqStatusFilters .wq-status-chip', { hasText: 'in_progress' })).toHaveCount(0);

  const queueSelect = page.locator('#wqQueueSelect');
  await queueSelect.selectOption('dev-team');
  await expect(page.locator('#wqStatusFilters .wq-status-chip', { hasText: 'Ready (1)' })).toHaveCount(1);
  await expect(page.getByTestId('wq-modal-filter-summary')).toBeVisible();
  await expect(page.getByTestId('wq-modal-filter-chip-queue')).toContainText('Queue: dev-team');
  await expect(page.getByTestId('wq-modal-filter-chip-statuses')).toHaveCount(0);

  await page.locator('#wq-status-claimed').uncheck();
  await expect(page.getByTestId('wq-modal-filter-chip-statuses')).toContainText('Status:');
  await expect(page.getByTestId('wq-modal-filter-count')).toContainText(/Showing \d+ of \d+ items/);

  await page.getByTestId('wq-modal-item-search').fill('dev item');
  await expect(page.getByTestId('wq-modal-filter-chip-search')).toContainText('Search: dev item');
  await page.getByTestId('wq-modal-filter-chip-search').click();
  await expect(page.getByTestId('wq-modal-item-search')).toHaveValue('');

  await page.getByTestId('wq-modal-clear-filters').click();
  await expect(queueSelect).toHaveValue('dev-team');
  await expect(page.getByTestId('wq-modal-filter-chip-statuses')).toHaveCount(0);

  await queueSelect.selectOption('qa-team');
  await expect(page.locator('#wqStatusFilters .wq-status-chip', { hasText: 'Ready (2)' })).toHaveCount(1);
});

test('workqueue modal: golden path covers filters, kanban transition, edit, and delete', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const baseUrl = `http://127.0.0.1:${env.serverPort}`;
  const queue = `golden-path-${Date.now()}`;
  const createRes = await page.request.post(`${baseUrl}/api/workqueue/enqueue`, {
    data: {
      queue,
      title: 'Golden path item',
      instructions: 'Exercise workqueue UI',
      priority: 42,
      dedupeKey: `ui-golden-path-${Date.now()}`
    }
  });
  expect(createRes.ok()).toBeTruthy();

  await page.evaluate(() => window.openWorkqueue?.());

  const modal = page.getByTestId('workqueue-modal');
  await expect(modal).toHaveClass(/open/);
  await expect(modal.getByTestId('workqueue-modal-queue')).toBeVisible();
  await expect(modal.getByTestId('workqueue-modal-status-filters')).toBeVisible();
  await expect(page.locator('#wq-status-ready')).toBeVisible();

  const itemsResponse = page.waitForResponse(
    (res) => res.url().includes('/api/workqueue/items') && res.url().includes(encodeURIComponent(queue)) && res.ok(),
    { timeout: 15000 }
  );
  await modal.getByTestId('workqueue-modal-queue').selectOption(queue);
  await itemsResponse;

  const readyLane = modal.getByTestId('workqueue-modal-col-ready');
  const inProgressLane = modal.getByTestId('workqueue-modal-col-in_progress');
  const itemCard = readyLane.getByTestId('workqueue-modal-card').filter({ hasText: 'Golden path item' }).first();
  await expect(itemCard).toBeVisible();

  const updateResponse = page.waitForResponse(
    (res) => res.url().endsWith('/api/workqueue/update') && res.request().method() === 'POST' && res.ok(),
    { timeout: 15000 }
  );
  await page.evaluate(() => {
    const card = document.querySelector('[data-testid="workqueue-modal-col-ready"] [data-testid="workqueue-modal-card"]');
    const lane = document.querySelector('[data-testid="workqueue-modal-lane-in_progress"]');
    if (!card || !lane) throw new Error('missing workqueue drag/drop targets');
    const dataTransfer = new DataTransfer();
    card.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }));
    lane.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer }));
    lane.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
  });
  await updateResponse;

  const movedCard = inProgressLane.getByTestId('workqueue-modal-card').filter({ hasText: 'Golden path item' }).first();
  await expect(movedCard).toBeVisible();
  await movedCard.click();
  await expect(modal.getByTestId('workqueue-modal-inspect')).toContainText('Golden path item');

  const editAnswers = ['Golden path item edited', 'Updated instructions', '77', 'in_progress'];
  const editDialogHandler = async (dialog) => {
    await dialog.accept(editAnswers.shift());
  };
  page.on('dialog', editDialogHandler);
  const editResponse = page.waitForResponse(
    (res) => res.url().endsWith('/api/workqueue/update') && res.request().method() === 'POST' && res.ok(),
    { timeout: 15000 }
  );
  await modal.getByTestId('workqueue-modal-edit').click();
  await editResponse;
  page.off('dialog', editDialogHandler);
  expect(editAnswers).toHaveLength(0);
  await expect(inProgressLane).toContainText('Golden path item edited');
  await expect(modal.getByTestId('workqueue-modal-inspect')).toContainText('Updated instructions');

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Delete workqueue item?');
    await dialog.accept();
  });
  const deleteResponse = page.waitForResponse(
    (res) => res.url().endsWith('/api/workqueue/delete') && res.request().method() === 'POST' && res.ok(),
    { timeout: 15000 }
  );
  await modal.getByTestId('workqueue-modal-delete').click();
  await deleteResponse;

  await expect(modal.getByTestId('workqueue-modal-list')).not.toContainText('Golden path item edited');
  await expect(modal.getByTestId('workqueue-modal-inspect')).toContainText('Select an item to inspect.');
});

test('workqueue modal: hides archived statuses by default and toggles them explicitly', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const baseUrl = `http://127.0.0.1:${env.serverPort}`;
  const enqueue = async (title) => {
    const res = await page.request.post(`${baseUrl}/api/workqueue/enqueue`, {
      data: {
        queue: 'modal-archived',
        title,
        instructions: `seed ${title}`,
        priority: 1
      }
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    return data.item.id;
  };

  const readyId = await enqueue('modal archived ready row');
  const doneId = await enqueue('modal archived done row');
  const failedId = await enqueue('modal archived failed row');
  expect(readyId).toBeTruthy();
  for (const [itemId, status] of [[doneId, 'done'], [failedId, 'failed']]) {
    const res = await page.request.post(`${baseUrl}/api/workqueue/update`, { data: { itemId, patch: { status } } });
    expect(res.ok()).toBeTruthy();
  }

  await page.evaluate(() => window.openWorkqueue?.());
  await expect(page.locator('#workqueueModal')).toHaveClass(/open/);
  await page.locator('#wqQueueSelect').selectOption('modal-archived');

  await expect(page.locator('#wqListBody')).toContainText('modal archived ready row');
  await expect(page.locator('#wqListBody')).not.toContainText('modal archived done row');
  await expect(page.locator('#wqListBody')).not.toContainText('modal archived failed row');
  await expect(page.locator('#wqArchivedHint')).toHaveText('Archived done/failed items hidden.');
  await expect(page.locator('#wqShowArchivedBtn')).toHaveAttribute('aria-pressed', 'false');

  await page.locator('#wqShowArchivedBtn').click();
  await expect(page.locator('#wqListBody')).toContainText('modal archived done row');
  await expect(page.locator('#wqListBody')).toContainText('modal archived failed row');
  await expect(page.locator('#wqArchivedHint')).toHaveText('Archived done/failed items shown.');
  await expect(page.locator('#wqShowArchivedBtn')).toHaveText('Hide archived');
  await expect(page.locator('#wqShowArchivedBtn')).toHaveAttribute('aria-pressed', 'true');
});

test('workqueue modal: bulk archive requires an age threshold before preview', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  await page.evaluate(() => window.openWorkqueue?.());
  await expect(page.locator('#workqueueModal')).toHaveClass(/open/);

  await expect(page.getByTestId('wq-modal-archive-threshold')).toBeVisible();
  await expect(page.getByTestId('wq-modal-archive-btn')).toBeVisible();

  await page.getByTestId('wq-modal-archive-btn').click();
  await expect(page.getByTestId('workqueue-modal-action-status')).toHaveText('Choose an archive age first.');
});
