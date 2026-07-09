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
  await expect(modal).toContainText('workspace only');

  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');
});

test('pane-add shortcuts are scoped to workspace and blocked by overlays', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const panes = page.locator('[data-pane]');
  const paneCount = async () => panes.count();
  const triggerChatPaneShortcut = async () => page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'C',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
      cancelable: true
    }));
  });

  const initialCount = await paneCount();
  await page.click('#connectionStatus');

  await page.keyboard.press('Shift+/');
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('aria-hidden', 'false');
  await triggerChatPaneShortcut();
  await expect(panes).toHaveCount(initialCount);
  await page.keyboard.press('Escape');
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('aria-hidden', 'true');

  await page.locator('#settingsBtn').click();
  await expect(page.locator('#settingsModal')).toHaveClass(/open/);
  await triggerChatPaneShortcut();
  await expect(panes).toHaveCount(initialCount);
  await page.keyboard.press('Escape');
  await expect(page.locator('#settingsModal')).not.toHaveClass(/open/);

  await page.evaluate(() => window.openWorkqueue?.());
  await expect(page.locator('#workqueueModal')).toHaveClass(/open/);
  await triggerChatPaneShortcut();
  await expect(panes).toHaveCount(initialCount);
  await page.keyboard.press('Escape');
  await expect(page.locator('#workqueueModal')).not.toHaveClass(/open/);

  await page.getByTestId('add-pane-btn').click();
  await expect(page.getByTestId('pane-add-menu')).toBeVisible();
  await triggerChatPaneShortcut();
  await expect(panes).toHaveCount(initialCount);
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('pane-add-menu')).toBeHidden();

  await page.click('#connectionStatus');
  await triggerChatPaneShortcut();
  await expect(panes).toHaveCount(initialCount + 1);
});

test('blocked global shortcuts explain typing and modal guards', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const panes = page.locator('[data-pane]');
  const blockedToasts = page.getByTestId('shortcut-blocked-toast');
  const fireAddChatShortcut = async () => {
    await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'C',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true
      });
      (document.activeElement || window).dispatchEvent(event);
    });
  };

  await expect(panes).toHaveCount(2);

  const input = page.locator('[data-pane][data-pane-kind="chat"] [data-pane-input]').first();
  await input.focus();
  await expect(input).toBeFocused();
  await fireAddChatShortcut();
  await expect(panes).toHaveCount(2);
  await expect(blockedToasts.last()).toContainText('Shortcut paused while typing');

  await page.click('#connectionStatus');
  await page.keyboard.press('Shift+/');
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('aria-hidden', 'false');
  await fireAddChatShortcut();
  await expect(panes).toHaveCount(2);
  await expect(blockedToasts.last()).toContainText('Close modal to use this shortcut');

  await page.keyboard.press('Escape');
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('aria-hidden', 'true');
  const blockedCountBeforeUnblocked = await blockedToasts.count();

  await fireAddChatShortcut();
  await expect(panes).toHaveCount(3);
  expect(await blockedToasts.count()).toBe(blockedCountBeforeUnblocked);
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
  await page.click('#connectionStatus');

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

test('alt+1..3 and cmd/ctrl+1..3 focus panes by visible order; shortcuts do not fire while typing', async ({ page }) => {
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

  await page.keyboard.press('Control+3');
  await expect.poll(activePaneIndex).toBe(2);

  await page.keyboard.press('Control+1');
  await expect.poll(activePaneIndex).toBe(0);

  const firstPaneInput = page.locator('[data-pane]').first().locator('[data-pane-input]');
  await firstPaneInput.focus();
  await expect(firstPaneInput).toBeFocused();

  await page.keyboard.press('Alt+3');
  await expect.poll(activePaneIndex).toBe(0);

  await page.keyboard.press('Control+3');
  await expect.poll(activePaneIndex).toBe(0);
});

test('pane-switch HUD appears for keyboard pane navigation and respects settings', async ({ page }) => {
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

  const hud = page.locator('#paneSwitchHud');
  await page.click('#connectionStatus');

  await page.keyboard.press('Alt+2');
  await expect(hud).toBeVisible();
  await expect(hud).toContainText('B Workqueue');
  await expect(hud).toContainText('dev-team');

  await page.locator('[data-pane]').nth(2).click();
  await expect.poll(() => page.locator('#paneSwitchHud').isVisible()).toBe(false);

  await page.getByRole('button', { name: 'Open settings' }).click();
  const toggle = page.locator('#paneSwitchHudEnabled');
  await expect(toggle).toBeChecked();
  await toggle.uncheck();
  await expect(toggle).not.toBeChecked();
  await page.keyboard.press('Escape');

  await page.keyboard.press('Alt+1');
  await expect.poll(() => page.locator('#paneSwitchHud').isVisible()).toBe(false);
});

