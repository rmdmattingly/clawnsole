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

test('pane: cron admin golden path (toggle/run/edit/delete)', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  const guards = installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });
  const dialogs = [];
  page.on('dialog', async (dialog) => {
    dialogs.push({ type: dialog.type(), message: dialog.message() });
    if (dialog.type() === 'prompt') {
      await dialog.accept('{"name":"Nightly report (edited)","enabled":true}');
      return;
    }
    await dialog.accept();
  });

  await page.goto(`http://127.0.0.1:${app.serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await expect(page.getByTestId('add-pane-btn')).toBeVisible();
  await page.getByTestId('add-pane-btn').click();
  await page.getByRole('button', { name: 'Cron pane' }).click();

  const panes = page.locator('[data-pane]');
  const cronPane = panes.last();

  await expect(cronPane.locator('.cron-pane')).toHaveCount(1);
  await expect(cronPane.getByTestId('cron-body')).toBeVisible();
  await expect(cronPane.getByTestId('cron-job-title').filter({ hasText: 'Nightly report' })).toBeVisible({ timeout: 20000 });
  await expect(cronPane.getByTestId('cron-job-title').filter({ hasText: 'PR sweep' })).toBeVisible();

  // Toggle enabled -> disabled for job-1.
  const job1 = cronPane.locator('[data-cron-job-card][data-job-id="job-1"]');
  await expect(job1.locator('.pill--ok', { hasText: 'enabled' })).toBeVisible();
  await job1.getByTestId('cron-action-toggle').click();
  await expect(job1.locator('.pill--warn', { hasText: 'disabled' })).toBeVisible();
  await expect(job1.getByTestId('cron-action-toggle')).toHaveText('Enable');

  // Run success path for job-1 should complete with no dialog errors.
  const dialogsBeforeSuccessRun = dialogs.length;
  await job1.getByTestId('cron-action-run').click();
  await expect
    .poll(() => dialogs.length)
    .toBe(dialogsBeforeSuccessRun);

  // Run failure path for job-2 should surface deterministic alert from mock gateway.
  const job2 = cronPane.locator('[data-cron-job-card][data-job-id="job-2"]');
  const dialogsBeforeFailedRun = dialogs.length;
  await job2.getByTestId('cron-action-run').click();
  await expect
    .poll(() => dialogs.length)
    .toBe(dialogsBeforeFailedRun + 1);
  expect(dialogs.at(-1)?.message || '').toContain('cron.run failed (mock: job-2)');

  // Edit job-1 via prompt patch and verify render updates.
  await job1.getByTestId('cron-action-edit').click();
  await expect(cronPane.locator('.cron-job__title', { hasText: 'Nightly report (edited)' })).toBeVisible();

  // Delete job-2 and verify removal.
  await job2.getByTestId('cron-action-delete').click();
  await expect(cronPane.locator('[data-cron-job-card][data-job-id="job-2"]')).toHaveCount(0);

  await guards.assertNoFailures();
});
