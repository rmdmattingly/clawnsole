const { test, expect } = require('@playwright/test');

const { startTestEnv, loginAdmin, attachConsoleErrorAsserts } = require('./_helpers');

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

const MODALS = [
  '#commandPaletteModal',
  '#shortcutsModal',
  '#paneManagerModal',
  '#workqueueModal',
  '#agentsModal',
  '#settingsModal'
];

async function expectOnlyOpenModal(page, selector) {
  await expect(page.locator(selector)).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator(selector)).not.toHaveAttribute('inert', '');
  await expect(page.getByRole('dialog')).toHaveCount(1);

  for (const modalSelector of MODALS) {
    if (modalSelector === selector) continue;
    await expect(page.locator(modalSelector)).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator(modalSelector)).toHaveAttribute('inert', '');
  }
}

async function expectNoOpenModals(page) {
  await expect(page.getByRole('dialog')).toHaveCount(0);
  for (const selector of MODALS) {
    await expect(page.locator(selector)).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator(selector)).toHaveAttribute('inert', '');
  }
}

test('admin modal dialogs expose only the active overlay and keep closed overlays inert', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);
  await loginAdmin(page, env.serverPort);

  await expectNoOpenModals(page);

  await page.keyboard.press('ControlOrMeta+K');
  await expectOnlyOpenModal(page, '#commandPaletteModal');
  await page.keyboard.press('Escape');
  await expectNoOpenModals(page);

  await page.locator('#shortcutsBtn').click();
  await expectOnlyOpenModal(page, '#shortcutsModal');
  await page.keyboard.press('Escape');
  await expectNoOpenModals(page);

  await page.locator('#paneManagerBtn').click();
  await expectOnlyOpenModal(page, '#paneManagerModal');
  await page.keyboard.press('Escape');
  await expectNoOpenModals(page);

  await page.evaluate(() => openWorkqueue());
  await expectOnlyOpenModal(page, '#workqueueModal');
  await page.keyboard.press('Escape');
  await expectNoOpenModals(page);

  await page.locator('#agentsBtn').click();
  await expectOnlyOpenModal(page, '#agentsModal');
  await page.keyboard.press('Escape');
  await expectNoOpenModals(page);

  await page.locator('#settingsBtn').click();
  await expectOnlyOpenModal(page, '#settingsModal');
  await page.keyboard.press('Escape');
  await expectNoOpenModals(page);
});
