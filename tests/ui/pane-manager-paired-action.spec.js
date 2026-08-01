const { test, expect } = require('@playwright/test');

const { startTestEnv, waitForAdminUiReady, attachConsoleErrorAsserts, addPane } = require('./_helpers');

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

async function loginWithPanes(page, panes) {
  await page.addInitScript((nextPanes) => {
    localStorage.setItem('clawnsole.admin.agentId', 'main');
    localStorage.setItem('clawnsole.admin.panes.v1', JSON.stringify(nextPanes));
    localStorage.removeItem('clawnsole.admin.authRestoreNotice.v1');
  }, panes);
  await page.goto(`http://127.0.0.1:${env.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await waitForAdminUiReady(page);
}

test('pane manager paired action focuses an existing counterpart', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginWithPanes(page, [
    { key: 'ptestchat', kind: 'chat', agentId: 'main' },
    {
      key: 'ptestwq',
      kind: 'workqueue',
      agentId: 'main',
      queue: 'dev-team',
      statusFilter: ['ready', 'pending', 'blocked', 'claimed', 'in_progress'],
      scopeFilter: 'assigned',
      sortKey: 'priority',
      sortDir: 'desc'
    }
  ]);

  const chatPane = page.locator('[data-pane][data-pane-kind="chat"]').first();
  const workqueuePane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();
  await expect(chatPane.getByTestId('pane-pair-cue')).toHaveText('Pair B');
  await expect(workqueuePane.getByTestId('pane-pair-cue')).toHaveText('Pair A');
  const chatPairKey = await chatPane.getByTestId('pane-pair-cue').getAttribute('data-pair-key');
  await expect(workqueuePane.getByTestId('pane-pair-cue')).toHaveAttribute('data-pair-key', chatPairKey || '');

  await chatPane.locator('.pane-header').hover();
  await expect(chatPane).toHaveAttribute('data-pair-reveal', 'true');
  await expect(workqueuePane).toHaveAttribute('data-pair-reveal', 'true');

  await page.mouse.move(1, 1);
  await expect(chatPane).not.toHaveAttribute('data-pair-reveal', 'true');
  await expect(workqueuePane).not.toHaveAttribute('data-pair-reveal', 'true');

  await workqueuePane.getByTestId('pane-target-lock').focus();
  await expect(chatPane).toHaveAttribute('data-pair-reveal', 'true');
  await expect(workqueuePane).toHaveAttribute('data-pair-reveal', 'true');

  await page.locator('[data-pane-kind="chat"] [data-pane-input]').click();
  await page.locator('#paneManagerBtn').click();

  const manager = page.getByTestId('pane-manager-modal');
  const chatRow = manager.locator('.pane-manager-row[data-pane-kind="chat"]').first();
  const workqueueRow = manager.locator('.pane-manager-row[data-pane-kind="workqueue"]').first();
  await expect(chatRow.getByTestId('pane-manager-pair-cue')).toHaveText('Pair B');
  await expect(workqueueRow.getByTestId('pane-manager-pair-cue')).toHaveText('Pair A');

  const pairedAction = chatRow.getByTestId('pane-manager-paired-action');
  await expect(pairedAction).toHaveText('Paired Workqueue');
  await expect(pairedAction).toHaveAttribute('data-paired-kind', 'workqueue');
  await expect(pairedAction).toHaveAttribute('data-paired-state', 'focus');
  await expect(pairedAction).toHaveAttribute('data-paired-target', 'main');

  await pairedAction.click();

  await expect(manager).not.toHaveClass(/open/);
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"] [data-wq-queue-select]')).toBeFocused();
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);
});

test('pane manager paired action opens a missing counterpart for the same target', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginWithPanes(page, [{ key: 'ptestchat', kind: 'chat', agentId: 'main' }]);

  await page.locator('#paneManagerBtn').click();

  const manager = page.getByTestId('pane-manager-modal');
  const chatRow = manager.locator('.pane-manager-row[data-pane-kind="chat"]').first();
  const pairedAction = chatRow.getByTestId('pane-manager-paired-action');
  await expect(pairedAction).toHaveText('Open paired Workqueue');
  await expect(pairedAction).toHaveAttribute('data-paired-kind', 'workqueue');
  await expect(pairedAction).toHaveAttribute('data-paired-state', 'open');
  await expect(pairedAction).toHaveAttribute('data-paired-target', 'main');

  await pairedAction.click();

  const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();
  await expect(wqPane).toBeVisible();
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeFocused();
  await expect(wqPane.locator('[data-wq-scope="assigned"]')).toHaveAttribute('aria-pressed', 'true');

  await page.locator('#paneManagerBtn').click();
  await expect(chatRow.getByTestId('pane-manager-paired-action')).toHaveAttribute('data-paired-state', 'focus');
});

test('pane manager paired action is omitted for panes without counterpart behavior', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginWithPanes(page, [{ key: 'ptestchat', kind: 'chat', agentId: 'main' }]);
  await addPane(page, 'New Cron pane');
  await addPane(page, 'New Timeline pane');

  await page.locator('#paneManagerBtn').click();

  const manager = page.getByTestId('pane-manager-modal');
  await expect(manager.locator('.pane-manager-row[data-pane-kind="cron"]').last().getByTestId('pane-manager-paired-action')).toHaveCount(0);
  await expect(manager.locator('.pane-manager-row[data-pane-kind="timeline"]').last().getByTestId('pane-manager-paired-action')).toHaveCount(0);
});
