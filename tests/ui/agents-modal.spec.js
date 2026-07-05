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

test('fleet copy agent id action supports keyboard and button flows', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.__clawnsoleCopiedText = String(text || '');
        },
        readText: async () => window.__clawnsoleCopiedText || ''
      }
    });
  });

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const firstRow = page.locator('#agentsList .agents-row').first();
  await expect(firstRow).toBeVisible();
  const firstAgentId = (await firstRow.getAttribute('data-agent-id')) || 'main';

  await expect(firstRow.locator('[data-agent-action="copy-agent-id"]').first()).toBeVisible();
  await firstRow.focus();
  await page.keyboard.press('y');
  await expect(page.getByTestId('toast').last()).toContainText(`Copied agent id: ${firstAgentId}`);
  await expect(firstRow).toBeFocused();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(firstAgentId);

  await firstRow.locator('[data-agent-action="copy-agent-id"]').first().click();
  await expect(page.getByTestId('toast').last()).toContainText(`Copied agent id: ${firstAgentId}`);
  await expect(firstRow).toBeFocused();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(firstAgentId);
});
