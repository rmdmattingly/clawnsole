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
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeVisible();

  // Workqueue pane should not render the chat composer UI.
  await expect(wqPane.locator('.chat-input-row')).toBeHidden();
  await expect(wqPane.locator('[data-pane-input]')).toBeHidden();
});

test('workqueue pane: scope filter toggles assigned/unassigned/all deterministically', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  await page.evaluate(async () => {
    const post = async (url, body) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      return res.json();
    };

    await post('/api/workqueue/enqueue', { queue: 'dev-team', title: 'a', instructions: 'x', priority: 1 });
    await post('/api/workqueue/enqueue', { queue: 'dev-team', title: 'b', instructions: 'x', priority: 1 });
    await post('/api/workqueue/enqueue', { queue: 'dev-team', title: 'c', instructions: 'x', priority: 1 });
    await post('/api/workqueue/claim-next', { agentId: 'main', queues: ['dev-team'], leaseMs: 900000 });
  });

  const wqPane = page.locator('[data-pane-kind="workqueue"]').last();
  await wqPane.locator('[data-wq-refresh]').click();

  const rows = wqPane.locator('[data-wq-list-body] .wq-row');
  const allBtn = wqPane.locator('[data-wq-scope="all"]');
  const assignedBtn = wqPane.locator('[data-wq-scope="assigned"]');
  const unassignedBtn = wqPane.locator('[data-wq-scope="unassigned"]');

  await allBtn.click();
  await expect(rows).toHaveCount(3);
  await assignedBtn.click();
  await expect(rows).toHaveCount(1);
  await unassignedBtn.click();
  await expect(rows).toHaveCount(2);
});

test('workqueue pane: high-volume all-scope guardrail shows and downscopes with one click', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');
  const queueName = `wq-guardrail-high-${Date.now()}`;
  const wqPane = page.locator('[data-pane-kind="workqueue"]').last();
  await wqPane.getByTestId('wq-pane-queue-select').selectOption('__custom__');
  await wqPane.getByTestId('wq-pane-queue-custom').fill(queueName);
  await wqPane.getByTestId('wq-pane-queue-custom').press('Enter');

  await page.evaluate(async ({ queueName }) => {
    const post = async (url, body) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      return res.json();
    };

    for (let i = 0; i < 205; i += 1) {
      await post('/api/workqueue/enqueue', { queue: queueName, title: `bulk-${i}`, instructions: 'x', priority: 1 });
    }
    await post('/api/workqueue/claim-next', { agentId: 'main', queues: [queueName], leaseMs: 900000 });
  }, { queueName });

  await wqPane.locator('[data-wq-refresh]').click();
  await expect(wqPane.locator('[data-wq-all-scope-guardrail]')).toBeVisible();
  await expect(wqPane.locator('[data-wq-all-scope-guardrail-text]')).toContainText('Viewing all items');

  const rows = wqPane.locator('[data-wq-list-body] .wq-row');
  await wqPane.locator('[data-wq-all-scope-action="assigned"]').click();
  await expect(rows).toHaveCount(1);
  await expect(wqPane.locator('[data-wq-all-scope-guardrail]')).toBeHidden();
});

test('workqueue pane: all-scope guardrail does not show under threshold', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');
  const queueName = `wq-guardrail-low-${Date.now()}`;
  const wqPane = page.locator('[data-pane-kind="workqueue"]').last();
  await wqPane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await wqPane.locator('[data-wq-queue-custom]').fill(queueName);
  await wqPane.locator('[data-wq-queue-custom]').press('Enter');

  await page.evaluate(async ({ queueName }) => {
    const post = async (url, body) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      return res.json();
    };
    for (let i = 0; i < 10; i += 1) {
      await post('/api/workqueue/enqueue', { queue: queueName, title: `small-${i}`, instructions: 'x', priority: 1 });
    }
  }, { queueName });

  await wqPane.locator('[data-wq-refresh]').click();
  await expect(wqPane.locator('[data-wq-all-scope-guardrail]')).toBeHidden();
});

