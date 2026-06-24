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

test('workqueue pane: pane grid label switches from chat-only to generic panes', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await page.addInitScript(() => {
    localStorage.setItem(
      'clawnsole.admin.panes.v1',
      JSON.stringify([{ key: 'ptestchat', kind: 'chat', agentId: 'main' }])
    );
  });

  await loginAdmin(page, env.serverPort);

  const grid = page.getByTestId('pane-grid');
  await expect(grid).toHaveAttribute('aria-label', 'Chat panes');

  await addPane(page, 'Workqueue pane');

  await expect(page.locator('[data-pane-kind="workqueue"]').last()).toBeVisible();
  await expect(grid).toHaveAttribute('aria-label', 'Panes');
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

  await expect(search).toHaveAttribute('placeholder', 'Filter queue list...');
  await expect(search).toHaveAttribute('aria-label', 'Filter queue list');

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

test('workqueue pane: item search filters rows separately from queue filter', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const queue = `item-search-${Date.now()}`;
  await page.evaluate(async ({ queue }) => {
    const enqueue = async (title, instructions) => {
      const res = await fetch('/api/workqueue/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ queue, title, instructions, priority: 1 })
      });
      if (!res.ok) throw new Error(`enqueue failed: ${res.status}`);
    };
    await enqueue('needle alpha work', 'repo rmdmattingly/clawnsole');
    await enqueue('ordinary beta work', 'contains beta-only text');
  }, { queue });

  const pane = page.locator('[data-pane]').last();
  const queueSearch = pane.locator('[data-wq-queue-search]');
  const itemSearch = pane.locator('[data-wq-item-search]');
  const rows = pane.locator('[data-wq-list-body] .wq-row');

  await pane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await pane.locator('[data-wq-queue-custom]').fill(queue);
  await pane.locator('[data-wq-queue-custom]').press('Enter');
  await pane.locator('[data-wq-refresh]').click();
  await expect(rows).toHaveCount(2);

  await queueSearch.fill('needle alpha');
  await expect(rows).toHaveCount(2);

  await expect(itemSearch).toHaveAttribute('placeholder', 'Search items...');
  await itemSearch.fill('needle alpha');
  await expect(rows).toHaveCount(1);
  await expect(rows.first().locator('.wq-col.title')).toContainText('needle alpha work');

  await itemSearch.fill('no matching item');
  await expect(rows).toHaveCount(0);
  await expect(pane.locator('[data-wq-empty]')).toContainText('No items match your search.');
  await expect(pane.locator('[data-wq-empty]')).toContainText('no matching item');

  await pane.locator('[data-wq-empty-clear-search]').click();
  await expect(itemSearch).toHaveValue('');
  await expect(rows).toHaveCount(2);

  await pane.locator('.wq-list-header').click();
  await page.keyboard.press('/');
  await expect(itemSearch).toBeFocused();
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
