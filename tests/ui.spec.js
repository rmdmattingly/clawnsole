const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

function getFreePort(host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    server.listen(0, host, () => {
      const addr = server.address();
      const port = addr && typeof addr === 'object' ? addr.port : null;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

function waitForHttp(url, timeoutMs = 10000, proc, label) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const attempt = () => {
      http
        .get(url, (res) => {
          res.resume();
          resolve();
        })
        .on('error', () => {
          if (Date.now() - start > timeoutMs) {
            let details = '';
            if (proc) {
              const stdout = proc.__stdout || '';
              const stderr = proc.__stderr || '';
              if (stdout || stderr) {
                details = `\n${label || 'process'} output:\n${stdout}${stderr}`;
              }
              if (proc.exitCode !== null && proc.exitCode !== undefined) {
                details += `\n${label || 'process'} exit code: ${proc.exitCode}`;
              }
            }
            reject(new Error(`timeout waiting for ${url}${details}`));
            return;
          }
          setTimeout(attempt, 250);
        });
    };
    attempt();
  });
}

function captureOutput(proc) {
  proc.__stdout = '';
  proc.__stderr = '';
  proc.stdout?.on('data', (chunk) => {
    proc.__stdout += chunk.toString();
  });
  proc.stderr?.on('data', (chunk) => {
    proc.__stderr += chunk.toString();
  });
  return proc;
}

let serverProc;
let gatewayProc;
let tempHome;
let skipReason = '';
let serverPort;
let gatewayPort;

test.beforeAll(async () => {
  tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-test-'));
  gatewayPort = await getFreePort();
  serverPort = await getFreePort();

  const openclawDir = path.join(tempHome, '.openclaw');
  fs.mkdirSync(openclawDir, { recursive: true });
  fs.writeFileSync(
    path.join(openclawDir, 'openclaw.json'),
    JSON.stringify(
      {
        gateway: {
          port: gatewayPort,
          auth: { token: 'test-token', mode: 'token' }
        }
      },
      null,
      2
    )
  );
  fs.writeFileSync(
    path.join(openclawDir, 'clawnsole.json'),
    JSON.stringify(
      {
        adminPassword: 'admin',
        authVersion: 'test'
      },
      null,
      2
    )
  );

  try {
    gatewayProc = captureOutput(
      spawn('node', ['scripts/mock-gateway.js'], {
        env: { ...process.env, HOME: tempHome, MOCK_GATEWAY_PORT: String(gatewayPort) },
        stdio: ['ignore', 'pipe', 'pipe']
      })
    );
    gatewayProc.on('exit', (code, signal) => {
      // eslint-disable-next-line no-console
      console.log(`mock-gateway exited code=${code} signal=${signal}`);
      if (gatewayProc?.__stdout || gatewayProc?.__stderr) {
        // eslint-disable-next-line no-console
        console.log(`mock-gateway output:\n${gatewayProc.__stdout || ''}${gatewayProc.__stderr || ''}`);
      }
    });
    await waitForHttp(`http://127.0.0.1:${gatewayPort}`, 10000, gatewayProc, 'mock-gateway');
  } catch (err) {
    const message = String(err);
    if (message.includes('EPERM') || message.includes('operation not permitted')) {
      skipReason = 'Local environment disallows binding to ports (EPERM).';
      return;
    }
    throw err;
  }

  try {
    serverProc = captureOutput(
      spawn('node', ['server.js'], {
        // Force IPv4 bind; some CI environments bind IPv6-only by default and 127.0.0.1 then refuses.
        env: { ...process.env, HOME: tempHome, PORT: String(serverPort), HOST: '127.0.0.1' },
        stdio: ['ignore', 'pipe', 'pipe']
      })
    );
    serverProc.on('exit', (code, signal) => {
      // eslint-disable-next-line no-console
      console.log(`clawnsole server exited code=${code} signal=${signal}`);
      if (serverProc?.__stdout || serverProc?.__stderr) {
        // eslint-disable-next-line no-console
        console.log(`clawnsole server output:\n${serverProc.__stdout || ''}${serverProc.__stderr || ''}`);
      }
    });
    await waitForHttp(`http://127.0.0.1:${serverPort}/meta`, 10000, serverProc, 'clawnsole');
  } catch (err) {
    const message = String(err);
    if (message.includes('EPERM') || message.includes('operation not permitted')) {
      skipReason = 'Local environment disallows binding to ports (EPERM).';
      return;
    }
    throw err;
  }
});

