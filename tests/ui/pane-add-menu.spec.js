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

test('pane add menu: opens + adds explicit pane kinds + focuses sane defaults', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const addBtn = page.locator('#addPaneBtn');
  await expect(addBtn).toBeVisible();

  await addBtn.click();
  const menu = page.locator('[data-testid="pane-add-menu"]');
  await expect(menu).toBeVisible();

  await expect(menu.locator('[data-testid="pane-add-menu-chat"]')).toHaveText(/New Chat pane/);
  await expect(menu.locator('[data-testid="pane-add-menu-workqueue"]')).toHaveText(/New Workqueue pane/);
  await expect(menu.locator('[data-testid="pane-add-menu-cron"]')).toHaveText(/New Cron pane/);
  await expect(menu.locator('[data-testid="pane-add-menu-timeline"]')).toHaveText(/New Timeline pane/);

  // Add a workqueue pane and ensure it exists + focus lands on primary control.
  await menu.locator('[data-testid="pane-add-menu-workqueue"]').click();

  const wqPane = page.locator('[data-pane-kind="workqueue"]').last();
  await expect(wqPane).toBeVisible();

  const queueSelect = wqPane.locator('[data-wq-queue-select]');
  await expect(queueSelect).toBeVisible();
  await expect(queueSelect).toBeFocused();
});

test('pane add menu: single click on item adds exactly one pane', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const addBtn = page.locator('#addPaneBtn');
  await expect(addBtn).toBeVisible();

  const countBefore = await page.locator('[data-pane]').count();
  await addBtn.click();
  const menu = page.locator('[data-testid="pane-add-menu"]');
  await expect(menu).toBeVisible();

  await menu.locator('[data-testid="pane-add-menu-workqueue"]').click();
  const countAfter = await page.locator('[data-pane]').count();
  expect(countAfter).toBe(countBefore + 1);
});

test('pane add shortcuts: Ctrl/Cmd+Shift+T adds a timeline pane', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const countBefore = await page.locator('[data-pane]').count();

  // Use a Playwright-friendly cross-platform modifier.
  await page.keyboard.press('ControlOrMeta+Shift+T');

  const tlPane = page.locator('[data-pane-kind="timeline"]').last();
  await expect(tlPane).toBeVisible();

  const countAfter = await page.locator('[data-pane]').count();
  expect(countAfter).toBeGreaterThan(countBefore);
});
