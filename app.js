const elements = {
  wsUrl: document.getElementById('wsUrl'),
  clientId: document.getElementById('clientId'),
  deviceId: document.getElementById('deviceId'),
  guestPrompt: document.getElementById('guestPrompt'),
  saveGuestPromptBtn: document.getElementById('saveGuestPromptBtn'),
  guestPromptStatus: document.getElementById('guestPromptStatus'),
  disconnectBtn: document.getElementById('disconnectBtn'),
  status: document.getElementById('connectionStatus'),
  statusMeta: document.getElementById('statusMeta'),
  chatInput: document.getElementById('chatInput'),
  chatBtn: document.getElementById('chatBtn'),
  chatThread: document.getElementById('chatThread'),
  pulseCanvas: document.getElementById('pulseCanvas'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  settingsCloseBtn: document.getElementById('settingsCloseBtn'),
  rolePill: document.getElementById('rolePill'),
  channelSelect: document.getElementById('channelSelect'),
  loginOverlay: document.getElementById('loginOverlay'),
  loginRole: document.getElementById('loginRole'),
  loginPassword: document.getElementById('loginPassword'),
  loginBtn: document.getElementById('loginBtn'),
  loginError: document.getElementById('loginError'),
  fileInput: document.getElementById('fileInput'),
  attachBtn: document.getElementById('attachBtn'),
  attachmentList: document.getElementById('attachmentList'),
  attachmentStatus: document.getElementById('attachmentStatus'),
  logoutBtn: document.getElementById('logoutBtn')
};

const storage = {
  get(key, fallback = '') {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  },
  set(key, value) {
    localStorage.setItem(key, value);
  }
};

const roleState = {
  role: 'guest',
  channel: 'guest',
  guestPolicyInjected: false
};

const uiState = {
  connected: false,
  authed: false,
  meta: {}
};

const attachmentState = {
  files: []
};

function getSessionKey(role) {
  const deviceLabel = elements.deviceId.value.trim() || 'device';
  const kind = role === 'admin' ? 'admin' : 'guest';
  return `agent:main:${kind}:${deviceLabel}`;
}

function setChatEnabled(enabled) {
  elements.chatInput.disabled = !enabled;
  elements.chatBtn.disabled = !enabled;
  elements.attachBtn.disabled = !enabled;
  elements.chatInput.placeholder = enabled
    ? 'Message OpenClaw... (Press Enter to send)'
    : 'Disconnected — sign in to continue';
}

function setConnectionState(connected) {
  uiState.connected = connected;
  setChatEnabled(connected && uiState.authed);
  elements.status.textContent = connected ? 'connected' : 'disconnected';
  elements.status.classList.toggle('connected', connected);
  elements.status.classList.toggle('error', !connected);
  if (!connected) {
    setAuthState(false);
    showLogin('Disconnected. Please sign in again.');
  }
}

function setAuthState(authed) {
  uiState.authed = authed;
  setChatEnabled(uiState.connected && authed);
}

function resolveWsUrl(raw) {
  if (!raw) return '';
  if (raw.startsWith('ws://') || raw.startsWith('wss://')) return raw;
  if (raw.startsWith('/')) {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${proto}://${window.location.host}${raw}`;
  }
  return raw;
}

async function fetchRole() {
  try {
    const res = await fetch('/auth/role', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.role === 'admin' ? 'admin' : 'guest';
  } catch (err) {
    return null;
  }
}

async function fetchMeta() {
  try {
    const res = await fetch('/meta', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.wsUrl) {
      elements.wsUrl.value = data.wsUrl;
      uiState.meta = data;
      return data;
    }
    return null;
  } catch (err) {
    return null;
  }
}

function setRole(role) {
  roleState.role = role;
  if (elements.rolePill) {
    elements.rolePill.textContent = role;
    elements.rolePill.classList.toggle('admin', role === 'admin');
  }
  if (role === 'guest') {
    roleState.channel = 'guest';
    if (elements.channelSelect) {
      elements.channelSelect.value = 'guest';
      elements.channelSelect.disabled = true;
    }
    roleState.guestPolicyInjected = false;
    elements.settingsBtn.setAttribute('disabled', 'disabled');
    elements.settingsBtn.style.opacity = '0.5';
  } else {
    roleState.channel = 'admin';
    if (elements.channelSelect) {
      elements.channelSelect.value = 'admin';
      elements.channelSelect.disabled = true;
    }
    elements.settingsBtn.removeAttribute('disabled');
    elements.settingsBtn.style.opacity = '1';
  }
  clearChatHistory();
  restoreChatHistory();
}

function setChannel(channel) {
  roleState.channel = channel;
  storage.set('clawnsole.channel', channel);
  clearChatHistory();
  restoreChatHistory();
}

function showLogin(message = '') {
  elements.loginOverlay.classList.add('open');
  elements.loginOverlay.setAttribute('aria-hidden', 'false');
  elements.loginError.textContent = message;
  elements.loginPassword.value = '';
  elements.loginPassword.focus();
  setAuthState(false);
}

function hideLogin() {
  elements.loginOverlay.classList.remove('open');
  elements.loginOverlay.setAttribute('aria-hidden', 'true');
  elements.loginError.textContent = '';
  setAuthState(true);
}

async function attemptLogin() {
  const role = elements.loginRole.value === 'admin' ? 'admin' : 'guest';
  const password = elements.loginPassword.value.trim();
  if (!password) {
    showLogin('Password required.');
    return;
  }
  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, password }),
      credentials: 'include'
    });
    if (!res.ok) {
      showLogin('Invalid password. Try again.');
      return;
    }
    const data = await res.json();
    hideLogin();
    setRole(data.role === 'admin' ? 'admin' : 'guest');
    fetchMeta().finally(() => client.connect());
  } catch (err) {
    showLogin('Login failed. Please retry.');
  }
}