test.afterAll(() => {
  if (serverProc) serverProc.kill('SIGTERM');
  if (gatewayProc) gatewayProc.kill('SIGTERM');
});

test('admin login persists, send/receive, upload attachment', async ({ page }, testInfo) => {
  test.setTimeout(180000);
  test.skip(!!skipReason, skipReason);

  // Surface browser-side failures in CI logs (helps diagnose ws connect issues).
  page.on('console', (msg) => {
    try {
      console.log(`[ui-console:${msg.type()}] ${msg.text()}`);
    } catch {}
  });
  page.on('pageerror', (err) => {
    try {
      console.log(`[ui-pageerror] ${String(err && err.stack ? err.stack : err)}`);
    } catch {}
  });

  await page.goto(`http://127.0.0.1:${serverPort}/`);

  // iOS Safari will auto-zoom focused inputs when font-size < 16px.
  const fontSizes = await page.evaluate(() => {
    const selectors = ['#loginPassword', '#wsUrl', '#clientId', '#deviceId'];
    return selectors.reduce((acc, sel) => {
      const el = document.querySelector(sel);
      if (!el) return acc;
      acc[sel] = getComputedStyle(el).fontSize;
      return acc;
    }, {});
  });
  for (const [sel, value] of Object.entries(fontSizes)) {
    const size = Number.parseFloat(value);
    expect(Math.round(size)).toBeGreaterThanOrEqual(16);
  }

  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  // In CI the websocket handshake can be slower; wait longer for the pane to report connected.
  await page.waitForSelector('[data-pane] [data-pane-input]', { timeout: 90000 });

  // Agent list refresh should not require a full page reload.
  // Update the underlying openclaw.json and click refresh; the agent select should populate.
  const openclawConfigPath = path.join(tempHome, '.openclaw', 'openclaw.json');
  const openclawCfg = JSON.parse(fs.readFileSync(openclawConfigPath, 'utf8'));
  openclawCfg.agents = {
    defaults: { workspace: '' },
    list: [{ id: 'ops', name: 'ops', identity: { name: 'Ops', emoji: '🛠️' } }]
  };
  fs.writeFileSync(openclawConfigPath, JSON.stringify(openclawCfg, null, 2));

  await expect(page.locator('#refreshAgentsBtn')).toBeVisible();
  await page.click('#refreshAgentsBtn');

  const pane = page.locator('[data-pane]').first();
  await expect(pane.locator('[data-pane-agent-select] option[value="ops"]')).toHaveCount(1);

  await expect(pane.locator('[data-pane-send]')).toBeEnabled({ timeout: 90000 });

  // Workqueue pane should not render the chat composer UI.
  await expect(page.locator('#addPaneBtn')).toBeVisible();
  await page.click('#addPaneBtn');
  await page.getByRole('button', { name: 'Workqueue pane' }).click();

  const panes = page.locator('[data-pane]');
  const wqPane = panes.last();
  await expect(wqPane.locator('.wq-pane')).toHaveCount(1);
  await expect(wqPane.locator('.chat-input-row')).toBeHidden();
  await expect(wqPane.locator('[data-pane-input]')).toBeHidden();

  const paneFontSize = await page.evaluate(() => {
    const el = document.querySelector('[data-pane] [data-pane-input]');
    return el ? getComputedStyle(el).fontSize : '';
  });
  expect(Math.round(Number.parseFloat(paneFontSize))).toBeGreaterThanOrEqual(16);

  await pane.locator('[data-pane-input]').fill('hello');
  await pane.locator('[data-pane-send]').click();

  // Queued/sending indicator should be visible before we receive the assistant reply.
  await expect(pane.locator('[data-chat-role="user"]').last().locator('.chat-meta')).toContainText(
    /Queued|Sending/i
  );

  await expect(pane.locator('[data-chat-role="assistant"]').last()).toContainText('mock-reply: hello');

  const testFile = testInfo.outputPath('upload.txt');
  fs.writeFileSync(testFile, 'upload test');
  await pane.locator('[data-pane-file-input]').setInputFiles(testFile);
  await expect(pane.locator('[data-pane-attachment-list]')).toContainText('upload.txt');

  await pane.locator('[data-pane-input]').fill('with file');
  await pane.locator('[data-pane-send]').click();
  await expect(pane.locator('[data-chat-role="user"]').last()).toContainText('with file');

  await page.reload();
  await expect(page.locator('#loginOverlay')).not.toHaveClass(/open/);
  await expect(page.locator('#rolePill')).toContainText('signed in');
});

