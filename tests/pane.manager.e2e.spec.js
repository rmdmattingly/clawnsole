const { test, expect } = require('@playwright/test');
const { installPageFailureAssertions } = require('./helpers/pw-assertions');
const { startClawnsoleTestApp } = require('./helpers/pw-app');

let app;

async function openPaneManager(page) {
  const modal = page.locator('#paneManagerModal');
  await page.keyboard.press('Control+P');
  if ((await modal.getAttribute('aria-hidden')) !== 'false') {
    await page.keyboard.press('Meta+P');
  }
  if ((await modal.getAttribute('aria-hidden')) !== 'false') {
    await page.click('#paneManagerBtn');
  }
  await expect(modal).toHaveAttribute('aria-hidden', 'false');
}

test.beforeAll(async () => {
  app = await startClawnsoleTestApp();
});

test.afterAll(() => {
  app?.stop?.();
});

test('pane manager: lists panes + focuses via keyboard', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });
  await expect(page.locator('#loginOverlay')).toHaveAttribute('aria-hidden', 'true');

  const modal = page.locator('#paneManagerModal');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');

  // Keyboard shortcut should open pane manager (with click fallback for platform variance).
  await openPaneManager(page);

  const rows = page.locator('.pane-manager-row');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0).locator('.pane-manager-letter')).toHaveText('A');
  await expect(rows.nth(1).locator('.pane-manager-letter')).toHaveText('B');

  // Focus the 2nd pane (default Workqueue) using arrow keys + Enter.
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');

  const panes = page.locator('[data-pane]');
  await expect(panes).toHaveCount(2);

  // Active element should be inside the 2nd pane.
  const focusedPaneIndex = await page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]'));
    const active = document.activeElement;
    return panes.findIndex((p) => p === active || (active && p.contains(active)));
  });
  expect(focusedPaneIndex).toBe(1);
});

test('pane header: target label matches pane kind (agent vs queue vs jobs vs timeline)', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const chatPane = page.locator('[data-pane][data-pane-kind="chat"]').first();
  const wqPane = page.locator('[data-pane][data-pane-kind="workqueue"]').first();

  await expect(chatPane).toHaveAttribute('data-pane-accent-kind', 'chat');
  await expect(wqPane).toHaveAttribute('data-pane-accent-kind', 'workqueue');
  await expect(chatPane.getByTestId('pane-type-pill')).toHaveClass(/pane-type-chat/);
  await expect(chatPane.getByTestId('pane-type-pill')).toContainText('CHAT');
  await expect(chatPane.locator('[data-pane-type-icon]')).toHaveText('💬');
  await expect(chatPane.getByTestId('pane-type-pill')).toHaveAttribute('title', /A Chat · /);
  await expect(wqPane.getByTestId('pane-type-pill')).toHaveClass(/pane-type-workqueue/);
  await expect(wqPane.getByTestId('pane-type-pill')).toContainText('WORKQUEUE');
  await expect(wqPane.locator('[data-pane-type-icon]')).toHaveText('WQ');
  await expect(wqPane.getByTestId('pane-type-pill')).toHaveAttribute('title', /B Workqueue · /);

  await expect(chatPane.getByTestId('pane-target-label')).toHaveText('Agent');
  await expect(chatPane.getByTestId('pane-agent-button')).toHaveAttribute('aria-label', /change agent \(current:/i);

  await expect(wqPane.getByTestId('pane-target-label')).toHaveText('Queue');
  await expect(wqPane.getByTestId('pane-agent-button')).toHaveAttribute('aria-label', /change queue \(current:/i);
  await expect(wqPane.getByTestId('pane-agent-button')).not.toHaveAttribute('aria-label', /change agent/i);

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-cron').click();

  const cronPane = page.locator('[data-pane][data-pane-kind="cron"]').last();
  await expect(cronPane.getByTestId('pane-target-label')).toHaveText('Jobs');
  await expect(cronPane).toHaveAttribute('data-pane-accent-kind', 'cron');
  await expect(cronPane.getByTestId('pane-type-pill')).toHaveClass(/pane-type-cron/);
  await expect(cronPane.getByTestId('pane-type-pill')).toContainText('CRON');
  await expect(cronPane.locator('[data-pane-type-icon]')).toHaveText('⏱');
  await expect(cronPane.getByTestId('pane-type-pill')).toHaveAttribute('title', /C Cron · /);

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-timeline').click();

  const timelinePane = page.locator('[data-pane][data-pane-kind="timeline"]').last();
  await expect(timelinePane.getByTestId('pane-target-label')).toHaveText('Timeline');
  await expect(timelinePane).toHaveAttribute('data-pane-accent-kind', 'timeline');
  await expect(timelinePane.getByTestId('pane-type-pill')).toHaveClass(/pane-type-timeline/);
  await expect(timelinePane.getByTestId('pane-type-pill')).toContainText('TIMELINE');
  await expect(timelinePane.locator('[data-pane-type-icon]')).toHaveText('🕒');
  await expect(timelinePane.getByTestId('pane-type-pill')).toHaveAttribute('title', /D Timeline · /);

  await openPaneManager(page);
  await expect(page.locator('.pane-manager-row[data-pane-accent-kind="chat"]')).toHaveCount(1);
  await expect(page.locator('.pane-manager-row[data-pane-accent-kind="workqueue"]')).toHaveCount(1);
  await expect(page.locator('.pane-manager-row[data-pane-accent-kind="cron"]')).toHaveCount(1);
  await expect(page.locator('.pane-manager-row[data-pane-accent-kind="timeline"]')).toHaveCount(1);
});

test('add pane menu: reuses existing non-chat panes unless "open anyway" is chosen', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const workqueuePanes = page.locator('[data-pane][data-pane-kind="workqueue"]');
  await expect(workqueuePanes).toHaveCount(1);

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-workqueue').click();
  await expect(workqueuePanes).toHaveCount(1);

  await page.getByTestId('add-pane-btn').click();
  await expect(page.getByTestId('pane-add-menu-workqueue-open-anyway')).toBeVisible();
  await page.getByTestId('pane-add-menu-workqueue-open-anyway').click();
  await expect(workqueuePanes).toHaveCount(2);
});

