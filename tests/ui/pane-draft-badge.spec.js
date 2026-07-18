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
  if (page.__consoleAsserts) page.__consoleAsserts.assertNoErrors();
});

test('pane draft badge appears, persists across pane switches, and clears on send', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Chat pane');

  const chatPanes = page.locator('[data-pane][data-pane-kind="chat"]');
  const firstPane = chatPanes.first();
  const secondPane = chatPanes.nth(1);
  const firstDraftBadge = firstPane.getByTestId('pane-draft-badge');

  await expect(firstPane.locator('[data-pane-send]')).toBeEnabled({ timeout: 90000 });
  await expect(firstDraftBadge).toBeHidden();

  await firstPane.getByTestId('pane-input').fill('draft badge check');
  await expect(firstDraftBadge).toBeVisible();
  await expect(firstDraftBadge).toHaveAttribute('aria-label', 'Has unsent draft');
  await expect(firstPane).toHaveAttribute('aria-label', /Has unsent draft/);

  await secondPane.getByTestId('pane-input').focus();
  await expect(firstDraftBadge).toBeVisible();

  await page.locator('#paneManagerBtn').click();
  const manager = page.getByTestId('pane-manager-modal');
  await expect(manager).toHaveClass(/open/);
  const draftRows = manager.locator('.pane-manager-row', { has: page.getByTestId('pane-manager-draft-badge') });
  await expect(draftRows).toHaveCount(1);
  await expect(draftRows.first()).toHaveAttribute('aria-label', /Has unsent draft/);

  await page.locator('#paneManagerCloseBtn').click();
  await firstPane.getByTestId('pane-send').click();
  await expect(firstDraftBadge).toBeHidden();
  await expect(firstPane).toHaveAttribute('aria-label', /No unsent draft/);

  await page.locator('#paneManagerBtn').click();
  await expect(page.getByTestId('pane-manager-draft-badge')).toHaveCount(0);
});
