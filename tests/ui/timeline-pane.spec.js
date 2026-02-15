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

test('timeline pane: add + renders', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  page.on('dialog', (dialog) => {
    throw new Error(`unexpected dialog: ${dialog.type()} ${dialog.message()}`);
  });

  const panes = page.locator('[data-pane]');
  const beforeCount = await panes.count();

  await addPane(page, 'Timeline pane');

  await expect(panes).toHaveCount(beforeCount + 1);
  await expect(panes.last()).toContainText('Timeline');
});
