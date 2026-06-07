const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { startTestEnv, loginAdmin, attachConsoleErrorAsserts } = require('./_helpers');

function writeWorkqueueState(tempHome, itemPatch = {}) {
  const dir = path.join(tempHome, '.openclaw', 'clawnsole');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'work-queues.json'),
    JSON.stringify(
      {
        version: 1,
        queues: { 'dev-team': { name: 'dev-team', createdAt: new Date().toISOString() } },
        items: [
          {
            id: 'item-1',
            queue: 'dev-team',
            title: 'Initial item',
            instructions: 'test',
            priority: 1,
            status: 'ready',
            attempts: 0,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            ...itemPatch
          }
        ],
        assignments: {}
      },
      null,
      2
    ) + '\n'
  );
}

test('pane unread badges: chat and workqueue activity are type-aware and clear on focus', async ({ page }) => {
  const clawnsole = await startTestEnv();
  test.skip(clawnsole.skipReason, clawnsole.skipReason);
  const asserts = attachConsoleErrorAsserts(page);
  writeWorkqueueState(clawnsole.tempHome);

  try {
    await loginAdmin(page, clawnsole.serverPort);

    const chatPane = page.locator('[data-pane][data-pane-kind="chat"]').first();
    const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();
    await expect(chatPane).toBeVisible();
    await expect(wqPane.locator('[data-wq-list-body]')).toContainText('Initial item', { timeout: 10000 });

    await chatPane.locator('[data-pane-input]').fill('unread badge check');
    await chatPane.locator('[data-pane-send]').click();
    await wqPane.locator('[data-wq-queue-search]').focus();

    await expect(chatPane.locator('.pane-unread-badge[data-unread-type="chat"]')).toContainText(/Chat\s+\d+/, { timeout: 7000 });

    await page.locator('#paneManagerBtn').click();
    await expect(page.locator('#paneManagerModal')).toHaveClass(/open/);
    await expect(page.locator('.pane-manager-unread-badge[data-unread-type="chat"]').first()).toContainText(/Chat\s+\d+/);
    await page.locator('#paneManagerCloseBtn').click();

    await chatPane.locator('[data-pane-input]').focus();
    await expect(chatPane.locator('.pane-unread-badge[data-unread-type="chat"]')).toHaveCount(0);

    writeWorkqueueState(clawnsole.tempHome, {
      status: 'claimed',
      claimedBy: 'dev',
      updatedAt: '2026-01-01T00:01:00.000Z'
    });
    await chatPane.locator('[data-pane-input]').focus();

    await expect(wqPane.locator('.pane-unread-badge[data-unread-type="workqueue"]')).toContainText(/WQ\s+\d+/, { timeout: 20000 });

    await page.locator('#paneManagerBtn').click();
    await expect(page.locator('#paneManagerModal')).toHaveClass(/open/);
    await expect(page.locator('.pane-manager-unread-badge[data-unread-type="workqueue"]').first()).toContainText(/WQ\s+\d+/);
    await page.locator('#paneManagerCloseBtn').click();

    await wqPane.locator('[data-wq-queue-search]').focus();
    await expect(wqPane.locator('.pane-unread-badge[data-unread-type="workqueue"]')).toHaveCount(0);

    asserts.assertNoErrors();
  } finally {
    clawnsole.stop?.();
  }
});
