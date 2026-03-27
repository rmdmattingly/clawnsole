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

test('agent chooser: opens, shows agents, Esc closes', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const pane = page.locator('[data-pane]').first();
  const btn = pane.getByTestId('pane-agent-button');
  await expect(btn).toBeVisible({ timeout: 20000 });

  // Header should clearly indicate the current agent target.
  await expect(btn).toContainText(/main/i);
  await expect(btn).toHaveAttribute('aria-label', /current:\s*main/i);

  await btn.click();

  const chooser = page.getByRole('dialog', { name: 'Choose agent' });
  await expect(chooser).toBeVisible();

  const items = chooser.locator('.agent-chooser-item');
  await expect(items).toHaveCount(2);

  // Switch to dev and ensure the pane header reflects the new selection.
  await chooser.getByRole('button', { name: /dev/i }).click();
  await expect(chooser).toHaveCount(0);
  await expect(btn).toContainText(/dev/i);
  await expect(btn).toHaveAttribute('aria-label', /current:\s*dev/i);
  await expect(pane.getByTestId('pane-type-label')).toHaveText(/^A Chat · dev/i);

  // Re-open and Esc closes.
  await btn.click();
  await expect(chooser).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(chooser).toHaveCount(0);
});