test('ctrl+tab switches panes by MRU order and reverses with shift', async ({ page }) => {
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
  await page.waitForTimeout(100);

  const activePaneIndex = async () => page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]'));
    const active = document.activeElement;
    if (!active) return -1;
    return panes.findIndex((p) => p === active || p.contains(active));
  });

  const triggerMruShortcut = async ({ shiftKey = false } = {}) => page.evaluate(({ shiftKey }) => {
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      ctrlKey: true,
      shiftKey,
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(event);
  }, { shiftKey });

  await page.evaluate(() => focusPaneIndex(0));
  await expect.poll(activePaneIndex).toBe(0);
  await page.evaluate(() => focusPaneIndex(1));
  await expect.poll(activePaneIndex).toBe(1);
  await page.evaluate(() => focusPaneIndex(2));
  await expect.poll(activePaneIndex).toBe(2);

  await triggerMruShortcut();
  await expect.poll(activePaneIndex).toBe(1);
  await expect(page.getByTestId('toast').last()).toContainText('B Workqueue');

  await triggerMruShortcut();
  await expect.poll(activePaneIndex).toBe(0);

  await triggerMruShortcut({ shiftKey: true });
  await expect.poll(activePaneIndex).toBe(1);

  const firstPaneInput = page.locator('[data-pane]').first().locator('[data-pane-input]');
  await firstPaneInput.focus();
  await expect(firstPaneInput).toBeFocused();
  await triggerMruShortcut();
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

  const input = page.locator('[data-pane][data-pane-kind="chat"] [data-pane-input]').first();
  await input.focus();
  await input.fill('typing');

  await page.keyboard.press('Control+Shift+W');

  await expect(panes).toHaveCount(2);
});

test('add-pane shortcuts are scoped away from overlays and menus', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const panes = page.locator('[data-pane]');
  const shortcutsModal = page.locator('#shortcutsModal');
  const workqueueModal = page.locator('#workqueueModal');
  const addPaneMenu = page.getByTestId('pane-add-menu');

  const fireAddChatShortcut = async () => {
    await page.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'C',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true
      }));
    });
  };

  await expect(panes).toHaveCount(2);
  await page.click('#connectionStatus');

  await fireAddChatShortcut();
  await expect(panes).toHaveCount(3);
  await page.click('#connectionStatus');

  await page.keyboard.press('Shift+/');
  await expect(shortcutsModal).toHaveAttribute('aria-hidden', 'false');
  await fireAddChatShortcut();
  await expect(panes).toHaveCount(3);
  await page.keyboard.press('Escape');
  await expect(shortcutsModal).toHaveAttribute('aria-hidden', 'true');

  await page.evaluate(() => openWorkqueue());
  await expect(workqueueModal).toHaveAttribute('aria-hidden', 'false');
  await fireAddChatShortcut();
  await expect(panes).toHaveCount(3);
  await page.keyboard.press('Escape');
  await expect(workqueueModal).toHaveAttribute('aria-hidden', 'true');

  await page.getByTestId('add-pane-btn').click();
  await expect(addPaneMenu).toBeVisible();
  await fireAddChatShortcut();
  await expect(panes).toHaveCount(3);
  await page.keyboard.press('Escape');
  await expect(addPaneMenu).toBeHidden();

  await fireAddChatShortcut();
  await expect(panes).toHaveCount(4);
});

test('fleet quick action button + keyboard shortcut focus existing timeline pane without duplicates', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const panes = page.locator('[data-pane]');
  const timelinePanes = page.locator('[data-pane][data-pane-kind="timeline"]');
  const fleetBtn = page.locator('#fleetBtn');

  await expect(panes).toHaveCount(2);
  await expect(timelinePanes).toHaveCount(0);

  await fleetBtn.click();
  await expect(panes).toHaveCount(3);
  await expect(timelinePanes).toHaveCount(1);

  await page.keyboard.press('Control+Shift+F');
  await expect(panes).toHaveCount(3);
  await expect(timelinePanes).toHaveCount(1);

  await fleetBtn.click({ modifiers: ['Alt'] });
  await expect(timelinePanes).toHaveCount(2);
});