test('topbar Open workqueue pairs to active chat target and reuses pane', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);
  await loginAdmin(page, env.serverPort);

  const panes = page.locator('[data-pane]');
  const initialCount = await panes.count();

  const lastChatPane = panes.filter({ has: page.locator('[data-pane-input]') }).last();
  await lastChatPane.locator('[data-pane-input]').focus();

  await page.click('#workqueueBtn');
  await expect(page.locator('[data-pane-kind="workqueue"]')).toHaveCount(1);
  await expect(page.locator('[data-pane-kind="workqueue"]').last().locator('[data-wq-scope="assigned"]')).toHaveClass(/active/);

  const afterFirst = await panes.count();
  expect(afterFirst).toBe(initialCount + 1);

  await page.click('#workqueueBtn');
  await expect(page.locator('[data-pane-kind="workqueue"]')).toHaveCount(1);
  const afterSecond = await panes.count();
  expect(afterSecond).toBe(afterFirst);
});

test('workqueue pane: repo preset "Clawnsole only" narrows cards by repo', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);
  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const queueName = `wq-repo-${Date.now()}`;
  const wqPane = page.locator('[data-pane-kind="workqueue"]').last();
  await wqPane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await wqPane.locator('[data-wq-queue-custom]').fill(queueName);
  await wqPane.locator('[data-wq-queue-custom]').press('Enter');

  await page.evaluate(async ({ queueName }) => {
    const post = async (url, body) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      return res.json();
    };
    await post('/api/workqueue/enqueue', {
      queue: queueName,
      title: 'clawnsole task',
      instructions: 'Repo: rmdmattingly/clawnsole',
      priority: 10
    });
    await post('/api/workqueue/enqueue', {
      queue: queueName,
      title: 'speechee task',
      instructions: 'Repo: rmdmattingly/speechee',
      priority: 5
    });
  }, { queueName });

  await wqPane.locator('[data-wq-refresh]').click();
  const rows = wqPane.locator('[data-wq-list-body] .wq-row');
  await expect(rows).toHaveCount(2);
  await wqPane.locator('[data-wq-repo-preset="clawnsole"]').click();
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('clawnsole task');
});

test('workqueue pane: status transition + edit + delete golden path', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);
  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const queueName = `wq-golden-${Date.now()}`;
  const wqPane = page.locator('[data-pane-kind="workqueue"]').last();
  await wqPane.locator('[data-wq-queue-select]').selectOption('__custom__');
  await wqPane.locator('[data-wq-queue-custom]').fill(queueName);
  await wqPane.locator('[data-wq-queue-custom]').press('Enter');

  const seeded = await page.evaluate(async ({ queueName }) => {
    const post = async (url, body) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      return res.json();
    };
    const first = await post('/api/workqueue/enqueue', {
      queue: queueName,
      title: 'golden item A',
      instructions: 'initial instructions',
      priority: 5
    });
    await post('/api/workqueue/enqueue', {
      queue: queueName,
      title: 'golden item B',
      instructions: 'second item',
      priority: 1
    });
    return first?.item?.id || null;
  }, { queueName });
  expect(seeded).toBeTruthy();

  await wqPane.getByTestId('wq-pane-refresh').click();
  await expect(wqPane.getByTestId('wq-pane-status-filter')).toBeVisible();
  await expect(wqPane.getByTestId('wq-pane-status-selected')).toBeVisible();
  await expect(wqPane.getByTestId('wq-item-row')).toHaveCount(2);

  const targetRow = wqPane.getByTestId('wq-item-row').filter({ hasText: 'golden item A' }).first();
  await expect(targetRow).toBeVisible();
  await targetRow.evaluate((el) => el.click());
  await expect(wqPane.getByTestId('wq-pane-inspect')).toContainText('golden item A');
  await expect(wqPane.getByTestId('wq-pane-inspect')).toContainText(seeded);

  const promptValues = ['edited title', 'edited instructions', '9', 'in_progress'];
  page.on('dialog', async (dialog) => {
    if (dialog.type() === 'prompt') {
      const next = promptValues.shift();
      await dialog.accept(next);
      return;
    }
    await dialog.accept();
  });

  await wqPane.getByTestId('wq-pane-item-edit').dispatchEvent('click');
  await expect(wqPane.getByTestId('wq-pane-inspect')).toContainText('edited title');
  await expect(wqPane.getByTestId('wq-pane-inspect')).toContainText('in_progress');
  await expect(wqPane.getByTestId('wq-item-row').filter({ hasText: 'edited title' })).toHaveCount(1);

  await wqPane.getByTestId('wq-pane-item-delete').dispatchEvent('click');
  await expect(wqPane.getByTestId('wq-item-row').filter({ hasText: 'edited title' })).toHaveCount(0);
});
