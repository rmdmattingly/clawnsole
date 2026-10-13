const { test, expect } = require('@playwright/test');

const { startTestEnv, loginAdmin, attachConsoleErrorAsserts, addPane } = require('./_helpers');

let env;
const paneInGrid = (page, kind) => page.locator(`[data-testid="pane-grid"] [data-pane-kind="${kind}"]`);

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

test('paired pane toggle focuses an existing Chat/Workqueue counterpart', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);
  await page.addInitScript(() => localStorage.setItem('clawnsole.admin.layoutMode', 'custom'));

  await loginAdmin(page, env.serverPort);

  const chatPane = paneInGrid(page, 'chat').first();
  const workqueuePane = paneInGrid(page, 'workqueue').first();
  await expect(chatPane.locator('[data-pane-input]')).toBeFocused();
  await expect(chatPane.getByTestId('pane-paired-action')).toHaveAttribute('data-paired-state', 'focus');

  await page.keyboard.press('ControlOrMeta+Shift+G');
  await expect(workqueuePane.locator('[data-wq-queue-select]')).toBeFocused();
  await expect(paneInGrid(page, 'workqueue')).toHaveCount(1);

  await page.keyboard.press('ControlOrMeta+Shift+G');
  await expect(chatPane.locator('[data-pane-input]')).toBeFocused();
  await expect(paneInGrid(page, 'chat')).toHaveCount(1);
});

test('paired pane toggle opens a missing counterpart for the same target', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);
  await page.addInitScript(() => localStorage.setItem('clawnsole.admin.layoutMode', 'custom'));

  await loginAdmin(page, env.serverPort);

  const workqueuePane = paneInGrid(page, 'workqueue').first();
  await workqueuePane.getByTestId('pane-close').click();
  await expect(paneInGrid(page, 'workqueue')).toHaveCount(0);

  const chatPane = paneInGrid(page, 'chat').first();
  await expect(chatPane.getByTestId('pane-paired-action')).toHaveAttribute('data-paired-state', 'open');
  await chatPane.locator('[data-pane-input]').focus();

  await page.keyboard.press('ControlOrMeta+Shift+G');

  const reopenedWorkqueue = paneInGrid(page, 'workqueue').first();
  await expect(reopenedWorkqueue).toBeVisible();
  await expect(reopenedWorkqueue.locator('[data-wq-queue-select]')).toBeFocused();
  await expect(reopenedWorkqueue.locator('[data-wq-scope="assigned"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(chatPane.getByTestId('pane-paired-action')).toHaveAttribute('data-paired-state', 'focus');
});

test('paired pane toggle shows a toast when no pair can be resolved', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);
  await page.addInitScript(() => localStorage.setItem('clawnsole.admin.layoutMode', 'custom'));

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Cron pane');
  await paneInGrid(page, 'workqueue').first().getByTestId('pane-close').click();
  await paneInGrid(page, 'chat').first().getByTestId('pane-close').click();
  const cronPane = paneInGrid(page, 'cron').first();
  await expect(page.locator('[data-testid="pane-grid"] [data-pane]')).toHaveCount(1);
  await cronPane.focus();

  await page.keyboard.press('ControlOrMeta+Shift+G');

  await expect(page.getByTestId('paired-pane-toast').last()).toContainText('No Chat or Workqueue pane');
});
