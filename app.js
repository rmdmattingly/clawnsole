const globalElements = {
  wsUrl: document.getElementById('wsUrl'),
  clientId: document.getElementById('clientId'),
  deviceId: document.getElementById('deviceId'),
  disconnectBtn: document.getElementById('disconnectBtn'),
  resetLayoutBtn: document.getElementById('resetLayoutBtn'),
  status: document.getElementById('connectionStatus'),
  paneManagerBtn: document.getElementById('paneManagerBtn'),
  pulseCanvas: document.getElementById('pulseCanvas'),
  workqueueBtn: document.getElementById('workqueueBtn'),
  refreshAgentsBtn: document.getElementById('refreshAgentsBtn'),
  agentsBtn: document.getElementById('agentsBtn'),
  agentsModal: document.getElementById('agentsModal'),
  agentsCloseBtn: document.getElementById('agentsCloseBtn'),
  agentsSearch: document.getElementById('agentsSearch'),
  agentsActiveOnly: document.getElementById('agentsActiveOnly'),
  agentsActiveMinutes: document.getElementById('agentsActiveMinutes'),
  agentsList: document.getElementById('agentsList'),
  agentsEmpty: document.getElementById('agentsEmpty'),
  toastHost: document.getElementById('toastHost'),
  commandPaletteModal: document.getElementById('commandPaletteModal'),
  commandPaletteCloseBtn: document.getElementById('commandPaletteCloseBtn'),
  commandPaletteInput: document.getElementById('commandPaletteInput'),
  commandPaletteList: document.getElementById('commandPaletteList'),
  commandPaletteEmpty: document.getElementById('commandPaletteEmpty'),
  shortcutsModal: document.getElementById('shortcutsModal'),
  shortcutsCloseBtn: document.getElementById('shortcutsCloseBtn'),
  paneManagerModal: document.getElementById('paneManagerModal'),
  paneManagerCloseBtn: document.getElementById('paneManagerCloseBtn'),
  paneManagerList: document.getElementById('paneManagerList'),
  paneManagerEmpty: document.getElementById('paneManagerEmpty'),
  workqueueModal: document.getElementById('workqueueModal'),
  workqueueCloseBtn: document.getElementById('workqueueCloseBtn'),
  wqQueueSelect: document.getElementById('wqQueueSelect'),
  wqStatusFilters: document.getElementById('wqStatusFilters'),
  wqAutoRefreshEnabled: document.getElementById('wqAutoRefreshEnabled'),
  wqAutoRefreshInterval: document.getElementById('wqAutoRefreshInterval'),
  wqRefreshBtn: document.getElementById('wqRefreshBtn'),
  wqListBody: document.getElementById('wqListBody'),
  wqListEmpty: document.getElementById('wqListEmpty'),
  wqInspectBody: document.getElementById('wqInspectBody'),
  wqEnqueueTitle: document.getElementById('wqEnqueueTitle'),
  wqEnqueuePriority: document.getElementById('wqEnqueuePriority'),
  wqEnqueueInstructions: document.getElementById('wqEnqueueInstructions'),
  wqEnqueueDedupeKey: document.getElementById('wqEnqueueDedupeKey'),
  wqEnqueueBtn: document.getElementById('wqEnqueueBtn'),
  wqClaimAgentId: document.getElementById('wqClaimAgentId'),
  wqClaimLeaseMs: document.getElementById('wqClaimLeaseMs'),
  wqClaimBtn: document.getElementById('wqClaimBtn'),
  wqActionStatus: document.getElementById('wqActionStatus'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  settingsCloseBtn: document.getElementById('settingsCloseBtn'),
  rolePill: document.getElementById('rolePill'),
  loginOverlay: document.getElementById('loginOverlay'),
  loginPassword: document.getElementById('loginPassword'),
  loginBtn: document.getElementById('loginBtn'),
  loginError: document.getElementById('loginError'),
  logoutBtn: document.getElementById('logoutBtn'),
  paneControls: document.getElementById('paneControls'),
  addPaneBtn: document.getElementById('addPaneBtn'),
  addChatPaneBtn: document.getElementById('addChatPaneBtn'),
  addQueuePaneBtn: document.getElementById('addQueuePaneBtn'),
  layoutSelect: document.getElementById('layoutSelect'),
  paneGrid: document.getElementById('paneGrid'),
  paneTemplate: document.getElementById('paneTemplate')
};

// Pure helpers live in lib/app-core.js so we can unit-test them under Node.
const __appCore = (typeof window !== 'undefined' && window.AppCore) ? window.AppCore : {};
const escapeHtml = __appCore.escapeHtml || ((value) => {
  const s = String(value ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
});
const fmtRemaining = __appCore.fmtRemaining || ((msUntil) => {
  if (!Number.isFinite(msUntil)) return '';
  if (msUntil <= 0) return 'expired';
  const sec = Math.floor(msUntil / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  if (hr > 0) return `${hr}h ${min % 60}m`;
  if (min > 0) return `${min}m ${sec % 60}s`;
  return `${sec}s`;
});
const sortWorkqueueItems = __appCore.sortWorkqueueItems || ((items, opts) => (Array.isArray(items) ? items.slice() : []));

function getRouteRole() {
  try {
    const path = window.location.pathname || '/';
    if (path === '/admin' || path.startsWith('/admin/')) return 'admin';
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

// Agent list UX (pins + active-only)
const ADMIN_AGENT_PINS_KEY = 'clawnsole.admin.agentPins';
const ADMIN_AGENT_LAST_SEEN_KEY = 'clawnsole.admin.agentLastSeenAtMs';
const ADMIN_AGENT_ACTIVE_ONLY_KEY = 'clawnsole.admin.agents.activeOnly';
const ADMIN_AGENT_ACTIVE_MINUTES_KEY = 'clawnsole.admin.agents.activeMinutes';

function readJsonFromStorage(key, fallback) {
  try {
    const raw = storage.get(key, '');
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJsonToStorage(key, value) {
  try {
    storage.set(key, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
}

function getPinnedAgentIds() {
  const list = readJsonFromStorage(ADMIN_AGENT_PINS_KEY, []);
  return new Set(Array.isArray(list) ? list.map((v) => String(v || '').trim()).filter(Boolean) : []);
}

function setPinnedAgentIds(ids) {
  const out = Array.from(ids || []).map((v) => String(v || '').trim()).filter(Boolean);
  out.sort();
  writeJsonToStorage(ADMIN_AGENT_PINS_KEY, out);
}

function togglePinnedAgentId(id) {
  const trimmed = String(id || '').trim();
  if (!trimmed) return;
  const set = getPinnedAgentIds();
  if (set.has(trimmed)) set.delete(trimmed);
  else set.add(trimmed);
  setPinnedAgentIds(set);
}

function getAgentLastSeenMap() {
  const obj = readJsonFromStorage(ADMIN_AGENT_LAST_SEEN_KEY, {});
  if (!obj || typeof obj !== 'object') return {};
  return obj;
}

function markAgentSeen(agentId) {
  const id = String(agentId || '').trim();
  if (!id) return;
  const map = getAgentLastSeenMap();
  map[id] = Date.now();
  writeJsonToStorage(ADMIN_AGENT_LAST_SEEN_KEY, map);
}

function isAgentActive(agentId, { withinMinutes = 10 } = {}) {
  const id = String(agentId || '').trim();
  if (!id) return false;
  const map = getAgentLastSeenMap();
  const ts = Number(map[id]) || 0;
  if (!ts) return false;
  const windowMs = Math.max(1, Number(withinMinutes) || 10) * 60_000;
  return Date.now() - ts <= windowMs;
}

function sortAgentsByLastSeen(agents) {
  const map = getAgentLastSeenMap();
  const ts = (a) => Number(map[String(a?.id || '').trim()]) || 0;
  return (Array.isArray(agents) ? agents : []).slice().sort((a, b) => {
    const dt = ts(b) - ts(a);
    if (dt) return dt;
    return formatAgentLabel(a, { includeId: true }).localeCompare(formatAgentLabel(b, { includeId: true }));
  });
}

const roleState = {
  role: null
};

const uiState = {
  authed: false,
  meta: {},
  agents: []
};

let toastSeq = 0;
function showToast(message, { kind = 'info', timeoutMs = 2600 } = {}) {
  if (!globalElements.toastHost) return;
  const text = typeof message === 'string' ? message.trim() : String(message || '').trim();
  if (!text) return;

  const el = document.createElement('div');
  el.className = `toast ${kind === 'error' ? 'toast-error' : 'toast-info'}`;
  el.textContent = text;
  const id = ++toastSeq;
  el.dataset.toastId = String(id);
  el.setAttribute('data-testid', 'toast');
  el.dataset.toastKind = kind;

  globalElements.toastHost.appendChild(el);

  // Force reflow so transitions apply.
  void el.offsetWidth;
  el.classList.add('open');

  const remove = () => {
    try {
      el.classList.remove('open');
      setTimeout(() => {
        try {
          el.remove();
        } catch {}
      }, 220);
    } catch {}
  };

  const timer = setTimeout(remove, Math.max(800, Number(timeoutMs) || 2600));
  el.addEventListener('click', () => {
    clearTimeout(timer);
    remove();
  });
}

let agentRefreshTimer = null;
let agentRefreshInFlight = null;
let agentAutoRefreshInterval = null;

function startAgentAutoRefresh() {
  if (roleState.role !== 'admin') return;
  if (!uiState.authed) return;
  if (agentAutoRefreshInterval) return;
  // Low-frequency poll so new agents appear even if connectivity never fully drops.
  agentAutoRefreshInterval = setInterval(() => {
    if (document.hidden) return;
    scheduleAgentRefresh('poll');
  }, 30_000);
}

function stopAgentAutoRefresh() {
  if (!agentAutoRefreshInterval) return;
  clearInterval(agentAutoRefreshInterval);
  agentAutoRefreshInterval = null;
}

async function refreshAgents({ reason = 'manual', showSuccessToast = false } = {}) {
  if (roleState.role !== 'admin') return uiState.agents;
  if (!uiState.authed) return uiState.agents;

  if (agentRefreshInFlight) return agentRefreshInFlight;

  const prev = Array.isArray(uiState.agents) ? uiState.agents : [];
  if (globalElements.refreshAgentsBtn) {
    globalElements.refreshAgentsBtn.disabled = true;
    globalElements.refreshAgentsBtn.setAttribute('aria-busy', 'true');
  }

  agentRefreshInFlight = (async () => {
    const next = await fetchAgents();
    agentRefreshInFlight = null;

    if (globalElements.refreshAgentsBtn) {
      globalElements.refreshAgentsBtn.disabled = roleState.role !== 'admin' || !uiState.authed;
      globalElements.refreshAgentsBtn.removeAttribute('aria-busy');
    }

    if (!Array.isArray(next) || next.length === 0) {
      if (prev.length > 0) {
        showToast('Agent refresh failed; showing last-known list.', { kind: 'error', timeoutMs: 3500 });
        return prev;
      }
      showToast('No agents found.', { kind: 'error', timeoutMs: 3000 });
      return prev;
    }

    uiState.agents = next;

    // Preserve UI state (selected agent per pane).
    paneManager.panes.forEach((pane) => {
      if (!pane) return;
      const prior = pane.agentId;
      pane.agentId = normalizeAgentId(prior);
      if (pane?.elements?.agentSelect) {
        renderAgentOptions(pane.elements.agentSelect, pane.agentId);
        try {
          pane.elements.agentSelect.value = pane.agentId;
        } catch {}
      }
      try {
        renderPaneAgentIdentity(pane);
      } catch {}
      try {
        pane._updateAgentPickerLabel?.();
      } catch {}
      try {
        renderPaneAgentIdentity(pane);
      } catch {}
    });

    // Cron/Timeline panes use their own Agent filter select; refresh those options too.
    paneManager.panes.forEach((pane) => {
      if (!pane) return;
      if (pane.kind !== 'cron' && pane.kind !== 'timeline') return;
      try {
        pane._renderAgentFilterOptions?.();
      } catch {}
    });

    // Refresh workqueue agent claim selectors (modal + item cards) if present.
    refreshWorkqueueAgentSelects();

    // If the Agents modal is open, refresh its list.
    try {
      if (globalElements.agentsModal?.classList?.contains('open')) {
        renderAgentsModalList();
      }
    } catch {}

    if (showSuccessToast) {
      showToast(`Agents refreshed (${reason}).`, { kind: 'info', timeoutMs: 1800 });
    }
    return next;
  })();

  return agentRefreshInFlight;
}

function scheduleAgentRefresh(reason = 'ws_connected') {
  if (roleState.role !== 'admin') return;
  if (!uiState.authed) return;
  if (agentRefreshTimer) return;
  agentRefreshTimer = setTimeout(() => {
    agentRefreshTimer = null;
    refreshAgents({ reason }).catch(() => {});
  }, 450);
}

function refreshWorkqueueAgentSelects() {
  const selects = document.querySelectorAll('[data-wq-claim-agent]');
  if (!selects || selects.length === 0) return;

  const agents = Array.isArray(uiState.agents) ? uiState.agents : [];
  selects.forEach((selectEl) => {
    if (!selectEl) return;
    const prior = selectEl.value;
    selectEl.innerHTML = '';
    const optNone = document.createElement('option');
    optNone.value = '';
    optNone.textContent = 'Unassigned';
    selectEl.appendChild(optNone);
    for (const a of agents) {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = formatAgentLabel(a, { includeId: true });
      selectEl.appendChild(opt);
    }
    try {
      selectEl.value = prior;
    } catch {}
  });
}


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

function computeGatewayTarget(_kind) {
  const proxyUrl = uiState.meta && uiState.meta.adminWsUrl ? uiState.meta.adminWsUrl : '';
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
    if (globalElements.paneManagerBtn) globalElements.paneManagerBtn.textContent = 'sign in required';
    return;
  }
  if (panes.length === 0) {
    setStatusPill(globalElements.status, 'disconnected', '');
    if (globalElements.paneManagerBtn) globalElements.paneManagerBtn.textContent = '';
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
  if (globalElements.paneManagerBtn) globalElements.paneManagerBtn.textContent = meta;
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

  if (authed && roleState.role === 'admin') {
    startAgentAutoRefresh();
  }
  if (!authed) {
    stopAgentAutoRefresh();
  }

  if (globalElements.logoutBtn) {
    globalElements.logoutBtn.disabled = !authed;
    globalElements.logoutBtn.style.opacity = authed ? '1' : '0.5';
  }
}

function setRole(role) {
  roleState.role = role;
  if (globalElements.rolePill) {
    // Clawnsole now effectively has a single signed-in role (admin), so showing the raw role name is redundant.
    globalElements.rolePill.textContent = role === 'admin' ? 'signed in' : role;
    // Keep the visual “signed in” styling for admin without exposing the role label.
    globalElements.rolePill.classList.toggle('admin', role === 'admin');
  }

  if (globalElements.refreshAgentsBtn) {
    globalElements.refreshAgentsBtn.hidden = role !== 'admin';
    globalElements.refreshAgentsBtn.disabled = role !== 'admin' || !uiState.authed;
    globalElements.refreshAgentsBtn.style.opacity = role === 'admin' ? '1' : '0.5';
  }

  if (role === 'admin') {
    startAgentAutoRefresh();
  } else {
    stopAgentAutoRefresh();
  }
  if (role === 'admin') {
    globalElements.settingsBtn?.removeAttribute('disabled');
    if (globalElements.settingsBtn) globalElements.settingsBtn.style.opacity = '1';
  } else {
    globalElements.settingsBtn?.setAttribute('disabled', 'disabled');
    if (globalElements.settingsBtn) globalElements.settingsBtn.style.opacity = '0.5';
  }

  if (globalElements.paneControls) {
    globalElements.paneControls.hidden = role !== 'admin';
  }
  if (globalElements.agentsBtn) {
    globalElements.agentsBtn.hidden = role !== 'admin';
    globalElements.agentsBtn.disabled = role !== 'admin';
    globalElements.agentsBtn.style.opacity = role === 'admin' ? '1' : '0.5';
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

  // Guest role selection removed.

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
  const password = globalElements.loginPassword.value.trim();
  if (!password) {
    showLogin('Password required.');
    return;
  }
  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'include'
    });
    if (!res.ok) {
      showLogin('Invalid password. Try again.');
      return;
    }
    await res.json();
    window.location.replace('/admin');
  } catch {
    showLogin('Login failed. Please retry.');
  }
}

function openSettings() {
  globalElements.settingsModal.classList.add('open');
  globalElements.settingsModal.setAttribute('aria-hidden', 'false');

  // Guest mode removed.

  loadRecurringPromptAgents();
  loadRecurringPrompts();
}

function closeSettings() {
  globalElements.settingsModal.classList.remove('open');
  globalElements.settingsModal.setAttribute('aria-hidden', 'true');
}

function openShortcuts() {
  globalElements.shortcutsModal?.classList.add('open');
  globalElements.shortcutsModal?.setAttribute('aria-hidden', 'false');
}

function closeShortcuts() {
  globalElements.shortcutsModal?.classList.remove('open');
  globalElements.shortcutsModal?.setAttribute('aria-hidden', 'true');
}

// Pane Manager (admin-only)

const paneManagerUiState = {
  open: false,
  selectedIndex: 0
};

function isPaneManagerOpen() {
  return !!globalElements.paneManagerModal?.classList.contains('open');
}

function paneLabel(pane) {
  const kind = pane?.kind || 'chat';
  if (kind === 'workqueue') return 'Workqueue';
  if (kind === 'cron') return 'Cron';
  if (kind === 'timeline') return 'Timeline';
  return 'Chat';
}

function paneIcon(pane) {
  const kind = pane?.kind || 'chat';
  if (kind === 'workqueue') return 'WQ';
  if (kind === 'cron') return '⏰';
  if (kind === 'timeline') return '🕒';
  return '💬';
}

function paneTargetLabel(pane) {
  if (!pane) return '';
  if (pane.kind === 'workqueue') return String(pane.workqueue?.queue || 'dev-team');
  if (pane.kind === 'cron' || pane.kind === 'timeline') return 'gateway';
  return String(pane.agentId || 'main');
}

function renderPaneManager() {
  const panes = paneManager?.panes || [];
  const list = globalElements.paneManagerList;
  const empty = globalElements.paneManagerEmpty;
  if (!list || !empty) return;

  list.innerHTML = '';
  empty.hidden = panes.length > 0;

  const selected = Math.max(0, Math.min(paneManagerUiState.selectedIndex, panes.length - 1));
  paneManagerUiState.selectedIndex = selected;

  panes.forEach((pane, idx) => {
    const row = document.createElement('div');
    row.className = 'pane-manager-row';
    row.setAttribute('role', 'option');
    row.dataset.index = String(idx);
    row.dataset.paneKey = String(pane.key || '');
    row.setAttribute('aria-selected', idx === selected ? 'true' : 'false');

    const state = String(pane.statusState || (pane.connected ? 'connected' : 'disconnected'));

    row.innerHTML = `
      <div class="pane-manager-main">
        <div class="pane-manager-kind" title="${escapeHtml(paneLabel(pane))}">
          <span class="pane-manager-icon" aria-hidden="true">${escapeHtml(paneIcon(pane))}</span>
          <span class="pane-manager-kind-label">${escapeHtml(paneLabel(pane))}</span>
        </div>
        <div class="pane-manager-target" title="${escapeHtml(paneTargetLabel(pane))}">${escapeHtml(paneTargetLabel(pane))}</div>
        <div class="pane-manager-state" data-state="${escapeHtml(state)}">${escapeHtml(state)}</div>
      </div>
      <div class="pane-manager-actions">
        <button class="secondary pane-manager-focus" type="button" data-action="focus">Focus</button>
        <button class="secondary pane-manager-close" type="button" data-action="close">Close</button>
      </div>
    `;

    row.addEventListener('mousemove', () => {
      paneManagerUiState.selectedIndex = idx;
      renderPaneManager();
    });

    row.addEventListener('click', (event) => {
      const action = event?.target?.dataset?.action;
      paneManagerUiState.selectedIndex = idx;
      if (action === 'close') {
        try {
          paneManager.removePane(pane.key);
        } catch {}
        renderPaneManager();
        return;
      }
      // Default: focus
      closePaneManager();
      focusPaneIndex(idx);
    });

    list.appendChild(row);
  });
}

function openPaneManager() {
  if (roleState.role !== 'admin') return;
  if (!uiState.authed) {
    showLogin('Please sign in to continue.');
    return;
  }
  if (!globalElements.paneManagerModal) return;

  paneManagerUiState.open = true;
  paneManagerUiState.selectedIndex = 0;

  globalElements.paneManagerModal.classList.add('open');
  globalElements.paneManagerModal.setAttribute('aria-hidden', 'false');
  renderPaneManager();

  // Ensure keydown events go somewhere stable.
  try {
    globalElements.paneManagerModal.focus?.();
  } catch {}
}

function closePaneManager({ restoreFocus = true } = {}) {
  if (!globalElements.paneManagerModal) return;
  paneManagerUiState.open = false;
  globalElements.paneManagerModal.classList.remove('open');
  globalElements.paneManagerModal.setAttribute('aria-hidden', 'true');
  if (restoreFocus) {
    try {
      const pane = paneManager?.panes?.[0];
      pane?.elements?.input?.focus?.();
    } catch {}
  }
}

function paneManagerHandleKeydown(event) {
  if (!isPaneManagerOpen()) return false;
  const panes = paneManager?.panes || [];
  if (event.key === 'Escape') {
    event.preventDefault();
    closePaneManager();
    return true;
  }
  if (panes.length === 0) return false;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    paneManagerUiState.selectedIndex = Math.min(panes.length - 1, paneManagerUiState.selectedIndex + 1);
    renderPaneManager();
    return true;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    paneManagerUiState.selectedIndex = Math.max(0, paneManagerUiState.selectedIndex - 1);
    renderPaneManager();
    return true;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    const idx = Math.max(0, Math.min(panes.length - 1, paneManagerUiState.selectedIndex));
    closePaneManager();
    focusPaneIndex(idx);
    return true;
  }
  return false;
}

// Command palette (admin-only)

const commandPaletteState = {
  open: false,
  query: '',
  items: [],
  filtered: [],
  selectedIndex: 0
};

function isCommandPaletteOpen() {
  return !!globalElements.commandPaletteModal?.classList.contains('open');
}

function closeCommandPalette({ restoreFocus = true } = {}) {
  if (!globalElements.commandPaletteModal) return;
  commandPaletteState.open = false;
  globalElements.commandPaletteModal.classList.remove('open');
  globalElements.commandPaletteModal.setAttribute('aria-hidden', 'true');
  if (restoreFocus) {
    try {
      const pane = paneManager?.panes?.[0];
      pane?.elements?.input?.focus?.();
    } catch {}
  }
}

function scoreFuzzy(hay, needle) {
  const h = String(hay || '').toLowerCase();
  const n = String(needle || '').toLowerCase().trim();
  if (!n) return 1;
  // Very small, fast fuzzy: all tokens must appear; prefer earlier + tighter matches.
  const tokens = n.split(/\s+/g).filter(Boolean);
  let score = 0;
  let lastIdx = -1;
  for (const t of tokens) {
    const idx = h.indexOf(t);
    if (idx < 0) return 0;
    score += 100 - Math.min(99, idx);
    if (lastIdx >= 0) score += 25 - Math.min(24, Math.max(0, idx - lastIdx));
    lastIdx = idx;
  }
  return Math.max(1, score);
}

function buildCommandPaletteItems() {
  const items = [];

  // Core commands
  items.push(
    {
      id: 'cmd:add-chat',
      label: 'Add pane: Chat',
      detail: 'Create a new Chat pane',
      run: () => paneManager.addPane('chat')
    },
    {
      id: 'cmd:add-workqueue',
      label: 'Add pane: Workqueue',
      detail: 'Create a new Workqueue pane',
      run: () => paneManager.addPane('workqueue')
    },
    {
      id: 'cmd:add-cron',
      label: 'Add pane: Cron',
      detail: 'Create a new Cron pane',
      run: () => paneManager.addPane('cron')
    },
    {
      id: 'cmd:add-timeline',
      label: 'Add pane: Timeline',
      detail: 'Create a new Timeline pane',
      run: () => paneManager.addPane('timeline')
    },
    {
      id: 'cmd:reset-layout',
      label: 'Layout: Reset panes',
      detail: 'Reset admin layout to default',
      run: () => paneManager.resetAdminLayoutToDefault({ confirm: true })
    },
    {
      id: 'cmd:toggle-shortcuts',
      label: 'Help: Toggle shortcuts overlay',
      detail: 'Show/hide keyboard shortcuts',
      run: () => {
        if (globalElements.shortcutsModal?.classList.contains('open')) closeShortcuts();
        else openShortcuts();
      }
    },
    {
      id: 'cmd:open-workqueue',
      label: 'Workqueue: Open modal',
      detail: 'Open the Workqueue modal (g w)',
      run: () => openWorkqueue()
    },
    {
      id: 'cmd:refresh-agents',
      label: 'Agents: Refresh',
      detail: 'Refresh agent list',
      run: () => globalElements.refreshAgentsBtn?.click?.()
    },
    {
      id: 'cmd:pane-cycle',
      label: 'Panes: Cycle focus',
      detail: 'Move focus to next pane',
      run: () => cyclePaneFocus()
    },
    {
      id: 'cmd:focus-pane-1',
      label: 'Panes: Focus pane 1',
      detail: 'Focus the first pane',
      run: () => focusPaneIndex(0)
    },
    {
      id: 'cmd:focus-pane-2',
      label: 'Panes: Focus pane 2',
      detail: 'Focus the second pane',
      run: () => focusPaneIndex(1)
    },
    {
      id: 'cmd:focus-pane-3',
      label: 'Panes: Focus pane 3',
      detail: 'Focus the third pane',
      run: () => focusPaneIndex(2)
    },
    {
      id: 'cmd:focus-pane-4',
      label: 'Panes: Focus pane 4',
      detail: 'Focus the fourth pane',
      run: () => focusPaneIndex(3)
    }
  );

  // Agents (admin-only)
  const agents = uiState.agents.length > 0 ? uiState.agents : [{ id: 'main', name: 'main', displayName: 'main', emoji: '' }];
  for (const agent of agents) {
    const agentId = normalizeAgentId(agent?.id || 'main');
    const label = `Agent: ${formatAgentLabel(agent, { includeId: false })}`;
    items.push({
      id: `agent:${agentId}`,
      label,
      detail: agentId,
      run: () => {
        // Focus an existing chat pane if possible; otherwise create one.
        let pane = paneManager.panes.find((p) => p.kind === 'chat');
        if (!pane) pane = paneManager.addPane('chat');
        if (pane) {
          paneSetAgent(pane, agentId);
          paneManager.focusPanePrimary(pane);
        }
      }
    });
  }

  return items;
}

function renderCommandPalette() {
  const list = globalElements.commandPaletteList;
  const empty = globalElements.commandPaletteEmpty;
  if (!list) return;

  list.innerHTML = '';

  const items = commandPaletteState.filtered;
  if (!items.length) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  const selected = Math.max(0, Math.min(items.length - 1, commandPaletteState.selectedIndex));
  commandPaletteState.selectedIndex = selected;

  items.forEach((item, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'command-palette-item';
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', idx === selected ? 'true' : 'false');
    btn.dataset.commandPaletteId = item.id;
    btn.innerHTML = `
      <div class="command-palette-item-main">
        <div class="command-palette-item-label">${escapeHtml(item.label)}</div>
        <div class="command-palette-item-detail">${escapeHtml(item.detail || '')}</div>
      </div>
      <div class="command-palette-item-meta">${idx === selected ? '↵' : ''}</div>
    `;

    btn.addEventListener('mouseenter', () => {
      commandPaletteState.selectedIndex = idx;
      renderCommandPalette();
    });

    btn.addEventListener('click', () => {
      try {
        item.run?.();
      } finally {
        closeCommandPalette({ restoreFocus: false });
      }
    });

    list.appendChild(btn);
  });

  try {
    const active = list.querySelector('[aria-selected="true"]');
    active?.scrollIntoView?.({ block: 'nearest' });
  } catch {}
}

function filterCommandPalette(query) {
  commandPaletteState.query = String(query || '');
  const q = commandPaletteState.query.trim();
  const scored = commandPaletteState.items
    .map((item) => {
      const hay = `${item.label || ''} ${item.detail || ''} ${item.id || ''}`;
      return { item, score: scoreFuzzy(hay, q) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);

  commandPaletteState.filtered = scored;
  commandPaletteState.selectedIndex = 0;
  renderCommandPalette();
}

function openCommandPalette() {
  if (roleState.role !== 'admin') return;
  if (!uiState.authed) return;
  if (!globalElements.commandPaletteModal) return;

  commandPaletteState.open = true;
  commandPaletteState.items = buildCommandPaletteItems();
  commandPaletteState.filtered = commandPaletteState.items.slice();
  commandPaletteState.selectedIndex = 0;

  globalElements.commandPaletteModal.classList.add('open');
  globalElements.commandPaletteModal.setAttribute('aria-hidden', 'false');

  if (globalElements.commandPaletteInput) {
    globalElements.commandPaletteInput.value = '';
    // Defer focus until after the modal is painted so browsers reliably move focus.
    const focus = () => {
      try {
        globalElements.commandPaletteInput?.focus?.({ preventScroll: true });
        globalElements.commandPaletteInput?.select?.();
      } catch {}
    };
    try {
      requestAnimationFrame(() => requestAnimationFrame(focus));
    } catch {
      setTimeout(focus, 0);
    }
  }

  filterCommandPalette('');
}

// Agents (admin-only)

function openAgentsModal() {
  if (roleState.role !== 'admin') return;
  globalElements.agentsModal?.classList.add('open');
  globalElements.agentsModal?.setAttribute('aria-hidden', 'false');

  // Bootstrap persisted controls.
  if (globalElements.agentsActiveOnly) {
    globalElements.agentsActiveOnly.checked = storage.get(ADMIN_AGENT_ACTIVE_ONLY_KEY, 'false') === 'true';
  }
  if (globalElements.agentsActiveMinutes) {
    const minutes = Number(storage.get(ADMIN_AGENT_ACTIVE_MINUTES_KEY, '10')) || 10;
    globalElements.agentsActiveMinutes.value = String(Math.max(1, minutes));
  }

  renderAgentsModalList();

  // Focus search by default for fast filtering.
  try {
    globalElements.agentsSearch?.focus?.();
  } catch {}
}

function closeAgentsModal() {
  globalElements.agentsModal?.classList.remove('open');
  globalElements.agentsModal?.setAttribute('aria-hidden', 'true');
}

function renderAgentsModalList() {
  const root = globalElements.agentsList;
  if (!root) return;

  const search = String(globalElements.agentsSearch?.value || '').trim().toLowerCase();
  const activeOnly = !!globalElements.agentsActiveOnly?.checked;
  const withinMinutes = Math.max(1, Number(globalElements.agentsActiveMinutes?.value) || 10);

  const pins = getPinnedAgentIds();
  const baseAgents = uiState.agents.length > 0 ? uiState.agents : [{ id: 'main', name: 'main', displayName: 'main', emoji: '' }];

  const matches = (agent) => {
    const label = formatAgentLabel(agent, { includeId: true }).toLowerCase();
    if (search && !label.includes(search)) return false;
    if (activeOnly && !isAgentActive(agent.id, { withinMinutes })) return false;
    return true;
  };

  const filtered = baseAgents.filter(matches);
  const pinned = sortAgentsByLastSeen(filtered.filter((a) => pins.has(String(a?.id || '').trim())));
  const rest = sortAgentsByLastSeen(filtered.filter((a) => !pins.has(String(a?.id || '').trim())));

  root.innerHTML = '';

  const renderSection = (title, agents) => {
    if (!agents || agents.length === 0) return;
    const section = document.createElement('div');
    section.className = 'agents-section';
    section.innerHTML = `<div class="agents-section-title">${escapeHtml(title)}</div>`;

    const list = document.createElement('div');
    list.className = 'agents-rows';

    for (const agent of agents) {
      const id = String(agent?.id || '').trim();
      const row = document.createElement('div');
      row.className = 'agents-row';

      const label = formatAgentLabel(agent, { includeId: true });
      const pinnedNow = pins.has(id);

      row.innerHTML = `
        <button type="button" class="agents-pin" aria-label="${pinnedNow ? 'Unpin agent' : 'Pin agent'}" aria-pressed="${pinnedNow ? 'true' : 'false'}" data-agent-pin="${escapeHtml(id)}">${pinnedNow ? '★' : '☆'}</button>
        <div class="agents-row-main">
          <div class="agents-row-title">${escapeHtml(label)}</div>
          <div class="agents-row-meta">${escapeHtml(id)}${isAgentActive(id, { withinMinutes }) ? ' · active' : ''}</div>
        </div>
      `;

      const pinBtn = row.querySelector('[data-agent-pin]');
      pinBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePinnedAgentId(id);
        // Refresh both the modal list and any agent <select>s.
        paneManager.panes.forEach((p) => renderAgentOptions(p.elements?.agentSelect, p.agentId));
        renderAgentsModalList();
      });

      list.appendChild(row);
    }

    section.appendChild(list);
    root.appendChild(section);
  };

  renderSection('Pinned', pinned);
  renderSection('Agents', rest);

  const empty = pinned.length === 0 && rest.length === 0;
  if (globalElements.agentsEmpty) globalElements.agentsEmpty.hidden = !empty;
}

// Workqueue (admin-only)

const WORKQUEUE_STATUSES = ['ready', 'pending', 'claimed', 'in_progress', 'done', 'failed'];

const workqueueState = {
  queues: [],
  selectedQueue: '',
  statusFilter: new Set(['ready', 'pending', 'claimed', 'in_progress']),
  items: [],
  selectedItemId: null,
  sortKey: 'default',
  sortDir: 'desc',
  leaseTicker: null,
  autoRefreshEnabled: true,
  autoRefreshIntervalMs: 15000,
  autoRefreshTimer: null,
  sortingBootstrapped: false
};

function openWorkqueue() {
  if (roleState.role !== 'admin') return;
  globalElements.workqueueModal?.classList.add('open');
  globalElements.workqueueModal?.setAttribute('aria-hidden', 'false');
  // Sorting wiring is synchronous; bootstrap it immediately so UI tests can click sort buttons deterministically.
  ensureWorkqueueModalSorting();
  ensureWorkqueueBootstrapped();
  startWorkqueueAutoRefresh();
}

function closeWorkqueue() {
  stopWorkqueueAutoRefresh();
  globalElements.workqueueModal?.classList.remove('open');
  globalElements.workqueueModal?.setAttribute('aria-hidden', 'true');
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

function ensureWorkqueueModalSorting() {
  if (workqueueState.sortingBootstrapped) return;

  const btns = Array.from(document.querySelectorAll('[data-wq-modal-sort]'));
  if (!btns.length) return;

  workqueueState.sortingBootstrapped = true;

  const updateUi = () => {
    btns.forEach((btn) => {
      const key = btn.getAttribute('data-wq-modal-sort') || '';
      const active = key && key === workqueueState.sortKey;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.title = active ? (workqueueState.sortDir === 'asc' ? 'Sorted ascending' : 'Sorted descending') : '';
    });
  };

  const setSort = (key) => {
    const nextKey = String(key || 'default').trim() || 'default';
    if (workqueueState.sortKey === nextKey) {
      workqueueState.sortDir = workqueueState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      workqueueState.sortKey = nextKey;
      // sensible initial directions
      if (nextKey === 'title' || nextKey === 'claimedBy' || nextKey === 'status') workqueueState.sortDir = 'asc';
      else workqueueState.sortDir = 'desc';
    }
    updateUi();
    renderWorkqueueItems();
  };

  btns.forEach((btn) => {
    btn.addEventListener('click', () => setSort(btn.getAttribute('data-wq-modal-sort')));
  });

  updateUi();
}

async function ensureWorkqueueBootstrapped() {
  // Load persisted UI prefs
  try {
    const enabled = storage.get('clawnsole.wq.autorefresh.enabled');
    const interval = storage.get('clawnsole.wq.autorefresh.intervalMs');
    if (enabled !== null) workqueueState.autoRefreshEnabled = Boolean(enabled);
    if (interval !== null && Number(interval) > 0) workqueueState.autoRefreshIntervalMs = Number(interval);
  } catch {
    // ignore
  }

  if (globalElements.wqAutoRefreshEnabled) {
    globalElements.wqAutoRefreshEnabled.checked = !!workqueueState.autoRefreshEnabled;
  }
  if (globalElements.wqAutoRefreshInterval) {
    globalElements.wqAutoRefreshInterval.value = String(workqueueState.autoRefreshIntervalMs);
  }

  renderWorkqueueStatusFilters();
  ensureWorkqueueModalSorting();
  await fetchWorkqueueQueues();
  await fetchAndRenderWorkqueueItems();
  startWorkqueueLeaseTicker();
  startWorkqueueAutoRefresh();
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

function fmtAge(ts) {
  if (!ts) return '';
  const t = typeof ts === 'number' ? ts : Date.parse(String(ts));
  if (!Number.isFinite(t)) return '';
  const ms = Date.now() - t;
  if (ms < 0) return '';
  const min = Math.floor(ms / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `${day}d`;
  if (hr > 0) return `${hr}h`;
  if (min > 0) return `${min}m`;
  return 'now';
}

async function workqueueUpdateItem(itemId, patch) {
  if (!itemId) return null;
  const res = await fetch('/api/workqueue/update', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId, patch })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) throw new Error(String(data?.error || res.status));
  return data.item;
}

function getWorkqueueBoardColumns() {
  // Kanban defaults; respect the status filters by only showing enabled columns.
  const defs = [
    { status: 'ready', label: 'Ready' },
    { status: 'pending', label: 'Pending' },
    { status: 'claimed', label: 'Claimed' },
    { status: 'in_progress', label: 'In progress' },
    { status: 'done', label: 'Done' },
    { status: 'failed', label: 'Failed' }
  ];
  return defs.filter((d) => workqueueState.statusFilter.has(d.status));
}

function renderWorkqueueItems() {
  const body = globalElements.wqListBody;
  if (!body) return;

  // Swap the list area into a Kanban board.
  body.innerHTML = '';
  body.classList.remove('wq-list-body');
  body.classList.add('wq-board');

  const listRoot = body.closest('.wq-list');
  if (listRoot) listRoot.classList.add('wq-list-kanban');

  const header = listRoot?.querySelector('.wq-list-header');
  if (header) header.style.display = 'none';

  const itemsRaw = Array.isArray(workqueueState.items) ? workqueueState.items : [];
  const items = sortWorkqueueItems(itemsRaw, { sortKey: workqueueState.sortKey, sortDir: workqueueState.sortDir });

  if (!items.length) {
    globalElements.wqListEmpty.hidden = false;
  } else {
    globalElements.wqListEmpty.hidden = true;
  }

  const cols = getWorkqueueBoardColumns();
  const itemsByStatus = items.reduce((acc, it) => {
    const st = String(it?.status || 'ready');
    if (!acc[st]) acc[st] = [];
    acc[st].push(it);
    return acc;
  }, {});

  const now = Date.now();
  for (const colDef of cols) {
    const col = document.createElement('section');
    col.className = 'wq-board-col';
    col.setAttribute('data-wq-col', colDef.status);

    const colItems = Array.isArray(itemsByStatus[colDef.status]) ? itemsByStatus[colDef.status] : [];

    const head = document.createElement('div');
    head.className = 'wq-board-col-header';
    head.innerHTML = `
      <div class="wq-board-col-title">${escapeHtml(colDef.label)}</div>
      <div class="wq-board-col-count mono">${escapeHtml(String(colItems.length))}</div>
    `;

    const lane = document.createElement('div');
    lane.className = 'wq-board-lane';

    // Drag/drop: drop a card to change status.
    lane.addEventListener('dragover', (e) => {
      e.preventDefault();
      lane.classList.add('dragover');
    });
    lane.addEventListener('dragleave', () => lane.classList.remove('dragover'));
    lane.addEventListener('drop', async (e) => {
      e.preventDefault();
      lane.classList.remove('dragover');
      const itemId = String(e.dataTransfer?.getData('text/plain') || '').trim();
      if (!itemId) return;
      try {
        await workqueueUpdateItem(itemId, { status: colDef.status });
        await fetchAndRenderWorkqueueItems();
      } catch (err) {
        setWorkqueueActionStatus(`Status change failed: ${String(err)}`, 'err');
      }
    });

    for (const it of colItems) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'wq-card';
      if (it.id && it.id === workqueueState.selectedItemId) card.classList.add('selected');
      if (it.id) card.setAttribute('data-wq-item', it.id);

      // Allow dragging the whole card.
      card.draggable = true;
      card.addEventListener('dragstart', (e) => {
        if (!it.id) return;
        e.dataTransfer?.setData('text/plain', String(it.id));
        e.dataTransfer && (e.dataTransfer.effectAllowed = 'move');
      });

      const leaseMs = it.leaseUntil ? Number(it.leaseUntil) - now : NaN;
      const leaseLabel = it.leaseUntil ? fmtRemaining(leaseMs) : '';
      const status = String(it.status || '');
      const age = fmtAge(it.createdAt || it.updatedAt);
      const next = String(it.lastNote || '').trim();

      card.innerHTML = `
        <div class="wq-card-title">${escapeHtml(String(it.title || ''))}</div>
        <div class="wq-card-meta">
          <span class="wq-badge wq-badge-${escapeHtml(status)}">${escapeHtml(status)}</span>
          ${age ? `<span class="wq-card-chip mono">age ${escapeHtml(age)}</span>` : ''}
          ${leaseLabel ? `<span class="wq-card-chip mono">lease ${escapeHtml(leaseLabel)}</span>` : ''}
        </div>
        <div class="wq-card-fields">
          <div class="wq-card-field"><span class="k">prio</span> <span class="v mono">${escapeHtml(String(it.priority ?? ''))}</span></div>
          <div class="wq-card-field"><span class="k">owner</span> <span class="v">${escapeHtml(String(it.claimedBy || ''))}</span></div>
          <div class="wq-card-field"><span class="k">att</span> <span class="v mono">${escapeHtml(String(it.attempts ?? ''))}</span></div>
        </div>
        ${next ? `<div class="wq-card-next">${escapeHtml(next)}</div>` : ''}
      `;

      card.addEventListener('click', () => {
        workqueueState.selectedItemId = it.id || null;
        renderWorkqueueItems();
        renderWorkqueueInspect(it);
      });

      lane.appendChild(card);
    }

    col.appendChild(head);
    col.appendChild(lane);
    body.appendChild(col);
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

  const actions = document.createElement('div');
  actions.className = 'wq-inspect-actions';
  actions.innerHTML = `
    <button type="button" class="btn" data-wq-action="edit">Edit</button>
    <button type="button" class="btn danger" data-wq-action="delete">Delete</button>
  `;

  const meta = root.querySelector('.wq-inspect-meta');
  if (meta) meta.insertAdjacentElement('afterend', actions);
  else root.prepend(actions);

  const editBtn = actions.querySelector('[data-wq-action="edit"]');
  const deleteBtn = actions.querySelector('[data-wq-action="delete"]');

  editBtn?.addEventListener('click', () => workqueueEditItem(item));
  deleteBtn?.addEventListener('click', () => workqueueDeleteItem(item));
}

async function workqueueEditItem(item) {
  if (!item || !item.id) return;

  const title = prompt('Edit title', String(item.title || ''));
  if (title === null) return;

  const instructions = prompt('Edit instructions', String(item.instructions || ''));
  if (instructions === null) return;

  const priorityRaw = prompt('Edit priority (number)', String(item.priority ?? '0'));
  if (priorityRaw === null) return;
  const priority = Number(priorityRaw);

  const status = prompt('Edit status (ready|pending|claimed|in_progress|done|failed)', String(item.status || 'ready'));
  if (status === null) return;

  try {
    const res = await fetch('/api/workqueue/update', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: item.id,
        patch: {
          title,
          instructions,
          priority: Number.isFinite(priority) ? priority : item.priority,
          status
        }
      })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) throw new Error(data?.error || String(res.status));

    addFeed('ok', 'workqueue', 'updated item');
    // Refresh list + keep selection
    await fetchAndRenderWorkqueueItems();
    const updated = workqueueState.items.find((it) => it && it.id === item.id) || null;
    if (updated) {
      workqueueState.selectedItemId = updated.id;
      renderWorkqueueItems();
      renderWorkqueueInspect(updated);
    }
  } catch (err) {
    addFeed('err', 'workqueue', 'failed to update item: ' + String(err));
  }
}

async function workqueueDeleteItem(item) {
  if (!item || !item.id) return;
  const ok = confirm('Delete workqueue item?\n\n' + String(item.title || '') + '\n' + item.id);
  if (!ok) return;

  try {
    const res = await fetch('/api/workqueue/delete', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) throw new Error(data?.error || String(res.status));

    addFeed('ok', 'workqueue', 'deleted item');
    if (workqueueState.selectedItemId === item.id) workqueueState.selectedItemId = null;
    await fetchAndRenderWorkqueueItems();
    renderWorkqueueInspect(null);
  } catch (err) {
    addFeed('err', 'workqueue', 'failed to delete item: ' + String(err));
  }
}

// --- Minimal Workqueue Pane (Issue #22c) ---
// Standalone renderer that can be mounted into any container.
// Acceptance: renderWorkqueuePane(rootEl, { queue }) exists and can be called via a debug hook.

async function fetchWorkqueueSummary(queue = '') {
  const params = new URLSearchParams();
  if (queue) params.set('queue', queue);
  const url = `/api/workqueue/summary${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error(data?.error || String(res.status));
  return data;
}

async function fetchWorkqueueItems({ queue = '', statuses = [] } = {}) {
  const params = new URLSearchParams();
  if (queue) params.set('queue', queue);
  if (Array.isArray(statuses) && statuses.length) params.set('status', statuses.join(','));
  const url = `/api/workqueue/items${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error(data?.error || String(res.status));
  return Array.isArray(data.items) ? data.items : [];
}

function renderWorkqueueCounts(rootEl, counts) {
  const statuses = ['ready', 'pending', 'claimed', 'in_progress', 'done', 'failed'];
  const list = document.createElement('dl');
  list.className = 'wq-counts';
  for (const s of statuses) {
    const dt = document.createElement('dt');
    dt.textContent = s;
    const dd = document.createElement('dd');
    dd.textContent = String(counts?.[s] || 0);
    list.appendChild(dt);
    list.appendChild(dd);
  }
  rootEl.appendChild(list);
}

function renderWorkqueueSimpleList(rootEl, items, { emptyText }) {
  const ul = document.createElement('ul');
  ul.className = 'wq-simple-list';

  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'hint';
    li.textContent = emptyText || 'No items.';
    ul.appendChild(li);
    rootEl.appendChild(ul);
    return;
  }

  for (const it of items) {
    const li = document.createElement('li');
    const lease = it.leaseUntil ? new Date(Number(it.leaseUntil)).toISOString() : '';
    li.innerHTML = `<div><strong>${escapeHtml(String(it.title || ''))}</strong></div>
<div class="meta">${escapeHtml(String(it.status || ''))}${it.claimedBy ? ` • ${escapeHtml(String(it.claimedBy))}` : ''}${lease ? ` • lease ${escapeHtml(lease)}` : ''}</div>`;
    ul.appendChild(li);
  }
  rootEl.appendChild(ul);
}

async function renderWorkqueuePane(rootEl, { queue = '' } = {}) {
  if (!rootEl) return;
  const q = String(queue || '').trim();

  rootEl.innerHTML = '';
  rootEl.setAttribute('role', 'region');
  rootEl.setAttribute('aria-label', `Workqueue${q ? `: ${q}` : ''}`);

  const title = document.createElement('h2');
  title.textContent = `Workqueue${q ? `: ${q}` : ''}`;
  rootEl.appendChild(title);

  const statusLine = document.createElement('div');
  statusLine.className = 'wq-statusline';
  statusLine.textContent = 'Loading…';
  rootEl.appendChild(statusLine);

  try {
    const [summary, readyPending] = await Promise.all([
      fetchWorkqueueSummary(q),
      fetchWorkqueueItems({ queue: q, statuses: ['ready', 'pending'] })
    ]);

    statusLine.textContent = 'Loaded.';

    const countsSection = document.createElement('section');
    countsSection.innerHTML = '<h3>Counts</h3>';
    renderWorkqueueCounts(countsSection, summary.counts || {});
    rootEl.appendChild(countsSection);

    const activeSection = document.createElement('section');
    activeSection.innerHTML = '<h3>Active (claimed / in_progress)</h3>';
    renderWorkqueueSimpleList(activeSection, Array.isArray(summary.active) ? summary.active : [], { emptyText: 'No active items.' });
    rootEl.appendChild(activeSection);

    const readySection = document.createElement('section');
    readySection.innerHTML = '<h3>Ready / Pending</h3>';
    const sorted = readyPending
      .slice()
      .sort((a, b) => (b.priority || 0) - (a.priority || 0) || String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
    renderWorkqueueSimpleList(readySection, sorted, { emptyText: 'No ready/pending items.' });
    rootEl.appendChild(readySection);

    // Make scrollable without requiring pane-manager changes.
    rootEl.style.overflow = 'auto';
  } catch (err) {
    statusLine.textContent = `Failed to load: ${String(err)}`;
  }
}

// Temporary debug hook:
// In DevTools: window.__debug.renderWorkqueuePane(document.querySelector('#someRoot'), { queue: 'dev-team' })
window.__debug = window.__debug || {};
window.__debug.renderWorkqueuePane = renderWorkqueuePane;


async function fetchAndRenderWorkqueueItemsForPane(pane) {
  if (!pane || pane.kind !== 'workqueue') return;
  const body = pane.elements?.thread?.querySelector('[data-wq-list-body]');
  if (!body) return;

  const queue = (pane.workqueue?.queue || '').trim();
  const statuses = Array.isArray(pane.workqueue?.statusFilter) ? pane.workqueue.statusFilter : [];
  const params = new URLSearchParams();
  if (queue) params.set('queue', queue);
  if (statuses.length) params.set('status', statuses.join(','));
  const url = `/api/workqueue/items${params.toString() ? `?${params.toString()}` : ''}`;

  const statusLine = pane.elements.thread.querySelector('[data-wq-statusline]');
  if (statusLine) statusLine.textContent = 'Loading...';

  try {
    const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    pane.workqueue.items = items;
    if (statusLine) statusLine.textContent = `${items.length} item(s)`;
    renderWorkqueuePaneItems(pane);
  } catch (err) {
    if (statusLine) statusLine.textContent = `Failed to load: ${String(err)}`;
  }
}

function renderWorkqueuePaneItems(pane) {
  const body = pane.elements?.thread?.querySelector('[data-wq-list-body]');
  const empty = pane.elements?.thread?.querySelector('[data-wq-empty]');
  if (!body) return;
  body.innerHTML = '';

  const itemsRaw = Array.isArray(pane.workqueue?.items) ? pane.workqueue.items : [];
  const items = sortWorkqueueItems(itemsRaw, { sortKey: pane.workqueue?.sortKey, sortDir: pane.workqueue?.sortDir });

  if (empty) {
    const hasItems = items.length > 0;
    empty.hidden = hasItems;
    if (!hasItems) {
      const queue = String(pane.workqueue?.queue || '').trim() || 'dev-team';
      const statuses = Array.isArray(pane.workqueue?.statusFilter) ? pane.workqueue.statusFilter : [];
      const statusLabel = statuses.length ? statuses.join(', ') : 'default';
      empty.innerHTML = `
        <div class="empty-state">
          <div style="font-weight:700; margin-bottom:6px;">No items in this queue.</div>
          <div class="hint">Queue: <span class="mono">${escapeHtml(queue)}</span> · Status: <span class="mono">${escapeHtml(statusLabel)}</span></div>
          <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
            <button type="button" class="secondary" data-wq-empty-enqueue>Enqueue item</button>
            <button type="button" class="secondary" data-wq-empty-refresh>Refresh</button>
          </div>
          <div class="hint" style="margin-top:8px;">Tip: use “Enqueue new item” above, or configure queues on the server.</div>
        </div>
      `;

      const refreshBtn = pane.elements?.thread?.querySelector('[data-wq-refresh]');
      const enqueueDetails = pane.elements?.thread?.querySelector('details.wq-enqueue');
      empty.querySelector('[data-wq-empty-refresh]')?.addEventListener('click', () => refreshBtn?.click());
      empty.querySelector('[data-wq-empty-enqueue]')?.addEventListener('click', () => {
        try {
          enqueueDetails?.setAttribute('open', '');
          enqueueDetails?.scrollIntoView({ block: 'nearest' });
          pane.elements?.thread?.querySelector('[data-wq-enqueue-title]')?.focus();
        } catch {}
      });
    }
  }

  const now = Date.now();
  for (const it of items) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'wq-row';
    if (it.id && it.id === pane.workqueue.selectedItemId) row.classList.add('selected');

    const leaseMs = it.leaseUntil ? Number(it.leaseUntil) - now : NaN;
    const leaseLabel = it.leaseUntil ? fmtRemaining(leaseMs) : '';
    const status = String(it.status || '');

    row.innerHTML = `
      <div class="wq-col title">${escapeHtml(String(it.title || ''))}</div>
      <div class="wq-col status"><span class="wq-badge wq-badge-${escapeHtml(status)}">${escapeHtml(status)}</span></div>
      <div class="wq-col prio mono">${escapeHtml(String(it.priority ?? ''))}</div>
      <div class="wq-col attempts mono">${escapeHtml(String(it.attempts ?? ''))}</div>
      <div class="wq-col claimedBy">${escapeHtml(String(it.claimedBy || ''))}</div>
      <div class="wq-col lease mono" data-lease-until="${escapeHtml(String(it.leaseUntil || ''))}">${escapeHtml(leaseLabel)}</div>
    `;

    row.addEventListener('click', () => {
      pane.workqueue.selectedItemId = it.id || null;
      renderWorkqueuePaneItems(pane);
      renderWorkqueuePaneInspect(pane, it);
    });

    body.appendChild(row);
  }

  // Keep inspect in sync if selection vanished.
  if (pane.workqueue.selectedItemId && !items.some((it) => it.id === pane.workqueue.selectedItemId)) {
    pane.workqueue.selectedItemId = null;
    renderWorkqueuePaneInspect(pane, null);
  }
}

function renderWorkqueuePaneInspect(pane, item) {
  const root = pane.elements?.thread?.querySelector('[data-wq-inspect]');
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

function stopWorkqueueAutoRefresh() {
  if (workqueueState.autoRefreshTimer) {
    clearInterval(workqueueState.autoRefreshTimer);
    workqueueState.autoRefreshTimer = null;
  }
}

function startWorkqueueAutoRefresh() {
  stopWorkqueueAutoRefresh();
  if (!workqueueState.autoRefreshEnabled) return;
  if (!globalElements.workqueueModal || !globalElements.workqueueModal.classList.contains('open')) return;

  const intervalMs = Number(workqueueState.autoRefreshIntervalMs) || 15000;
  workqueueState.autoRefreshTimer = setInterval(() => {
    if (!globalElements.workqueueModal || !globalElements.workqueueModal.classList.contains('open')) return;
    fetchAndRenderWorkqueueItems();
  }, Math.max(2000, intervalMs));
}

let wqStatusTimer = null;
function setWorkqueueActionStatus(text, kind = 'info') {
  const el = globalElements.wqActionStatus;
  if (!el) return;
  el.textContent = String(text || '');
  el.dataset.kind = kind;
  if (wqStatusTimer) clearTimeout(wqStatusTimer);
  if (text) {
    wqStatusTimer = setTimeout(() => {
      if (globalElements.wqActionStatus) globalElements.wqActionStatus.textContent = '';
    }, 6000);
  }
}

async function workqueueEnqueueFromUi() {
  if (roleState.role !== 'admin') return;
  const queue = (workqueueState.selectedQueue || '').trim();
  if (!queue) {
    setWorkqueueActionStatus('Select a queue before enqueueing.', 'err');
    return;
  }

  const title = (globalElements.wqEnqueueTitle?.value || '').trim();
  const instructions = (globalElements.wqEnqueueInstructions?.value || '').trim();
  const dedupeKey = (globalElements.wqEnqueueDedupeKey?.value || '').trim();
  const priority = Number(globalElements.wqEnqueuePriority?.value || 0);

  try {
    const res = await fetch('/api/workqueue/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ queue, title, instructions, priority, dedupeKey })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      setWorkqueueActionStatus(`Enqueue failed: ${data?.error || res.status}`, 'err');
      return;
    }

    const item = data.item || null;
    setWorkqueueActionStatus(item && item._deduped ? `Deduped (already exists): ${item.id}` : `Enqueued: ${item?.id || ''}`);

    await fetchAndRenderWorkqueueItems();
    if (item?.id) {
      workqueueState.selectedItemId = item.id;
      renderWorkqueueItems();
      renderWorkqueueInspect(item);
    }
  } catch (err) {
    setWorkqueueActionStatus(`Enqueue failed: ${String(err)}`, 'err');
  }
}

async function workqueueClaimNextFromUi() {
  if (roleState.role !== 'admin') return;
  const agentId = (globalElements.wqClaimAgentId?.value || '').trim() || 'dev';
  const leaseMs = Number(globalElements.wqClaimLeaseMs?.value || 0) || 0;
  const queue = (workqueueState.selectedQueue || '').trim();

  try {
    const res = await fetch('/api/workqueue/claim-next', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ agentId, leaseMs, queue })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      setWorkqueueActionStatus(`Claim failed: ${data?.error || res.status}`, 'err');
      return;
    }
    const item = data.item || null;
    if (!item) {
      setWorkqueueActionStatus('No ready items to claim.');
      await fetchAndRenderWorkqueueItems();
      return;
    }
    setWorkqueueActionStatus(`Claimed: ${item.id}`);
    await fetchAndRenderWorkqueueItems();
    workqueueState.selectedItemId = item.id;
    renderWorkqueueItems();
    renderWorkqueueInspect(item);
  } catch (err) {
    setWorkqueueActionStatus(`Claim failed: ${String(err)}`, 'err');
  }
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

function computeSessionKey({ agentId, paneKey }) {
  const baseDeviceLabel = computeBaseDeviceLabel();
  const resolvedAgent = normalizeAgentId(agentId || 'main');
  const deviceLabel = paneKey ? `${baseDeviceLabel}-${paneKey}` : baseDeviceLabel;
  return `agent:${resolvedAgent}:admin:${deviceLabel}`;
}

function computeChatKey({ agentId }) {
  const resolvedAgent = normalizeAgentId(agentId || 'main');
  return `agent:${resolvedAgent}:admin`;
}

function computeLegacySessionKey({ agentId }) {
  const baseDeviceLabel = globalElements.deviceId.value.trim() || 'device';
  const resolvedAgent = normalizeAgentId(agentId || 'main');
  return `agent:${resolvedAgent}:admin:${baseDeviceLabel}`;
}

function computeConnectClient({ paneKey }) {
  const baseDeviceLabel = computeBaseDeviceLabel();
  const baseClientId = globalElements.clientId.value.trim() || 'webchat-ui';
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

function paneAssistantLabel(pane) {
  const id = pane.agentId || 'main';
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

  paneRenderStopControl(pane);
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
  paneRenderStopControl(pane);
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

  paneRenderChatEmptyState(pane);

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

function paneRenderChatEmptyState(pane) {
  if (!pane || pane.kind !== 'chat') return;
  const thread = pane.elements?.thread;
  if (!thread) return;

  // Only show when the thread is otherwise empty.
  const hasHistory = Array.isArray(pane.chat?.history) && pane.chat.history.length > 0;
  const existing = thread.querySelector('[data-pane-empty-state]');
  if (hasHistory) {
    existing?.remove();
    return;
  }

  if (existing) return;

  const wrap = document.createElement('div');
  wrap.setAttribute('data-pane-empty-state', '1');
  wrap.className = 'hint';
  wrap.style.padding = '10px 8px';

  const agent = paneAssistantLabel(pane);
  const hasAgent = Boolean(pane.role !== 'admin' || (pane.agentId && String(pane.agentId).trim()));

  wrap.innerHTML = `
    <div style="font-weight:700; margin-bottom:6px;">${hasAgent ? 'Ready to chat.' : 'Select an agent to chat with.'}</div>
    <div class="hint">Target: <span class="mono">${escapeHtml(agent || '—')}</span></div>
    ${pane.role === 'admin' ? '<div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;"><button type="button" class="secondary" data-pane-empty-pick-agent>Pick agent…</button></div>' : ''}
  `;

  wrap.querySelector('[data-pane-empty-pick-agent]')?.addEventListener('click', () => {
    try {
      pane._agentPickerBtn?.click?.();
    } catch {}
    try {
      pane.elements?.agentSelect?.focus?.();
    } catch {}
  });

  thread.appendChild(wrap);
}

function paneAddChatMessage(pane, { role, text, runId, streaming = false, persist = true, metaLabel = null, state = null, actions = null } = {}) {
  // If we're adding content, ensure any empty-state copy is gone.
  try {
    pane.elements?.thread?.querySelector('[data-pane-empty-state]')?.remove();
  } catch {}

  const shouldPin = pane.scroll.pinned || isNearBottom(pane.elements.thread);
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}${streaming ? ' streaming' : ''}`;
  bubble.dataset.chatRole = role;
  if (runId) bubble.dataset.runId = String(runId);
  if (state) bubble.dataset.chatState = String(state);

  const meta = document.createElement('div');
  meta.className = 'chat-meta';
  meta.textContent = metaLabel || (role === 'user' ? 'You' : paneAssistantLabel(pane));

  const body = document.createElement('div');
  body.className = 'chat-text';
  body.innerHTML = renderMarkdown(text || '');

  bubble.appendChild(meta);
  bubble.appendChild(body);

  if (actions && Array.isArray(actions) && actions.length > 0) {
    const actionsRow = document.createElement('div');
    actionsRow.className = 'chat-actions-row';
    actions.forEach((action) => {
      if (!action) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chat-action ${action.className || ''}`.trim();
      btn.textContent = String(action.label || 'Action');
      btn.disabled = Boolean(action.disabled);
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (btn.disabled) return;
        try {
          action.onClick && action.onClick();
        } catch (err) {
          addFeed('err', 'chat', String(err));
        }
      });
      actionsRow.appendChild(btn);
    });
    bubble.appendChild(actionsRow);
  }

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

  return bubble;
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
    paneRenderStopControl(pane);
    return;
  }
  if (!pane.connected) {
    pane.elements.input.placeholder = 'Reconnecting... (Drafting enabled)';
    paneRenderStopControl(pane);
    return;
  }
  pane.elements.input.placeholder = `Message ${paneAssistantLabel(pane)}...`;
  paneRenderStopControl(pane);
}

