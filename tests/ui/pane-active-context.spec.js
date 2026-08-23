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

test('active pane highlight and topbar chip follow keyboard pane cycling', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await page.setViewportSize({ width: 1280, height: 900 });
  await loginAdmin(page, env.serverPort);
  await page.evaluate(() => localStorage.setItem('clawnsole.admin.layoutMode', 'custom'));
  await addPane(page, 'Timeline pane');

  const chip = page.getByTestId('active-pane-chip');
  const hints = page.getByTestId('shortcut-hint-strip');
  const panes = page.locator('[data-pane]');
  const activePanes = page.locator('[data-pane][data-active-pane="true"]');

  await expect(chip).toBeVisible();

  const firstPane = panes.first();
  const secondPane = panes.nth(1);
  const thirdPane = panes.nth(2);

  await firstPane.evaluate((el) => el.focus());
  await expect(activePanes).toHaveCount(1);
  await expect(firstPane).toHaveAttribute('data-active-pane', 'true');
  await expect(secondPane).toHaveAttribute('data-active-pane', 'false');
  await expect(thirdPane).toHaveAttribute('data-active-pane', 'false');
  await expect(chip).toContainText(/Active\s*A Chat · main/);
  await expect(hints).toBeVisible();
  await expect(hints).toContainText('Focus Chat composer');
  await expect(hints).toContainText('Open/focus Workqueue for active Chat pane');

  await firstPane.locator('[data-pane-input]').focus();
  await expect(hints).toBeHidden();
  await firstPane.evaluate((el) => el.focus());
  await expect(hints).toBeVisible();

  await page.keyboard.press('Control+Shift+K');
  await expect(activePanes).toHaveCount(1);
  await expect(secondPane).toHaveAttribute('data-active-pane', 'true');
  await expect(firstPane).toHaveAttribute('data-active-pane', 'false');
  await expect(thirdPane).toHaveAttribute('data-active-pane', 'false');
  await expect(chip).toContainText(/Active\s*B Workqueue · dev-team/);
  await expect(hints).toContainText('Focus Workqueue item search');
  await expect(hints).toContainText('Move selected row in Workqueue keyboard mode');

  await page.keyboard.press('Control+Shift+K');
  await expect(activePanes).toHaveCount(1);
  await expect(thirdPane).toHaveAttribute('data-active-pane', 'true');
  await expect(firstPane).toHaveAttribute('data-active-pane', 'false');
  await expect(secondPane).toHaveAttribute('data-active-pane', 'false');
  await expect(chip).toContainText(/Active\s*C Timeline ·/);
  await expect(hints).toContainText('Move Fleet selection down');
  await expect(hints).toContainText('Open Chat for selected Fleet agent');

  await page.reload();
  await expect(page.getByTestId('active-pane-chip')).toContainText(/Active\s*C Timeline ·/);
  await expect(page.locator('[data-pane][data-active-pane="true"]')).toHaveCount(1);
  await expect(page.locator('[data-pane]').nth(2)).toHaveAttribute('data-active-pane', 'true');
});
