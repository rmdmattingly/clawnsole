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

test('pane manager: lists panes + focuses via keyboard', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const modal = page.locator('#paneManagerModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');

  // Ctrl+P should open pane manager (even while a pane input is focused).
  await page.keyboard.press('Control+P');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  const rows = page.locator('.pane-manager-row');
  await expect(rows).toHaveCount(2);

  // Focus the 2nd pane (default Workqueue) using arrow keys + Enter.
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');

  const panes = page.locator('[data-pane]');
  await expect(panes).toHaveCount(2);

  // Active element should be inside the 2nd pane.
  const focusedPaneIndex = await page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]'));
    const active = document.activeElement;
    return panes.findIndex((p) => p === active || (active && p.contains(active)));
  });
  expect(focusedPaneIndex).toBe(1);
});

test('pane header: identity line uses "[Letter] [Type] · [Target]" across pane kinds', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const chatPane = page.locator('[data-pane][data-pane-kind="chat"]').first();
  const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();

  await expect(chatPane.getByTestId('pane-type-label')).toHaveText(/^A Chat · .+/);
  await expect(wqPane.getByTestId('pane-type-label')).toHaveText(/^B Workqueue · .+/);

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-cron').click();

  const cronPane = page.locator('[data-pane][data-pane-kind="cron"]').last();
  await expect(cronPane.getByTestId('pane-type-label')).toHaveText(/^C Cron · .+/);

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-timeline').click();

  const timelinePane = page.locator('[data-pane][data-pane-kind="timeline"]').last();
  await expect(timelinePane.getByTestId('pane-type-label')).toHaveText(/^D Timeline · .+/);

  await page.keyboard.press('Control+P');
  const firstPaneHeaderIdentity = await page.locator('[data-pane]').first().getByTestId('pane-type-label').textContent();
  await expect(page.locator('.pane-manager-row .pane-manager-kind-label').first()).toHaveText(String(firstPaneHeaderIdentity || '').trim());
  await expect(page.locator('.pane-manager-row .pane-manager-pane-id').first()).toHaveText(/^[a-zA-Z0-9]+$/);
});

test('pane focus: active visual state and topbar chip follow keyboard pane navigation', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const panes = page.locator('[data-pane]');
  const chip = page.getByTestId('active-pane-chip');
  await expect(panes).toHaveCount(2);
  await expect(chip).toContainText(/Active\s+A Chat · /);
  await expect(panes.first()).toHaveAttribute('data-active-pane', 'true');
  await expect(panes.nth(1)).toHaveAttribute('data-active-pane', 'false');

  await page.evaluate(() => document.activeElement?.blur?.());
  await page.keyboard.press('Alt+2');
  await expect(chip).toContainText(/Active\s+B Workqueue · /);
  await expect(panes.first()).toHaveAttribute('data-active-pane', 'false');
  await expect(panes.nth(1)).toHaveAttribute('data-active-pane', 'true');
  await expect(page.locator('[data-pane][data-active-pane="true"]')).toHaveCount(1);

  await page.reload();
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });
  await expect(chip).toContainText(/Active\s+B Workqueue · /);
  await expect(panes.first()).toHaveAttribute('data-active-pane', 'false');
  await expect(panes.nth(1)).toHaveAttribute('data-active-pane', 'true');
  await expect(page.locator('[data-pane][data-active-pane="true"]')).toHaveCount(1);

  await page.evaluate(() => document.activeElement?.blur?.());
  await page.keyboard.press('Alt+1');
  await expect(chip).toContainText(/Active\s+A Chat · /);
  await expect(panes.first()).toHaveAttribute('data-active-pane', 'true');
  await expect(panes.nth(1)).toHaveAttribute('data-active-pane', 'false');
  await expect(page.locator('[data-pane][data-active-pane="true"]')).toHaveCount(1);
});

test('pane manager: quick-find filters, highlights, and focuses first match', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-cron').click();

  await page.keyboard.press('Control+P');
  const modal = page.locator('#paneManagerModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  await expect(page.locator('.pane-manager-group-header')).toHaveCount(3);
  await expect(page.locator('.pane-manager-group-header').nth(0)).toContainText('Chat (1)');
  await expect(page.locator('.pane-manager-group-header').nth(1)).toContainText('Workqueue (1)');
  await expect(page.locator('.pane-manager-group-header').nth(2)).toContainText('Cron (1)');

  const search = page.getByTestId('pane-manager-search');
  await expect(search).toHaveAttribute('placeholder', 'Find pane (A, Workqueue, dev-agent...)');
  await search.fill('cron');
  await expect(page.locator('.pane-manager-row')).toHaveCount(1);
  await expect(page.locator('.pane-manager-row').first()).toContainText('Cron');
  await expect(page.locator('.pane-manager-match').first()).toHaveText(/cron/i);

  await page.keyboard.press('Enter');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');
  const focusedPaneKind = await page.evaluate(() => {
    const active = document.activeElement;
    const pane = Array.from(document.querySelectorAll('[data-pane]')).find((entry) => entry === active || (active && entry.contains(active)));
    return pane?.getAttribute('data-pane-kind') || '';
  });
  expect(focusedPaneKind).toBe('cron');

  await page.keyboard.press('Control+P');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');
  await page.keyboard.press('/');
  await expect(search).toBeFocused();
  await search.fill('dev-team');
  await expect(page.locator('.pane-manager-row')).toHaveCount(1);
  await expect(page.locator('.pane-manager-row').first()).toContainText('Workqueue');

  await search.fill('B');
  await expect(page.locator('.pane-manager-row')).toHaveCount(1);
  await expect(page.locator('.pane-manager-row').first()).toContainText('Workqueue');

  await page.keyboard.press('Control+F');
  await expect(search).toBeFocused();
  await search.fill('no-such-pane');
  await expect(page.locator('.pane-manager-row')).toHaveCount(0);
  await expect(page.locator('#paneManagerEmpty')).toHaveText('No panes match "no-such-pane"');

  await page.keyboard.press('Escape');
  await expect(search).toHaveValue('');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');
  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');
});

