const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const http = require('http');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

async function waitForHttp(url, timeoutMs = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (err) {}
    await wait(200);
  }
  return false;
}

async function login(baseUrl, role, password, cookieJar) {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, password })
  });
  if (!res.ok) throw new Error(`login failed for ${role}`);
  const getSetCookie = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : null;
  const rawSetCookie = getSetCookie && getSetCookie.length > 0 ? getSetCookie : null;
  const fallback = res.headers.get('set-cookie');
  const cookies = rawSetCookie || (fallback ? fallback.split(/,(?=\s*[^;]+=[^;]+)/) : []);
  cookies.forEach((cookie) => {
    const first = String(cookie).split(';')[0];
    if (first) cookieJar.push(first);
  });
}

async function assertRole(baseUrl, cookieHeader) {
  const res = await fetch(`${baseUrl}/auth/role`, {
    headers: { Cookie: cookieHeader }
  });
  if (!res.ok) {
    throw new Error('auth role check failed');
  }
  const data = await res.json();
  if (!data.role) {
    throw new Error('auth role missing');
  }
}

async function wsChat({ baseUrl, wsPath, cookieHeader }) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${baseUrl.replace('http', 'ws')}${wsPath}`, {
      headers: { Cookie: cookieHeader }
    });
    const timer = setTimeout(() => {
      reject(new Error('ws timeout'));
      ws.close();
    }, 8000);
    ws.on('close', (code, reason) => {
      clearTimeout(timer);
      reject(new Error(`ws closed (${code}) ${reason.toString()}`));
    });
    ws.on('open', () => {
      ws.send(
        JSON.stringify({
          type: 'req',
          id: 'connect-1',
          method: 'connect',
          params: {
            minProtocol: 3,
            maxProtocol: 3,
            client: { id: 'smoke', version: '0.0.1', platform: 'node', mode: 'test', instanceId: 'smoke' },
            role: 'operator',
            scopes: ['operator.read', 'operator.write', 'operator.admin'],
            caps: [],
            commands: [],
            permissions: {}
          }
        })
      );
      ws.send(
        JSON.stringify({
          type: 'req',
          id: 'chat-1',
          method: 'chat.send',
          params: {
            sessionKey: 'agent:main:admin:smoke',
            message: 'hello',
            deliver: true,
            idempotencyKey: 'smoke-1'
          }
        })
      );
    });
    ws.on('message', (data) => {
      let msg;
      try {
        msg = JSON.parse(String(data));
      } catch (err) {
        return;
      }
      if (msg.type === 'event' && msg.event === 'chat' && msg.payload?.state === 'final') {
        clearTimeout(timer);
        ws.close();
        resolve(msg);
      }
    });
    ws.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function run() {
  const tmpHome = fs.mkdtempSync(path.join('/tmp', 'clawnsole-test-'));
  const openclawPath = path.join(tmpHome, '.openclaw');
  const openclawJson = path.join(openclawPath, 'openclaw.json');
  const clawnsoleJson = path.join(openclawPath, 'clawnsole.json');
  const gatewayPort = await getFreePort();
  const serverPort = await getFreePort();

  writeJson(openclawJson, {
    gateway: { port: gatewayPort, auth: { mode: 'token', token: 'smoke-token' } }
  });
  writeJson(clawnsoleJson, { adminPassword: 'admin', authVersion: '1' });

  const mock = spawn('node', [path.join(__dirname, 'mock-gateway.js')], {
    env: {
      ...process.env,
      MOCK_GATEWAY_PORT: String(gatewayPort),
      MOCK_GATEWAY_HOST: '127.0.0.1'
    },
    stdio: 'inherit'
  });
  const server = spawn('node', [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, HOME: tmpHome, PORT: String(serverPort), HOST: '127.0.0.1' },
    stdio: 'inherit'
  });

  const ok = await waitForHttp(`http://127.0.0.1:${serverPort}/meta`, 8000);
  if (!ok) throw new Error('server did not start');

  const cookieJar = [];
  await login(`http://127.0.0.1:${serverPort}`, 'admin', 'admin', cookieJar);
  const cookieHeader = cookieJar.join('; ');
  await assertRole(`http://127.0.0.1:${serverPort}`, cookieHeader);
  const event = await wsChat({
    baseUrl: `http://127.0.0.1:${serverPort}`,
    wsPath: '/admin-ws',
    cookieHeader
  });

  if (!event?.payload?.message?.content?.[0]?.text?.includes('mock-reply')) {
    throw new Error('smoke test failed to receive reply');
  }

  server.kill();
  mock.kill();
  console.log('smoke-test: ok');
}

run().catch((err) => {
  console.error('smoke-test: failed');
  console.error(err);
  process.exit(1);
});
