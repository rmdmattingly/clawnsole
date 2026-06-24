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
  await expect(menu.locator('[data-testid="pane-add-menu-chat"]')).toHaveText(/Chat -> Agent: main/);
  await expect(menu.locator('[data-testid="pane-add-menu-workqueue"]')).toHaveText(/Workqueue -> Queue: dev-team \/ unassigned/);

  // Add a workqueue pane and ensure it exists + focus lands on primary control.
  await menu.locator('[data-testid="pane-add-menu-workqueue"]').click();

  const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]').last();
  await expect(wqPane).toBeVisible();

  const queueSelect = wqPane.locator('[data-wq-queue-select]');
  await expect(queueSelect).toBeVisible();
  await expect(queueSelect).toBeFocused();
});

test('pane add menu: workqueue override is applied before pane opens', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await page.evaluate(() => localStorage.setItem('clawnsole.admin.layoutMode', 'custom'));

  while (await page.locator('[data-pane]').count() > 1) {
    await page.locator('[data-pane] button[aria-label="Close pane"]').last().click();
  }

  await page.locator('#addPaneBtn').click();
  const menu = page.locator('[data-testid="pane-add-menu"]');
  await expect(menu).toBeVisible();

  await menu.locator('[data-testid="pane-add-menu-workqueue-queue"]').fill('ci-team');
  await menu.locator('[data-testid="pane-add-menu-workqueue-scope"]').selectOption('all');
  await expect(menu.locator('[data-testid="pane-add-menu-workqueue"]')).toHaveText(/Workqueue -> Queue: ci-team \/ all/);

  await menu.locator('[data-testid="pane-add-menu-workqueue"]').click();

  const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]').last();
  await expect(wqPane).toBeVisible();
  await expect(wqPane.getByTestId('pane-destination-value')).toHaveText('ci-team');
  await expect(wqPane.locator('[data-wq-scope="all"]')).toHaveAttribute('aria-pressed', 'true');
});

test('pane add menu: single click reuses matching non-chat pane target', async ({ page }) => {
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
  expect(countAfter).toBe(countBefore);

  await addBtn.click();
  await expect(menu).toBeVisible();
  await menu.locator('[data-testid="pane-add-menu-workqueue"]').click({ modifiers: ['Alt'] });
  const countAfterAlt = await page.locator('[data-pane]').count();
  expect(countAfterAlt).toBe(countBefore + 1);
});

test('pane shortcut: Ctrl/Cmd+Shift+T reopens last closed pane with draft state', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await page.evaluate(() => localStorage.setItem('clawnsole.admin.layoutMode', 'custom'));
  await expect(page.locator('#addPaneBtn')).toBeVisible();

  while (await page.locator('[data-pane]').count() > 1) {
    await page.locator('[data-pane] button[aria-label="Close pane"]').last().click();
  }

  await page.locator('#addPaneBtn').click();
  await page.locator('[data-testid="pane-add-menu-chat"]').click();

  const panesBeforeClose = page.locator('[data-pane]');
  await expect(panesBeforeClose).toHaveCount(2);
  const draftText = 'draft survives pane reopen';
  await panesBeforeClose.nth(1).locator('[data-pane-input]').fill(draftText);
  await panesBeforeClose.nth(1).locator('button[aria-label="Close pane"]').click();
  await expect(page.locator('[data-pane]')).toHaveCount(1);

  const fireReopenShortcut = async () => {
    await page.evaluate(({ force }) => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'T',
        ctrlKey: true,
        shiftKey: true,
        altKey: !!force,
        bubbles: true,
        cancelable: true
      }));
    }, { force: false });
  };

  await fireReopenShortcut();

  const panesAfterReopen = page.locator('[data-pane]');
  await expect(panesAfterReopen).toHaveCount(2);
  await expect(panesAfterReopen.nth(1)).toHaveAttribute('data-pane-kind', 'chat');
  await expect(panesAfterReopen.nth(1).locator('[data-pane-input]')).toHaveValue(draftText);
});
