const { test, expect } = require('@playwright/test');
const fs = require('fs');

const { startTestEnv, loginAdmin, attachConsoleErrorAsserts, addPane } = require('./_helpers');

let env;

test.beforeAll(async () => {
  env = await startTestEnv();
});

test.afterAll(() => {
  env?.stop?.();
});

test.afterEach(async ({ page }) => {
  // Ensure the handler ran (and didn't get GC'd) by calling it only if present.
  if (page.__consoleAsserts) {
    page.__consoleAsserts.assertNoErrors();
  }
});

test('chat pane: send/receive + upload attachment', async ({ page }, testInfo) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Chat pane');

  const pane = page.locator('[data-pane][data-pane-kind="chat"]').last();
  await expect(pane.locator('[data-pane-send]')).toBeEnabled({ timeout: 90000 });

  // Send/receive.
  await pane.locator('[data-pane-input]').fill('hello');
  await pane.locator('[data-pane-send]').click();
  await expect(pane.locator('[data-chat-role="assistant"]').last()).toContainText('mock-reply: hello');

  // Upload.
  const testFile = testInfo.outputPath('upload.txt');
  fs.writeFileSync(testFile, 'upload test');

  await pane.locator('[data-pane-file-input]').setInputFiles(testFile);
  await expect(pane.locator('[data-pane-attachment-list]')).toContainText('upload.txt');

  await pane.locator('[data-pane-input]').fill('with file');
  await pane.locator('[data-pane-send]').click();
  await expect(pane.locator('[data-chat-role="user"]').last()).toContainText('with file');
});

test('chat pane: stop button can cancel a running response', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Chat pane');

  const pane = page.locator('[data-pane][data-pane-kind="chat"]').last();
  await expect(pane.locator('[data-pane-send]')).toBeEnabled({ timeout: 90000 });

  const stopBtn = pane.locator('[data-pane-stop]');
  await expect(stopBtn).toBeHidden();
  await expect(stopBtn).toBeDisabled();

  await pane.locator('[data-pane-input]').focus();
  await page.keyboard.press('Tab');
  await expect(pane.locator('[data-pane-send]')).toBeFocused();

  await pane.locator('[data-pane-input]').fill('please stream this');
  await pane.locator('[data-pane-send]').click();

  // Streaming begins immediately in mock gateway.
  await expect(pane.locator('.chat-bubble.assistant', { hasText: 'mock-stream: please stream' })).toBeVisible();

  await expect(stopBtn).toBeVisible();
  await expect(stopBtn).toBeEnabled();
  await stopBtn.click();

  await expect(stopBtn).toHaveAttribute('aria-label', 'Canceling…');
  await expect(pane.locator('.chat-bubble.assistant').last()).toContainText('(canceled)', { ignoreCase: true, timeout: 5000 });
  await expect(stopBtn).toBeHidden();
  await expect(stopBtn).toBeDisabled();

  // Cancel should not still emit a completed reply after stream is stopped.
  await expect(pane.locator('.chat-bubble.assistant')).not.toContainText('mock-reply: please stream this', { timeout: 3000 });
});

test('chat pane: unread badge appears on inactive pane and clears on focus', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Chat pane');

  const panes = page.locator('[data-pane][data-pane-kind="chat"]');
  const firstPane = panes.first();
  const secondPane = panes.nth(1);

  await firstPane.locator('[data-pane-input]').fill('badge check');
  await firstPane.locator('[data-pane-send]').click();

  await secondPane.locator('[data-pane-input]').focus();
  await expect(firstPane.locator('[data-chat-role="assistant"]').last()).toContainText('mock-reply: badge check', { timeout: 10000 });

  const firstBadge = firstPane.locator('[data-pane-activity-badge]');
  await expect(firstBadge).toBeVisible();
  await expect(firstBadge).toHaveText('1');
  await expect(firstBadge).toHaveAttribute('aria-label', /unread chat message/);

  await firstPane.locator('[data-pane-input]').focus();
  await expect(firstBadge).toBeHidden();
});

test('topbar workqueue action reuses paired pane for active chat target and falls back to modal', async ({ page }) => {
  test.setTimeout(120000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  // Default layout already has Chat + Workqueue; with active chat focus,
  // topbar Workqueue should focus/reuse the paired pane (not open modal).
  const chatPane = page.locator('[data-pane][data-pane-kind="chat"]').first();
  await chatPane.locator('[data-pane-input]').focus();

  await page.locator('#workqueueBtn').click();
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);
  await expect(page.locator('#workqueueModal')).not.toHaveClass(/open/);

  // Without an active or remembered chat target, preserve modal fallback behavior.
  await chatPane.locator('[data-pane-close]').click();
  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(0);

  await page.locator('#workqueueBtn').click();
  await expect(page.locator('#workqueueModal')).toHaveClass(/open/);
});
