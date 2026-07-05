const { test, expect } = require('@playwright/test');

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

async function loginAdminWithBaselinePanes(page, serverPort) {
  await page.goto(`http://127.0.0.1:${serverPort}/`);
  await page.evaluate(() => {
    localStorage.removeItem('clawnsole.admin.authDestination.v1');
    localStorage.removeItem('clawnsole.admin.authRestorePending.v1');
    localStorage.removeItem('clawnsole.admin.authRestoreNotice.v1');
    localStorage.setItem('clawnsole.admin.agentId', 'main');
    localStorage.setItem(
      'clawnsole.admin.panes.v1',
      JSON.stringify([
        { key: 'ptestchat', kind: 'chat', agentId: 'main' },
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
  });
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await waitForAdminUiReady(page);
}

test('baseline restore: close and restore final chat and workqueue panes', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdminWithBaselinePanes(page, env.serverPort);

  const chatPanes = page.locator('[data-pane][data-pane-kind="chat"]');
  const workqueuePanes = page.locator('[data-pane][data-pane-kind="workqueue"]');

  await expect(chatPanes).toHaveCount(1);
  await expect(workqueuePanes).toHaveCount(1);
  await chatPanes.first().getByTestId('pane-close').click();

  const restoreChatToast = page.getByTestId('restore-chat-toast');
  await expect(restoreChatToast).toBeVisible();
  await expect(restoreChatToast.getByTestId('toast-action')).toHaveText('Restore Chat pane');
  await restoreChatToast.getByTestId('toast-action').click();

  await expect(chatPanes).toHaveCount(1);
  await expect(chatPanes.first().locator('[data-pane-input]')).toBeFocused();

  await workqueuePanes.first().getByTestId('pane-close').click();

  const restoreWorkqueueToast = page.getByTestId('restore-workqueue-toast');
  await expect(restoreWorkqueueToast).toBeVisible();
  await expect(restoreWorkqueueToast.getByTestId('toast-action')).toHaveText('Restore Workqueue pane');
  await restoreWorkqueueToast.getByTestId('toast-action').click();

  await expect(workqueuePanes).toHaveCount(1);
  await expect(workqueuePanes.first().locator('[data-wq-queue-select]')).toBeFocused();
});

test('baseline restore: custom layout mode disables restore affordance', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdminWithBaselinePanes(page, env.serverPort);
  await page.evaluate(() => localStorage.setItem('clawnsole.admin.layoutMode', 'custom'));

  await page.locator('[data-pane][data-pane-kind="chat"]').first().getByTestId('pane-close').click();

  await expect(page.getByTestId('restore-chat-toast')).toHaveCount(0);
  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(0);
});
