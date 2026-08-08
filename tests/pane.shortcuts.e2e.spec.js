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

async function seedChatOnlyPaneLayout(page, serverPort, { agentId = 'main' } = {}) {
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

test('shortcuts overlay stays in sync with registered shortcut catalog', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.click('#connectionStatus');
  await page.keyboard.press('Shift+/');
  const modal = page.locator('#shortcutsModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  const result = await page.evaluate(() => {
    const catalog = window.__clawnsoleShortcutCatalog?.() || [];
    const rows = Array.from(document.querySelectorAll('#shortcutsModal [data-shortcut-id]'));
    const renderedIds = rows.map((row) => row.getAttribute('data-shortcut-id')).filter(Boolean);
    const renderedIdSet = new Set(renderedIds);
    const renderedTextById = new Map(rows.map((row) => [
      row.getAttribute('data-shortcut-id'),
      String(row.textContent || '').replace(/\s+/g, ' ').trim()
    ]));
    const missing = catalog
      .filter((entry) => !renderedIdSet.has(entry.id) || !renderedTextById.get(entry.id)?.includes(entry.label))
      .map((entry) => entry.id);
    const duplicateIds = renderedIds.filter((id, idx) => renderedIds.indexOf(id) !== idx);
    const globalShortcuts = catalog.filter((entry) => entry.global);
    const duplicateGlobalDisplays = globalShortcuts
      .filter((entry, idx) => entry.display && globalShortcuts.findIndex((candidate) => candidate.display === entry.display) !== idx)
      .map((entry) => `${entry.id}:${entry.display}`);
    return {
      catalogCount: catalog.length,
      rowCount: renderedIds.length,
      missing,
      duplicateIds,
      duplicateGlobalDisplays
    };
  });

  expect(result.catalogCount).toBeGreaterThan(0);
  expect(result.rowCount).toBe(result.catalogCount);
  expect(result.missing).toEqual([]);
  expect(result.duplicateIds).toEqual([]);
  expect(result.duplicateGlobalDisplays).toEqual([]);
  await expect(modal).toContainText('Fleet actions');
  await expect(modal).toContainText('Open/focus Fleet pane');
  await expect(modal).toContainText('Open Fleet sorted by heartbeat age');
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

test('keyboard settings flags risky shortcuts and updates cheatsheet after applying replacement', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByRole('button', { name: 'Open settings' }).click();
  const conflictList = page.getByTestId('keybind-conflict-list');
  await expect(conflictList).toContainText('Focus Chat composer');
  await expect(conflictList).toContainText('Reserved by browser location bar');
  await conflictList.getByRole('button', { name: 'Use Cmd/Ctrl+Shift+M' }).click();
  await expect(conflictList).toContainText('Using app-safe replacement');

  await page.keyboard.press('Escape');
  await page.click('#connectionStatus');
  await page.keyboard.press('Shift+/');
  const modal = page.locator('#shortcutsModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');
  await expect(modal.locator('[data-shortcut-id="chat.composer"]')).toContainText('Cmd/Ctrl+Shift+M');
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

test('cmd/ctrl+alt+j/k cycles chat panes only and keeps typing guard', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const panes = page.locator('[data-pane]');
  await expect(panes).toHaveCount(2);

  const activePaneIndex = async () => page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]'));
    const active = document.activeElement;
    if (!active) return -1;
    return panes.findIndex((p) => p === active || p.contains(active));
  });

  const triggerChatCycle = async (key, { targetInput = false } = {}) => {
    await page.evaluate(({ key, targetInput }) => {
      const event = new KeyboardEvent('keydown', {
        key,
        ctrlKey: true,
        altKey: true,
        bubbles: true,
        cancelable: true
      });
      const target = targetInput
        ? document.querySelector('[data-pane][data-pane-kind="chat"] [data-pane-input]')
        : window;
      target.dispatchEvent(event);
    }, { key, targetInput });
  };

  await page.click('#connectionStatus');
  await page.evaluate(() => focusPaneIndex(0));
  await expect.poll(activePaneIndex).toBe(0);
  await triggerChatCycle('K');
  await expect.poll(activePaneIndex).toBe(0);
  await expect(page.getByTestId('toast').last()).toContainText('Only one Chat pane is open.');

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-chat').click();
  await expect(panes).toHaveCount(3);
  await expect(panes.nth(1)).toHaveAttribute('data-pane-kind', 'workqueue');
  await expect(panes.nth(2)).toHaveAttribute('data-pane-kind', 'chat');

  await page.evaluate(() => focusPaneIndex(0));
  await expect.poll(activePaneIndex).toBe(0);
  await triggerChatCycle('K');
  await expect.poll(activePaneIndex).toBe(2);
  await triggerChatCycle('J');
  await expect.poll(activePaneIndex).toBe(0);

  const firstPaneInput = panes.first().locator('[data-pane-input]');
  await firstPaneInput.focus();
  await expect(firstPaneInput).toBeFocused();
  await triggerChatCycle('K', { targetInput: true });
  await expect.poll(activePaneIndex).toBe(0);
  await expect(page.getByTestId('shortcut-blocked-toast').last()).toContainText('Shortcut paused while typing');
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

  const badges = page.getByTestId('pane-index-badge');
  const hiddenBadgeCount = async () => badges.evaluateAll((els) => els.filter((el) => el.hidden).length);
  await expect(badges).toHaveCount(3);
  await expect.poll(hiddenBadgeCount).toBe(3);

  const firstLabelXBefore = await page.getByTestId('pane-name-token').first().evaluate((el) => el.getBoundingClientRect().x);
  await page.keyboard.down('Alt');
  await expect(badges).toHaveText(['1', '2', '3']);
  await expect(badges.first()).toBeVisible();
  const firstLabelXDuring = await page.getByTestId('pane-name-token').first().evaluate((el) => el.getBoundingClientRect().x);
  expect(firstLabelXDuring).toBe(firstLabelXBefore);
  await page.keyboard.up('Alt');
  await expect.poll(hiddenBadgeCount).toBe(3);

  await page.click('#connectionStatus');
  await page.keyboard.press('Shift+/');
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('aria-hidden', 'false');
  await expect(badges.first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('aria-hidden', 'true');
  await expect.poll(hiddenBadgeCount).toBe(3);

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

test('g then pane letter focuses matching pane and exits cleanly on misses', async ({ page }) => {
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
  await page.keyboard.press('g');
  await page.keyboard.press('b');
  await expect.poll(activePaneIndex).toBe(1);

  await page.keyboard.press('g');
  await page.keyboard.press('z');
  await expect.poll(activePaneIndex).toBe(1);

  await page.keyboard.press('b');
  await expect.poll(activePaneIndex).toBe(1);
});

test('g then pane letter is suppressed while typing and while modals are active', async ({ page }) => {
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
    const panes = Array.from(document.querySelectorAll('[data-pane]')).filter((pane) => pane.getClientRects().length > 0);
    const active = document.activeElement;
    if (!active) return -1;
    return panes.findIndex((p) => p === active || p.contains(active));
  });

  const firstPaneInput = page.locator('[data-pane][data-pane-kind="chat"]').first().locator('[data-pane-input]');
  await page.evaluate(() => focusPaneIndex(0));
  await firstPaneInput.focus();
  await expect(firstPaneInput).toBeFocused();
  await expect.poll(activePaneIndex).toBe(0);
  await page.keyboard.press('g');
  await page.keyboard.press('b');
  await expect(firstPaneInput).toHaveValue('gb');
  await expect.poll(activePaneIndex).toBe(0);

  await page.click('#connectionStatus');
  await page.keyboard.press('Shift+/');
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('aria-hidden', 'false');
  await page.keyboard.press('g');
  await page.keyboard.press('b');
  await page.keyboard.press('Escape');
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('aria-hidden', 'true');
  await expect.poll(activePaneIndex).not.toBe(1);
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
  await expect(page.getByTestId('shortcut-blocked-toast').last()).toContainText('Shortcut paused while typing');

  await page.evaluate(() => {
    document.querySelectorAll('[data-testid="shortcut-blocked-toast"]').forEach((el) => el.remove());
  });
  await page.click('#connectionStatus');
  await page.keyboard.press('Control+Shift+W');
  await expect(panes).toHaveCount(2);
  await expect(page.getByTestId('shortcut-blocked-toast')).toHaveCount(0);
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
  await expect(page.getByTestId('shortcut-blocked-toast').last()).toContainText('Close modal to use this shortcut');
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

test('ctrl/cmd+shift+g opens or focuses workqueue for active chat agent', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await seedChatOnlyPaneLayout(page, app.serverPort);

  const chatInput = page.locator('[data-pane][data-pane-kind="chat"] [data-pane-input]').first();
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(0);

  await chatInput.focus();
  await chatInput.fill('typing');
  await page.keyboard.press('ControlOrMeta+Shift+G');
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(0);
  await expect(page.getByTestId('shortcut-blocked-toast').last()).toContainText('Shortcut paused while typing');

  await page.click('#connectionStatus');
  await page.keyboard.press('ControlOrMeta+Shift+G');

  const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]');
  await expect(wqPane).toHaveCount(1);
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeFocused();
  await expect(wqPane.locator('[data-wq-scope="assigned"]')).toHaveClass(/active/);

  await chatInput.focus();
  await page.keyboard.press('ControlOrMeta+Shift+G');
  await expect(wqPane).toHaveCount(1);
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeFocused();
});

