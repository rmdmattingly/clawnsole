// End-to-end test against an already-deployed Clawnsole (QA or Prod).
//
// This spec is ONLY meant to run when explicitly invoked, because it targets a real deployment.
//
// Usage:
//   BASE_URL=https://clawnsole-qa.example.com ADMIN_PASSWORD=... npx playwright test tests/deploy.e2e.spec.js
//
// Notes:
// - This test is intentionally black-box: it uses the real /auth/login + cookies + websocket proxy.
// - It asserts we do NOT get bounced back to signed-out while chatting.

const { test, expect } = require('@playwright/test');

const { installPageFailureAssertions } = require('./helpers/pw-assertions');

async function getOrCreateChatPane(page) {
  const panes = page.locator('[data-pane][data-pane-kind="chat"]');
  if ((await panes.count()) === 0) {
    await page.getByRole('button', { name: 'Add pane' }).click();
    await page.getByRole('button', { name: 'Chat pane' }).click();
  }
  return page.locator('[data-pane][data-pane-kind="chat"]').first();
}

test.describe('@deploy Clawnsole deploy e2e', () => {
  test('login as admin, connect, send prompt, receive assistant response, remain logged in', async ({ page }) => {
    const baseUrl = process.env.BASE_URL || process.env.CLAWNSOLE_BASE_URL || '';
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.CLAWNSOLE_ADMIN_PASSWORD || 'admin';

    test.skip(!baseUrl, 'deploy e2e requires BASE_URL (or CLAWNSOLE_BASE_URL)');

    const appOrigin = new URL(baseUrl).origin;
    const guards = installPageFailureAssertions(page, { appOrigin });

    // Prefer /admin route for explicit role.
    await page.goto(`${baseUrl.replace(/\/$/, '')}/admin`, { waitUntil: 'domcontentloaded' });

    // Login UI should be present if we are not already authed.
    // If already authed, these actions are no-ops.
    const overlay = page.locator('#loginOverlay');
    if (await overlay.isVisible().catch(() => false)) {
      await page.fill('#loginPassword', adminPassword);
      await page.click('#loginBtn');
    }

    // We should be on /admin after login.
    await page.waitForURL(/\/admin\/?$/, { timeout: 20000 });

    // Ensure we are not "bounced" back to signed out.
    await expect(page.locator('#rolePill')).toContainText(/signed in/i, { timeout: 20000 });
    await expect(page.locator('#loginOverlay')).not.toHaveClass(/open/, { timeout: 20000 });

    // Wait for pane to connect.
    await page.waitForSelector('[data-pane][data-connected="true"] [data-pane-status]', { timeout: 30000 });

    const pane = await getOrCreateChatPane(page);
    const msg = `e2e deploy ping ${Date.now()}`;
    await pane.locator('[data-pane-input]').fill(msg);
    await pane.locator('[data-pane-send]').click();

    // We should see the user message.
    await expect(pane.locator('[data-chat-role="user"]').last()).toContainText(msg, { timeout: 20000 });

    // We should receive an assistant message (content can vary by agent/model).
    await expect(pane.locator('[data-chat-role="assistant"]').last()).toBeVisible({ timeout: 60000 });

    // Regression guard: do a reload and ensure we are still authed (no silent logout/bounce).
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#loginOverlay')).not.toHaveClass(/open/, { timeout: 20000 });
    await expect(page.locator('#rolePill')).toContainText(/signed in/i, { timeout: 20000 });

    await guards.assertNoFailures();
    guards.dispose();
  });
});
