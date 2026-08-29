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

async function loginAdminWithChatOnlyPane(page, serverPort, { agentId = 'main' } = {}) {
  await page.addInitScript((nextAgentId) => {
    localStorage.setItem('clawnsole.admin.layoutMode', 'custom');
    localStorage.setItem('clawnsole.admin.agentId', nextAgentId);
    localStorage.setItem(
      'clawnsole.admin.panes.v1',
      JSON.stringify([{ key: 'ptestchat', kind: 'chat', agentId: nextAgentId }])
    );
  }, agentId);
  await page.goto(`http://127.0.0.1:${serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });
}

async function openCommandPaletteFromWorkspace(page) {
  await page.evaluate(() => document.activeElement?.blur?.());
  await page.keyboard.press('ControlOrMeta+K');
}

test('command palette: keyboard flow can reuse a targeted pane and focus by pane letter', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const countBefore = await page.locator('[data-pane]').count();

  await openCommandPaletteFromWorkspace(page);

  const modal = page.locator('[data-testid="command-palette-modal"]');
  await expect(modal).toBeVisible();

  const input = page.locator('#commandPaletteInput');
  await expect(input).toBeVisible();
  await input.click();

  await input.type('open workqueue: dev-team');
  const firstHit = page.locator('#commandPaletteList [role="option"]').first();
  await expect(firstHit).toHaveAttribute('data-command-palette-id', /^cmd:focus-pane-/);
  await expect(firstHit.locator('.command-palette-item-label')).toHaveText('Focus Workqueue: dev-team');
  await expect(firstHit.locator('.command-palette-pane-chip')).toContainText(['Workqueue', 'dev-team', 'focus existing']);
  await page.keyboard.press('Enter');

  const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]').last();
  await expect(wqPane).toBeVisible();
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeFocused();

  const countAfter = await page.locator('[data-pane]').count();
  expect(countAfter).toBe(countBefore);

  await openCommandPaletteFromWorkspace(page);
  await expect(input).toBeVisible();
  await input.click();
  await input.fill('open chat');
  await page.keyboard.press('Enter');

  await openCommandPaletteFromWorkspace(page);
  await expect(input).toBeVisible();
  await input.click();
  await input.fill('focus pane a');
  await page.keyboard.press('Enter');

  const firstChatInput = page.locator('[data-pane][data-pane-kind="chat"]').first().locator('[data-pane-input]');
  await expect(firstChatInput).toBeFocused();
});

test('command palette: duplicate pane focus actions include stable ordinals', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);
  await loginAdmin(page, env.serverPort);

  await page.locator('#addPaneBtn').click();
  await page.getByTestId('pane-add-menu-chat').click();

  await expect(page.locator('[data-pane][data-pane-kind="chat"]').nth(0).getByTestId('pane-type-label')).toHaveText(/^A Chat · main \(1\)$/);
  await expect(page.locator('[data-pane][data-pane-kind="chat"]').nth(1).getByTestId('pane-type-label')).toHaveText(/^C Chat · main \(2\)$/);

  await openCommandPaletteFromWorkspace(page);
  const input = page.locator('#commandPaletteInput');
  await expect(input).toBeVisible();
  await input.fill('focus chat main');

  const focusChatItems = page.locator('#commandPaletteList [role="option"][data-command-palette-id^="cmd:focus-pane-"]', { hasText: /Focus Chat: main/ });
  await expect(focusChatItems).toHaveCount(2);
  await expect(focusChatItems.nth(0).locator('.command-palette-item-label')).toHaveText('Focus Chat: main (1)');
  await expect(focusChatItems.nth(1).locator('.command-palette-item-label')).toHaveText('Focus Chat: main (2)');
  await expect(focusChatItems.nth(0).locator('.command-palette-pane-chip')).toContainText(['Chat', 'main (1)', 'focus existing']);
  await expect(focusChatItems.nth(1).locator('.command-palette-pane-chip')).toContainText(['Chat', 'main (2)', 'focus existing']);
});

test('command palette: groups core actions and collapses per-agent targets until expanded or searched', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);
  await loginAdmin(page, env.serverPort);

  await openCommandPaletteFromWorkspace(page);
  const modal = page.locator('[data-testid="command-palette-modal"]');
  await expect(modal).toBeVisible();

  const list = page.locator('#commandPaletteList');
  await expect(list.locator('.command-palette-group', { hasText: /^Panes$/ })).toBeVisible();
  await expect(list.locator('.command-palette-group', { hasText: /^Navigation$/ })).toBeVisible();
  await expect(list.getByRole('option', { name: /Agent targets/i })).toBeVisible();
  await expect(list.getByRole('option', { name: /Timeline targets/i })).toBeVisible();

  await expect(list.getByRole('option', { name: /Agent: /i })).toHaveCount(0);

  const input = page.locator('#commandPaletteInput');
  await input.fill('agent: main');
  await expect(list.getByRole('option', { name: /Agent: main/i })).toBeVisible();
});

test('pane navigation: returns to the last active chat pane from shortcut and command palette', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);
  await loginAdmin(page, env.serverPort);

  const chatInput = page.locator('[data-pane][data-pane-kind="chat"]').first().locator('[data-pane-input]');
  const workqueuePane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();
  const queueSelect = workqueuePane.locator('[data-wq-queue-select]');

  await expect(chatInput).toBeVisible();
  await chatInput.click();
  await expect(chatInput).toBeFocused();

  await expect(queueSelect).toBeVisible();
  await queueSelect.focus();
  await expect(queueSelect).toBeFocused();

  await page.evaluate(() => document.activeElement?.blur?.());
  await page.keyboard.press('g');
  await page.keyboard.press('c');
  await expect(chatInput).toBeFocused();

  await queueSelect.focus();
  await expect(queueSelect).toBeFocused();

  await openCommandPaletteFromWorkspace(page);
  const input = page.locator('#commandPaletteInput');
  await expect(input).toBeVisible();
  await input.fill('return last active chat');
  await page.keyboard.press('Enter');

  await expect(chatInput).toBeFocused();
});

test('command palette: opens or focuses Workqueue for active chat agent', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);
  await loginAdminWithChatOnlyPane(page, env.serverPort);

  const runCommand = async (query, { originPane } = {}) => {
    if (originPane) {
      await originPane.getByTestId('pane-help').focus();
      await page.keyboard.press('ControlOrMeta+K');
    } else {
      await openCommandPaletteFromWorkspace(page);
    }
    const input = page.locator('#commandPaletteInput');
    await expect(input).toBeVisible();
    await input.fill(query);
    await page.keyboard.press('Enter');
  };

  const chatInput = page.locator('[data-pane][data-pane-kind="chat"]').first().locator('[data-pane-input]');
  await expect(chatInput).toBeVisible();
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(0);

  const chatPane = page.locator('[data-pane][data-pane-kind="chat"]').first();
  await chatInput.focus();
  await runCommand('workqueue for active chat agent', { originPane: chatPane });

  const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]');
  await expect(wqPane).toHaveCount(1);
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeFocused();
  await expect(wqPane.locator('[data-wq-scope="assigned"]')).toHaveClass(/active/);

  await chatInput.focus();
  await runCommand('workqueue for active chat agent', { originPane: chatPane });
  await expect(wqPane).toHaveCount(1);
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeFocused();

  await wqPane.locator('[data-wq-queue-select]').focus();
  await runCommand('workqueue for active chat agent', { originPane: wqPane });
  await expect(page.getByTestId('toast').filter({ hasText: 'No active chat agent selected' })).toBeVisible();
});

test('layout triage preset reuses panes and preserves chat draft', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);
  await loginAdminWithChatOnlyPane(page, env.serverPort);

  const chatInput = page.locator('[data-pane][data-pane-kind="chat"]').first().locator('[data-pane-input]');
  await expect(chatInput).toBeVisible();
  await chatInput.fill('draft stays put');
  await expect(page.locator('[data-pane]')).toHaveCount(1);

  await page.getByRole('button', { name: 'Open settings' }).click();
  await expect(page.locator('#triageLayoutPresetBtn')).toBeVisible();
  await page.keyboard.press('Escape');

  await openCommandPaletteFromWorkspace(page);
  const input = page.locator('#commandPaletteInput');
  await expect(input).toBeVisible();
  await input.fill('triage preset');
  const firstHit = page.locator('#commandPaletteList [role="option"]').first();
  await expect(firstHit).toHaveAttribute('data-command-palette-id', 'cmd:triage-layout-preset');
  await expect(firstHit.locator('.command-palette-item-label')).toHaveText('Layout: Triage focus');
  await page.keyboard.press('Enter');

  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="timeline"]')).toHaveCount(1);
  await expect(chatInput).toHaveValue('draft stays put');

  await openCommandPaletteFromWorkspace(page);
  await expect(input).toBeVisible();
  await input.fill('triage preset');
  await page.keyboard.press('Enter');

  await expect(page.locator('[data-pane]')).toHaveCount(3);
  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="timeline"]')).toHaveCount(1);
  await expect(chatInput).toHaveValue('draft stays put');
});
