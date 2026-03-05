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
