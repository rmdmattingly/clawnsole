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
    return await res.json();
  };

  await enqueue('dev-team', 'dev item');
  const qaOne = await enqueue('qa-team', 'qa item one');
  await enqueue('qa-team', 'qa item two');
  const updateRes = await page.request.post(`${baseUrl}/api/workqueue/update`, {
    data: { itemId: qaOne.item.id, patch: { status: 'done' } }
  });
  expect(updateRes.ok()).toBeTruthy();

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
  await expect(page.locator('[data-wq-filter-count]')).toHaveText('Showing 1 of 1 item');
  await expect(page.locator('#wqFilterSummary .wq-filter-chip', { hasText: 'Queue: dev-team' })).toHaveCount(1);
  await expect(page.locator('#wqFilterSummary .wq-filter-chip', { hasText: 'Statuses: Ready, Pending, Claimed, In progress' })).toHaveCount(1);

  await queueSelect.selectOption('qa-team');
  await expect(page.locator('#wqStatusFilters .wq-status-chip', { hasText: 'Ready (1)' })).toHaveCount(1);
  await expect(page.locator('#wqStatusFilters .wq-status-chip', { hasText: 'Done (1)' })).toHaveCount(1);
  await expect(page.locator('[data-wq-filter-count]')).toHaveText('Showing 1 of 2 items');

  await page.locator('#wqFilterSummary .wq-filter-chip', { hasText: 'Statuses:' }).click();
  await expect(page.locator('[data-wq-filter-count]')).toHaveText('Showing 2 of 2 items');
  await expect(page.locator('#wqFilterSummary .wq-filter-chip', { hasText: 'Statuses:' })).toHaveCount(0);

  await page.locator('#wqStatusFilters input').first().setChecked(false);
  await expect(page.locator('#wqFilterSummary .wq-filter-chip', { hasText: 'Statuses:' })).toHaveCount(1);
  await page.locator('#wqFilterSummary .wq-filter-clear').click();
  await expect(queueSelect).toHaveValue('qa-team');
  await expect(page.locator('[data-wq-filter-count]')).toHaveText('Showing 2 of 2 items');
});