test('pane nicknames: set from header and manager, persist, and feed search surfaces', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const chatPane = page.locator('[data-pane][data-pane-kind="chat"]').first();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Pane nickname');
    await dialog.accept('Hotfix chat');
  });
  await chatPane.getByTestId('pane-nickname').click();
  await expect(chatPane.getByTestId('pane-type-label')).toContainText('Chat ·');
  await expect(chatPane.getByTestId('pane-type-label')).toContainText('Hotfix chat');

  await page.keyboard.press('Control+P');
  const manager = page.getByTestId('pane-manager-modal');
  await expect(manager).toHaveAttribute('aria-hidden', 'false');
  await expect(page.getByTestId('pane-manager-nickname')).toHaveText('Hotfix chat');

  const search = page.getByTestId('pane-manager-search');
  await search.fill('hotfix');
  await expect(page.locator('.pane-manager-row')).toHaveCount(1);
  await expect(page.locator('.pane-manager-row').first()).toContainText('Chat ·');

  await search.evaluate((el) => {
    el.value = '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.locator('.pane-manager-row')).toHaveCount(2);

  page.once('dialog', async (dialog) => {
    await dialog.accept('Queue triage');
  });
  await page.locator('.pane-manager-row').first().getByTestId('pane-manager-nickname-action').click();
  await expect(page.getByTestId('pane-manager-nickname')).toHaveText('Queue triage');

  await page.reload();
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });
  const restoredChat = page.locator('[data-pane][data-pane-kind="chat"]').first();
  await expect(restoredChat.getByTestId('pane-type-label')).toContainText('Queue triage');

  await page.keyboard.press('ControlOrMeta+K');
  const paletteInput = page.locator('#commandPaletteInput');
  await expect(paletteInput).toBeVisible();
  await paletteInput.fill('queue triage');
  const firstHit = page.locator('#commandPaletteList [role="option"]').first();
  await expect(firstHit.locator('.command-palette-item-label')).toContainText('Queue triage');
  await expect(firstHit.locator('.command-palette-pane-chip-nickname')).toHaveText('Queue triage');
});

