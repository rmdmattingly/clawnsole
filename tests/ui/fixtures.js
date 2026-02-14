const base = require('@playwright/test');
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

function waitForHttp(url, timeoutMs = 10000) {
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
            reject(new Error(`timeout waiting for ${url}`));
            return;
          }
          setTimeout(attempt, 250);
        });
    };
    attempt();
  });
}

function formatProcOutput(proc, label) {
  if (!proc) return '';
  const stdout = proc.__stdout || '';
  const stderr = proc.__stderr || '';
  const code = proc.exitCode;

  let details = '';
  if (stdout || stderr) details += `${label} output:\n${stdout}${stderr}`;
  if (code !== null && code !== undefined) details += `\n${label} exit code: ${code}`;
  return details.trim();
}

const test = base.test.extend({
  clawnsole: [
    async ({}, use) => {
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

      const envBase = { ...process.env, HOME: tempHome };

      let gatewayProc;
      let serverProc;
      let skipReason = '';

      const startGateway = async () => {
        gatewayProc = captureOutput(
          spawn('node', ['scripts/mock-gateway.js'], {
            env: { ...envBase, MOCK_GATEWAY_PORT: String(gatewayPort) },
            stdio: ['ignore', 'pipe', 'pipe']
          })
        );

        await waitForHttp(`http://127.0.0.1:${gatewayPort}`, 10000);
      };

      const startServer = async () => {
        serverProc = captureOutput(
          spawn('node', ['server.js'], {
            // Force IPv4 bind; some CI environments bind IPv6-only by default and 127.0.0.1 then refuses.
            env: { ...envBase, PORT: String(serverPort), HOST: '127.0.0.1' },
            stdio: ['ignore', 'pipe', 'pipe']
          })
        );

        await waitForHttp(`http://127.0.0.1:${serverPort}/meta`, 10000);
      };

      try {
        await startGateway();
        await startServer();
      } catch (err) {
        const message = String(err);
        if (message.includes('EPERM') || message.includes('operation not permitted')) {
          skipReason = 'Local environment disallows binding to ports (EPERM).';
        } else {
          const details = [
            formatProcOutput(gatewayProc, 'mock-gateway'),
            formatProcOutput(serverProc, 'clawnsole')
          ]
            .filter(Boolean)
            .join('\n\n');
          const e = new Error(details ? `${message}\n\n${details}` : message);
          e.cause = err;
          throw e;
        }
      }

      const serverUrl = `http://127.0.0.1:${serverPort}`;
      const adminUrl = `${serverUrl}/admin`;
      const guestUrl = `${serverUrl}/guest`;

      const api = {
        tempHome,
        serverPort,
        gatewayPort,
        serverUrl,
        adminUrl,
        guestUrl,
        skipReason,
        procs: {
          serverProc,
          gatewayProc
        },
        async gotoAndLoginAdmin(page, password = 'admin') {
          await page.goto(`${serverUrl}/`);
          await page.fill('#loginPassword', password);
          await page.click('#loginBtn');
          await page.waitForURL(/\/admin\/?$/, { timeout: 10000 });
          await page.waitForSelector('[data-pane] [data-pane-input]', { timeout: 90000 });
        }
      };

      await use(api);

      try {
        serverProc?.kill('SIGTERM');
      } catch {}
      try {
        gatewayProc?.kill('SIGTERM');
      } catch {}
    },
    { scope: 'worker' }
  ]
});

test.afterEach(async ({ clawnsole }, testInfo) => {
  if (!clawnsole) return;
  if (testInfo.status === testInfo.expectedStatus) return;

  const gw = formatProcOutput(clawnsole.procs?.gatewayProc, 'mock-gateway');
  const srv = formatProcOutput(clawnsole.procs?.serverProc, 'clawnsole');
  const text = [gw, srv].filter(Boolean).join('\n\n');
  if (!text) return;

  await testInfo.attach('process-output', {
    body: text,
    contentType: 'text/plain'
  });
});

module.exports = {
  test,
  expect: base.expect
};
