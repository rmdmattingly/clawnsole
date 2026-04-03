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
  await page.waitForSelector('[data-pane] [data-pane-input]', { timeout: 90000 });

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const firstPinAfter = page.locator('#agentsList .agents-pin').first();
  await expect(firstPinAfter).toHaveAttribute('aria-pressed', 'true');
});

test('agents modal search filter reduces list and Escape clears it', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const rows = page.locator('#agentsList .agents-row');
  const before = await rows.count();
  expect(before).toBeGreaterThan(0);

  const search = page.locator('#agentsSearch');
  await search.fill('zzzz-no-match');
  await expect(rows).toHaveCount(0);
  await expect(page.locator('#agentsEmpty')).toBeVisible();

  await search.press('Escape');
  await expect(search).toHaveValue('');
  await expect(rows).toHaveCount(before);
  await expect(page.locator('#agentsEmpty')).toBeHidden();
});

test('agents modal triage controls persist filter/query/sort and support reset', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const attentionBtn = page.getByRole('button', { name: 'Needs attention' });
  await attentionBtn.focus();
  await page.keyboard.press('Space');
  await expect(attentionBtn).toHaveAttribute('aria-pressed', 'true');

  const sort = page.locator('#agentsSortMode');
  await expect(sort).toHaveValue('attention');
  await sort.selectOption('oldest');
  await expect(sort).toHaveValue('oldest');

  const search = page.locator('#agentsSearch');
  await search.fill('main');
  await expect(search).toHaveValue('main');

  // Close/reopen should preserve triage filter + query + sort.
  await page.getByRole('button', { name: 'Close agents' }).click();
  await expect(page.locator('#agentsModal')).not.toHaveClass(/open/);
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsSearch')).toHaveValue('main');
  await expect(page.locator('#agentsSortMode')).toHaveValue('oldest');
  await expect(page.getByRole('button', { name: 'Needs attention' })).toHaveAttribute('aria-pressed', 'true');

  // Reload should also preserve triage filter + query + sort.
  await page.reload();
  await page.waitForSelector('[data-pane] [data-pane-input]', { timeout: 90000 });
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsSearch')).toHaveValue('main');
  await expect(page.locator('#agentsSortMode')).toHaveValue('oldest');
  await expect(page.getByRole('button', { name: 'Needs attention' })).toHaveAttribute('aria-pressed', 'true');

  // Reset action clears persisted filter/query/sort.
  await page.getByRole('button', { name: 'Reset agents triage view' }).click();
  await expect(page.locator('#agentsSearch')).toHaveValue('');
  await expect(page.locator('#agentsSortMode')).toHaveValue('attention');
  await expect(page.getByRole('button', { name: 'All agents' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Close agents' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsSearch')).toHaveValue('');
  await expect(page.locator('#agentsSortMode')).toHaveValue('attention');
  await expect(page.getByRole('button', { name: 'All agents' })).toHaveAttribute('aria-pressed', 'true');
});

test('agents modal shows explicit health + heartbeat chips on rows', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const firstRow = page.locator('#agentsList .agents-row').first();
  await expect(firstRow.locator('.agents-health-chip')).toBeVisible();
  await expect(firstRow.locator('.agents-health-chip')).toContainText('health:');
  await expect(firstRow.locator('.agents-age-chip')).toBeVisible();
  await expect(firstRow.locator('.agents-age-chip')).toContainText('heartbeat:');
});

test('fleet density + column visibility persist and reset', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);
  await page.getByRole('button', { name: 'Open agents' }).click();

  const density = page.locator('#agentsDensityMode');
  await density.selectOption('compact');
  await expect(density).toHaveValue('compact');

  await page.locator('#agentsColReason').uncheck();
  const firstRow = page.locator('#agentsList .agents-row').first();
  await expect(firstRow.locator('.agents-row-reason')).toBeHidden();

  await page.getByRole('button', { name: 'Close agents' }).click();
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsDensityMode')).toHaveValue('compact');
  await expect(page.locator('#agentsColReason')).not.toBeChecked();

  await page.getByRole('button', { name: 'Reset agents triage view' }).click();
  await expect(page.locator('#agentsDensityMode')).toHaveValue('cozy');
  await expect(page.locator('#agentsColReason')).toBeChecked();
});

test('agents modal keyboard triage loop: j/k select, Enter open, Shift+Enter workqueue, dot timeline', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const selectedRow = page.locator('#agentsList .agents-row[aria-selected="true"]').first();
  await expect(selectedRow).toBeVisible();
  const selectedAgentId = (await selectedRow.getAttribute('data-agent-id')) || 'main';

  // j/k should keep a concrete selection in the fleet list.
  await page.keyboard.press('j');
  await expect(page.locator('#agentsList .agents-row[aria-selected="true"]').first()).toBeVisible();
  await page.keyboard.press('k');
  await expect(page.locator('#agentsList .agents-row[aria-selected="true"]').first()).toBeVisible();

  // Shift+Enter opens/focuses a workqueue pane scoped to the selected agent.
  await page.keyboard.press('Shift+Enter');
  await expect(page.locator('#agentsModal')).not.toHaveClass(/open/);
  const triageWqPane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();
  await expect(triageWqPane).toBeVisible();
  await expect(triageWqPane.locator('[data-pane-agent-select]')).toHaveValue(selectedAgentId);

  // Dot opens timeline pane and closes agents modal.
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);
  await page.keyboard.press('.');
  await expect(page.locator('#agentsModal')).not.toHaveClass(/open/);
  await expect(page.locator('[data-pane][data-pane-kind="timeline"]')).toHaveCount(1);

  // Enter opens selected agent chat and closes agents modal.
  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);
  await page.keyboard.press('Enter');
  await expect(page.locator('#agentsModal')).not.toHaveClass(/open/);
});