function renderAttachments() {
  if (!elements.attachmentList) return;
  elements.attachmentList.innerHTML = '';
  attachmentState.files.forEach((file, index) => {
    const pill = document.createElement('div');
    pill.className = 'attachment-pill';
    const name = document.createElement('span');
    name.textContent = file.name;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '✕';
    remove.addEventListener('click', () => {
      attachmentState.files.splice(index, 1);
      renderAttachments();
    });
    pill.append(name, remove);
    elements.attachmentList.appendChild(pill);
  });
}

async function handleFileSelection(event) {
  const files = Array.from(event.target.files || []);
  const maxSize = 5 * 1024 * 1024;
  const maxCount = 4;
  elements.attachmentStatus.textContent = '';
  for (const file of files) {
    if (attachmentState.files.length >= maxCount) {
      elements.attachmentStatus.textContent = 'Attachment limit reached.';
      break;
    }
    if (file.size > maxSize) {
      elements.attachmentStatus.textContent = `File too large: ${file.name}`;
      continue;
    }
    const data = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
    attachmentState.files.push({
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      data: base64
    });
  }
  event.target.value = '';
  renderAttachments();
}

async function uploadAttachments() {
  if (attachmentState.files.length === 0) return [];
  elements.attachmentStatus.textContent = 'Uploading...';
  const res = await fetch('/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ files: attachmentState.files })
  });
  if (!res.ok) {
    elements.attachmentStatus.textContent = 'Upload failed.';
    return [];
  }
  const data = await res.json();
  attachmentState.files = [];
  renderAttachments();
  elements.attachmentStatus.textContent = '';
  return Array.isArray(data.files) ? data.files : [];
}
function randomId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function initDeviceId() {
  const existing = storage.get('clawnsole.deviceId');
  if (existing) return existing;
  const id = `clawnsole-${randomId()}`;
  storage.set('clawnsole.deviceId', id);
  return id;
}

elements.deviceId.value = initDeviceId();
let cachedToken = '';

async function fetchToken() {
  try {
    const res = await fetch('/token');
    if (!res.ok) {
      addFeed('err', 'token', `token fetch failed (${res.status})`);
      return '';
    }
    const data = await res.json();
    if (data.token) {
      cachedToken = data.token;
      addFeed('event', 'token', 'token loaded from openclaw config');
      return data.token;
    }
    return '';
  } catch (err) {
    addFeed('err', 'token', String(err));
    return '';
  }
}

function addFeed(type, label, payload) {
  const record = { type, label, payload };
  if (type === 'err') {
    console.error('[clawnsole]', record);
  } else {
    console.log('[clawnsole]', record);
  }
}

