const fs = require('fs');
const path = require('path');
const { test, expect } = require('./fixtures');

test('visiting /admin without auth shows login overlay', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.goto(clawnsole.adminUrl);
  await expect(page.getByTestId('login-overlay')).toHaveClass(/open/);
  await expect(page.getByTestId('role-pill')).toHaveText('Locked');
  await expect(page.getByTestId('role-pill')).toHaveAttribute('data-auth-state', 'locked');
  await expect(page.getByTestId('role-pill')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByTestId('role-pill')).toHaveAttribute('tabindex', '-1');
  await expect(page.getByTestId('connection-status')).toBeHidden();
  await expect(page.getByTestId('panes-indicator')).toBeHidden();
  await expect(page.getByTestId('add-pane-btn')).toBeHidden();
  await expect(page.getByTestId('pane-grid')).toBeHidden();
  await expect(page.getByTestId('signed-out-state')).toBeVisible();
  await expect(page.getByTestId('signed-out-state')).toContainText('Unlock to access Chat + Workqueue + Fleet');
  await expect(page.locator('#logoutBtn')).toContainText('Unlock');
  await expect(page.locator('#logoutBtn')).toBeEnabled();

  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await clawnsole.waitForAdminUiReady(page);
  await expect(page.getByTestId('signed-out-state')).toBeHidden();
  await expect(page.getByTestId('pane-grid')).toBeVisible();
  await expect(page.getByTestId('add-pane-btn')).toBeVisible();
});

test('signed-in auth chip shows session details and actions', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);
  const chip = page.getByTestId('role-pill');
  await expect(chip).toContainText('Signed in');
  await expect(chip).toContainText('Admin');
  await expect(chip).toHaveAttribute('data-auth-state', 'signed_in');
  await expect(chip).toHaveAttribute('title', /signed in as Admin in local/i);

  await chip.click();
  const popover = page.getByTestId('auth-session-popover');
  await expect(popover).toBeVisible();
  await expect(popover).toContainText('Signed in');
  await expect(popover).toContainText('Admin');
  await expect(popover).toContainText('local');
  await expect(popover.getByRole('button', { name: 'Settings' })).toBeVisible();
  await expect(popover.getByRole('button', { name: 'Logout' })).toBeVisible();
});

test('shortcuts help stays accessible while admin is locked', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.goto(clawnsole.adminUrl);
  await expect(page.getByTestId('login-overlay')).toHaveClass(/open/);

  await expect(page.getByTestId('shortcuts-btn')).toBeVisible();
  await expect(page.getByTestId('shortcuts-btn')).toBeEnabled();
  await page.getByTestId('shortcuts-btn').click();
  await expect(page.getByTestId('shortcuts-modal')).toHaveClass(/open/);
  await expect(page.getByTestId('shortcuts-modal')).toContainText('Available now');
  await expect(page.getByTestId('shortcuts-modal')).toContainText('Unlock after entering the admin password');
  await expect(page.getByTestId('shortcuts-modal')).toContainText('Available after unlock');

  await page.keyboard.press('Escape');
  await expect(page.getByTestId('shortcuts-modal')).not.toHaveClass(/open/);

  await page.keyboard.down('Shift');
  await page.keyboard.press('Slash');
  await page.keyboard.up('Shift');
  await expect(page.getByTestId('shortcuts-modal')).toHaveClass(/open/);
});

test('login password shows Caps Lock hint only while active and focused', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.goto(clawnsole.adminUrl);
  const password = page.getByTestId('login-password');
  const hint = page.getByTestId('login-caps-hint');

  await expect(hint).toBeHidden();
  await password.evaluate((node) => {
    node.focus();
    const event = Object.assign(new Event('keydown', { bubbles: true }), {
      key: 'A',
      getModifierState: (key) => key === 'CapsLock'
    });
    node.dispatchEvent(event);
  });
  await expect(hint).toBeVisible();

  await password.evaluate((node) => {
    const event = Object.assign(new Event('keyup', { bubbles: true }), {
      key: 'a',
      getModifierState: () => false
    });
    node.dispatchEvent(event);
  });
  await expect(hint).toBeHidden();

  await password.evaluate((node) => {
    const event = Object.assign(new Event('keydown', { bubbles: true }), {
      key: 'A',
      getModifierState: (key) => key === 'CapsLock'
    });
    node.dispatchEvent(event);
  });
  await expect(hint).toBeVisible();
  await password.evaluate((node) => node.blur());
  await expect(hint).toBeHidden();
});

