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

test('layout mode chip updates and restores Chat+Workqueue with revert', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const chip = page.getByTestId('layout-mode-chip');
  await expect(chip).toBeVisible();
  await expect(chip).toHaveText(/Chat\+Workqueue/);
  await expect(chip).toHaveAttribute('data-layout-custom', 'false');

  await addPane(page, 'Cron pane');
  await expect(page.locator('[data-pane]')).toHaveCount(3);
  await expect(chip).toHaveText(/Custom/);
  await expect(chip).toHaveAttribute('data-layout-custom', 'true');

  await chip.click();
  await expect(page.locator('[data-pane]')).toHaveCount(2);
  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);
  await expect(chip).toHaveText(/Chat\+Workqueue/);

  const toast = page.getByTestId('layout-mode-restore-toast');
  await expect(toast).toBeVisible();
  await toast.getByTestId('toast-action').click();

  await expect(page.locator('[data-pane]')).toHaveCount(3);
  await expect(page.locator('[data-pane][data-pane-kind="cron"]')).toHaveCount(1);
  await expect(chip).toHaveText(/Custom/);
});