function paneIsAbortable(pane) {
  if (!pane) return false;
  if (!uiState.authed) return false;
  if (!pane.connected) return false;
  if (pane.abortState && pane.abortState.active) return true;
  return Boolean(pane.thinking?.active || (pane.chat?.runs && pane.chat.runs.size > 0));
}

function paneRenderStopControl(pane) {
  const btn = pane?.elements?.stopBtn;
  if (!btn) return;
  const visible = Boolean(uiState.authed && pane.connected && (pane.thinking?.active || (pane.chat?.runs && pane.chat.runs.size > 0) || (pane.abortState && pane.abortState.active)));
  btn.hidden = !visible;

  const isCanceling = Boolean(pane.abortState && pane.abortState.active);
  btn.disabled = !uiState.authed || !pane.connected || isCanceling;
  btn.setAttribute('aria-label', isCanceling ? 'Canceling…' : 'Stop generating');
}


async function paneAbortRun(pane) {
  if (!pane || !uiState.authed || !pane.connected) return;
  if (pane.abortState && pane.abortState.active) return;

  pane.abortState.active = true;
  pane.abortState.requestedAt = Date.now();
  paneRenderStopControl(pane);

  const sessionKey = pane.sessionKey();
  const runId = pane.activeRunId;

  const finishLocalCanceled = () => {
    const rid = pane.activeRunId || runId;
    if (rid) {
      try {
        const entry = pane.chat?.runs?.get(rid);
        const current = entry?.body?.textContent || '';
        const nextText = current ? `${current}\n\n_(canceled)_` : '_(canceled)_';
        paneUpdateChatRun(pane, rid, nextText, true);
      } catch {}
    } else {
      paneAddChatMessage(pane, { role: 'assistant', text: '_Canceled._', persist: true, state: 'canceled', metaLabel: `${paneAssistantLabel(pane)} · Canceled` });
    }
    paneStopThinking(pane);
    pane.activeRunId = null;
  };

  // Fallback: if we don't get a terminal event quickly, reset the session.
  if (pane.abortState.timer) {
    clearTimeout(pane.abortState.timer);
    pane.abortState.timer = null;
  }
  pane.abortState.timer = setTimeout(() => {
    try {
      pane.client.request('sessions.reset', { key: sessionKey });
    } catch {}
    finishLocalCanceled();
    pane.abortState.active = false;
    paneRenderStopControl(pane);
  }, 2000);

  try {
    await pane.client.request('chat.abort', { sessionKey, runId: runId || undefined });
  } catch (err) {
    addFeed('err', 'chat.abort', String(err));
  } finally {
    if (pane.abortState.timer) {
      clearTimeout(pane.abortState.timer);
      pane.abortState.timer = null;
    }
    pane.abortState.active = false;
    paneRenderStopControl(pane);
  }
}

