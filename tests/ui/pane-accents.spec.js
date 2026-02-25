const { test, expect } = require('@playwright/test');

const { startTestEnv, loginAdmin, attachConsoleErrorAsserts, addPane } = require('./_helpers');

let env;

test.beforeAll(async () => {
  env = await startTestEnv();
});

test.afterAll(() => {
  env?.stop?.();
});

test.afterEach(async ({ page }) => {
  if (page.__consoleAsserts) page.__consoleAsserts.assertNoErrors();
});

test('pane accents: each pane kind exposes deterministic accent selectors', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  // Default layout includes chat + workqueue; add the remaining kinds.
  await addPane(page, 'Cron pane');
  await addPane(page, 'Timeline pane');

  for (const kind of ['chat', 'workqueue', 'cron', 'timeline']) {
    await expect(page.locator(`[data-pane][data-pane-kind="${kind}"][data-pane-accent-kind="${kind}"]`)).toHaveCount(1);
    await expect(page.locator(`[data-pane][data-pane-kind="${kind}"] [data-pane-type-pill][data-pane-accent="${kind}"]`)).toHaveCount(1);
  }

  await page.locator('#paneManagerBtn').click();
  await expect(page.locator('#paneManagerModal')).toHaveClass(/open/);

  for (const kind of ['chat', 'workqueue', 'cron', 'timeline']) {
    await expect(page.locator(`[data-pane-manager-accent="${kind}"]`)).toHaveCount(1);
  }
});
