const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const root = __dirname;
const port = Number(process.env.PORT || 5173);
const configPath = path.join(process.env.HOME || '', '.openclaw', 'openclaw.json');
const clawnsoleConfigPath = path.join(process.env.HOME || '', '.openclaw', 'clawnsole.json');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function readToken() {
  const raw = fs.readFileSync(configPath, 'utf8');
  const cfg = JSON.parse(raw);
  const token = cfg?.gateway?.auth?.token || '';
  const mode = cfg?.gateway?.auth?.mode || 'token';
  return { token, mode };
}

function readGatewayPort() {
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const cfg = JSON.parse(raw);
    return Number(cfg?.gateway?.port || 18789);
  } catch (err) {
    return 18789;
  }
}

function gatewayWsUrl() {
  return `ws://127.0.0.1:${readGatewayPort()}`;
}

function readUiPasswords() {
  try {
    const raw = fs.readFileSync(clawnsoleConfigPath, 'utf8');
    const cfg = JSON.parse(raw);
    const adminPassword = cfg?.adminPassword || 'admin';
    const guestPassword = cfg?.guestPassword || 'guest';
    const authVersion = cfg?.authVersion || '';
    return { adminPassword, guestPassword, authVersion };
  } catch (err) {
    return { adminPassword: 'admin', guestPassword: 'guest', authVersion: '' };
  }
}

function parseCookies(header) {
  if (!header) return {};
  return header.split(';').reduce((acc, part) => {
    const [key, ...rest] = part.trim().split('=');
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join('=') || '');
    return acc;
  }, {});
}

function getAuthCookie(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  return cookies.clawnsole_auth || '';
}

function getRoleCookie(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  return cookies.clawnsole_role || '';
}

function encodeAuthCookie(password, version) {
  return Buffer.from(`${password}::${version || ''}`, 'utf8').toString('base64');
}

function getRoleFromCookies(req) {
  const { adminPassword, guestPassword, authVersion } = readUiPasswords();
  if (!adminPassword && !guestPassword) return 'admin';
  const cookie = getAuthCookie(req);
  if (cookie) {
    if (adminPassword && cookie === encodeAuthCookie(adminPassword, authVersion)) {
      return getRoleCookie(req) === 'guest' ? 'guest' : 'admin';
    }
    if (guestPassword && cookie === encodeAuthCookie(guestPassword, authVersion)) {
      return 'guest';
    }
  }
  return null;
}

function requireAuth(req, res) {
  const role = getRoleFromCookies(req);
  if (role) {
    req.clawnsoleRole = role;
    return true;
  }
  res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: 'unauthorized' }));
  return false;
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  if (req.url.startsWith('/auth/role')) {
    const role = getRoleFromCookies(req);
    if (!role) {
      sendJson(res, 401, { error: 'unauthorized' });
      return;
    }
    sendJson(res, 200, { role });
    return;
  }

  if (req.url.startsWith('/meta')) {
    const port = readGatewayPort();
    sendJson(res, 200, {
      wsUrl: gatewayWsUrl(),
      guestWsUrl: '/guest-ws',
      port
    });
    return;
  }

  if (req.url.startsWith('/auth/logout')) {
    res.setHeader('Set-Cookie', [
      'clawnsole_auth=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict',
      'clawnsole_role=; Path=/; Max-Age=0; SameSite=Strict'
    ]);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.url.startsWith('/auth/login')) {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const role = payload.role === 'admin' ? 'admin' : 'guest';
        const password = String(payload.password || '');
        const { adminPassword, guestPassword, authVersion } = readUiPasswords();
        const ok =
          (role === 'admin' && password === adminPassword) ||
          (role === 'guest' && password === guestPassword);
        if (!ok) {
          sendJson(res, 401, { error: 'invalid_credentials' });
          return;
        }
        const token = encodeAuthCookie(role === 'admin' ? adminPassword : guestPassword, authVersion);
        res.setHeader('Set-Cookie', [
          `clawnsole_auth=${token}; Path=/; HttpOnly; SameSite=Strict`,
          `clawnsole_role=${role}; Path=/; SameSite=Strict`
        ]);
        sendJson(res, 200, { ok: true, role });
      } catch (err) {
        sendJson(res, 400, { error: 'invalid_request' });
      }
    });
    return;
  }

  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(root, decodeURIComponent(urlPath));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!urlPath.startsWith('/token')) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  if (!requireAuth(req, res)) {
    return;
  }

  if (req.url.startsWith('/token')) {
    try {
      const { token, mode } = readToken();
      if (!token) {
        sendJson(res, 404, { error: 'token_not_found', mode });
        return;
      }
      if (req.clawnsoleRole === 'guest') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }
      sendJson(res, 200, { token, mode });
    } catch (err) {
      sendJson(res, 500, { error: 'token_read_failed', message: String(err) });
    }
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

const guestAllowedMethods = new Set([
  'connect',
  'chat.send',
  'chat.history',
  'chat.abort',
  'sessions.resolve',
  'sessions.reset'
]);

function handleGuestProxy(clientSocket, req) {
  const role = getRoleFromCookies(req);
  if (role !== 'guest') {
    clientSocket.close();
    return;
  }

  const { token } = readToken();
  const upstream = new WebSocket(gatewayWsUrl());

  upstream.on('open', () => {
    clientSocket.on('message', (data) => {
      let frame;
      try {
        frame = JSON.parse(String(data));
      } catch {
        return;
      }
      if (frame?.type !== 'req') return;
      if (!guestAllowedMethods.has(frame.method)) {
        clientSocket.send(
          JSON.stringify({
            type: 'res',
            id: frame.id || 'unknown',
            ok: false,
            error: { code: 'FORBIDDEN', message: 'guest role not allowed for this method' }
          })
        );
        return;
      }
      if (frame.method === 'connect') {
        frame.params = frame.params || {};
        frame.params.auth = { token };
        frame.params.scopes = ['operator.read'];
        frame.params.role = 'operator';
      }
      upstream.send(JSON.stringify(frame));
    });
  });

  upstream.on('message', (data) => {
    let frame;
    try {
      frame = JSON.parse(String(data));
    } catch {
      return;
    }
    if (frame?.type === 'event') {
      const eventName = String(frame.event || '');
      const allowed = eventName === 'chat' || eventName.startsWith('connect.');
      if (!allowed) {
        return;
      }
    }
    clientSocket.send(JSON.stringify(frame));
  });

  const closeBoth = () => {
    try {
      upstream.close();
    } catch {}
    try {
      clientSocket.close();
    } catch {}
  };

  clientSocket.on('close', closeBoth);
  upstream.on('close', closeBoth);
  upstream.on('error', closeBoth);
}

const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  if (req.url === '/guest-ws') {
    wss.handleUpgrade(req, socket, head, (ws) => handleGuestProxy(ws, req));
    return;
  }
  socket.destroy();
});

server.listen(port, () => {
  console.log(`Clawnsole server running on http://localhost:${port}`);
});
