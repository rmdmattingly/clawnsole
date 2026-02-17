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
