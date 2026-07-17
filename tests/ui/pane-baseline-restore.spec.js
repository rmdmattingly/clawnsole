const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const { startTestEnv, waitForAdminUiReady, attachConsoleErrorAsserts } = require('./_helpers');

let env;

test.beforeAll(async () => {
  env = await startTestEnv();
});

test.afterAll(() => {
  env?.stop?.();
});

test.afterEach(async ({ page }) => {
  if (page.__consoleAsserts) {
    page.__consoleAsserts.assertNoErrors();
  }
});

async function loginAdminWithBaselinePanes(page, serverPort, { chatAgentId = 'main' } = {}) {
  if (chatAgentId !== 'main' && env?.tempHome) {
    const configPath = path.join(env.tempHome, '.openclaw', 'openclaw.json');
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    cfg.agents = {
      list: [
        { id: 'main', name: 'main' },
        { id: chatAgentId, name: chatAgentId }
      ]
    };
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
  }

  await page.goto(`http://127.0.0.1:${serverPort}/`);
  await page.evaluate((nextChatAgentId) => {
    localStorage.removeItem('clawnsole.admin.authDestination.v1');
    localStorage.removeItem('clawnsole.admin.authRestorePending.v1');
    localStorage.removeItem('clawnsole.admin.authRestoreNotice.v1');
    if (nextChatAgentId !== 'main') {
      localStorage.setItem(
        'clawnsole.admin.authDestination.v1',
        JSON.stringify({ href: '/admin', createdAt: Date.now(), activePaneKey: 'ptestchat' })
      );
    }
    localStorage.setItem('clawnsole.admin.agentId', 'main');
    localStorage.setItem(
      'clawnsole.admin.panes.v1',
      JSON.stringify([
        { key: 'ptestchat', kind: 'chat', agentId: nextChatAgentId },
        {
          key: 'ptestwq',
          kind: 'workqueue',
          agentId: 'main',
          queue: 'dev-team',
          statusFilter: ['ready', 'pending', 'claimed', 'in_progress'],
          scopeFilter: 'all',
          sortKey: 'priority',
          sortDir: 'desc'
        }
      ])
    );
  }, chatAgentId);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await waitForAdminUiReady(page);
}

test('pane close guard: replace final chat and workqueue panes', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdminWithBaselinePanes(page, env.serverPort);

  const chatPanes = page.locator('[data-pane][data-pane-kind="chat"]');
  const workqueuePanes = page.locator('[data-pane][data-pane-kind="workqueue"]');

  await expect(chatPanes).toHaveCount(1);
  await expect(workqueuePanes).toHaveCount(1);
  await chatPanes.first().getByTestId('pane-close').click();

  const chatGuardToast = page.getByTestId('close-guard-chat-toast');
  await expect(chatGuardToast).toBeVisible();
  await expect(chatGuardToast.getByTestId('toast-secondary-action')).toHaveText('Cancel');
  await expect(chatGuardToast.getByTestId('toast-action')).toHaveText('Replace Chat pane');
  await expect(chatPanes).toHaveCount(1);
  await chatGuardToast.getByTestId('toast-action').click();

  await expect(chatPanes).toHaveCount(1);
  await expect(chatPanes.first().locator('[data-pane-input]')).toBeFocused();

  await workqueuePanes.first().getByTestId('pane-close').click();

  const workqueueGuardToast = page.getByTestId('close-guard-workqueue-toast');
  await expect(workqueueGuardToast).toBeVisible();
  await expect(workqueueGuardToast.getByTestId('toast-secondary-action')).toHaveText('Cancel');
  await expect(workqueueGuardToast.getByTestId('toast-action')).toHaveText('Replace Workqueue pane');
  await expect(workqueuePanes).toHaveCount(1);
  await workqueueGuardToast.getByTestId('toast-action').click();

  await expect(workqueuePanes).toHaveCount(1);
  await expect(workqueuePanes.first().locator('[data-wq-queue-select]')).toBeFocused();
});

test('pane close guard: replacement chat keeps original agent', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdminWithBaselinePanes(page, env.serverPort, { chatAgentId: 'dev' });
  await expect
    .poll(async () =>
      page.evaluate(async () => {
        const res = await fetch('/agents', { credentials: 'include', cache: 'no-store' });
        const data = await res.json();
        return (data.agents || []).map((agent) => agent.id).join(',');
      })
    )
    .toContain('dev');

  const chatPanes = page.locator('[data-pane][data-pane-kind="chat"]');
  await expect(chatPanes).toHaveCount(1);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const panes = JSON.parse(localStorage.getItem('clawnsole.admin.panes.v1') || '[]');
        return panes.find((pane) => pane.kind === 'chat')?.agentId || '';
      })
    )
    .toBe('dev');
  await chatPanes.first().getByTestId('pane-close').click();

  const guardToast = page.getByTestId('close-guard-chat-toast');
  await expect(guardToast).toBeVisible();
  await guardToast.getByTestId('toast-action').click();

  await expect(chatPanes).toHaveCount(1);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const panes = JSON.parse(localStorage.getItem('clawnsole.admin.panes.v1') || '[]');
        return panes.find((pane) => pane.kind === 'chat')?.agentId || '';
      })
    )
    .toBe('dev');
});

test('pane close guard: non-last panes close normally', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdminWithBaselinePanes(page, env.serverPort);
  await page.locator('#addPaneBtn').click();
  await page.getByTestId('pane-add-menu-chat').click();

  const chatPanes = page.locator('[data-pane][data-pane-kind="chat"]');
  await expect(chatPanes).toHaveCount(2);

  await chatPanes.first().getByTestId('pane-close').click();

  await expect(page.getByTestId('close-guard-chat-toast')).toHaveCount(0);
  await expect(chatPanes).toHaveCount(1);
});

test('pane close guard: pane manager click and keyboard close use the guard', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdminWithBaselinePanes(page, env.serverPort);

  await page.locator('#paneManagerBtn').click();
  const manager = page.getByTestId('pane-manager-modal');
  await expect(manager).toHaveClass(/open/);

  const chatRow = manager.locator('.pane-manager-row[data-pane-kind="chat"]').first();
  await chatRow.locator('[data-action="close"]').click();
  const clickGuard = page.getByTestId('close-guard-chat-toast').last();
  await expect(clickGuard).toBeVisible();
  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
  await clickGuard.getByTestId('toast-secondary-action').click();

  await page.getByTestId('pane-manager-search').fill('chat');
  await page.keyboard.press('Delete');
  const keyboardGuard = page.getByTestId('close-guard-chat-toast').last();
  await expect(keyboardGuard).toBeVisible();
  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
});

test('pane close guard: custom layout mode disables guard affordance', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdminWithBaselinePanes(page, env.serverPort);
  await page.evaluate(() => localStorage.setItem('clawnsole.admin.layoutMode', 'custom'));

  await page.locator('[data-pane][data-pane-kind="chat"]').first().getByTestId('pane-close').click();

  await expect(page.getByTestId('close-guard-chat-toast')).toHaveCount(0);
  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(0);
});
