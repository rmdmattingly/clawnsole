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

test('agent picker: filter reduces list; Esc clears', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const pane = page.locator('[data-pane]').first();
  const btn = pane.locator('[data-testid="agent-picker-button"]');
  await expect(btn).toBeVisible({ timeout: 20000 });

  await btn.click();

  const listItems = page.locator('[data-testid="agent-picker-item"]');
  await expect(listItems).toHaveCount(2);

  const filter = page.locator('[data-testid="agent-filter-input"]');
  await filter.fill('dev');
  await expect(listItems).toHaveCount(1);

  await filter.press('Escape');
  await expect(listItems).toHaveCount(2);
});
