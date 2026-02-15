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

async function startClawnsoleTestApp() {
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
        },
        agents: {
          list: [
            { id: 'dev', name: 'dev' },
            { id: 'main', name: 'main' }
          ]
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
    await waitForHttp(`http://127.0.0.1:${gatewayPort}`, 10000, gatewayProc, 'mock-gateway');
  } catch (err) {
    const message = String(err);
    if (message.includes('EPERM') || message.includes('operation not permitted')) {
      skipReason = 'Local environment disallows binding to ports (EPERM).';
    } else {
      throw err;
    }
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
    } else {
      throw err;
    }
  }

  const stop = () => {
    try {
      serverProc?.kill('SIGTERM');
    } catch {}
    try {
      gatewayProc?.kill('SIGTERM');
    } catch {}
  };

  return { tempHome, gatewayPort, serverPort, skipReason, stop };
}

module.exports = {
  startClawnsoleTestApp
};
