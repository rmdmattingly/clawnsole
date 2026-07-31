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

async function loginWithPairedPanes(page) {
  await page.goto(`http://127.0.0.1:${env.serverPort}/`);
  await page.evaluate(() => {
    localStorage.setItem('clawnsole.admin.agentId', 'main');
    localStorage.setItem(
      'clawnsole.admin.panes.v1',
      JSON.stringify([
        { key: 'pairchat', kind: 'chat', agentId: 'main' },
        {
          key: 'pairwq',
          kind: 'workqueue',
          agentId: 'main',
          queue: 'dev-team',
          statusFilter: ['ready', 'pending', 'blocked', 'claimed', 'in_progress'],
          scopeFilter: 'assigned',
          sortKey: 'priority',
          sortDir: 'desc'
        },
        { key: 'solochat', kind: 'chat', agentId: 'dev' }
      ])
    );
  });
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await waitForAdminUiReady(page);
}

test('Chat and Workqueue sibling panes show matching pair cues and reveal on hover/focus', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginWithPairedPanes(page);

  const chatPane = page.locator('[data-pane][data-pane-kind="chat"]').first();
  const workqueuePane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();

  await expect(chatPane.getByTestId('pane-pair-cue')).toBeVisible();
  await expect(workqueuePane.getByTestId('pane-pair-cue')).toBeVisible();
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
});

test('Pane Manager rows preserve pair cues for overflow-style navigation', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginWithPairedPanes(page);
  await page.locator('#paneManagerBtn').click();

  const manager = page.getByTestId('pane-manager-modal');
  await expect(manager).toHaveClass(/open/);

  const chatRow = manager.locator('.pane-manager-row[data-pane-kind="chat"]').first();
  const workqueueRow = manager.locator('.pane-manager-row[data-pane-kind="workqueue"]').first();

  await expect(chatRow.getByTestId('pane-manager-pair-cue')).toHaveText('Pair B');
  await expect(workqueueRow.getByTestId('pane-manager-pair-cue')).toHaveText('Pair A');
});