function paneEnsureHiddenWelcome(pane) {
  const sessionKey = pane.sessionKey();
  const storageKey = `clawnsole.welcome.${sessionKey}`;
  if (storage.get(storageKey)) return;

  const message = 'Welcome! You are in Admin mode. You can assist with full OpenClaw capabilities.';
  pane.client.request('chat.inject', { sessionKey, message, label: 'Welcome' });
  storage.set(storageKey, 'sent');
}

function paneEnqueueOutbound(pane, { message, sessionKey, idempotencyKey, bubble }) {
  pane.outbox.push({
    localId: idempotencyKey,
    message,
    sessionKey,
    idempotencyKey,
    ts: Date.now(),
    state: 'queued',
    bubble: bubble || null
  });
}

function paneUpdateOutboundBubble(entry) {
  if (!entry || !entry.bubble) return;
  const bubble = entry.bubble;
  bubble.dataset.chatState = entry.state;
  bubble.classList.toggle('queued', entry.state === 'queued');
  bubble.classList.toggle('sending', entry.state === 'sending');
  bubble.classList.toggle('failed', entry.state === 'failed');

  const meta = bubble.querySelector('.chat-meta');
  if (meta) {
    if (entry.state === 'queued') meta.textContent = 'You · Queued (not sent)';
    else if (entry.state === 'sending') meta.textContent = 'You · Sending…';
    else if (entry.state === 'failed') meta.textContent = 'You · Failed to send';
    else meta.textContent = 'You';
  }
}

