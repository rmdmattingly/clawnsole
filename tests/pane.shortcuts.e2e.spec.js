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
  const trigger = page.getByTestId('shortcuts-btn');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');

  // The app focuses the first chat input on load; shortcuts should *not* fire while typing.
  // Blur focus so the global shortcuts handler can trigger.
  await page.click('#connectionStatus');

  await page.keyboard.press('Shift+/');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('shortcutsSearchInput');
  await expect(modal).toContainText('Keyboard shortcuts');
  await expect(modal).toContainText('Pane focus/navigation');
  await expect(modal).toContainText('Pane actions');
  await expect(modal).toContainText('Workqueue actions');
  await expect(modal).toContainText('disabled while typing');
  await expect(modal).toContainText('workspace only');
  await expect(modal.locator('[data-shortcut-status]').first()).toBeVisible();
  await expect(modal).toContainText('Available');
  await expect(modal).toContainText('Blocked: modal-open');
  await expect(modal).toContainText('Blocked: layout-state');

  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('shortcutsSearchInput');

  await page.getByTestId('shortcuts-search').fill('workqueue');
  await expect(modal.locator('.shortcut-group-title', { hasText: 'Workqueue actions' })).toBeVisible();
  await expect(modal.locator('.shortcut-group-title', { hasText: 'Global' })).toBeHidden();

  await page.getByTestId('shortcuts-search').fill('zzzz');
  await expect(modal.locator('#shortcutsEmpty')).toBeVisible();

  await page.getByTestId('shortcuts-search').fill('');
  await modal.locator('[data-shortcuts-filter="fleet"]').click();
  await expect(modal.locator('.shortcut-group-title', { hasText: 'Pane actions' })).toBeVisible();
  await expect(modal.locator('[data-shortcuts-filter="fleet"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(modal.locator('.shortcut-group-title', { hasText: 'Workqueue actions' })).toBeHidden();

  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('shortcutsBtn');
});

test('holding Alt reveals visible pane focus index badges', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const badges = page.locator('[data-pane-index-badge]');
  await expect(badges.first()).toHaveText('1');
  await expect(badges.first()).toBeHidden();

  await page.keyboard.down('Alt');
  await expect(badges.first()).toBeVisible();
  await expect(badges.first()).toHaveText('1');

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-chat').click();
  await expect(page.locator('[data-pane]')).toHaveCount(3);
  await expect(badges.nth(2)).toBeVisible();
  await expect(badges.nth(2)).toHaveText('3');

  await page.keyboard.up('Alt');
  await expect(badges.first()).toBeHidden();
  await expect(badges.nth(2)).toBeHidden();
});

test('shortcuts overlay: status panel shows typing-focus block reason', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const input = page.locator('[data-pane][data-pane-kind="chat"] [data-pane-input]').first();
  const modal = page.locator('#shortcutsModal');
  await input.focus();
  await input.fill('typing');

  await page.evaluate(() => window.openShortcuts?.());
  await expect(modal).toHaveAttribute('aria-hidden', 'false');
  await expect(modal).toContainText('Blocked: typing-focus');

  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');
});

test('paired-pane toggle shortcut focuses an existing counterpart without duplicating panes', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const panes = page.locator('[data-pane]');
  const activePaneIndex = async () => page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]')).filter((pane) => pane.getClientRects().length > 0);
    const active = document.activeElement;
    if (!active) return -1;
    return panes.findIndex((p) => p === active || p.contains(active));
  });

  await expect(panes).toHaveCount(2);
  await expect(panes.first()).toHaveAttribute('data-pane-kind', 'chat');
  await expect(panes.nth(1)).toHaveAttribute('data-pane-kind', 'workqueue');

  await page.click('#connectionStatus');
  await page.keyboard.press('Control+Shift+L');
  await expect.poll(activePaneIndex).toBe(1);
  await expect(panes).toHaveCount(2);
  await expect(page.getByTestId('paired-pane-toggle-toast').last()).toContainText('Focused paired Workqueue pane.');

  await page.keyboard.press('Control+Shift+L');
  await expect.poll(activePaneIndex).toBe(0);
  await expect(panes).toHaveCount(2);
  await expect(page.getByTestId('paired-pane-toggle-toast').last()).toContainText('Focused paired Chat pane.');
});

