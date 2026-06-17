const { test, expect } = require('@playwright/test');

const { startTestEnv, loginAdmin, attachConsoleErrorAsserts, addPane } = require('./_helpers');

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

test('workqueue pane: renders + has queue dropdown + does not show chat composer', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  await addPane(page, 'Workqueue pane');

  const panes = page.locator('[data-pane]');
  const wqPane = panes.last();

  await expect(wqPane.locator('.wq-pane')).toHaveCount(1);
  await expect(wqPane.locator('[data-wq-queue-search]')).toBeVisible();
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeVisible();

  // Header target should describe queue context (not agent).
  await expect(wqPane.locator('[data-pane-target-label]')).toHaveText('Queue');

  // Refreshing agent list should not flip the workqueue header back to Agent.
  await page.getByLabel('Refresh agent list').click();
  await expect(wqPane.locator('[data-pane-target-label]')).toHaveText('Queue');

  // Workqueue pane should not render the chat composer UI.
  await expect(wqPane.locator('.chat-input-row')).toBeHidden();
  await expect(wqPane.locator('[data-pane-input]')).toBeHidden();
});

test('workqueue pane: queue target supports search + recent persistence', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const firstPane = page.locator('[data-pane]').last();
  const search = firstPane.locator('[data-wq-queue-search]');
  const select = firstPane.locator('[data-wq-queue-select]');

  await search.fill('dev');
  const visibleDevOption = select.locator('option:not([hidden])', { hasText: 'dev-team' }).first();
  await expect(visibleDevOption).toHaveCount(1);

  await select.selectOption('__custom__');
  const custom = firstPane.locator('[data-wq-queue-custom]');
  await custom.fill('qa-hotfix');
  await custom.press('Enter');

  await addPane(page, 'Workqueue pane');
  const secondPane = page.locator('[data-pane]').last();
  const secondSelect = secondPane.locator('[data-wq-queue-select]');
  await expect(secondSelect.locator('option', { hasText: '★ qa-hotfix' })).toHaveCount(1);
});

test('workqueue pane: scope filter toggles assigned/unassigned/all deterministically', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const queue = `scope-filter-${Date.now()}`;
  await page.evaluate(async ({ queue }) => {
    const post = async (url, body) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`${url} failed: ${res.status}`);
      const data = await res.json();
      if (!data?.ok) throw new Error(`${url} failed: ${data?.error || 'not ok'}`);
      return data;
    };

    await post('/api/workqueue/enqueue', { queue, title: 'scope a', instructions: 'x', priority: 1 });
    await post('/api/workqueue/enqueue', { queue, title: 'scope b', instructions: 'x', priority: 1 });
    await post('/api/workqueue/enqueue', { queue, title: 'scope c', instructions: 'x', priority: 1 });
    await post('/api/workqueue/claim-next', { agentId: 'main', queues: [queue], leaseMs: 900000 });
  }, { queue });

  const wqPane = page.locator('[data-pane]').last();
  await wqPane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await wqPane.locator('[data-wq-queue-custom]').fill(queue);
  await wqPane.locator('[data-wq-queue-custom]').press('Enter');
  await wqPane.locator('[data-wq-refresh]').click();

  const rows = wqPane.locator('[data-wq-list-body] .wq-row');
  await wqPane.locator('[data-wq-scope="all"]').click();
  await expect(rows).toHaveCount(3);
  await wqPane.locator('[data-wq-scope="assigned"]').click();
  await expect(rows).toHaveCount(1);
  await wqPane.locator('[data-wq-scope="unassigned"]').click();
  await expect(rows).toHaveCount(2);
});

