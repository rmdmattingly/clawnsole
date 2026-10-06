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

test('chat composer shortcut: focuses most recent chat composer from a workqueue pane', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const chatPane = page.locator('[data-pane][data-pane-kind="chat"]').first();
  const chatInput = chatPane.locator('[data-pane-input]');
  await expect(chatInput).toBeVisible();
  await chatInput.click();
  await expect(chatInput).toBeFocused();

  await addPane(page, 'New Workqueue pane');
  const workqueuePane = page.locator('[data-pane][data-pane-kind="workqueue"]').last();
  const queueSelect = workqueuePane.locator('[data-wq-queue-select]');
  await expect(queueSelect).toBeFocused();

  await page.keyboard.press('ControlOrMeta+L');
  await expect(chatInput).toBeFocused();
});
