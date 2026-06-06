const { test, expect } = require('./fixtures');

test('agents modal supports pinning agents and persists to localStorage', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  // Pin the (usually only) agent row.
  const firstPin = page.locator('#agentsList .agents-pin').first();
  await firstPin.click();
  await expect(firstPin).toHaveAttribute('aria-pressed', 'true');

  // Reload should keep pins.
  await page.reload();
  await clawnsole.waitForAdminUiReady(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const firstPinAfter = page.locator('#agentsList .agents-pin').first();
  await expect(firstPinAfter).toHaveAttribute('aria-pressed', 'true');
});

test('agents modal shows live refresh freshness indicators', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  await expect(page.locator('#agentsLastRefreshed')).toContainText('Last refreshed:');
  await expect(page.locator('#agentsList .agents-row-meta').first()).toContainText(/\d+[smhd]/);
});

test('agents modal quick filter narrows list and Esc clears it', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const rows = page.locator('#agentsList .agents-row');
  const initialCount = await rows.count();
  expect(initialCount).toBeGreaterThan(0);

  const search = page.locator('#agentsSearch');
  await search.fill('zzzz-no-agent-match');
  await expect(rows).toHaveCount(0);

  await search.press('Escape');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('');
  await expect(rows).toHaveCount(initialCount);
});

test('fleet attention mode sections healthy agents and keeps filters while expanding', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  const agents = Array.from({ length: 12 }, (_, index) => {
    const id = `agent-${index + 1}`;
    return { id, name: id, displayName: id };
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });
  await page.evaluate(() => {
    const now = Date.now();
    const lastSeen = {};
    for (let index = 2; index <= 12; index += 1) {
      lastSeen[`agent-${index}`] = now;
    }
    localStorage.setItem('clawnsole.admin.agentLastSeenAtMs', JSON.stringify(lastSeen));
  });
  await page.getByRole('button', { name: 'Refresh agent list' }).click();

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  await expect(page.locator('#agentsList .agents-section-title').first()).toContainText('Needs attention (1)');
  const healthyToggle = page.getByRole('button', { name: /Healthy \(11\) Show/ });
  await expect(healthyToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#agentsList .agents-row:visible')).toHaveCount(1);

  await healthyToggle.click();
  await expect(page.getByRole('button', { name: /Healthy \(11\) Hide/ })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#agentsList .agents-row:visible')).toHaveCount(12);

  await page.getByRole('button', { name: 'Offline/Error' }).click();
  await expect(page.getByRole('button', { name: 'Offline/Error' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#agentsList .agents-section-title').first()).toContainText('Needs attention (1)');
  await expect(page.getByRole('button', { name: /Healthy \(0\) Hide/ })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#agentsList .agents-row:visible')).toHaveCount(1);
});

test('agents modal quick actions open/reuse chat, timeline, and workqueue context', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const firstRow = page.locator('#agentsList .agents-row').first();
  await expect(firstRow.locator('[data-agent-action="triage"]').first()).toBeVisible();
  await expect(firstRow.locator('[data-agent-action="open-chat"]').first()).toBeVisible();
  await expect(firstRow.locator('[data-agent-action="open-timeline"]').first()).toBeVisible();
  await expect(firstRow.locator('[data-agent-action="open-workqueue"]').first()).toBeVisible();

  await firstRow.locator('[data-agent-action="open-chat"]').first().click();
  await expect(page.locator('[data-pane][data-pane-kind="chat"]').first()).toBeVisible();

  await firstRow.locator('[data-agent-action="open-timeline"]').first().click();
  await expect(page.locator('[data-pane][data-pane-kind="timeline"]')).toHaveCount(1);

  await firstRow.locator('[data-agent-action="open-timeline"]').first().click();
  await expect(page.locator('[data-pane][data-pane-kind="timeline"]')).toHaveCount(1);

  await firstRow.locator('[data-agent-action="open-workqueue"]').first().click();
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);
});

test('agents modal triage action opens missing counterpart from minimal layout', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  while ((await page.locator('[data-pane]').count()) > 1) {
    await page.locator('[data-pane] [data-pane-close]').first().click();
  }
  await expect(page.locator('[data-pane]')).toHaveCount(1);

  await page.getByRole('button', { name: 'Open agents' }).click();
  const firstRow = page.locator('#agentsList .agents-row').first();
  const agentId = await firstRow.locator('[data-agent-action="triage"]').first().getAttribute('data-agent-id');

  await firstRow.locator('[data-agent-action="triage"]').first().click();

  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"] [data-wq-scope="assigned"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"] [data-wq-queue-select]')).toBeFocused();

  const panes = await page.evaluate(() => JSON.parse(localStorage.getItem('clawnsole.admin.panes.v1') || '[]'));
  const workqueuePane = panes.find((pane) => pane.kind === 'workqueue');
  expect(workqueuePane?.agentId).toBe(agentId);
  expect(workqueuePane?.scopeFilter).toBe('assigned');
});

test('agents modal triage action reuses existing chat and workqueue panes', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);
  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);

  await page.getByRole('button', { name: 'Open agents' }).click();
  const firstRow = page.locator('#agentsList .agents-row').first();
  const agentId = await firstRow.locator('[data-agent-action="triage"]').first().getAttribute('data-agent-id');

  await firstRow.locator('[data-agent-action="triage"]').first().click();
  await firstRow.locator('[data-agent-action="triage"]').first().click();

  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"] [data-wq-scope="assigned"]')).toHaveAttribute('aria-pressed', 'true');

  const panes = await page.evaluate(() => JSON.parse(localStorage.getItem('clawnsole.admin.panes.v1') || '[]'));
  const chatPanes = panes.filter((pane) => pane.kind === 'chat');
  const workqueuePanes = panes.filter((pane) => pane.kind === 'workqueue');
  expect(chatPanes).toHaveLength(1);
  expect(workqueuePanes).toHaveLength(1);
  expect(chatPanes[0]?.agentId).toBe(agentId);
  expect(workqueuePanes[0]?.agentId).toBe(agentId);
  expect(workqueuePanes[0]?.scopeFilter).toBe('assigned');
});