function extractChatText(message) {
  if (!message) return '';
  if (typeof message === 'string') return message;
  if (typeof message.text === 'string') return message.text;
  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .filter(Boolean)
      .join('');
  }
  return '';
}

const chatState = {
  runs: new Map(),
  history: []
};

const scrollState = {
  pinned: true
};

function isNearBottom(container) {
  const threshold = 80;
  return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
}

function scrollToBottom(container, force = false) {
  if (force || scrollState.pinned) {
    container.scrollTop = container.scrollHeight;
  }
}

function loadChatHistory() {
  if (roleState.role === 'guest' || roleState.channel === 'guest') {
    return [];
  }
  try {
    const raw = localStorage.getItem(`clawnsole.chat.history.${roleState.channel}`);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    addFeed('err', 'chat', `failed to load history: ${String(err)}`);
    return [];
  }
}

function saveChatHistory() {
  if (roleState.role === 'guest' || roleState.channel === 'guest') {
    return;
  }
  try {
    localStorage.setItem(
      `clawnsole.chat.history.${roleState.channel}`,
      JSON.stringify(chatState.history)
    );
  } catch (err) {
    addFeed('err', 'chat', `failed to save history: ${String(err)}`);
  }
}

function restoreChatHistory() {
  chatState.history = loadChatHistory();
  elements.chatThread.innerHTML = '';
  chatState.runs.clear();
  chatState.history.forEach((entry) => {
    addChatMessage({ role: entry.role, text: entry.text, persist: false });
  });
  scrollToBottom(elements.chatThread, true);
}

function clearChatHistory() {
  chatState.history = [];
  chatState.runs.clear();
  elements.chatThread.innerHTML = '';
  if (roleState.role !== 'guest' && roleState.channel !== 'guest') {
    localStorage.removeItem(`clawnsole.chat.history.${roleState.channel}`);
  }
}

function addChatMessage({ role, text, runId, streaming = false, persist = true }) {
  const shouldPin = scrollState.pinned || isNearBottom(elements.chatThread);
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}${streaming ? ' streaming' : ''}`;
  const meta = document.createElement('div');
  meta.className = 'chat-meta';
  meta.textContent = role === 'user' ? 'You' : 'OpenClaw';
  const body = document.createElement('div');
  body.className = 'chat-text';
  body.innerHTML = renderMarkdown(text || '');
  bubble.appendChild(meta);
  bubble.appendChild(body);
  elements.chatThread.appendChild(bubble);
  scrollState.pinned = shouldPin;
  scrollToBottom(elements.chatThread);
  let index = null;
  if (persist) {
    index = chatState.history.length;
    chatState.history.push({ role, text, ts: Date.now() });
    saveChatHistory();
  }
  if (runId) {
    chatState.runs.set(runId, { body, index });
  }
}

function updateChatRun(runId, text, done) {
  const entry = chatState.runs.get(runId);
  if (!entry) {
    addChatMessage({ role: 'assistant', text, runId, streaming: !done, persist: done });
    return;
  }
  const shouldPin = scrollState.pinned || isNearBottom(elements.chatThread);
  entry.body.innerHTML = renderMarkdown(text || '');
  if (entry.index === null || entry.index === undefined) {
    if (done || text) {
      entry.index = chatState.history.length;
      chatState.history.push({ role: 'assistant', text, ts: Date.now() });
      saveChatHistory();
    }
  } else {
    chatState.history[entry.index] = { role: 'assistant', text, ts: Date.now() };
    saveChatHistory();
  }
  if (done) {
    entry.body.parentElement?.classList.remove('streaming');
    chatState.runs.delete(runId);
    scrollState.pinned = shouldPin;
    scrollToBottom(elements.chatThread);
  } else if (shouldPin) {
    scrollState.pinned = true;
    scrollToBottom(elements.chatThread);
  }
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);

  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre><code>${code.replace(/^\n+|\n+$/g, '')}</code></pre>`;
  });
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/\n- (.+)/g, '<ul><li>$1</li></ul>');
  html = html.replace(/<\/ul>\n<ul>/g, '');
  html = html.replace(/\n\d+\. (.+)/g, '<ol><li>$1</li></ol>');
  html = html.replace(/<\/ol>\n<ol>/g, '');
  html = html.replace(/\n/g, '<br />');

  return html;
}

