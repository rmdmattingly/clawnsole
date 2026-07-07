const { test, expect } = require('@playwright/test');

const { startTestEnv, loginAdmin, attachConsoleErrorAsserts } = require('./_helpers');

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

test('workqueue modal: golden path covers filters, kanban transition, edit, and delete', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  await page.evaluate(async () => {
    const res = await fetch('/api/workqueue/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        queue: 'dev-team',
        title: 'Golden path item',
        instructions: 'Exercise workqueue UI',
        priority: 42,
        dedupeKey: 'ui-golden-path'
      })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) throw new Error(data?.error || `enqueue failed: ${res.status}`);
  });

  await page.locator('#workqueueBtn').click();

  const modal = page.getByTestId('wq-modal');
  await expect(modal).toHaveClass(/open/);
  await expect(modal.getByTestId('wq-modal-queue-select')).toBeVisible();
  await expect(modal.getByTestId('wq-modal-status-filters')).toBeVisible();
  await expect(modal.getByTestId('wq-modal-status-filter-ready')).toBeVisible();

  await modal.getByTestId('wq-modal-queue-select').selectOption('dev-team');
  const readyLane = modal.getByTestId('wq-modal-lane-ready');
  const inProgressLane = modal.getByTestId('wq-modal-lane-in_progress');
  const itemCard = readyLane.getByTestId('wq-modal-card').filter({ hasText: 'Golden path item' }).first();
  await expect(itemCard).toBeVisible();

  const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
  await itemCard.dispatchEvent('dragstart', { dataTransfer });
  await inProgressLane.dispatchEvent('dragover', { dataTransfer });
  await inProgressLane.dispatchEvent('drop', { dataTransfer });

  const movedCard = inProgressLane.getByTestId('wq-modal-card').filter({ hasText: 'Golden path item' }).first();
  await expect(movedCard).toBeVisible();
  await movedCard.click();
  await expect(modal.getByTestId('wq-modal-inspect')).toContainText('Golden path item');

  const editAnswers = ['Golden path item edited', 'Updated instructions', '77', 'in_progress'];
  const editDialogHandler = async (dialog) => {
    await dialog.accept(editAnswers.shift());
  };
  page.on('dialog', editDialogHandler);
  await modal.getByTestId('wq-modal-edit').click();
  await expect(inProgressLane).toContainText('Golden path item edited');
  page.off('dialog', editDialogHandler);
  expect(editAnswers).toHaveLength(0);

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Delete workqueue item?');
    await dialog.accept();
  });
  await modal.getByTestId('wq-modal-delete').click();

  await expect(modal.getByTestId('wq-modal-list')).not.toContainText('Golden path item edited');
  await expect(modal.getByTestId('wq-modal-inspect')).toContainText('Select an item to inspect.');
});
