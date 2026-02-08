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

  // Work Queues (admin-only)

  const workQueuesPath =
    options.workQueuesPath ?? process.env.CLAWNSOLE_WORK_QUEUES_PATH ?? path.join(openclawHome, 'clawnsole-work-queues.json');

  function randomId() {
    return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
  }

  function readWorkQueuesFile() {
    try {
      const raw = fs.readFileSync(workQueuesPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {}
    return { queues: [] };
  }

  function writeWorkQueuesFile(payload) {
    const dir = path.dirname(workQueuesPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(workQueuesPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  }

  const workQueueState = (() => {
    const loaded = readWorkQueuesFile();
    const queues = Array.isArray(loaded.queues) ? loaded.queues : [];
    return {
      queues: queues
        .map((q) => {
          const id = typeof q?.id === 'string' ? q.id : '';
          if (!id) return null;
          const name = typeof q?.name === 'string' ? q.name : id;
          const assignedAgents = Array.isArray(q?.assignedAgents)
            ? q.assignedAgents.map((a) => String(a || '').trim()).filter(Boolean)
            : [];
          const items = Array.isArray(q?.items) ? q.items : [];
          return {
            id,
            name,
            createdAt: typeof q?.createdAt === 'number' ? q.createdAt : Date.now(),
            updatedAt: typeof q?.updatedAt === 'number' ? q.updatedAt : Date.now(),
            assignedAgents,
            items: items
              .map((item) => {
                const itemId = typeof item?.id === 'string' ? item.id : '';
                if (!itemId) return null;
                return {
                  id: itemId,
                  prompt: String(item?.prompt || ''),
                  state: typeof item?.state === 'string' ? item.state : 'pending',
                  createdAt: typeof item?.createdAt === 'number' ? item.createdAt : Date.now(),
                  updatedAt: typeof item?.updatedAt === 'number' ? item.updatedAt : Date.now(),
                  claimedBy: typeof item?.claimedBy === 'string' ? item.claimedBy : '',
                  claimedAt: typeof item?.claimedAt === 'number' ? item.claimedAt : null,
                  leaseExpiresAt: typeof item?.leaseExpiresAt === 'number' ? item.leaseExpiresAt : null,
                  doneAt: typeof item?.doneAt === 'number' ? item.doneAt : null
                };
              })
              .filter(Boolean)
          };
        })
        .filter(Boolean)
    };
  })();

  let workQueuesDirtyTimer = null;
  function scheduleWorkQueuesPersist() {
    if (workQueuesDirtyTimer) return;
    workQueuesDirtyTimer = setTimeout(() => {
      workQueuesDirtyTimer = null;
      try {
        writeWorkQueuesFile({ queues: workQueueState.queues });
      } catch {}
    }, 250);
  }

  // simple per-queue mutex for atomic claim semantics
  const workQueueLocks = new Map();
  async function withQueueLock(queueId, fn) {
    const prev = workQueueLocks.get(queueId) || Promise.resolve();
    let release;
    const next = new Promise((resolve) => (release = resolve));
    workQueueLocks.set(queueId, prev.then(() => next));
    try {
      await prev;
      return await fn();
    } finally {
      release();
      // cleanup if no waiters
      if (workQueueLocks.get(queueId) === next) {
        workQueueLocks.delete(queueId);
      }
    }
  }

  function findQueue(queueId) {
    return workQueueState.queues.find((q) => q.id === queueId) || null;
  }

  function queueSummary(queue) {
    const items = Array.isArray(queue?.items) ? queue.items : [];
    const counts = { pending: 0, active: 0, done: 0, failed: 0 };
    items.forEach((item) => {
      const s = item.state || 'pending';
      if (s === 'pending') counts.pending += 1;
      else if (s === 'claimed' || s === 'in_progress') counts.active += 1;
      else if (s === 'done') counts.done += 1;
      else if (s === 'failed') counts.failed += 1;
    });
    return {
      id: queue.id,
      name: queue.name,
      createdAt: queue.createdAt,
      updatedAt: queue.updatedAt,
      assignedAgents: queue.assignedAgents || [],
      counts
    };
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

    if (req.url.startsWith('/work-queues')) {
      if (!requireAuth(req, res)) return;
      if (req.clawnsoleRole !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }

      let parsed;
      try {
        parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      } catch {
        sendJson(res, 400, { error: 'invalid_url' });
        return;
      }

      const pathParts = parsed.pathname.split('/').filter(Boolean); // [work-queues, ...]
      const queueId = pathParts.length >= 2 ? pathParts[1] : '';
      const tail = pathParts.length >= 3 ? pathParts[2] : '';

      if (req.method === 'GET' && (pathParts.length === 1 || pathParts.length === 0)) {
        const queues = workQueueState.queues.map(queueSummary);
        sendJson(res, 200, { queues });
        return;
      }

      if (req.method === 'POST' && (pathParts.length === 1 || pathParts.length === 0)) {
        let body = '';
        req.on('data', (chunk) => (body += chunk.toString()));
        req.on('end', () => {
          try {
            const payload = JSON.parse(body || '{}');
            const name = String(payload.name || '').trim();
            if (!name) {
              sendJson(res, 400, { error: 'name_required' });
              return;
            }
            const id = `q_${randomId()}`;
            const now = Date.now();
            const assignedAgents = Array.isArray(payload.assignedAgents)
              ? payload.assignedAgents.map((a) => String(a || '').trim()).filter(Boolean)
              : [];
            const queue = { id, name, createdAt: now, updatedAt: now, assignedAgents, items: [] };
            workQueueState.queues.push(queue);
            scheduleWorkQueuesPersist();
            sendJson(res, 200, { queue: queueSummary(queue) });
          } catch {
            sendJson(res, 400, { error: 'invalid_request' });
          }
        });
        return;
      }

      if (!queueId) {
        sendJson(res, 404, { error: 'not_found' });
        return;
      }

      if (req.method === 'GET' && pathParts.length === 2) {
        const queue = findQueue(queueId);
        if (!queue) {
          sendJson(res, 404, { error: 'not_found' });
          return;
        }
        sendJson(res, 200, { queue });
        return;
      }

      if (pathParts.length === 4 && pathParts[2] === 'items') {
        const itemId = pathParts[3];
        const queue = findQueue(queueId);
        if (!queue) {
          sendJson(res, 404, { error: 'not_found' });
          return;
        }
        let body = '';
        req.on('data', (chunk) => (body += chunk.toString()));
        req.on('end', () => {
          try {
            const payload = JSON.parse(body || '{}');
            const state = typeof payload.state === 'string' ? payload.state : '';
            const allow = new Set(['pending', 'claimed', 'in_progress', 'done', 'failed', 'canceled']);
            if (!allow.has(state)) {
              sendJson(res, 400, { error: 'invalid_state' });
              return;
            }
            const item = queue.items.find((it) => it.id === itemId);
            if (!item) {
              sendJson(res, 404, { error: 'item_not_found' });
              return;
            }
            const now = Date.now();
            item.state = state;
            item.updatedAt = now;
            if (state === 'done' || state === 'failed' || state === 'canceled') {
              item.doneAt = now;
              item.leaseExpiresAt = null;
            }
            queue.updatedAt = now;
            scheduleWorkQueuesPersist();
            sendJson(res, 200, { item });
          } catch {
            sendJson(res, 400, { error: 'invalid_request' });
          }
        });
        return;
      }

      if (req.method === 'POST' && pathParts.length === 3 && tail === 'items') {
        const queue = findQueue(queueId);
        if (!queue) {
          sendJson(res, 404, { error: 'not_found' });
          return;
        }
        let body = '';
        req.on('data', (chunk) => (body += chunk.toString()));
        req.on('end', () => {
          try {
            const payload = JSON.parse(body || '{}');
            const prompt = String(payload.prompt || '').trim();
            if (!prompt) {
              sendJson(res, 400, { error: 'prompt_required' });
              return;
            }
            if (prompt.length > 10000) {
              sendJson(res, 400, { error: 'prompt_too_long' });
              return;
            }
            const now = Date.now();
            const item = {
              id: `w_${randomId()}`,
              prompt,
              state: 'pending',
              createdAt: now,
              updatedAt: now,
              claimedBy: '',
              claimedAt: null,
              leaseExpiresAt: null,
              doneAt: null
            };
            queue.items.push(item);
            queue.updatedAt = now;
            scheduleWorkQueuesPersist();
            sendJson(res, 200, { item });
          } catch {
            sendJson(res, 400, { error: 'invalid_request' });
          }
        });
        return;
      }

      if (req.method === 'POST' && tail === 'claim') {
        const queue = findQueue(queueId);
        if (!queue) {
          sendJson(res, 404, { error: 'not_found' });
          return;
        }
        let body = '';
        req.on('data', (chunk) => (body += chunk.toString()));
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const agentId = String(payload.agentId || '').trim();
            const leaseMsRaw = Number(payload.leaseMs || 10 * 60 * 1000);
            const leaseMs = Number.isFinite(leaseMsRaw) ? Math.max(30_000, Math.min(leaseMsRaw, 60 * 60 * 1000)) : 10 * 60 * 1000;

            const claimed = await withQueueLock(queueId, async () => {
              const now = Date.now();
              // expire old leases
              queue.items.forEach((item) => {
                if ((item.state === 'claimed' || item.state === 'in_progress') && item.leaseExpiresAt && item.leaseExpiresAt < now) {
                  item.state = 'pending';
                  item.claimedBy = '';
                  item.claimedAt = null;
                  item.leaseExpiresAt = null;
                  item.updatedAt = now;
                }
              });

              const next = queue.items.find((item) => item.state === 'pending');
              if (!next) return null;
              next.state = 'claimed';
              next.claimedBy = agentId || '';
              next.claimedAt = now;
              next.leaseExpiresAt = now + leaseMs;
              next.updatedAt = now;
              queue.updatedAt = now;
              scheduleWorkQueuesPersist();
              return next;
            });

            sendJson(res, 200, { item: claimed });
          } catch (err) {
            sendJson(res, 400, { error: 'invalid_request' });
          }
        });
        return;
      }



      sendJson(res, 404, { error: 'not_found' });
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