test('pane-navigation shortcuts are blocked in search and modal text fields', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const panes = page.locator('[data-pane]');
  const activePaneIndex = async () => page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]'));
    const active = document.activeElement;
    if (!active) return -1;
    return panes.findIndex((p) => p === active || p.contains(active));
  });

  await expect(panes).toHaveCount(2);
  await page.click('#connectionStatus');
  await page.keyboard.press('ControlOrMeta+P');

  const manager = page.locator('#paneManagerModal');
  const search = page.getByTestId('pane-manager-search');
  await expect(manager).toHaveAttribute('aria-hidden', 'false');
  await search.fill('workqueue');
  await expect(search).toBeFocused();
  await page.keyboard.press('ControlOrMeta+Shift+K');
  await expect(search).toBeFocused();
  await expect(manager).toHaveAttribute('aria-hidden', 'false');
  await expect(page.getByTestId('shortcut-blocked-toast').last()).toContainText('Close modal to use this shortcut');
  await page.evaluate(() => closePaneManager());
  await expect(manager).toHaveAttribute('aria-hidden', 'true');

  await page.evaluate(() => focusPaneIndex(0));
  await expect.poll(activePaneIndex).toBe(0);
  await page.evaluate(() => openWorkqueue());
  const workqueueModal = page.locator('#workqueueModal');
  const title = page.locator('#wqEnqueueTitle');
  await expect(workqueueModal).toHaveAttribute('aria-hidden', 'false');
  await title.focus();
  await title.fill('blocked modal shortcut');
  await page.keyboard.press('ControlOrMeta+Shift+F');
  await expect(title).toBeFocused();
  await expect(panes).toHaveCount(2);
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

  await page.locator('[data-pane][data-pane-kind="chat"] [data-pane-input]').first().focus();
  await page.keyboard.press('Control+Shift+F');
  await expect(panes).toHaveCount(3);
  await expect(timelinePanes).toHaveCount(1);

  await page.click('#connectionStatus');
  await page.keyboard.press('Control+Shift+F');
  await expect(panes).toHaveCount(3);
  await expect(timelinePanes).toHaveCount(1);

  await fleetBtn.click({ modifiers: ['Alt'] });
  await expect(timelinePanes).toHaveCount(2);
});
