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
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeVisible();

  // Workqueue pane should not render the chat composer UI.
  await expect(wqPane.locator('.chat-input-row')).toBeHidden();
  await expect(wqPane.locator('[data-pane-input]')).toBeHidden();
});

test('workqueue pane: item search filters rows and / focuses search', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const panes = page.locator('[data-pane]');
  const wqPane = panes.last();
  const search = wqPane.locator('[data-wq-item-search]');
  await expect(search).toBeVisible();

  const stamp = Date.now();
  const keepTitle = `pw-pane-search-keep-${stamp}`;
  const hideTitle = `pw-pane-search-hide-${stamp}`;

  const postItem = async (title) => {
    const res = await page.request.post(`http://127.0.0.1:${env.serverPort}/api/workqueue/enqueue`, {
      data: { queue: 'dev-team', title, instructions: `test-${title}`, priority: 1 }
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body?.item?.id).toBeTruthy();
    return body.item.id;
  };

  const keepId = await postItem(keepTitle);
  const hideId = await postItem(hideTitle);

  await wqPane.locator('[data-wq-refresh]').click();
  await expect(wqPane.locator(`[data-wq-item="${keepId}"]`)).toBeVisible();
  await expect(wqPane.locator(`[data-wq-item="${hideId}"]`)).toBeVisible();

  await wqPane.focus();
  await page.keyboard.press('/');
  await expect(search).toBeFocused();

  await search.fill(`keep-${stamp}`);
  await expect(wqPane.locator(`[data-wq-item="${keepId}"]`)).toBeVisible();
  await expect(wqPane.locator(`[data-wq-item="${hideId}"]`)).toHaveCount(0);
});

test('workqueue pane: queue search filters queue dropdown options (separate from item search)', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);
  await addPane(page, 'Workqueue pane');

  const panes = page.locator('[data-pane]');
  const wqPane = panes.last();
  const queueSearch = wqPane.locator('[data-wq-queue-search]');
  const queueSelect = wqPane.locator('[data-wq-queue-select]');
  await expect(queueSearch).toBeVisible();
  await expect(queueSelect).toBeVisible();

  const stamp = Date.now();
  const alphaQueue = `pw-alpha-${stamp}`;
  const betaQueue = `pw-beta-${stamp}`;

  const postItem = async (queue, title) => {
    const res = await page.request.post(`http://127.0.0.1:${env.serverPort}/api/workqueue/enqueue`, {
      data: { queue, title, instructions: `test-${title}`, priority: 1 }
    });
    expect(res.ok()).toBeTruthy();
  };

  await postItem(alphaQueue, `seed-alpha-${stamp}`);
  await postItem(betaQueue, `seed-beta-${stamp}`);

  await wqPane.locator('[data-wq-refresh]').click();

  await queueSearch.fill('alpha');
  const optionValues = await queueSelect.locator('option').allTextContents();
  expect(optionValues.some((v) => v.includes(alphaQueue))).toBeTruthy();
  expect(optionValues.some((v) => v.includes(betaQueue))).toBeFalsy();
  expect(optionValues.some((v) => v === 'Custom…')).toBeTruthy();
});

test('workqueue modal: sort preference persists across reopen + reload', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  await page.locator('#workqueueBtn').click();
  const modal = page.locator('#workqueueModal');
  await expect(modal).toHaveClass(/open/);

  const titleSort = page.locator('[data-wq-modal-sort="title"]');
  await titleSort.click(); // default -> title asc
  await expect(titleSort).toHaveClass(/active/);
  await expect(titleSort).toHaveAttribute('title', 'Sorted ascending');

  await page.locator('#workqueueCloseBtn').click();
  await expect(modal).not.toHaveClass(/open/);

  await page.locator('#workqueueBtn').click();
  await expect(modal).toHaveClass(/open/);
  await expect(titleSort).toHaveClass(/active/);
  await expect(titleSort).toHaveAttribute('title', 'Sorted ascending');

  await page.reload();
  const loginPassword = page.locator('#loginPassword');
  const loginBtn = page.locator('#loginBtn');
  const loginOverlay = page.locator('#loginOverlay');
  if (await loginPassword.isVisible()) {
    await loginPassword.fill('admin');
    await loginBtn.click();
    await loginOverlay.waitFor({ state: 'hidden', timeout: 10000 });
  }
  await page.locator('#workqueueBtn').click();
  await expect(modal).toHaveClass(/open/);
  await expect(page.locator('[data-wq-modal-sort="title"]')).toHaveClass(/active/);
  await expect(page.locator('[data-wq-modal-sort="title"]')).toHaveAttribute('title', 'Sorted ascending');
});

test('workqueue modal: enqueue + status transition + edit + delete', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!env?.skipReason, env?.skipReason);

  page.__consoleAsserts = attachConsoleErrorAsserts(page);

  await loginAdmin(page, env.serverPort);

  await page.locator('#workqueueBtn').click();
  const modal = page.locator('#workqueueModal');
  await expect(modal).toHaveClass(/open/);

  await expect(page.locator('#wqQueueSelect')).toBeVisible();
  await expect(page.locator('#wqStatusFilters')).toBeVisible();

  const stamp = Date.now();
  const title = `pw-modal-${stamp}`;
  const instructions = `pw-modal-instructions-${stamp}`;

  await page.locator('#wqEnqueueTitle').fill(title);
  await page.locator('#wqEnqueueInstructions').fill(instructions);

  const enqueueResP = page.waitForResponse((res) => res.url().includes('/api/workqueue/enqueue') && res.request().method() === 'POST');
  await page.locator('#wqEnqueueBtn').click();
  const enqueueRes = await enqueueResP;
  expect(enqueueRes.ok()).toBeTruthy();
  const enqueueBody = await enqueueRes.json();
  const itemId = enqueueBody?.item?.id;
  expect(itemId).toBeTruthy();

  const itemCard = page.locator(`[data-wq-item="${itemId}"]`);
  await expect(itemCard).toBeVisible();

  const inProgressCol = page.locator('[data-wq-col="in_progress"]');
  await itemCard.dragTo(inProgressCol);
  await page.waitForResponse((res) => res.url().includes('/api/workqueue/update') && res.request().method() === 'POST' && res.ok());
  await expect(inProgressCol.locator(`[data-wq-item="${itemId}"]`)).toBeVisible();

  await inProgressCol.locator(`[data-wq-item="${itemId}"]`).click();

  const editedTitle = `${title}-edited`;
  const editedInstructions = `${instructions}-edited`;
  page.once('dialog', async (dialog) => {
    await dialog.accept(editedTitle);
  });
  page.once('dialog', async (dialog) => {
    await dialog.accept(editedInstructions);
  });

  const updateResP = page.waitForResponse((res) => res.url().includes('/api/workqueue/update') && res.request().method() === 'POST');
  await page.locator('[data-wq-action="edit"]').click();
  const updateRes = await updateResP;
  expect(updateRes.ok()).toBeTruthy();

  const inspect = page.locator('#wqInspectBody');
  await expect(inspect).toContainText(editedTitle);
  await expect(inspect).toContainText(editedInstructions);

  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  const deleteResP = page.waitForResponse((res) => res.url().includes('/api/workqueue/delete') && res.request().method() === 'POST');
  await page.locator('[data-wq-action="delete"]').click();
  const deleteRes = await deleteResP;
  expect(deleteRes.ok()).toBeTruthy();

  await expect(page.locator(`[data-wq-item="${itemId}"]`)).toHaveCount(0);

  await page.locator('#workqueueCloseBtn').click();
  await expect(modal).not.toHaveClass(/open/);
});
