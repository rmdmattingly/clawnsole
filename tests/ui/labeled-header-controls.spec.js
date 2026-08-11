const { test, expect } = require('./fixtures');

test('settings: labeled header controls toggle persists and collapses on narrow viewports', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.setViewportSize({ width: 1280, height: 800 });
  await clawnsole.gotoAndLoginAdmin(page);

  const refreshLabel = page.locator('#refreshAgentsBtn .btn-label');
  await expect(refreshLabel).toBeVisible();
  await expect(page.locator('body')).not.toHaveClass(/header-labels-off/);

  await page.getByRole('button', { name: 'Open settings' }).click();
  const toggle = page.locator('#headerLabeledControlsEnabled');
  await expect(toggle).toBeChecked();
  await toggle.uncheck();
  await expect(page.locator('body')).toHaveClass(/header-labels-off/);
  await expect(refreshLabel).not.toBeVisible();
  await expect(page.locator('#settingsBtn .btn-label')).not.toBeVisible();

  await page.reload();
  await page.waitForSelector('[data-pane] [data-pane-input]', { timeout: 90000 });
  await expect(page.locator('body')).toHaveClass(/header-labels-off/);
  await expect(page.locator('#refreshAgentsBtn .btn-label')).not.toBeVisible();

  await page.setViewportSize({ width: 900, height: 800 });
  await expect(page.locator('body')).toHaveClass(/header-labels-off/);
  await expect(page.locator('#refreshAgentsBtn .btn-label')).not.toBeVisible();
  await expect(page.locator('#refreshAgentsBtn')).toHaveAttribute('aria-label', 'Refresh agent list');
});
