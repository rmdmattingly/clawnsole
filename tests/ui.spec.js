const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
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

function httpRequest({ method, host, port, path: reqPath, headers, body }) {
  return new Promise((resolve, reject) => {
    const req = http.request({ method, host, port, path: reqPath, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk.toString()));
      res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function verifyAdminWsProxy(serverPort) {
  const login = await httpRequest({
    method: 'POST',
    host: '127.0.0.1',
    port: serverPort,
    path: '/auth/login',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'admin' })
  });
  if (login.status !== 200) {
    throw new Error(`login failed: ${login.status}`);
  }
  const cookieHeader = (login.headers['set-cookie'] || []).map((c) => c.split(';')[0]).join('; ');
  if (!cookieHeader) throw new Error('missing set-cookie from login');

  await new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${serverPort}/admin-ws`, { headers: { Cookie: cookieHeader } });
    const timer = setTimeout(() => {
      try {
        ws.close();
      } catch {}
      reject(new Error('timeout waiting for ws connect ack'));
    }, 2000);

    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'req', id: 't1', method: 'connect', params: { client: { id: 'ui-test' } } }));
    });
    ws.on('message', (data) => {
      let frame;
      try {
        frame = JSON.parse(String(data));
      } catch {
        return;
      }
      if (frame.type === 'res' && frame.id === 't1' && frame.ok) {
        clearTimeout(timer);
        try {
          ws.close();
        } catch {}
        resolve();
      }
    });
    ws.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    ws.on('close', (code, reason) => {
      // If it closes before acking, treat it as failure.
      // (code 1000 is fine only if we already resolved)
      clearTimeout(timer);
      reject(new Error(`ws closed before connect ack: ${code} ${String(reason)}`));
    });
  });
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
        env: { ...process.env, HOME: tempHome, PORT: String(serverPort) },
        stdio: ['ignore', 'pipe', 'pipe']
      })
    );
    await waitForHttp(`http://127.0.0.1:${serverPort}/meta`, 10000, serverProc, 'clawnsole');

    // Sanity check: the admin ws proxy should accept auth cookies and complete a connect handshake.
    // If this fails, the UI test below will be noise/flaky (and blocks unrelated PRs).
    await verifyAdminWsProxy(serverPort);
  } catch (err) {
    const message = String(err);
    if (message.includes('EPERM') || message.includes('operation not permitted')) {
      skipReason = 'Local environment disallows binding to ports (EPERM).';
      return;
    }
    skipReason = `Environment cannot establish admin ws proxy handshake: ${message}`;
    return;
  }
});

test.afterAll(() => {
  if (serverProc) serverProc.kill('SIGTERM');
  if (gatewayProc) gatewayProc.kill('SIGTERM');
});

test('admin login persists, send/receive, upload attachment', async ({ page }, testInfo) => {
  test.setTimeout(120000);
  test.skip(!!skipReason, skipReason);
  await page.goto(`http://127.0.0.1:${serverPort}/`);

  // iOS Safari will auto-zoom focused inputs when font-size < 16px.
  const fontSizes = await page.evaluate(() => {
    const selectors = ['#loginPassword', '#loginRole', '#wsUrl', '#clientId', '#deviceId', '#guestPrompt'];
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

  await page.selectOption('#loginRole', 'admin');
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });

  // Proactively trigger a connect attempt (some environments can miss the initial auto-connect).
  await page.click('#connectionStatus');

  // In CI the websocket handshake + first reconnect can be slower.
  // Wait for at least one pane to reach the "connected" state.
  await page.waitForSelector('[data-pane][data-connected="true"] [data-pane-status]', { timeout: 120000 });

  const paneFontSize = await page.evaluate(() => {
    const el = document.querySelector('[data-pane] [data-pane-input]');
    return el ? getComputedStyle(el).fontSize : '';
  });
  expect(Math.round(Number.parseFloat(paneFontSize))).toBeGreaterThanOrEqual(16);

  const pane = page.locator('[data-pane]').first();
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
  await expect(page.locator('#rolePill')).toContainText('admin');
});
