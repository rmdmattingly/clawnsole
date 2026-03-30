const { test, expect } = require('@playwright/test');
const { installPageFailureAssertions } = require('./helpers/pw-assertions');
const { startClawnsoleTestApp } = require('./helpers/pw-app');

let app;

async function loginAdmin(page, serverPort) {
  await page.goto(`http://127.0.0.1:${serverPort}/`);

  const loginPassword = page.locator('#loginPassword');
  const loginBtn = page.locator('#loginBtn');
  const loginOverlay = page.locator('#loginOverlay');

  await loginPassword.waitFor({ state: 'visible', timeout: 10000 });
  for (let i = 0; i < 3; i += 1) {
    await loginPassword.fill('admin');
    await loginBtn.click();
    try {
      await loginOverlay.waitFor({ state: 'hidden', timeout: 4000 });
      return;
    } catch {
      if (i === 2) throw new Error('login did not complete after retries');
    }
  }
}

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

  await loginAdmin(page, app.serverPort);

  const panes = page.locator('[data-pane]');
  await expect(panes).toHaveCount(2);

  // Mixed default layout (chat + non-chat) should use a neutral pane-grid heading.
  await expect(page.getByTestId('pane-grid')).toHaveAttribute('aria-label', 'Panes');
  await expect(page.getByTestId('pane-grid')).not.toHaveAttribute('aria-label', 'Chat panes');

  const chatPane = panes.first();
  await expect(chatPane.locator('[data-pane-input]')).toBeVisible();

  const wqPane = panes.nth(1);
  await expect(wqPane).toHaveAttribute('data-pane-kind', 'workqueue');
  await expect(wqPane.locator('.wq-pane')).toHaveCount(1);
  await expect(wqPane.locator('[data-pane-input]')).toBeHidden();
});

test('layout: reset layout restores default (Chat + Workqueue)', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!app?.skipReason, app?.skipReason);

  installPageFailureAssertions(page, { appOrigin: `http://127.0.0.1:${app.serverPort}` });

  await loginAdmin(page, app.serverPort);

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