function panePersistUserMessage(pane, text) {
  try {
    pane.chat.history.push({ role: 'user', text: text || '', ts: Date.now() });
    paneSaveChatHistory(pane);
  } catch (err) {
    addFeed('err', 'chat', `failed to persist user message: ${String(err)}`);
  }
}

function paneRemoveOutboundById(pane, localId) {
  const idx = pane.outbox.findIndex((m) => m.localId === localId);
  if (idx >= 0) {
    const [removed] = pane.outbox.splice(idx, 1);
    return removed;
  }
  return null;
}

function panePumpOutbox(pane) {
  if (!pane.connected || !uiState.authed) return;
  if (pane.inFlight) return;
  const next = pane.outbox.shift();
  if (!next) return;

  pane.inFlight = next;
  next.state = 'sending';
  paneUpdateOutboundBubble(next);

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

  pane.client
    .request('chat.send', {
      sessionKey: next.sessionKey,
      message: next.message,
      deliver: true,
      idempotencyKey: next.idempotencyKey
    })
    .then(() => {
      // Mark sent once the gateway acks the send.
      next.state = 'sent';
      paneUpdateOutboundBubble(next);
      panePersistUserMessage(pane, next.message);
      pane.pendingSend = null;
      pane.inFlight = null;
      panePumpOutbox(pane);
    })
    .catch((err) => {
      addFeed('err', 'chat.send', String(err));
      next.state = 'failed';
      paneUpdateOutboundBubble(next);
      // Put it back at the front so user can edit/delete/retry manually.
      pane.inFlight = null;
      pane.pendingSend = null;
      pane.outbox.unshift(next);
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

  // Guest mode removed.

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

  const localId = idempotencyKey;

  const makeActions = () => {
    const entry = pane.outbox.find((m) => m.localId === localId) || (pane.inFlight && pane.inFlight.localId === localId ? pane.inFlight : null);
    const state = entry ? entry.state : 'queued';
    const disabled = state === 'sending' || state === 'sent';

    return [
      {
        label: 'Edit',
        className: 'edit',
        disabled,
        onClick: () => {
          const target = pane.outbox.find((m) => m.localId === localId);
          if (!target) return;
          const nextText = window.prompt('Edit queued message:', target.message || '');
          if (nextText === null) return;
          const trimmed = String(nextText).trim();
          if (!trimmed) return;
          target.message = trimmed;
          const body = target.bubble ? target.bubble.querySelector('.chat-text') : null;
          if (body) body.innerHTML = renderMarkdown(trimmed);
        }
      },
      {
        label: 'Delete',
        className: 'delete',
        disabled,
        onClick: () => {
          const target = pane.outbox.find((m) => m.localId === localId);
          if (!target) return;
          if (!window.confirm('Delete this queued message? It will not be sent.')) return;
          paneRemoveOutboundById(pane, localId);
          try {
            target.bubble && target.bubble.remove();
          } catch {}
        }
      }
    ];
  };

  // Render queued bubble (distinct from sent). We persist only after gateway ack.
  const bubble = paneAddChatMessage(pane, {
    role: 'user',
    text: outbound,
    persist: false,
    metaLabel: 'You · Queued (not sent)',
    state: 'queued',
    actions: makeActions()
  });

  pane.scroll.pinned = true;
  scrollToBottom(pane, true);
  triggerFiring(1.6, 3);
  paneEnqueueOutbound(pane, { message: outbound, sessionKey, idempotencyKey, bubble });
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
      pane.activeRunId = runId || pane.activeRunId;
      paneUpdateChatRun(pane, runId, text, false);
      paneRenderStopControl(pane);
      triggerFiring(2, 4);
    } else if (payload.state === 'final') {
      paneStopThinking(pane);
      paneUpdateChatRun(pane, runId, text, true);
      pane.activeRunId = null;
      paneRenderStopControl(pane);
      pane.pendingSend = null;
      pane.inFlight = null;
      panePumpOutbox(pane);
      triggerFiring(1.2, 2);
    } else if (payload.state === 'error') {
      paneStopThinking(pane);
      paneUpdateChatRun(pane, runId, payload.errorMessage || 'Chat error', true);
      pane.activeRunId = null;
      paneRenderStopControl(pane);
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
      const scopes = ['operator.read', 'operator.write', 'operator.admin'];
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
      paneEnsureHiddenWelcome(pane);
      pane.client.request('sessions.resolve', { key: pane.sessionKey() });

      // Refresh the agent list when we regain connectivity (debounced) so new agents appear
      // without forcing a full page reload.
      scheduleAgentRefresh('reconnected');

      // If we disconnected mid-stream, pull remote history to catch up.
      paneScheduleCatchUp(pane);

      // Resume sending queued messages.
      panePumpOutbox(pane);

      try {
        if (typeof pane.onConnectedHook === 'function') pane.onConnectedHook();
      } catch {}
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

function agentIdExists(agentId) {
  const id = normalizeAgentId(agentId || 'main');
  return uiState.agents.some((a) => String(a?.id || '').trim() === id);
}

function renderPaneAgentIdentity(pane) {
  if (!pane || pane.role !== 'admin') return;
  const elements = pane.elements;
  if (!elements) return;

  const agentId = normalizeAgentId(pane.agentId || 'main');
  const known = uiState.agents.length === 0 ? true : agentIdExists(agentId);
  const agent = getAgentRecord(agentId);

  if (elements.agentLabel) {
    // Keep this short; the chooser shows full labels/ids.
    const emoji = typeof agent?.emoji === 'string' ? agent.emoji.trim() : '';
    const name =
      (typeof agent?.displayName === 'string' && agent.displayName.trim()) ||
      (typeof agent?.name === 'string' && agent.name.trim()) ||
      agentId;
    elements.agentLabel.textContent = `${emoji ? `${emoji} ` : ''}${name}`;
  }

  if (elements.root) {
    elements.root.dataset.agentMissing = known ? 'false' : 'true';
  }

  if (elements.agentWarning) {
    if (known) {
      elements.agentWarning.hidden = true;
      elements.agentWarning.textContent = '';
    } else {
      elements.agentWarning.hidden = false;
      elements.agentWarning.textContent = `Selected agent “${agentId}” is unavailable — choose a replacement.`;
    }
  }
}

let agentChooserState = { openForPaneKey: null, el: null };

function closeAgentChooser() {
  try {
    agentChooserState.el?.remove();
  } catch {}
  agentChooserState = { openForPaneKey: null, el: null };
}

function openAgentChooser(pane) {
  if (!pane || pane.role !== 'admin') return;
  closeAgentChooser();

  const backdrop = document.createElement('div');
  backdrop.className = 'agent-chooser-backdrop';
  backdrop.setAttribute('role', 'presentation');

  const dialog = document.createElement('div');
  dialog.className = 'agent-chooser';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', 'Choose agent');

  const header = document.createElement('div');
  header.className = 'agent-chooser-header';

  const title = document.createElement('div');
  title.className = 'agent-chooser-title';
  title.textContent = 'Choose agent for this pane';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn';
  closeBtn.type = 'button';
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Close agent chooser');
  closeBtn.addEventListener('click', () => closeAgentChooser());

  header.appendChild(title);
  header.appendChild(closeBtn);

  const list = document.createElement('div');
  list.className = 'agent-chooser-list';

  const agents = uiState.agents.length > 0 ? uiState.agents : [{ id: 'main', displayName: 'main', name: 'main', emoji: '' }];
  const current = normalizeAgentId(pane.agentId || 'main');

  for (const agent of agents) {
    const id = normalizeAgentId(agent?.id || 'main');
    const item = document.createElement('button');
    item.className = 'agent-chooser-item';
    item.type = 'button';
    item.setAttribute('aria-current', id === current ? 'true' : 'false');

    const left = document.createElement('div');
    left.style.minWidth = '0';

    const label = document.createElement('div');
    label.textContent = formatAgentLabel(agent, { includeId: false });

    const meta = document.createElement('div');
    meta.className = 'agent-chooser-meta';
    meta.textContent = id;

    left.appendChild(label);
    left.appendChild(meta);

    const right = document.createElement('div');
    right.className = 'agent-chooser-meta';
    right.textContent = id === current ? 'selected' : 'switch';

    item.appendChild(left);
    item.appendChild(right);

    item.addEventListener('click', () => {
      paneSetAgent(pane, id);
      closeAgentChooser();
    });

    list.appendChild(item);
  }

  dialog.appendChild(header);
  dialog.appendChild(list);
  backdrop.appendChild(dialog);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeAgentChooser();
  });

  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAgentChooser();
      }
    },
    { once: true }
  );

  document.body.appendChild(backdrop);
  agentChooserState = { openForPaneKey: pane.key, el: backdrop };
}