test('pane manager: shows summary + duplicate badge and supports close others', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-chat').click();

  await page.keyboard.press('Control+P');
  const modal = page.locator('#paneManagerModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  const rows = page.locator('.pane-manager-row');
  await expect(rows).toHaveCount(3);

  const duplicateRows = page.locator('.pane-manager-row', { hasText: /Chat · main \([12]\)/ });
  await expect(duplicateRows).toHaveCount(2);
  await expect(page.locator('[data-pane][data-pane-kind="chat"]').nth(0).getByTestId('pane-type-label')).toHaveText(/^A Chat · main \(1\)$/);
  await expect(page.locator('[data-pane][data-pane-kind="chat"]').nth(1).getByTestId('pane-type-label')).toHaveText(/^C Chat · main \(2\)$/);
  await expect(duplicateRows.nth(0).locator('.pane-manager-kind-label')).toContainText('Chat · main (1)');
  await expect(duplicateRows.nth(1).locator('.pane-manager-kind-label')).toContainText('Chat · main (2)');
  await expect(duplicateRows.first().getByTestId('pane-manager-duplicate-badge')).toHaveText('duplicate');

  const chatRowWithCloseOthers = page.locator('.pane-manager-row', { has: page.getByTestId('pane-manager-close-others') }).first();
  await chatRowWithCloseOthers.evaluate((row) => {
    const closeOthers = row.querySelector('[data-action="close-others"]');
    closeOthers?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
  await expect(page.locator('.pane-manager-row')).toHaveCount(2);
  await expect(page.locator('[data-testid="pane-manager-duplicate-badge"]')).toHaveCount(0);
  await expect(page.locator('[data-pane][data-pane-kind="chat"]').first().getByTestId('pane-type-label')).toHaveText(/^A Chat · main$/);
});

test('pane manager: unread-only filter toggle', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('panes-indicator').click();
  await expect(page.getByTestId('pane-manager-modal')).toHaveAttribute('aria-hidden', 'false');
  await page.locator('.pane-manager-unread-only').click();
  await expect(page.locator('.pane-manager-row')).toHaveCount(0);

  await page.keyboard.press('Escape');
});

test('pane manager: status stays in sync with pane header while modal is open', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.keyboard.press('Control+P');
  const modal = page.locator('#paneManagerModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  const chatHeaderStatus = page.locator('[data-pane][data-pane-kind="chat"]').first().getByTestId('pane-connection-status');
  const chatManagerState = page.locator('.pane-manager-row', { hasText: 'Chat · main' }).first().locator('.pane-manager-state');
  const workqueueHeaderStatus = page.locator('[data-pane][data-pane-kind="workqueue"]').first().getByTestId('pane-connection-status');
  const workqueueManagerState = page.locator('.pane-manager-row', { hasText: 'Workqueue' }).first().locator('.pane-manager-state');

  await expect(chatHeaderStatus).toContainText(/connected|reconnecting/);
  await expect(chatManagerState).toContainText(/connected|reconnecting/);
  await expect(workqueueHeaderStatus).toHaveText('connected');
  await expect(workqueueManagerState).toHaveText('connected');

  await page.evaluate(() => {
    const btn = document.getElementById('disconnectBtn');
    btn?.click();
  });

  await expect(chatHeaderStatus).toHaveText('disconnected');
  await expect(chatManagerState).toHaveText('disconnected');
});

test('pane manager: paired action focuses existing counterpart and opens missing counterpart', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.keyboard.press('Control+P');
  const modal = page.locator('#paneManagerModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  const chatRow = page.locator('.pane-manager-row', { hasText: 'Chat · main' }).first();
  await chatRow.evaluate((row) => {
    const paired = row.querySelector('[data-action="paired"]');
    paired?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await expect(modal).toHaveAttribute('aria-hidden', 'true');
  const focusedKindAfterFocus = await page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]'));
    const active = document.activeElement;
    const pane = panes.find((p) => p === active || (active && p.contains(active)));
    return pane?.getAttribute('data-pane-kind') || null;
  });
  expect(focusedKindAfterFocus).toBe('workqueue');

  // Start the missing-counterpart path from a Workqueue-only stored layout.
  await page.evaluate(() => {
    localStorage.setItem(
      'clawnsole.admin.panes.v1',
      JSON.stringify([
        {
          key: 'ptestwqonly',
          kind: 'workqueue',
          agentId: 'main',
          queue: 'dev-team',
          statusFilter: ['ready', 'pending', 'blocked', 'claimed', 'in_progress'],
          scopeFilter: 'assigned',
          sortKey: 'priority',
          sortDir: 'desc'
        }
      ])
    );
  });
  await page.reload();
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });
  await page.keyboard.press('Control+P');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  // Trigger Paired from Workqueue row; should open Chat and focus it.
  const workqueueRow = page.locator('.pane-manager-row', { hasText: 'Workqueue' }).first();
  await workqueueRow.evaluate((row) => {
    const paired = row.querySelector('[data-action="paired"]');
    paired?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await expect(modal).toHaveAttribute('aria-hidden', 'true');

  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
  const focusedKindAfterOpen = await page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]'));
    const active = document.activeElement;
    const pane = panes.find((p) => p === active || (active && p.contains(active)));
    return pane?.getAttribute('data-pane-kind') || null;
  });
  expect(focusedKindAfterOpen).toBe('chat');
});

test('pane manager: supports reordering panes', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-chat').click();

  await page.keyboard.press('Control+P');
  const modal = page.locator('#paneManagerModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  const rows = page.locator('.pane-manager-row');
  await expect(rows).toHaveCount(3);
  const firstRowMoveUp = rows.nth(0).getByTestId('pane-manager-move-up');
  await expect(firstRowMoveUp).toBeDisabled();

  const rowKeys = async () => {
    return page.locator('.pane-manager-row').evaluateAll((rows) => rows.map((row) => row.dataset.paneKey));
  };

  const before = await rowKeys();
  expect(before.length).toBe(3);

  const workqueueKey = await page.locator('.pane-manager-row', { hasText: 'Workqueue' }).first().evaluate((row) => row.dataset.paneKey);
  await page.locator('.pane-manager-row', { hasText: 'Workqueue' }).first().evaluate((row) => {
    const moveDown = row.querySelector('[data-action="move-down"]');
    moveDown?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  const after = await rowKeys();
  const from = before.indexOf(workqueueKey);
  expect(from).toBeGreaterThanOrEqual(0);
  const expected = before.slice();
  const [moved] = expected.splice(from, 1);
  expected.splice(Math.min(from + 1, expected.length), 0, moved);
  expect(after).toEqual(expected);

  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');

  await page.keyboard.press('Control+P');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');

  const persisted = await rowKeys();
  expect(persisted).toEqual(after);
});

test('pane layout lock disables pane reordering controls', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-chat').click();

  await page.getByTestId('layout-lock-btn').click();
  await expect(page.getByTestId('layout-lock-btn')).toHaveAttribute('aria-pressed', 'true');

  await page.keyboard.press('Control+P');
  const movableRow = page.locator('.pane-manager-row', { hasText: 'Workqueue' }).first();
  await expect(movableRow.getByTestId('pane-manager-move-down')).toBeDisabled();
});
