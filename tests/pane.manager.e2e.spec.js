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

test('pane manager: paired action focuses existing counterpart and opens missing counterpart', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const paneManagerModal = page.locator('#paneManagerModal');

  // Existing counterpart path: chat row should focus already-open workqueue pane.
  await page.keyboard.press('Control+P');
  await expect(paneManagerModal).toHaveAttribute('aria-hidden', 'false');

  const chatRow = page.locator('.pane-manager-row').first();
  const chatPaired = chatRow.locator('[data-action="paired"]');
  await expect(chatPaired).toHaveText('Paired WQ');
  await chatPaired.click();

  await expect(page.locator('[data-pane-kind="workqueue"]')).toHaveCount(1);
  const focusedKindAfterExisting = await page.evaluate(() => {
    const active = document.activeElement;
    const pane = active?.closest?.('[data-pane-kind]');
    return pane?.getAttribute('data-pane-kind') || '';
  });
  expect(focusedKindAfterExisting).toBe('workqueue');

  await page.keyboard.press('Escape');
  await expect(paneManagerModal).toHaveAttribute('aria-hidden', 'true');

  // Missing counterpart path: close workqueue, then paired from chat should open one.
  await page.locator('[data-pane-kind="workqueue"] [data-pane-close]').first().click();
  await expect(page.locator('[data-pane-kind="workqueue"]')).toHaveCount(0);

  await page.keyboard.press('Control+P');
  await expect(paneManagerModal).toHaveAttribute('aria-hidden', 'false');

  await page.locator('.pane-manager-row').first().locator('[data-action="paired"]').click();
  await expect(page.locator('[data-pane-kind="workqueue"]')).toHaveCount(1);
});
