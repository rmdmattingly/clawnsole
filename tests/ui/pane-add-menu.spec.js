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

test('pane add shortcuts: Ctrl/Cmd+Shift+Y reuses timeline pane; Alt adds anyway', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await page.evaluate(() => localStorage.setItem('clawnsole.admin.layoutMode', 'custom'));
  await expect(page.locator('#addPaneBtn')).toBeVisible();

  while (await page.locator('[data-pane]').count() > 1) {
    await page.locator('[data-pane] button[aria-label="Close pane"]').last().click();
  }

  const countBefore = await page.locator('[data-pane]').count();
  await page.evaluate(() => document.activeElement?.blur?.());
  await page.locator('body').click({ position: { x: 4, y: 4 } });

  const fireTimelineShortcut = async (forceNew = false) => {
    await page.evaluate(({ force }) => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Y',
        ctrlKey: true,
        shiftKey: true,
        altKey: !!force,
        bubbles: true,
        cancelable: true
      }));
    }, { force: forceNew });
  };

  await fireTimelineShortcut(false);

  const tlPane = page.locator('[data-pane][data-pane-kind="timeline"]').last();
  await expect(tlPane).toBeVisible();

  const countAfter = await page.locator('[data-pane]').count();
  expect(countAfter).toBeGreaterThan(countBefore);

  await fireTimelineShortcut(false);
  const countAfterReuse = await page.locator('[data-pane]').count();
  expect(countAfterReuse).toBe(countAfter);

  await fireTimelineShortcut(true);
  const countAfterForce = await page.locator('[data-pane]').count();
  expect(countAfterForce).toBe(countAfter + 1);
});

test('pane reopen shortcut restores last closed pane slot and chat draft', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await page.evaluate(() => localStorage.setItem('clawnsole.admin.layoutMode', 'custom'));
  await expect(page.locator('#addPaneBtn')).toBeVisible();

  const panes = page.locator('[data-pane]');
  const firstChat = panes.first();
  await expect(firstChat).toHaveAttribute('data-pane-kind', 'chat');
  await firstChat.locator('[data-pane-input]').fill('restore this draft');

  await firstChat.getByTestId('pane-close').click();
  await expect(panes).toHaveCount(1);
  await expect(panes.first()).toHaveAttribute('data-pane-kind', 'workqueue');

  await page.evaluate(() => document.activeElement?.blur?.());
  await page.locator('body').click({ position: { x: 4, y: 4 } });
  await page.keyboard.press('ControlOrMeta+Shift+T');

  await expect(panes).toHaveCount(2);
  await expect(panes.first()).toHaveAttribute('data-pane-kind', 'chat');
  await expect(panes.first().locator('[data-pane-input]')).toHaveValue('restore this draft');
  await expect(page.getByTestId('reopen-pane-toast')).toContainText('Reopened Chat pane');

  await page.evaluate(() => document.activeElement?.blur?.());
  await page.locator('body').click({ position: { x: 4, y: 4 } });
  await page.keyboard.press('ControlOrMeta+Shift+T');
  await expect(panes).toHaveCount(2);
  await expect(page.getByTestId('reopen-pane-empty-toast')).toContainText('No recently closed pane');
});

test('command palette exposes reopen last closed pane action', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await page.evaluate(() => localStorage.setItem('clawnsole.admin.layoutMode', 'custom'));
  await expect(page.locator('#addPaneBtn')).toBeVisible();

  const panes = page.locator('[data-pane]');
  const workqueuePanes = page.locator('[data-pane-kind="workqueue"]');
  const workqueueCountBefore = await workqueuePanes.count();
  expect(workqueueCountBefore).toBeGreaterThan(0);

  await workqueuePanes.first().getByTestId('pane-close').click();
  await expect(workqueuePanes).toHaveCount(workqueueCountBefore - 1);

  await page.keyboard.press('ControlOrMeta+K');
  await page.locator('#commandPaletteInput').fill('reopen last closed');
  await expect(page.locator('[data-command-palette-id="cmd:reopen-closed-pane"]')).toBeVisible();
  await page.keyboard.press('Enter');

  await expect(workqueuePanes).toHaveCount(workqueueCountBefore);
  await expect(panes.nth(1)).toHaveAttribute('data-pane-kind', 'workqueue');
});
