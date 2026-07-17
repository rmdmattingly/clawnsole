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
  if (page.__consoleAsserts) page.__consoleAsserts.assertNoErrors();
});

test('pane accents: each pane kind exposes deterministic accent selectors', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  // Default layout includes chat + workqueue; add the remaining kinds.
  await addPane(page, 'Cron pane');
  await addPane(page, 'Timeline pane');

  for (const kind of ['chat', 'workqueue', 'cron', 'timeline']) {
    await expect(page.locator(`[data-pane][data-pane-kind="${kind}"][data-pane-accent-kind="${kind}"]`)).toHaveCount(1);
    await expect(page.locator(`[data-pane][data-pane-kind="${kind}"] [data-pane-type-pill][data-pane-accent="${kind}"]`)).toHaveCount(1);
  }

  await page.locator('#paneManagerBtn').click();
  await expect(page.locator('#paneManagerModal')).toHaveClass(/open/);

  for (const kind of ['chat', 'workqueue', 'cron', 'timeline']) {
    const badge = page.locator(`.pane-manager-row[data-pane-kind="${kind}"] [data-pane-type-badge][data-pane-accent="${kind}"]`);
    await expect(badge).toHaveCount(1);
    await expect(badge.locator('.pane-type-text')).toHaveText(paneLabelForKind(kind));
  }
});

test('pane tab identity keeps fixed type token before truncated title', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await page.setViewportSize({ width: 760, height: 720 });
  await loginAdmin(page, env.serverPort);

  // Default layout includes chat + workqueue; add the remaining kinds.
  await addPane(page, 'Cron pane');
  await addPane(page, 'Timeline pane');

  const expectedTokens = {
    chat: '💬',
    workqueue: 'WQ',
    cron: '⏰',
    timeline: '🕒'
  };

  for (const [kind, token] of Object.entries(expectedTokens)) {
    const pane = page.locator(`[data-pane][data-pane-kind="${kind}"]`).first();
    const name = pane.getByTestId('pane-type-label');
    const tokenEl = name.locator('[data-pane-tab-token]');
    const titleEl = name.locator('[data-pane-tab-title]');

    await expect(tokenEl).toHaveAttribute('data-pane-token', token);
    await expect(name).toHaveAttribute('title', new RegExp(`^[A-D] ${paneLabelForKind(kind)} · .+`));

    const metrics = await name.evaluate((el) => {
      el.style.width = '78px';
      el.style.flex = '0 0 78px';
      const tokenNode = el.querySelector('[data-pane-tab-token]');
      const titleNode = el.querySelector('[data-pane-tab-title]');
      const tokenRect = tokenNode.getBoundingClientRect();
      const titleRect = titleNode.getBoundingClientRect();
      return {
        tokenWidth: tokenRect.width,
        tokenLeft: tokenRect.left,
        tokenRight: tokenRect.right,
        titleLeft: titleRect.left,
        titleClientWidth: titleNode.clientWidth,
        titleScrollWidth: titleNode.scrollWidth
      };
    });

    expect(metrics.tokenWidth).toBeGreaterThan(20);
    expect(metrics.titleLeft).toBeGreaterThanOrEqual(metrics.tokenRight);
    expect(metrics.titleScrollWidth).toBeGreaterThan(metrics.titleClientWidth);
  }
});

function paneLabelForKind(kind) {
  if (kind === 'workqueue') return 'Workqueue';
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}
