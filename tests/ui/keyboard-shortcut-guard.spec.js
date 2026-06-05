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

async function focusedPaneIndex(page) {
  return page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]'));
    const active = document.activeElement;
    return panes.findIndex((pane) => pane === active || (active && pane.contains(active)));
  });
}

test('pane shortcuts: composer focus blocks global pane navigation', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const input = page.locator('[data-pane][data-pane-kind="chat"]').first().locator('[data-pane-input]');
  await input.fill('draft should keep focus');
  await expect(input).toBeFocused();
  expect(await focusedPaneIndex(page)).toBe(0);

  await page.keyboard.press('ControlOrMeta+Shift+K');

  await expect(input).toBeFocused();
  expect(await focusedPaneIndex(page)).toBe(0);
});

test('pane shortcuts: workqueue filter focus blocks global pane navigation', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const search = page.locator('[data-pane][data-pane-kind="workqueue"]').first().locator('[data-wq-queue-search]');
  await expect(search).toBeVisible();
  await search.fill('dev');
  await expect(search).toBeFocused();
  expect(await focusedPaneIndex(page)).toBe(1);

  await page.keyboard.press('ControlOrMeta+Shift+J');

  await expect(search).toBeFocused();
  expect(await focusedPaneIndex(page)).toBe(1);
});

test('pane shortcuts: modal text field focus blocks global pane navigation', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  await page.keyboard.press('ControlOrMeta+P');
  const modal = page.locator('#paneManagerModal');
  const search = page.getByTestId('pane-manager-search');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');
  await search.click();
  await expect(search).toBeFocused();

  await page.keyboard.press('ControlOrMeta+1');

  await expect(modal).toHaveAttribute('aria-hidden', 'false');
  await expect(search).toBeFocused();
});