test('add pane menu offers chat vs workqueue; workqueue pane has queue dropdown', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!skipReason, skipReason);

  await page.goto(`http://127.0.0.1:${serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await page.waitForSelector('[data-pane] [data-pane-input]', { timeout: 90000 });

  const beforeCount = await page.locator('[data-pane]').count();

  await page.click('#addPaneBtn');
  await expect(page.locator('.pane-add-menu')).toBeVisible();
  await expect(page.locator('.pane-add-menu')).toContainText('Chat pane');
  await expect(page.locator('.pane-add-menu')).toContainText('Workqueue pane');

  await page.click('.pane-add-menu__item:text("Workqueue pane")');

  await expect(page.locator('[data-pane] .wq-pane')).toHaveCount(1);
  const afterCount = await page.locator('[data-pane]').count();
  expect(afterCount).toBe(beforeCount + 1);

  const wqPane = page.locator('[data-pane] .wq-pane').first();
  await expect(wqPane.locator('[data-wq-queue-select]')).toBeVisible();
  await expect(wqPane.locator('[data-wq-status-details]')).toBeVisible();
});


test('admin can add cron + timeline panes', async ({ page }) => {
  test.skip(!!skipReason, skipReason);
  await page.goto(`http://127.0.0.1:${serverPort}/`);

  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });
  await page.waitForSelector('[data-pane] [data-pane-input]', { timeout: 90000 });

  page.on('dialog', (dialog) => {
    throw new Error(`unexpected dialog: ${dialog.type()} ${dialog.message()}`);
  });

  const panes = page.locator('[data-pane]');
  await expect(panes).toHaveCount(2);

  await page.click('#addPaneBtn');
  await expect(page.locator('.pane-add-menu')).toBeVisible();
  await page.click('.pane-add-menu__item:text("Cron pane")');
  await expect(panes).toHaveCount(3);
  const cronPane = panes.nth(2);
  await expect(cronPane).toContainText('Cron');
  await expect(cronPane.locator('.chat-input-row')).toBeHidden();
  await expect(cronPane.locator('[data-pane-input]')).toBeHidden();

  await page.click('#addPaneBtn');
  await expect(page.locator('.pane-add-menu')).toBeVisible();
  await page.click('.pane-add-menu__item:text("Timeline pane")');
  await expect(panes).toHaveCount(4);
  const timelinePane = panes.nth(3);
  await expect(timelinePane).toContainText('Timeline');
  await expect(timelinePane.locator('.chat-input-row')).toBeHidden();
  await expect(timelinePane.locator('[data-pane-input]')).toBeHidden();
});


test('workqueue modal renders as kanban board and supports enqueue', async ({ page }) => {
  test.skip(!!skipReason, skipReason);
  await page.goto(`http://127.0.0.1:${serverPort}/`);

  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  await expect(page.locator('#workqueueBtn')).toBeVisible();
  await page.click('#workqueueBtn');
  await expect(page.locator('#workqueueModal')).toHaveClass(/open/);

  // Select a queue (new installs may not have any items yet, so rely on defaults).
  await page.selectOption('#wqQueueSelect', { label: 'dev-team' });

  // Enqueue an item and ensure it appears in the Ready column.
  await page.fill('#wqEnqueueTitle', 'kanban test item');
  await page.fill('#wqEnqueueInstructions', 'do the thing');
  await page.click('#wqEnqueueBtn');

  const board = page.locator('#wqListBody.wq-board');
  await expect(board).toBeVisible();
  await expect(board.locator('.wq-board-col-title', { hasText: 'Ready' })).toHaveCount(1);
  await expect(board.locator('.wq-card')).toContainText('kanban test item');
});
