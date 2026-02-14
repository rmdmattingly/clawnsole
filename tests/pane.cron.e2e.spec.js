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

test('pane: cron renders + lists jobs from gateway', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await expect(page.locator('#addPaneBtn')).toBeVisible();
  await page.click('#addPaneBtn');
  await page.getByRole('button', { name: 'Cron pane' }).click();

  const panes = page.locator('[data-pane]');
  const cronPane = panes.last();

  await expect(cronPane.locator('.cron-pane')).toHaveCount(1);
  await expect(cronPane.locator('.cron-job__title', { hasText: 'Nightly report' })).toBeVisible({ timeout: 20000 });
  await expect(cronPane.locator('.cron-job__title', { hasText: 'PR sweep' })).toBeVisible();

  // Core interaction: toggle a details view.
  const viewBtn = cronPane.getByRole('button', { name: 'View' }).first();
  const details = cronPane.locator('[data-cron-details-for]').first();
  await expect(details).toBeHidden();
  await viewBtn.click();
  await expect(details).toBeVisible();
});