function ensureHiddenWelcome(role) {
  const sessionKey = getSessionKey(role);
  const storageKey = `clawnsole.welcome.${sessionKey}`;
  if (storage.get(storageKey)) return;
  const message =
    role === 'guest'
      ? 'Welcome! You are assisting a guest. Greet them as a guest, do not assume identity, and ask how you can help today.'
      : 'Welcome! You are in Admin mode. You can assist with full OpenClaw capabilities.';
  client.request('chat.inject', {
    sessionKey,
    message,
    label: 'Welcome'
  });
  storage.set(storageKey, 'sent');
}

const pulse = {
  ctx: elements.pulseCanvas.getContext('2d'),
  width: 0,
  height: 0,
  pulses: [],
  nodes: [],
  firing: [],
  eventCount: 0,
  eventRate: 0,
  lastEvent: 'none'
};

function triggerFiring(strength = 1, bursts = 3) {
  const now = Date.now();
  const maxDist = 160;
  for (let i = 0; i < bursts; i += 1) {
    const a = pulse.nodes[Math.floor(Math.random() * pulse.nodes.length)];
    const b = pulse.nodes[Math.floor(Math.random() * pulse.nodes.length)];
    if (!a || !b || a === b) continue;
    pulse.firing.push({
      ax: a.x,
      ay: a.y,
      bx: b.x,
      by: b.y,
      t: 0,
      speed: 0.035 + Math.random() * 0.05,
      alpha: 0.45 * strength,
      life: 1,
      width: 0.6 + strength * 0.4,
      maxDist,
      startedAt: now
    });
  }
}

function initFluxNodes() {
  const count = Math.max(48, Math.min(120, Math.floor(pulse.width / 14)));
  pulse.nodes = Array.from({ length: count }, () => ({
    x: Math.random() * elements.pulseCanvas.clientWidth,
    y: Math.random() * elements.pulseCanvas.clientHeight,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    glow: Math.random() * 0.6 + 0.2
  }));
}

function resizeCanvas() {
  const rect = elements.pulseCanvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  elements.pulseCanvas.width = rect.width * scale;
  elements.pulseCanvas.height = rect.height * scale;
  pulse.width = elements.pulseCanvas.width;
  pulse.height = elements.pulseCanvas.height;
  // Reset transform before applying scale to avoid compounding.
  pulse.ctx.setTransform(1, 0, 0, 1, 0, 0);
  pulse.ctx.scale(scale, scale);
  initFluxNodes();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function spawnPulse(strength = 1) {
  const x = Math.random() * elements.pulseCanvas.clientWidth;
  const y = Math.random() * elements.pulseCanvas.clientHeight;
  pulse.pulses.push({
    x,
    y,
    r: 20,
    alpha: 0.8,
    strength,
    hue: Math.random() * 60 + 20
  });
}

function boostPulse(amount = 1, bursts = 3) {
  for (let i = 0; i < bursts; i += 1) {
    spawnPulse(amount);
  }
}

function updatePulseMeta() {}

setInterval(() => {
  pulse.eventRate = pulse.eventCount;
  pulse.eventCount = 0;
  updatePulseMeta();
}, 1000);

function renderPulse() {
  const ctx = pulse.ctx;
  ctx.clearRect(0, 0, pulse.width, pulse.height);
  ctx.fillStyle = 'rgba(12, 15, 20, 0.45)';
  ctx.fillRect(0, 0, pulse.width, pulse.height);

  // Neural lattice background.
  const maxDist = 140;
  pulse.nodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < 0 || node.x > elements.pulseCanvas.clientWidth) node.vx *= -1;
    if (node.y < 0 || node.y > elements.pulseCanvas.clientHeight) node.vy *= -1;
  });

  for (let i = 0; i < pulse.nodes.length; i += 1) {
    const a = pulse.nodes[i];
    for (let j = i + 1; j < pulse.nodes.length; j += 1) {
      const b = pulse.nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.18;
        ctx.strokeStyle = `rgba(127, 209, 185, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  pulse.firing = pulse.firing.filter((burst) => burst.life > 0.05 && burst.t < 1.02);
  pulse.firing.forEach((burst) => {
    burst.t += burst.speed;
    burst.life *= 0.94;
    burst.alpha *= 0.92;
    const tx = burst.ax + (burst.bx - burst.ax) * Math.min(1, burst.t);
    const ty = burst.ay + (burst.by - burst.ay) * Math.min(1, burst.t);
    ctx.strokeStyle = `rgba(255, 179, 71, ${burst.alpha})`;
    ctx.lineWidth = burst.width;
    ctx.beginPath();
    ctx.moveTo(burst.ax, burst.ay);
    ctx.lineTo(tx, ty);
    ctx.stroke();
  });

  pulse.nodes.forEach((node) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 179, 71, ${0.25 + node.glow * 0.4})`;
    ctx.fill();
  });

  requestAnimationFrame(renderPulse);
}