test('paired-pane toggle shortcut opens a missing counterpart for the same target', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await seedChatOnlyPaneLayout(page, app.serverPort, { agentId: 'main' });

  const panes = page.locator('[data-pane]');
  const activePaneIndex = async () => page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]')).filter((pane) => pane.getClientRects().length > 0);
    const active = document.activeElement;
    if (!active) return -1;
    return panes.findIndex((p) => p === active || p.contains(active));
  });

  await expect(panes).toHaveCount(1);
  await expect(panes.first()).toHaveAttribute('data-pane-kind', 'chat');

  await page.click('#connectionStatus');
  await page.keyboard.press('Control+Shift+L');
  await expect(panes).toHaveCount(2);
  await expect(panes.nth(1)).toHaveAttribute('data-pane-kind', 'workqueue');
  await expect.poll(() => page.evaluate(() => {
    const panes = JSON.parse(localStorage.getItem('clawnsole.admin.panes.v1') || '[]');
    return panes?.[1]?.agentId || '';
  })).toBe('main');
  await expect.poll(activePaneIndex).toBe(1);
  await expect(page.getByTestId('paired-pane-toggle-toast').last()).toContainText('Opened paired Workqueue pane.');
});

test('inline shortcut hints follow active pane and hide while typing', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const strip = page.getByTestId('shortcut-hint-strip');
  const chatInput = page.locator('[data-pane][data-pane-kind="chat"] [data-pane-input]').first();

  await expect(chatInput).toBeFocused();
  await expect(strip).toBeHidden();

  await page.locator('[data-pane][data-pane-kind="chat"]').first().click({ position: { x: 18, y: 18 } });
  await expect(strip).toBeVisible();
  await expect(strip).toHaveAttribute('data-shortcut-pane-kind', 'chat');
  await expect(strip).toContainText('Chat');
  await expect(strip).toContainText('Cmd/Ctrl+L');
  await expect(strip).toContainText('Press ?');

  await page.locator('[data-pane][data-pane-kind="workqueue"]').first().click({ position: { x: 18, y: 18 } });
  await expect(strip).toBeVisible();
  await expect(strip).toHaveAttribute('data-shortcut-pane-kind', 'workqueue');
  await expect(strip).toContainText('Workqueue');
  await expect(strip).toContainText('j/k');
  await expect(strip).toContainText('Enter');

  await page.getByTestId('shortcut-hint-strip').getByRole('button', { name: 'Press ? for all shortcuts' }).click();
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('aria-hidden', 'false');
  await page.keyboard.press('Escape');
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('aria-hidden', 'true');

  await page.getByRole('button', { name: 'Open fleet pane' }).click();
  await page.locator('[data-pane][data-pane-kind="timeline"]').first().click({ position: { x: 18, y: 18 } });
  await expect(strip).toBeVisible();
  await expect(strip).toHaveAttribute('data-shortcut-pane-kind', 'timeline');
  await expect(strip).toContainText('Fleet');
  await expect(strip).toContainText('Shift+Enter');

  await chatInput.focus();
  await expect(strip).toBeHidden();
});

test('shortcuts overlay filters by search text and category chips', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.click('#shortcutsBtn');
  const modal = page.locator('#shortcutsModal');
  const search = page.getByTestId('shortcuts-search');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');
  await expect(search).toBeFocused();

  await search.fill('cmd/ctrl+shift+g');
  await expect(modal.locator('[data-shortcut-id="workqueue.openForActiveChat"]')).toBeVisible();
  await expect(modal.locator('[data-shortcut-id="fleet.open"]')).toBeHidden();

  await search.fill('');
  await modal.getByRole('button', { name: 'Fleet' }).click();
  await expect(modal.locator('[data-shortcut-id="fleet.open"]')).toBeVisible();
  await expect(modal.locator('[data-shortcut-id="workqueue.open"]')).toBeHidden();

  await search.fill('definitely-no-shortcut');
  await expect(modal).toContainText('No shortcuts match your filters.');

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
  await expect(modal).toContainText('Focus Fleet: first needs attention');
  await expect(modal).toContainText('Open Fleet sorted by heartbeat age');
  await expect(modal).toContainText('Open Chat for selected Fleet agent');
  await expect(modal).toContainText('Open Workqueue for selected Fleet agent');
  await expect(modal).toContainText('Open Timeline for selected Fleet agent');
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

  await expect(panes).toHaveCount(2);
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

test('labeled header controls setting persists and respects narrow viewport fallback', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const settingsLabel = page.locator('#settingsBtn .btn-label');
  const shortcutsLabel = page.locator('#shortcutsBtn .btn-label');
  await expect(settingsLabel).toBeVisible();
  await expect(shortcutsLabel).toBeVisible();
  await expect(page.locator('#settingsBtn')).toHaveAttribute('aria-label', 'Open settings');

  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.locator('#headerLabeledControlsEnabled').uncheck();
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).toHaveClass(/header-labels-off/);
  await expect(settingsLabel).toBeHidden();

  await page.reload();
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });
  await expect(page.locator('body')).toHaveClass(/header-labels-off/);
  await expect(settingsLabel).toBeHidden();

  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.locator('#headerLabeledControlsEnabled').check();
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/header-labels-off/);
  await expect(settingsLabel).toBeVisible();

  await page.setViewportSize({ width: 760, height: 800 });
  await expect(settingsLabel).toBeHidden();
  await expect(page.locator('#settingsBtn')).toHaveAttribute('aria-label', 'Open settings');
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

