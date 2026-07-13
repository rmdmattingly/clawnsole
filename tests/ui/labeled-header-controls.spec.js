const { test, expect } = require('./fixtures');

test('settings: labeled header controls toggle persists and collapses on narrow viewports', async ({ page, clawnsole }) => {
  if (clawnsole.skipReason) test.skip(clawnsole.skipReason);

  await page.setViewportSize({ width: 1280, height: 800 });
  await clawnsole.gotoAndLoginAdmin(page);

  const refreshLabel = page.locator('#refreshAgentsBtn .btn-label');
  await expect(refreshLabel).not.toBeVisible();
  await expect(page.locator('html')).not.toHaveClass(/labeled-header-controls/);

  await page.getByRole('button', { name: 'Open settings' }).click();
  const toggle = page.locator('#labeledHeaderControls');
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await expect(page.locator('html')).toHaveClass(/labeled-header-controls/);
  await expect(refreshLabel).toBeVisible();
  await expect(page.locator('#settingsBtn .btn-label')).toBeVisible();

  await page.reload();
  await page.waitForSelector('[data-pane] [data-pane-input]', { timeout: 90000 });
  await expect(page.locator('html')).toHaveClass(/labeled-header-controls/);
  await expect(page.locator('#refreshAgentsBtn .btn-label')).toBeVisible();

  await page.setViewportSize({ width: 900, height: 800 });
  await expect(page.locator('html')).toHaveClass(/labeled-header-controls/);
  await expect(page.locator('#refreshAgentsBtn .btn-label')).not.toBeVisible();
  await expect(page.locator('#refreshAgentsBtn')).toHaveAttribute('aria-label', 'Refresh agent list');
});