renderPulse();

class GatewayClient {
  constructor() {
    this.socket = null;
    this.pending = new Map();
    this.connected = false;
    this.challenge = null;
    this.connectTimer = null;
    this.handshakeSent = false;
  }

  async connect() {
    const usingGuestProxy = roleState.channel === 'guest' && uiState.meta.guestWsUrl;
    const usingAdminProxy = roleState.channel === 'admin' && uiState.meta.adminWsUrl;
    const rawUrl = usingGuestProxy
      ? uiState.meta.guestWsUrl
      : usingAdminProxy
        ? uiState.meta.adminWsUrl
        : elements.wsUrl.value.trim();
    const url = resolveWsUrl(rawUrl);
    if (!url) return;

    if (this.socket) {
      this.disconnect();
    }

    const usingProxy = usingGuestProxy || usingAdminProxy;
    if (!usingProxy) {
      if (!cachedToken) {
        this.setStatus('connecting', 'fetching token...');
        await fetchToken();
      }
      if (!cachedToken) {
        this.setStatus('error', 'missing gateway token');
        return;
      }
    }

    this.socket = new WebSocket(url);
    this.socket.addEventListener('open', () => {
      this.handshakeSent = false;
      this.setStatus('connecting', 'waiting for challenge...');
      this.connectTimer = setTimeout(() => this.sendConnect(), 400);
    });

    this.socket.addEventListener('message', (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        addFeed('err', 'parse', String(err));
        return;
      }

      if (data.type === 'event' && data.event === 'connect.challenge') {
        this.challenge = data.payload;
        this.sendConnect();
        return;
      }

      if (data.type === 'res' && data.id && this.pending.has(data.id)) {
        const resolver = this.pending.get(data.id);
        this.pending.delete(data.id);
        resolver(data);
      }

      pulse.eventCount += 1;
      pulse.lastEvent = data.event || data.method || data.type || 'event';
      spawnPulse(Math.min(2, 0.5 + pulse.eventRate / 2));

      if (data.type === 'event') {
        if (data.event === 'activity') {
          const recentCount = Number(data.payload?.recentCount || 0);
          const idleForMs = Number(data.payload?.idleForMs || 0);
          const base = idleForMs > 6000 ? 0.4 : idleForMs > 2000 ? 0.8 : 1.2;
          const strength = Math.min(2.4, base + recentCount / 8);
          triggerFiring(strength, Math.min(6, 1 + Math.floor(recentCount / 6)));
          return;
        }
        if (data.event === 'chat') {
          const payload = data.payload || {};
          const runId = payload.runId;
          const text = extractChatText(payload.message);
          if (payload.state === 'delta') {
            updateChatRun(runId, text, false);
            triggerFiring(2, 4);
          } else if (payload.state === 'final') {
            updateChatRun(runId, text, true);
            triggerFiring(1.2, 2);
          } else if (payload.state === 'error') {
            updateChatRun(runId, payload.errorMessage || 'Chat error', true);
            triggerFiring(0.8, 1);
          }
        } else if (data.event === 'agent') {
          const stream = data.payload?.stream;
          if (stream === 'assistant' && typeof data.payload?.data?.text === 'string') {
            triggerFiring(1.2, 2);
          } else if (stream === 'tool') {
            triggerFiring(1.4, 2);
          } else if (stream === 'lifecycle') {
            triggerFiring(0.9, 1);
          }
        }
      }
    });

