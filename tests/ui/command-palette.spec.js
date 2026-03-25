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

test('command palette: Ctrl/Cmd+K opens and can add a pane', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const countBefore = await page.locator('[data-pane]').count();

  await page.keyboard.press('ControlOrMeta+K');

  const modal = page.locator('[data-testid="command-palette-modal"]');
  await expect(modal).toBeVisible();

  const input = page.locator('#commandPaletteInput');
  await expect(input).toBeFocused();

  await input.type('add pane: timeline');
  await page.keyboard.press('Enter');

  const tlPane = page.locator('[data-pane-kind="timeline"]').last();
  await expect(tlPane).toBeVisible();

  const countAfter = await page.locator('[data-pane]').count();
  expect(countAfter).toBeGreaterThan(countBefore);
});

test('command palette: generated agent actions are collapsed and auto-expand on search', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await page.keyboard.press('ControlOrMeta+K');

  const modal = page.locator('[data-testid="command-palette-modal"]');
  await expect(modal).toBeVisible();

  const input = page.locator('#commandPaletteInput');
  await expect(input).toBeFocused();

  await expect(page.locator('.command-palette-item', { hasText: 'Agent targets (1)' })).toBeVisible();
  await expect(page.locator('.command-palette-item-label', { hasText: 'Agent: main' })).toHaveCount(0);

  await input.fill('agent: main');
  await expect(page.locator('.command-palette-item-label', { hasText: 'Agent: main' })).toBeVisible();
  await expect(page.locator('.command-palette-item-detail', { hasText: 'CHAT · main' })).toBeVisible();
});

test('command palette: agent target prefers focusing existing pane for that target', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const chatMain = page.locator('[data-pane-kind="chat"][data-pane-target="main"]');
  await expect(chatMain).toHaveCount(1);

  await page.keyboard.press('ControlOrMeta+K');
  const input = page.locator('#commandPaletteInput');
  await input.fill('agent: main');
  await page.keyboard.press('Enter');

  await expect(chatMain).toHaveCount(1);
});

test('command palette: workqueue for active chat agent covers create, focus-existing, and no-agent paths', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  const runCommand = async (text) => {
    await page.keyboard.press('ControlOrMeta+K');
    const input = page.locator('#commandPaletteInput');
    await expect(input).toBeFocused();
    await input.fill(text);
    await page.keyboard.press('Enter');
  };

  await page.locator('[data-pane-kind="workqueue"] [data-pane-close]').first().click();
  await expect(page.locator('[data-pane-kind="workqueue"]')).toHaveCount(0);

  await page.locator('[data-pane-kind="chat"]').first().locator('[data-pane-input]').click();
  await runCommand('workqueue for active chat agent');

  const wqPane = page.locator('[data-pane-kind="workqueue"]');
  await expect(wqPane).toHaveCount(1);

  await expect(wqPane.first().locator('[data-wq-scope="assigned"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(wqPane.first().locator('[data-wq-claim-agent]')).toHaveValue('main');

  await runCommand('workqueue for active chat agent');
  await expect(wqPane).toHaveCount(1);

  await wqPane.first().click();
  await runCommand('workqueue for active chat agent');

  await expect(page.locator('[data-testid="toast"], .toast')).toContainText('No active chat agent selected');
});
