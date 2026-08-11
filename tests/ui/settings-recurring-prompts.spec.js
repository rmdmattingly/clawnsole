const { test, expect } = require('./fixtures');

test('settings: shortcut overrides validate, persist, and update help', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open settings' }).click();
  await expect(page.locator('#settingsModal')).toHaveAttribute('aria-hidden', 'false');

  const nextShortcut = page.locator('[data-shortcut-action="pane-next"]');
  const prevShortcut = page.locator('[data-shortcut-action="pane-previous"]');
  const managerShortcut = page.locator('[data-shortcut-action="pane-manager"]');

  await expect(page.locator('[data-shortcut-suggestion="pane-manager"]')).toContainText('Use Cmd/Ctrl+Alt/Option+P');
  await page.locator('[data-shortcut-suggestion="pane-manager"]').click();
  await expect(managerShortcut).toHaveValue('Cmd/Ctrl+Alt/Option+P');

  await nextShortcut.click();
  await page.keyboard.press('Control+Alt+Y');
  await expect(nextShortcut).toHaveValue('Cmd/Ctrl+Alt/Option+Y');

  await prevShortcut.click();
  await page.keyboard.press('Control+Alt+Y');
  await page.locator('#shortcutOverridesSave').click();
  await expect(page.locator('#shortcutOverridesError')).toContainText('conflicts');

  await prevShortcut.click();
  await page.keyboard.press('Control+Alt+U');
  await page.locator('#shortcutOverridesSave').click();
  await expect(page.locator('#shortcutOverridesError')).toBeHidden();

  await page.locator('#settingsCloseBtn').click();
  await page.getByRole('button', { name: 'Open keyboard shortcuts' }).click();
  await expect(page.locator('[data-shortcut-help="pane-next"]')).toContainText('Cmd/Ctrl+Alt/Option+Y');
  await expect(page.locator('[data-shortcut-help="pane-manager"]')).toContainText('Cmd/Ctrl+Alt/Option+P');

  await page.reload();
  await clawnsole.waitForAdminUiReady(page);
  await page.getByRole('button', { name: 'Open keyboard shortcuts' }).click();
  await expect(page.locator('[data-shortcut-help="pane-next"]')).toContainText('Cmd/Ctrl+Alt/Option+Y');
  await expect(page.locator('[data-shortcut-help="pane-manager"]')).toContainText('Cmd/Ctrl+Alt/Option+P');
});

test('settings: recurring admin/system prompts list + create + toggle + history filter', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open settings' }).click();
  await expect(page.locator('#settingsModal')).toHaveAttribute('aria-hidden', 'false');

  await expect(page.locator('#recurringPromptRows tr')).toHaveCount(0);
  await expect(page.locator('#recurringPromptHistoryEmpty')).toContainText('No recent runs');

  await page.locator('#recurringPromptMessage').fill('status heartbeat for tests');
  await page.locator('#recurringPromptInterval').fill('15');
  await page.locator('#recurringPromptCreateBtn').click();

  await expect(page.locator('#recurringPromptRows tr')).toHaveCount(1);
  await expect(page.locator('#recurringPromptRows')).toContainText('enabled');
  await expect(page.locator('#recurringPromptRows')).toContainText('every 15 minutes');

  await expect(page.locator('#recurringPromptHistoryFilter option')).toHaveCount(2);

  await page.locator('#recurringPromptRows [data-rp-action="toggle"]').first().click();
  await expect(page.locator('#recurringPromptRows')).toContainText('disabled');
});

test('settings: recurring prompt history error state is shown when runs API fails', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.route('**/api/recurring-prompts/*/runs?limit=50', async (route) => {
    await route.fulfill({ status: 500, body: JSON.stringify({ ok: false, error: 'boom' }) });
  });

  await page.getByRole('button', { name: 'Open settings' }).click();
  await expect(page.locator('#settingsModal')).toHaveAttribute('aria-hidden', 'false');

  await page.locator('#recurringPromptMessage').fill('history failure test');
  await page.locator('#recurringPromptCreateBtn').click();

  await page.locator('#recurringPromptRows [data-rp-action="edit"]').first().click();
  await expect(page.locator('#recurringPromptHistoryEmpty')).toContainText('Failed to load run history.');
});