  this.socket.addEventListener('close', () => {
    this.connected = false;
    this.setStatus('disconnected', 'socket closed');
    setConnectionState(false);
  });

  this.socket.addEventListener('error', () => {
    this.connected = false;
    this.setStatus('error', 'socket error');
    setConnectionState(false);
  });
  }

  sendConnect() {
    if (!this.socket || this.connected || this.handshakeSent) return;
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }

    const scopes = ['operator.read', 'operator.write'];

    const payload = {
      type: 'req',
      id: randomId(),
      method: 'connect',
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: elements.clientId.value.trim() || 'webchat-ui',
          version: '0.1.0',
          platform: 'web',
          mode: 'webchat',
          instanceId: elements.deviceId.value.trim()
        },
        role: 'operator',
        scopes,
        caps: [],
        commands: [],
        permissions: {},
        auth: cachedToken ? { token: cachedToken } : undefined,
        locale: navigator.language || 'en-US',
        userAgent: 'clawnsole/0.1.0'
      }
    };

    this.handshakeSent = true;
    this.requestRaw(payload).then((res) => {
      if (res.ok) {
        this.connected = true;
        this.setStatus('connected', `protocol ${res.payload?.protocol ?? 'ok'}`);
        setConnectionState(true);
        this.ensureGuestPolicy();
        ensureHiddenWelcome(roleState.channel);
      } else {
        this.connected = false;
        this.setStatus('error', res.error?.message || 'connect failed');
        setConnectionState(false);
        this.handshakeSent = false;
      }
    });
  }

  request(method, params = {}) {
    const payload = {
      type: 'req',
      id: randomId(),
      method,
      params
    };
    return this.requestRaw(payload);
  }

  requestRaw(payload) {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error('socket not open'));
        return;
      }
      this.pending.set(payload.id, (res) => resolve(res));
      this.socket.send(JSON.stringify(payload));
    }).catch((err) => {
      addFeed('err', 'request', String(err));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    setConnectionState(false);
  }

  setStatus(state, meta) {
    elements.status.textContent = state;
    elements.status.classList.remove('connected', 'error');
    if (state === 'connected') elements.status.classList.add('connected');
    if (state === 'error') elements.status.classList.add('error');
    if (elements.statusMeta) {
      elements.statusMeta.textContent = meta;
    }
  }

  ensureGuestPolicy() {
    if (!this.connected) return;
    if (roleState.channel !== 'guest') return;
    if (roleState.guestPolicyInjected) return;
    roleState.guestPolicyInjected = true;
    const sessionKey = getSessionKey('guest');
    this.request('sessions.resolve', {
      key: sessionKey
    }).then((res) => {
      if (!res?.ok) {
        this.request('sessions.reset', { key: sessionKey });
      }
    });
    this.request('chat.inject', {
      sessionKey,
      message:
        'Guest mode: read-only. Do not access or summarize emails or private data. Do not assume the guest is the admin. Ask for their name if needed. You may assist with general questions and basic home automation (lights, climate, scenes).',
      label: 'Guest policy'
    });
  }
}

const client = new GatewayClient();

// UI actions

elements.disconnectBtn.addEventListener('click', () => client.disconnect());

elements.chatBtn.addEventListener('click', () => {
  sendChat();
});

elements.chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendChat();
  }
});

elements.attachBtn.addEventListener('click', () => {
  elements.fileInput.click();
});

elements.fileInput.addEventListener('change', (event) => {
  handleFileSelection(event);
});

function openSettings() {
  elements.settingsModal.classList.add('open');
  elements.settingsModal.setAttribute('aria-hidden', 'false');
  if (roleState.role === 'admin') {
    loadGuestPrompt();
  }
}

function closeSettings() {
  elements.settingsModal.classList.remove('open');
  elements.settingsModal.setAttribute('aria-hidden', 'true');
}

async function loadGuestPrompt() {
  if (!elements.guestPrompt) return;
  elements.guestPromptStatus.textContent = '';
  try {
    const res = await fetch('/config/guest-prompt', { credentials: 'include' });
    if (!res.ok) {
      elements.guestPromptStatus.textContent = 'Unable to load guest prompt.';
      return;
    }
    const data = await res.json();
    elements.guestPrompt.value = data.prompt || '';
  } catch (err) {
    elements.guestPromptStatus.textContent = 'Unable to load guest prompt.';
  }
}

