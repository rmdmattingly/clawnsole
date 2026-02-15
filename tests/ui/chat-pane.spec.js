const { test, expect } = require('@playwright/test');
const fs = require('fs');

const { startTestEnv, loginAdmin, attachConsoleErrorAsserts } = require('./_helpers');

let env;

test.beforeAll(async () => {
  env = await startTestEnv();
});

test.afterAll(() => {
  env?.stop?.();
});

test.afterEach(async ({ page }) => {
  // Ensure the handler ran (and didn't get GC'd) by calling it only if present.
  if (page.__consoleAsserts) {
    page.__consoleAsserts.assertNoErrors();
  }
});

test('chat pane: send/receive + upload attachment', async ({ page }, testInfo) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const pane = page.locator('[data-pane]').first();
  await expect(pane.locator('[data-pane-send]')).toBeEnabled({ timeout: 90000 });

  // Send/receive.
  await pane.locator('[data-pane-input]').fill('hello');
  await pane.locator('[data-pane-send]').click();
  await expect(pane.locator('[data-chat-role="assistant"]').last()).toContainText('mock-reply: hello');

  // Upload.
  const testFile = testInfo.outputPath('upload.txt');
  fs.writeFileSync(testFile, 'upload test');

  await pane.locator('[data-pane-file-input]').setInputFiles(testFile);
  await expect(pane.locator('[data-pane-attachment-list]')).toContainText('upload.txt');

  await pane.locator('[data-pane-input]').fill('with file');
  await pane.locator('[data-pane-send]').click();
  await expect(pane.locator('[data-chat-role="user"]').last()).toContainText('with file');
});