test('topbar shortcut hints follow active pane and typing focus', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const strip = page.getByTestId('shortcut-hint-strip');
  const chatInput = page.locator('[data-pane][data-pane-kind="chat"] [data-pane-input]').first();
  await chatInput.focus();
  await expect(strip).toBeHidden();

  await page.locator('[data-pane]').first().getByTestId('pane-help').focus();
  await expect(strip).toBeVisible();
  await expect(strip).toContainText('Chat composer');
  await expect(strip).toContainText('Press ?');

  await page.evaluate(() => window.focusPaneIndex?.(1));
  await expect(page.getByTestId('active-pane-chip')).toContainText('B Workqueue');
  await expect(strip).toContainText('j/k');
  await expect(strip).toContainText('Enter');

  await page.getByLabel('Open fleet pane').click();
  await expect(page.locator('[data-pane]')).toHaveCount(3);
  await expect(page.locator('[data-pane]').nth(2).locator('[data-tl-search]')).toBeFocused();
  await page.locator('[data-pane]').nth(2).getByTestId('pane-help').focus();
  await expect(strip).toContainText('Move Fleet selection down');
  await expect(strip).toContainText('Workqueue for selected Fleet agent');
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

test('global pane shortcuts are blocked from editable and modal text surfaces', async ({ page }) => {
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

  await page.evaluate(() => focusPaneIndex(0));
  const composer = page.locator('[data-pane][data-pane-kind="chat"] [data-pane-input]').first();
  await composer.focus();
  await page.keyboard.press('Control+Shift+K');
  await expect.poll(activePaneIndex).toBe(0);
  await expect(page.getByTestId('shortcut-blocked-toast').last()).toContainText('Shortcut paused while typing');

  const workqueueSearch = page.locator('[data-pane][data-pane-kind="workqueue"] [data-wq-search]').first();
  await workqueueSearch.focus();
  await page.keyboard.press('Control+Shift+K');
  await expect.poll(activePaneIndex).toBe(1);

  await page.evaluate(() => {
    const host = document.querySelector('[data-pane][data-pane-kind="chat"]');
    const editor = document.createElement('div');
    editor.className = 'monaco-editor';
    editor.tabIndex = 0;
    editor.textContent = 'editor';
    host.appendChild(editor);
    editor.focus();
  });
  await expect.poll(activePaneIndex).toBe(0);
  await page.keyboard.press('Control+Shift+K');
  await expect.poll(activePaneIndex).toBe(0);

  await page.evaluate(() => {
    const host = document.querySelector('[data-pane][data-pane-kind="chat"]');
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.tabIndex = 0;
    editable.textContent = 'draft';
    host.appendChild(editable);
    editable.focus();
  });
  await page.keyboard.press('Control+Shift+K');
  await expect.poll(activePaneIndex).toBe(0);

  await page.click('#connectionStatus');
  await page.keyboard.press('Control+P');
  await expect(page.getByTestId('pane-manager-modal')).toHaveAttribute('aria-hidden', 'false');
  await page.locator('#paneManagerSearch').focus();
  await page.keyboard.press('Control+Shift+K');
  await expect(page.getByTestId('pane-manager-modal')).toHaveAttribute('aria-hidden', 'false');
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
  await page.keyboard.press('Escape');
  await expect(page.locator('#agentsModal')).not.toHaveClass(/open/);

  await fleetBtn.click({ modifiers: ['Alt'] });
  await expect(timelinePanes).toHaveCount(2);
});
