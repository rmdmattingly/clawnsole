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
  await expect(modal).toContainText('Workqueue');
  await expect(modal).toContainText('Focus visible pane by order');
  await expect(modal).toContainText('Focus previous pane');

  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');
});

test('admin shortcuts do not fire while typing in chat input', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const input = page.locator('[data-pane-input]').first();
  const modal = page.locator('#shortcutsModal');
  const palette = page.locator('[data-testid="command-palette-modal"]');
  const workqueueModal = page.locator('#workqueueModal');

  await input.click();
  await expect(input).toBeFocused();

  await page.keyboard.press('Shift+/');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');
  await expect(palette).toHaveAttribute('aria-hidden', 'true');
  await expect(workqueueModal).toHaveAttribute('aria-hidden', 'true');

  await page.keyboard.press('ControlOrMeta+K');
  await expect(palette).toHaveAttribute('aria-hidden', 'true');

  await page.keyboard.press('g');
  await page.keyboard.press('w');
  await expect(workqueueModal).toHaveAttribute('aria-hidden', 'true');

  let agentRequests = 0;
  const onRequest = (req) => {
    const url = req.url();
    if (url.includes('/agents')) agentRequests += 1;
  };
  page.on('request', onRequest);
  await page.keyboard.press('ControlOrMeta+R');
  await page.waitForTimeout(300);
  page.off('request', onRequest);
  expect(agentRequests).toBe(0);
});

test('admin shortcuts do not fire while typing in contenteditable', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const modal = page.locator('#shortcutsModal');
  const palette = page.locator('[data-testid="command-palette-modal"]');
  const workqueueModal = page.locator('#workqueueModal');

  await page.evaluate(() => {
    const el = document.createElement('div');
    el.id = 'typingSandbox';
    el.contentEditable = 'true';
    el.tabIndex = 0;
    el.style.cssText = 'position: fixed; right: 16px; top: 16px; width: 260px; height: 48px; border: 1px solid #888; padding: 6px; background: white; z-index: 9999;';
    el.setAttribute('aria-label', 'contenteditable typing sandbox');
    document.body.appendChild(el);
    el.focus();
  });

  const sandbox = page.locator('#typingSandbox');
  await sandbox.focus();
  await expect(sandbox).toBeFocused();

  await page.keyboard.type('?:gw');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');
  await expect(palette).toHaveAttribute('aria-hidden', 'true');
  await expect(workqueueModal).toHaveAttribute('aria-hidden', 'true');

  let agentRequests = 0;
  const onRequest = (req) => {
    const url = req.url();
    if (url.includes('/agents')) agentRequests += 1;
  };
  page.on('request', onRequest);
  await page.keyboard.press('ControlOrMeta+R');
  await page.keyboard.press('ControlOrMeta+K');
  await page.waitForTimeout(250);
  page.off('request', onRequest);

  expect(agentRequests).toBe(0);
  await expect(workqueueModal).toHaveAttribute('aria-hidden', 'true');
  await expect(palette).toHaveAttribute('aria-hidden', 'true');

  await page.evaluate(() => {
    const el = document.getElementById('typingSandbox');
    if (el) el.remove();
  });
});

test('admin shortcuts: Shift+K moves forward, Shift+J moves backward through panes', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const firstPaneInput = page.locator('[data-pane]').first().locator('[data-pane-input]');

  const activePaneIndex = async () =>
    page.evaluate(() => {
      const panes = Array.from(document.querySelectorAll('[data-pane]'));
      const active = document.activeElement;
      if (!active) return -1;
      return panes.findIndex((pane) => pane === active || pane.contains(active));
    });

  await expect(firstPaneInput).toBeVisible();
  await expect(firstPaneInput).toBeFocused();

  await page.locator('#addPaneBtn').click();
  const menu = page.locator('[data-testid="pane-add-menu"]');
  await expect(menu).toBeVisible();
  await menu.locator('[data-testid="pane-add-menu-workqueue"]').click();

  await page.locator('[data-pane]').first().locator('[data-pane-send]').click();

  await page.keyboard.press('ControlOrMeta+Shift+K');
  expect(await activePaneIndex()).toBe(1);

  await page.keyboard.press('ControlOrMeta+Shift+J');
  expect(await activePaneIndex()).toBe(0);
});

test('pane-add shortcuts are blocked while an overlay modal is open', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await expect(page.locator('[data-pane]')).toHaveCount(2);

  // Blur away from input so global shortcuts are eligible.
  await page.click('#connectionStatus');

  await page.keyboard.press('Shift+/');
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('aria-hidden', 'false');

  await page.keyboard.press('ControlOrMeta+Shift+W');
  await page.keyboard.press('ControlOrMeta+Shift+R');
  await page.keyboard.press('ControlOrMeta+Shift+T');
  await page.keyboard.press('ControlOrMeta+Shift+C');

  await expect(page.locator('[data-pane]')).toHaveCount(2);

  await page.keyboard.press('Escape');
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('aria-hidden', 'true');

  // Once overlay is closed, shortcut should work again.
  await page.keyboard.press('ControlOrMeta+Shift+W');
  await expect(page.locator('[data-pane]')).toHaveCount(3);
});

test('admin shortcut: Ctrl/Cmd+Shift+G opens/focuses workqueue for active chat agent', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.locator('[data-pane-kind="workqueue"] [data-pane-close]').first().click();
  await expect(page.locator('[data-pane-kind="workqueue"]')).toHaveCount(0);

  await page.locator('[data-pane-kind="chat"]').first().locator('[data-pane-input]').click();
  await page.keyboard.press('ControlOrMeta+Shift+G');

  const wqPane = page.locator('[data-pane-kind="workqueue"]');
  await expect(wqPane).toHaveCount(1);

  await expect(wqPane.first().locator('[data-wq-scope="assigned"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(wqPane.first().locator('[data-wq-claim-agent]')).toHaveValue('main');

  await page.keyboard.press('ControlOrMeta+Shift+G');
  await expect(wqPane).toHaveCount(1);
});

test('admin shortcuts: Alt+1..9 focuses panes by visible order', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const activePaneIndex = async () =>
    page.evaluate(() => {
      const panes = Array.from(document.querySelectorAll('[data-pane]')).filter((pane) => {
        if (!(pane instanceof HTMLElement)) return false;
        if (pane.hidden) return false;
        return pane.getClientRects().length > 0;
      });
      const active = document.activeElement;
      if (!active) return -1;
      return panes.findIndex((pane) => pane === active || pane.contains(active));
    });

  await page.locator('#addPaneBtn').click();
  await page.locator('[data-testid="pane-add-menu-workqueue"]').click();
  await page.locator('#addPaneBtn').click();
  await page.locator('[data-testid="pane-add-menu-cron"]').click();

  await expect(page.locator('[data-pane]')).toHaveCount(4);

  await page.keyboard.press('Alt+3');
  expect(await activePaneIndex()).toBe(2);

  await page.keyboard.press('Alt+1');
  expect(await activePaneIndex()).toBe(0);

  await page.keyboard.press('Alt+9');
  expect(await activePaneIndex()).toBe(0);
});
