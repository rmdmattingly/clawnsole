const { test, expect } = require('./fixtures');

const ADMIN_MODAL_IDS = [
  'settingsModal',
  'shortcutsModal',
  'commandPaletteModal',
  'paneManagerModal',
  'workqueueModal',
  'agentsModal'
];

async function modalA11ySnapshot(page) {
  return page.evaluate((ids) => {
    const focusSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const roots = ids.map((id) => {
      const modal = document.getElementById(id);
      if (!modal) return { id, missing: true };
      const hidden = modal.getAttribute('aria-hidden') === 'true';
      return {
        id,
        open: modal.classList.contains('open'),
        hidden,
        inert: modal.hasAttribute('inert'),
        focusableCount: Array.from(modal.querySelectorAll(focusSelector))
          .filter((el) => !el.disabled && !el.hidden)
          .length,
        dialogCount: modal.querySelectorAll('[role="dialog"]').length
      };
    });

    const exposedDialogs = Array.from(document.querySelectorAll('[role="dialog"]'))
      .filter((dialog) => !dialog.closest('[aria-hidden="true"], [inert], [hidden]'))
      .map((dialog) => ids.find((id) => document.getElementById(id)?.contains(dialog)) || dialog.id || dialog.getAttribute('aria-label') || '');

    return {
      roots,
      activeRoots: roots.filter((root) => root.open && !root.hidden && !root.inert).map((root) => root.id),
      closedFocusableRoots: roots
        .filter((root) => !root.open && root.hidden && !root.inert && root.focusableCount > 0)
        .map((root) => root.id),
      exposedDialogs
    };
  }, ADMIN_MODAL_IDS);
}

async function expectOnlyActiveModal(page, id) {
  const snapshot = await modalA11ySnapshot(page);
  expect(snapshot.activeRoots).toEqual([id]);
  expect(snapshot.closedFocusableRoots).toEqual([]);
  expect(snapshot.exposedDialogs).toEqual([id]);
}

test('admin modals keep inactive dialogs inert and restore focus on close', async ({ page, clawnsole }) => {
  test.setTimeout(180000);
  test.skip(!!clawnsole?.skipReason, clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  const focusReturn = page.locator('#paneManagerBtn');
  await focusReturn.focus();

  const cases = [
    ['settingsModal', () => page.evaluate(() => window.openSettings?.())],
    ['shortcutsModal', () => page.evaluate(() => window.openShortcuts?.())],
    ['commandPaletteModal', () => page.evaluate(() => window.openCommandPalette?.())],
    ['paneManagerModal', () => page.evaluate(() => window.openPaneManager?.())],
    ['workqueueModal', () => page.evaluate(() => window.openWorkqueue?.())],
    ['agentsModal', () => page.evaluate(() => window.openAgentsModal?.())]
  ];

  for (const [id, open] of cases) {
    await focusReturn.focus();
    await open();
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-hidden', 'false');
    await expectOnlyActiveModal(page, id);

    await page.keyboard.press('Escape');
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator(`#${id}`)).toHaveAttribute('inert', '');
    await expect(focusReturn).toBeFocused();
  }
});

test('opening another admin modal closes the previously active dialog', async ({ page, clawnsole }) => {
  test.setTimeout(180000);
  test.skip(!!clawnsole?.skipReason, clawnsole.skipReason);

  await clawnsole.gotoAndLoginAdmin(page);

  await page.evaluate(() => window.openShortcuts?.());
  await expectOnlyActiveModal(page, 'shortcutsModal');

  await page.evaluate(() => window.openWorkqueue?.());
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#shortcutsModal')).toHaveAttribute('inert', '');
  await expectOnlyActiveModal(page, 'workqueueModal');
});
