const globalElements = {
  wsUrl: document.getElementById('wsUrl'),
  clientId: document.getElementById('clientId'),
  deviceId: document.getElementById('deviceId'),
  guestPrompt: document.getElementById('guestPrompt'),
  saveGuestPromptBtn: document.getElementById('saveGuestPromptBtn'),
  guestPromptStatus: document.getElementById('guestPromptStatus'),
  disconnectBtn: document.getElementById('disconnectBtn'),
  status: document.getElementById('connectionStatus'),
  statusMeta: document.getElementById('statusMeta'),
  pulseCanvas: document.getElementById('pulseCanvas'),
  workqueueBtn: document.getElementById('workqueueBtn'),
  workqueueModal: document.getElementById('workqueueModal'),
  workqueueCloseBtn: document.getElementById('workqueueCloseBtn'),
  wqQueueSelect: document.getElementById('wqQueueSelect'),
  wqStatusFilters: document.getElementById('wqStatusFilters'),
  wqRefreshBtn: document.getElementById('wqRefreshBtn'),
  wqListBody: document.getElementById('wqListBody'),
  wqListEmpty: document.getElementById('wqListEmpty'),
  wqInspectBody: document.getElementById('wqInspectBody'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  settingsCloseBtn: document.getElementById('settingsCloseBtn'),
  rolePill: document.getElementById('rolePill'),
  loginOverlay: document.getElementById('loginOverlay'),
  loginRole: document.getElementById('loginRole'),
  loginPassword: document.getElementById('loginPassword'),
  loginBtn: document.getElementById('loginBtn'),
  loginError: document.getElementById('loginError'),
  logoutBtn: document.getElementById('logoutBtn'),
  paneControls: document.getElementById('paneControls'),
  addPaneBtn: document.getElementById('addPaneBtn'),
  layoutSelect: document.getElementById('layoutSelect'),
  paneGrid: document.getElementById('paneGrid'),
  paneTemplate: document.getElementById('paneTemplate')
};

function getRouteRole() {
  try {
    const path = window.location.pathname || '/';
    if (path === '/admin' || path.startsWith('/admin/')) return 'admin';
    if (path === '/guest' || path.startsWith('/guest/')) return 'guest';
  } catch {}
  return null;
}

const routeRole = getRouteRole();

function installViewportVhVar() {
  const setVh = () => {
    const vv = window.visualViewport;
    const height = vv ? vv.height : window.innerHeight;
    const offsetTop = vv ? vv.offsetTop : 0;
    document.documentElement.style.setProperty('--app-height', `${Math.max(1, Math.floor(height))}px`);
    document.documentElement.style.setProperty('--app-offset-top', `${Math.max(0, Math.floor(offsetTop))}px`);
  };

  setVh();
  window.addEventListener('resize', setVh);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setVh);
  }
}

installViewportVhVar();

