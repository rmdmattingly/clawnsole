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

test('command palette: keyboard flow can reuse a targeted pane and focus by pane letter', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const countBefore = await page.locator('[data-pane]').count();

  await page.keyboard.press('ControlOrMeta+K');

  const modal = page.locator('[data-testid="command-palette-modal"]');
  await expect(modal).toBeVisible();

  const input = page.locator('#commandPaletteInput');
  await expect(input).toBeVisible();
  await input.click();

  await input.type('open workqueue: dev-team');
  await page.keyboard.press('Enter');

  const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]').last();
  await expect(wqPane).toBeVisible();
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeFocused();

  const countAfter = await page.locator('[data-pane]').count();
  expect(countAfter).toBe(countBefore);

  await page.keyboard.press('ControlOrMeta+K');
  await expect(input).toBeVisible();
  await input.click();
  await input.fill('open chat');
  await page.keyboard.press('Enter');

  await page.keyboard.press('ControlOrMeta+K');
  await expect(input).toBeVisible();
  await input.click();
  await input.fill('focus pane a');
  await page.keyboard.press('Enter');

  const firstChatInput = page.locator('[data-pane][data-pane-kind="chat"]').first().locator('[data-pane-input]');
  await expect(firstChatInput).toBeFocused();
});

test('command palette: groups core actions and collapses per-agent targets until expanded or searched', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);
  await loginAdmin(page, env.serverPort);

  await page.keyboard.press('ControlOrMeta+K');
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

  await page.keyboard.press('ControlOrMeta+K');
  const input = page.locator('#commandPaletteInput');
  await expect(input).toBeVisible();
  await input.fill('return last active chat');
  await page.keyboard.press('Enter');

  await expect(chatInput).toBeFocused();
});
