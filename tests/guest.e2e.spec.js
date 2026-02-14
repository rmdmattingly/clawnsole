const { test, expect } = require('@playwright/test');

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { installPageFailureAssertions } = require('./helpers/pw-assertions');

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
        guestPassword: 'guest',
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
        env: { ...process.env, HOME: tempHome, PORT: String(serverPort), HOST: '127.0.0.1' },
        stdio: ['ignore', 'pipe', 'pipe']
      })
    );
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

test('guest can log in at /guest and use chat pane; admin-only controls hidden', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!skipReason, skipReason);

  const guards = installPageFailureAssertions(page, {
    appOrigin: `http://127.0.0.1:${serverPort}`
  });

  await page.goto(`http://127.0.0.1:${serverPort}/guest`);

  await page.fill('#loginPassword', 'guest');
  await page.click('#loginBtn');
  await page.waitForURL(/\/guest\/?$/, { timeout: 10000 });

  await page.waitForSelector('[data-pane] [data-pane-input]', { timeout: 90000 });

  await expect(page.locator('#paneControls')).toHaveAttribute('hidden', '');
  await expect(page.locator('#addPaneBtn')).toHaveAttribute('hidden', '');
  await expect(page.locator('#workqueueBtn')).toHaveAttribute('hidden', '');
  await expect(page.locator('#refreshAgentsBtn')).toHaveAttribute('hidden', '');

  const pane = page.locator('[data-pane]').first();
  await pane.locator('[data-pane-input]').fill('hello from guest');
  await pane.locator('[data-pane-send]').click();

  await expect(pane.locator('[data-chat-role="assistant"]').last()).toContainText('mock-reply: hello from guest');

  await guards.assertNoFailures();
  guards.dispose();
});

test('guest cannot access /admin route (prompts to sign in as admin)', async ({ page }) => {
  test.setTimeout(180000);
  test.skip(!!skipReason, skipReason);

  await page.goto(`http://127.0.0.1:${serverPort}/guest`);
  await page.fill('#loginPassword', 'guest');
  await page.click('#loginBtn');
  await page.waitForURL(/\/guest\/?$/, { timeout: 10000 });

  await page.goto(`http://127.0.0.1:${serverPort}/admin`);
  await expect(page.locator('#loginOverlay')).toHaveClass(/open/);
  await expect(page.locator('#loginError')).toContainText(/Sign in as admin/i);
});
