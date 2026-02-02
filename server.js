const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 5173);
const configPath = path.join(process.env.HOME || '', '.openclaw', 'openclaw.json');

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

function readUiPasswords() {
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const cfg = JSON.parse(raw);
    const adminPassword = cfg?.ui?.clawnsole?.adminPassword || cfg?.ui?.clawnsole?.password || 'admin';
    const guestPassword = cfg?.ui?.clawnsole?.guestPassword || 'guest';
    return { adminPassword, guestPassword };
  } catch (err) {
    return { adminPassword: 'admin', guestPassword: 'guest' };
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

function encodeAuthCookie(password) {
  return Buffer.from(password, 'utf8').toString('base64');
}

function getRoleFromCookies(req) {
  const { adminPassword, guestPassword } = readUiPasswords();
  if (!adminPassword && !guestPassword) return 'admin';
  const cookie = getAuthCookie(req);
  if (cookie) {
    if (adminPassword && cookie === encodeAuthCookie(adminPassword)) {
      return getRoleCookie(req) === 'guest' ? 'guest' : 'admin';
    }
    if (guestPassword && cookie === encodeAuthCookie(guestPassword)) {
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
        const { adminPassword, guestPassword } = readUiPasswords();
        const ok =
          (role === 'admin' && password === adminPassword) ||
          (role === 'guest' && password === guestPassword);
        if (!ok) {
          sendJson(res, 401, { error: 'invalid_credentials' });
          return;
        }
        const token = encodeAuthCookie(role === 'admin' ? adminPassword : guestPassword);
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
      sendJson(res, 200, { token, mode });
    } catch (err) {
      sendJson(res, 500, { error: 'token_read_failed', message: String(err) });
    }
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

server.listen(port, () => {
  console.log(`Clawnsole server running on http://localhost:${port}`);
});
