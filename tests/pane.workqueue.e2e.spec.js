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

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await expect(page.getByTestId('add-pane-btn')).toBeVisible();
  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-workqueue').click();

  const panes = page.locator('[data-pane]');
  const wqPane = panes.last();

  await expect(wqPane).toHaveAttribute('data-pane-kind', 'workqueue');
  await expect(wqPane.locator('.wq-pane')).toHaveCount(1);
  await expect(wqPane.locator('[data-wq-refresh]')).toBeVisible();
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeVisible();
  await expect(wqPane.locator('[data-wq-status]')).toBeVisible();

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

  const listBody = wqPane.locator('.wq-pane [data-wq-list-body]').first();
  // List body exists even when empty; after refresh it should be scrollable.
  await expect(listBody).toHaveCount(1);

  const itemsResP = page.waitForResponse((res) => res.url().includes('/api/workqueue/items') && res.ok(), { timeout: 15000 });
  await wqPane.locator('[data-wq-refresh]').click();
  await itemsResP;

  const listOverflowY = await listBody.evaluate((el) => getComputedStyle(el).overflowY);
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
  await expect(wqPane.locator('[data-wq-enqueue-status]')).toContainText('Queued as Unassigned');

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
