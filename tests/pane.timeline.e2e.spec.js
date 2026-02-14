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

  await expect(timelinePane.locator('.cron-pane')).toHaveCount(1);

  // Timeline fetches cron.list then cron.runs; assert at least one event rendered.
  await expect(timelinePane.locator('.timeline-item').first()).toBeVisible({ timeout: 60000 });
  await expect(timelinePane.locator('.hint', { hasText: 'mock run ok' }).first()).toBeVisible();
});
