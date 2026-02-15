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

async function startTestEnv() {
  const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-test-'));
  const gatewayPort = await getFreePort();
  const serverPort = await getFreePort();

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

  let skipReason = '';
  let gatewayProc;
  let serverProc;

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
      return { skipReason };
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
      return { skipReason };
    }
    throw err;
  }

  const stop = () => {
    if (serverProc) serverProc.kill('SIGTERM');
    if (gatewayProc) gatewayProc.kill('SIGTERM');
  };

  return {
    skipReason,
    tempHome,
    serverPort,
    gatewayPort,
    stop
  };
}

async function loginAdmin(page, serverPort) {
  await page.goto(`http://127.0.0.1:${serverPort}/`);
  await page.fill('#loginPassword', 'admin');
  await page.click('#loginBtn');
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });
  await page.waitForSelector('[data-pane] [data-pane-input]', { timeout: 90000 });
}

function attachConsoleErrorAsserts(page) {
  const errors = [];

  page.on('console', (msg) => {
    // Keep CI output useful.
    try {
      // eslint-disable-next-line no-console
      console.log(`[ui-console:${msg.type()}] ${msg.text()}`);
    } catch {}

    if (msg.type() === 'error') {
      errors.push({ type: 'console', text: msg.text() });
    }
  });

  page.on('pageerror', (err) => {
    const text = String(err && err.stack ? err.stack : err);
    // eslint-disable-next-line no-console
    console.log(`[ui-pageerror] ${text}`);
    errors.push({ type: 'pageerror', text });
  });

  return {
    assertNoErrors() {
      if (errors.length === 0) return;
      const formatted = errors.map((e) => `- ${e.type}: ${e.text}`).join('\n');
      throw new Error(`Unexpected browser console/page errors:\n${formatted}`);
    }
  };
}

async function openAddPaneMenu(page) {
  await page.locator('#addPaneBtn').click();
  await page.getByRole('menu', { name: 'Add pane' }).waitFor({ state: 'visible' });
}

async function addPane(page, name) {
  await openAddPaneMenu(page);
  await page.getByRole('button', { name }).click();
}

module.exports = {
  startTestEnv,
  loginAdmin,
  attachConsoleErrorAsserts,
  addPane
};
