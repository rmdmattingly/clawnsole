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

  await queueSelect.selectOption('qa-team');
  await expect(page.locator('#wqStatusFilters .wq-status-chip', { hasText: 'Ready (2)' })).toHaveCount(1);
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
