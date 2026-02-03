const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function waitForLine(proc, matcher, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const onData = (data) => {
      const text = data.toString();
      if (matcher.test(text)) {
        cleanup();
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        cleanup();
        reject(new Error(`timeout waiting for ${matcher}`));
      }
    };
    const cleanup = () => {
      proc.stdout?.off('data', onData);
      proc.stderr?.off('data', onData);
    };
    proc.stdout?.on('data', onData);
    proc.stderr?.on('data', onData);
  });
}

let serverProc;
let gatewayProc;
let tempHome;

test.beforeAll(async () => {
  tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-test-'));
  const openclawDir = path.join(tempHome, '.openclaw');
  fs.mkdirSync(openclawDir, { recursive: true });
  fs.writeFileSync(
    path.join(openclawDir, 'openclaw.json'),
    JSON.stringify(
      {
        gateway: {
          port: 18789,
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
        guestPassword: 'guest',
        authVersion: 'test'
      },
      null,
      2
    )
  );

  gatewayProc = spawn('node', ['scripts/mock-gateway.js'], {
    env: { ...process.env, HOME: tempHome, MOCK_GATEWAY_PORT: '18789' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForLine(gatewayProc, /mock-gateway listening/);

  serverProc = spawn('node', ['server.js'], {
    env: { ...process.env, HOME: tempHome, PORT: '18888' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForLine(serverProc, /Clawnsole server running/);
});

test.afterAll(() => {
  if (serverProc) serverProc.kill('SIGTERM');
  if (gatewayProc) gatewayProc.kill('SIGTERM');
});

test('admin login persists, send/receive, upload attachment', async ({ page }) => {
  await page.goto('/');
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await expect(page.locator('#loginOverlay')).toHaveClass(/open/, { timeout: 2000 }).catch(() => {});
  await expect(page.locator('#loginOverlay')).not.toHaveClass(/open/);

  await page.waitForSelector('.status-pill.connected', { timeout: 10000 });

  await page.fill('#chatInput', 'hello');
  await page.click('#chatBtn');
  await expect(page.locator('.chat-bubble.assistant')).toContainText('mock-reply: hello');

  const testFile = path.join(__dirname, 'upload.txt');
  fs.writeFileSync(testFile, 'upload test');
  await page.setInputFiles('#fileInput', testFile);
  await expect(page.locator('#attachmentList')).toContainText('upload.txt');

  await page.fill('#chatInput', 'with file');
  await page.click('#chatBtn');
  await expect(page.locator('.chat-bubble.user')).toContainText('with file');

  await page.reload();
  await expect(page.locator('#loginOverlay')).not.toHaveClass(/open/);
  await expect(page.locator('#rolePill')).toContainText('admin');
});
