const { test, expect } = require('@playwright/test');

const { startTestEnv, loginAdmin, attachConsoleErrorAsserts } = require('./_helpers');

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

test('command palette: Ctrl/Cmd+K opens and can add a pane', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const countBefore = await page.locator('[data-pane]').count();

  await page.keyboard.press('ControlOrMeta+K');

  const modal = page.locator('[data-testid="command-palette-modal"]');
  await expect(modal).toBeVisible();

  const input = page.locator('#commandPaletteInput');
  await expect(input).toBeFocused();

  await input.type('add pane: timeline');
  await page.keyboard.press('Enter');

  const tlPane = page.locator('[data-pane-kind="timeline"]').last();
  await expect(tlPane).toBeVisible();

  const countAfter = await page.locator('[data-pane]').count();
  expect(countAfter).toBeGreaterThan(countBefore);
});
