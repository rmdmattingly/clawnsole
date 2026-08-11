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

test('pane header: type token stays visible while target truncates', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await page.setViewportSize({ width: 720, height: 720 });
  await loginAdmin(page, env.serverPort);

  await addPane(page, 'Cron pane');
  await addPane(page, 'Timeline pane');

  await page.locator('[data-pane-name]').evaluateAll((nodes) => {
    for (const node of nodes) node.style.maxWidth = '140px';
  });

  const expectedTokens = ['A Chat', 'B Workqueue', 'C Cron', 'D Timeline'];

  for (let i = 0; i < expectedTokens.length; i += 1) {
    const header = page.locator('[data-pane-name]').nth(i);
    const token = header.getByTestId('pane-name-token');
    const target = header.getByTestId('pane-name-target');

    await expect(token).toHaveText(expectedTokens[i]);
    await expect(header).toHaveAttribute('title', new RegExp(`^${expectedTokens[i]} · .+`));

    const metrics = await header.evaluate((node) => {
      const tokenEl = node.querySelector('[data-pane-name-token]');
      const targetEl = node.querySelector('[data-pane-name-target]');
      const tokenBox = tokenEl.getBoundingClientRect();
      const targetBox = targetEl.getBoundingClientRect();
      return {
        tokenWidth: tokenBox.width,
        targetClientWidth: targetEl.clientWidth,
        targetScrollWidth: targetEl.scrollWidth,
        tokenRight: tokenBox.right,
        headerRight: node.getBoundingClientRect().right,
        targetLeft: targetBox.left
      };
    });

    expect(metrics.tokenWidth).toBeGreaterThan(0);
    expect(metrics.tokenRight).toBeLessThanOrEqual(metrics.headerRight + 0.5);
    expect(metrics.targetLeft).toBeGreaterThanOrEqual(metrics.tokenRight - 0.5);
    expect(metrics.targetScrollWidth).toBeGreaterThanOrEqual(metrics.targetClientWidth);
  }
});
