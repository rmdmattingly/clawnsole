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

test('pane manager: lists panes + focuses via keyboard', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const modal = page.locator('#paneManagerModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');

  // Ctrl+P should open pane manager (even while a pane input is focused).
  await page.keyboard.press('Control+P');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  const rows = page.locator('.pane-manager-row');
  await expect(rows).toHaveCount(2);

  // Focus the 2nd pane (default Workqueue) using arrow keys + Enter.
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');

  const panes = page.locator('[data-pane]');
  await expect(panes).toHaveCount(2);

  // Active element should be inside the 2nd pane.
  const focusedPaneIndex = await page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]'));
    const active = document.activeElement;
    return panes.findIndex((p) => p === active || (active && p.contains(active)));
  });
  expect(focusedPaneIndex).toBe(1);
});

test('pane header: target label matches pane kind (agent vs queue vs jobs vs timeline)', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const chatPane = page.locator('[data-pane][data-pane-kind="chat"]').first();
  const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();

  await expect(chatPane.getByTestId('pane-target-label')).toHaveText('Agent');
  await expect(wqPane.getByTestId('pane-target-label')).toHaveText('Queue');

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-cron').click();

  const cronPane = page.locator('[data-pane][data-pane-kind="cron"]').last();
  await expect(cronPane.getByTestId('pane-target-label')).toHaveText('Jobs');

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-timeline').click();

  const timelinePane = page.locator('[data-pane][data-pane-kind="timeline"]').last();
  await expect(timelinePane.getByTestId('pane-target-label')).toHaveText('Timeline');
});

test('pane manager: quick-find filters and groups by kind', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-cron').click();

  await page.keyboard.press('Control+P');
  const modal = page.locator('#paneManagerModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  await expect(page.locator('.pane-manager-group-header')).toHaveCount(3);
  await expect(page.locator('.pane-manager-group-header').nth(0)).toContainText('Chat (1)');
  await expect(page.locator('.pane-manager-group-header').nth(1)).toContainText('Workqueue (1)');
  await expect(page.locator('.pane-manager-group-header').nth(2)).toContainText('Cron (1)');

  const search = page.getByTestId('pane-manager-search');
  await search.fill('gateway');
  await expect(page.locator('.pane-manager-row')).toHaveCount(1);
  await expect(page.locator('.pane-manager-row').first()).toContainText('Cron');
});

test('pane manager: shows summary + duplicate badge and supports close others', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-chat').click();

  await page.keyboard.press('Control+P');
  const modal = page.locator('#paneManagerModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  const rows = page.locator('.pane-manager-row');
  await expect(rows).toHaveCount(3);

  const duplicateRows = page.locator('.pane-manager-row', { hasText: 'Chat · main' });
  await expect(duplicateRows).toHaveCount(2);
  await expect(duplicateRows.first().getByTestId('pane-manager-duplicate-badge')).toHaveText('duplicate');

  const chatRowWithCloseOthers = page.locator('.pane-manager-row', { has: page.getByTestId('pane-manager-close-others') }).first();
  await chatRowWithCloseOthers.getByTestId('pane-manager-close-others').click();

  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
  await expect(page.locator('.pane-manager-row')).toHaveCount(2);
  await expect(page.locator('[data-testid="pane-manager-duplicate-badge"]')).toHaveCount(0);
});

test('pane manager: supports reordering panes', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-chat').click();

  await page.keyboard.press('Control+P');
  const modal = page.locator('#paneManagerModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  const rows = page.locator('.pane-manager-row');
  await expect(rows).toHaveCount(3);
  const firstRowMoveUp = rows.nth(0).getByTestId('pane-manager-move-up');
  await expect(firstRowMoveUp).toBeDisabled();

  const rowKeys = async () => {
    return page.locator('.pane-manager-row').evaluateAll((rows) => rows.map((row) => row.dataset.paneKey));
  };

  const before = await rowKeys();
  expect(before.length).toBe(3);

  const workqueueKey = await page.locator('.pane-manager-row', { hasText: 'Workqueue' }).first().evaluate((row) => row.dataset.paneKey);
  await page.locator('.pane-manager-row', { hasText: 'Workqueue' }).first().evaluate((row) => {
    const moveDown = row.querySelector('[data-action="move-down"]');
    moveDown?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  const after = await rowKeys();
  const from = before.indexOf(workqueueKey);
  expect(from).toBeGreaterThanOrEqual(0);
  const expected = before.slice();
  const [moved] = expected.splice(from, 1);
  expected.splice(Math.min(from + 1, expected.length), 0, moved);
  expect(after).toEqual(expected);

  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');

  await page.keyboard.press('Control+P');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  const persisted = await rowKeys();
  expect(persisted).toEqual(after);
});
