const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { createProxyHandlers } = require('./proxy');

const root = __dirname;
const port = Number(process.env.PORT || 5173);
const configPath = path.join(process.env.HOME || '', '.openclaw', 'openclaw.json');
const clawnsoleConfigPath = path.join(process.env.HOME || '', '.openclaw', 'clawnsole.json');
const uploadRoot = path.join(process.env.HOME || '', '.openclaw', 'clawnsole-uploads');

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
    const guestPrompt =
      cfg?.guestPrompt ||
      'Guest mode: You are assisting a guest. Do not access or summarize private data (email, calendar, files). Do not assume identity; ask how you can help. You may assist with general questions and basic home automation.';
    const authVersion = cfg?.authVersion || '';
    return { adminPassword, guestPassword, guestPrompt, authVersion };
  } catch (err) {
    return {
      adminPassword: 'admin',
      guestPassword: 'guest',
      guestPrompt:
        'Guest mode: You are assisting a guest. Do not access or summarize private data (email, calendar, files). Do not assume identity; ask how you can help. You may assist with general questions and basic home automation.',
      authVersion: ''
    };
  }
}

function readClawnsoleConfig() {
  try {
    const raw = fs.readFileSync(clawnsoleConfigPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

function writeClawnsoleConfig(update) {
  const cfg = readClawnsoleConfig();
  const merged = { ...cfg, ...update };
  const dir = path.dirname(clawnsoleConfigPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(clawnsoleConfigPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
}

function safeFilename(name) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return cleaned || 'upload';
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
      sendJson(res, 200, { role: null });
      return;
    }
    sendJson(res, 200, { role });
    return;
  }

  if (req.url.startsWith('/meta')) {
    const port = readGatewayPort();
    sendJson(res, 200, {
      wsUrl: gatewayWsUrl(),
      adminWsUrl: '/admin-ws',
      guestWsUrl: '/guest-ws',
      port
    });
    return;
  }

  if (req.url.startsWith('/config/guest-prompt')) {
    const role = getRoleFromCookies(req);
    if (role !== 'admin') {
      sendJson(res, 403, { error: 'forbidden' });
      return;
    }
    if (req.method === 'GET') {
      const { guestPrompt } = readUiPasswords();
      sendJson(res, 200, { prompt: guestPrompt });
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const prompt = String(payload.prompt || '').trim();
          if (prompt.length > 4000) {
            sendJson(res, 400, { error: 'prompt_too_long' });
            return;
          }
          writeClawnsoleConfig({ guestPrompt: prompt });
          sendJson(res, 200, { ok: true });
        } catch (err) {
          sendJson(res, 400, { error: 'invalid_request' });
        }
      });
      return;
    }
    sendJson(res, 405, { error: 'method_not_allowed' });
    return;
  }

  if (req.url.startsWith('/upload')) {
    if (!requireAuth(req, res)) return;
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'method_not_allowed' });
      return;
    }
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const files = Array.isArray(payload.files) ? payload.files : [];
        const maxSize = 5 * 1024 * 1024;
        const stored = [];
        fs.mkdirSync(uploadRoot, { recursive: true });
        for (const file of files.slice(0, 4)) {
          const name = safeFilename(String(file.name || 'upload'));
          const type = String(file.type || 'application/octet-stream');
          const data = String(file.data || '');
          const buffer = Buffer.from(data, 'base64');
          if (buffer.length > maxSize) {
            continue;
          }
          const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
          const dir = path.join(uploadRoot, id);
          fs.mkdirSync(dir, { recursive: true });
          const filePath = path.join(dir, name);
          fs.writeFileSync(filePath, buffer);
          stored.push({
            name,
            type,
            size: buffer.length,
            url: `/uploads/${id}/${encodeURIComponent(name)}`
          });
        }
        sendJson(res, 200, { files: stored });
      } catch (err) {
        sendJson(res, 400, { error: 'invalid_request' });
      }
    });
    return;
  }

  if (req.url.startsWith('/auth/logout')) {
    res.setHeader('Set-Cookie', [
      'clawnsole_auth=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
      'clawnsole_role=; Path=/; Max-Age=0; SameSite=Lax'
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
          `clawnsole_auth=${token}; Path=/; HttpOnly; SameSite=Lax`,
          `clawnsole_role=${role}; Path=/; SameSite=Lax`
        ]);
        sendJson(res, 200, { ok: true, role });
      } catch (err) {
        sendJson(res, 400, { error: 'invalid_request' });
      }
    });
    return;
  }

  if (req.url.startsWith('/uploads/')) {
    if (!requireAuth(req, res)) return;
    const uploadPath = req.url.replace('/uploads/', '');
    const filePath = path.join(uploadRoot, uploadPath);
    if (!filePath.startsWith(uploadRoot)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
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

const { handleAdminProxy, handleGuestProxy } = createProxyHandlers({
  WebSocket,
  getRoleFromCookies,
  readToken,
  gatewayWsUrl,
  heartbeatMs: 2000,
  getGuestPrompt: () => readUiPasswords().guestPrompt
});

const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  if (req.url === '/admin-ws') {
    wss.handleUpgrade(req, socket, head, (ws) => handleAdminProxy(ws, req));
    return;
  }
  if (req.url === '/guest-ws') {
    wss.handleUpgrade(req, socket, head, (ws) => handleGuestProxy(ws, req));
    return;
  }
  socket.destroy();
});

server.listen(port, () => {
  console.log(`Clawnsole server running on http://localhost:${port}`);
});
