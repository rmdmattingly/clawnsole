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

test('agents modal renders pinned agents in a dedicated top section after reload', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  const agents = [
    { id: 'alpha', name: 'Alpha', displayName: 'Alpha' },
    { id: 'beta', name: 'Beta', displayName: 'Beta' },
    { id: 'gamma', name: 'Gamma', displayName: 'Gamma' }
  ];
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.evaluate(() => {
    const now = Date.now();
    localStorage.setItem('clawnsole.admin.agentLastSeenAtMs', JSON.stringify({ alpha: now, gamma: now }));
  });
  await page.getByRole('button', { name: 'Refresh agent list' }).click();

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  await page.locator('#agentsList .agents-row').filter({ hasText: 'Beta (beta)' }).locator('.agents-pin').click();
  await expect(page.locator('#agentsList .agents-section-title').nth(0)).toContainText('Pinned (1)');
  await expect(page.locator('#agentsList .agents-section').nth(0).locator('.agents-row')).toContainText('Beta (beta)');
  await expect(page.locator('#agentsList .agents-section-title').nth(1)).toContainText('Needs attention (0)');
  await expect(page.locator('#agentsList .agents-section-title').nth(2)).toContainText('Healthy (2)');

  await page.reload();
  await clawnsole.waitForAdminUiReady(page);
  await page.getByRole('button', { name: 'Open agents' }).click();

  await expect(page.locator('#agentsList .agents-section-title').nth(0)).toContainText('Pinned (1)');
  await expect(page.locator('#agentsList .agents-section').nth(0).locator('.agents-row')).toContainText('Beta (beta)');
  await expect(page.locator('#agentsList .agents-section-title').nth(1)).toContainText('Needs attention (0)');
  await expect(page.locator('#agentsList .agents-section-title').nth(2)).toContainText('Healthy (2)');
});

test('agents modal shows live refresh freshness indicators', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  await expect(page.locator('#agentsLastRefreshed')).toContainText('Last refreshed:');
  await expect(page.locator('#agentsList .agents-row-meta').first()).toContainText(/\d+[smhd]/);
});

test('agents modal shows fleet health summary counts and refreshes them', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  let agents = [
    { id: 'healthy-agent', name: 'healthy-agent', displayName: 'healthy-agent' },
    { id: 'stale-agent', name: 'stale-agent', displayName: 'stale-agent' },
    { id: 'disconnected-agent', name: 'disconnected-agent', displayName: 'disconnected-agent' }
  ];

  await clawnsole.gotoAndLoginAdmin(page);
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });
  await page.evaluate(() => {
    localStorage.setItem('clawnsole.admin.agentLastSeenAtMs', JSON.stringify({
      'healthy-agent': Date.now(),
      'stale-agent': Date.now() - 70 * 60 * 1000
    }));
  });
  await page.getByRole('button', { name: 'Refresh agent list' }).click();

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const summary = page.locator('#agentsList .agents-health-summary');
  await expect(summary).toBeVisible();
  await expect(summary.getByText('Needs triage')).toBeVisible();
  await expect(summary.locator('.agents-health-chip.attention')).toContainText('2');
  await expect(summary.locator('.agents-health-chip.healthy')).toContainText('1');
  await expect(summary.locator('.agents-health-chip.disconnected')).toContainText('1');

  agents = [{ id: 'healthy-agent', name: 'healthy-agent', displayName: 'healthy-agent' }];
  await page.getByRole('button', { name: 'Close agents' }).click();
  await expect(page.locator('#agentsModal')).not.toHaveClass(/open/);
  await page.getByRole('button', { name: 'Refresh agent list' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();

  await expect(summary.locator('.agents-health-chip.attention')).toContainText('0');
  await expect(summary.locator('.agents-health-chip.healthy')).toContainText('1');
  await expect(summary.locator('.agents-health-chip.disconnected')).toContainText('0');
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

test('agents modal heartbeat heatmap and stale-first sort are toggleable and resettable', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  const agents = ['fresh-agent', 'warning-agent', 'stale-agent', 'critical-agent']
    .map((id) => ({ id, name: id, displayName: id }));

  await clawnsole.gotoAndLoginAdmin(page);
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });
  await page.evaluate(() => {
    const now = Date.now();
    localStorage.setItem('clawnsole.admin.agentLastSeenAtMs', JSON.stringify({
      'fresh-agent': now,
      'warning-agent': now - 15 * 60 * 1000,
      'stale-agent': now - 70 * 60 * 1000
    }));
    localStorage.removeItem('clawnsole.admin.agents.heartbeatHeatmap');
    localStorage.removeItem('clawnsole.admin.agents.sort');
    localStorage.removeItem('clawnsole.admin.agents.preHeartbeatSort');
  });
  await page.getByRole('button', { name: 'Refresh agent list' }).click();

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);
  await expect(page.locator('#agentsHeatmapToggle')).not.toBeChecked();
  await expect(page.locator('#agentsList .agents-row-heatmap')).toHaveCount(0);

  await page.locator('#agentsHeatmapToggle').check();
  await expect(page.locator('#agentsList .agents-row-heatmap')).toHaveCount(4);
  await expect(page.locator('#agentsList .agents-row[data-heartbeat-bucket="critical"]')).toContainText('critical-agent');
  await expect(page.locator('#agentsList .agents-row[data-heartbeat-bucket="stale"]')).toContainText('stale-agent');
  await expect(page.locator('#agentsList .agents-row[data-heartbeat-bucket="warning"]')).toContainText('warning-agent');
  await expect(page.locator('#agentsList .agents-row[data-heartbeat-bucket="fresh"]')).toContainText('fresh-agent');

  await page.getByRole('button', { name: 'Stale first' }).click();
  await expect(page.locator('#agentsSort')).toHaveValue('heartbeat_age_desc');
  await expect(page.locator('#agentsSortIndicator')).toContainText('Sorted by heartbeat age');
  await expect(page.locator('#agentsList .agents-row:visible').first()).toContainText('critical-agent');

  await page.getByRole('button', { name: 'Reset sort' }).click();
  await expect(page.locator('#agentsSort')).toHaveValue('recent_desc');
  await expect(page.locator('#agentsSortIndicator')).toHaveText('');
});

