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

test('agents modal defers auto-refresh while a fleet row is active, then catches up once', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  let agents = [{ id: 'alpha', name: 'Alpha', displayName: 'Alpha' }];
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.getByRole('button', { name: 'Refresh agent list' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const row = page.locator('#agentsList .agents-row').filter({ hasText: 'Alpha (alpha)' });
  await expect(row).toBeVisible();
  await row.locator('[data-agent-action="open-chat"]').first().focus();

  agents = [{ id: 'beta', name: 'Beta', displayName: 'Beta' }];
  await page.evaluate(() => window.__debug.refreshAgents({ reason: 'fleet_auto_refresh' }));

  await expect(page.locator('#agentsRefreshPaused')).toContainText('Refresh paused');
  await expect(row).toBeVisible();
  await expect(page.locator('#agentsList')).not.toContainText('Beta (beta)');

  await page.locator('#agentsSearch').focus();
  await expect(page.locator('#agentsRefreshPaused')).toBeHidden();
  await expect(page.locator('#agentsList')).toContainText('Beta (beta)');
  await expect(page.locator('#agentsList')).not.toContainText('Alpha (alpha)');
});

test('agents modal keeps an open row menu stable during a paused refresh', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  let agents = [{ id: 'alpha', name: 'Alpha', displayName: 'Alpha' }];
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.getByRole('button', { name: 'Refresh agent list' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  await page.evaluate(() => {
    const details = document.querySelector('#agentsList .agents-row-actions-overflow');
    details.open = true;
    details.dispatchEvent(new Event('toggle', { bubbles: true }));
  });

  agents = [{ id: 'beta', name: 'Beta', displayName: 'Beta' }];
  await page.evaluate(() => window.__debug.refreshAgents({ reason: 'fleet_auto_refresh' }));

  await expect(page.locator('#agentsRefreshPaused')).toContainText('Refresh paused');
  await expect(page.locator('#agentsList .agents-row-actions-overflow').first()).toHaveAttribute('open', '');
  await expect(page.locator('#agentsList')).toContainText('Alpha (alpha)');
  await expect(page.locator('#agentsList')).not.toContainText('Beta (beta)');
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

test('agents modal shows row health and heartbeat-age chips', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  const agents = [
    { id: 'healthy-agent', name: 'healthy-agent', displayName: 'healthy-agent' },
    { id: 'stale-agent', name: 'stale-agent', displayName: 'stale-agent' },
    { id: 'offline-agent', name: 'offline-agent', displayName: 'offline-agent' }
  ];

  await clawnsole.gotoAndLoginAdmin(page);
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });
  await page.evaluate(() => {
    const now = Date.now();
    localStorage.setItem('clawnsole.admin.agentLastSeenAtMs', JSON.stringify({
      'healthy-agent': now - 12_000,
      'stale-agent': now - 70 * 60 * 1000
    }));
  });
  await page.getByRole('button', { name: 'Refresh agent list' }).click();

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const healthyRow = page.locator('#agentsList .agents-row').filter({ hasText: 'healthy-agent' });
  await expect(healthyRow.locator('.agents-health-state-chip')).toHaveText('Healthy');
  await expect(healthyRow.locator('.agents-health-state-chip')).toHaveAttribute('data-health-state', 'active');
  await expect(healthyRow.locator('.agents-age-chip')).toHaveText(/\d+s/);

  const staleRow = page.locator('#agentsList .agents-row').filter({ hasText: 'stale-agent' });
  await expect(staleRow.locator('.agents-health-state-chip')).toHaveText('Stale');
  await expect(staleRow.locator('.agents-health-state-chip')).toHaveAttribute('data-health-state', 'stale');
  await expect(staleRow.locator('.agents-age-chip')).toHaveText(/\d+h/);

  const offlineRow = page.locator('#agentsList .agents-row').filter({ hasText: 'offline-agent' });
  await expect(offlineRow.locator('.agents-health-state-chip')).toHaveText('Offline/Error');
  await expect(offlineRow.locator('.agents-health-state-chip')).toHaveAttribute('data-health-state', 'offline_error');
  await expect(offlineRow.locator('.agents-age-chip')).toHaveText('unknown');
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

test('fleet refresh preserves selected row and falls back when it disappears', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  let agents = [
    { id: 'alpha', name: 'Alpha', displayName: 'Alpha' },
    { id: 'beta', name: 'Beta', displayName: 'Beta' },
    { id: 'gamma', name: 'Gamma', displayName: 'Gamma' }
  ];
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.getByRole('button', { name: 'Refresh agent list' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();

  const beta = page.locator('#agentsList .agents-row').filter({ hasText: 'Beta (beta)' });
  await beta.click();
  await expect(beta).toHaveAttribute('aria-selected', 'true');

  await page.locator('#agentsModalRefreshBtn').click();
  await expect(beta).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#agentsSortIndicator')).toHaveText('');

  agents = [
    { id: 'alpha', name: 'Alpha', displayName: 'Alpha' },
    { id: 'gamma', name: 'Gamma', displayName: 'Gamma' }
  ];
  await page.locator('#agentsModalRefreshBtn').click();
  await expect(page.locator('#agentsList .agents-row').filter({ hasText: 'Gamma (gamma)' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#agentsSortIndicator')).toContainText('Selected agent no longer in current filter');
});

test('fleet refresh keeps scroll anchor and keyboard triage selection', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  const agents = Array.from({ length: 36 }, (_, index) => {
    const id = `agent-${String(index + 1).padStart(2, '0')}`;
    return { id, name: id, displayName: id };
  });
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.getByRole('button', { name: 'Refresh agent list' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();
  await page.evaluate(() => {
    const list = document.querySelector('#agentsList');
    if (!list) return;
    list.style.maxHeight = '220px';
    list.style.overflow = 'auto';
    document.querySelector('.agents-row[data-agent-id="agent-20"]')?.scrollIntoView();
  });
  const before = await page.locator('#agentsList').evaluate((el) => el.scrollTop);
  expect(before).toBeGreaterThan(0);

  await page.locator('#agentsModalRefreshBtn').click();
  const after = await page.locator('#agentsList').evaluate((el) => el.scrollTop);
  expect(Math.abs(after - before)).toBeLessThan(24);

  const row20 = page.locator('#agentsList .agents-row[data-agent-id="agent-20"]');
  await row20.click();
  await page.keyboard.press('j');
  await expect(page.locator('#agentsList .agents-row[data-agent-id="agent-21"]')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('k');
  await expect(row20).toHaveAttribute('aria-selected', 'true');
  const workqueueCountBeforeEnter = await page.locator('[data-pane][data-pane-kind="workqueue"]').count();
  await page.keyboard.press('Enter');
  await expect.poll(async () => (
    page.locator('[data-pane][data-pane-kind="chat"] [data-pane-agent-select]')
      .evaluateAll((els) => els.map((el) => el.value))
  )).toContain('agent-20');
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(workqueueCountBeforeEnter);

  await page.locator('#agentsCloseBtn').click();
  await page.getByRole('button', { name: 'Open agents' }).click();
  await page.locator('#agentsSearch').fill('agent-20');
  const healthyShow = page.getByRole('button', { name: /Healthy \(\d+\) Show/ });
  if (await healthyShow.count()) await healthyShow.click();
  const reopenedRow20 = page.locator('#agentsList .agents-row[data-agent-id="agent-20"]');
  await expect(reopenedRow20).toBeVisible();
  await reopenedRow20.click();
  await page.keyboard.press('Shift+Enter');
  await expect.poll(async () => (
    page.locator('[data-pane][data-pane-kind="workqueue"] [data-wq-claim-agent]')
      .evaluateAll((els) => els.map((el) => el.value))
  )).toContain('agent-20');

  const search = page.locator('#agentsSearch');
  await search.fill('agent');
  const selectedAfterFilter = page.locator('#agentsList .agents-row[aria-selected="true"]').first();
  const selectedIdAfterFilter = await selectedAfterFilter.getAttribute('data-agent-id');
  expect(selectedIdAfterFilter).toBeTruthy();
  await search.focus();
  await search.press('ArrowDown');
  await expect(search).toHaveValue('agent');
  await expect(page.locator(`#agentsList .agents-row[data-agent-id="${selectedIdAfterFilter}"]`)).toHaveAttribute('aria-selected', 'true');
});

test('fleet list keeps header and identity columns visible while scrolling', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  const agents = Array.from({ length: 40 }, (_, index) => {
    const id = `agent-${String(index + 1).padStart(2, '0')}`;
    return {
      id,
      name: id,
      displayName: id,
      model: `gpt-${String(index + 1).padStart(2, '0')}`,
      host: `host-${String(index + 1).padStart(2, '0')}`
    };
  });
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.getByRole('button', { name: 'Refresh agent list' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();
  await page.locator('#agentsColumnPicker summary').click();
  await page.locator('#agentsColumn_model').check();
  await page.locator('#agentsColumn_host').check();
  await page.locator('#agentsColumnPicker').evaluate((el) => {
    el.open = false;
  });

  const list = page.locator('#agentsList');
  await list.evaluate((el) => {
    el.style.maxHeight = '240px';
  });
  await expect(page.locator('#agentsList .agents-row[data-agent-id="agent-30"]')).toBeVisible();

  const header = page.locator('#agentsList .agents-table-header');
  await list.evaluate((el) => {
    el.scrollTop = 260;
  });
  const stickyHeader = await header.evaluate((el) => {
    const headerRect = el.getBoundingClientRect();
    const listRect = el.closest('#agentsList').getBoundingClientRect();
    return {
      topDelta: Math.abs(headerRect.top - listRect.top),
      position: getComputedStyle(el).position
    };
  });
  expect(stickyHeader.position).toBe('sticky');
  expect(stickyHeader.topDelta).toBeLessThan(2);

  const row = page.locator('#agentsList .agents-row[data-agent-id="agent-30"]');
  const before = await row.evaluate((el) => ({
    identityLeft: el.querySelector('.agents-row-identity').getBoundingClientRect().left,
    detailsLeft: el.querySelector('.agents-row-meta').getBoundingClientRect().left
  }));
  await list.evaluate((el) => {
    el.scrollLeft = 260;
  });
  const after = await row.evaluate((el) => ({
    identityLeft: el.querySelector('.agents-row-identity').getBoundingClientRect().left,
    detailsLeft: el.querySelector('.agents-row-meta').getBoundingClientRect().left,
    scrollLeft: el.closest('#agentsList').scrollLeft
  }));
  expect(after.scrollLeft).toBeGreaterThan(80);
  expect(Math.abs(after.identityLeft - before.identityLeft)).toBeLessThan(2);
  expect(after.detailsLeft).toBeLessThan(before.detailsLeft - 80);

  await row.click();
  await page.keyboard.press('j');
  await expect(page.locator('#agentsList .agents-row[data-agent-id="agent-31"]')).toHaveAttribute('aria-selected', 'true');
});

test('agents modal keeps selected agent summary sticky with keyboard actions', async ({ page, clawnsole }) => {
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
    localStorage.setItem('clawnsole.admin.agentLastSeenAtMs', JSON.stringify({ alpha: now, beta: now - 70 * 60 * 1000 }));
  });
  await page.getByRole('button', { name: 'Refresh agent list' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();

  const beta = page.locator('#agentsList .agents-row[data-agent-id="beta"]');
  await beta.click();

  const bar = page.locator('#agentsSelectionBar');
  await expect(bar).toBeVisible();
  await expect(bar).toContainText('Beta (beta)');
  await expect(bar).toContainText('Stale');
  await expect(bar).toContainText('1h ago');

  const openTimeline = bar.getByRole('button', { name: 'Open Timeline' });
  await openTimeline.focus();
  await expect(openTimeline).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-pane][data-pane-kind="timeline"]')).toHaveCount(1);

  agents = [{ id: 'alpha', name: 'Alpha', displayName: 'Alpha' }];
  await page.locator('#agentsModalRefreshBtn').click();
  await expect(bar).toBeVisible();
  await expect(bar).toContainText('Alpha (alpha)');
  await expect(bar).not.toContainText('Beta (beta)');
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

test('agents modal can return to previous triage context after opening workqueue', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  const agents = [
    { id: 'alpha', name: 'Alpha', displayName: 'Alpha' },
    { id: 'beta', name: 'Beta', displayName: 'Beta' }
  ];
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.getByRole('button', { name: 'Refresh agent list' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const beta = page.locator('#agentsList .agents-row').filter({ hasText: 'Beta (beta)' });
  await beta.click();
  await expect(beta).toHaveAttribute('aria-selected', 'true');

  await beta.locator('[data-agent-action="open-workqueue"]').first().click();
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"] [data-wq-queue-select]')).toBeFocused();

  await page.keyboard.press('Control+Shift+B');
  await expect(beta).toHaveAttribute('aria-selected', 'true');
  await expect(beta.locator('[data-agent-action="open-workqueue"]').first()).toBeFocused();
  await expect(page.getByTestId('toast').last()).toContainText('Returned to triage context.');
});

test('agents modal return to triage context fails gracefully once source is closed', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  const agents = [{ id: 'alpha', name: 'Alpha', displayName: 'Alpha' }];
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.getByRole('button', { name: 'Refresh agent list' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();

  const row = page.locator('#agentsList .agents-row').filter({ hasText: 'Alpha (alpha)' });
  await row.locator('[data-agent-action="open-chat"]').first().click();
  await page.getByRole('button', { name: 'Close agents' }).click();
  await expect(page.locator('#agentsModal')).not.toHaveClass(/open/);

  await page.keyboard.press('Control+Shift+B');
  await expect(page.getByTestId('toast').last()).toContainText('Previous triage context is no longer open.');
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

test('agents modal column picker hides optional metadata and preserves row selection', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  const agents = [
    { id: 'alpha', name: 'Alpha', displayName: 'Alpha', model: 'gpt-alpha', host: 'mini-1' },
    { id: 'beta', name: 'Beta', displayName: 'Beta', model: 'gpt-beta', host: 'mini-2' }
  ];
  await page.route(/\/agents(?:\?|$)/, async (route) => {
    await route.fulfill({ json: { agents } });
  });

  await clawnsole.gotoAndLoginAdmin(page);
  await page.evaluate(() => {
    const now = Date.now();
    localStorage.setItem('clawnsole.admin.agentLastSeenAtMs', JSON.stringify({ alpha: now, beta: now }));
    localStorage.removeItem('clawnsole.admin.agents.columns');
  });
  await page.getByRole('button', { name: 'Refresh agent list' }).click();

  await page.getByRole('button', { name: 'Open agents' }).click();
  const beta = page.locator('#agentsList .agents-row').filter({ hasText: 'Beta (beta)' });
  await beta.click();
  await expect(beta).toHaveAttribute('aria-selected', 'true');

  await page.locator('#agentsColumnPicker summary').click();
  await page.locator('#agentsColumn_model').check();
  await page.locator('#agentsColumn_host').check();
  await expect(beta).toHaveAttribute('aria-selected', 'true');
  await expect(beta.locator('[data-fleet-column="model"]')).toHaveText('gpt-beta');
  await expect(beta.locator('[data-fleet-column="host"]')).toHaveText('mini-2');

  await page.locator('#agentsColumn_id').uncheck();
  await expect(beta).toHaveAttribute('aria-selected', 'true');
  await expect(beta.locator('[data-fleet-column="id"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Compact' }).click();
  await expect(beta).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#agentsList')).toHaveClass(/compact/);

  await page.reload();
  await clawnsole.waitForAdminUiReady(page);
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsColumn_model')).toBeChecked();
  await expect(page.locator('#agentsColumn_host')).toBeChecked();
  await expect(page.locator('#agentsColumn_id')).not.toBeChecked();
  await expect(page.locator('#agentsList .agents-row').filter({ hasText: 'Beta' }).locator('[data-fleet-column="model"]')).toHaveText('gpt-beta');
});
