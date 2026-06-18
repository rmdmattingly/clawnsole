const fs = require('fs');
const path = require('path');
const { test, expect } = require('./fixtures');

async function loginFromOverlay(page) {
  await page.waitForLoadState('load');
  await expect(page.locator('#loginBtn')).toBeEnabled();
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForFunction(() => {
    const overlay = document.querySelector('#loginOverlay');
    return overlay && overlay.getAttribute('aria-hidden') === 'true' && !overlay.classList.contains('open');
  }, { timeout: 90000 });
}

test('visiting /admin without auth shows login overlay', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.goto(clawnsole.adminUrl);
  await expect(page.getByTestId('login-overlay')).toHaveClass(/open/);
  await expect(page.getByTestId('role-pill')).toContainText('signed out');
});

test('post-unlock intent restores a safe admin destination', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.goto(`${clawnsole.adminUrl}?pane=workqueue#queue-dev`);
  await expect(page.getByTestId('login-overlay')).toHaveClass(/open/);

  await loginFromOverlay(page);

  await expect(page).toHaveURL(`${clawnsole.adminUrl}?pane=workqueue#queue-dev`);
  const storedIntent = await page.evaluate(() => localStorage.getItem('clawnsole.admin.postUnlockIntent'));
  expect(storedIntent).toBeNull();
});

test('stale post-unlock intent falls back to default admin layout with notice', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.goto(clawnsole.serverUrl);
  await page.evaluate(() => {
    localStorage.setItem(
      'clawnsole.admin.postUnlockIntent',
      JSON.stringify({ path: '/admin', search: '?pane=workqueue', hash: '#stale', ts: Date.now() - 31 * 60 * 1000 })
    );
    localStorage.setItem('clawnsole.admin.panes.v1', JSON.stringify([{ key: 'pstale', kind: 'cron' }]));
  });

  await loginFromOverlay(page);

  await expect(page).toHaveURL(`${clawnsole.adminUrl}`);
  await expect(page.getByTestId('toast')).toContainText(/expired.*default Chat \+ Workqueue/i);
  await expect(page.locator('[data-pane]')).toHaveCount(2);
  await expect(page.locator('[data-pane]').nth(0)).toHaveAttribute('data-pane-kind', 'chat');
  await expect(page.locator('[data-pane]').nth(1)).toHaveAttribute('data-pane-kind', 'workqueue');
});

test('unsafe post-unlock intent cannot redirect outside the admin app', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.goto(clawnsole.serverUrl);
  await page.evaluate(() => {
    localStorage.setItem(
      'clawnsole.admin.postUnlockIntent',
      JSON.stringify({ path: 'https://evil.example/admin', search: '', hash: '', ts: Date.now() })
    );
  });

  await loginFromOverlay(page);

  await expect(page).toHaveURL(`${clawnsole.adminUrl}`);
  await expect(page.getByTestId('toast')).toContainText(/not safe.*default Chat \+ Workqueue/i);
  expect(new URL(page.url()).origin).toBe(clawnsole.serverUrl);
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