const storage = {
  get(key, fallback = '') {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  },
  set(key, value) {
    localStorage.setItem(key, value);
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

const roleState = {
  role: null,
  guestPolicyInjected: false
};

const uiState = {
  authed: false,
  meta: {},
  agents: []
};

const commandList = [
  { command: '/clear', description: 'Clear local chat history' },
  { command: '/new', description: 'Reset the remote session + clear local history' }
];

// Local retention cap (per agent + role). Prevents localStorage from growing unbounded.
// Note: this is a message count cap (not tokens/bytes).
const MAX_CHAT_HISTORY = 400;

function randomId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {}
  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
}

function initDeviceId() {
  const existing = storage.get('clawnsole.deviceId');
  if (existing) return existing;
  const id = `clawnsole-${randomId()}`;
  storage.set('clawnsole.deviceId', id);
  return id;
}

function initTabId() {
  try {
    const existing = sessionStorage.getItem('clawnsole.tabId');
    if (existing) return existing;
    const id = `t${randomId().slice(0, 8)}`;
    sessionStorage.setItem('clawnsole.tabId', id);
    return id;
  } catch {
    return `t${randomId().slice(0, 8)}`;
  }
}

let TAB_ID = initTabId();
const PAGE_ID = `p${randomId().slice(0, 10)}`;
const PAGE_STARTED_AT = Date.now();

function ensureUniqueTabId() {
  if (typeof BroadcastChannel === 'undefined') return;
  let channel;
  try {
    channel = new BroadcastChannel('clawnsole.tabs.v1');
  } catch {
    return;
  }

  const onMessage = (event) => {
    const msg = event?.data || null;
    if (!msg || msg.type !== 'hello') return;
    if (msg.tabId !== TAB_ID) return;
    if (msg.pageId === PAGE_ID) return;

    // Duplicated tabs can copy sessionStorage. If we detect another live page with our tabId,
    // the newer page should generate a new tab id and reload, avoiding connection fights.
    const otherStartedAt = Number(msg.startedAt || 0);
    const weAreNewer = otherStartedAt && otherStartedAt < PAGE_STARTED_AT;
    if (!weAreNewer) return;

    TAB_ID = `t${randomId().slice(0, 8)}`;
    try {
      sessionStorage.setItem('clawnsole.tabId', TAB_ID);
    } catch {}

    try {
      channel.removeEventListener('message', onMessage);
      channel.close();
    } catch {}

    // Apply new session keys/client.instanceId before attempting any gateway connect.
    window.location.reload();
  };

  channel.addEventListener('message', onMessage);

  try {
    channel.postMessage({ type: 'hello', tabId: TAB_ID, pageId: PAGE_ID, startedAt: PAGE_STARTED_AT });
  } catch {}

  window.addEventListener('beforeunload', () => {
    try {
      channel.removeEventListener('message', onMessage);
      channel.close();
    } catch {}
  });
}

ensureUniqueTabId();

globalElements.deviceId.value = initDeviceId();
let cachedToken = '';
let metaPromise = null;

function addFeed(type, label, payload) {
  const record = { type, label, payload };
  if (type === 'err') {
    console.error('[clawnsole]', record);
  } else {
    console.log('[clawnsole]', record);
  }
}

async function fetchToken() {
  try {
    const res = await fetch('/token', { credentials: 'include', cache: 'no-store' });
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

async function fetchRoleState() {
  try {
    const res = await fetch('/auth/role', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return { reachable: true, role: null };
    const data = await res.json();
    if (data.role === 'admin') return { reachable: true, role: 'admin' };
    if (data.role === 'guest') return { reachable: true, role: 'guest' };
    return { reachable: true, role: null };
  } catch {
    return { reachable: false, role: null };
  }
}

async function fetchRole() {
  const { reachable, role } = await fetchRoleState();
  if (!reachable) return null;
  return role;
}

async function fetchMeta() {
  try {
    const res = await fetch('/meta', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.wsUrl) {
      globalElements.wsUrl.value = data.wsUrl;
      uiState.meta = data;
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

async function ensureMetaLoaded() {
  if (metaPromise) return metaPromise;
  metaPromise = fetchMeta().then(() => {});
  return metaPromise;
}

async function fetchAgents() {
  try {
    const res = await fetch('/agents', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data.agents) ? data.agents : [];
    return list
      .map((agent) => ({
        id: typeof agent?.id === 'string' ? agent.id : '',
        name: typeof agent?.name === 'string' ? agent.name : '',
        displayName: typeof agent?.displayName === 'string' ? agent.displayName : '',
        emoji: typeof agent?.emoji === 'string' ? agent.emoji : ''
      }))
      .filter((agent) => agent.id);
  } catch {
    return [];
  }
}

function formatAgentLabel(agent, { includeId = true } = {}) {
  if (!agent) return 'main';
  const id = typeof agent.id === 'string' ? agent.id : '';
  const name = (typeof agent.displayName === 'string' && agent.displayName.trim()) ||
    (typeof agent.name === 'string' && agent.name.trim()) ||
    id ||
    'main';
  const emoji = typeof agent.emoji === 'string' ? agent.emoji.trim() : '';
  // Treat identity emojis as "signatures" (suffix) rather than prefixes.
  const base = emoji ? `${name} ${emoji}` : name;
  if (!includeId) return base;
  if (id && id !== name) return `${base} (${id})`;
  return base;
}

function getAgentRecord(agentId) {
  const id = typeof agentId === 'string' && agentId.trim() ? agentId.trim() : 'main';
  const found = uiState.agents.find((agent) => agent.id === id);
  if (found) return found;
  return { id, name: id, displayName: '', emoji: '' };
}

function normalizeAgentId(candidate) {
  if (typeof candidate !== 'string') return 'main';
  const trimmed = candidate.trim();
  if (!trimmed) return 'main';
  if (uiState.agents.length === 0) return trimmed;
  const exists = uiState.agents.some((agent) => agent.id === trimmed);
  return exists ? trimmed : 'main';
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

function computeGatewayTarget(kind) {
  const key = kind === 'guest' ? 'guestWsUrl' : 'adminWsUrl';
  const proxyUrl = uiState.meta && uiState.meta[key] ? uiState.meta[key] : '';
  const usingProxy = Boolean(proxyUrl);
  const rawUrl = proxyUrl || globalElements.wsUrl.value.trim();
  return { url: resolveWsUrl(rawUrl), usingProxy };
}

async function prepareGateway(kind) {
  await ensureMetaLoaded();
  const { usingProxy } = computeGatewayTarget(kind);
  if (!usingProxy) {
    if (!cachedToken) await fetchToken();
    if (!cachedToken) throw new Error('missing gateway token');
  }
}

function setStatusPill(el, state, meta = '') {
  if (!el) return;
  el.textContent = state;
  el.classList.remove('connected', 'error', 'working');
  if (state === 'connected') el.classList.add('connected');
  if (state === 'error') el.classList.add('error');
  if (state === 'connecting' || state === 'reconnecting' || state === 'offline') {
    el.classList.add('working');
  }
  el.title = meta || '';
}

function updateGlobalStatus() {
  const panes = paneManager.panes;
  if (!uiState.authed) {
    setStatusPill(globalElements.status, 'disconnected', 'sign in required');
    if (globalElements.statusMeta) globalElements.statusMeta.textContent = 'sign in required';
    return;
  }
  if (panes.length === 0) {
    setStatusPill(globalElements.status, 'disconnected', '');
    if (globalElements.statusMeta) globalElements.statusMeta.textContent = '';
    return;
  }

  const connectedCount = panes.filter((pane) => pane.connected).length;
  const total = panes.length;
  const anyConnecting = panes.some((pane) => pane.statusState === 'connecting' || pane.statusState === 'reconnecting');
  const anyError = panes.some((pane) => pane.statusState === 'error');
  const firstError = panes.find((pane) => pane.statusState === 'error' && pane.statusMeta);

  let state = 'disconnected';
  if (connectedCount === total) {
    state = 'connected';
  } else if (connectedCount > 0 || anyConnecting) {
    state = 'reconnecting';
  } else if (anyError) {
    state = 'error';
  }

  const meta =
    connectedCount === 0 && anyError && firstError
      ? firstError.statusMeta
      : `panes: ${connectedCount}/${total} connected`;
  setStatusPill(globalElements.status, state, meta);
  if (globalElements.statusMeta) globalElements.statusMeta.textContent = meta;
}

function updateConnectionControls() {
  if (!globalElements.disconnectBtn) return;
  globalElements.disconnectBtn.disabled = !uiState.authed;
  if (!uiState.authed) {
    globalElements.disconnectBtn.textContent = 'Reconnect';
    return;
  }
  const anyActive = paneManager.panes.some((pane) =>
    pane.statusState === 'connected' || pane.statusState === 'connecting' || pane.statusState === 'reconnecting'
  );
  globalElements.disconnectBtn.textContent = anyActive ? 'Disconnect' : 'Reconnect';
}

function setAuthState(authed) {
  uiState.authed = authed;
  updateGlobalStatus();
  updateConnectionControls();
  paneManager.refreshChatEnabled();
  if (globalElements.logoutBtn) {
    globalElements.logoutBtn.disabled = !authed;
    globalElements.logoutBtn.style.opacity = authed ? '1' : '0.5';
  }
}

function setRole(role) {
  roleState.role = role;
  if (globalElements.rolePill) {
    globalElements.rolePill.textContent = role;
    globalElements.rolePill.classList.toggle('admin', role === 'admin');
  }
  if (role === 'guest') {
    roleState.guestPolicyInjected = false;
    globalElements.settingsBtn?.setAttribute('disabled', 'disabled');
    if (globalElements.settingsBtn) globalElements.settingsBtn.style.opacity = '0.5';
  } else {
    globalElements.settingsBtn?.removeAttribute('disabled');
    if (globalElements.settingsBtn) globalElements.settingsBtn.style.opacity = '1';
  }

  if (globalElements.paneControls) {
    globalElements.paneControls.hidden = role !== 'admin';
  }
  if (globalElements.workqueueBtn) {
    globalElements.workqueueBtn.hidden = role !== 'admin';
    globalElements.workqueueBtn.disabled = role !== 'admin';
    globalElements.workqueueBtn.style.opacity = role === 'admin' ? '1' : '0.5';
  }
}

function showLogin(message = '') {
  globalElements.loginOverlay.classList.add('open');
  globalElements.loginOverlay.setAttribute('aria-hidden', 'false');
  globalElements.loginError.textContent = message;
  globalElements.loginPassword.value = '';

  if (routeRole === 'admin' || routeRole === 'guest') {
    globalElements.loginRole.value = routeRole;
    globalElements.loginRole.disabled = true;
  } else {
    globalElements.loginRole.disabled = false;
    const savedRole = storage.get('clawnsole.auth.role', '');
    if (savedRole === 'admin' || savedRole === 'guest') {
      globalElements.loginRole.value = savedRole;
    }
  }

  setAuthState(false);
  if (globalElements.rolePill) {
    globalElements.rolePill.textContent = 'signed out';
    globalElements.rolePill.classList.remove('admin');
  }
  globalElements.settingsBtn?.setAttribute('disabled', 'disabled');
  if (globalElements.settingsBtn) globalElements.settingsBtn.style.opacity = '0.5';

  const isTouch = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (!isTouch) {
    globalElements.loginPassword.focus();
  }
}

function hideLogin() {
  globalElements.loginOverlay.classList.remove('open');
  globalElements.loginOverlay.setAttribute('aria-hidden', 'true');
  globalElements.loginError.textContent = '';
  setAuthState(true);
}

async function attemptLogin() {
  const role = globalElements.loginRole.value === 'admin' ? 'admin' : 'guest';
  const password = globalElements.loginPassword.value.trim();
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
    const nextRole = data.role === 'admin' ? 'admin' : 'guest';
    storage.set('clawnsole.auth.role', nextRole);
    window.location.replace(nextRole === 'admin' ? '/admin' : '/guest');
  } catch {
    showLogin('Login failed. Please retry.');
  }
}

function openSettings() {
  globalElements.settingsModal.classList.add('open');
  globalElements.settingsModal.setAttribute('aria-hidden', 'false');
  if (roleState.role === 'admin') {
    loadGuestPrompt();
  }
}

function closeSettings() {
  globalElements.settingsModal.classList.remove('open');
  globalElements.settingsModal.setAttribute('aria-hidden', 'true');
}

// Workqueue (admin-only)

const WORKQUEUE_STATUSES = ['ready', 'pending', 'claimed', 'in_progress', 'done', 'failed'];

const workqueueState = {
  queues: [],
  selectedQueue: '',
  statusFilter: new Set(['ready', 'pending', 'claimed', 'in_progress']),
  items: [],
  selectedItemId: null,
  leaseTicker: null
};

function openWorkqueue() {
  if (roleState.role !== 'admin') return;
  globalElements.workqueueModal?.classList.add('open');
  globalElements.workqueueModal?.setAttribute('aria-hidden', 'false');
  ensureWorkqueueBootstrapped();
}

function closeWorkqueue() {
  globalElements.workqueueModal?.classList.remove('open');
  globalElements.workqueueModal?.setAttribute('aria-hidden', 'true');
}

function fmtRemaining(msUntil) {
  if (!Number.isFinite(msUntil)) return '';
  if (msUntil <= 0) return 'expired';
  const sec = Math.floor(msUntil / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  if (hr > 0) return `${hr}h ${min % 60}m`;
  if (min > 0) return `${min}m ${sec % 60}s`;
  return `${sec}s`;
}

function renderWorkqueueStatusFilters() {
  const root = globalElements.wqStatusFilters;
  if (!root) return;
  root.innerHTML = '';
  for (const s of WORKQUEUE_STATUSES) {
    const id = `wq-status-${s}`;
    const label = document.createElement('label');
    label.className = 'wq-status-chip';
    label.innerHTML = `<input type="checkbox" id="${id}" ${workqueueState.statusFilter.has(s) ? 'checked' : ''} /> <span>${escapeHtml(s)}</span>`;
    const checkbox = label.querySelector('input');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) workqueueState.statusFilter.add(s);
      else workqueueState.statusFilter.delete(s);
      fetchAndRenderWorkqueueItems();
    });
    root.appendChild(label);
  }
}

async function ensureWorkqueueBootstrapped() {
  renderWorkqueueStatusFilters();
  await fetchWorkqueueQueues();
  await fetchAndRenderWorkqueueItems();
  startWorkqueueLeaseTicker();
}

async function fetchWorkqueueQueues() {
  if (!globalElements.wqQueueSelect) return;
  try {
    const res = await fetch('/api/workqueue/queues', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const queues = Array.isArray(data.queues) ? data.queues : [];
    workqueueState.queues = queues;

    const select = globalElements.wqQueueSelect;
    const prev = workqueueState.selectedQueue || select.value || '';
    select.innerHTML = '';

    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = '(all queues)';
    select.appendChild(allOpt);

    for (const q of queues) {
      const opt = document.createElement('option');
      opt.value = q;
      opt.textContent = q;
      select.appendChild(opt);
    }

    if (prev && queues.includes(prev)) {
      select.value = prev;
      workqueueState.selectedQueue = prev;
    } else {
      select.value = '';
      workqueueState.selectedQueue = '';
    }
  } catch (err) {
    addFeed('err', 'workqueue', `failed to load queues: ${String(err)}`);
  }
}

async function fetchAndRenderWorkqueueItems() {
  if (!globalElements.wqListBody) return;
  const queue = (workqueueState.selectedQueue || '').trim();
  const statuses = Array.from(workqueueState.statusFilter);
  const params = new URLSearchParams();
  if (queue) params.set('queue', queue);
  if (statuses.length) params.set('status', statuses.join(','));
  const url = `/api/workqueue/items${params.toString() ? `?${params.toString()}` : ''}`;

  try {
    const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    workqueueState.items = items;
    renderWorkqueueItems();
  } catch (err) {
    addFeed('err', 'workqueue', `failed to load items: ${String(err)}`);
  }
}

function renderWorkqueueItems() {
  const body = globalElements.wqListBody;
  if (!body) return;
  body.innerHTML = '';

  if (!workqueueState.items.length) {
    globalElements.wqListEmpty.hidden = false;
  } else {
    globalElements.wqListEmpty.hidden = true;
  }

  const now = Date.now();
  for (const it of workqueueState.items) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'wq-row';
    if (it.id && it.id === workqueueState.selectedItemId) row.classList.add('selected');

    const leaseMs = it.leaseUntil ? Number(it.leaseUntil) - now : NaN;
    const leaseLabel = it.leaseUntil ? fmtRemaining(leaseMs) : '';

    row.innerHTML = `
      <div class="wq-col title">${escapeHtml(String(it.title || ''))}</div>
      <div class="wq-col status">${escapeHtml(String(it.status || ''))}</div>
      <div class="wq-col prio">${escapeHtml(String(it.priority ?? ''))}</div>
      <div class="wq-col attempts">${escapeHtml(String(it.attempts ?? ''))}</div>
      <div class="wq-col claimedBy">${escapeHtml(String(it.claimedBy || ''))}</div>
      <div class="wq-col lease" data-lease-until="${escapeHtml(String(it.leaseUntil || ''))}">${escapeHtml(leaseLabel)}</div>
    `;

    row.addEventListener('click', () => {
      workqueueState.selectedItemId = it.id || null;
      renderWorkqueueItems();
      renderWorkqueueInspect(it);
    });

    body.appendChild(row);
  }
}

function renderWorkqueueInspect(item) {
  const root = globalElements.wqInspectBody;
  if (!root) return;
  if (!item) {
    root.innerHTML = '<div class="hint">Select an item to inspect.</div>';
    return;
  }
  const kv = (k, v) => `<div class="wq-kv"><div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(String(v ?? ''))}</div></div>`;
  root.innerHTML = `
    <div class="wq-inspect-meta">
      ${kv('id', item.id)}
      ${kv('queue', item.queue)}
      ${kv('status', item.status)}
      ${kv('priority', item.priority)}
      ${kv('attempts', item.attempts)}
      ${kv('claimedBy', item.claimedBy)}
      ${kv('leaseUntil', item.leaseUntil ? new Date(Number(item.leaseUntil)).toISOString() : '')}
      ${kv('updatedAt', item.updatedAt || '')}
    </div>
    <div class="wq-inspect-block">
      <div class="wq-inspect-label">Title</div>
      <div class="wq-inspect-pre">${escapeHtml(String(item.title || ''))}</div>
    </div>
    <div class="wq-inspect-block">
      <div class="wq-inspect-label">Instructions</div>
      <pre class="wq-inspect-pre">${escapeHtml(String(item.instructions || ''))}</pre>
    </div>
    ${item.lastError ? `<div class="wq-inspect-block"><div class="wq-inspect-label">Last error</div><pre class="wq-inspect-pre">${escapeHtml(String(item.lastError))}</pre></div>` : ''}
  `;
}

function startWorkqueueLeaseTicker() {
  if (workqueueState.leaseTicker) return;
  workqueueState.leaseTicker = setInterval(() => {
    if (!globalElements.workqueueModal || !globalElements.workqueueModal.classList.contains('open')) return;
    const now = Date.now();
    document.querySelectorAll('.wq-col.lease[data-lease-until]').forEach((el) => {
      const raw = el.getAttribute('data-lease-until') || '';
      const until = Number(raw);
      if (!until) return;
      el.textContent = fmtRemaining(until - now);
    });
  }, 1000);
}

async function loadGuestPrompt() {
  if (!globalElements.guestPrompt) return;
  globalElements.guestPromptStatus.textContent = '';
  try {
    const res = await fetch('/config/guest-prompt', { credentials: 'include' });
    if (!res.ok) {
      globalElements.guestPromptStatus.textContent = 'Unable to load guest prompt.';
      return;
    }
    const data = await res.json();
    globalElements.guestPrompt.value = data.prompt || '';
  } catch {
    globalElements.guestPromptStatus.textContent = 'Unable to load guest prompt.';
  }
}

async function saveGuestPrompt() {
  if (!globalElements.guestPrompt) return;
  const prompt = globalElements.guestPrompt.value.trim();
  globalElements.guestPromptStatus.textContent = '';
  try {
    const res = await fetch('/config/guest-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      globalElements.guestPromptStatus.textContent = 'Failed to save guest prompt.';
      return;
    }
    globalElements.guestPromptStatus.textContent = 'Guest prompt saved.';
  } catch {
    globalElements.guestPromptStatus.textContent = 'Failed to save guest prompt.';
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

  // Auto-link bare http(s) URLs (keep simple; text is already HTML-escaped).
  // Avoid matching inside existing href/src attributes by only targeting plain text contexts.
  html = html.replace(
    /(^|[\s(\[])(https?:\/\/[^\s<)\]]+)/g,
    (match, prefix, url) => `${prefix}<a href="${url}" target="_blank" rel="noopener">${url}</a>`
  );

  html = html.replace(/\n- (.+)/g, '<ul><li>$1</li></ul>');
  html = html.replace(/<\/ul>\n<ul>/g, '');
  html = html.replace(/\n\d+\. (.+)/g, '<ol><li>$1</li></ol>');
  html = html.replace(/<\/ol>\n<ol>/g, '');
  html = html.replace(/\n/g, '<br />');

  return html;
}

function extractChatText(message) {
  if (!message) return '';
  if (typeof message === 'string') return message;
  if (typeof message.text === 'string') return message.text;
  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => {
        if (!part) return '';
        if (typeof part.text === 'string') return part.text;

        // Common structured content shapes (OpenAI-style, etc.)
        const type = typeof part.type === 'string' ? part.type : '';
        if (type === 'image_url' && typeof part.image_url?.url === 'string') {
          return `\n\n![](${part.image_url.url})\n\n`;
        }
        if (type === 'image' && typeof part.url === 'string') {
          return `\n\n![](${part.url})\n\n`;
        }
        if ((type === 'file' || type === 'attachment') && typeof part.url === 'string') {
          const name = typeof part.name === 'string' ? part.name : 'attachment';
          return `\n\n[${name}](${part.url})\n\n`;
        }

        // Fallback: if a part has a url, at least render a link.
        if (typeof part.url === 'string') {
          return `\n\n${part.url}\n\n`;
        }
        return '';
      })
      .filter(Boolean)
      .join('');
  }
  return '';
}

function normalizeHistoryEntries(payload) {
  // Support multiple possible gateway shapes.
  // Expected output: [{ role: 'user'|'assistant'|'system', text: string }]
  if (!payload) return [];

  const candidates =
    payload.messages ||
    payload.history ||
    payload.items ||
    payload.entries ||
    payload.chat ||
    payload;

  if (!Array.isArray(candidates)) return [];

  return candidates
    .map((item) => {
      const roleRaw =
        item?.role ||
        item?.author ||
        item?.speaker ||
        item?.type ||
        (item?.isAssistant ? 'assistant' : item?.isUser ? 'user' : null);
      const role = String(roleRaw || '').toLowerCase();
      const normalizedRole = role.includes('assistant') ? 'assistant' : role.includes('user') ? 'user' : role || 'assistant';
      const text = extractChatText(item?.message ?? item?.content ?? item?.text ?? item);
      return { role: normalizedRole, text: String(text || '') };
    })
    .filter((entry) => entry.text);
}

function paneGetLastLocalText(pane, role) {
  for (let i = pane.chat.history.length - 1; i >= 0; i -= 1) {
    const entry = pane.chat.history[i];
    if (!entry) continue;
    if (role && entry.role !== role) continue;
    if (typeof entry.text === 'string' && entry.text.trim()) return entry.text;
  }
  return '';
}

async function paneFetchRemoteHistory(pane) {
  try {
    const res = await pane.client.request('chat.history', { sessionKey: pane.sessionKey() });
    if (!res?.ok) return [];
    return normalizeHistoryEntries(res.payload);
  } catch {
    return [];
  }
}

function paneApplyRemoteCatchUp(pane, remoteEntries) {
  if (!Array.isArray(remoteEntries) || remoteEntries.length === 0) return { applied: false, foundAssistant: false };

  const lastUser = paneGetLastLocalText(pane, 'user');
  const lastAssistant = paneGetLastLocalText(pane, 'assistant');

  // Find where the last local user message appears remotely, then take assistant messages after it.
  let startIdx = -1;
  if (lastUser) {
    for (let i = remoteEntries.length - 1; i >= 0; i -= 1) {
      const entry = remoteEntries[i];
      if (entry.role === 'user' && entry.text.trim() === lastUser.trim()) {
        startIdx = i;
        break;
      }
    }
  }

  const tail = startIdx >= 0 ? remoteEntries.slice(startIdx + 1) : remoteEntries;
  const assistantTail = tail.filter((e) => e.role === 'assistant' && e.text.trim());
  const foundAssistant = assistantTail.length > 0;

  let applied = false;
  assistantTail.forEach((entry) => {
    if (lastAssistant && entry.text.trim() === lastAssistant.trim()) return;
    // Avoid duplicating if we already have this exact text at the end.
    const currentLastAssistant = paneGetLastLocalText(pane, 'assistant');
    if (currentLastAssistant && currentLastAssistant.trim() === entry.text.trim()) return;
    paneAddChatMessage(pane, { role: 'assistant', text: entry.text, persist: true });
    applied = true;
  });

  if (applied) {
    paneStopThinking(pane);
    pane.pendingSend = null;
  }

  return { applied, foundAssistant };
}

function paneScheduleCatchUp(pane, { attempts = 3, delayMs = 1500 } = {}) {
  if (!pane.pendingSend && !pane.thinking.active) return;
  if (pane.catchUp?.active) return;

  pane.catchUp = {
    active: true,
    attemptsLeft: Math.max(1, attempts),
    timer: null
  };

  const tick = async () => {
    if (!pane.connected || !uiState.authed) {
      pane.catchUp.active = false;
      return;
    }

    const remote = await paneFetchRemoteHistory(pane);
    const result = paneApplyRemoteCatchUp(pane, remote);

    if (result.applied) {
      pane.catchUp.active = false;
      return;
    }

    pane.catchUp.attemptsLeft -= 1;
    if (pane.catchUp.attemptsLeft <= 0) {
      // Auto-recover: if we never saw an assistant message after reconnect, resend the in-flight message once.
      // Uses the same idempotencyKey so the gateway can dedupe.
      if (pane.pendingSend && pane.inFlight && !pane.pendingSend.resent) {
        const pending = pane.pendingSend;
        if (pending.sessionKey && pending.sentMessage && pending.idempotencyKey) {
          pending.resent = true;
          // Ensure we show the user that we're still working.
          if (!pane.thinking.active) paneStartThinking(pane);
          pane.client.request('chat.send', {
            sessionKey: pending.sessionKey,
            message: pending.sentMessage,
            deliver: true,
            idempotencyKey: pending.idempotencyKey
          });
        }
      }

      pane.catchUp.active = false;
      return;
    }

    pane.catchUp.timer = setTimeout(tick, delayMs);
  };

  pane.catchUp.timer = setTimeout(tick, 200);
}

const pulse = {
  ctx: globalElements.pulseCanvas.getContext('2d'),
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
    x: Math.random() * globalElements.pulseCanvas.clientWidth,
    y: Math.random() * globalElements.pulseCanvas.clientHeight,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    glow: Math.random() * 0.6 + 0.2
  }));
}

function resizeCanvas() {
  const rect = globalElements.pulseCanvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  globalElements.pulseCanvas.width = rect.width * scale;
  globalElements.pulseCanvas.height = rect.height * scale;
  pulse.width = globalElements.pulseCanvas.width;
  pulse.height = globalElements.pulseCanvas.height;
  pulse.ctx.setTransform(1, 0, 0, 1, 0, 0);
  pulse.ctx.scale(scale, scale);
  initFluxNodes();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function spawnPulse(strength = 1) {
  const x = Math.random() * globalElements.pulseCanvas.clientWidth;
  const y = Math.random() * globalElements.pulseCanvas.clientHeight;
  pulse.pulses.push({
    x,
    y,
    r: 20,
    alpha: 0.8,
    strength,
    hue: Math.random() * 60 + 20
  });
}

function renderPulse() {
  const ctx = pulse.ctx;
  ctx.clearRect(0, 0, pulse.width, pulse.height);
  ctx.fillStyle = 'rgba(12, 15, 20, 0.24)';
  ctx.fillRect(0, 0, pulse.width, pulse.height);

  const maxDist = 140;
  pulse.nodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < 0 || node.x > globalElements.pulseCanvas.clientWidth) node.vx *= -1;
    if (node.y < 0 || node.y > globalElements.pulseCanvas.clientHeight) node.vy *= -1;
  });

  for (let i = 0; i < pulse.nodes.length; i += 1) {
    const a = pulse.nodes[i];
    for (let j = i + 1; j < pulse.nodes.length; j += 1) {
      const b = pulse.nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.26;
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

// Panes

const ADMIN_PANES_KEY = 'clawnsole.admin.panes.v1';
// Layout is inferred from pane count; no manual layout toggle.
const ADMIN_DEFAULT_AGENT_KEY = 'clawnsole.admin.agentId';

function computeBaseDeviceLabel() {
  const base = globalElements.deviceId.value.trim() || 'device';
  return TAB_ID ? `${base}-${TAB_ID}` : base;
}

function computeSessionKey({ role, agentId, paneKey }) {
  const baseDeviceLabel = computeBaseDeviceLabel();
  if (role === 'guest') {
    const guestAgent = uiState.meta.guestAgentId || 'clawnsole-guest';
    return `agent:${guestAgent}:guest:${baseDeviceLabel}`;
  }
  const resolvedAgent = normalizeAgentId(agentId || 'main');
  const deviceLabel = paneKey ? `${baseDeviceLabel}-${paneKey}` : baseDeviceLabel;
  return `agent:${resolvedAgent}:admin:${deviceLabel}`;
}

function computeChatKey({ role, agentId }) {
  if (role === 'guest') {
    const guestAgent = uiState.meta.guestAgentId || 'clawnsole-guest';
    return `agent:${guestAgent}:guest`;
  }
  const resolvedAgent = normalizeAgentId(agentId || 'main');
  return `agent:${resolvedAgent}:admin`;
}

function computeLegacySessionKey({ role, agentId }) {
  const baseDeviceLabel = globalElements.deviceId.value.trim() || 'device';
  if (role === 'guest') {
    const guestAgent = uiState.meta.guestAgentId || 'clawnsole-guest';
    return `agent:${guestAgent}:guest:${baseDeviceLabel}`;
  }
  const resolvedAgent = normalizeAgentId(agentId || 'main');
  return `agent:${resolvedAgent}:admin:${baseDeviceLabel}`;
}

function computeConnectClient({ role, paneKey }) {
  const baseDeviceLabel = computeBaseDeviceLabel();
  const baseClientId = globalElements.clientId.value.trim() || 'webchat-ui';
  if (role === 'admin') {
    const suffix = paneKey ? `-${paneKey}` : '';
    return {
      // OpenClaw validates client.id against a schema; keep it stable.
      id: baseClientId,
      version: '0.1.0',
      platform: 'web',
      mode: 'webchat',
      instanceId: `${baseDeviceLabel}${suffix}`
    };
  }
  return {
    id: baseClientId,
    version: '0.1.0',
    platform: 'web',
    mode: 'webchat',
    instanceId: baseDeviceLabel
  };
}

function paneAssistantLabel(pane) {
  const id =
    pane.role === 'guest'
      ? uiState.meta.guestAgentId || 'clawnsole-guest'
      : pane.agentId || 'main';
  const record = getAgentRecord(id);
  return formatAgentLabel(record, { includeId: false });
}

function isNearBottom(container) {
  const threshold = 80;
  return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
}

function scrollToBottom(pane, force = false) {
  const container = pane.elements.thread;
  if (!container) return;
  if (force || pane.scroll.pinned) {
    container.scrollTop = container.scrollHeight;
  }
}

function paneStartThinking(pane) {
  if (pane.thinking.active) return;
  pane.thinking.active = true;
  const label = escapeHtml(paneAssistantLabel(pane));
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble assistant thinking';
  bubble.dataset.chatRole = 'assistant';
  bubble.innerHTML =
    `<div class="chat-meta">${label}</div><div class="chat-text"><span class="thinking-text">Thinking</span><span class="thinking-dots">...</span></div>`;
  pane.elements.thread.appendChild(bubble);
  pane.thinking.bubble = bubble;
  pane.scroll.pinned = true;
  scrollToBottom(pane, true);

  let dotCount = 0;
  pane.thinking.dotsTimer = setInterval(() => {
    if (!pane.thinking.bubble) return;
    dotCount = (dotCount + 1) % 4;
    const dots = pane.thinking.bubble.querySelector('.thinking-dots');
    if (dots) {
      dots.textContent = '.'.repeat(dotCount || 1);
    }
  }, 450);

  pane.thinking.timer = setInterval(() => {
    triggerFiring(1.4, 2);
  }, 900);
}

function paneStopThinking(pane) {
  pane.thinking.active = false;
  if (pane.thinking.timer) {
    clearInterval(pane.thinking.timer);
    pane.thinking.timer = null;
  }
  if (pane.thinking.dotsTimer) {
    clearInterval(pane.thinking.dotsTimer);
    pane.thinking.dotsTimer = null;
  }
  if (pane.thinking.bubble) {
    pane.thinking.bubble.remove();
    pane.thinking.bubble = null;
  }
}

function paneLoadChatHistory(pane) {
  try {
    const stableKey = pane.chatKey();
    const stableStorageKey = `clawnsole.chat.history.${stableKey}`;
    const rawStable = localStorage.getItem(stableStorageKey);
    if (rawStable) {
      const data = JSON.parse(rawStable);
      return Array.isArray(data) ? data : [];
    }

    // Migrate older per-session histories (we used to include device/pane/tab suffixes in the key).
    const candidateKeys = [
      `clawnsole.chat.history.${pane.sessionKey()}`,
      `clawnsole.chat.history.${pane.legacySessionKey()}`
    ];
    let best = null;
    for (const storageKey of candidateKeys) {
      const raw = localStorage.getItem(storageKey);
      if (!raw) continue;
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) continue;
      if (!best || data.length > best.length) {
        best = data;
      }
    }
    if (best) {
      localStorage.setItem(stableStorageKey, JSON.stringify(best));
      return best;
    }

    return [];
  } catch (err) {
    addFeed('err', 'chat', `failed to load history: ${String(err)}`);
    return [];
  }
}

function paneEnforceHistoryCap(pane) {
  if (!Number.isFinite(MAX_CHAT_HISTORY) || MAX_CHAT_HISTORY <= 0) return;
  const overflow = pane.chat.history.length - MAX_CHAT_HISTORY;
  if (overflow <= 0) return;

  pane.chat.history.splice(0, overflow);

  // Adjust any in-flight streaming indices so updates don't target the wrong entry.
  for (const run of pane.chat.runs.values()) {
    if (typeof run.index !== 'number') continue;
    run.index -= overflow;
    if (run.index < 0) {
      // The referenced message was evicted.
      run.index = null;
    }
  }
}

function paneSaveChatHistory(pane) {
  try {
    paneEnforceHistoryCap(pane);
    const key = pane.chatKey();
    localStorage.setItem(`clawnsole.chat.history.${key}`, JSON.stringify(pane.chat.history));
  } catch (err) {
    addFeed('err', 'chat', `failed to save history: ${String(err)}`);
  }
}

function paneRestoreChatHistory(pane) {
  pane.chat.runs.forEach((run) => {
    if (run.typeTimer) clearInterval(run.typeTimer);
    if (run.stopTimer) clearTimeout(run.stopTimer);
  });
  pane.chat.history = paneLoadChatHistory(pane);
  pane.elements.thread.innerHTML = '';
  pane.chat.runs.clear();
  pane.chat.history.forEach((entry) => {
    paneAddChatMessage(pane, { role: entry.role, text: entry.text, persist: false });
  });

  // When a pane is restored during startup, it may not be attached to the DOM yet,
  // so scrollHeight can be wrong (0) and we end up stuck at the top after refresh.
  // Do an immediate scroll + a couple deferred passes after layout.
  pane.scroll.pinned = true;
  scrollToBottom(pane, true);
  requestAnimationFrame(() => {
    scrollToBottom(pane, true);
    requestAnimationFrame(() => {
      scrollToBottom(pane, true);
    });
  });
}

function paneClearChatHistory(pane, { wipeStorage = false } = {}) {
  pane.chat.runs.forEach((run) => {
    if (run.typeTimer) clearInterval(run.typeTimer);
    if (run.stopTimer) clearTimeout(run.stopTimer);
  });
  pane.chat.history = [];
  pane.chat.runs.clear();
  pane.elements.thread.innerHTML = '';
  paneStopThinking(pane);
  if (wipeStorage) {
    const keys = new Set([pane.chatKey(), pane.sessionKey(), pane.legacySessionKey()]);
    keys.forEach((key) => {
      try {
        localStorage.removeItem(`clawnsole.chat.history.${key}`);
      } catch {}
    });
  }
}

function paneAddChatMessage(pane, { role, text, runId, streaming = false, persist = true }) {
  const shouldPin = pane.scroll.pinned || isNearBottom(pane.elements.thread);
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}${streaming ? ' streaming' : ''}`;
  bubble.dataset.chatRole = role;
  if (runId) bubble.dataset.runId = String(runId);
  const meta = document.createElement('div');
  meta.className = 'chat-meta';
  meta.textContent = role === 'user' ? 'You' : paneAssistantLabel(pane);
  const body = document.createElement('div');
  body.className = 'chat-text';
  body.innerHTML = renderMarkdown(text || '');
  bubble.appendChild(meta);
  bubble.appendChild(body);
  pane.elements.thread.appendChild(bubble);
  pane.scroll.pinned = shouldPin;
  scrollToBottom(pane);
  if (pane.elements.scrollDownBtn) {
    pane.elements.scrollDownBtn.classList.toggle('visible', !pane.scroll.pinned);
  }

  let index = null;
  if (persist) {
    index = pane.chat.history.length;
    pane.chat.history.push({ role, text, ts: Date.now() });
    paneSaveChatHistory(pane);
    // Recompute index in case the cap evicted older messages.
    index = pane.chat.history.length - 1;
  }
  if (runId) {
    pane.chat.runs.set(runId, { body, index });
  }
}

function paneUpdateChatRun(pane, runId, text, done) {
  const entry = pane.chat.runs.get(runId);
  if (!entry) {
    paneAddChatMessage(pane, { role: 'assistant', text, runId, streaming: !done, persist: done });
    return;
  }
  const shouldPin = pane.scroll.pinned || isNearBottom(pane.elements.thread);
  entry.pendingText = text || '';
  if (entry.revealIndex === undefined) {
    const currentLen = entry.body.textContent ? entry.body.textContent.length : 0;
    entry.revealIndex = Math.min(currentLen, entry.pendingText.length);
    entry.renderedText = entry.pendingText.slice(0, entry.revealIndex);
  }
  entry.targetText = entry.pendingText;
  if (!entry.typeTimer) {
    entry.lastTypeTick = performance.now();
    entry.typeTimer = setInterval(() => {
      const now = performance.now();
      const elapsed = now - entry.lastTypeTick;
      entry.lastTypeTick = now;
      const target = entry.targetText || '';
      const currentIndex = entry.revealIndex || 0;
      if (currentIndex >= target.length) {
        if (!entry.donePending) {
          if (entry.stopTimer) return;
          entry.stopTimer = setTimeout(() => {
            clearInterval(entry.typeTimer);
            entry.typeTimer = null;
            entry.stopTimer = null;
          }, 420);
        }
        return;
      }
      const charsToAdd = Math.max(1, Math.floor((elapsed * 60) / 1000));
      entry.revealIndex = Math.min(target.length, currentIndex + charsToAdd);
      const nextText = target.slice(0, entry.revealIndex);
      if (nextText !== entry.renderedText) {
        entry.renderedText = nextText;
        entry.body.innerHTML = renderMarkdown(nextText);
        if (pane.scroll.pinned || isNearBottom(pane.elements.thread)) {
          pane.scroll.pinned = true;
          scrollToBottom(pane);
        }
      }
      if (entry.revealIndex >= target.length && entry.donePending) {
        clearInterval(entry.typeTimer);
        entry.typeTimer = null;
      }
    }, 36);
  }
  if (entry.stopTimer) {
    clearTimeout(entry.stopTimer);
    entry.stopTimer = null;
  }
  if (entry.index === null || entry.index === undefined) {
    if (done || text) {
      entry.index = pane.chat.history.length;
      pane.chat.history.push({ role: 'assistant', text, ts: Date.now() });
      paneSaveChatHistory(pane);
      // Recompute index in case the cap evicted older messages.
      entry.index = pane.chat.history.length - 1;
    }
  } else {
    pane.chat.history[entry.index] = { role: 'assistant', text, ts: Date.now() };
    paneSaveChatHistory(pane);
  }
  if (done) {
    entry.donePending = true;
    entry.targetText = text || '';
    entry.revealIndex = entry.targetText.length;
    entry.renderedText = entry.targetText;
    entry.body.innerHTML = renderMarkdown(entry.targetText);
    if (entry.stopTimer) {
      clearTimeout(entry.stopTimer);
      entry.stopTimer = null;
    }
    if (entry.typeTimer) {
      clearInterval(entry.typeTimer);
      entry.typeTimer = null;
    }
    entry.body.parentElement?.classList.remove('streaming');
    pane.chat.runs.delete(runId);
    pane.scroll.pinned = shouldPin;
    scrollToBottom(pane);
  } else if (shouldPin) {
    pane.scroll.pinned = true;
    scrollToBottom(pane);
  }
}

function paneRenderAttachments(pane) {
  const list = pane.elements.attachmentList;
  if (!list) return;
  list.innerHTML = '';
  pane.attachments.files.forEach((file, index) => {
    const pill = document.createElement('div');
    pill.className = 'attachment-pill';
    const name = document.createElement('span');
    name.textContent = file.name;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '✕';
    remove.addEventListener('click', () => {
      pane.attachments.files.splice(index, 1);
      paneRenderAttachments(pane);
    });
    pill.append(name, remove);
    list.appendChild(pill);
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

async function paneHandleFileSelection(pane, event) {
  const files = Array.from(event.target.files || []);
  const maxSize = 5 * 1024 * 1024;
  const maxCount = 4;
  pane.elements.attachmentStatus.textContent = '';
  for (const file of files) {
    if (pane.attachments.files.length >= maxCount) {
      pane.elements.attachmentStatus.textContent = 'Attachment limit reached.';
      break;
    }
    if (file.size > maxSize) {
      pane.elements.attachmentStatus.textContent = `File too large: ${file.name}`;
      continue;
    }
    try {
      const base64 = await fileToBase64(file);
      pane.attachments.files.push({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data: base64
      });
    } catch (err) {
      pane.elements.attachmentStatus.textContent = `Failed to read ${file.name}`;
      addFeed('err', 'attachment', String(err));
    }
  }
  event.target.value = '';
  paneRenderAttachments(pane);
}

async function paneUploadAttachments(pane) {
  if (pane.attachments.files.length === 0) return [];
  pane.elements.attachmentStatus.textContent = 'Uploading...';
  const res = await fetch('/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ files: pane.attachments.files })
  });
  if (!res.ok) {
    pane.elements.attachmentStatus.textContent = `Upload failed (${res.status}).`;
    addFeed('err', 'attachment', `upload failed (${res.status})`);
    return [];
  }
  const data = await res.json();
  pane.attachments.files = [];
  paneRenderAttachments(pane);
  pane.elements.attachmentStatus.textContent = '';
  return Array.isArray(data.files) ? data.files : [];
}

function paneUpdateCommandHints(pane) {
  const hints = pane.elements.commandHints;
  if (!hints) return;
  const value = pane.elements.input.value.trim();
  if (!value.startsWith('/')) {
    hints.classList.remove('visible');
    hints.innerHTML = '';
    return;
  }
  const matches = commandList.filter((item) => item.command.startsWith(value.toLowerCase()));
  if (matches.length === 0) {
    hints.classList.remove('visible');
    hints.innerHTML = '';
    return;
  }
  hints.innerHTML = matches
    .map(
      (item) =>
        `<div class="command-hint"><code>${item.command}</code><span>${item.description}</span></div>`
    )
    .join('');
  hints.classList.add('visible');
}

function paneSetChatEnabled(pane) {
  // Allow typing whenever we're signed in, even if the socket is reconnecting.
  // Sending/attaching still require an active connection.
  const canType = Boolean(uiState.authed);
  const canSend = Boolean(uiState.authed && pane.connected);

  pane.elements.input.disabled = !canType;
  pane.elements.sendBtn.disabled = !canSend;
  pane.elements.attachBtn.disabled = !canSend;

  if (!uiState.authed) {
    pane.elements.input.placeholder = 'Sign in to continue';
    return;
  }
  if (!pane.connected) {
    pane.elements.input.placeholder = 'Reconnecting... (Drafting enabled)';
    return;
  }
  pane.elements.input.placeholder = `Message ${paneAssistantLabel(pane)}... (Press Enter to send)`;
}

function paneEnsureHiddenWelcome(pane) {
  const sessionKey = pane.sessionKey();
  const storageKey = `clawnsole.welcome.${sessionKey}`;
  if (storage.get(storageKey)) return;
  const message =
    pane.role === 'guest'
      ? 'Welcome! You are assisting a guest. Greet them as a guest, do not assume identity, and ask how you can help today.'
      : 'Welcome! You are in Admin mode. You can assist with full OpenClaw capabilities.';
  if (pane.role === 'guest') {
    paneAddChatMessage(pane, { role: 'assistant', text: message, persist: false });
    storage.set(storageKey, 'sent');
    return;
  }
  pane.client.request('chat.inject', { sessionKey, message, label: 'Welcome' });
  storage.set(storageKey, 'sent');
}

function paneEnsureGuestPolicy(pane) {
  if (pane.role !== 'guest') return;
  if (!pane.connected) return;
  if (roleState.guestPolicyInjected) return;
  roleState.guestPolicyInjected = true;

  // When connected through the guest proxy, the server injects the guest policy.
  if (uiState.meta.guestWsUrl) return;

  const sessionKey = pane.sessionKey();
  pane.client.request('sessions.resolve', { key: sessionKey }).then((res) => {
    if (!res?.ok) {
      pane.client.request('sessions.reset', { key: sessionKey });
    }
  });
  pane.client.request('chat.inject', {
    sessionKey,
    message:
      'Guest mode: read-only. Do not access or summarize emails or private data. Do not assume the guest is the admin. Ask for their name if needed. You may assist with general questions and basic home automation (lights, climate, scenes).',
    label: 'Guest policy'
  });
}

function paneEnqueueOutbound(pane, { message, sessionKey, idempotencyKey }) {
  pane.outbox.push({ message, sessionKey, idempotencyKey, ts: Date.now() });
}

function panePumpOutbox(pane) {
  if (!pane.connected || !uiState.authed) return;
  if (pane.inFlight) return;
  const next = pane.outbox.shift();
  if (!next) return;

  pane.inFlight = next;

  // pendingSend is the recovery mechanism for in-flight sends.
  pane.pendingSend = {
    ts: Date.now(),
    lastUser: next.message,
    sessionKey: next.sessionKey,
    idempotencyKey: next.idempotencyKey,
    sentMessage: next.message,
    resent: false
  };

  if (!pane.thinking.active) paneStartThinking(pane);

  pane.client.request('chat.send', {
    sessionKey: next.sessionKey,
    message: next.message,
    deliver: true,
    idempotencyKey: next.idempotencyKey
  });
}

async function paneSendChat(pane) {
  const raw = pane.elements.input.value.trim();
  if (!raw) return;

  // During reconnect blips we allow drafting, but block sending.
  // (But we still allow enqueue once connected; for now keep behavior simple.)
  if (!pane.connected || !uiState.authed) {
    return;
  }

  const message = raw;

  if (pane.role === 'guest') {
    const lower = message.toLowerCase();
    if (lower.includes('email') || lower.includes('gmail') || lower.includes('inbox')) {
      paneAddChatMessage(pane, {
        role: 'assistant',
        text: 'Guest mode is read-only and cannot access emails. Try a home automation request instead.',
        persist: false
      });
      pane.elements.input.value = '';
      paneUpdateCommandHints(pane);
      return;
    }
  }

  const command = message.toLowerCase();
  if (command === '/clear') {
    paneClearChatHistory(pane, { wipeStorage: true });
    pane.elements.input.value = '';
    paneUpdateCommandHints(pane);
    addFeed('event', 'chat', `cleared local history (${pane.sessionKey()})`);
    return;
  }
  if (command === '/new') {
    const key = pane.sessionKey();
    paneClearChatHistory(pane, { wipeStorage: true });
    pane.elements.input.value = '';
    paneUpdateCommandHints(pane);
    pane.client.request('sessions.reset', { key });
    addFeed('event', 'chat', `reset session (${key})`);
    return;
  }

  const sessionKey = pane.sessionKey();
  const idempotencyKey = randomId();

  const uploaded = await paneUploadAttachments(pane);
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

  const outbound = `${message}${attachmentText}`;

  // Render attachments in the local user bubble too (otherwise the sender never sees what they attached).
  paneAddChatMessage(pane, { role: 'user', text: outbound });
  pane.scroll.pinned = true;
  scrollToBottom(pane, true);
  triggerFiring(1.6, 3);
  paneEnqueueOutbound(pane, { message: outbound, sessionKey, idempotencyKey });
  panePumpOutbox(pane);

  pane.elements.input.value = '';
  paneUpdateCommandHints(pane);
}

function handleGatewayFrame(pane, data) {
  pulse.eventCount += 1;
  pulse.lastEvent = data?.event || data?.method || data?.type || 'event';
  spawnPulse(Math.min(2, 0.5 + pulse.eventRate / 2));

  if (data?.type !== 'event') return;

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
    const expectedSessionKey = pane.sessionKey();
    const frameSessionKey = typeof payload.sessionKey === 'string' ? payload.sessionKey : '';
    if (!frameSessionKey || (expectedSessionKey && frameSessionKey !== expectedSessionKey)) {
      return;
    }
    const runId = payload.runId;
    const text = extractChatText(payload.message);
    if (payload.state === 'delta') {
      paneStopThinking(pane);
      paneUpdateChatRun(pane, runId, text, false);
      triggerFiring(2, 4);
    } else if (payload.state === 'final') {
      paneStopThinking(pane);
      paneUpdateChatRun(pane, runId, text, true);
      pane.pendingSend = null;
      pane.inFlight = null;
      panePumpOutbox(pane);
      triggerFiring(1.2, 2);
    } else if (payload.state === 'error') {
      paneStopThinking(pane);
      paneUpdateChatRun(pane, runId, payload.errorMessage || 'Chat error', true);
      pane.pendingSend = null;
      pane.inFlight = null;
      panePumpOutbox(pane);
      triggerFiring(0.8, 1);
    }
  }
}

function buildClientForPane(pane) {
  return new window.Clawnsole.GatewayClient({
    prepare: async () => {
      await prepareGateway(pane.role);
    },
    getUrl: () => computeGatewayTarget(pane.role).url,
    buildConnectParams: () => {
      const scopes = ['operator.read', 'operator.write'];
      const { usingProxy } = computeGatewayTarget(pane.role);
      return {
        minProtocol: 3,
        maxProtocol: 3,
        client: computeConnectClient({ role: pane.role, paneKey: pane.key }),
        role: 'operator',
        scopes,
        caps: [],
        commands: [],
        permissions: {},
        auth: !usingProxy && cachedToken ? { token: cachedToken } : undefined,
        locale: navigator.language || 'en-US',
        userAgent: 'clawnsole/0.1.0'
      };
    },
    keepAlive: () => ({ method: 'sessions.resolve', params: { key: pane.sessionKey() } }),
    onStatus: (state, meta) => {
      pane.statusState = state;
      pane.statusMeta = meta || '';
      setStatusPill(pane.elements.status, state, meta || '');
      if (pane.elements.root) {
        pane.elements.root.dataset.connected = pane.connected ? 'true' : 'false';
        pane.elements.root.dataset.wsState = String(state || '');
      }
      updateGlobalStatus();
      updateConnectionControls();
      paneSetChatEnabled(pane);
    },
    onFrame: (data) => handleGatewayFrame(pane, data),
    onConnected: () => {
      pane.connected = true;
      if (pane.elements.root) pane.elements.root.dataset.connected = 'true';
      paneSetChatEnabled(pane);
      updateGlobalStatus();
      updateConnectionControls();
      paneEnsureGuestPolicy(pane);
      paneEnsureHiddenWelcome(pane);
      pane.client.request('sessions.resolve', { key: pane.sessionKey() });

      // If we disconnected mid-stream, pull remote history to catch up.
      paneScheduleCatchUp(pane);

      // Resume sending queued messages.
      panePumpOutbox(pane);
    },
    onDisconnected: () => {
      paneStopThinking(pane);
      pane.connected = false;
      if (pane.elements.root) pane.elements.root.dataset.connected = 'false';
      paneSetChatEnabled(pane);
      updateGlobalStatus();
      updateConnectionControls();
    },
    isAuthed: () => uiState.authed,
    checkAuth: async () => {
      const state = await fetchRoleState();
      return { reachable: state.reachable, authed: Boolean(state.role) };
    },
    onAuthExpired: () => {
      roleState.role = null;
      paneManager.disconnectAll({ silent: true });
      showLogin('Session expired. Please sign in again.');
    }
  });
}

function paneSetAgent(pane, nextAgentId) {
  if (pane.role !== 'admin') return;
  const next = normalizeAgentId(nextAgentId);
  if (next === pane.agentId) return;
  pane.agentId = next;
  storage.set(ADMIN_DEFAULT_AGENT_KEY, next);
  pane.elements.agentSelect.value = next;

  pane.attachments.files = [];
  paneRenderAttachments(pane);
  paneStopThinking(pane);
  paneClearChatHistory(pane, { wipeStorage: false });
  paneRestoreChatHistory(pane);
  paneSetChatEnabled(pane);

  paneManager.persistAdminPanes();
  if (pane.connected) {
    pane.client.request('sessions.resolve', { key: pane.sessionKey() });
  }
}

function renderAgentOptions(selectEl, agentId) {
  if (!selectEl) return;
  selectEl.innerHTML = '';
  const agents =
    uiState.agents.length > 0
      ? uiState.agents
      : [{ id: 'main', name: 'main', displayName: 'main', emoji: '' }];
  agents.forEach((agent) => {
    const opt = document.createElement('option');
    opt.value = agent.id;
    opt.textContent = formatAgentLabel(agent, { includeId: true });
    selectEl.appendChild(opt);
  });
  selectEl.value = normalizeAgentId(agentId || 'main');
}

function createPane({ key, role, agentId, closable = true } = {}) {
  const template = globalElements.paneTemplate;
  const root = template.content.firstElementChild.cloneNode(true);
  const elements = {
    root,
    name: root.querySelector('[data-pane-name]'),
    agentSelect: root.querySelector('[data-pane-agent-select]'),
    agentWrap: root.querySelector('.pane-agent'),
    status: root.querySelector('[data-pane-status]'),
    closeBtn: root.querySelector('[data-pane-close]'),
    thread: root.querySelector('[data-pane-thread]'),
    scrollDownBtn: root.querySelector('[data-pane-scroll-down]'),
    input: root.querySelector('[data-pane-input]'),
    commandHints: root.querySelector('[data-pane-command-hints]'),
    fileInput: root.querySelector('[data-pane-file-input]'),
    attachBtn: root.querySelector('[data-pane-attach]'),
    attachmentStatus: root.querySelector('[data-pane-attachment-status]'),
    attachmentList: root.querySelector('[data-pane-attachment-list]'),
    sendBtn: root.querySelector('[data-pane-send]')
  };

	  const pane = {
	    key,
	    role,
	    agentId: role === 'admin' ? normalizeAgentId(agentId || 'main') : null,
	    connected: false,
	    statusState: 'disconnected',
	    statusMeta: '',
	    elements,
	    chat: { runs: new Map(), history: [] },
	    scroll: { pinned: true },
	    thinking: { active: false, timer: null, dotsTimer: null, bubble: null },
	    attachments: { files: [] },
	    pendingSend: null,
	    catchUp: { active: false, attemptsLeft: 0, timer: null },
	    outbox: [],
	    inFlight: null,
	    chatKey: () => computeChatKey({ role: pane.role, agentId: pane.agentId }),
	    legacySessionKey: () => computeLegacySessionKey({ role: pane.role, agentId: pane.agentId }),
	    sessionKey: () => computeSessionKey({ role: pane.role, agentId: pane.agentId, paneKey: pane.key }),
	    client: null
	  };

  if (elements.closeBtn) {
    elements.closeBtn.hidden = !closable;
    elements.closeBtn.addEventListener('click', () => {
      paneManager.removePane(pane.key);
    });
  }

  if (pane.role === 'admin') {
    renderAgentOptions(elements.agentSelect, pane.agentId);
    elements.agentSelect.addEventListener('change', (event) => {
      paneSetAgent(pane, String(event.target.value || '').trim());
    });
  } else {
    if (elements.agentWrap) elements.agentWrap.hidden = true;
    if (elements.closeBtn) elements.closeBtn.hidden = true;
  }

  elements.sendBtn.addEventListener('click', () => {
    if (elements.sendBtn.disabled) return;
    paneSendChat(pane);
  });

  elements.input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (elements.sendBtn.disabled) return;
      paneSendChat(pane);
    }
  });

  elements.input.addEventListener('input', () => {
    paneUpdateCommandHints(pane);
  });

  elements.attachBtn.addEventListener('click', () => {
    elements.fileInput.click();
  });

  elements.fileInput.addEventListener('change', (event) => {
    paneHandleFileSelection(pane, event);
  });

  elements.thread.addEventListener('scroll', () => {
    pane.scroll.pinned = isNearBottom(elements.thread);
    if (elements.scrollDownBtn) {
      elements.scrollDownBtn.classList.toggle('visible', !pane.scroll.pinned);
    }
  });

  if (elements.scrollDownBtn) {
    elements.scrollDownBtn.addEventListener('click', () => {
      pane.scroll.pinned = true;
      scrollToBottom(pane, true);
      elements.scrollDownBtn.classList.remove('visible');
    });
  }

  paneRestoreChatHistory(pane);

  // Ensure initial disabled state before auth/connection comes up.
  paneSetChatEnabled(pane);

  pane.client = buildClientForPane(pane);
  setStatusPill(elements.status, 'disconnected', '');
  return pane;
}

function inferPaneCols(count) {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  if (count === 4) return 2;
  // 5-6 panes: pack into 3 columns.
  return 3;
}

const paneManager = {
  panes: [],
  maxPanes: 6,
  init(role) {
    this.destroyAll();

    // Manual layout selection is deprecated; keep the control hidden if present.
    if (globalElements.layoutSelect) {
      globalElements.layoutSelect.hidden = true;
      globalElements.layoutSelect.disabled = true;
    }

    if (role === 'admin') {
      this.initAdmin();
      return;
    }
    this.initGuest();
  },
  initGuest() {
    this.panes = [createPane({ key: 'guest', role: 'guest', closable: false })];
    globalElements.paneGrid.appendChild(this.panes[0].elements.root);
    this.updatePaneLabels();
    this.applyInferredLayout();
  },
  initAdmin() {
    const panes = this.loadAdminPanes();
    this.panes = panes.map((cfg) => createPane({ key: cfg.key, role: 'admin', agentId: cfg.agentId, closable: true }));
    this.panes.forEach((pane) => globalElements.paneGrid.appendChild(pane.elements.root));
    this.updatePaneLabels();
    this.updateCloseButtons();
    this.applyInferredLayout();
  },
  destroyAll() {
    this.panes.forEach((pane) => {
      try {
        pane.client?.disconnect(true);
      } catch {}
      paneStopThinking(pane);
      try {
        pane.elements.root.remove();
      } catch {}
    });
    this.panes = [];
  },
  loadAdminPanes() {
    const storedDefault = storage.get(ADMIN_DEFAULT_AGENT_KEY, 'main');
    const defaultAgent = normalizeAgentId(storedDefault || 'main');
    try {
      const raw = storage.get(ADMIN_PANES_KEY, '');
      if (!raw) throw new Error('empty');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('not array');
      const list = parsed
        .map((item) => ({
          key: typeof item?.key === 'string' && item.key ? item.key : '',
          agentId: normalizeAgentId(typeof item?.agentId === 'string' ? item.agentId : defaultAgent)
        }))
        .filter((item) => item.key);
      if (list.length > 0) {
        return list.slice(0, this.maxPanes);
      }
    } catch {}

    const secondary =
      uiState.agents.find((agent) => agent.id && agent.id !== defaultAgent)?.id || defaultAgent || 'main';
    const paneA = { key: `p${randomId().slice(0, 8)}`, agentId: defaultAgent };
    const paneB = { key: `p${randomId().slice(0, 8)}`, agentId: normalizeAgentId(secondary) };
    const list = [paneA, paneB].slice(0, this.maxPanes);
    storage.set(ADMIN_PANES_KEY, JSON.stringify(list));
    return list;
  },
  persistAdminPanes() {
    if (roleState.role !== 'admin') return;
    const payload = this.panes.map((pane) => ({ key: pane.key, agentId: pane.agentId || 'main' }));
    storage.set(ADMIN_PANES_KEY, JSON.stringify(payload));
  },
  addPane() {
    if (roleState.role !== 'admin') return;
    if (this.panes.length >= this.maxPanes) return;
    const agentId = normalizeAgentId(storage.get(ADMIN_DEFAULT_AGENT_KEY, 'main'));
    const pane = createPane({ key: `p${randomId().slice(0, 8)}`, role: 'admin', agentId, closable: true });
    this.panes.push(pane);
    globalElements.paneGrid.appendChild(pane.elements.root);
    this.updatePaneLabels();
    this.updateCloseButtons();
    this.applyInferredLayout();
    this.persistAdminPanes();
    if (uiState.authed) {
      pane.client.connect();
    }
  },
  removePane(key) {
    if (roleState.role !== 'admin') return;
    if (this.panes.length <= 1) return;
    const idx = this.panes.findIndex((pane) => pane.key === key);
    if (idx < 0) return;
    const [pane] = this.panes.splice(idx, 1);
    try {
      pane.client?.disconnect(true);
    } catch {}
    paneStopThinking(pane);
    try {
      pane.elements.root.remove();
    } catch {}
    this.updatePaneLabels();
    this.updateCloseButtons();
    this.applyInferredLayout();
    this.persistAdminPanes();
    updateGlobalStatus();
    updateConnectionControls();
  },
  updatePaneLabels() {
    this.panes.forEach((pane, index) => {
      const letter = String.fromCharCode(65 + (index % 26));
      if (pane.elements.name) pane.elements.name.textContent = letter;
    });
  },
  updateCloseButtons() {
    const allowClose = roleState.role === 'admin' && this.panes.length > 1;
    this.panes.forEach((pane) => {
      if (!pane.elements.closeBtn) return;
      pane.elements.closeBtn.hidden = !(allowClose && pane.role === 'admin');
    });
  },
  applyLayout(cols) {
    const clamped = Math.max(1, Math.min(3, Number(cols) || 1));
    if (globalElements.paneGrid) {
      globalElements.paneGrid.style.setProperty('--pane-cols', String(clamped));
    }
  },
  applyInferredLayout() {
    if (!globalElements.paneGrid) return;
    const cols = inferPaneCols(this.panes.length);
    this.applyLayout(cols);
  },
  connectAll() {
    this.panes.forEach((pane, index) => {
      setTimeout(() => pane.client.connect(), index * 120);
    });
  },
  connectIfNeeded() {
    if (!uiState.authed) return;
    this.panes.forEach((pane) => {
      if (pane.client.manualDisconnect) return;
      if (pane.connected) return;
      pane.client.connect({ isRetry: true });
    });
  },
  disconnectAll({ silent = false } = {}) {
    this.panes.forEach((pane) => pane.client.disconnect(silent));
  },
  refreshChatEnabled() {
    this.panes.forEach((pane) => {
      paneSetChatEnabled(pane);
    });
  }
};

// Global event wiring

globalElements.settingsBtn?.addEventListener('click', () => openSettings());
globalElements.settingsCloseBtn?.addEventListener('click', () => closeSettings());
globalElements.settingsModal?.addEventListener('click', (event) => {
  if (event.target === globalElements.settingsModal) closeSettings();
});
globalElements.saveGuestPromptBtn?.addEventListener('click', () => saveGuestPrompt());

globalElements.workqueueBtn?.addEventListener('click', () => openWorkqueue());
globalElements.workqueueCloseBtn?.addEventListener('click', () => closeWorkqueue());
globalElements.workqueueModal?.addEventListener('click', (event) => {
  if (event.target === globalElements.workqueueModal) closeWorkqueue();
});
globalElements.wqQueueSelect?.addEventListener('change', () => {
  workqueueState.selectedQueue = globalElements.wqQueueSelect.value;
  fetchAndRenderWorkqueueItems();
});
globalElements.wqRefreshBtn?.addEventListener('click', () => {
  fetchWorkqueueQueues().then(() => fetchAndRenderWorkqueueItems());
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeSettings();
    closeWorkqueue();
  }
});

globalElements.disconnectBtn?.addEventListener('click', () => {
  const anyActive = paneManager.panes.some((pane) =>
    pane.statusState === 'connected' || pane.statusState === 'connecting' || pane.statusState === 'reconnecting'
  );
  if (anyActive) {
    paneManager.disconnectAll();
    return;
  }
  paneManager.panes.forEach((pane) => {
    pane.client.manualDisconnect = false;
  });
  paneManager.connectAll();
});

globalElements.status?.addEventListener('click', () => {
  if (!uiState.authed) {
    showLogin('Please sign in to continue.');
    return;
  }
  paneManager.panes.forEach((pane) => {
    if (pane.client.manualDisconnect) pane.client.manualDisconnect = false;
  });
  paneManager.connectIfNeeded();
});

globalElements.loginBtn?.addEventListener('click', () => attemptLogin());
globalElements.loginPassword?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    attemptLogin();
  }
});

globalElements.logoutBtn?.addEventListener('click', async () => {
  try {
    await fetch('/auth/logout', { method: 'POST' });
  } catch {}
  storage.set('clawnsole.auth.role', '');
  paneManager.disconnectAll({ silent: true });
  roleState.role = null;
  window.location.replace('/');
});

globalElements.addPaneBtn?.addEventListener('click', () => {
  paneManager.addPane();
});

// layoutSelect deprecated; layout is inferred from pane count.

window.addEventListener('online', () => {
  paneManager.connectIfNeeded();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  paneManager.connectIfNeeded();
});

window.addEventListener('load', () => {
  const loginGuard = setTimeout(() => {
    if (!uiState.authed) {
      roleState.role = null;
      showLogin('Please sign in to continue.');
    }
  }, 800);

  fetchRole()
    .then(async (role) => {
      clearTimeout(loginGuard);
      if (!role) {
        roleState.role = null;
        showLogin();
        return;
      }

      if (!routeRole) {
        window.location.replace(role === 'admin' ? '/admin' : '/guest');
        return;
      }

      if (role !== routeRole) {
        roleState.role = null;
        showLogin(`Signed in as ${role}. Sign in as ${routeRole} to continue.`);
        return;
      }

      hideLogin();
      setRole(role);

      if (role === 'admin') {
        uiState.agents = await fetchAgents();
        if (uiState.agents.length === 0) {
          uiState.agents = [{ id: 'main', name: 'main', displayName: 'main', emoji: '' }];
        }
      }

      paneManager.init(role);

      // Update agent options now that we have a definitive list.
      if (role === 'admin') {
        paneManager.panes.forEach((pane) => {
          renderAgentOptions(pane.elements.agentSelect, pane.agentId);
        });
      }

      setAuthState(true);
      paneManager.connectAll();

      const isTouch = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
      if (!isTouch) {
        const firstPane = paneManager.panes[0];
        firstPane?.elements.input?.focus();
      }
    })
    .catch(() => {
      clearTimeout(loginGuard);
      roleState.role = null;
      showLogin('Please sign in to continue.');
    });
});
