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

test('pane: timeline renders + shows recent cron run events', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await expect(page.locator('#addPaneBtn')).toBeVisible();
  await page.click('#addPaneBtn');
  await page.getByRole('button', { name: 'Timeline pane' }).click();

  const panes = page.locator('[data-pane]');
  const timelinePane = panes.last();

  const cronPane = timelinePane.locator('.cron-pane');
  await expect(cronPane).toHaveCount(1);

  // Layout regression: toolbar + list should consume full thread height (no dead space below).
  const toolbar = cronPane.locator('.wq-toolbar');
  const layout = cronPane.locator('.wq-layout');
  await expect(toolbar).toBeVisible();
  await expect(layout).toBeVisible();

  const [threadBox, toolbarBox, layoutBox] = await Promise.all([
    cronPane.boundingBox(),
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

  const listBody = cronPane.locator('.wq-list-body').first();
  await expect(listBody).toBeVisible();
  const listOverflowY = await listBody.evaluate((el) => getComputedStyle(el).overflowY);
  expect(listOverflowY).toBe('auto');

  // Timeline fetches cron.list then cron.runs; assert at least one event rendered.
  await expect(timelinePane.locator('.timeline-item').first()).toBeVisible({ timeout: 60000 });
  await expect(timelinePane.locator('.hint', { hasText: 'mock run ok' }).first()).toBeVisible();
});

test('pane: timeline filters + range + actions', async ({ page }) => {
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  const dialogs = [];
  page.on('dialog', async (dialog) => {
    dialogs.push({ type: dialog.type(), message: dialog.message() });
    await dialog.accept();
  });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.click('#addPaneBtn');
  await page.getByRole('button', { name: 'Timeline pane' }).click();

  const panes = page.locator('[data-pane]');
  const timelinePane = panes.last();

  // Baseline: fixture should render timeline items.
  await expect(timelinePane.getByTestId('timeline-item').first()).toBeVisible({ timeout: 60000 });

  // Per-agent filter (depends on /agents fixture in startClawnsoleTestApp).
  await expect(timelinePane.getByTestId('cron-agent').locator('option[value="dev"]')).toHaveCount(1);
  await timelinePane.getByTestId('cron-agent').selectOption('dev');
  await expect(timelinePane.getByText('PR sweep').first()).toBeVisible();

  // Range: the mock gateway returns one event ~60s ago + one ~2h ago for each job.
  // With dev selected, 1h should drop the ~2h event.
  await timelinePane.getByTestId('timeline-range').selectOption('3600000');
  await expect(timelinePane.getByText('mock run ok')).toBeVisible();
  await expect(timelinePane.getByText('mock error')).toHaveCount(0);

  // Actions: View should show an alert dialog (timeline entries do not embed <details>).
  await timelinePane.getByTestId('cron-action-view').first().click();
  await expect
    .poll(() => dialogs.length)
    .toBeGreaterThan(0);
  expect(dialogs[0].message).toContain('job-2');

  // Toggle should persist via mock-gateway cron.update and reflect in UI.
  await timelinePane.getByTestId('cron-action-toggle').first().click();
  await expect(timelinePane.getByText('enabled')).toBeVisible();

  // Run should be wired (no dialog, no crash).
  await timelinePane.getByTestId('cron-action-run').first().click();

  // Delete should remove the job (confirm dialog) and timeline should become empty for dev.
  await timelinePane.getByTestId('cron-action-delete').first().click();
  await expect(timelinePane.getByText('No events in range.')).toBeVisible();
});
