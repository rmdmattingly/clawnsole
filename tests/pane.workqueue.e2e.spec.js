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

  await expect(page.locator('#addPaneBtn')).toBeVisible();
  await page.click('#addPaneBtn');
  await page.getByRole('button', { name: 'Workqueue pane' }).click();

  const panes = page.locator('[data-pane]');
  const wqPane = panes.last();

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
  await expect(listBody).toBeVisible();
  const listOverflowY = await listBody.evaluate((el) => getComputedStyle(el).overflowY);
  expect(listOverflowY).toBe('auto');

  // Workqueue pane should not show chat composer controls.
  await expect(wqPane.locator('[data-pane-input]')).toBeHidden();
});

test('pane: workqueue golden path (kanban status, edit, delete)', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.click('#addPaneBtn');
  await page.getByRole('button', { name: 'Workqueue pane' }).click();

  const wqPane = page.locator('[data-pane]').last();
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeVisible();
  await expect(wqPane.locator('[data-wq-status]')).toBeVisible();

  const itemsResP = page.waitForResponse((res) => res.url().includes('/api/workqueue/items') && res.ok(), { timeout: 15000 });
  await wqPane.locator('[data-wq-refresh]').click();
  await itemsResP;

  console.log('[wq-e2e] opened workqueue pane');

  // Ensure all kanban columns render for deterministic drag/drop.
  await wqPane.locator('[data-wq-status-details] > summary').click();
  await wqPane.locator('[data-wq-status-preset="all"]').click();
  await expect(wqPane.locator('[data-wq-col="ready"]')).toBeVisible();
  await expect(wqPane.locator('[data-wq-col="done"]')).toBeVisible();
  console.log('[wq-e2e] status preset all applied');

  const runId = String(Date.now());
  const title = `pw-e2e-wq-${runId}`;

  await wqPane.locator('details.wq-enqueue > summary').click();
  await wqPane.locator('[data-wq-enqueue-title]').fill(title);
  await wqPane.locator('[data-wq-enqueue-instructions]').fill(`instructions ${runId}`);
  await wqPane.locator('[data-wq-enqueue-priority]').fill('5');

  const enqueueResP = page.waitForResponse(
    (res) => res.url().includes('/api/workqueue/enqueue') && res.request().method() === 'POST',
    { timeout: 15000 }
  );
  await wqPane.locator('[data-wq-enqueue-submit]').click();
  const enqueueRes = await enqueueResP;
  expect(enqueueRes.ok()).toBeTruthy();
  console.log('[wq-e2e] enqueued item');

  // Close the enqueue details so it can't block clicks on the board.
  await wqPane.locator('details.wq-enqueue > summary').click();

  // Wait for the card to appear.
  const card = wqPane.locator('.wq-card', { hasText: title });
  await expect(card).toBeVisible();
  console.log('[wq-e2e] card appeared');

  // Select the card to open the inspect panel.
  await card.click();
  await expect(wqPane.locator('[data-wq-inspect]')).toContainText(title);
  const itemIdRaw = await wqPane.locator('[data-wq-kv-val="id"]').textContent();
  const itemId = String(itemIdRaw || '').trim();
  expect(itemId).toBeTruthy();
  console.log('[wq-e2e] selected item', itemId);

  // Transition status using a deterministic control (kanban "equivalent" to drag/drop).
  const updateResP = page.waitForResponse(
    (res) => res.url().includes('/api/workqueue/update') && res.request().method() === 'POST',
    { timeout: 15000 }
  );
  await wqPane.locator('[data-wq-action="status"]').selectOption('done');
  await wqPane.locator('[data-wq-action="apply-status"]').click();
  const updateRes = await updateResP;
  expect(updateRes.ok()).toBeTruthy();
  await expect(wqPane.locator('[data-wq-col="done"] .wq-card', { hasText: title })).toBeVisible();
  console.log('[wq-e2e] set status done');

  // Edit title/instructions/status using the edit flow.
  const editedTitle = `${title}-edited`;
  const promptReplies = [editedTitle, `edited instructions ${runId}`, '7', 'done'];
  const dialogHandler = async (dialog) => {
    if (dialog.type() === 'prompt') {
      const next = promptReplies.shift();
      await dialog.accept(next ?? '');
      return;
    }
    // confirm/alert
    await dialog.accept();
  };
  page.on('dialog', dialogHandler);

  const editResP = page.waitForResponse(
    (res) => res.url().includes('/api/workqueue/update') && res.request().method() === 'POST',
    { timeout: 15000 }
  );
  await wqPane.locator('[data-wq-action="edit"]').click();
  const editRes = await editResP;
  expect(editRes.ok()).toBeTruthy();
  await expect(wqPane.locator('[data-wq-inspect]')).toContainText(editedTitle);
  page.off('dialog', dialogHandler);
  console.log('[wq-e2e] edited item');

  // Delete the item and assert it disappears.
  const deleteResP = page.waitForResponse(
    (res) => res.url().includes('/api/workqueue/delete') && res.request().method() === 'POST',
    { timeout: 15000 }
  );
  await page.once('dialog', async (dialog) => dialog.accept());
  await wqPane.locator('[data-wq-action="delete"]').click();
  const deleteRes = await deleteResP;
  expect(deleteRes.ok()).toBeTruthy();
  await expect(wqPane.locator('.wq-card', { hasText: editedTitle })).toHaveCount(0);
  console.log('[wq-e2e] deleted item');
});
