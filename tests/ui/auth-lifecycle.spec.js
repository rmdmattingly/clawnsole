const fs = require('fs');
const path = require('path');
const { test, expect } = require('./fixtures');

test('visiting /admin without auth shows login overlay', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.goto(clawnsole.adminUrl);
  await expect(page.getByTestId('login-overlay')).toHaveClass(/open/);
  await expect(page.getByTestId('role-pill')).toContainText('signed out');
});

test('unlock form autofocuses, submits on Enter, and prevents duplicate in-flight submits', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  let loginRequests = 0;
  let releaseLogin;
  const loginReleased = new Promise((resolve) => {
    releaseLogin = resolve;
  });

  await page.route('**/auth/login', async (route) => {
    loginRequests += 1;
    await loginReleased;
    await route.continue();
  });

  await page.goto(clawnsole.serverUrl);
  await expect(page.getByTestId('login-overlay')).toHaveClass(/open/);
  await expect(page.getByTestId('login-password')).toBeFocused();

  await page.getByTestId('login-password').fill('admin');
  await page.getByTestId('login-password').press('Enter');

  await expect(page.getByTestId('login-button')).toBeDisabled();
  await expect(page.getByTestId('login-button')).toHaveText('Unlocking...');
  await expect(page.getByTestId('login-password')).toBeDisabled();

  await page.getByTestId('login-button').click({ force: true });
  await page.keyboard.press('Enter');
  await expect.poll(() => loginRequests).toBe(1);

  releaseLogin();
  await clawnsole.waitForAdminUiReady(page);
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