function paneSetAgent(pane, nextAgentId) {
  if (pane.role !== 'admin') return;
  const next = normalizeAgentId(nextAgentId);
  if (next === pane.agentId) return;
  pane.agentId = next;
  markAgentSeen(next);
  storage.set(ADMIN_DEFAULT_AGENT_KEY, next);
  try {
    if (pane.elements.agentSelect) pane.elements.agentSelect.value = next;
  } catch {}
  renderPaneAgentIdentity(pane);

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

  const baseAgents =
    uiState.agents.length > 0
      ? uiState.agents
      : [{ id: 'main', name: 'main', displayName: 'main', emoji: '' }];

  const pins = getPinnedAgentIds();
  const pinned = sortAgentsByLastSeen(baseAgents.filter((a) => pins.has(String(a?.id || '').trim())));
  const rest = sortAgentsByLastSeen(baseAgents.filter((a) => !pins.has(String(a?.id || '').trim())));

  const appendAgentOption = (parent, agent) => {
    const opt = document.createElement('option');
    opt.value = agent.id;
    opt.textContent = formatAgentLabel(agent, { includeId: true });
    parent.appendChild(opt);
  };

  if (pinned.length > 0) {
    const og = document.createElement('optgroup');
    og.label = 'Pinned';
    pinned.forEach((a) => appendAgentOption(og, a));
    selectEl.appendChild(og);
  }

  const ogAll = document.createElement('optgroup');
  ogAll.label = pinned.length > 0 ? 'All agents' : 'Agents';
  rest.forEach((a) => appendAgentOption(ogAll, a));
  selectEl.appendChild(ogAll);

  selectEl.value = normalizeAgentId(agentId || 'main');
}