async function saveGuestPrompt() {
  if (!elements.guestPrompt) return;
  const prompt = elements.guestPrompt.value.trim();
  elements.guestPromptStatus.textContent = '';
  try {
    const res = await fetch('/config/guest-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      elements.guestPromptStatus.textContent = 'Failed to save guest prompt.';
      return;
    }
    elements.guestPromptStatus.textContent = 'Guest prompt saved.';
  } catch (err) {
    elements.guestPromptStatus.textContent = 'Failed to save guest prompt.';
  }
}

elements.settingsBtn.addEventListener('click', () => openSettings());
elements.settingsCloseBtn.addEventListener('click', () => closeSettings());
elements.settingsModal.addEventListener('click', (event) => {
  if (event.target === elements.settingsModal) closeSettings();
});
elements.saveGuestPromptBtn.addEventListener('click', () => saveGuestPrompt());

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeSettings();
});

async function sendChat() {
  const message = elements.chatInput.value.trim();
  if (!message) return;
  if (!uiState.connected || !uiState.authed) {
    addChatMessage({
      role: 'assistant',
      text: 'Not connected. Please sign in again and wait for the gateway connection.',
      persist: false
    });
    return;
  }
  if (roleState.role === 'guest') {
    const lower = message.toLowerCase();
    if (lower.includes('email') || lower.includes('gmail') || lower.includes('inbox')) {
      addChatMessage({
        role: 'assistant',
        text: 'Guest mode is read-only and cannot access emails. Try a home automation request instead.',
        persist: false
      });
      elements.chatInput.value = '';
      return;
    }
  }
  const command = message.toLowerCase();
  if (command === '/clear' || command === '/new') {
    clearChatHistory();
    elements.chatInput.value = '';
    addFeed('event', 'chat', 'chat history cleared');
    return;
  }
  const sessionKey = getSessionKey(roleState.channel);
  const uploaded = await uploadAttachments();
  let attachmentText = '';
  if (uploaded.length > 0) {
    const lines = uploaded.map((file) => {
      if (file.type && file.type.startsWith('image/')) {
        return `![${file.name}](${file.url})`;
      }
      return `[${file.name}](${file.url})`;
    });
    attachmentText = `\n\nAttachments:\n- ${lines.join('\n- ')}`;
  }
  addChatMessage({ role: 'user', text: message });
  scrollState.pinned = true;
  scrollToBottom(elements.chatThread, true);
  triggerFiring(1.6, 3);
  client.request('chat.send', {
    sessionKey,
    message: `${message}${attachmentText}`,
    deliver: true,
    idempotencyKey: randomId()
  });
  elements.chatInput.value = '';
}

window.addEventListener('load', () => {
  const savedChannel = storage.get('clawnsole.channel', 'admin');
  elements.channelSelect.value = savedChannel;
  roleState.channel = savedChannel;
  fetchRole().then((role) => {
    if (!role) {
      showLogin();
      return;
    }
    setAuthState(true);
    setRole(role);
    fetchMeta().finally(() => client.connect());
  });
  elements.chatThread.addEventListener('scroll', () => {
    scrollState.pinned = isNearBottom(elements.chatThread);
  });
  elements.chatInput.focus();
  elements.chatInput.select();
});

if (elements.channelSelect) {
  elements.channelSelect.addEventListener('change', (event) => {
    const value = event.target.value === 'guest' ? 'guest' : 'admin';
    if (value !== roleState.role) {
      showLogin('Switch roles by signing in again.');
      elements.channelSelect.value = roleState.role;
      return;
    }
    setChannel(value);
  });
}

elements.loginBtn.addEventListener('click', () => attemptLogin());

elements.loginPassword.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    attemptLogin();
  }
});

elements.logoutBtn.addEventListener('click', async () => {
  try {
    await fetch('/auth/logout', { method: 'POST' });
  } catch (err) {
    // ignore logout errors
  }
  client.disconnect();
  setRole('guest');
  showLogin();
});
