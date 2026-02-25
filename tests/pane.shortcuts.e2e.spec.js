const { test, expect } = require('@playwright/test');
const { installPageFailureAssertions } = require('./helpers/pw-assertions');
const { startClawnsoleTestApp } = require('./helpers/pw-app');

let app;

test.beforeAll(async () => {
  app = await startClawnsoleTestApp();
});

test.afterAll(() => {
  app?.stop?.();
});

test('shortcuts overlay: ? opens, Esc closes, content renders', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const modal = page.locator('#shortcutsModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');

  // The app focuses the first chat input on load; shortcuts should *not* fire while typing.
  // Blur focus so the global shortcuts handler can trigger.
  await page.click('#connectionStatus');

  await page.keyboard.press('Shift+/');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');
  await expect(modal).toContainText('Keyboard shortcuts');
  await expect(modal).toContainText('Pane focus/navigation');
  await expect(modal).toContainText('Pane actions');
  await expect(modal).toContainText('Workqueue actions');
  await expect(modal).toContainText('disabled while typing');

  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');
});

test('shortcuts modal restores prior focus on close', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const openBtn = page.locator('#shortcutsBtn');
  const modal = page.locator('#shortcutsModal');

  await openBtn.focus();
  await expect(openBtn).toBeFocused();
  await openBtn.click();
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');
  await expect(openBtn).toBeFocused();
});

test('cmd/ctrl+shift+j focuses previous pane with wraparound from unfocused state', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-cron').click();
  await expect(page.locator('[data-pane]')).toHaveCount(3);

  const activePaneIndex = async () => page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]'));
    const active = document.activeElement;
    if (!active) return -1;
    return panes.findIndex((p) => p === active || p.contains(active));
  });

  const triggerPrevPaneShortcut = async () => page.evaluate(() => {
    const event = new KeyboardEvent('keydown', {
      key: 'J',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(event);
  });

  await triggerPrevPaneShortcut();
  await expect.poll(activePaneIndex).toBe(2);
});

test('alt+1..3 focuses panes by visible order and does not fire while typing', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-cron').click();
  await expect(page.locator('[data-pane]')).toHaveCount(3);

  const activePaneIndex = async () => page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]'));
    const active = document.activeElement;
    if (!active) return -1;
    return panes.findIndex((p) => p === active || p.contains(active));
  });

  await page.click('#connectionStatus');

  await page.keyboard.press('Alt+2');
  await expect.poll(activePaneIndex).toBe(1);

  await page.keyboard.press('Alt+3');
  await expect.poll(activePaneIndex).toBe(2);

  const firstPaneInput = page.locator('[data-pane]').first().locator('[data-pane-input]');
  await firstPaneInput.focus();
  await expect(firstPaneInput).toBeFocused();

  await page.keyboard.press('Alt+3');
  await expect.poll(activePaneIndex).toBe(0);
});

test('add-pane shortcuts do not fire while typing in chat input', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const panes = page.locator('[data-pane]');
  await expect(panes).toHaveCount(2);

  const input = page.locator('[data-pane-kind="chat"] [data-pane-input]').first();
  await input.focus();
  await input.fill('typing');

  await page.keyboard.press('Control+Shift+W');

  await expect(panes).toHaveCount(2);
});