function createPane({ key, role, kind = 'chat', agentId, queue, statusFilter, sortKey, sortDir, closable = true } = {}) {
  const template = globalElements.paneTemplate;
  const root = template.content.firstElementChild.cloneNode(true);
  const elements = {
    root,
    name: root.querySelector('[data-pane-name]'),
    agentSelect: root.querySelector('[data-pane-agent-select]'),
    agentWrap: root.querySelector('[data-pane-agent-wrap]') || root.querySelector('.pane-agent'),
    agentButton: root.querySelector('[data-pane-agent-button]'),
    agentLabel: root.querySelector('[data-pane-agent-label]'),
    agentWarning: root.querySelector('[data-pane-agent-warning]'),
    status: root.querySelector('[data-pane-status]'),
    helpDetails: root.querySelector('[data-pane-help]'),
    helpPopover: root.querySelector('[data-pane-help-popover]'),
    closeBtn: root.querySelector('[data-pane-close]'),
    thread: root.querySelector('[data-pane-thread]'),
    scrollDownBtn: root.querySelector('[data-pane-scroll-down]'),
    inputRow: root.querySelector('.chat-input-row'),
    input: root.querySelector('[data-pane-input]'),
    commandHints: root.querySelector('[data-pane-command-hints]'),
    fileInput: root.querySelector('[data-pane-file-input]'),
    attachBtn: root.querySelector('[data-pane-attach]'),
    attachmentStatus: root.querySelector('[data-pane-attachment-status]'),
    attachmentList: root.querySelector('[data-pane-attachment-list]'),
    sendBtn: root.querySelector('[data-pane-send]'),
    stopBtn: root.querySelector('[data-pane-stop]')
  };

  const pane = {
    key,
    role,
    kind: (() => {
      const allowed = new Set(['chat', 'workqueue', 'cron', 'timeline']);
      const k = String(kind || 'chat').trim().toLowerCase();
      return allowed.has(k) ? k : k.startsWith('w') ? 'workqueue' : 'chat';
    })(),
    agentId: role === 'admin' ? normalizeAgentId(agentId || 'main') : null,
    workqueue: {
      queue: (queue || 'dev-team').trim() || 'dev-team',
      statusFilter: Array.isArray(statusFilter) ? statusFilter : ['ready', 'pending', 'claimed', 'in_progress'],
      items: [],
      selectedItemId: null,
      sortKey: typeof sortKey === 'string' && sortKey.trim() ? sortKey.trim() : 'default',
      sortDir: sortDir === 'asc' ? 'asc' : 'desc'
    },
    connected: false,
    statusState: 'disconnected',
    statusMeta: '',
    elements,
    chat: { runs: new Map(), history: [] },
    scroll: { pinned: true },
    thinking: { active: false, timer: null, dotsTimer: null, bubble: null },
    activeRunId: null,
    abortState: { active: false, requestedAt: 0, timer: null },
    attachments: { files: [] },
    pendingSend: null,
    catchUp: { active: false, attemptsLeft: 0, timer: null },
    outbox: [],
    inFlight: null,
    chatKey: () => computeChatKey({ role: pane.role, agentId: pane.agentId }),
    legacySessionKey: () => computeLegacySessionKey({ role: pane.role, agentId: pane.agentId }),
    sessionKey: () => computeSessionKey({ role: pane.role, agentId: pane.agentId, paneKey: pane.key }),
    onConnectedHook: null,
    client: null
  };

  // Mark pane kind on root for CSS + debugging.
  try {
    elements.root.dataset.paneKind = pane.kind;
    elements.root.classList.add(`pane-kind-${pane.kind}`);
  } catch {}

  // Per-pane inline help popover ("What is this pane?")
  try {
    if (elements.helpPopover) {
      const shortcut = (keys, desc) => `<li><span class="mono">${escapeHtml(keys)}</span> — ${escapeHtml(desc)}</li>`;
      const help = (() => {
        if (pane.kind === 'workqueue') {
          return {
            title: 'Workqueue',
            lines: ['Shows queued work items, grouped by status.', 'Drag cards between columns to change status.', 'Use Refresh when another worker updates the queue.'],
            shortcuts: [
              ['g w', 'open Workqueue modal'],
              ['Cmd/Ctrl+K', 'cycle focus between panes']
            ]
          };
        }
        if (pane.kind === 'cron') {
          return {
            title: 'Cron',
            lines: ['Shows scheduled jobs in the Gateway cron scheduler.', 'Use filters to find failing/disabled jobs.', 'Use Run/Edit/Disable for quick ops.'],
            shortcuts: [
              ['?', 'keyboard shortcuts overlay'],
              ['Cmd/Ctrl+K', 'cycle focus between panes']
            ]
          };
        }
        if (pane.kind === 'timeline') {
          return {
            title: 'Timeline',
            lines: ['Shows recent cron run history (best-effort).', 'Adjust range/status/search to find events.', 'Click View to inspect the underlying job.'],
            shortcuts: [
              ['?', 'keyboard shortcuts overlay'],
              ['Cmd/Ctrl+K', 'cycle focus between panes']
            ]
          };
        }
        return {
          title: 'Chat',
          lines: ['Chat with an agent/session.', 'Pick an agent target, then send messages/files.', 'Use Stop to cancel a long response.'],
          shortcuts: [
            ['Cmd/Ctrl+1..4', 'focus a pane'],
            ['Cmd/Ctrl+K', 'cycle focus between panes']
          ]
        };
      })();

      const linesHtml = help.lines.map((t) => `<div>${escapeHtml(t)}</div>`).join('');
      const shortcutsHtml = help.shortcuts.map(([k, d]) => shortcut(k, d)).join('');

      elements.helpPopover.innerHTML = `
        <div class="title">${escapeHtml(help.title)}</div>
        <div>${linesHtml}</div>
        <div class="hint" style="margin-top:8px;">Shortcuts:</div>
        <ul>${shortcutsHtml}</ul>
      `;

      // Close on Escape (details doesn't do this by default)
      if (elements.helpDetails) {
        elements.helpDetails.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            try {
              elements.helpDetails.removeAttribute('open');
              e.stopPropagation();
              e.preventDefault();
            } catch {}
          }
        });
      }
    }
  } catch {}

  if (elements.closeBtn) {
    elements.closeBtn.hidden = !closable;
    elements.closeBtn.addEventListener('click', () => {
      paneManager.removePane(pane.key);
    });
  }

  if (elements.stopBtn) {
    elements.stopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      paneAbortRun(pane);
    });
  }

  // WORKQUEUE PANE
  if (pane.role === 'admin' && pane.kind === 'workqueue') {
    if (elements.agentWrap) elements.agentWrap.hidden = true;
    if (elements.inputRow) elements.inputRow.hidden = true;
    if (elements.scrollDownBtn) elements.scrollDownBtn.hidden = true;


    // Replace thread with workqueue list + inspect.
    elements.thread.classList.add('wq-pane');
    elements.thread.innerHTML = `
      <div class="wq-toolbar">
        <div class="wq-toolbar-row">
          <label class="wq-field">
            <span class="wq-label">Queue</span>
            <select data-wq-queue-select aria-label="Select workqueue"></select>
            <input data-wq-queue-custom type="text" value="${escapeHtml(pane.workqueue.queue)}" placeholder="Custom queue" hidden />
          </label>

          <div class="wq-field wq-status-field">
            <span class="wq-label">Status filter</span>
            <div class="wq-status-multiselect" data-wq-status>
              <div class="wq-status-selected" data-wq-status-selected aria-live="polite"></div>
              <details class="wq-status-details" data-wq-status-details>
                <summary type="button">Choose statuses…</summary>
                <div class="wq-status-menu">
                  <div class="wq-status-presets" role="group" aria-label="Status presets">
                    <button type="button" class="secondary" data-wq-status-preset="default">Default</button>
                    <button type="button" class="secondary" data-wq-status-preset="open">Open</button>
                    <button type="button" class="secondary" data-wq-status-preset="active">Active</button>
                    <button type="button" class="secondary" data-wq-status-preset="all">All</button>
                    <button type="button" class="secondary" data-wq-status-clear>Clear</button>
                  </div>
                  <div class="wq-status-filters" data-wq-status-options></div>
                </div>
              </details>
            </div>
          </div>

          <button data-wq-refresh class="secondary" type="button">Refresh</button>

          <div class="wq-sort" role="group" aria-label="Sort workqueue items">
            <span class="wq-sort-label">Sort</span>
            <button type="button" class="wq-sort-btn" data-wq-sort="default">Default</button>
            <button type="button" class="wq-sort-btn" data-wq-sort="priority">Priority</button>
            <button type="button" class="wq-sort-btn" data-wq-sort="updatedAt">Updated</button>
            <button type="button" class="wq-sort-btn" data-wq-sort="createdAt">Created</button>
          </div>
        </div>

        <details class="wq-enqueue">
          <summary>Enqueue new item</summary>
          <form data-wq-enqueue-form class="wq-enqueue-form">
            <label class="wq-field">
              <span class="wq-label">Title</span>
              <input data-wq-enqueue-title type="text" required placeholder="Short title" />
            </label>

            <label class="wq-field">
              <span class="wq-label">Priority</span>
              <input data-wq-enqueue-priority type="number" value="0" />
            </label>

            <label class="wq-field">
              <span class="wq-label">Dedupe key (optional)</span>
              <input data-wq-enqueue-dedupe type="text" placeholder="e.g. pr-review:2026-02-10T01" />
            </label>

            <label class="wq-field wq-field-wide">
              <span class="wq-label">Instructions</span>
              <textarea data-wq-enqueue-instructions rows="3" placeholder="Links, context, acceptance criteria"></textarea>
            </label>

            <div class="wq-enqueue-actions">
              <label class="wq-field">
                <span class="wq-label">Claim as (optional)</span>
                <select data-wq-claim-agent></select>
              </label>
              <label class="wq-field">
                <span class="wq-label">Lease ms</span>
                <input data-wq-claim-lease type="number" value="900000" />
              </label>
              <button data-wq-enqueue-submit type="submit">Enqueue</button>
            </div>

            <div class="hint" data-wq-enqueue-status aria-live="polite"></div>
          </form>
        </details>

        <div class="hint" data-wq-statusline></div>
      </div>

      <div class="wq-layout">
        <section class="wq-list" aria-label="Workqueue items">
          <div class="wq-list-header">
            <button type="button" class="wq-list-sort" data-wq-sort="title">title</button>
            <button type="button" class="wq-list-sort" data-wq-sort="status">status</button>
            <button type="button" class="wq-list-sort" data-wq-sort="priority">prio</button>
            <button type="button" class="wq-list-sort" data-wq-sort="attempts">attempts</button>
            <button type="button" class="wq-list-sort" data-wq-sort="claimedBy">claimedBy</button>
            <div>lease</div>
          </div>
          <div class="wq-list-body" data-wq-list-body></div>
          <div data-wq-empty class="hint" style="padding: 10px 12px;" hidden>No items.</div>
        </section>

        <section class="wq-inspect" aria-label="Workqueue item details">
          <div class="wq-inspect-header">Inspect</div>
          <div data-wq-inspect class="wq-inspect-body"></div>
        </section>
      </div>
    `;

    const queueSelectEl = elements.thread.querySelector('[data-wq-queue-select]');
    const queueCustomEl = elements.thread.querySelector('[data-wq-queue-custom]');
    const statusRootEl = elements.thread.querySelector('[data-wq-status]');
    const statusSelectedEl = elements.thread.querySelector('[data-wq-status-selected]');
    const statusOptionsEl = elements.thread.querySelector('[data-wq-status-options]');
    const statusDetailsEl = elements.thread.querySelector('[data-wq-status-details]');
    const statusClearBtn = elements.thread.querySelector('[data-wq-status-clear]');
    const refreshBtn = elements.thread.querySelector('[data-wq-refresh]');

    const DEFAULT_STATUSES = ['ready', 'pending', 'claimed', 'in_progress'];

    const statusSet = new Set(
      (Array.isArray(pane.workqueue?.statusFilter) && pane.workqueue.statusFilter.length ? pane.workqueue.statusFilter : DEFAULT_STATUSES)
        .map((s) => String(s).trim())
        .filter(Boolean)
    );

    const getQueueValue = () => {
      const sel = String(queueSelectEl?.value || '').trim();
      if (sel === '__custom__') return String(queueCustomEl?.value || '').trim();
      return sel;
    };

    const applyStatuses = async (next, { closeMenu = false } = {}) => {
      statusSet.clear();
      for (const s of next) statusSet.add(s);
      pane.workqueue.statusFilter = Array.from(statusSet);
      renderStatusMultiSelect();
      if (closeMenu) statusDetailsEl?.removeAttribute('open');
      await fetchAndRenderWorkqueueItemsForPane(pane);
      paneManager.persistAdminPanes();
    };

    const doRefresh = async () => {
      const q = getQueueValue() || 'dev-team';
      pane.workqueue.queue = q;
      if (!statusSet.size) {
        for (const s of DEFAULT_STATUSES) statusSet.add(s);
        pane.workqueue.statusFilter = Array.from(statusSet);
        renderStatusMultiSelect();
      }
      await fetchAndRenderWorkqueueItemsForPane(pane);
      paneManager.persistAdminPanes();
    };

    const renderStatusMultiSelect = () => {
      if (!statusRootEl || !statusSelectedEl || !statusOptionsEl) return;

      statusSelectedEl.innerHTML = '';
      const selected = Array.from(statusSet);
      if (selected.length) {
        for (const s of selected) {
          const chip = document.createElement('span');
          chip.className = 'wq-pill';
          chip.textContent = s;
          statusSelectedEl.appendChild(chip);
        }
      } else {
        const hint = document.createElement('span');
        hint.className = 'hint';
        hint.textContent = 'none (will show default on refresh)';
        statusSelectedEl.appendChild(hint);
      }

      statusOptionsEl.innerHTML = '';
      for (const s of WORKQUEUE_STATUSES) {
        const id = `wq-pane-status-${pane.id}-${s}`;
        const label = document.createElement('label');
        label.className = 'wq-status-chip';
        label.innerHTML = `<input type="checkbox" id="${id}" ${statusSet.has(s) ? 'checked' : ''} /> <span>${escapeHtml(s)}</span>`;
        const checkbox = label.querySelector('input');
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) statusSet.add(s);
          else statusSet.delete(s);
          applyStatuses(Array.from(statusSet));
        });
        statusOptionsEl.appendChild(label);
      }
    };

    const populateQueueSelect = async () => {
      if (!queueSelectEl) return;
      try {
        const res = await fetch('/api/workqueue/queues', { credentials: 'include', cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json().catch(() => null);
        const queues = Array.isArray(data?.queues) ? data.queues : [];

        const current = (pane.workqueue.queue || 'dev-team').trim();
        const unique = Array.from(new Set([current, ...queues].map((q) => String(q).trim()).filter(Boolean)));
        unique.sort((a, b) => a.localeCompare(b));

        queueSelectEl.innerHTML = '';
        for (const q of unique) {
          const opt = document.createElement('option');
          opt.value = q;
          opt.textContent = q;
          queueSelectEl.appendChild(opt);
        }

        const customOpt = document.createElement('option');
        customOpt.value = '__custom__';
        customOpt.textContent = 'Custom…';
        queueSelectEl.appendChild(customOpt);

        if (unique.includes(current)) {
          queueSelectEl.value = current;
          if (queueCustomEl) queueCustomEl.hidden = true;
        } else {
          queueSelectEl.value = '__custom__';
          if (queueCustomEl) {
            queueCustomEl.hidden = false;
            queueCustomEl.value = current;
          }
        }
      } catch {
        // fallback: keep current queue editable
        queueSelectEl.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = pane.workqueue.queue || 'dev-team';
        opt.textContent = pane.workqueue.queue || 'dev-team';
        queueSelectEl.appendChild(opt);
        const customOpt = document.createElement('option');
        customOpt.value = '__custom__';
        customOpt.textContent = 'Custom…';
        queueSelectEl.appendChild(customOpt);
        queueSelectEl.value = opt.value;
      }
    };

    queueSelectEl?.addEventListener('change', () => {
      const isCustom = String(queueSelectEl.value) === '__custom__';
      if (queueCustomEl) {
        queueCustomEl.hidden = !isCustom;
        if (isCustom) queueCustomEl.focus();
      }
      doRefresh();
    });

    renderStatusMultiSelect();
    populateQueueSelect().then(() => doRefresh());

    refreshBtn?.addEventListener('click', () => doRefresh());
    queueCustomEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doRefresh();
    });

    if (statusRootEl) {
      const presetBtns = Array.from(statusRootEl.querySelectorAll('[data-wq-status-preset]'));
      presetBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const preset = String(btn.getAttribute('data-wq-status-preset') || 'default');
          if (preset === 'open') return applyStatuses(['ready', 'pending'], { closeMenu: true });
          if (preset === 'active') return applyStatuses(['claimed', 'in_progress'], { closeMenu: true });
          if (preset === 'all') return applyStatuses(Array.from(WORKQUEUE_STATUSES), { closeMenu: true });
          return applyStatuses(DEFAULT_STATUSES, { closeMenu: true });
        });
      });

      statusClearBtn?.addEventListener('click', () => applyStatuses([]));
    }

    // Sort controls (client-side): stable sorting with a status-grouping default.
    const sortBtns = Array.from(elements.thread.querySelectorAll('[data-wq-sort]'));
    const updateSortUi = () => {
      sortBtns.forEach((btn) => {
        const key = btn.getAttribute('data-wq-sort') || '';
        const active = key && key === pane.workqueue.sortKey;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        btn.title = active ? (pane.workqueue.sortDir === 'asc' ? 'Sorted ascending' : 'Sorted descending') : '';
      });
    };

    const setSort = (key) => {
      const nextKey = String(key || 'default');
      if (pane.workqueue.sortKey === nextKey) {
        pane.workqueue.sortDir = pane.workqueue.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        pane.workqueue.sortKey = nextKey;
        pane.workqueue.sortDir = nextKey === 'claimedBy' || nextKey === 'title' || nextKey === 'status' ? 'asc' : 'desc';
      }
      updateSortUi();
      renderWorkqueuePaneItems(pane);
      paneManager.persistAdminPanes();
    };

    sortBtns.forEach((btn) => {
      btn.addEventListener('click', () => setSort(btn.getAttribute('data-wq-sort')));
    });
    updateSortUi();

    // Agent dropdown (prefer select over free-text).
    const claimAgentSelect = elements.thread.querySelector('[data-wq-claim-agent]');
    if (claimAgentSelect) {
      claimAgentSelect.innerHTML = '';
      const optNone = document.createElement('option');
      optNone.value = '';
      optNone.textContent = '(none)';
      claimAgentSelect.appendChild(optNone);
      const agents = Array.isArray(uiState.agents) ? uiState.agents : [];
      for (const a of agents) {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = formatAgentLabel(a);
        claimAgentSelect.appendChild(opt);
      }
    }

    // Enqueue (inline form).
    const enqueueForm = elements.thread.querySelector('[data-wq-enqueue-form]');
    const enqueueStatus = elements.thread.querySelector('[data-wq-enqueue-status]');
    const enqueueTitle = elements.thread.querySelector('[data-wq-enqueue-title]');
    const enqueueInstructions = elements.thread.querySelector('[data-wq-enqueue-instructions]');
    const enqueuePriority = elements.thread.querySelector('[data-wq-enqueue-priority]');
    const enqueueDedupe = elements.thread.querySelector('[data-wq-enqueue-dedupe]');

    const setEnqueueStatus = (text) => {
      if (!enqueueStatus) return;
      enqueueStatus.textContent = String(text || '');
    };

    enqueueForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const queue = (getQueueValue() || pane.workqueue.queue || '').trim();
      const title = (enqueueTitle?.value || '').trim();
      const instructions = (enqueueInstructions?.value || '').trim();
      const priority = Number(enqueuePriority?.value || 0) || 0;
      const dedupeKey = (enqueueDedupe?.value || '').trim();

      if (!queue) {
        setEnqueueStatus('Select a queue first.');
        return;
      }
      if (!title) {
        setEnqueueStatus('Title is required.');
        enqueueTitle?.focus();
        return;
      }

      setEnqueueStatus('Enqueueing…');
      try {
        const res = await fetch('/api/workqueue/enqueue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ queue, title, instructions, priority, dedupeKey })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) {
          setEnqueueStatus('Enqueue failed: ' + String(data?.error || res.status));
          return;
        }

        const item = data.item || null;
        setEnqueueStatus(item && item._deduped ? 'Deduped: ' + item.id : 'Enqueued: ' + String(item?.id || ''));
        if (enqueueTitle) enqueueTitle.value = '';
        if (enqueueInstructions) enqueueInstructions.value = '';
        if (enqueueDedupe) enqueueDedupe.value = '';

        await doRefresh();
        if (item?.id) {
          pane.workqueue.selectedItemId = item.id;
          renderWorkqueuePaneItems(pane);
          renderWorkqueuePaneInspect(pane, pane.workqueue.items.find((it) => it.id === item.id) || item);
        }
      } catch (err) {
        setEnqueueStatus('Enqueue failed: ' + String(err));
      }
    });

    setStatusPill(elements.status, 'connected', '');
    // initial fetch is deferred until admin authed, but safe to load immediately too.
    setTimeout(() => {
      if (uiState.authed) doRefresh();
    }, 0);

    pane.client = null;
    pane.connected = true;
    return pane;
  }

  // CRON + TIMELINE PANES (admin-only)
  if (pane.role === 'admin' && (pane.kind === 'cron' || pane.kind === 'timeline')) {
    if (elements.agentWrap) elements.agentWrap.hidden = true;
    if (elements.inputRow) elements.inputRow.hidden = true;
    if (elements.scrollDownBtn) elements.scrollDownBtn.hidden = true;

    const isTimeline = pane.kind === 'timeline';
    const extraControls = isTimeline
      ? `
          <label class="wq-field" style="min-width: 160px;">
            <span class="wq-label">Range</span>
            <select data-tl-range data-testid="timeline-range">
              <option value="3600000">Last 1h</option>
              <option value="21600000">Last 6h</option>
              <option value="86400000" selected>Last 24h</option>
              <option value="604800000">Last 7d</option>
            </select>
          </label>
          <label class="wq-field" style="min-width: 160px;">
            <span class="wq-label">Status</span>
            <select data-tl-status data-testid="timeline-status">
              <option value="all" selected>All</option>
              <option value="success">Success</option>
              <option value="fail">Failing</option>
            </select>
          </label>
          <label class="wq-field" style="min-width: 220px;">
            <span class="wq-label">Search</span>
            <input data-tl-search data-testid="timeline-search" type="text" placeholder="job name / id / text" />
          </label>
        `
      : `
          <label class="wq-field" style="min-width: 220px;">
            <span class="wq-label">Search</span>
            <input data-cron-search type="text" placeholder="job name / id" />
          </label>
          <label class="wq-field" style="min-width: 160px;">
            <span class="wq-label">Filters</span>
            <div style="display:flex; gap:10px; align-items:center; padding:6px 10px; border:1px solid rgba(255,255,255,0.06); border-radius:10px;">
              <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" data-cron-only-failing /> failing</label>
              <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" data-cron-only-disabled /> disabled</label>
              <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" data-cron-due-soon /> due soon</label>
            </div>
          </label>
        `;

    elements.thread.classList.add('cron-pane');
    elements.thread.innerHTML = `
      <div class="wq-toolbar">
        <div class="wq-toolbar-row" style="align-items:end; flex-wrap:wrap;">
          <div class="wq-field" style="min-width: 120px; font-weight: 600;">${isTimeline ? 'Timeline' : 'Cron'}</div>
          <label class="wq-field" style="min-width: 220px;">
            <span class="wq-label">Agent</span>
            <select data-cron-agent data-testid="cron-agent"></select>
          </label>
          ${extraControls}
          <button data-cron-refresh data-testid="cron-refresh" class="secondary" type="button">Refresh</button>
        </div>
        <div class="hint" data-cron-statusline></div>
      </div>
      <div class="wq-layout" style="grid-template-columns: 1fr;">
        <section class="wq-list" aria-label="${isTimeline ? 'Timeline' : 'Cron'} data">
          <div class="wq-list-body" data-cron-body></div>
        </section>
      </div>
    `;

    const agentSel = elements.thread.querySelector('[data-cron-agent]');
    const refreshBtn = elements.thread.querySelector('[data-cron-refresh]');
    const statusline = elements.thread.querySelector('[data-cron-statusline]');
    const body = elements.thread.querySelector('[data-cron-body]');
    const cronSearchEl = elements.thread.querySelector('[data-cron-search]');
    const cronOnlyFailingEl = elements.thread.querySelector('[data-cron-only-failing]');
    const cronOnlyDisabledEl = elements.thread.querySelector('[data-cron-only-disabled]');
    const cronDueSoonEl = elements.thread.querySelector('[data-cron-due-soon]');

    const tlRangeEl = elements.thread.querySelector('[data-tl-range]');
    const tlStatusEl = elements.thread.querySelector('[data-tl-status]');
    const tlSearchEl = elements.thread.querySelector('[data-tl-search]');

    const renderAgentFilterOptions = () => {
      if (!agentSel) return;
      const prior = String(agentSel.value || 'all');
      agentSel.innerHTML = '';
      const optAll = document.createElement('option');
      optAll.value = 'all';
      optAll.textContent = 'All agents';
      agentSel.appendChild(optAll);
      const inferred = Array.isArray(pane?._inferredAgents) && pane._inferredAgents.length > 0 ? pane._inferredAgents : [];
      const agents = uiState.agents.length > 0 ? uiState.agents : inferred.length > 0 ? inferred : [{ id: 'main', displayName: 'main', emoji: '' }];
      agents.forEach((agent) => {
        const opt = document.createElement('option');
        opt.value = agent.id;
        opt.textContent = formatAgentLabel(agent, { includeId: true });
        agentSel.appendChild(opt);
      });
      const valid = prior === 'all' || Array.from(agentSel.options).some((o) => o.value === prior);
      agentSel.value = valid ? prior : 'all';
    };

    const fmtTime = (ms) => {
      const n = Number(ms || 0);
      if (!Number.isFinite(n) || n <= 0) return '';
      try {
        return new Date(n).toLocaleString();
      } catch {
        return String(n);
      }
    };

    renderAgentFilterOptions();
    pane._renderAgentFilterOptions = renderAgentFilterOptions;

    const ensureCronActionsHook = () => {
      if (!body) return;
      if (body.dataset.cronActionsHooked === '1') return;
      body.dataset.cronActionsHooked = '1';

      body.addEventListener('click', async (event) => {
        const btn = event.target?.closest?.('button[data-cron-action]');
        if (!btn) return;
        event.preventDefault();

        const action = String(btn.dataset.cronAction || '').trim();
        const jobId = String(btn.dataset.jobId || '').trim();
        if (!jobId) return;

        const job = pane.cronJobsById?.[jobId] || null;

        const setBusy = (busy) => {
          try {
            btn.disabled = !!busy;
            if (busy) btn.dataset._oldText = btn.textContent;
            if (busy) btn.textContent = '…';
            if (!busy && btn.dataset._oldText) btn.textContent = btn.dataset._oldText;
          } catch {}
        };

        const safeReq = async (method, params) => {
          const res = await pane.client.request(method, params);
          if (!res?.ok) throw new Error(res?.error?.message || method + ' failed');
          return res;
        };

        try {
          setBusy(true);
          if (action === 'view') {
            const details = body.querySelector(`[data-cron-details-for="${CSS.escape(jobId)}"]`);
            if (details) {
              details.hidden = !details.hidden;
              setBusy(false);
              return;
            }
            // Fallback for timeline entries (no embedded details).
            alert(JSON.stringify(job || { id: jobId }, null, 2));
            setBusy(false);
            return;
          }

          if (action === 'toggle') {
            const enabled = job ? job.enabled !== false : true;
            await safeReq('cron.update', { jobId, patch: { enabled: !enabled } });
            await doRefresh();
            setBusy(false);
            return;
          }

          if (action === 'delete') {
            const ok = confirm(`Delete cron job ${jobId}?`);
            if (!ok) {
              setBusy(false);
              return;
            }
            await safeReq('cron.remove', { jobId });
            await doRefresh();
            setBusy(false);
            return;
          }

          if (action === 'run') {
            await safeReq('cron.run', { jobId });
            await doRefresh();
            setBusy(false);
            return;
          }

          if (action === 'edit') {
            const seed = job ? { name: job.name, enabled: job.enabled !== false, schedule: job.schedule, payload: job.payload } : { enabled: true };
            const txt = prompt('Edit cron job via JSON patch (merged into job). Example: {"enabled":false} or {"schedule":{"kind":"cron","expr":"*/5 * * * *"}}', JSON.stringify(seed, null, 2));
            if (!txt) {
              setBusy(false);
              return;
            }
            let patch;
            try {
              patch = JSON.parse(txt);
            } catch {
              throw new Error('Invalid JSON');
            }
            await safeReq('cron.update', { jobId, patch });
            await doRefresh();
            setBusy(false);
            return;
          }

          setBusy(false);
        } catch (err) {
          setBusy(false);
          alert(String(err || 'Failed'));
        }
      });
    };

    ensureCronActionsHook();

    const doRefresh = async () => {
      try {
        if (statusline) statusline.textContent = 'Loading…';
        const startedAt = Date.now();
        const [stRes, listRes] = await Promise.all([
          pane.client.request('cron.status', {}),
          pane.client.request('cron.list', { includeDisabled: true })
        ]);
        if (!stRes?.ok) throw new Error(stRes?.error?.message || 'cron.status failed');
        if (!listRes?.ok) throw new Error(listRes?.error?.message || 'cron.list failed');
        const jobs = Array.isArray(listRes.payload?.jobs) ? listRes.payload.jobs : [];
        const status = stRes.payload || {};
        const took = Date.now() - startedAt;

        // If /agents isn't configured (common in test) or doesn't include all ids present in cron.list,
        // infer/augment the agent filter options from cron.list.
        {
          const jobIds = Array.from(
            new Set(
              jobs
                .map((j) => String(j?.agentId || 'main').trim())
                .filter(Boolean)
            )
          );
          const knownIds = new Set((Array.isArray(uiState.agents) ? uiState.agents : []).map((a) => String(a?.id || '').trim()).filter(Boolean));
          const missing = jobIds.filter((id) => !knownIds.has(id));
          if (missing.length > 0 || uiState.agents.length === 0) {
            const ids = Array.from(new Set([...Array.from(knownIds), ...jobIds])).filter(Boolean).sort();
            pane._inferredAgents = ids.map((id) => ({ id, displayName: id, emoji: '' }));
            renderAgentFilterOptions();
          }
        }

        const agentFilter = String(agentSel?.value || 'all');
        const search = String((isTimeline ? tlSearchEl?.value : cronSearchEl?.value) || '')
          .trim()
          .toLowerCase();
        const onlyFailing = !isTimeline && Boolean(cronOnlyFailingEl?.checked);
        const onlyDisabled = !isTimeline && Boolean(cronOnlyDisabledEl?.checked);
        const dueSoon = !isTimeline && Boolean(cronDueSoonEl?.checked);
        const dueSoonWindowMs = 15 * 60 * 1000;
        const now = Date.now();

        const isJobFailing = (job) => {
          const last = String(job?.state?.lastStatus || '').toLowerCase();
          return last.includes('fail') || last.includes('error');
        };

        const matchesSearch = (job) => {
          if (!search) return true;
          const hay = `${job?.name || ''} ${job?.id || ''} ${job?.agentId || ''}`.toLowerCase();
          return hay.includes(search);
        };

        const filtered = jobs.filter((job) => {
          const a = String(job.agentId || 'main').trim();
          if (agentFilter != 'all' && a != agentFilter) return false;
          if (!matchesSearch(job)) return false;
          if (onlyDisabled && job.enabled !== false) return false;
          if (onlyFailing && !isJobFailing(job)) return false;
          if (dueSoon) {
            const n = Number(job?.state?.nextRunAtMs || 0);
            if (!Number.isFinite(n) || n <= 0) return false;
            if (n < now || n > now + dueSoonWindowMs) return false;
          }
          return true;
        });

        const schedulerLabel = status?.enabled === false ? 'paused' : status?.enabled === true ? 'running' : 'unknown';
        if (statusline) statusline.textContent = `scheduler: ${schedulerLabel} · jobs: ${filtered.length}/${jobs.length} · ${took}ms`;

        if (!body) return;

        // Expose current jobs for click handlers.
        pane.cronJobsById = Object.fromEntries(filtered.map((j) => [String(j.id), j]));

        if (!isTimeline) {
          if (filtered.length === 0) {
            const agentFilterLabel = String(agentSel?.value || 'all');
            const searchLabel = String(cronSearchEl?.value || '').trim();
            const flags = [
              cronOnlyFailingEl?.checked ? 'failing' : '',
              cronOnlyDisabledEl?.checked ? 'disabled' : '',
              cronDueSoonEl?.checked ? 'due soon' : ''
            ].filter(Boolean);
            body.innerHTML = `
              <div class="hint" style="padding: 10px 8px;">
                <div style="font-weight:700; margin-bottom:6px;">No scheduled jobs.</div>
                <div class="hint">Agent: <span class="mono">${escapeHtml(agentFilterLabel)}</span>${searchLabel ? ` · Search: <span class="mono">${escapeHtml(searchLabel)}</span>` : ''}${flags.length ? ` · Filters: <span class="mono">${escapeHtml(flags.join(', '))}</span>` : ''}</div>
                <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
                  <button type="button" class="secondary" data-cron-empty-refresh>Refresh</button>
                </div>
                <div class="hint" style="margin-top:8px;">Tip: cron jobs are configured in your Gateway cron config (and can be created/edited via the cron API/CLI).</div>
              </div>
            `;
            body.querySelector('[data-cron-empty-refresh]')?.addEventListener('click', () => refreshBtn?.click());
            return;
          }

          body.innerHTML = `<div class="cron-list">${filtered
            .map((job) => {
              const nextRun = fmtTime(job.state?.nextRunAtMs);
              const lastRun = fmtTime(job.state?.lastRunAtMs || job.state?.lastRunAt || job.state?.lastRunTsMs);
              const lastStatus = String(job.state?.lastStatus || '');
              const enabled = job.enabled !== false;
              const schedule = (() => {
                const sch = job.schedule || {};
                if (sch.kind === 'cron') return `cron:${sch.expr || ''}`;
                if (sch.kind === 'every') return `every:${sch.everyMs || ''}ms`;
                if (sch.kind === 'at') return `at:${sch.at || ''}`;
                return sch.kind ? String(sch.kind) : '';
              })();
              const id = String(job.id || '');
              return `<div class="cron-job" data-cron-job-card data-job-id="${escapeHtml(id)}">
                <div class="cron-job__top">
                  <div class="cron-job__title">${escapeHtml(job.name || job.id)}</div>
                  <div class="cron-job__badges">
                    <span class="pill pill--muted">${escapeHtml(job.agentId || 'main')}</span>
                    <span class="pill ${enabled ? 'pill--ok' : 'pill--warn'}">${enabled ? 'enabled' : 'disabled'}</span>
                  </div>
                </div>
                <div class="hint">${escapeHtml(id)} · ${schedule ? escapeHtml(schedule) + ' · ' : ''}next: ${escapeHtml(nextRun || '—')} · last run: ${escapeHtml(lastRun || '—')} · last: ${escapeHtml(lastStatus || '—')}</div>
                <div class="cron-actions" role="group" aria-label="Cron job actions">
                  <button type="button" class="secondary" data-testid="cron-action-view" data-cron-action="view" data-job-id="${escapeHtml(id)}">View</button>
                  <button type="button" class="secondary" data-testid="cron-action-edit" data-cron-action="edit" data-job-id="${escapeHtml(id)}">Edit</button>
                  <button type="button" class="secondary" data-testid="cron-action-toggle" data-cron-action="toggle" data-job-id="${escapeHtml(id)}">${enabled ? 'Disable' : 'Enable'}</button>
                  <button type="button" class="secondary" data-testid="cron-action-run" data-cron-action="run" data-job-id="${escapeHtml(id)}">Run</button>
                  <button type="button" class="danger" data-testid="cron-action-delete" data-cron-action="delete" data-job-id="${escapeHtml(id)}">Delete</button>
                </div>
                <details class="cron-job__details" data-cron-details-for="${escapeHtml(id)}" hidden>
                  <summary class="hint">Details</summary>
                  <pre class="code">${escapeHtml(JSON.stringify(job, null, 2))}</pre>
                </details>
              </div>`;
            })
            .join('')}</div>`;
          return;
        }

        // Timeline: show recent runs (best-effort)
        const rangeMs = Number(tlRangeEl?.value || 86400000);
        const sinceMs = Number.isFinite(rangeMs) && rangeMs > 0 ? Date.now() - rangeMs : Date.now() - 86400000;
        const wantStatus = String(tlStatusEl?.value || 'all');
        const textFilter = String(tlSearchEl?.value || '').trim().toLowerCase();

        const MAX_JOBS = 50;
        const MAX_RUNS_PER_JOB = 50;
        const events = [];

        const pickTs = (e) => {
          if (e && typeof e.ts === 'number') return e.ts;
          if (e && typeof e.endedAtMs === 'number') return e.endedAtMs;
          if (e && typeof e.startedAtMs === 'number') return e.startedAtMs;
          return 0;
        };

        for (const job of filtered.slice(0, MAX_JOBS)) {
          const res = await pane.client.request('cron.runs', { id: job.id, limit: MAX_RUNS_PER_JOB });
          if (!res?.ok) continue;
          const entries = Array.isArray(res.payload?.entries) ? res.payload.entries : [];
          for (const e of entries) {
            const ts = pickTs(e);
            if (!ts || ts < sinceMs) continue;
            const status = String(e?.status || e?.result || job?.state?.lastStatus || 'unknown');
            const statusLc = status.toLowerCase();
            const isFail = statusLc.includes('fail') || statusLc.includes('error');
            const isOk = statusLc.includes('ok') || statusLc.includes('success');
            if (wantStatus === 'fail' && !isFail) continue;
            if (wantStatus === 'success' && !isOk) continue;

            const summary = String(e?.summary || e?.message || e?.error || '').trim();
            const hay = `${job?.name || ''} ${job?.id || ''} ${job?.agentId || ''} ${status} ${summary}`.toLowerCase();
            if (textFilter && !hay.includes(textFilter)) continue;

            events.push({
              ts,
              jobId: String(job.id),
              jobName: job.name || job.id,
              agentId: job.agentId || 'main',
              status,
              summary
            });
          }
        }

        events.sort((a, b) => b.ts - a.ts);
        if (events.length === 0) {
          const rangeLabel = tlRangeEl ? tlRangeEl.options?.[tlRangeEl.selectedIndex]?.textContent || '' : '';
          const statusLabel = String(tlStatusEl?.value || 'all');
          const searchLabel = String(tlSearchEl?.value || '').trim();
          body.innerHTML = `
            <div class="hint" style="padding: 10px 8px;">
              <div style="font-weight:700; margin-bottom:6px;">No activity in range.</div>
              <div class="hint">Range: <span class="mono">${escapeHtml(rangeLabel || String(rangeMs))}</span> · Status: <span class="mono">${escapeHtml(statusLabel)}</span>${searchLabel ? ` · Search: <span class="mono">${escapeHtml(searchLabel)}</span>` : ''}</div>
              <div class="hint" style="margin-top:8px;">Tip: broaden the range or clear filters to find older runs.</div>
            </div>
          `;
          return;
        }

        body.innerHTML = `<div class="timeline">${events
          .slice(0, 100)
          .map((ev, idx) => {
            const job = pane.cronJobsById?.[String(ev.jobId)] || null;
            const enabled = job ? job.enabled !== false : true;
            const nextRun = job ? fmtTime(job.state?.nextRunAtMs) : '';
            const pillClass = (() => {
              const s = String(ev.status || '').toLowerCase();
              if (s.includes('ok') || s.includes('success')) return 'pill--ok';
              if (s.includes('fail') || s.includes('error')) return 'pill--warn';
              return 'pill--muted';
            })();
            const id = String(ev.jobId);
            const summaryHtml = ev.summary ? `<div class="hint" style="margin-top:4px;">${escapeHtml(String(ev.summary))}</div>` : '';
            return `<div class="timeline-item" data-testid="timeline-item" data-job-id="${escapeHtml(id)}" style="--timeline-index:${idx}">
              <div class="timeline-item__dot"></div>
              <div class="timeline-item__card">
                <div class="timeline-item__top">
                  <div class="timeline-item__title">${escapeHtml(ev.jobName)}</div>
                  <div class="timeline-item__badges">
                    <span class="pill ${pillClass}">${escapeHtml(ev.status)}</span>
                    <span class="pill pill--muted">${escapeHtml(ev.agentId || 'main')}</span>
                    <span class="pill ${enabled ? 'pill--ok' : 'pill--warn'}">${enabled ? 'enabled' : 'disabled'}</span>
                  </div>
                </div>
                <div class="hint">${escapeHtml(fmtTime(ev.ts))} · ${escapeHtml(id)}${nextRun ? ` · next: ${escapeHtml(nextRun)}` : ''}</div>
                ${summaryHtml}
                <div class="cron-actions" role="group" aria-label="Cron job actions">
                  <button type="button" class="secondary" data-testid="cron-action-view" data-cron-action="view" data-job-id="${escapeHtml(id)}">View</button>
                  <button type="button" class="secondary" data-testid="cron-action-edit" data-cron-action="edit" data-job-id="${escapeHtml(id)}">Edit</button>
                  <button type="button" class="secondary" data-testid="cron-action-toggle" data-cron-action="toggle" data-job-id="${escapeHtml(id)}">${enabled ? 'Disable' : 'Enable'}</button>
                  <button type="button" class="secondary" data-testid="cron-action-run" data-cron-action="run" data-job-id="${escapeHtml(id)}">Run</button>
                  <button type="button" class="danger" data-testid="cron-action-delete" data-cron-action="delete" data-job-id="${escapeHtml(id)}">Delete</button>
                </div>
              </div>
            </div>`;
          })
          .join('')}</div>`;
      } catch (err) {
        if (statusline) statusline.textContent = err ? String(err) : 'Failed to load';
        if (body) body.innerHTML = `<div class="hint" style="padding: 10px 8px;">${escapeHtml(err ? String(err) : 'Failed to load')}</div>`;
      }
    };

    refreshBtn?.addEventListener('click', () => doRefresh());
    agentSel?.addEventListener('change', () => doRefresh());

    cronSearchEl?.addEventListener('input', () => doRefresh());
    cronOnlyFailingEl?.addEventListener('change', () => doRefresh());
    cronOnlyDisabledEl?.addEventListener('change', () => doRefresh());
    cronDueSoonEl?.addEventListener('change', () => doRefresh());

    tlRangeEl?.addEventListener('change', () => doRefresh());
    tlStatusEl?.addEventListener('change', () => doRefresh());
    tlSearchEl?.addEventListener('input', () => doRefresh());

    pane.onConnectedHook = () => {
      // Ensure agent list is hydrated so per-agent filters are usable.
      try {
        scheduleAgentRefresh('pane_connected');
      } catch {}
      doRefresh();
    };

    pane.client = buildClientForPane(pane);
    setStatusPill(elements.status, 'disconnected', '');
    return pane;
  }

  // CHAT PANE (existing behavior)

  if (pane.role === 'admin') {
    renderAgentOptions(elements.agentSelect, pane.agentId);
    renderPaneAgentIdentity(pane);

    // Explicit switching: a single clear button opens a chooser.
    elements.agentButton?.addEventListener('click', () => openAgentChooser(pane));

    // Keep select handler for accessibility/debug (even though the select is hidden by default).
    elements.agentSelect?.addEventListener('change', (event) => {
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
  init() {
    this.destroyAll();

    // Manual layout selection is deprecated; keep the control hidden if present.
    if (globalElements.layoutSelect) {
      globalElements.layoutSelect.hidden = true;
      globalElements.layoutSelect.disabled = true;
    }

    this.initAdmin();
  },
  initAdmin() {
    const panes = this.loadAdminPanes();
    this.panes = panes.map((cfg) =>
      createPane({
        key: cfg.key,
        role: 'admin',
        kind: cfg.kind || 'chat',
        agentId: cfg.agentId,
        queue: cfg.queue,
        statusFilter: cfg.statusFilter,
        sortKey: cfg.sortKey,
        sortDir: cfg.sortDir,
        closable: true
      })
    );
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

    const coerce = (item) => {
      // Legacy format: { key, agentId }
      if (item && typeof item === 'object') {
        const key = typeof item.key === 'string' && item.key ? item.key : '';
        const rawKind = typeof item.kind === 'string' ? item.kind.trim().toLowerCase() : '';
        const kind = rawKind === 'workqueue' || rawKind === 'cron' || rawKind === 'timeline' ? rawKind : 'chat';
        if (!key) return null;
        if (kind === 'workqueue') {
          const queue = typeof item.queue === 'string' && item.queue.trim() ? item.queue.trim() : 'dev-team';
          const statusFilter = Array.isArray(item.statusFilter)
            ? item.statusFilter.map((s) => String(s || '').trim()).filter(Boolean)
            : ['ready', 'pending', 'claimed', 'in_progress'];
          const sortKey = typeof item.sortKey === 'string' ? item.sortKey : 'default';
          const sortDir = item.sortDir === 'asc' ? 'asc' : 'desc';
          return { key, kind, queue, statusFilter, sortKey, sortDir };
        }
        if (kind === 'cron' || kind === 'timeline') {
          return { key, kind };
        }
        const agentId = normalizeAgentId(typeof item.agentId === 'string' ? item.agentId : defaultAgent);
        return { key, kind: 'chat', agentId };
      }
      // Super-legacy format: ['pabc','pdef'] (treat as chat panes)
      if (typeof item === 'string' && item) {
        return { key: item, kind: 'chat', agentId: defaultAgent };
      }
      return null;
    };

    try {
      const raw = storage.get(ADMIN_PANES_KEY, '');
      if (!raw) throw new Error('empty');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('not array');
      const list = parsed.map(coerce).filter(Boolean);
      if (list.length > 0) {
        return list.slice(0, this.maxPanes);
      }
    } catch {}

    // Default: Chat + Workqueue.
    const paneA = { key: `p${randomId().slice(0, 8)}`, kind: 'chat', agentId: defaultAgent };
    const paneB = {
      key: `p${randomId().slice(0, 8)}`,
      kind: 'workqueue',
      queue: 'dev-team',
      statusFilter: ['ready', 'pending', 'claimed', 'in_progress'],
      sortKey: 'default',
      sortDir: 'desc'
    };
    const list = [paneA, paneB].slice(0, this.maxPanes);
    storage.set(ADMIN_PANES_KEY, JSON.stringify(list));
    return list;
  },
  persistAdminPanes() {
    if (roleState.role !== 'admin') return;
    const payload = this.panes.map((pane) => {
      if (pane.kind === 'workqueue') {
        return {
          key: pane.key,
          kind: 'workqueue',
          queue: pane.workqueue?.queue || 'dev-team',
          statusFilter: Array.isArray(pane.workqueue?.statusFilter) ? pane.workqueue.statusFilter : [],
          sortKey: pane.workqueue?.sortKey || 'default',
          sortDir: pane.workqueue?.sortDir || 'desc'
        };
      }
      if (pane.kind === 'cron' || pane.kind === 'timeline') {
        return { key: pane.key, kind: pane.kind };
      }
      return { key: pane.key, kind: 'chat', agentId: pane.agentId || 'main' };
    });
    storage.set(ADMIN_PANES_KEY, JSON.stringify(payload));
  },
  resetAdminLayoutToDefault({ confirm = true } = {}) {
    if (roleState.role !== 'admin') return;
    if (confirm) {
      const ok = window.confirm('Reset layout to default (Chat + Workqueue)?');
      if (!ok) return;
    }

    const storedDefault = storage.get(ADMIN_DEFAULT_AGENT_KEY, 'main');
    const defaultAgent = normalizeAgentId(storedDefault || 'main');
    const paneA = { key: `p${randomId().slice(0, 8)}`, kind: 'chat', agentId: defaultAgent };
    const paneB = {
      key: `p${randomId().slice(0, 8)}`,
      kind: 'workqueue',
      queue: 'dev-team',
      statusFilter: ['ready', 'pending', 'claimed', 'in_progress'],
      sortKey: 'default',
      sortDir: 'desc'
    };
    storage.set(ADMIN_PANES_KEY, JSON.stringify([paneA, paneB]));

    this.init();

    // If authed, make sure panes reconnect after reset.
    this.connectAll();

    try {
      const firstPane = this.panes[0];
      firstPane?.elements?.input?.focus?.();
    } catch {}
  },
  addPane(kind = 'chat') {
    if (roleState.role !== 'admin') return;
    if (this.panes.length >= this.maxPanes) return;

    const rawKind = String(kind || 'chat').trim().toLowerCase();

    // IMPORTANT: don't accidentally coerce "chat" -> "cron".
    // ("chat" starts with "c"; we only want to treat "cron" as cron.)
    const normalizedKind =
      rawKind === 'chat'
        ? 'chat'
        : rawKind === 'workqueue' || rawKind === 'cron' || rawKind === 'timeline'
          ? rawKind
          : rawKind.startsWith('w')
            ? 'workqueue'
            : rawKind === 'c' || rawKind.startsWith('cr')
              ? 'cron'
              : rawKind === 't' || rawKind.startsWith('ti')
                ? 'timeline'
                : 'chat';

    if (normalizedKind === 'workqueue') {
      const pane = createPane({
        key: `p${randomId().slice(0, 8)}`,
        role: 'admin',
        kind: 'workqueue',
        queue: 'dev-team',
        statusFilter: ['ready', 'pending', 'claimed', 'in_progress'],
        closable: true
      });
      this.panes.push(pane);
      globalElements.paneGrid.appendChild(pane.elements.root);
      this.updatePaneLabels();
      this.updateCloseButtons();
      this.applyInferredLayout();
      this.persistAdminPanes();
      this.focusPanePrimary(pane);
      return pane;
    }

    if (normalizedKind === 'cron' || normalizedKind === 'timeline') {
      const pane = createPane({
        key: `p${randomId().slice(0, 8)}`,
        role: 'admin',
        kind: normalizedKind,
        closable: true
      });
      this.panes.push(pane);
      globalElements.paneGrid.appendChild(pane.elements.root);
      this.updatePaneLabels();
      this.updateCloseButtons();
      this.applyInferredLayout();
      this.persistAdminPanes();
      if (uiState.authed) {
        pane.client.connect();
      }
      this.focusPanePrimary(pane);
      return pane;
    }

    const agentId = normalizeAgentId(storage.get(ADMIN_DEFAULT_AGENT_KEY, 'main'));
    const pane = createPane({ key: `p${randomId().slice(0, 8)}`, role: 'admin', kind: 'chat', agentId, closable: true });
    this.panes.push(pane);
    globalElements.paneGrid.appendChild(pane.elements.root);
    this.updatePaneLabels();
    this.updateCloseButtons();
    this.applyInferredLayout();
    this.persistAdminPanes();
    if (uiState.authed) {
      pane.client.connect();
    }
    this.focusPanePrimary(pane);
    return pane;
  },
  focusPanePrimary(pane) {
    if (!pane?.elements?.root) return;

    // Defer until DOM has painted.
    setTimeout(() => {
      try {
        if (pane.kind === 'chat') {
          pane.elements.input?.focus?.();
          return;
        }

        if (pane.kind === 'workqueue') {
          const queueSel = pane.elements.thread?.querySelector?.('[data-wq-queue-select]');
          (queueSel || pane.elements.thread)?.focus?.();
          return;
        }

        if (pane.kind === 'cron') {
          const search = pane.elements.thread?.querySelector?.('[data-cron-search]');
          const agentSel = pane.elements.thread?.querySelector?.('[data-cron-agent]');
          (search || agentSel || pane.elements.thread)?.focus?.();
          return;
        }

        if (pane.kind === 'timeline') {
          const search = pane.elements.thread?.querySelector?.('[data-tl-search]');
          const range = pane.elements.thread?.querySelector?.('[data-tl-range]');
          (search || range || pane.elements.thread)?.focus?.();
          return;
        }
      } catch {}
    }, 0);
  },
  openAddPaneMenu(anchorEl) {
    if (roleState.role !== 'admin') return;

    if (this._addPaneMenuState?.open) {
      this.closeAddPaneMenu();
      return;
    }

    if (!anchorEl || !(anchorEl instanceof Element)) return;

    const state = this._addPaneMenuState || { open: false };

    if (!state.menuEl) {
      const menu = document.createElement('div');
      menu.className = 'pane-add-menu';
      menu.dataset.testid = 'pane-add-menu';
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-label', 'Add pane');

      const chatBtn = document.createElement('button');
      chatBtn.type = 'button';
      chatBtn.className = 'pane-add-menu__item';
      chatBtn.textContent = 'New Chat pane';
      chatBtn.dataset.testid = 'pane-add-menu-chat';
      chatBtn.title = 'Shortcut: Ctrl/Cmd+Shift+C';

      const wqBtn = document.createElement('button');
      wqBtn.type = 'button';
      wqBtn.className = 'pane-add-menu__item';
      wqBtn.textContent = 'New Workqueue pane';
      wqBtn.dataset.testid = 'pane-add-menu-workqueue';
      wqBtn.title = 'Shortcut: Ctrl/Cmd+Shift+W';

      const cronBtn = document.createElement('button');
      cronBtn.type = 'button';
      cronBtn.className = 'pane-add-menu__item';
      cronBtn.textContent = 'New Cron pane';
      cronBtn.dataset.testid = 'pane-add-menu-cron';
      cronBtn.title = 'Shortcut: Ctrl/Cmd+Shift+R';

      const timelineBtn = document.createElement('button');
      timelineBtn.type = 'button';
      timelineBtn.className = 'pane-add-menu__item';
      timelineBtn.textContent = 'New Timeline pane';
      timelineBtn.dataset.testid = 'pane-add-menu-timeline';
      timelineBtn.title = 'Shortcut: Ctrl/Cmd+Shift+T';

      menu.appendChild(chatBtn);
      menu.appendChild(wqBtn);
      menu.appendChild(cronBtn);
      menu.appendChild(timelineBtn);

      chatBtn.addEventListener('click', () => {
        this.closeAddPaneMenu();
        this.addPane('chat');
      });

      wqBtn.addEventListener('click', () => {
        this.closeAddPaneMenu();
        this.addPane('workqueue');
      });

      cronBtn.addEventListener('click', () => {
        this.closeAddPaneMenu();
        this.addPane('cron');
      });

      timelineBtn.addEventListener('click', () => {
        this.closeAddPaneMenu();
        this.addPane('timeline');
      });

      state.menuEl = menu;
      state.chatBtn = chatBtn;
      state.wqBtn = wqBtn;
      state.cronBtn = cronBtn;
      state.timelineBtn = timelineBtn;
    }

    const positionMenu = () => {
      const rect = anchorEl.getBoundingClientRect();
      const menuRect = state.menuEl.getBoundingClientRect();
      const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - menuRect.width - 8));
      const top = Math.min(Math.max(8, rect.bottom + 8), Math.max(8, window.innerHeight - menuRect.height - 8));
      state.menuEl.style.left = `${Math.round(left)}px`;
      state.menuEl.style.top = `${Math.round(top)}px`;
    };

    const closeIfOutside = (event) => {
      if (!state.open) return;
      if (event.target === anchorEl) return;
      if (state.menuEl.contains(event.target)) return;
      this.closeAddPaneMenu();
    };

    state.positionMenu = positionMenu;
    state.closeIfOutside = closeIfOutside;
    state.anchorEl = anchorEl;

    document.body.appendChild(state.menuEl);
    state.menuEl.style.display = 'block';
    state.open = true;

    try {
      anchorEl.setAttribute('aria-expanded', 'true');
    } catch {}

    positionMenu();

    // Default focus for keyboard users.
    try {
      (state.chatBtn || state.menuEl.querySelector('button'))?.focus?.();
    } catch {}

    document.addEventListener('mousedown', closeIfOutside);
    window.addEventListener('resize', positionMenu);
    window.addEventListener('scroll', positionMenu, true);

    const atMax = this.panes.length >= this.maxPanes;
    state.chatBtn.disabled = atMax;
    state.wqBtn.disabled = atMax;
    state.cronBtn.disabled = atMax;
    state.timelineBtn.disabled = atMax;

    this._addPaneMenuState = state;
  },
  closeAddPaneMenu() {
    const state = this._addPaneMenuState;
    if (!state?.open) return;

    state.open = false;

    try {
      state.anchorEl?.setAttribute?.('aria-expanded', 'false');
      state.anchorEl?.focus?.();
    } catch {}

    try {
      document.removeEventListener('mousedown', state.closeIfOutside);
      window.removeEventListener('resize', state.positionMenu);
      window.removeEventListener('scroll', state.positionMenu, true);
    } catch {}

    if (state.menuEl) {
      state.menuEl.style.display = 'none';
      try {
        state.menuEl.remove();
      } catch {}
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
      if (pane.kind === 'workqueue') return;
      if (!pane.client) return;
      setTimeout(() => pane.client.connect(), index * 120);
    });
  },
  connectIfNeeded() {
    if (!uiState.authed) return;
    this.panes.forEach((pane) => {
      if (pane.kind === 'workqueue') return;
      if (!pane.client) return;
      if (pane.client.manualDisconnect) return;
      if (pane.connected) return;
      pane.client.connect({ isRetry: true });
    });
  },
  disconnectAll({ silent = false } = {}) {
    this.panes.forEach((pane) => {
      if (pane.kind === 'workqueue') return;
      pane.client?.disconnect(silent);
    });
  },
  refreshChatEnabled() {
    this.panes.forEach((pane) => {
      if (pane.kind === 'workqueue') return;
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

globalElements.shortcutsCloseBtn?.addEventListener('click', () => closeShortcuts());
globalElements.shortcutsModal?.addEventListener('click', (event) => {
  if (event.target === globalElements.shortcutsModal) closeShortcuts();
});
globalElements.commandPaletteCloseBtn?.addEventListener('click', () => closeCommandPalette());
globalElements.commandPaletteModal?.addEventListener('click', (event) => {
  if (event.target === globalElements.commandPaletteModal) closeCommandPalette();
});
globalElements.commandPaletteInput?.addEventListener('input', () => {
  filterCommandPalette(globalElements.commandPaletteInput.value);
});
globalElements.commandPaletteInput?.addEventListener('keydown', (event) => {
  if (!isCommandPaletteOpen()) return;
  const key = String(event.key || '');
  if (key === 'Escape') {
    event.preventDefault();
    closeCommandPalette();
    return;
  }
  if (key === 'ArrowDown') {
    event.preventDefault();
    commandPaletteState.selectedIndex = Math.min(commandPaletteState.filtered.length - 1, commandPaletteState.selectedIndex + 1);
    renderCommandPalette();
    return;
  }
  if (key === 'ArrowUp') {
    event.preventDefault();
    commandPaletteState.selectedIndex = Math.max(0, commandPaletteState.selectedIndex - 1);
    renderCommandPalette();
    return;
  }
  if (key === 'Enter') {
    event.preventDefault();
    const item = commandPaletteState.filtered[commandPaletteState.selectedIndex];
    if (!item) return;
    try {
      item.run?.();
    } finally {
      closeCommandPalette({ restoreFocus: false });
    }
  }
});

globalElements.saveGuestPromptBtn?.addEventListener('click', () => saveGuestPrompt());
globalElements.recurringPromptCreateBtn?.addEventListener('click', () => createRecurringPromptFromUi());
globalElements.recurringPromptRefreshBtn?.addEventListener('click', () => loadRecurringPrompts());

globalElements.refreshAgentsBtn?.addEventListener('click', () => {
  refreshAgents({ reason: 'manual', showSuccessToast: true }).catch(() => {
    showToast('Agent refresh failed.', { kind: 'error', timeoutMs: 3500 });
  });
});

globalElements.agentsBtn?.addEventListener('click', () => openAgentsModal());
globalElements.agentsCloseBtn?.addEventListener('click', () => closeAgentsModal());
globalElements.agentsModal?.addEventListener('click', (event) => {
  if (event.target === globalElements.agentsModal) closeAgentsModal();
});

globalElements.agentsSearch?.addEventListener('input', () => renderAgentsModalList());

globalElements.agentsActiveOnly?.addEventListener('change', () => {
  storage.set(ADMIN_AGENT_ACTIVE_ONLY_KEY, !!globalElements.agentsActiveOnly.checked);
  renderAgentsModalList();
});

globalElements.agentsActiveMinutes?.addEventListener('change', () => {
  const minutes = Math.max(1, Number(globalElements.agentsActiveMinutes.value) || 10);
  globalElements.agentsActiveMinutes.value = String(minutes);
  storage.set(ADMIN_AGENT_ACTIVE_MINUTES_KEY, minutes);
  renderAgentsModalList();
});

globalElements.workqueueBtn?.addEventListener('click', () => openWorkqueue());
globalElements.workqueueCloseBtn?.addEventListener('click', () => closeWorkqueue());
globalElements.workqueueModal?.addEventListener('click', (event) => {
  if (event.target === globalElements.workqueueModal) closeWorkqueue();
});
globalElements.wqQueueSelect?.addEventListener('change', () => {
  workqueueState.selectedQueue = globalElements.wqQueueSelect.value;
  fetchAndRenderWorkqueueItems();
});

globalElements.wqAutoRefreshEnabled?.addEventListener('change', () => {
  workqueueState.autoRefreshEnabled = !!globalElements.wqAutoRefreshEnabled.checked;
  storage.set('clawnsole.wq.autorefresh.enabled', workqueueState.autoRefreshEnabled);
  startWorkqueueAutoRefresh();
});

globalElements.wqAutoRefreshInterval?.addEventListener('change', () => {
  const next = Number(globalElements.wqAutoRefreshInterval.value) || 15000;
  workqueueState.autoRefreshIntervalMs = next;
  storage.set('clawnsole.wq.autorefresh.intervalMs', workqueueState.autoRefreshIntervalMs);
  startWorkqueueAutoRefresh();
});

globalElements.wqRefreshBtn?.addEventListener('click', () => {
  fetchWorkqueueQueues().then(() => fetchAndRenderWorkqueueItems());
});

globalElements.wqEnqueueBtn?.addEventListener('click', () => workqueueEnqueueFromUi());
globalElements.wqClaimBtn?.addEventListener('click', () => workqueueClaimNextFromUi());

let shortcutState = { lastGAtMs: 0 };

function isTypingContext(target) {
  const el = target || document.activeElement;
  if (!el) return false;
  const tag = String(el.tagName || '').toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
}

function focusPaneIndex(idx) {
  const pane = paneManager.panes[idx];
  if (!pane) return;

  try {
    pane.elements?.root?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  } catch {}

  // Prefer focusing the chat input when available (and visible).
  const input = pane.elements?.input;
  if (input && typeof input.focus === 'function') {
    const isVisible = (() => {
      try {
        if (input.disabled) return false;
        if (input.hidden) return false;
        if (input.getClientRects && input.getClientRects().length === 0) return false;
        return true;
      } catch {
        return true;
      }
    })();
    if (isVisible) {
      input.focus();
      return;
    }
  }

  // Fallback: focus first focusable control inside the pane.
  const root = pane.elements?.root;
  const focusable =
    root &&
    root.querySelector &&
    root.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable && typeof focusable.focus === 'function') {
    focusable.focus();
  }
}

function cyclePaneFocus() {
  const panes = paneManager.panes;
  if (!panes || panes.length === 0) return;

  const active = document.activeElement;
  const idx = panes.findIndex((p) => p.elements?.root && (p.elements.root === active || p.elements.root.contains(active)));
  const next = idx >= 0 ? (idx + 1) % panes.length : 0;
  focusPaneIndex(next);
}

window.addEventListener('keydown', (event) => {
  const isEditableTarget = (() => {
    const el = event.target;
    if (!el) return false;
    if (el.isContentEditable) return true;
    const tag = String(el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  })();

  // If Pane Manager is open, it gets first dibs on keys.
  if (paneManagerHandleKeydown(event)) return;

  // Add-pane shortcuts (admin-only)
  // Ctrl/Cmd+Shift+C → new chat
  // Ctrl/Cmd+Shift+W → new workqueue
  // Ctrl/Cmd+Shift+R → new cron
  // Ctrl/Cmd+Shift+T → new timeline
  const isAccel = (event.metaKey || event.ctrlKey) && event.shiftKey && !event.altKey;
  if (isAccel && roleState.role === 'admin') {
    const key = String(event.key || '').toLowerCase();
    const map = { c: 'chat', w: 'workqueue', r: 'cron', t: 'timeline' };
    const kind = map[key];
    if (kind) {
      // Don't hijack while typing unless it's a true accelerator.
      // (We still allow it when focused in an input, but only with Ctrl/Cmd+Shift.)
      event.preventDefault();
      paneManager.closeAddPaneMenu();
      paneManager.addPane(kind);
      return;
    }
  }

  // Cmd/Ctrl+P opens Pane Manager (even while typing).
  if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && String(event.key || '').toLowerCase() === 'p') {
    event.preventDefault();
    openPaneManager();
    return;
  }

  // Cmd/Ctrl+K opens command palette (even while typing).
  if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && String(event.key || '').toLowerCase() === 'k') {
    event.preventDefault();
    openCommandPalette();
    return;
  }

  if (event.key === 'Escape') {
    closeCommandPalette();
    closePaneManager();
    closeShortcuts();
    closeSettings();
    closeWorkqueue();
    paneManager.closeAddPaneMenu();
    if (!isEditableTarget) {
      event.preventDefault();
    }
    return;
  }

  // Never steal focus / override browser shortcuts while typing.
  if (isTypingContext(event.target)) return;

  const key = String(event.key || '');

  const isQuestion = key === '?' || (key === '/' && event.shiftKey);
  if (isQuestion && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    openShortcuts();
    return;
  }

  // Cmd/Ctrl+1..4 focuses a pane.
  if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey) {
    const n = Number.parseInt(key, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 4) {
      event.preventDefault();
      focusPaneIndex(n - 1);
      return;
    }
  }

  // Cmd/Ctrl+Shift+K cycles focus across panes.
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && !event.altKey && key.toLowerCase() === 'k') {
    event.preventDefault();
    cyclePaneFocus();
    return;
  }

  // Cmd/Ctrl+Shift+N opens Add pane menu.
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && !event.altKey && key.toLowerCase() === 'n') {
    event.preventDefault();
    paneManager.openAddPaneMenu(globalElements.addPaneBtn);
    return;
  }

  // Cmd/Ctrl+R refreshes agent list (instead of page reload).
  if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && key.toLowerCase() === 'r') {
    event.preventDefault();
    globalElements.refreshAgentsBtn?.click?.();
    toast('Refreshed agents.', 'info');
    return;
  }

  // 'g w' opens Workqueue modal.
  const now = Date.now();
  if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    if (key.toLowerCase() === 'g') {
      shortcutState.lastGAtMs = now;
      return;
    }
    if (key.toLowerCase() === 'w' && shortcutState.lastGAtMs && now - shortcutState.lastGAtMs < 1000) {
      shortcutState.lastGAtMs = 0;
      event.preventDefault();
      openWorkqueue();
      return;
    }
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

globalElements.resetLayoutBtn?.addEventListener('click', () => {
  paneManager.resetAdminLayoutToDefault({ confirm: true });
});

globalElements.paneManagerBtn?.addEventListener('click', (event) => {
  event?.preventDefault?.();
  openPaneManager();
});

globalElements.paneManagerCloseBtn?.addEventListener('click', () => closePaneManager());

globalElements.paneManagerModal?.addEventListener('click', (event) => {
  if (event.target === globalElements.paneManagerModal) closePaneManager();
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

globalElements.addPaneBtn?.addEventListener('click', (event) => {
  event?.preventDefault?.();
  paneManager.openAddPaneMenu(globalElements.addPaneBtn);
});

globalElements.addChatPaneBtn?.addEventListener('click', (event) => {
  event?.preventDefault?.();
  paneManager.addPane('chat');
});

globalElements.addQueuePaneBtn?.addEventListener('click', (event) => {
  event?.preventDefault?.();
  paneManager.addPane('workqueue');
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
        window.location.replace('/admin');
        return;
      }

      if (role !== 'admin') {
        roleState.role = null;
        showLogin('Please sign in to continue.');
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

      paneManager.init();

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
