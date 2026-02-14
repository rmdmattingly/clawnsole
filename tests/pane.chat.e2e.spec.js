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

test('pane: chat (admin) renders + can send/receive', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const pane = page.locator('[data-pane]').first();
  await expect(pane.locator('[data-pane-input]')).toBeVisible({ timeout: 90000 });

  await pane.locator('[data-pane-input]').fill('hello from e2e');
  await pane.locator('[data-pane-send]').click();

  // Mock gateway streams a delta then a final reply.
  const reply = pane.locator('.chat-bubble.assistant', { hasText: 'mock-reply: hello from e2e' });
  await expect(reply).toHaveCount(1, { timeout: 20000 });
});