test('pane manager: status parity with pane headers across transitions', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-cron').click();
  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-timeline').click();

  await openPaneManager(page);

  const assertStatusParity = async () => {
    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const normalize = (value) => {
            const s = String(value || '').trim().toLowerCase();
            if (s === 'connecting') return 'reconnecting';
            return s;
          };

          const paneStatuses = Array.from(document.querySelectorAll('[data-pane]')).map((pane) =>
            normalize(pane.querySelector('[data-pane-status]')?.textContent || '')
          );

          const mismatches = [];
          document.querySelectorAll('.pane-manager-row').forEach((row, idx) => {
            const key = String(row.getAttribute('data-pane-key') || '');
            const manager = normalize(row.querySelector('.pane-manager-state')?.textContent || '');
            const header = normalize(paneStatuses[idx] || '');
            if (manager !== header) mismatches.push({ key, manager, header, idx });
          });

          return mismatches;
        });
      }, { timeout: 10000 })
      .toEqual([]);
  };

  await assertStatusParity();

  // Keep Pane Manager open while panes continue their background connect flow.
  // Statuses may transition, but header and manager row should stay in lock-step.
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const normalize = (value) => {
          const s = String(value || '').trim().toLowerCase();
          if (s === 'connecting') return 'reconnecting';
          return s;
        };
        const paneStatuses = Array.from(document.querySelectorAll('[data-pane]')).map((pane) =>
          normalize(pane.querySelector('[data-pane-status]')?.textContent || '')
        );
        const mismatches = [];
        document.querySelectorAll('.pane-manager-row').forEach((row, idx) => {
          const manager = normalize(row.querySelector('.pane-manager-state')?.textContent || '');
          const header = normalize(paneStatuses[idx] || '');
          if (manager !== header) mismatches.push({ idx, manager, header });
        });
        return mismatches;
      });
    }, { timeout: 20000 })
    .toEqual([]);
});

test('pane manager: supports reordering panes', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.getByTestId('add-pane-btn').click();
  await page.getByTestId('pane-add-menu-chat').click();

  const modal = page.locator('#paneManagerModal');
  await openPaneManager(page);

  const rows = page.locator('.pane-manager-row');
  await expect(rows).toHaveCount(3);
  const firstRowMoveUp = rows.nth(0).getByTestId('pane-manager-move-up');
  const secondRowMoveDown = rows.nth(1).getByTestId('pane-manager-move-down');

  await expect(firstRowMoveUp).toBeDisabled();

  const rowKeys = async () => {
    return page.locator('.pane-manager-row').evaluateAll((rows) => rows.map((row) => row.dataset.paneKey));
  };

  const before = await rowKeys();
  expect(before.length).toBe(3);

  await rows.nth(1).evaluate((row) => {
    const moveDown = row.querySelector('[data-action="move-down"]');
    moveDown?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  const after = await rowKeys();
  expect(after).toEqual([before[0], before[2], before[1]]);

  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');

  await openPaneManager(page);

  const persisted = await rowKeys();
  expect(persisted).toEqual(after);
});

test('pane manager: paired action focuses existing counterpart and opens missing counterpart', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const paneKinds = () => page.locator('[data-pane]').evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-pane-kind')));

  // Existing counterpart path (default Chat + Workqueue).
  await openPaneManager(page);
  const chatRow = page.locator('.pane-manager-row[data-pane-accent-kind="chat"]').first();
  const chatPaired = chatRow.locator('[data-action="paired"]');
  await expect(chatPaired).toBeVisible();
  await chatPaired.click();
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);

  const focusedKind = await page.evaluate(() => {
    const panes = Array.from(document.querySelectorAll('[data-pane]'));
    const active = document.activeElement;
    const focused = panes.find((p) => p === active || (active && p.contains(active)));
    return focused?.getAttribute('data-pane-kind') || '';
  });
  expect(focusedKind).toBe('workqueue');

  // Missing counterpart path: close workqueue, then use paired from chat row.
  await openPaneManager(page);
  const wqRow = page.locator('.pane-manager-row[data-pane-accent-kind="workqueue"]').first();
  await wqRow.locator('[data-action="close"]').click();
  await expect(page.locator('.pane-manager-row[data-pane-accent-kind="workqueue"]')).toHaveCount(0);
  await expect(page.locator('.pane-manager-row[data-pane-accent-kind="chat"]')).toHaveCount(1);

  const beforeKinds = await paneKinds();
  expect(beforeKinds.filter((k) => k === 'workqueue').length).toBe(0);

  await page.locator('.pane-manager-row[data-pane-accent-kind="chat"]').first().locator('[data-action="paired"]').click();
  await expect(page.locator('[data-pane][data-pane-kind="workqueue"]')).toHaveCount(1);

  const afterKinds = await paneKinds();
  expect(afterKinds.filter((k) => k === 'workqueue').length).toBe(1);
});
