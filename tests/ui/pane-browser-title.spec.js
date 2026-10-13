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

test('browser title tracks active pane type and target', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  await expect(page).toHaveTitle('Clawnsole · Chat · main');

  const workqueuePane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();
  await workqueuePane.locator('[data-wq-queue-select]').click();
  await expect(page).toHaveTitle('Clawnsole · Workqueue · dev-team');

  await addPane(page, 'Timeline pane');
  await expect(page.locator('[data-pane][data-pane-kind="timeline"]').last()).toBeVisible();
  await expect(page).toHaveTitle('Clawnsole · Timeline');

  const focusByNumber = async (key) => {
    await page.evaluate((value) => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: value,
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      }));
    }, key);
  };

  await focusByNumber('1');
  await expect(page).toHaveTitle('Clawnsole · Chat · main');

  await focusByNumber('2');
  await expect(page).toHaveTitle('Clawnsole · Workqueue · dev-team');

  await focusByNumber('3');
  await expect(page).toHaveTitle('Clawnsole · Timeline');

  await page.locator('[data-pane][data-pane-kind="timeline"]').last().getByTestId('pane-close').click();
  await expect(page).toHaveTitle('Clawnsole · Workqueue · dev-team');
});
