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
    return { adminPassword: 'password', guestPassword: 'guest' };
  }
}

function decodeBasicAuth(header) {
  if (!header || !header.startsWith('Basic ')) return null;
  try {
    const raw = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const idx = raw.indexOf(':');
    if (idx === -1) return null;
    return { user: raw.slice(0, idx), pass: raw.slice(idx + 1) };
  } catch (err) {
    return null;
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

function requireAuth(req, res) {
  const { adminPassword, guestPassword } = readUiPasswords();
  if (!adminPassword && !guestPassword) return true;
  const cookie = getAuthCookie(req);
  const roleCookie = getRoleCookie(req);
  if (cookie) {
    if (adminPassword && cookie === encodeAuthCookie(adminPassword)) {
      req.clawnsoleRole = 'admin';
      return true;
    }
    if (guestPassword && cookie === encodeAuthCookie(guestPassword)) {
      req.clawnsoleRole = 'guest';
      return true;
    }
  }
  const auth = decodeBasicAuth(req.headers.authorization);
  if (auth) {
    if (adminPassword && auth.pass === adminPassword) {
      res.setHeader('Set-Cookie', [
        `clawnsole_auth=${encodeAuthCookie(adminPassword)}; Path=/; HttpOnly; SameSite=Strict`,
        `clawnsole_role=admin; Path=/; SameSite=Strict`
      ]);
      req.clawnsoleRole = 'admin';
      return true;
    }
    if (guestPassword && auth.pass === guestPassword) {
      res.setHeader('Set-Cookie', [
        `clawnsole_auth=${encodeAuthCookie(guestPassword)}; Path=/; HttpOnly; SameSite=Strict`,
        `clawnsole_role=guest; Path=/; SameSite=Strict`
      ]);
      req.clawnsoleRole = 'guest';
      return true;
    }
  }
  res.writeHead(401, {
    'WWW-Authenticate': 'Basic realm="Clawnsole", charset="UTF-8"',
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('Unauthorized');
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

  if (!requireAuth(req, res)) {
    return;
  }

  if (req.url.startsWith('/auth/role')) {
    sendJson(res, 200, {
      role: req.clawnsoleRole || getRoleCookie(req) || 'guest'
    });
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

  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(root, decodeURIComponent(urlPath));
  if (!filePath.startsWith(root)) {
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
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain; charset=utf-8' });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Clawnsole server running on http://localhost:${port}`);
});
