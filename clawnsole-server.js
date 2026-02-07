const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { createProxyHandlers } = require('./proxy');

function createClawnsoleServer(options = {}) {
  const root = options.root || __dirname;
  const portRaw = options.portRaw ?? process.env.PORT;
  const host = options.host ?? process.env.HOST ?? undefined;
  const parsedPort = Number.parseInt(portRaw, 10);
  const port = Number.isFinite(parsedPort) ? parsedPort : 5173;
  const homeDir = options.homeDir ?? process.env.HOME ?? '';

  const openclawHome = options.openclawHome ?? process.env.OPENCLAW_HOME ?? path.join(homeDir, '.openclaw');
  const configPath = options.openclawConfigPath ?? process.env.OPENCLAW_CONFIG ?? path.join(openclawHome, 'openclaw.json');
  const clawnsoleConfigPath =
    options.clawnsoleConfigPath ?? process.env.CLAWNSOLE_CONFIG ?? path.join(openclawHome, 'clawnsole.json');
  const uploadRoot =
    options.uploadRoot ?? process.env.CLAWNSOLE_UPLOAD_ROOT ?? path.join(openclawHome, 'clawnsole-uploads');

  const instanceRaw = options.instance ?? process.env.CLAWNSOLE_INSTANCE ?? '';
  const instance = typeof instanceRaw === 'string' ? instanceRaw.trim() : String(instanceRaw || '').trim();
  const instanceSlug = instance.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const cookieSuffix = instanceSlug ? `_${instanceSlug}` : '';
  const authCookieName = `clawnsole_auth${cookieSuffix}`;
  const roleCookieName = `clawnsole_role${cookieSuffix}`;

  const WebSocketImpl = options.WebSocketImpl || WebSocket;

  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
  };

  function cleanIdentityField(value) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) return '';
    const lower = text.toLowerCase();
    if (lower.includes('pick something you like')) return '';
    if (lower.includes('your signature')) return '';
    if (lower.includes('unset')) return '';
    return text;
  }

  function parseIdentityMd(raw) {
    if (!raw || typeof raw !== 'string') return { name: '', emoji: '' };
    const nameMatch = raw.match(/^\s*-\s*\*\*Name:\*\*\s*(.+?)\s*$/im);
    const emojiMatch = raw.match(/^\s*-\s*\*\*(?:Emoji|Signature Emoji|Signature):\*\*\s*(.+?)\s*$/im);
    return {
      name: nameMatch ? cleanIdentityField(nameMatch[1]) : '',
      emoji: emojiMatch ? cleanIdentityField(emojiMatch[1]) : ''
    };
  }

  function readWorkspaceIdentity(workspacePath) {
    if (!workspacePath || typeof workspacePath !== 'string') return { name: '', emoji: '' };
    const filePath = path.join(workspacePath, 'IDENTITY.md');
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      return parseIdentityMd(raw);
    } catch {
      return { name: '', emoji: '' };
    }
  }

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
    const override = options.gatewayWsUrl ?? process.env.CLAWNSOLE_GATEWAY_WS_URL;
    if (typeof override === 'string' && override.trim()) return override.trim();
    return `ws://127.0.0.1:${readGatewayPort()}`;
  }

  function readUiPasswords() {
    try {
      const raw = fs.readFileSync(clawnsoleConfigPath, 'utf8');
      const cfg = JSON.parse(raw);
      const adminPassword = cfg?.adminPassword || 'admin';
      const guestPassword = cfg?.guestPassword || 'guest';
      const guestAgentId = cfg?.guestAgentId || 'clawnsole-guest';
      const guestPrompt =
        cfg?.guestPrompt ||
        'Guest mode: You are assisting a guest. Do not access or summarize private data (email, calendar, files). Do not assume identity; ask how you can help. You may assist with general questions and basic home automation.';
      const authVersion = cfg?.authVersion || '';
      return { adminPassword, guestPassword, guestAgentId, guestPrompt, authVersion };
    } catch (err) {
      return {
        adminPassword: 'admin',
        guestPassword: 'guest',
        guestAgentId: 'clawnsole-guest',
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
    return cookies[authCookieName] || '';
  }

  function getRoleCookie(req) {
    const cookies = parseCookies(req.headers.cookie || '');
    return cookies[roleCookieName] || '';
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
        return 'admin';
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

  let lastGuestSessionKey = null;

  const { handleAdminProxy, handleGuestProxy } = createProxyHandlers({
    WebSocket: WebSocketImpl,
    getRoleFromCookies,
    readToken,
    gatewayWsUrl,
    heartbeatMs: 2000,
    getGuestPrompt: () => readUiPasswords().guestPrompt,
    getGuestAgentId: () => readUiPasswords().guestAgentId,
    onGuestSessionKey: (key) => {
      lastGuestSessionKey = key;
    }
  });

  const wss = new WebSocketImpl.Server({ noServer: true });

  function handleRequest(req, res) {
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
      const wsUrl = gatewayWsUrl();
      const { guestAgentId } = readUiPasswords();
      let gatewayPort = readGatewayPort();
      try {
        const parsed = new URL(wsUrl);
        if (parsed.port) {
          const parsedPort = Number(parsed.port);
          if (Number.isFinite(parsedPort) && parsedPort > 0) {
            gatewayPort = parsedPort;
          }
        }
      } catch {}
      sendJson(res, 200, {
        wsUrl,
        adminWsUrl: '/admin-ws',
        guestWsUrl: '/guest-ws',
        guestAgentId,
        port: gatewayPort
      });
      return;
    }

	    if (req.url === '/agents' || req.url === '/agents/' || req.url.startsWith('/agents?')) {
	      if (!requireAuth(req, res)) return;
	      if (req.clawnsoleRole !== 'admin') {
	        sendJson(res, 403, { error: 'forbidden' });
	        return;
	      }
	      if (req.method !== 'GET') {
	        sendJson(res, 405, { error: 'method_not_allowed' });
	        return;
	      }

	      let defaultWorkspace = '';
	      let agents = [];
	      try {
	        const raw = fs.readFileSync(configPath, 'utf8');
	        const cfg = JSON.parse(raw);
	        defaultWorkspace = typeof cfg?.agents?.defaults?.workspace === 'string' ? cfg.agents.defaults.workspace : '';
	        const list = Array.isArray(cfg?.agents?.list) ? cfg.agents.list : [];
	        const seen = new Map();
	        list.forEach((entry) => {
	          const id = typeof entry?.id === 'string' ? entry.id.trim() : '';
	          if (!id) return;
          const name = typeof entry?.name === 'string' && entry.name.trim() ? entry.name.trim() : id;
          const workspace =
            typeof entry?.workspace === 'string' && entry.workspace.trim()
              ? entry.workspace.trim()
              : defaultWorkspace;
          const inlineIdentity = entry?.identity && typeof entry.identity === 'object' ? entry.identity : {};
          const mdIdentity = workspace ? readWorkspaceIdentity(workspace) : { name: '', emoji: '' };
          const displayName =
            cleanIdentityField(inlineIdentity?.name) || mdIdentity.name || name || id;
          const emoji = cleanIdentityField(inlineIdentity?.emoji) || mdIdentity.emoji || '';
          if (!seen.has(id)) {
            seen.set(id, { id, name, displayName, emoji });
          }
        });
        agents = Array.from(seen.values());
	      } catch {}

	      if (!agents.find((a) => a.id === 'main')) {
	        const mainWorkspace = defaultWorkspace || path.join(openclawHome, 'workspace');
	        const mdIdentity = readWorkspaceIdentity(mainWorkspace);
	        const displayName = mdIdentity.name || 'main';
	        const emoji = mdIdentity.emoji || '';
	        agents.unshift({ id: 'main', name: 'main', displayName, emoji });
	      }
      agents.sort((a, b) => {
        if (a.id === 'main') return -1;
        if (b.id === 'main') return 1;
        return a.id.localeCompare(b.id);
      });

      sendJson(res, 200, { agents });
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

    if (req.url.startsWith('/diag/guest')) {
      const role = getRoleFromCookies(req);
      if (role !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }
      const { guestAgentId } = readUiPasswords();
      sendJson(res, 200, {
        guestAgentId,
        lastGuestSessionKey
      });
      return;
    }

    if (req.url === '/upload' || req.url === '/upload/' || req.url.startsWith('/upload?')) {
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
        `${authCookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
        `${roleCookieName}=; Path=/; Max-Age=0; SameSite=Lax`
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
            `${authCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax`,
            `${roleCookieName}=${role}; Path=/; SameSite=Lax`
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

    const urlPath =
      req.url === '/' || req.url === '/admin' || req.url === '/admin/' || req.url === '/guest' || req.url === '/guest/'
        ? '/index.html'
        : req.url;
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
  }

  const server = http.createServer(handleRequest);

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

  return {
    server,
    port,
    host,
    handleRequest,
    getAuthCookie,
    getRoleCookie,
    encodeAuthCookie
  };
}

module.exports = {
  createClawnsoleServer
};
