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

  const recurringPromptsPath =
    options.recurringPromptsPath ??
    process.env.CLAWNSOLE_RECURRING_PROMPTS_PATH ??
    path.join(openclawHome, `clawnsole-recurring-prompts${cookieSuffix}.json`);


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
    try {
      const raw = fs.readFileSync(configPath, 'utf8');
      const cfg = JSON.parse(raw);
      const token = cfg?.gateway?.auth?.token || '';
      const mode = cfg?.gateway?.auth?.mode || 'token';
      return { token, mode };
    } catch {
      // In tests/CI we may start the server before a config exists; treat as missing token
      // and let callers decide how to handle auth.
      return { token: '', mode: 'token' };
    }
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
      const authVersion = cfg?.authVersion || '';
      return { adminPassword, authVersion };
    } catch (err) {
      return {
        adminPassword: 'admin',
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


  function readRecurringPrompts() {
    try {
      const raw = fs.readFileSync(recurringPromptsPath, 'utf8');
      const data = JSON.parse(raw);
      const prompts = Array.isArray(data?.prompts) ? data.prompts : [];
      return { prompts };
    } catch {
      return { prompts: [] };
    }
  }

  function writeRecurringPrompts(state) {
    const prompts = Array.isArray(state?.prompts) ? state.prompts : [];
    const dir = path.dirname(recurringPromptsPath);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = recurringPromptsPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ prompts }, null, 2) + '\n', 'utf8');
    fs.renameSync(tmp, recurringPromptsPath);
  }

  function randomId() {
    try {
      return require('crypto').randomUUID();
    } catch {
      return String(Date.now()) + '-' + Math.random().toString(16).slice(2) + '-' + Math.random().toString(16).slice(2);
    }
  }

  function sanitizeRecurringPrompt(input = {}, now) {
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    const agentId = typeof input.agentId === 'string' ? input.agentId.trim() : 'main';
    const message = typeof input.message === 'string' ? input.message.trim() : '';
    const intervalMinutesRaw = Number(input.intervalMinutes);
    const intervalMinutes = Number.isFinite(intervalMinutesRaw) ? Math.max(1, Math.floor(intervalMinutesRaw)) : 60;
    const enabled = input.enabled === false ? false : true;
    const intervalMs = intervalMinutes * 60 * 1000;
    const nextRunAt = Number.isFinite(Number(input.nextRunAt)) ? Number(input.nextRunAt) : now + intervalMs;
    return { title, agentId, message, intervalMinutes, intervalMs, enabled, nextRunAt };
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
    const { adminPassword, authVersion } = readUiPasswords();
    if (!adminPassword) return 'admin';

    const cookie = getAuthCookie(req);
    if (cookie && cookie === encodeAuthCookie(adminPassword, authVersion)) {
      // Role is stored separately so we can support different permission levels.
      // Default to admin for backward compatibility.
      const role = String(getRoleCookie(req) || 'admin').trim() || 'admin';
      return role;
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

  const { handleAdminProxy } = createProxyHandlers({
    WebSocket: WebSocketImpl,
    getRoleFromCookies,
    readToken,
    gatewayWsUrl,
    heartbeatMs: 2000
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


    if (
      req.url === '/api/recurring-prompts' ||
      req.url === '/api/recurring-prompts/' ||
      req.url.startsWith('/api/recurring-prompts?')
    ) {
      if (!requireAuth(req, res)) return;
      if (req.clawnsoleRole !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }

      if (req.method === 'GET') {
        const state = readRecurringPrompts();
        sendJson(res, 200, { ok: true, prompts: state.prompts });
        return;
      }

      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
      }

      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
        if (body.length > 200_000) {
          try {
            req.destroy();
          } catch {}
        }
      });
      req.on('end', () => {
        const now = Date.now();
        try {
          const payload = JSON.parse(body || '{}');
          const state = readRecurringPrompts();
          const cleaned = sanitizeRecurringPrompt(payload, now);
          if (!cleaned.message) {
            sendJson(res, 400, { ok: false, error: 'message_required' });
            return;
          }

          const prompt = {
            id: randomId(),
            title: cleaned.title || 'Recurring prompt',
            agentId: cleaned.agentId,
            message: cleaned.message,
            intervalMinutes: cleaned.intervalMinutes,
            enabled: cleaned.enabled,
            createdAt: now,
            updatedAt: now,
            lastRunAt: null,
            nextRunAt: cleaned.nextRunAt,
            lastStatus: 'never',
            lastError: ''
          };

          state.prompts.push(prompt);
          writeRecurringPrompts(state);
          sendJson(res, 200, { ok: true, prompt });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: 'invalid_request' });
        }
      });
      return;
    }

    if (req.url.startsWith('/api/recurring-prompts/')) {
      if (!requireAuth(req, res)) return;
      if (req.clawnsoleRole !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }

      const parts = req.url.split('?')[0].split('/').filter(Boolean);
      const id = parts[2] || '';
      if (!id) {
        sendJson(res, 404, { error: 'not_found' });
        return;
      }

      if (req.method === 'DELETE') {
        const state = readRecurringPrompts();
        const before = state.prompts.length;
        state.prompts = state.prompts.filter((p) => p && p.id !== id);
        if (state.prompts.length === before) {
          sendJson(res, 404, { ok: false, error: 'not_found' });
          return;
        }
        writeRecurringPrompts(state);
        sendJson(res, 200, { ok: true });
        return;
      }

      if (req.method !== 'PUT') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
      }

      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
        if (body.length > 200_000) {
          try {
            req.destroy();
          } catch {}
        }
      });
      req.on('end', () => {
        const now = Date.now();
        try {
          const payload = JSON.parse(body || '{}');
          const state = readRecurringPrompts();
          const idx = state.prompts.findIndex((p) => p && p.id === id);
          if (idx < 0) {
            sendJson(res, 404, { ok: false, error: 'not_found' });
            return;
          }
          const existing = state.prompts[idx];
          const cleaned = sanitizeRecurringPrompt({ ...existing, ...payload }, now);
          const updated = {
            ...existing,
            title: cleaned.title || existing.title || 'Recurring prompt',
            agentId: cleaned.agentId,
            message: cleaned.message,
            intervalMinutes: cleaned.intervalMinutes,
            enabled: cleaned.enabled,
            nextRunAt: cleaned.nextRunAt,
            updatedAt: now
          };
          state.prompts[idx] = updated;
          writeRecurringPrompts(state);
          sendJson(res, 200, { ok: true, prompt: updated });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: 'invalid_request' });
        }
      });
      return;
    }

    // Guest endpoints removed (admin-only server).

    // Admin-only workqueue API (for viewing from other devices).
    // Mutations are limited to enqueue + claim-next (no delete).

    if (req.url === '/api/workqueue/enqueue') {
      if (!requireAuth(req, res)) return;
      if (req.clawnsoleRole !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
      }

      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
        if (body.length > 100_000) {
          try {
            req.destroy();
          } catch {}
        }
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const queue = String(payload.queue || '').trim();
          const title = String(payload.title || '').trim();
          const instructions = String(payload.instructions || '').trim();
          const priority = Number.isFinite(Number(payload.priority)) ? Number(payload.priority) : 0;
          const dedupeKey = String(payload.dedupeKey || '').trim();

          if (!queue) {
            sendJson(res, 400, { ok: false, error: 'queue_required' });
            return;
          }

          const { enqueueItem } = require('./lib/workqueue');
          const item = enqueueItem(null, { queue, title, instructions, priority, dedupeKey });
          sendJson(res, 200, { ok: true, item });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: 'invalid_request' });
        }
      });
      return;
    }

    if (req.url === '/api/workqueue/claim-next') {
      if (!requireAuth(req, res)) return;
      if (req.clawnsoleRole !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
      }

      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
        if (body.length > 100_000) {
          try {
            req.destroy();
          } catch {}
        }
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const agentId = String(payload.agentId || '').trim();
          const leaseMs = payload.leaseMs;
          const queue = String(payload.queue || '').trim();
          const queues = queue ? [queue] : null;

          const { claimNext } = require('./lib/workqueue');
          const item = claimNext(null, { agentId, queues, leaseMs });
          sendJson(res, 200, { ok: true, item });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: 'invalid_request' });
        }
      });
      return;
    }

    if (req.url === '/api/workqueue/items' || req.url.startsWith('/api/workqueue/items?')) {
      if (!requireAuth(req, res)) return;
      if (req.clawnsoleRole !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }
      if (req.method !== 'GET') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
      }

      try {
        const { loadState } = require('./lib/workqueue');
        const url = new URL(req.url, 'http://localhost');
        const queue = (url.searchParams.get('queue') || '').trim();
        const statusRaw = (url.searchParams.get('status') || '').trim();
        const status = statusRaw
          ? statusRaw
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        const state = loadState(null);
        const items = state.items
          .filter((it) => {
            if (queue && it.queue !== queue) return false;
            if (status.length && !status.includes(it.status)) return false;
            return true;
          })
          .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));

        sendJson(res, 200, { ok: true, items });
      } catch (err) {
        sendJson(res, 500, { error: 'workqueue_error' });
      }
      return;
    }

    if (req.url === '/api/workqueue/queues' || req.url.startsWith('/api/workqueue/queues?')) {
      if (!requireAuth(req, res)) return;
      if (req.clawnsoleRole !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }
      if (req.method !== 'GET') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
      }

      try {
        const { loadState } = require('./lib/workqueue');
        const state = loadState(null);
        const queues = Object.keys(state.queues || {}).sort();
        sendJson(res, 200, { ok: true, queues });
      } catch (err) {
        sendJson(res, 500, { error: 'workqueue_error' });
      }
      return;
    }

    if (req.url === '/api/workqueue/summary' || req.url.startsWith('/api/workqueue/summary?')) {
      if (!requireAuth(req, res)) return;
      if (req.clawnsoleRole !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }
      if (req.method !== 'GET') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
      }

      try {
        const { loadState } = require('./lib/workqueue');
        const url = new URL(req.url, 'http://localhost');
        const queue = (url.searchParams.get('queue') || '').trim();
        const state = loadState(null);
        const items = state.items.filter((it) => (queue ? it.queue === queue : true));

        const counts = items.reduce((acc, it) => {
          const key = it.status || 'unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        const active = items
          .filter((it) => it.status === 'claimed' || it.status === 'in_progress')
          .sort((a, b) => (b.priority || 0) - (a.priority || 0))
          .map((it) => ({
            id: it.id,
            queue: it.queue,
            title: it.title,
            status: it.status,
            priority: it.priority,
            claimedBy: it.claimedBy,
            claimedAt: it.claimedAt,
            leaseUntil: it.leaseUntil,
            attempts: it.attempts,
            updatedAt: it.updatedAt
          }));

        sendJson(res, 200, { ok: true, queue: queue || null, counts, active });
      } catch (err) {
        sendJson(res, 500, { error: 'workqueue_error' });
      }
      return;
    }

    if (req.url.startsWith('/api/workqueue/item/')) {
      if (!requireAuth(req, res)) return;
      if (req.clawnsoleRole !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }
      if (req.method !== 'GET') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
      }

      try {
        const { loadState } = require('./lib/workqueue');
        const id = decodeURIComponent(req.url.slice('/api/workqueue/item/'.length)).replace(/\?.*$/, '');
        const state = loadState(null);
        const item = state.items.find((it) => it.id === id) || null;
        sendJson(res, 200, { ok: true, item });
      } catch (err) {
        sendJson(res, 500, { error: 'workqueue_error' });
      }
      return;
    }

    // Admin-only workqueue mutation API.
    if (req.url === '/api/workqueue/enqueue') {
      if (!requireAuth(req, res)) return;
      if (req.clawnsoleRole !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
      }
      let body = '';
      req.on('data', (chunk) => (body += chunk.toString()));
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const queue = String(payload.queue || '').trim();
          if (!queue) {
            sendJson(res, 400, { error: 'invalid_request' });
            return;
          }
          const title = String(payload.title || '').trim();
          const instructions = String(payload.instructions || '').trim();
          const priority = Number(payload.priority);
          const dedupeKey = String(payload.dedupeKey || '').trim();

          const { enqueueItem } = require('./lib/workqueue');
          const item = enqueueItem(null, {
            queue,
            title,
            instructions,
            priority: Number.isFinite(priority) ? priority : 0,
            dedupeKey: dedupeKey || undefined
          });
          sendJson(res, 200, { ok: true, item });
        } catch {
          sendJson(res, 400, { error: 'invalid_request' });
        }
      });
      return;
    }

    if (req.url === '/api/workqueue/claim-next') {
      if (!requireAuth(req, res)) return;
      if (req.clawnsoleRole !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
      }
      let body = '';
      req.on('data', (chunk) => (body += chunk.toString()));
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const agentId = String(payload.agentId || '').trim();
          const queues = Array.isArray(payload.queues)
            ? payload.queues.map((q) => String(q).trim()).filter(Boolean)
            : [];
          const leaseMs = payload.leaseMs;
          if (!agentId || !queues.length) {
            sendJson(res, 400, { error: 'invalid_request' });
            return;
          }
          const { claimNext } = require('./lib/workqueue');
          const item = claimNext(null, { agentId, queues, leaseMs });
          sendJson(res, 200, { ok: true, item });
        } catch {
          sendJson(res, 400, { error: 'invalid_request' });
        }
      });
      return;
    }

    if (req.url === '/api/workqueue/transition') {
      if (!requireAuth(req, res)) return;
      if (req.clawnsoleRole !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
      }
      let body = '';
      req.on('data', (chunk) => (body += chunk.toString()));
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const itemId = String(payload.itemId || '').trim();
          const agentId = String(payload.agentId || '').trim();
          const status = String(payload.status || '').trim();
          const note = payload.note;
          const error = payload.error;
          const result = payload.result;
          const leaseMs = payload.leaseMs;

          const allowed = new Set(['ready', 'pending', 'claimed', 'in_progress', 'done', 'failed']);
          if (!itemId || !agentId || !allowed.has(status)) {
            sendJson(res, 400, { error: 'invalid_request' });
            return;
          }

          const { transitionItem } = require('./lib/workqueue');
          try {
            const item = transitionItem(null, { itemId, agentId, status, note, error, result, leaseMs });
            sendJson(res, 200, { ok: true, item });
          } catch (err) {
            if (err && err.code === 'NOT_FOUND') {
              sendJson(res, 404, { error: 'not_found' });
              return;
            }
            if (err && (err.code === 'NOT_CLAIMED' || err.code === 'CLAIMED_BY_OTHER')) {
              sendJson(res, 409, { error: 'conflict', code: err.code });
              return;
            }
            sendJson(res, 500, { error: 'workqueue_error' });
          }
        } catch {
          sendJson(res, 400, { error: 'invalid_request' });
        }
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
          const role = 'admin';
          const password = String(payload.password || '');
          const { adminPassword, authVersion } = readUiPasswords();
          const ok = password === adminPassword;
          if (!ok) {
            sendJson(res, 401, { error: 'invalid_credentials' });
            return;
          }
          const token = encodeAuthCookie(adminPassword, authVersion);
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

    if (req.url === '/guest' || req.url === '/guest/') {
      res.writeHead(302, { Location: '/admin' });
      res.end('Redirecting');
      return;
    }

    const urlPath = req.url === '/' || req.url === '/admin' || req.url === '/admin/' ? '/index.html' : req.url;
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
        // guest role removed

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
    // /guest-ws removed

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