test('admin login restores the intended in-app destination', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.goto(clawnsole.serverUrl);
  await page.evaluate(() => {
    localStorage.setItem(
      'clawnsole.admin.authDestination.v1',
      JSON.stringify({ href: '/admin?pane=workqueue#item-315', createdAt: Date.now() })
    );
  });
  await expect(page.getByTestId('login-overlay')).toHaveClass(/open/);

  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\?pane=workqueue#item-315$/, { timeout: 10000 });
  await page.locator('#addPaneBtn').waitFor({ state: 'visible', timeout: 90000 });

  await expect(page).toHaveURL(/\/admin\?pane=workqueue#item-315$/);
});

test('stale admin restore falls back to default layout with a notice', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.goto(clawnsole.serverUrl);
  await page.evaluate(() => {
    localStorage.setItem(
      'clawnsole.admin.authDestination.v1',
      JSON.stringify({ href: '/admin?pane=stale#old', createdAt: Date.now() - 700000 })
    );
    localStorage.setItem(
      'clawnsole.admin.panes.v1',
      JSON.stringify([{ key: 'pstale', kind: 'cron' }])
    );
  });

  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await clawnsole.waitForAdminUiReady(page);

  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByTestId('toast')).toContainText(/default admin layout/i);
  await expect(page.locator('[data-pane]')).toHaveCount(2);
  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);
});

test('admin restore ignores external destinations', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.goto(clawnsole.serverUrl);
  await page.evaluate(() => {
    localStorage.setItem(
      'clawnsole.admin.authDestination.v1',
      JSON.stringify({ href: 'https://evil.test/admin', createdAt: Date.now() })
    );
  });

  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await clawnsole.waitForAdminUiReady(page);

  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByTestId('toast')).toContainText(/default admin layout/i);
});

test('after successful login, reload stays authed; clearing cookies forces re-login', async ({ page, context, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);
  await expect(page.getByTestId('login-overlay')).not.toHaveClass(/open/);

  await page.reload();
  await expect(page.getByTestId('login-overlay')).not.toHaveClass(/open/);

  await context.clearCookies();
  await page.goto(clawnsole.adminUrl);
  await expect(page.getByTestId('login-overlay')).toHaveClass(/open/);
});

test('authVersion rotation invalidates existing cookies (forces re-login)', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  const cfgPath = path.join(clawnsole.tempHome, '.openclaw', 'clawnsole.json');
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  cfg.authVersion = 'rotated';
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));

  await page.reload();
  await expect(page.getByTestId('login-overlay')).toHaveClass(/open/);
});

test('gateway unauthorized triggers auth-expired UX and blocks sending until re-authed', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  // Simulate an auth-expired/unauthorized close from the gateway.
  await page.request.get(`http://127.0.0.1:${clawnsole.gatewayPort}/__test__/close?code=4401&reason=unauthorized`);

  await expect(page.getByTestId('login-overlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.getByTestId('login-error')).toContainText(/session expired|sign in/i);

  // The current pane should be disabled while signed out.
  await expect(page.getByTestId('pane-input').first()).toBeDisabled();
  await expect(page.getByTestId('pane-send').first()).toBeDisabled();
});

test('gateway reconnect does not duplicate messages', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  const thread = page.getByTestId('pane-thread').first();
  const input = page.getByTestId('pane-input').first();
  const send = page.getByTestId('pane-send').first();

  await input.fill('hello');
  await send.click();

  // Wait for the mock gateway to produce a reply so the thread has stable content.
  await expect(thread).toContainText('mock-reply: hello', { timeout: 15000 });

  const before = await thread.locator('.chat-bubble').count();

  // Simulate a normal disconnect; the UI should reconnect and not duplicate history.
  await page.request.get(`http://127.0.0.1:${clawnsole.gatewayPort}/__test__/close?code=1001&reason=going-away`);

  // Give the reconnect loop time to run (and catch-up logic to settle).
  await page.waitForTimeout(4000);

  const after = await thread.locator('.chat-bubble').count();
  expect(after).toBe(before);
});
