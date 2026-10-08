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

async function fireAltNumber(page, n, target = null) {
  const selector = target || 'body';
  await page.locator(selector).dispatchEvent('keydown', {
    key: String(n),
    altKey: true,
    bubbles: true,
    cancelable: true
  });
}

async function expectActiveInsidePane(page, index) {
  await expect.poll(async () => {
    return page.evaluate((idx) => {
      const pane = document.querySelectorAll('[data-pane]')[idx];
      return Boolean(pane && pane.contains(document.activeElement));
    }, index);
  }).toBe(true);
}

test('pane focus shortcuts: Alt/Option+1..3 focus visible panes and respect typing guard', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await expect(page.locator('#addPaneBtn')).toBeVisible();

  while (await page.locator('[data-pane]').count() < 3) {
    await addPane(page, 'Chat pane');
  }

  const panes = page.locator('[data-pane]');
  await expect(panes).toHaveCount(3);

  await page.evaluate(() => document.activeElement?.blur?.());
  await fireAltNumber(page, 1);
  await expectActiveInsidePane(page, 0);

  await fireAltNumber(page, 2);
  await expectActiveInsidePane(page, 1);

  await fireAltNumber(page, 3);
  await expectActiveInsidePane(page, 2);

  const firstInput = panes.nth(0).locator('[data-pane-input]');
  await firstInput.fill('draft text');
  await expect(firstInput).toBeFocused();

  await fireAltNumber(page, 2, '[data-pane]:nth-of-type(1) [data-pane-input]');
  await expect(firstInput).toBeFocused();
  await expect(firstInput).toHaveValue('draft text');
});

test('pane focus shortcuts: cheatsheet lists Alt/Option numeric jumps', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await page.evaluate(() => document.activeElement?.blur?.());
  await page.locator('body').dispatchEvent('keydown', {
    key: '?',
    bubbles: true,
    cancelable: true
  });

  const modal = page.getByTestId('shortcuts-modal');
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Alt');
  await expect(modal).toContainText('Option');
  await expect(modal).toContainText('Focus panes 1-9 by visible order');
});
