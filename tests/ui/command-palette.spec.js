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

test('command palette: keyboard flow can open a targeted pane and focus by pane letter', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const countBefore = await page.locator('[data-pane]').count();

  await page.keyboard.press('ControlOrMeta+K');

  const modal = page.locator('[data-testid="command-palette-modal"]');
  await expect(modal).toBeVisible();

  const input = page.locator('#commandPaletteInput');
  await expect(input).toBeVisible();
  await input.click();

  await input.type('open workqueue: dev-team');
  await page.keyboard.press('Enter');

  const wqPane = page.locator('[data-pane-kind="workqueue"]').last();
  await expect(wqPane).toBeVisible();

  const countAfter = await page.locator('[data-pane]').count();
  expect(countAfter).toBeGreaterThan(countBefore);

  await page.keyboard.press('ControlOrMeta+K');
  await expect(input).toBeVisible();
  await input.click();
  await input.fill('open chat');
  await page.keyboard.press('Enter');

  await page.keyboard.press('ControlOrMeta+K');
  await expect(input).toBeVisible();
  await input.click();
  await input.fill('focus pane a');
  await page.keyboard.press('Enter');

  const firstChatInput = page.locator('[data-pane][data-pane-kind="chat"]').first().locator('[data-pane-input]');
  await expect(firstChatInput).toBeFocused();
});
