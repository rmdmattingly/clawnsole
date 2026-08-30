const { test, expect } = require('@playwright/test');
const { startTestEnv, attachConsoleErrorAsserts } = require('./_helpers');

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

test('signed-out admin shell shows auth-first state until unlock', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await page.goto(`http://127.0.0.1:${env.serverPort}/admin`);

  await expect(page.getByTestId('signed-out-admin-state')).toBeVisible();
  await expect(page.getByText('Unlock to access Chat + Workqueue + Fleet')).toBeVisible();
  await expect(page.getByTestId('login-overlay')).toHaveClass(/open/);
  await expect(page.getByTestId('pane-grid')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Add pane' })).toBeHidden();
  await expect(page.locator('#layoutSelect')).toBeHidden();
  await expect(page.getByTestId('panes-indicator')).toBeHidden();

  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');

  await expect(page.getByTestId('login-overlay')).not.toHaveClass(/open/, { timeout: 90000 });
  await expect(page.getByTestId('signed-out-admin-state')).toBeHidden();
  await expect(page.getByTestId('pane-grid')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add pane' })).toBeVisible();
  await expect(page.locator('[data-pane]')).toHaveCount(2);
});
