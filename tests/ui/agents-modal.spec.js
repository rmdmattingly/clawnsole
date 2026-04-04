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

test('agents modal quick actions open/reuse chat, timeline, and workqueue context', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const firstRow = page.locator('#agentsList .agents-row').first();
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

test('agents modal keeps sticky toolbar + frozen identity columns when horizontally scrolled', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.setViewportSize({ width: 900, height: 760 });
  await clawnsole.gotoAndLoginAdmin(page);

  await page.getByRole('button', { name: 'Open agents' }).click();
  await expect(page.locator('#agentsModal')).toHaveClass(/open/);

  const body = page.locator('#agentsModal .modal-body');
  const toolbar = page.locator('#agentsModal .agents-toolbar');
  const row = page.locator('#agentsList .agents-row').first();
  const pin = row.locator('.agents-pin');
  const identity = row.locator('.agents-row-main');

  await expect(row).toBeVisible();
  await expect(pin).toBeVisible();
  await expect(identity).toBeVisible();

  await expect(toolbar).toHaveCSS('position', 'sticky');
  await expect(pin).toHaveCSS('position', 'sticky');
  await expect(identity).toHaveCSS('position', 'sticky');

  const before = {
    pin: await pin.boundingBox(),
    identity: await identity.boundingBox(),
  };

  await body.evaluate((el) => {
    el.scrollLeft = 260;
  });

  const after = {
    pin: await pin.boundingBox(),
    identity: await identity.boundingBox(),
  };

  expect(before.pin && after.pin).toBeTruthy();
  expect(before.identity && after.identity).toBeTruthy();

  // Sticky/frozen columns should not drift significantly with horizontal scroll.
  expect(Math.abs((after.pin?.x || 0) - (before.pin?.x || 0))).toBeLessThan(4);
  expect(Math.abs((after.identity?.x || 0) - (before.identity?.x || 0))).toBeLessThan(4);
});