test('agents modal quick actions open/reuse chat, timeline, and workqueue context', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const firstRow = page.locator('#agentsList .agents-row').first();
  await expect(firstRow.locator('[data-agent-action="open-chat"]').first()).toBeVisible();
  await expect(firstRow.locator('[data-agent-action="open-timeline"]').first()).toBeVisible();
  await expect(firstRow.locator('[data-agent-action="open-workqueue"]').first()).toBeVisible();
  const agentId = await firstRow.locator('[data-agent-action="open-workqueue"]').first().getAttribute('data-agent-id');

  await firstRow.locator('[data-agent-action="open-chat"]').first().click();
  await expect(page.locator('[data-pane][data-pane-kind="chat"]').first()).toBeVisible();

  await firstRow.locator('[data-agent-action="open-timeline"]').first().click();
  await expect(page.locator('[data-pane][data-pane-kind="timeline"]')).toHaveCount(1);

  await firstRow.locator('[data-agent-action="open-timeline"]').first().click();
  await expect(page.locator('[data-pane][data-pane-kind="timeline"]')).toHaveCount(1);

  await firstRow.locator('[data-agent-action="open-workqueue"]').first().click();
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"] [data-wq-claim-agent]')).toHaveValue(agentId || 'main');
});

test('agents modal shows a sticky selected-agent footer with triage actions', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  let agents = [
    { id: 'alpha', name: 'Alpha', displayName: 'Alpha' },
    { id: 'beta', name: 'Beta', displayName: 'Beta' }
  ];
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.evaluate(() => {
    const now = Date.now();
    localStorage.setItem('clawnsole.admin.agentLastSeenAtMs', JSON.stringify({ alpha: now, beta: now - 75_000 }));
  });
  await page.getByRole('button', { name: 'Refresh agent list' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();

  const row = page.locator('#agentsList .agents-row').filter({ hasText: 'Beta (beta)' });
  await row.click();

  const footer = page.locator('#agentsSelectionFooter');
  await expect(footer).toBeVisible();
  await expect(footer).toContainText('Beta (beta)');
  await expect(footer.locator('.agents-age-chip')).toContainText(/\d+[smhd]|unknown/);
  await expect(footer).toHaveCSS('position', 'sticky');

  await footer.getByRole('button', { name: /Open Workqueue for selected agent/ }).click();
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"] [data-wq-claim-agent]')).toHaveValue('beta');

  agents = [{ id: 'alpha', name: 'Alpha', displayName: 'Alpha' }];
  await page.getByRole('button', { name: 'Close agents' }).click();
  await page.getByRole('button', { name: 'Refresh agent list' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(footer).toBeHidden();
  await expect(footer.locator('[data-agent-action]')).toHaveCount(0);
});

test('agents modal triage action opens chat and workqueue from non-chat layout', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  const agents = [{ id: 'alpha', name: 'Alpha', displayName: 'Alpha' }];
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });
  await page.addInitScript(() => {
    localStorage.setItem(
      'clawnsole.admin.panes.v1',
      JSON.stringify([{ key: 'ptimeline', kind: 'timeline' }])
    );
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.getByRole('button', { name: 'Refresh agent list' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const row = page.locator('#agentsList .agents-row').filter({ hasText: 'Alpha (alpha)' });
  await expect(row.locator('[data-agent-action="triage"]').first()).toBeVisible();
  await row.locator('[data-agent-action="triage"]').first().click();

  await expect(page.locator('[data-pane][data-pane-kind="timeline"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="chat"] [data-pane-agent-select]')).toHaveValue('alpha');
  const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();
  await expect(wqPane.locator('[data-wq-claim-agent]')).toHaveValue('alpha');
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeFocused();
});

test('agents modal triage action reuses an existing chat and workqueue pair', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  const agents = [{ id: 'beta', name: 'Beta', displayName: 'Beta' }];
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });
  await page.addInitScript(() => {
    localStorage.setItem(
      'clawnsole.admin.panes.v1',
      JSON.stringify([
        { key: 'pchat', kind: 'chat', agentId: 'beta' },
        { key: 'pwq', kind: 'workqueue', agentId: 'beta', queue: 'dev-team', scopeFilter: 'assigned' }
      ])
    );
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.getByRole('button', { name: 'Refresh agent list' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const row = page.locator('#agentsList .agents-row').filter({ hasText: 'Beta (beta)' });
  await row.locator('[data-agent-action="triage"]').first().click();

  await expect(page.locator('[data-pane][data-pane-kind="chat"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);
  await expect(page.locator('[data-pane][data-pane-kind="chat"] [data-pane-agent-select]')).toHaveValue('beta');
  const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();
  await expect(wqPane.locator('[data-wq-claim-agent]')).toHaveValue('beta');
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeFocused();
});

test('agents modal compact density tightens rows and persists', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  const agents = Array.from({ length: 5 }, (_, index) => {
    const id = `density-agent-${index + 1}`;
    return { id, name: id, displayName: id };
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });
  await page.evaluate(() => {
    const now = Date.now();
    const lastSeen = {};
    for (let index = 1; index <= 5; index += 1) {
      lastSeen[`density-agent-${index}`] = now;
    }
    localStorage.setItem('clawnsole.admin.agentLastSeenAtMs', JSON.stringify(lastSeen));
  });
  await page.getByRole('button', { name: 'Refresh agent list' }).click();

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const rows = page.locator('#agentsList .agents-row:visible');
  await expect(rows).toHaveCount(5);
  const firstRow = rows.first();
  const comfortableHeight = await firstRow.evaluate((el) => el.getBoundingClientRect().height);

  await page.getByRole('button', { name: 'Compact' }).click();
  await expect(page.locator('#agentsList')).toHaveClass(/compact/);
  await expect(page.getByRole('button', { name: 'Compact' })).toHaveAttribute('aria-pressed', 'true');
  const compactHeight = await firstRow.evaluate((el) => el.getBoundingClientRect().height);

  expect(compactHeight).toBeLessThan(comfortableHeight * 0.7);
  await expect(firstRow.locator('[data-agent-action="open-chat"]').first()).toBeVisible();
  await expect(firstRow.locator('[data-agent-action="open-timeline"]').first()).toBeVisible();
  await expect(firstRow.locator('[data-agent-action="open-workqueue"]').first()).toBeVisible();

  await page.reload();
  await clawnsole.waitForAdminUiReady(page);
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsList')).toHaveClass(/compact/);
  await expect(page.getByRole('button', { name: 'Compact' })).toHaveAttribute('aria-pressed', 'true');
});
