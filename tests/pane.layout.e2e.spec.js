const { test, expect } = require('@playwright/test');
const { installPageFailureAssertions } = require('./helpers/pw-assertions');
const { startClawnsoleTestApp } = require('./helpers/pw-app');

let app;

test.beforeAll(async () => {
  app = await startClawnsoleTestApp();
});

test.afterAll(() => {
  app?.stop?.();
});

test('layout: default admin layout is 2 panes (Chat + Workqueue)', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const panes = page.locator('[data-pane]');
  await expect(panes).toHaveCount(2);

  const chatPane = panes.first();
  await expect(chatPane.locator('[data-pane-input]')).toBeVisible();

  const wqPane = panes.nth(1);
  await expect(wqPane).toHaveAttribute('data-pane-kind', 'workqueue');
  await expect(wqPane.locator('.wq-pane')).toHaveCount(1);
  await expect(wqPane.locator('[data-pane-input]')).toBeHidden();

  // Regression guard: pane header pill should reflect Workqueue (not Chat).
  await expect(wqPane.locator('[data-pane-type-text]')).toHaveText('WORKQUEUE');
  await expect(wqPane.locator('[data-pane-type-text]')).not.toHaveText('CHAT');
});

test('layout: reset layout restores default (Chat + Workqueue)', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  // Add a third pane so we can prove reset clears the saved layout.
  await page.getByRole('button', { name: 'Add pane' }).click();
  await page.getByRole('button', { name: 'Cron pane' }).click();
  await expect(page.locator('[data-pane]')).toHaveCount(3);

  // Open settings + reset.
  await page.getByRole('button', { name: 'Open settings' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.click('#resetLayoutBtn');

  const panes = page.locator('[data-pane]');
  await expect(panes).toHaveCount(2);
  await expect(panes.nth(1)).toHaveAttribute('data-pane-kind', 'workqueue');
});

test('layout: chip shows mode, restores recommended preset, and reverts', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  const chip = page.getByTestId('layout-mode-chip');
  const revert = page.getByTestId('layout-revert-btn');
  await expect(chip).toBeVisible();
  await expect(chip).toHaveText('Chat+Workqueue');
  await expect(chip).toHaveAttribute('data-layout-mode', 'recommended');
  await expect(revert).toBeHidden();

  await page.getByRole('button', { name: 'Add pane' }).click();
  await page.getByRole('button', { name: 'Cron pane' }).click();
  await expect(page.locator('[data-pane]')).toHaveCount(3);
  await expect(chip).toHaveText('Custom');
  await expect(chip).toHaveAttribute('data-layout-mode', 'custom');

  await chip.click();
  const panes = page.locator('[data-pane]');
  await expect(panes).toHaveCount(2);
  await expect(panes.first()).toHaveAttribute('data-pane-kind', 'chat');
  await expect(panes.nth(1)).toHaveAttribute('data-pane-kind', 'workqueue');
  await expect(chip).toHaveText('Chat+Workqueue');
  await expect(revert).toBeVisible();

  await revert.click();
  await expect(page.locator('[data-pane]')).toHaveCount(3);
  await expect(page.locator('[data-pane]').nth(2)).toHaveAttribute('data-pane-kind', 'cron');
  await expect(chip).toHaveText('Custom');
  await expect(revert).toBeHidden();
});
