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
  if (page.__consoleAsserts) {
    page.__consoleAsserts.assertNoErrors();
  }
});

test('pane switch HUD appears for keyboard pane changes and honors setting', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const hud = page.getByTestId('pane-switch-hud');
  await expect(hud).toHaveCount(0);

  await page.locator('[data-testid="pane"][data-pane-kind="workqueue"]').last().click();
  await expect(hud).toHaveCount(0);

  await page.evaluate(() => document.activeElement?.blur?.());
  await page.keyboard.press('Alt+1');
  await expect(hud).toBeVisible();
  await expect(hud).toContainText(/A Chat · main/);
  await expect(page.locator('[data-testid="pane"][data-pane-kind="chat"]').first().locator('[data-pane-input]')).toBeFocused();

  await page.getByRole('button', { name: 'Open settings' }).click();
  await expect(page.locator('#settingsModal')).toHaveAttribute('aria-hidden', 'false');
  await page.locator('#showPaneSwitchHud').uncheck();
  await page.keyboard.press('Escape');
  await expect(page.locator('#settingsModal')).toHaveAttribute('aria-hidden', 'true');

  await page.waitForTimeout(950);
  await expect(hud).not.toHaveClass(/open/);
  await page.evaluate(() => document.activeElement?.blur?.());
  await page.keyboard.press('Alt+2');
  await expect(hud).not.toHaveClass(/open/);
});