test('workqueue pane: golden path edits status, saves content, and deletes item', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const queue = `golden-path-${Date.now()}`;
  const originalTitle = `golden item ${Date.now()}`;
  const originalInstructions = 'original golden instructions';
  const updatedTitle = `${originalTitle} updated`;
  const updatedInstructions = 'updated golden instructions';

  await page.evaluate(async ({ queue, originalTitle, originalInstructions }) => {
    const res = await fetch('/api/workqueue/enqueue', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queue,
        title: originalTitle,
        instructions: originalInstructions,
        priority: 42
      })
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || `enqueue failed ${res.status}`);
  }, { queue, originalTitle, originalInstructions });

  const wqPane = page.locator('[data-pane]').last();
  await wqPane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await wqPane.locator('[data-wq-queue-custom]').fill(queue);
  const refreshAfterQueue = page.waitForResponse((res) => res.url().includes('/api/workqueue/items') && res.ok(), { timeout: 15000 });
  await wqPane.locator('[data-wq-queue-custom]').press('Enter');
  await refreshAfterQueue;

  const row = wqPane.getByTestId('workqueue-pane-item').filter({ hasText: originalTitle });
  await expect(row).toHaveCount(1);
  await row.click();

  await expect(wqPane.getByTestId('workqueue-pane-edit-form')).toBeVisible();
  await expect(wqPane.getByTestId('workqueue-pane-edit-title')).toHaveValue(originalTitle);
  await expect(wqPane.getByTestId('workqueue-pane-edit-instructions')).toHaveValue(originalInstructions);

  await wqPane.getByTestId('workqueue-pane-edit-status').selectOption('in_progress');
  await wqPane.getByTestId('workqueue-pane-edit-title').fill(updatedTitle);
  await wqPane.getByTestId('workqueue-pane-edit-instructions').fill(updatedInstructions);

  const saveResponse = page.waitForResponse((res) => res.url().includes('/api/workqueue/update') && res.ok(), { timeout: 15000 });
  await wqPane.getByTestId('workqueue-pane-save').click();
  await saveResponse;

  const updatedRow = wqPane.getByTestId('workqueue-pane-item').filter({ hasText: updatedTitle });
  await expect(updatedRow).toHaveCount(1);
  await expect(updatedRow).toContainText('in_progress');
  await expect(wqPane.getByTestId('workqueue-pane-edit-instructions')).toHaveValue(updatedInstructions);

  await wqPane.getByTestId('workqueue-pane-delete').click();
  await expect(wqPane.getByTestId('workqueue-pane-confirm-delete')).toBeVisible();

  const deleteResponse = page.waitForResponse((res) => res.url().includes('/api/workqueue/delete') && res.ok(), { timeout: 15000 });
  await wqPane.getByTestId('workqueue-pane-confirm-delete').click();
  await deleteResponse;

  await expect(wqPane.getByTestId('workqueue-pane-item').filter({ hasText: updatedTitle })).toHaveCount(0);
  await expect(wqPane.locator('[data-wq-inspect]')).toContainText('Select an item to inspect.');
});

test('workqueue pane: source chips + clawnsole preset filter items without reload', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const pane = page.locator('[data-pane]').last();

  const enqueue = async (title, instructions) => {
    await page.evaluate(async ({ title, instructions }) => {
      await fetch('/api/workqueue/enqueue', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue: 'dev-team', title, instructions, priority: 50 })
      });
    }, { title, instructions });
  };

  await enqueue('[ISSUE] clawnsole issue item', 'https://github.com/rmdmattingly/clawnsole/issues/177');
  await enqueue('[ROUTINE] speechee routine item', 'https://github.com/rmdmattingly/speechee/pull/37');

  await pane.locator('[data-wq-refresh]').click();
  await expect(pane.locator('.wq-row')).toHaveCount(2);

  await pane.locator('[data-wq-source="issue"]').click();
  await expect(pane.locator('.wq-row')).toHaveCount(1);
  await expect(pane.locator('.wq-row .wq-col.title')).toContainText(/clawnsole issue item/i);

  await pane.locator('[data-wq-clear-quick]').click();
  await expect(pane.locator('.wq-row')).toHaveCount(2);

  await pane.locator('[data-wq-preset-clawnsole]').click();
  await expect(pane.locator('.wq-row')).toHaveCount(1);
  await expect(pane.locator('.wq-row .wq-col.title')).toContainText(/clawnsole issue item/i);
});

test('workqueue pane: controls toolbar is sticky and list scrolls independently', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const wqPane = page.locator('[data-pane]').last();
  const toolbar = wqPane.locator('.wq-pane .wq-toolbar');
  const listBody = wqPane.locator('.wq-pane [data-wq-list-body]').first();

  await expect(toolbar).toBeVisible();
  await expect(listBody).toHaveCount(1);

  const itemsResP = page.waitForResponse((res) => res.url().includes('/api/workqueue/items') && res.ok(), { timeout: 15000 });
  await wqPane.locator('[data-wq-refresh]').click();
  await itemsResP;

  const styles = await toolbar.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      position: cs.position,
      top: cs.top,
      zIndex: cs.zIndex,
      backgroundColor: cs.backgroundColor
    };
  });

  expect(styles.position).toBe('sticky');
  expect(styles.top).toBe('0px');
  expect(Number(styles.zIndex)).toBeGreaterThanOrEqual(5);
  expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');

  const listStyles = await listBody.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return { overflowY: cs.overflowY };
  });
  expect(['auto', 'scroll']).toContain(listStyles.overflowY);
});
