const globalElements = {
  wsUrl: document.getElementById('wsUrl'),
  clientId: document.getElementById('clientId'),
  deviceId: document.getElementById('deviceId'),
  disconnectBtn: document.getElementById('disconnectBtn'),
  resetLayoutBtn: document.getElementById('resetLayoutBtn'),
  triageLayoutPresetBtn: document.getElementById('triageLayoutPresetBtn'),
  recurringPromptTarget: document.getElementById('recurringPromptTarget'),
  recurringPromptInterval: document.getElementById('recurringPromptInterval'),
  recurringPromptTimezone: document.getElementById('recurringPromptTimezone'),
  recurringPromptMessage: document.getElementById('recurringPromptMessage'),
  recurringPromptEnabled: document.getElementById('recurringPromptEnabled'),
  recurringPromptCreateBtn: document.getElementById('recurringPromptCreateBtn'),
  recurringPromptCancelEditBtn: document.getElementById('recurringPromptCancelEditBtn'),
  recurringPromptRefreshBtn: document.getElementById('recurringPromptRefreshBtn'),
  recurringPromptRows: document.getElementById('recurringPromptRows'),
  recurringPromptEmpty: document.getElementById('recurringPromptEmpty'),
  recurringPromptHistoryFilter: document.getElementById('recurringPromptHistoryFilter'),
  recurringPromptHistoryRefreshBtn: document.getElementById('recurringPromptHistoryRefreshBtn'),
  recurringPromptHistoryRows: document.getElementById('recurringPromptHistoryRows'),
  recurringPromptHistoryEmpty: document.getElementById('recurringPromptHistoryEmpty'),
  status: document.getElementById('connectionStatus'),
  paneManagerBtn: document.getElementById('paneManagerBtn'),
  activePaneChip: document.getElementById('activePaneChip'),
  activePaneChipValue: document.querySelector('[data-active-pane-chip-value]'),
  pulseCanvas: document.getElementById('pulseCanvas'),
  workqueueBtn: document.getElementById('workqueueBtn'),
  fleetBtn: document.getElementById('fleetBtn'),
  shortcutsBtn: document.getElementById('shortcutsBtn'),
  refreshAgentsBtn: document.getElementById('refreshAgentsBtn'),
  agentsBtn: document.getElementById('agentsBtn'),
  agentsModal: document.getElementById('agentsModal'),
  agentsModalRefreshBtn: document.getElementById('agentsModalRefreshBtn'),
  agentsCloseBtn: document.getElementById('agentsCloseBtn'),
  agentsSearch: document.getElementById('agentsSearch'),
  agentsFilterButtons: Array.from(document.querySelectorAll('[data-agents-filter]')),
  agentsDensityButtons: Array.from(document.querySelectorAll('[data-agents-density]')),
  agentsColumnPicker: document.getElementById('agentsColumnPicker'),
  agentsColumnOptions: document.getElementById('agentsColumnOptions'),
  agentsSort: document.getElementById('agentsSort'),
  agentsHeatmapToggle: document.getElementById('agentsHeatmapToggle'),
  agentsHeartbeatSortBtn: document.getElementById('agentsHeartbeatSortBtn'),
  agentsSortResetBtn: document.getElementById('agentsSortResetBtn'),
  agentsSortIndicator: document.getElementById('agentsSortIndicator'),
  agentsActiveMinutes: document.getElementById('agentsActiveMinutes'),
  agentsLastRefreshed: document.getElementById('agentsLastRefreshed'),
  agentsRefreshStateBtn: document.getElementById('agentsRefreshStateBtn'),
  agentsList: document.getElementById('agentsList'),
  agentsEmpty: document.getElementById('agentsEmpty'),
  agentsSelectionBar: document.getElementById('agentsSelectionBar'),
  toastHost: document.getElementById('toastHost'),
  commandPaletteModal: document.getElementById('commandPaletteModal'),
  commandPaletteCloseBtn: document.getElementById('commandPaletteCloseBtn'),
  commandPaletteInput: document.getElementById('commandPaletteInput'),
  commandPaletteList: document.getElementById('commandPaletteList'),
  commandPaletteEmpty: document.getElementById('commandPaletteEmpty'),
  shortcutsModal: document.getElementById('shortcutsModal'),
  shortcutsDialog: document.getElementById('shortcutsDialog'),
  shortcutsContent: document.getElementById('shortcutsContent'),
  shortcutsCloseBtn: document.getElementById('shortcutsCloseBtn'),
  shortcutsUnlockedCopy: document.querySelector('[data-shortcuts-unlocked-copy]'),
  shortcutsLockedCopy: document.querySelector('[data-shortcuts-locked-copy]'),
  shortcutsGlobalUnlockedTitle: document.querySelector('[data-shortcuts-global-unlocked]'),
  shortcutsGlobalLockedTitle: document.querySelector('[data-shortcuts-global-locked]'),
  shortcutsLockedRow: document.querySelector('[data-shortcuts-locked-row]'),
  shortcutsLockedLabels: Array.from(document.querySelectorAll('[data-shortcuts-locked-label]')),
  shortcutsAdminGroups: Array.from(document.querySelectorAll('[data-shortcuts-admin-group]')),
  paneManagerModal: document.getElementById('paneManagerModal'),
  paneManagerCloseBtn: document.getElementById('paneManagerCloseBtn'),
  paneManagerSearch: document.getElementById('paneManagerSearch'),
  paneManagerUnreadOnly: document.getElementById('paneManagerUnreadOnly'),
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
  paneSwitchHudEnabled: document.getElementById('paneSwitchHudEnabled'),
  headerLabeledControlsEnabled: document.getElementById('headerLabeledControlsEnabled'),
  keybindConflictList: document.getElementById('keybindConflictList'),
  shortcutOverridesList: document.getElementById('shortcutOverridesList'),
  shortcutOverridesSave: document.getElementById('shortcutOverridesSave'),
  shortcutOverridesResetAll: document.getElementById('shortcutOverridesResetAll'),
  shortcutOverridesError: document.getElementById('shortcutOverridesError'),
  rolePill: document.getElementById('rolePill'),
  authSessionPopover: document.getElementById('authSessionPopover'),
  loginOverlay: document.getElementById('loginOverlay'),
  loginPassword: document.getElementById('loginPassword'),
  loginBtn: document.getElementById('loginBtn'),
  loginError: document.getElementById('loginError'),
  logoutBtn: document.getElementById('logoutBtn'),
  paneControls: document.getElementById('paneControls'),
  addPaneBtn: document.getElementById('addPaneBtn'),
  layoutLockBtn: document.getElementById('layoutLockBtn'),
  addChatPaneBtn: document.getElementById('addChatPaneBtn'),
  addQueuePaneBtn: document.getElementById('addQueuePaneBtn'),
  layoutSelect: document.getElementById('layoutSelect'),
  paneGrid: document.getElementById('paneGrid'),
  paneTemplate: document.getElementById('paneTemplate')
};

const ADMIN_MODAL_KEYS = [
  'settingsModal',
  'shortcutsModal',
  'commandPaletteModal',
  'paneManagerModal',
  'workqueueModal',
  'agentsModal'
];

const adminModalFocusReturn = new WeakMap();

function getAdminModalElements() {
  return ADMIN_MODAL_KEYS.map((key) => globalElements[key]).filter(Boolean);
}

function isAdminModalOpen(modal) {
  return !!modal?.classList?.contains('open') || modal?.getAttribute?.('aria-hidden') === 'false';
}

function setAdminModalInactive(modal) {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('inert', '');
}

function setAdminModalActive(modal) {
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  modal.removeAttribute('inert');
}

function closeOpenAdminModalsExcept(exceptModal) {
  const entries = [
    { modal: globalElements.settingsModal, close: () => closeSettings({ restoreFocus: false }) },
    { modal: globalElements.shortcutsModal, close: () => closeShortcuts({ restoreFocus: false }) },
    { modal: globalElements.commandPaletteModal, close: () => closeCommandPalette({ restoreFocus: false }) },
    { modal: globalElements.paneManagerModal, close: () => closePaneManager({ restoreFocus: false }) },
    { modal: globalElements.workqueueModal, close: () => closeWorkqueue({ restoreFocus: false }) },
    { modal: globalElements.agentsModal, close: () => closeAgentsModal({ restoreFocus: false }) }
  ];

  entries.forEach(({ modal, close }) => {
    if (!modal || modal === exceptModal || !isAdminModalOpen(modal)) return;
    close();
  });
}

function openAdminModal(modal, { focusReturn = document.activeElement } = {}) {
  if (!modal) return false;
  closeOpenAdminModalsExcept(modal);
  if (focusReturn instanceof HTMLElement && !modal.contains(focusReturn)) {
    adminModalFocusReturn.set(modal, focusReturn);
  }
  setAdminModalActive(modal);
  return true;
}

function closeAdminModal(modal, { restoreFocus = true, fallbackFocus = null } = {}) {
  if (!modal || !isAdminModalOpen(modal)) return false;
  setAdminModalInactive(modal);
  if (restoreFocus) {
    const previous = adminModalFocusReturn.get(modal);
    adminModalFocusReturn.delete(modal);
    const target = previous && document.contains(previous) ? previous : fallbackFocus;
    try { target?.focus?.(); } catch {}
  } else {
    adminModalFocusReturn.delete(modal);
  }
  return true;
}

function syncAdminModalInertStates() {
  let activeFound = false;
  getAdminModalElements().forEach((modal) => {
    if (!activeFound && isAdminModalOpen(modal)) {
      setAdminModalActive(modal);
      activeFound = true;
    } else {
      setAdminModalInactive(modal);
    }
  });
}

syncAdminModalInertStates();

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
function cssEscape(value) {
  const s = String(value ?? '');
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(s);
  return s.replace(/["\\\n\r\f]/g, '\\$&');
}
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
const formatWorkqueueIssueTitle = __appCore.formatWorkqueueIssueTitle || ((item) => String(item?.title || ''));
const summarizeWorkqueueIssueDuplicateDensity = __appCore.summarizeWorkqueueIssueDuplicateDensity || (() => ({ density: 0, duplicateRows: 0, duplicateGroups: 0, totalRows: 0 }));
const summarizeExactWorkqueueDuplicateRows = __appCore.summarizeExactWorkqueueDuplicateRows || ((items) => (Array.isArray(items) ? items : []).map((item) => ({ kind: 'item', item })));
const sortWorkqueueItems = __appCore.sortWorkqueueItems || ((items, opts) => (Array.isArray(items) ? items.slice() : []));
const inferPaneCols = __appCore.inferPaneCols || ((count) => {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 1) return 1;
  if (n === 2) return 2;
  if (n === 3) return 3;
  if (n === 4) return 2;
  return 3;
});
const normalizePaneKind = __appCore.normalizePaneKind || ((rawKind) => {
  const k = String(rawKind || 'chat').trim().toLowerCase();
  return k === 'chat'
    ? 'chat'
    : k === 'workqueue' || k === 'cron' || k === 'timeline'
      ? k
      : k.startsWith('w')
        ? 'workqueue'
        : k === 'c' || k.startsWith('cr')
          ? 'cron'
          : k === 't' || k.startsWith('ti')
            ? 'timeline'
            : 'chat';
});
const normalizeAdminDestination = __appCore.normalizeAdminDestination || ((candidate, { origin = '', now = Date.now(), ttlMs = 10 * 60 * 1000 } = {}) => {
  const value = candidate && typeof candidate === 'object' ? candidate : {};
  const href = typeof value.href === 'string' ? value.href.trim() : '';
  if (!href) return { ok: false, reason: 'missing' };
  const createdAt = Number(value.createdAt || 0);
  if (createdAt > 0 && Number.isFinite(ttlMs) && ttlMs > 0 && now - createdAt > ttlMs) return { ok: false, reason: 'stale' };
  let url;
  try {
    url = new URL(href, origin || 'http://127.0.0.1');
  } catch {
    return { ok: false, reason: 'invalid' };
  }
  if (origin) {
    try {
      if (url.origin !== new URL(origin).origin) return { ok: false, reason: 'external' };
    } catch {
      return { ok: false, reason: 'invalid_origin' };
    }
  }
  if (!(url.pathname === '/admin' || url.pathname.startsWith('/admin/'))) return { ok: false, reason: 'outside_admin' };
  return {
    ok: true,
    href: `${url.pathname}${url.search}${url.hash}` || '/admin',
    activePaneKey: typeof value.activePaneKey === 'string' ? value.activePaneKey : ''
  };
});
const deriveAuthOverlayState = __appCore.deriveAuthOverlayState || ((state) => ({
  isAdmin: String(state?.role || '') === 'admin',
  authState: !!state?.authed ? 'signed_in' : (String(state?.role || '') === 'admin' ? 'locked' : 'signed_out'),
  startAgentAutoRefresh: String(state?.role || '') === 'admin' && !!state?.authed,
  stopAgentAutoRefresh: String(state?.role || '') !== 'admin' || !state?.authed,
  rolePillText: !!state?.authed ? `Signed in - ${String(state?.role || '') === 'admin' ? 'Admin' : (state?.role || 'Guest')} - ${state?.environment || 'local'}` : (String(state?.role || '') === 'admin' ? 'Locked' : 'Signed out'),
  rolePillAdmin: String(state?.role || '') === 'admin' && !!state?.authed,
  rolePillLocked: !state?.authed && String(state?.role || '') === 'admin',
  rolePillSignedOut: !state?.authed && String(state?.role || '') !== 'admin',
  rolePillActionLabel: !!state?.authed ? 'Open session details' : 'Focus password input to unlock session',
  rolePillTooltip: !!state?.authed
    ? `Session context: signed in as ${String(state?.role || '') === 'admin' ? 'Admin' : (state?.role || 'Guest')} in ${state?.environment || 'local'}. Click for session details.`
    : `Session context: signed out in ${state?.environment || 'local'}. Click to unlock this session.`,
  authLabel: !!state?.authed ? 'Signed in' : (String(state?.role || '') === 'admin' ? 'Locked' : 'Signed out'),
  principalLabel: !!state?.authed ? (String(state?.role || '') === 'admin' ? 'Admin' : (state?.role || 'Guest')) : 'Not signed in',
  environmentLabel: state?.environment || 'local',
  showAdminControls: String(state?.role || '') === 'admin' && !!state?.authed,
  authActionText: !!state?.authed ? 'Logout' : 'Unlock',
  authActionLabel: !!state?.authed ? 'Log out' : 'Unlock admin',
  logoutEnabled: true,
  logoutOpacity: '1'
}));
const paneNeedsAttention = __appCore.paneNeedsAttention || ((pane) => {
  if (!pane) return false;
  const status = String(pane.statusState || '').trim();
  return !pane.connected || status === 'error' || status === 'reconnecting' || Number(pane.unreadCount || 0) > 0;
});
const deriveGlobalConnectionState = __appCore.deriveGlobalConnectionState || ((state) => {
  if (!state?.authed) return { state: 'disconnected', meta: 'sign in required' };
  const panes = Array.isArray(state?.panes) ? state.panes : [];
  if (panes.length === 0) return { state: 'disconnected', meta: '' };
  const connectedCount = panes.filter((pane) => !!pane?.connected).length;
  const total = panes.length;
  const disconnectedCount = Math.max(0, total - connectedCount);
  const unreadCount = panes.reduce((sum, pane) => sum + Math.max(0, Number(pane?.unreadCount || 0)), 0);
  const attentionCount = panes.filter((pane) => paneNeedsAttention(pane)).length;
  const anyConnecting = panes.some((pane) => pane?.statusState === 'connecting' || pane?.statusState === 'reconnecting');
  const anyError = panes.some((pane) => pane?.statusState === 'error');
  let nextState = 'disconnected';
  if (connectedCount === total) nextState = 'connected';
  else if (connectedCount > 0 || anyConnecting) nextState = 'reconnecting';
  else if (anyError) nextState = 'error';
  const meta = `${connectedCount} connected · ${disconnectedCount} disconnected · ${attentionCount} attention`;
  const ariaLabel = `${connectedCount} of ${total} panes connected; ${disconnectedCount} disconnected; ${unreadCount} unread ${unreadCount === 1 ? 'item' : 'items'}; ${attentionCount} ${attentionCount === 1 ? 'pane needs' : 'panes need'} attention`;
  return { state: nextState, meta, connectedCount, disconnectedCount, unreadCount, attentionCount, total, ariaLabel };
});
const deriveDisconnectButtonState = __appCore.deriveDisconnectButtonState || ((state) => {
  if (!state?.authed) return { disabled: true, text: 'Reconnect' };
  const panes = Array.isArray(state?.panes) ? state.panes : [];
  const anyActive = panes.some((pane) =>
    pane?.statusState === 'connected' || pane?.statusState === 'connecting' || pane?.statusState === 'reconnecting'
  );
  return { disabled: false, text: anyActive ? 'Disconnect' : 'Reconnect' };
});

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

// Agent list UX (pins + triage)
const ADMIN_AGENT_PINS_KEY = 'clawnsole.admin.agentPins';
const ADMIN_AGENT_LAST_SEEN_KEY = 'clawnsole.admin.agentLastSeenAtMs';
const ADMIN_AGENT_FILTER_KEY = 'clawnsole.admin.agents.filter';
const ADMIN_AGENT_SORT_KEY = 'clawnsole.admin.agents.sort';
const ADMIN_AGENT_PRE_HEARTBEAT_SORT_KEY = 'clawnsole.admin.agents.preHeartbeatSort';
const ADMIN_AGENT_HEATMAP_KEY = 'clawnsole.admin.agents.heartbeatHeatmap';
const ADMIN_AGENT_ACTIVE_MINUTES_KEY = 'clawnsole.admin.agents.activeMinutes';
const ADMIN_AGENT_DENSITY_KEY = 'clawnsole.admin.agents.density';
const ADMIN_AGENT_COLUMNS_KEY = 'clawnsole.admin.agents.columns';
const ADMIN_AGENT_HEALTHY_COLLAPSED_KEY = 'clawnsole.admin.agents.healthyCollapsed';
const ADMIN_AGENT_HEALTHY_COLLAPSE_THRESHOLD = 10;
const FLEET_COLUMN_DEFS = [
  { key: 'id', label: 'Agent id', defaultVisible: true },
  { key: 'health', label: 'Health', defaultVisible: true },
  { key: 'heartbeat', label: 'Heartbeat age', defaultVisible: true },
  { key: 'heartbeatDetail', label: 'Heartbeat detail', defaultVisible: true },
  { key: 'status', label: 'Status detail', defaultVisible: true },
  { key: 'model', label: 'Model', defaultVisible: false },
  { key: 'host', label: 'Host', defaultVisible: false },
  { key: 'actions', label: 'Actions', defaultVisible: true }
];
const ADMIN_AUTH_DESTINATION_KEY = 'clawnsole.admin.authDestination.v1';
const ADMIN_AUTH_RESTORE_PENDING_KEY = 'clawnsole.admin.authRestorePending.v1';
const ADMIN_AUTH_RESTORE_NOTICE_KEY = 'clawnsole.admin.authRestoreNotice.v1';
const PANE_SWITCH_HUD_ENABLED_KEY = 'clawnsole.admin.paneSwitchHud.enabled';
const HEADER_LABELED_CONTROLS_ENABLED_KEY = 'clawnsole.header.labeledControls';
const KEYBIND_OVERRIDES_KEY = 'clawnsole.admin.keybindOverrides.v1';
const SHORTCUT_OVERRIDES_KEY = 'clawnsole.admin.shortcutOverrides.v1';
const ADMIN_AUTH_DESTINATION_TTL_MS = 10 * 60 * 1000;
const WQ_RECENT_TARGETS_KEY = 'clawnsole.wq.recentTargets';

const KEYBIND_CATALOG = [
  { id: 'help.shortcuts', group: 'Global', label: 'Open this help overlay', binding: { key: '?', display: '?' } },
  { id: 'global.escape', group: 'Global', label: 'Close overlay / menus', binding: { key: 'Escape', display: 'Esc' } },
  {
    id: 'pane.focusVisible',
    group: 'Pane focus/navigation',
    label: 'Focus panes 1-9 by visible order',
    binding: { alt: true, key: '1..9', display: 'Alt/Option+1..9' },
    risk: { kind: 'layout', reason: 'Layout-sensitive on some international keyboards', alternative: { accel: true, key: '1..9', display: 'Cmd/Ctrl+1..9' } }
  },
  { id: 'pane.focusVisibleAccel', group: 'Pane focus/navigation', label: 'Focus pane 1-9', binding: { accel: true, key: '1..9', display: 'Cmd/Ctrl+1..9' } },
  { id: 'pane.focusByLetter', group: 'Pane focus/navigation', label: 'Focus pane by visible letter', binding: { chord: ['g', 'a..z'], display: 'g a..z' } },
  { id: 'pane.manager', group: 'Pane focus/navigation', label: 'Open Pane Manager', binding: { accel: true, key: 'p', display: 'Cmd/Ctrl+P' } },
  { id: 'pane.next', group: 'Pane focus/navigation', label: 'Focus next pane', binding: { accel: true, shift: true, key: 'k', display: 'Cmd/Ctrl+Shift+K' } },
  { id: 'pane.prev', group: 'Pane focus/navigation', label: 'Focus previous pane', binding: { accel: true, shift: true, key: 'j', display: 'Cmd/Ctrl+Shift+J' } },
  { id: 'chat.next', group: 'Pane focus/navigation', label: 'Focus next Chat pane only', binding: { accel: true, alt: true, key: 'k', display: 'Cmd/Ctrl+Alt+K' } },
  { id: 'chat.prev', group: 'Pane focus/navigation', label: 'Focus previous Chat pane only', binding: { accel: true, alt: true, key: 'j', display: 'Cmd/Ctrl+Alt+J' } },
  { id: 'chat.return', group: 'Pane focus/navigation', label: 'Return to last active Chat pane', binding: { chord: ['g', 'c'], display: 'g c' } },
  { id: 'triage.return', group: 'Pane focus/navigation', label: 'Return to previous triage context', binding: { accel: true, shift: true, key: 'b', display: 'Cmd/Ctrl+Shift+B' } },
  {
    id: 'chat.composer',
    group: 'Pane focus/navigation',
    label: 'Focus Chat composer',
    binding: { accel: true, key: 'l', display: 'Cmd/Ctrl+L' },
    risk: { kind: 'browser', reason: 'Reserved by browser location bar', alternative: { accel: true, shift: true, key: 'm', display: 'Cmd/Ctrl+Shift+M' } }
  },
  {
    id: 'pane.mruNext',
    group: 'Pane focus/navigation',
    label: 'Switch panes by most-recent focus order',
    binding: { ctrlOnly: true, key: 'Tab', display: 'Ctrl+Tab' },
    risk: { kind: 'browser', reason: 'Reserved by browser tab switching', alternative: { accel: true, alt: true, key: ']', display: 'Cmd/Ctrl+Alt+]' } }
  },
  {
    id: 'pane.mruPrev',
    group: 'Pane focus/navigation',
    label: 'Reverse most-recent pane traversal',
    binding: { ctrlOnly: true, shift: true, key: 'Tab', display: 'Ctrl+Shift+Tab' },
    risk: { kind: 'browser', reason: 'Reserved by browser tab switching', alternative: { accel: true, alt: true, key: '[', display: 'Cmd/Ctrl+Alt+[' } }
  },
  { id: 'pane.unreadNext', group: 'Pane focus/navigation', label: 'Next unread pane', binding: { accel: true, shift: true, key: ']', display: 'Cmd/Ctrl+Shift+]' } },
  { id: 'pane.unreadPrev', group: 'Pane focus/navigation', label: 'Previous unread pane', binding: { accel: true, shift: true, key: '[', display: 'Cmd/Ctrl+Shift+[' } },
  { id: 'command.palette', group: 'Pane actions', label: 'Open command palette', binding: { accel: true, key: 'k', display: 'Cmd/Ctrl+K' } },
  { id: 'pane.addMenu', group: 'Pane actions', label: 'Add pane', binding: { accel: true, shift: true, key: 'n', display: 'Cmd/Ctrl+Shift+N' } },
  { id: 'pane.addChat', group: 'Pane actions', label: 'Add Chat pane (workspace only)', binding: { accel: true, shift: true, key: 'c', display: 'Cmd/Ctrl+Shift+C' } },
  { id: 'pane.addWorkqueue', group: 'Pane actions', label: 'Add Workqueue pane (workspace only)', binding: { accel: true, shift: true, key: 'w', display: 'Cmd/Ctrl+Shift+W' } },
  { id: 'pane.addCron', group: 'Pane actions', label: 'Add Cron pane (workspace only)', binding: { accel: true, shift: true, key: 'r', display: 'Cmd/Ctrl+Shift+R' } },
  { id: 'pane.reopenClosed', group: 'Pane actions', label: 'Reopen last closed pane', binding: { accel: true, shift: true, key: 't', display: 'Cmd/Ctrl+Shift+T' } },
  { id: 'pane.addTimeline', group: 'Pane actions', label: 'Add Timeline pane (workspace only)', binding: { accel: true, shift: true, key: 'y', display: 'Cmd/Ctrl+Shift+Y' } },
  {
    id: 'agents.refresh',
    group: 'Pane actions',
    label: 'Refresh agent list',
    binding: { accel: true, key: 'r', display: 'Cmd/Ctrl+R' },
    risk: { kind: 'browser', reason: 'Reserved by browser reload', alternative: { accel: true, shift: true, key: 'y', display: 'Cmd/Ctrl+Shift+Y' } }
  },
  { id: 'workqueue.open', group: 'Workqueue actions', label: 'Open Workqueue modal', binding: { chord: ['g', 'w'], display: 'g w' } },
  { id: 'workqueue.openForActiveChat', group: 'Workqueue actions', label: 'Open/focus Workqueue for active Chat pane', binding: { accel: true, shift: true, key: 'g', display: 'Cmd/Ctrl+Shift+G' } },
  { id: 'workqueue.togglePair', group: 'Workqueue actions', label: 'Toggle paired Chat and Workqueue panes', binding: { accel: true, shift: true, key: 'l', display: 'Cmd/Ctrl+Shift+L' } },
  { id: 'workqueue.move', group: 'Workqueue actions', label: 'Move selected row in Workqueue keyboard mode', binding: { key: 'j/k', display: 'j/k' } },
  { id: 'workqueue.inspect', group: 'Workqueue actions', label: 'Inspect selected Workqueue row in keyboard mode', binding: { key: 'Enter', display: 'Enter' } },
  { id: 'workqueue.edit', group: 'Workqueue actions', label: 'Edit selected Workqueue row in keyboard mode', binding: { key: 'e', display: 'e' } },
  { id: 'workqueue.status', group: 'Workqueue actions', label: 'Set ready, in progress, blocked, or done in keyboard mode', binding: { key: '1..4', display: '1..4' } },
  { id: 'fleet.open', group: 'Fleet actions', label: 'Open/focus Fleet pane', binding: { accel: true, shift: true, key: 'f', display: 'Cmd/Ctrl+Shift+F' } },
  { id: 'fleet.sortHeartbeatGlobal', group: 'Fleet actions', label: 'Open Fleet sorted by heartbeat age', binding: { accel: true, shift: true, key: 'h', display: 'Cmd/Ctrl+Shift+H' } },
  { id: 'fleet.next', group: 'Fleet actions', label: 'Move Fleet selection down', binding: { key: 'j', display: 'J / Down' } },
  { id: 'fleet.prev', group: 'Fleet actions', label: 'Move Fleet selection up', binding: { key: 'k', display: 'K / Up' } },
  { id: 'fleet.openChatSelected', group: 'Fleet actions', label: 'Open Chat for selected Fleet agent', binding: { key: 'Enter', display: 'Enter' } },
  { id: 'fleet.openWorkqueueSelected', group: 'Fleet actions', label: 'Open Workqueue for selected Fleet agent', binding: { key: 'Enter', shift: true, display: 'Shift+Enter' } },
  { id: 'fleet.openTimelineSelected', group: 'Fleet actions', label: 'Open Timeline for selected Fleet agent', binding: { key: '.', display: '.' } },
  { id: 'fleet.toggleHeartbeatSort', group: 'Fleet actions', label: 'Toggle Fleet heartbeat age sort', binding: { key: 'h', display: 'H / Shift+H' } }
];

function readKeybindOverrides() {
  try {
    const parsed = JSON.parse(storage.get(KEYBIND_OVERRIDES_KEY, '{}'));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeKeybindOverrides(overrides) {
  storage.set(KEYBIND_OVERRIDES_KEY, JSON.stringify(overrides && typeof overrides === 'object' ? overrides : {}));
}

function keybindEntry(id) {
  return KEYBIND_CATALOG.find((entry) => entry.id === id) || null;
}

function keybindFor(id) {
  const entry = keybindEntry(id);
  if (!entry) return null;
  const override = readKeybindOverrides()[id];
  return override && typeof override === 'object' ? override : entry.binding;
}

function isKeybindCustomized(id) {
  return Object.prototype.hasOwnProperty.call(readKeybindOverrides(), id);
}

function setKeybindOverride(id, binding) {
  const entry = keybindEntry(id);
  if (!entry || !binding) return false;
  const overrides = readKeybindOverrides();
  overrides[id] = binding;
  writeKeybindOverrides(overrides);
  renderKeyboardSettings();
  renderShortcutsContent();
  return true;
}

function resetKeybindOverride(id) {
  const overrides = readKeybindOverrides();
  if (!Object.prototype.hasOwnProperty.call(overrides, id)) return false;
  delete overrides[id];
  writeKeybindOverrides(overrides);
  renderKeyboardSettings();
  renderShortcutsContent();
  return true;
}

function shortcutDisplay(id) {
  const shortcutActionId = keybindIdToShortcutActionId(id);
  if (shortcutActionId) {
    const label = shortcutComboLabel(activeShortcutCombo(shortcutActionId));
    if (label) return label;
  }
  const binding = keybindFor(id);
  return String(binding?.display || keybindEntry(id)?.binding?.display || '');
}

function renderShortcutKeys(display) {
  const parts = String(display || '')
    .split(/(\+|\/|\s+)/)
    .filter((part) => part !== '');
  return parts
    .map((part) => {
      if (part === '+') return '<span class="shortcut-sep">+</span>';
      if (part === '/') return '<span class="shortcut-sep">/</span>';
      if (/^\s+$/.test(part)) return '<span class="shortcut-sep"> </span>';
      return `<kbd>${escapeHtml(part)}</kbd>`;
    })
    .join('');
}

function shortcutStatusRule(entry) {
  const id = String(entry?.id || '');
  if (id === 'global.escape') return 'always';
  if (id === 'pane.next' || id === 'pane.prev' || id === 'pane.mruNext' || id === 'pane.mruPrev') return 'multi-pane';
  if (id === 'chat.next' || id === 'chat.prev') return 'multi-chat-pane';
  if (id === 'pane.unreadNext' || id === 'pane.unreadPrev') return 'unread-pane';
  if (id === 'pane.manager' || id === 'chat.composer' || id === 'command.palette') return 'modal-only';
  return 'typing-modal';
}

function renderShortcutsContent() {
  const root = globalElements.shortcutsContent;
  if (!root) return;
  const locked = isAdminLocked();
  const groups = [];
  for (const entry of KEYBIND_CATALOG) {
    let group = groups.find((g) => g.name === entry.group);
    if (!group) {
      group = { name: entry.group, entries: [] };
      groups.push(group);
    }
    group.entries.push(entry);
  }
  const hint = locked ? `
    <div class="hint" style="margin-bottom: 10px;">
      Admin is locked. These shortcuts are limited to sign-in and help until you unlock.
    </div>
  ` : `
    <div class="hint" style="margin-bottom: 10px;">
      Most shortcuts are disabled while typing in inputs, textareas, selects, or contenteditable fields. Global keys like <kbd>Esc</kbd>, <kbd>${escapeHtml(shortcutDisplay('pane.manager'))}</kbd>, and <kbd>${escapeHtml(shortcutDisplay('command.palette'))}</kbd> still work.
    </div>
  `;
  const html = groups.map((group) => `
    <div class="shortcut-group${locked && group.name !== 'Global' ? ' shortcut-group-locked' : ''}">
      <h3 class="shortcut-group-title">${locked && group.name === 'Global' ? 'Available now' : escapeHtml(group.name)}${locked && group.name !== 'Global' ? ' <span class="shortcut-locked-label">Available after unlock</span>' : ''}</h3>
      ${group.entries.map((entry) => `
        <div class="shortcut-row${locked && group.name !== 'Global' ? ' shortcut-row-locked' : ''}" data-shortcut-id="${escapeHtml(entry.id)}" data-shortcut-rule="${escapeHtml(shortcutStatusRule(entry))}">
          <div class="shortcut-keys"${keybindIdToShortcutActionId(entry.id) ? ` data-shortcut-help="${escapeHtml(keybindIdToShortcutActionId(entry.id))}"` : ''}>${renderShortcutKeys(shortcutDisplay(entry.id))}</div>
          <div class="shortcut-desc">${escapeHtml(entry.label)}${isKeybindCustomized(entry.id) ? ' <span class="shortcut-custom">custom</span>' : ''}</div>
        </div>
      `).join('')}
      ${locked && group.name === 'Global' ? '<div class="shortcut-row"><div class="shortcut-keys"><kbd>Enter</kbd></div><div class="shortcut-desc">Unlock after entering the admin password</div></div>' : ''}
    </div>
  `).join('');
  root.innerHTML = hint + html;
}

function shortcutCatalogSnapshot() {
  return KEYBIND_CATALOG.map((entry) => ({
    id: entry.id,
    group: entry.group,
    label: entry.label,
    display: shortcutDisplay(entry.id),
    global: isGlobalKeybindEntry(entry)
  }));
}

window.__clawnsoleShortcutCatalog = shortcutCatalogSnapshot;

function renderKeyboardSettings() {
  const root = globalElements.keybindConflictList;
  if (!root) return;
  const conflicted = KEYBIND_CATALOG.filter((entry) => entry.risk && !isKeybindCustomized(entry.id));
  const customized = KEYBIND_CATALOG.filter((entry) => entry.risk && isKeybindCustomized(entry.id));
  const rows = [...conflicted, ...customized].map((entry) => {
    const isCustom = isKeybindCustomized(entry.id);
    const reason = isCustom ? 'Using app-safe replacement' : entry.risk.reason;
    const action = isCustom
      ? `<button type="button" class="secondary keybind-action" data-keybind-reset="${escapeHtml(entry.id)}">Reset</button>`
      : `<button type="button" class="secondary keybind-action" data-keybind-apply="${escapeHtml(entry.id)}">Use ${escapeHtml(entry.risk.alternative.display)}</button>`;
    return `
      <div class="keybind-conflict-row ${isCustom ? 'resolved' : 'warning'}" data-keybind-row="${escapeHtml(entry.id)}">
        <div class="keybind-conflict-main">
          <div class="keybind-conflict-title">${escapeHtml(entry.label)}</div>
          <div class="keybind-conflict-meta">
            <span class="keybind-chip">${escapeHtml(shortcutDisplay(entry.id))}</span>
            <span>${escapeHtml(reason)}</span>
          </div>
        </div>
        ${action}
      </div>
    `;
  }).join('');
  root.innerHTML = rows || '<div class="hint">No risky keyboard shortcuts detected.</div>';
  root.querySelectorAll('[data-keybind-apply]').forEach((button) => {
    button.addEventListener('click', () => {
      const entry = keybindEntry(button.getAttribute('data-keybind-apply'));
      if (!entry?.risk?.alternative) return;
      setKeybindOverride(entry.id, entry.risk.alternative);
      showToast(`Updated ${entry.label} shortcut.`, { kind: 'info', timeoutMs: 2200 });
    });
  });
  root.querySelectorAll('[data-keybind-reset]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-keybind-reset');
      const entry = keybindEntry(id);
      resetKeybindOverride(id);
      showToast(`Reset ${entry?.label || 'shortcut'}.`, { kind: 'info', timeoutMs: 2200 });
    });
  });
}

function matchesKeybind(event, id) {
  const binding = keybindFor(id);
  if (!binding || binding.chord) return false;
  const key = String(event?.key || '');
  const lower = key.toLowerCase();
  if (binding.accel && !(event.metaKey || event.ctrlKey)) return false;
  if (binding.ctrlOnly && !(event.ctrlKey && !event.metaKey)) return false;
  if (!binding.accel && !binding.ctrlOnly && (event.metaKey || event.ctrlKey)) return false;
  if (!!binding.shift !== !!event.shiftKey) return false;
  if (!!binding.alt !== !!event.altKey) return false;
  const wanted = String(binding.key || '');
  if (wanted === 'Tab') return key === 'Tab';
  if (wanted === '1..9') {
    const n = Number.parseInt(key, 10);
    return Number.isFinite(n) && n >= 1 && n <= 9;
  }
  return lower === wanted.toLowerCase() || key === wanted;
}

function matchesKeybindWithOptionalAlt(event, id) {
  if (matchesKeybind(event, id)) return true;
  if (!event?.altKey) return false;
  return matchesKeybind({
    key: event.key,
    metaKey: event.metaKey,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: false
  }, id);
}

function isGlobalKeybindEntry(entry) {
  const binding = entry?.binding;
  if (!binding || binding.chord) return false;
  if (binding.accel || binding.ctrlOnly || binding.alt || binding.shift) return true;
  const key = String(binding.key || '');
  return key === 'Escape' || key === '?';
}
const WQ_RECENT_ENQUEUE_AGENTS_KEY = 'clawnsole.wq.recentEnqueueAgents';
const WQ_RECENT_TARGETS_MAX = 6;
const ADMIN_ACTIVE_PANE_KEY = 'clawnsole.admin.activePaneKey';

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

function getActiveAdminPaneKey() {
  try {
    const active = document.activeElement;
    const pane = active?.closest?.('[data-pane]');
    return typeof pane?.dataset?.paneKey === 'string' ? pane.dataset.paneKey : '';
  } catch {
    return '';
  }
}

function rememberedActivePaneKey() {
  return String(storage.get(ADMIN_ACTIVE_PANE_KEY, '') || '');
}

function rememberActivePaneKey(key) {
  const next = String(key || '');
  if (!next) return;
  storage.set(ADMIN_ACTIVE_PANE_KEY, next);
}

function readStoredAdminDestination(key = ADMIN_AUTH_DESTINATION_KEY) {
  const value = readJsonFromStorage(key, null);
  return normalizeAdminDestination(value, {
    origin: window.location.origin,
    now: Date.now(),
    ttlMs: ADMIN_AUTH_DESTINATION_TTL_MS
  });
}

function captureAdminAuthDestination() {
  try {
    const current = normalizeAdminDestination(
      {
        href: `${window.location.pathname || '/'}${window.location.search || ''}${window.location.hash || ''}`,
        createdAt: Date.now(),
        activePaneKey: getActiveAdminPaneKey()
      },
      { origin: window.location.origin, now: Date.now(), ttlMs: ADMIN_AUTH_DESTINATION_TTL_MS }
    );
    if (!current.ok) return;

    const existing = readStoredAdminDestination();
    if (existing.ok) return;

    writeJsonToStorage(ADMIN_AUTH_DESTINATION_KEY, {
      href: current.href,
      createdAt: Date.now(),
      activePaneKey: current.activePaneKey
    });
  } catch {}
}

function consumeAdminAuthDestination() {
  const raw = readJsonFromStorage(ADMIN_AUTH_DESTINATION_KEY, null);
  storage.remove(ADMIN_AUTH_DESTINATION_KEY);
  return normalizeAdminDestination(raw, {
    origin: window.location.origin,
    now: Date.now(),
    ttlMs: ADMIN_AUTH_DESTINATION_TTL_MS
  });
}

function buildDefaultAdminPanes(defaultAgent = 'main') {
  const agentId = defaultAgent || 'main';
  return [
    { key: `p${randomId().slice(0, 8)}`, kind: 'chat', agentId },
    {
      key: `p${randomId().slice(0, 8)}`,
      kind: 'workqueue',
      queue: 'dev-team',
      statusFilter: ['ready', 'pending', 'blocked', 'claimed', 'in_progress'],
      scopeFilter: getDefaultWorkqueueScopeForTarget(agentId),
      sortKey: 'priority',
      sortDir: 'desc'
    }
  ];
}

function fallbackToDefaultAdminDestination() {
  const storedDefault = storage.get(ADMIN_DEFAULT_AGENT_KEY, 'main');
  storage.set(ADMIN_PANES_KEY, JSON.stringify(buildDefaultAdminPanes(storedDefault || 'main')));
  storage.set(ADMIN_AUTH_RESTORE_NOTICE_KEY, 'Saved admin destination expired. Restored the default admin layout.');
  return '/admin';
}

function applyPendingAdminRestore() {
  const pending = readStoredAdminDestination(ADMIN_AUTH_RESTORE_PENDING_KEY);
  storage.remove(ADMIN_AUTH_RESTORE_PENDING_KEY);

  const notice = storage.get(ADMIN_AUTH_RESTORE_NOTICE_KEY, '');
  storage.remove(ADMIN_AUTH_RESTORE_NOTICE_KEY);
  if (notice) showToast(notice, { kind: 'info', timeoutMs: 4200 });

  if (!pending.ok || !pending.activePaneKey) return;
  const pane = paneManager.panes.find((p) => p.key === pending.activePaneKey);
  if (!pane) return;
  paneManager.focusPanePrimary(pane);
}

function readRecentWorkqueueTargets() {
  const list = readJsonFromStorage(WQ_RECENT_TARGETS_KEY, []);
  return Array.isArray(list)
    ? list.map((v) => String(v || '').trim()).filter(Boolean).slice(0, WQ_RECENT_TARGETS_MAX)
    : [];
}

function rememberRecentWorkqueueTarget(target) {
  const next = String(target || '').trim();
  if (!next) return;
  const deduped = [next, ...readRecentWorkqueueTargets().filter((v) => v !== next)];
  writeJsonToStorage(WQ_RECENT_TARGETS_KEY, deduped.slice(0, WQ_RECENT_TARGETS_MAX));
}

function readRecentWorkqueueEnqueueAgents() {
  const list = readJsonFromStorage(WQ_RECENT_ENQUEUE_AGENTS_KEY, []);
  return Array.isArray(list)
    ? list.map((v) => String(v || '').trim()).filter(Boolean).slice(0, WQ_RECENT_TARGETS_MAX)
    : [];
}

function rememberRecentWorkqueueEnqueueAgent(agentId) {
  const next = String(agentId || '').trim();
  if (!next) return;
  const deduped = [next, ...readRecentWorkqueueEnqueueAgents().filter((v) => v !== next)];
  writeJsonToStorage(WQ_RECENT_ENQUEUE_AGENTS_KEY, deduped.slice(0, WQ_RECENT_TARGETS_MAX));
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

function heartbeatAgeBucket(ageMs, { activeWindowMs = 10 * 60_000, paneState = 'unknown' } = {}) {
  if (paneState === 'error' || paneState === 'offline') return 'critical';
  if (!Number.isFinite(ageMs)) return 'critical';
  if (ageMs <= activeWindowMs) return 'fresh';
  if (ageMs <= activeWindowMs * 3) return 'warning';
  if (ageMs <= activeWindowMs * 10) return 'stale';
  return 'critical';
}

function heartbeatAgeBucketLabel(bucket) {
  if (bucket === 'fresh') return 'fresh';
  if (bucket === 'warning') return 'warning';
  if (bucket === 'stale') return 'stale';
  return 'critical';
}

function getFleetFilter() {
  const raw = String(storage.get(ADMIN_AGENT_FILTER_KEY, 'all') || 'all').trim();
  const allowed = new Set(['all', 'active', 'stale', 'offline_error']);
  return allowed.has(raw) ? raw : 'all';
}

function getFleetSort() {
  const raw = String(storage.get(ADMIN_AGENT_SORT_KEY, 'recent_desc') || 'recent_desc').trim();
  const allowed = new Set(['recent_desc', 'heartbeat_age_desc', 'agent_id_asc']);
  return allowed.has(raw) ? raw : 'recent_desc';
}

function getFleetHeatmapEnabled() {
  return String(storage.get(ADMIN_AGENT_HEATMAP_KEY, '0')) === '1';
}

function getFleetDensity() {
  return String(storage.get(ADMIN_AGENT_DENSITY_KEY, 'comfortable') || 'comfortable') === 'compact' ? 'compact' : 'comfortable';
}

function getFleetColumns() {
  const defaults = {};
  FLEET_COLUMN_DEFS.forEach((col) => {
    defaults[col.key] = !!col.defaultVisible;
  });
  const saved = readJsonFromStorage(ADMIN_AGENT_COLUMNS_KEY, {});
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return defaults;
  FLEET_COLUMN_DEFS.forEach((col) => {
    if (typeof saved[col.key] === 'boolean') defaults[col.key] = saved[col.key];
  });
  return defaults;
}

function setFleetColumn(key, visible) {
  const allowed = new Set(FLEET_COLUMN_DEFS.map((col) => col.key));
  if (!allowed.has(key)) return;
  const next = getFleetColumns();
  next[key] = !!visible;
  writeJsonToStorage(ADMIN_AGENT_COLUMNS_KEY, next);
}

function renderFleetColumnPicker() {
  const root = globalElements.agentsColumnOptions;
  if (!root) return;
  const visible = getFleetColumns();
  root.innerHTML = '';
  FLEET_COLUMN_DEFS.forEach((col) => {
    const id = `agentsColumn_${col.key}`;
    const label = document.createElement('label');
    label.className = 'agents-column-option';
    label.setAttribute('for', id);
    label.innerHTML = `
      <input id="${id}" type="checkbox" data-agents-column="${escapeHtml(col.key)}" ${visible[col.key] ? 'checked' : ''} />
      <span>${escapeHtml(col.label)}</span>
    `;
    label.querySelector('input')?.addEventListener('change', (event) => {
      const input = event.currentTarget;
      setFleetColumn(col.key, !!input.checked);
      renderAgentsModalList();
    });
    root.appendChild(label);
  });
}

function syncFleetDensityControl() {
  const density = getFleetDensity();
  if (globalElements.agentsList) {
    globalElements.agentsList.dataset.density = density;
    globalElements.agentsList.classList.toggle('compact', density === 'compact');
  }
  globalElements.agentsDensityButtons.forEach((btn) => {
    const active = String(btn.getAttribute('data-agents-density') || '') === density;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function getAgentPaneStateMap() {
  const out = {};
  for (const pane of Array.isArray(paneManager?.panes) ? paneManager.panes : []) {
    const id = String(pane?.agentId || '').trim();
    if (!id) continue;
    const s = String(pane?.statusState || '').trim().toLowerCase();
    const prev = out[id] || 'unknown';
    if (s === 'error') out[id] = 'error';
    else if (s === 'offline' && prev !== 'error') out[id] = 'offline';
    else if (s === 'connected' && prev === 'unknown') out[id] = 'connected';
  }
  return out;
}

function getAgentStatusSnippetMap() {
  const out = {};
  for (const pane of Array.isArray(paneManager?.panes) ? paneManager.panes : []) {
    const id = String(pane?.agentId || '').trim();
    if (!id) continue;
    const meta = String(pane?.statusMeta || '').trim();
    if (!meta) continue;
    const prior = String(out[id] || '').trim();
    if (!prior || prior.length < meta.length) out[id] = meta;
  }
  return out;
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
function showToast(
  message,
  {
    kind = 'info',
    timeoutMs = 2600,
    actionLabel = '',
    onAction = null,
    secondaryActionLabel = '',
    onSecondaryAction = null,
    testId = 'toast',
    role = '',
    ariaLabel = '',
    autoFocusAction = false
  } = {}
) {
  if (!globalElements.toastHost) return;
  const text = typeof message === 'string' ? message.trim() : String(message || '').trim();
  if (!text) return;

  const existing = Array.from(globalElements.toastHost.querySelectorAll('[data-testid]')).find((node) => {
    return (
      node instanceof HTMLElement &&
      node.classList.contains('open') &&
      node.dataset.toastKind === kind &&
      node.querySelector('.toast-message')?.textContent === text
    );
  });
  if (existing) return existing;

  const el = document.createElement('div');
  el.className = `toast ${kind === 'error' ? 'toast-error' : 'toast-info'}`;
  const id = ++toastSeq;
  el.dataset.toastId = String(id);
  el.setAttribute('data-testid', testId || 'toast');
  el.dataset.toastKind = kind;
  if (role) el.setAttribute('role', String(role));
  if (ariaLabel) el.setAttribute('aria-label', String(ariaLabel));

  const messageEl = document.createElement('span');
  messageEl.className = 'toast-message';
  messageEl.textContent = text;
  el.appendChild(messageEl);

  const hasAction = actionLabel && typeof onAction === 'function';
  let actionBtn = null;
  if (hasAction) {
    actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.className = 'toast-action';
    actionBtn.textContent = String(actionLabel);
    actionBtn.dataset.testid = 'toast-action';
    el.appendChild(actionBtn);
  }

  const hasSecondaryAction = secondaryActionLabel && typeof onSecondaryAction === 'function';
  let secondaryActionBtn = null;
  if (hasSecondaryAction) {
    secondaryActionBtn = document.createElement('button');
    secondaryActionBtn.type = 'button';
    secondaryActionBtn.className = 'toast-action toast-action-secondary';
    secondaryActionBtn.textContent = String(secondaryActionLabel);
    secondaryActionBtn.dataset.testid = 'toast-secondary-action';
    el.appendChild(secondaryActionBtn);
  }

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
  const actionButtons = [actionBtn, secondaryActionBtn].filter(Boolean);
  if (actionButtons.length) {
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        clearTimeout(timer);
        try {
          if (hasSecondaryAction) onSecondaryAction?.();
        } catch {}
        remove();
        return;
      }
      if (event.key !== 'Tab' || actionButtons.length < 2) return;
      const first = actionButtons[0];
      const last = actionButtons[actionButtons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }
  if (autoFocusAction && actionBtn) {
    setTimeout(() => {
      try {
        actionBtn.focus();
      } catch {}
    }, 0);
  }
  actionBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(timer);
    try {
      onAction?.();
    } catch {}
    remove();
  });
  secondaryActionBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(timer);
    try {
      onSecondaryAction?.();
    } catch {}
    remove();
  });

  el.addEventListener('click', () => {
    if (hasAction || hasSecondaryAction) return;
    clearTimeout(timer);
    remove();
  });
}

let agentRefreshTimer = null;
let agentRefreshInFlight = null;
let agentAutoRefreshInterval = null;
let agentsModalAutoRefreshInterval = null;
let agentsModalFreshnessTicker = null;
let agentsLastRefreshedAtMs = 0;
const FLEET_DEFAULT_STALE_THRESHOLD_MINUTES = 1;
const FLEET_DEFAULT_ACTIVE_WINDOW_MINUTES = 10;
const fleetRefreshLock = {
  lockedAtMs: 0,
  pointerInsideRow: false,
  deferredRefreshPending: false,
  deferredReason: '',
  catchupTimer: null
};

function isAgentsModalOpen() {
  return !!globalElements.agentsModal?.classList?.contains('open');
}

function getFleetRefreshPausedEl() {
  return document.getElementById('agentsRefreshPaused');
}

function renderFleetRefreshPaused() {
  const el = getFleetRefreshPausedEl();
  if (!el) return;
  if (!fleetRefreshLock.lockedAtMs) {
    el.hidden = true;
    el.textContent = '';
    renderAgentsLastRefreshed();
    return;
  }
  el.hidden = false;
  el.textContent = `Refresh paused \u2022 ${formatRelativeAge(Date.now() - fleetRefreshLock.lockedAtMs)}`;
  renderAgentsLastRefreshed();
}

function hasFleetRowInteraction() {
  if (!isAgentsModalOpen()) return false;
  if (fleetRefreshLock.pointerInsideRow) return true;
  const active = document.activeElement;
  if (active && globalElements.agentsList?.contains(active) && active.closest?.('.agents-row')) return true;
  return !!globalElements.agentsList?.querySelector?.('.agents-row-actions-overflow[open]');
}

function setFleetRefreshLock(locked) {
  const nextLocked = !!locked && isAgentsModalOpen();
  if (nextLocked) {
    if (!fleetRefreshLock.lockedAtMs) fleetRefreshLock.lockedAtMs = Date.now();
    renderFleetRefreshPaused();
    return;
  }
  if (hasFleetRowInteraction()) return;
  if (!fleetRefreshLock.lockedAtMs) {
    renderFleetRefreshPaused();
    return;
  }
  fleetRefreshLock.lockedAtMs = 0;
  renderFleetRefreshPaused();
  if (!fleetRefreshLock.deferredRefreshPending) return;
  fleetRefreshLock.deferredRefreshPending = false;
  const reason = fleetRefreshLock.deferredReason || 'fleet_interaction_resume';
  fleetRefreshLock.deferredReason = '';
  clearTimeout(fleetRefreshLock.catchupTimer);
  fleetRefreshLock.catchupTimer = setTimeout(() => {
    fleetRefreshLock.catchupTimer = null;
    if (hasFleetRowInteraction()) {
      fleetRefreshLock.deferredRefreshPending = true;
      fleetRefreshLock.deferredReason = reason;
      setFleetRefreshLock(true);
      return;
    }
    refreshAgents({ reason }).catch(() => {});
  }, 250);
}

function deferFleetRefresh(reason) {
  fleetRefreshLock.deferredRefreshPending = true;
  fleetRefreshLock.deferredReason = String(reason || fleetRefreshLock.deferredReason || 'fleet_interaction_resume');
  setFleetRefreshLock(true);
  return uiState.agents;
}

function clearFleetRefreshLock() {
  fleetRefreshLock.pointerInsideRow = false;
  fleetRefreshLock.lockedAtMs = 0;
  fleetRefreshLock.deferredRefreshPending = false;
  fleetRefreshLock.deferredReason = '';
  clearTimeout(fleetRefreshLock.catchupTimer);
  fleetRefreshLock.catchupTimer = null;
  renderFleetRefreshPaused();
}

const fleetSelectionState = {
  selectedAgentId: '',
  selectedIndex: 0,
  notice: '',
  missingAgentId: ''
};

let triageReturnAnchor = null;

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

function formatRelativeAge(msAgo) {
  const ms = Math.max(0, Number(msAgo) || 0);
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  return `${Math.floor(ms / 3_600_000)}h ago`;
}

function renderAgentsLastRefreshed() {
  if (!globalElements.agentsLastRefreshed) return;
  if (!agentsLastRefreshedAtMs) {
    globalElements.agentsLastRefreshed.textContent = 'Last updated: never';
    globalElements.agentsLastRefreshed.dataset.freshness = 'unknown';
    return;
  }
  const ageMs = Date.now() - agentsLastRefreshedAtMs;
  const staleMs = FLEET_DEFAULT_STALE_THRESHOLD_MINUTES * 60_000;
  const age = formatRelativeAge(ageMs);
  const stale = ageMs > staleMs || fleetRefreshLock.lockedAtMs;
  globalElements.agentsLastRefreshed.dataset.freshness = stale ? 'stale' : 'fresh';
  globalElements.agentsLastRefreshed.textContent = stale ? `Stale · ${age}` : `Last updated: ${age}`;
}

function startAgentsModalAutoRefresh() {
  if (agentsModalAutoRefreshInterval) return;
  agentsModalAutoRefreshInterval = setInterval(() => {
    if (!isAgentsModalOpen()) return;
    if (document.hidden) return;
    refreshAgents({ reason: 'fleet_auto_refresh' }).catch(() => {});
  }, 10_000);
}

function stopAgentsModalAutoRefresh() {
  if (!agentsModalAutoRefreshInterval) return;
  clearInterval(agentsModalAutoRefreshInterval);
  agentsModalAutoRefreshInterval = null;
}

function startAgentsModalFreshnessTicker() {
  if (agentsModalFreshnessTicker) return;
  agentsModalFreshnessTicker = setInterval(() => {
    if (!isAgentsModalOpen()) return;
    renderAgentsLastRefreshed();
    renderFleetRefreshPaused();
    if (fleetRefreshLock.lockedAtMs) return;
    renderAgentsModalList();
  }, 1000);
}

function stopAgentsModalFreshnessTicker() {
  if (!agentsModalFreshnessTicker) return;
  clearInterval(agentsModalFreshnessTicker);
  agentsModalFreshnessTicker = null;
}

async function refreshAgents({ reason = 'manual', showSuccessToast = false } = {}) {
  if (roleState.role !== 'admin') return uiState.agents;
  if (!uiState.authed) return uiState.agents;
  if (reason !== 'manual' && hasFleetRowInteraction()) return deferFleetRefresh(reason);

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
    agentsLastRefreshedAtMs = Date.now();
    renderAgentsLastRefreshed();

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
  const pickerRoots = document.querySelectorAll('[data-wq-claim-agent-picker]');
  if (pickerRoots && pickerRoots.length) {
    pickerRoots.forEach((root) => hydrateWorkqueueClaimAgentPicker(root));
    return;
  }

  const selects = document.querySelectorAll('select[data-wq-claim-agent]');
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

function getWorkqueueClaimAgentOptions() {
  const agents = Array.isArray(uiState.agents) ? uiState.agents : [];
  const byId = new Map();
  for (const agent of agents) {
    const id = String(agent?.id || '').trim();
    if (!id) continue;
    byId.set(id, {
      id,
      label: formatAgentLabel(agent, { includeId: true }),
      shortLabel: formatAgentLabel(agent, { includeId: false }),
      recent: false
    });
  }

  const recent = readRecentWorkqueueEnqueueAgents().filter((id) => byId.has(id));
  const out = [{ id: '', label: 'Unassigned', shortLabel: 'Unassigned', recent: false }];
  for (const id of recent) out.push({ ...byId.get(id), recent: true });
  for (const option of Array.from(byId.values()).sort((a, b) => a.label.localeCompare(b.label))) {
    if (recent.includes(option.id)) continue;
    out.push(option);
  }
  return out;
}

function hydrateWorkqueueClaimAgentPicker(root) {
  if (!root) return;
  const input = root.querySelector('[data-wq-claim-agent-search]');
  const list = root.querySelector('[data-wq-claim-agent-list]');
  const hidden = root.querySelector('[data-wq-claim-agent]');
  if (!input || !list || !hidden) return;

  if (root.__wqClaimAgentPickerHydrated) {
    const existing = String(hidden.value || '').trim();
    hidden.value = getWorkqueueClaimAgentOptions().some((o) => o.id === existing) ? existing : '';
    const option = getWorkqueueClaimAgentOptions().find((o) => o.id === String(hidden.value || '')) || getWorkqueueClaimAgentOptions()[0];
    input.value = option?.shortLabel || 'Unassigned';
    root.__wqClaimAgentPickerRender?.();
    return;
  }

  let activeIndex = 0;
  const setSelected = (id, { close = true, focusTitle = false } = {}) => {
    hidden.value = String(id || '');
    const option = getWorkqueueClaimAgentOptions().find((o) => o.id === hidden.value) || getWorkqueueClaimAgentOptions()[0];
    input.value = option?.shortLabel || 'Unassigned';
    if (hidden.value) rememberRecentWorkqueueEnqueueAgent(hidden.value);
    if (close) root.classList.remove('open');
    if (focusTitle) root.closest('form')?.querySelector('[data-wq-enqueue-title]')?.focus?.();
    render();
  };

  const render = () => {
    const query = root.classList.contains('open') ? String(input.value || '').trim().toLowerCase() : '';
    const current = String(hidden.value || '');
    const options = getWorkqueueClaimAgentOptions().filter((option) => {
      if (!query) return true;
      return option.label.toLowerCase().includes(query) || option.id.toLowerCase().includes(query);
    });
    if (activeIndex >= options.length) activeIndex = Math.max(0, options.length - 1);

    list.innerHTML = '';
    if (!options.length) {
      const empty = document.createElement('div');
      empty.className = 'wq-agent-picker-empty';
      empty.textContent = 'No matching targets';
      list.appendChild(empty);
      return;
    }

    let priorRecent = null;
    options.forEach((option, index) => {
      if (option.recent !== priorRecent) {
        priorRecent = option.recent;
        if (option.recent) {
          const heading = document.createElement('div');
          heading.className = 'wq-agent-picker-heading';
          heading.textContent = 'Recent';
          list.appendChild(heading);
        } else if (index > 0) {
          const heading = document.createElement('div');
          heading.className = 'wq-agent-picker-heading';
          heading.textContent = 'All targets';
          list.appendChild(heading);
        }
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wq-agent-picker-option';
      if (index === activeIndex) btn.classList.add('active');
      if (option.id === current) btn.classList.add('selected');
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', option.id === current ? 'true' : 'false');
      btn.dataset.agentId = option.id;
      btn.innerHTML = `<span>${escapeHtml(option.label)}</span>${option.recent ? '<span class="wq-agent-picker-badge">recent</span>' : ''}`;
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', () => setSelected(option.id, { focusTitle: true }));
      list.appendChild(btn);
    });
  };

  const open = ({ selectText = false } = {}) => {
    root.classList.add('open');
    activeIndex = 0;
    render();
    if (selectText) {
      try {
        input.select();
      } catch {}
    }
  };

  input.addEventListener('focus', () => open({ selectText: true }));
  input.addEventListener('blur', () => {
    setTimeout(() => {
      if (!root.contains(document.activeElement)) root.classList.remove('open');
    }, 120);
  });
  input.addEventListener('input', () => {
    root.classList.add('open');
    activeIndex = 0;
    render();
  });
  input.addEventListener('keydown', (e) => {
    const options = Array.from(list.querySelectorAll('.wq-agent-picker-option'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      root.classList.add('open');
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      activeIndex = options.length ? (activeIndex + delta + options.length) % options.length : 0;
      render();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const selected = Array.from(list.querySelectorAll('.wq-agent-picker-option'))[activeIndex];
      if (selected) setSelected(selected.dataset.agentId || '', { focusTitle: true });
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      root.classList.remove('open');
      const option = getWorkqueueClaimAgentOptions().find((o) => o.id === String(hidden.value || '')) || getWorkqueueClaimAgentOptions()[0];
      input.value = option?.shortLabel || 'Unassigned';
    }
  });
  const existing = String(hidden.value || '').trim();
  const fallback = getWorkqueueClaimAgentOptions().some((o) => o.id === existing) ? existing : '';
  hidden.value = fallback;
  input.value = (getWorkqueueClaimAgentOptions().find((o) => o.id === fallback)?.shortLabel || 'Unassigned');
  root.__wqClaimAgentPickerHydrated = true;
  root.__wqClaimAgentPickerRender = render;
  render();
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
      renderAuthSessionUi();
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
        emoji: typeof agent?.emoji === 'string' ? agent.emoji : '',
        model: typeof agent?.model === 'string' ? agent.model : '',
        host: typeof agent?.host === 'string' ? agent.host : ''
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
  el.classList.remove('connected', 'error', 'working', 'locked');
  if (state === 'connected') el.classList.add('connected');
  if (state === 'error') el.classList.add('error');
  if (state === 'locked') el.classList.add('locked');
  if (state === 'connecting' || state === 'reconnecting' || state === 'offline') {
    el.classList.add('working');
  }
  el.title = meta || '';
}

function updateGlobalStatus() {
  const status = deriveGlobalConnectionState({ authed: uiState.authed, panes: paneManager.panes });
  setStatusPill(globalElements.status, status.state, status.meta);
  if (globalElements.status) globalElements.status.hidden = !uiState.authed;
  renderActivePaneState();
  if (globalElements.paneManagerBtn) {
    globalElements.paneManagerBtn.hidden = !uiState.authed || !status.meta;
    globalElements.paneManagerBtn.textContent = uiState.authed ? status.meta : '';
    const label = status.ariaLabel ? `Open pane manager. Shift-click to filter panes needing attention. ${status.ariaLabel}` : 'Open pane manager';
    globalElements.paneManagerBtn.setAttribute('aria-label', label);
    globalElements.paneManagerBtn.title = status.ariaLabel || status.meta || 'Open pane manager';
  }
}

function updateConnectionControls() {
  if (!globalElements.disconnectBtn) return;
  const control = deriveDisconnectButtonState({ authed: uiState.authed, panes: paneManager.panes });
  globalElements.disconnectBtn.disabled = !!control.disabled;
  globalElements.disconnectBtn.textContent = control.text;
}

function updateAuthAction(authUi) {
  if (!globalElements.logoutBtn) return;
  globalElements.logoutBtn.disabled = !authUi.logoutEnabled;
  globalElements.logoutBtn.style.opacity = authUi.logoutOpacity;
  globalElements.logoutBtn.setAttribute('aria-label', authUi.authActionLabel);
  globalElements.logoutBtn.setAttribute('title', authUi.authActionText);
  const label = globalElements.logoutBtn.querySelector('.btn-label');
  if (label) label.textContent = authUi.authActionText;
}

function currentAuthUi() {
  return deriveAuthOverlayState({
    authed: uiState.authed,
    role: roleState.role,
    environment: uiState.meta?.instance || 'local'
  });
}

function closeAuthSessionPopover() {
  if (!globalElements.authSessionPopover) return;
  globalElements.authSessionPopover.hidden = true;
  globalElements.rolePill?.setAttribute('aria-expanded', 'false');
}

function renderAuthSessionUi() {
  const authUi = currentAuthUi();
  const pill = globalElements.rolePill;
  if (pill) {
    pill.textContent = authUi.rolePillText;
    pill.classList.toggle('admin', authUi.rolePillAdmin);
    pill.classList.toggle('locked', authUi.rolePillLocked);
    pill.classList.toggle('signed-out', authUi.rolePillSignedOut);
    pill.dataset.authState = authUi.authState || 'signed_out';
    pill.setAttribute('aria-label', authUi.rolePillActionLabel || 'Authentication status');
    pill.title = authUi.rolePillTooltip || authUi.rolePillActionLabel || 'Authentication status';
  }

  const popover = globalElements.authSessionPopover;
  if (popover) {
    const statusEl = popover.querySelector('[data-auth-session-status]');
    const principalEl = popover.querySelector('[data-auth-session-principal]');
    const envEl = popover.querySelector('[data-auth-session-env]');
    if (statusEl) statusEl.textContent = authUi.authLabel || 'Signed out';
    if (principalEl) principalEl.textContent = authUi.principalLabel || 'Not signed in';
    if (envEl) envEl.textContent = authUi.environmentLabel || 'local';
    popover.querySelector('[data-auth-session-action="settings"]')?.toggleAttribute('hidden', !uiState.authed);
    popover.querySelector('[data-auth-session-action="logout"]')?.toggleAttribute('hidden', !uiState.authed);
    popover.querySelector('[data-auth-session-action="unlock"]')?.toggleAttribute('hidden', !!uiState.authed);
  }

  return authUi;
}

function setAuthState(authed) {
  uiState.authed = authed;
  const authUi = renderAuthSessionUi();
  updateGlobalStatus();
  updateConnectionControls();
  paneManager.refreshChatEnabled();

  if (authUi.startAgentAutoRefresh) {
    startAgentAutoRefresh();
  } else {
    stopAgentAutoRefresh();
  }

  updateAuthAction(authUi);
}

function setRole(role) {
  roleState.role = role;
  const authUi = renderAuthSessionUi();

  updateAuthAction(authUi);

  const showAdminControls = authUi.showAdminControls;
  const visibleOpacity = showAdminControls ? '1' : '0.5';

  if (globalElements.refreshAgentsBtn) {
    globalElements.refreshAgentsBtn.hidden = !showAdminControls;
    globalElements.refreshAgentsBtn.disabled = !showAdminControls;
    globalElements.refreshAgentsBtn.style.opacity = visibleOpacity;
  }

  if (authUi.startAgentAutoRefresh) {
    startAgentAutoRefresh();
  } else {
    stopAgentAutoRefresh();
  }

  if (globalElements.settingsBtn) {
    if (showAdminControls) globalElements.settingsBtn.removeAttribute('disabled');
    else globalElements.settingsBtn.setAttribute('disabled', 'disabled');
    globalElements.settingsBtn.style.opacity = visibleOpacity;
  }

  if (globalElements.paneControls) {
    globalElements.paneControls.hidden = !showAdminControls;
  }
  if (globalElements.agentsBtn) {
    globalElements.agentsBtn.hidden = !showAdminControls;
    globalElements.agentsBtn.disabled = !showAdminControls;
    globalElements.agentsBtn.style.opacity = visibleOpacity;
  }

  if (globalElements.workqueueBtn) {
    globalElements.workqueueBtn.hidden = !showAdminControls;
    globalElements.workqueueBtn.disabled = !showAdminControls;
    globalElements.workqueueBtn.style.opacity = visibleOpacity;
  }

  if (globalElements.fleetBtn) {
    globalElements.fleetBtn.hidden = !showAdminControls;
    globalElements.fleetBtn.disabled = !showAdminControls;
    globalElements.fleetBtn.style.opacity = visibleOpacity;
  }

  if (globalElements.shortcutsBtn) {
    globalElements.shortcutsBtn.hidden = !showAdminControls;
    globalElements.shortcutsBtn.disabled = !showAdminControls;
    globalElements.shortcutsBtn.style.opacity = visibleOpacity;
  }
}

function showLogin(message = '') {
  captureAdminAuthDestination();
  globalElements.loginOverlay.classList.add('open');
  globalElements.loginOverlay.setAttribute('aria-hidden', 'false');
  globalElements.loginError.textContent = message;
  globalElements.loginPassword.value = '';

  // Guest role selection removed.

  setAuthState(false);
  closeAuthSessionPopover();
  globalElements.settingsBtn?.setAttribute('disabled', 'disabled');
  if (globalElements.settingsBtn) globalElements.settingsBtn.style.opacity = '0.5';
  if (globalElements.shortcutsBtn && roleState.role === 'admin') {
    globalElements.shortcutsBtn.hidden = false;
    globalElements.shortcutsBtn.removeAttribute('disabled');
    globalElements.shortcutsBtn.style.opacity = '1';
  }
  globalElements.fleetBtn?.setAttribute('disabled', 'disabled');
  if (globalElements.fleetBtn) globalElements.fleetBtn.style.opacity = '0.5';

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
    const destination = consumeAdminAuthDestination();
    let nextHref = '/admin';
    if (destination.ok) {
      nextHref = destination.href || '/admin';
      writeJsonToStorage(ADMIN_AUTH_RESTORE_PENDING_KEY, {
        href: nextHref,
        createdAt: Date.now(),
        activePaneKey: destination.activePaneKey || ''
      });
    } else {
      nextHref = fallbackToDefaultAdminDestination();
    }
    window.location.replace(nextHref);
  } catch {
    showLogin('Login failed. Please retry.');
  }
}

function openSettings() {
  if (globalElements.paneSwitchHudEnabled) {
    globalElements.paneSwitchHudEnabled.checked = isPaneSwitchHudEnabled();
  }
  if (globalElements.headerLabeledControlsEnabled) {
    globalElements.headerLabeledControlsEnabled.checked = areHeaderLabeledControlsEnabled();
  }
  renderKeyboardSettings();
  shortcutOverridesDraft = readShortcutOverrides();
  renderShortcutOverrideSettings();
  openAdminModal(globalElements.settingsModal);

  // Guest mode removed.

  loadRecurringPromptAgents();
  loadRecurringPrompts();
}

function closeSettings({ restoreFocus = true } = {}) {
  closeAdminModal(globalElements.settingsModal, { restoreFocus });
  shortcutOverridesDraft = null;
}

function applyTriageLayoutPreset() {
  if (roleState.role !== 'admin') return null;

  const defaultAgent = normalizeAgentId(storage.get(ADMIN_DEFAULT_AGENT_KEY, 'main') || 'main');
  const panes = () => Array.isArray(paneManager?.panes) ? paneManager.panes : [];

  let chatPane = panes().find((pane) => pane?.role === 'admin' && pane.kind === 'chat') || null;
  if (!chatPane) chatPane = paneManager.addPane('chat', { agentId: defaultAgent });

  let workqueuePane = panes().find((pane) =>
    pane?.role === 'admin' &&
    pane.kind === 'workqueue' &&
    String(pane.workqueue?.queue || '').trim() === 'dev-team'
  ) || null;
  if (!workqueuePane) workqueuePane = paneManager.addPane('workqueue', { queue: 'dev-team' });

  let fleetPane = panes().find((pane) =>
    pane?.role === 'admin' &&
    pane.kind === 'timeline' &&
    String(pane.cronAgentId || '').trim() === 'all'
  ) || null;
  if (!fleetPane) fleetPane = openFleetPane();

  if (chatPane) paneManager.focusPanePrimary(chatPane);
  paneManager.persistAdminPanes();
  showToast('Triage preset ready: Chat + Workqueue + Fleet.', { kind: 'success', timeoutMs: 1800, testId: 'triage-preset-toast' });
  return { chatPane, workqueuePane, fleetPane };
}

const SHORTCUT_OVERRIDE_ACTIONS = [
  {
    id: 'pane-next',
    label: 'Focus next pane',
    defaultCombo: { accel: true, shift: true, alt: false, key: 'k' },
    run: () => cyclePaneFocus()
  },
  {
    id: 'pane-previous',
    label: 'Focus previous pane',
    defaultCombo: { accel: true, shift: true, alt: false, key: 'j' },
    run: () => cyclePaneFocusBackward()
  },
  {
    id: 'pane-manager',
    label: 'Open pane manager',
    defaultCombo: { accel: true, shift: false, alt: false, key: 'p' },
    run: () => openPaneManager(),
    typingExempt: true
  },
  {
    id: 'workqueue-open',
    label: 'Open workqueue',
    defaultCombo: { sequence: ['g', 'w'] },
    run: () => openTopbarWorkqueueAction()
  },
  {
    id: 'fleet-open',
    label: 'Open fleet/agents',
    defaultCombo: { accel: true, shift: true, alt: false, key: 'f' },
    run: () => openFleetPane()
  }
];
const SHORTCUT_OVERRIDE_ACTION_BY_ID = new Map(SHORTCUT_OVERRIDE_ACTIONS.map((action) => [action.id, action]));
const SHORTCUT_SAFE_ALTERNATIVES = {
  'pane-next': [
    { accel: true, alt: true, shift: false, key: 'y' },
    { accel: true, alt: true, shift: false, key: 'u' },
    { accel: true, alt: true, shift: false, key: 'k' }
  ],
  'pane-previous': [
    { accel: true, alt: true, shift: false, key: 'u' },
    { accel: true, alt: true, shift: false, key: 'y' },
    { accel: true, alt: true, shift: false, key: 'j' }
  ],
  'pane-manager': [
    { accel: true, alt: true, shift: false, key: 'p' },
    { accel: true, alt: true, shift: false, key: 'm' },
    { accel: true, shift: true, alt: false, key: 'p' }
  ],
  'workqueue-open': [
    { sequence: ['g', 'w'] },
    { accel: true, alt: true, shift: false, key: 'w' },
    { accel: true, shift: true, alt: true, key: 'w' }
  ],
  'fleet-open': [
    { accel: true, alt: true, shift: false, key: 'f' },
    { accel: true, alt: true, shift: false, key: 'a' },
    { accel: true, shift: true, alt: true, key: 'f' }
  ]
};
let shortcutOverridesDraft = null;

function keybindIdToShortcutActionId(id) {
  return ({
    'pane.next': 'pane-next',
    'pane.prev': 'pane-previous',
    'pane.manager': 'pane-manager',
    'workqueue.open': 'workqueue-open',
    'fleet.open': 'fleet-open'
  })[String(id || '')] || '';
}

function normalizeShortcutKey(key) {
  const raw = String(key || '').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (lower === ' ') return 'space';
  if (lower === 'escape') return 'esc';
  if (lower === 'arrowup') return 'up';
  if (lower === 'arrowdown') return 'down';
  if (lower === 'arrowleft') return 'left';
  if (lower === 'arrowright') return 'right';
  if (lower.length === 1) return lower;
  return lower;
}

function normalizeShortcutCombo(combo) {
  if (!combo || typeof combo !== 'object') return '';
  if (Array.isArray(combo.sequence) && combo.sequence.length) {
    return combo.sequence.map((part) => normalizeShortcutKey(part)).filter(Boolean).join(' ');
  }
  const key = normalizeShortcutKey(combo.key);
  if (!key) return '';
  const parts = [];
  if (combo.accel) parts.push('accel');
  if (combo.ctrl) parts.push('ctrl');
  if (combo.meta) parts.push('meta');
  if (combo.alt) parts.push('alt');
  if (combo.shift) parts.push('shift');
  parts.push(key);
  return parts.join('+');
}

function shortcutComboEquals(a, b) {
  return normalizeShortcutCombo(a) === normalizeShortcutCombo(b);
}

function shortcutComboFromEvent(event) {
  const key = normalizeShortcutKey(event?.key);
  if (!key || ['control', 'shift', 'alt', 'meta'].includes(key)) return null;
  return {
    accel: !!(event.metaKey || event.ctrlKey),
    alt: !!event.altKey,
    shift: !!event.shiftKey,
    key
  };
}

function shortcutComboLabel(combo) {
  if (!combo || typeof combo !== 'object') return '';
  if (Array.isArray(combo.sequence) && combo.sequence.length) {
    return combo.sequence.map((part) => normalizeShortcutKey(part).toUpperCase()).join(' ');
  }
  const key = normalizeShortcutKey(combo.key);
  if (!key) return '';
  const parts = [];
  if (combo.accel) parts.push('Cmd/Ctrl');
  if (combo.ctrl) parts.push('Ctrl');
  if (combo.meta) parts.push('Cmd');
  if (combo.alt) parts.push('Alt/Option');
  if (combo.shift) parts.push('Shift');
  parts.push(key.length === 1 ? key.toUpperCase() : key.replace(/\b\w/g, (m) => m.toUpperCase()));
  return parts.join('+');
}

function shortcutComboHtml(combo) {
  const label = shortcutComboLabel(combo);
  if (!label) return '';
  if (Array.isArray(combo?.sequence)) {
    return label.split(/\s+/).map((part) => `<kbd>${escapeHtml(part)}</kbd>`).join(' ');
  }
  return label.split('+').map((part) => `<kbd>${escapeHtml(part)}</kbd>`).join('+');
}

function isShortcutLayoutSensitive(combo) {
  if (!combo || Array.isArray(combo.sequence)) return false;
  const key = normalizeShortcutKey(combo.key);
  if (!/^[0-9]$/.test(key)) return false;
  return !!combo.alt;
}

function shortcutConflictRisk(combo) {
  const normalized = normalizeShortcutCombo(combo);
  if (!normalized) return null;
  const knownRisks = new Map([
    ['accel+p', 'Reserved by browser print'],
    ['accel+r', 'Reloads the page in most browsers'],
    ['accel+l', 'Reserved by browser address bar focus'],
    ['accel+w', 'Closes the current browser tab'],
    ['accel+q', 'Quits the app or browser on macOS'],
    ['accel+n', 'Opens a new browser window'],
    ['accel+t', 'Opens a new browser tab'],
    ['accel+shift+t', 'Reopens the last closed browser tab'],
    ['accel+shift+n', 'Reserved by browser private window'],
    ['accel+shift+r', 'Hard reloads the page in browsers'],
    ['accel+shift+f', 'Reserved by browser search tools'],
    ['meta+space', 'Reserved by macOS Spotlight'],
    ['meta+tab', 'Reserved by macOS app switching'],
    ['meta+shift+3', 'Reserved by macOS screenshots'],
    ['meta+shift+4', 'Reserved by macOS screenshots'],
    ['alt+tab', 'Reserved by OS window switching'],
    ['alt+f4', 'Reserved by Windows close-window command'],
    ['ctrl+esc', 'Reserved by Windows Start menu'],
    ['ctrl+shift+esc', 'Reserved by Windows Task Manager']
  ]);
  const reason = knownRisks.get(normalized);
  if (reason) return { reason };
  if (isShortcutLayoutSensitive(combo)) {
    return { reason: 'Layout-sensitive on international keyboards' };
  }
  return null;
}

function shortcutComboHasDuplicate(actionId, combo, overrides) {
  const normalized = normalizeShortcutCombo(combo);
  if (!normalized) return true;
  return SHORTCUT_OVERRIDE_ACTIONS.some((action) =>
    action.id !== actionId && normalizeShortcutCombo(activeShortcutCombo(action.id, overrides)) === normalized
  );
}

function suggestedShortcutAlternatives(actionId, overrides) {
  const candidates = SHORTCUT_SAFE_ALTERNATIVES[actionId] || [];
  return candidates.filter((combo) => {
    if (!normalizeShortcutCombo(combo)) return false;
    if (shortcutConflictRisk(combo)) return false;
    return !shortcutComboHasDuplicate(actionId, combo, overrides);
  });
}

function cleanShortcutOverrides(value) {
  const source = value && typeof value === 'object' ? value : {};
  const cleaned = {};
  for (const action of SHORTCUT_OVERRIDE_ACTIONS) {
    const combo = source[action.id];
    if (!combo || typeof combo !== 'object') continue;
    if (shortcutComboEquals(combo, action.defaultCombo)) continue;
    if (normalizeShortcutCombo(combo)) cleaned[action.id] = combo;
  }
  return cleaned;
}

function readShortcutOverrides() {
  return cleanShortcutOverrides(readJsonFromStorage(SHORTCUT_OVERRIDES_KEY, {}));
}

function activeShortcutCombo(actionId, source = null) {
  const action = SHORTCUT_OVERRIDE_ACTION_BY_ID.get(actionId);
  if (!action) return null;
  const overrides = source || readShortcutOverrides();
  return overrides[actionId] || action.defaultCombo;
}

function validateShortcutOverrides(overrides) {
  const seen = new Map();
  for (const action of SHORTCUT_OVERRIDE_ACTIONS) {
    const combo = activeShortcutCombo(action.id, overrides);
    const normalized = normalizeShortcutCombo(combo);
    if (!normalized) return { ok: false, message: `${action.label}: press a shortcut combo.` };
    if (seen.has(normalized)) {
      return { ok: false, message: `${action.label} conflicts with ${seen.get(normalized)}. Pick a different combo.` };
    }
    seen.set(normalized, action.label);
    if (!Array.isArray(combo.sequence) && !combo.accel && !combo.alt && !combo.ctrl && !combo.meta) {
      return { ok: false, message: `${action.label}: use Cmd/Ctrl, Alt/Option, or a g-chord style default to avoid normal typing keys.` };
    }
  }
  const reserved = [
    ['accel+q', 'Cmd/Ctrl+Q is usually reserved by the browser or OS. Try Cmd/Ctrl+Shift+K.'],
    ['accel+w', 'Cmd/Ctrl+W closes tabs. Try Cmd/Ctrl+Shift+W with another action free.'],
    ['accel+n', 'Cmd/Ctrl+N opens a new window. Try Cmd/Ctrl+Shift+N only if Add pane is not needed.'],
    ['accel+t', 'Cmd/Ctrl+T opens a new tab. Try Cmd/Ctrl+Alt+T.']
  ];
  for (const action of SHORTCUT_OVERRIDE_ACTIONS) {
    const normalized = normalizeShortcutCombo(activeShortcutCombo(action.id, overrides));
    const hit = reserved.find(([combo]) => combo === normalized);
    if (hit) return { ok: false, message: `${action.label}: ${hit[1]}` };
  }
  const fixedConflicts = new Map([
    ['accel+k', 'Open command palette'],
    ['accel+l', 'Focus Chat composer'],
    ['accel+r', 'Refresh agent list'],
    ['accel+shift+n', 'Add pane menu'],
    ['accel+shift+c', 'New Chat pane'],
    ['accel+shift+w', 'New Workqueue pane'],
    ['accel+shift+r', 'New Cron pane'],
    ['accel+shift+t', 'New Timeline pane']
  ]);
  for (const action of SHORTCUT_OVERRIDE_ACTIONS) {
    const normalized = normalizeShortcutCombo(activeShortcutCombo(action.id, overrides));
    if (shortcutComboEquals(activeShortcutCombo(action.id, overrides), action.defaultCombo)) continue;
    if (fixedConflicts.has(normalized)) {
      return { ok: false, message: `${action.label} conflicts with ${fixedConflicts.get(normalized)}. Try ${shortcutComboLabel(action.defaultCombo)} or another combo.` };
    }
  }
  return { ok: true, message: '' };
}

function shortcutRiskSummary(actionId, overrides) {
  const combo = activeShortcutCombo(actionId, overrides);
  const risk = shortcutConflictRisk(combo);
  if (!risk) return null;
  const alternatives = suggestedShortcutAlternatives(actionId, overrides);
  return {
    reason: risk.reason,
    alternatives
  };
}

function renderShortcutHelpLabels() {
  for (const action of SHORTCUT_OVERRIDE_ACTIONS) {
    document.querySelectorAll(`[data-shortcut-help="${action.id}"]`).forEach((el) => {
      el.innerHTML = shortcutComboHtml(activeShortcutCombo(action.id));
    });
  }
}

function renderShortcutOverrideSettings() {
  const list = globalElements.shortcutOverridesList;
  if (!list) return;
  const overrides = shortcutOverridesDraft || readShortcutOverrides();
  list.innerHTML = '';
  for (const action of SHORTCUT_OVERRIDE_ACTIONS) {
    const combo = activeShortcutCombo(action.id, overrides);
    const risk = shortcutRiskSummary(action.id, overrides);
    const firstAlternative = risk?.alternatives?.[0] || null;
    const row = document.createElement('div');
    row.className = 'shortcut-override-row';
    if (risk) row.classList.add('shortcut-override-row-warning');
    row.innerHTML = `
      <div>
        <div class="shortcut-override-label">${escapeHtml(action.label)}</div>
        <div class="shortcut-override-default">Default: ${escapeHtml(shortcutComboLabel(action.defaultCombo))}</div>
        ${risk ? `
          <div class="shortcut-override-warning" role="status">
            ${escapeHtml(risk.reason)}
            ${firstAlternative ? `<button class="link-btn" type="button" data-shortcut-suggestion="${escapeHtml(action.id)}" data-shortcut-combo="${escapeHtml(normalizeShortcutCombo(firstAlternative))}">Use ${escapeHtml(shortcutComboLabel(firstAlternative))}</button>` : ''}
          </div>
        ` : ''}
      </div>
      <input class="shortcut-override-input" data-shortcut-action="${escapeHtml(action.id)}" type="text" value="${escapeHtml(shortcutComboLabel(combo))}" readonly aria-label="${escapeHtml(`${action.label} shortcut`)}" />
      <button class="secondary" type="button" data-shortcut-reset="${escapeHtml(action.id)}">Reset</button>
    `;
    list.appendChild(row);
  }
  const validation = validateShortcutOverrides(overrides);
  setShortcutOverridesError(validation.ok ? '' : validation.message);
}

function setShortcutOverridesError(message) {
  const el = globalElements.shortcutOverridesError;
  if (!el) return;
  const text = String(message || '').trim();
  el.textContent = text;
  el.hidden = !text;
}

function saveShortcutOverridesFromSettings() {
  const overrides = cleanShortcutOverrides(shortcutOverridesDraft || readShortcutOverrides());
  const validation = validateShortcutOverrides(overrides);
  if (!validation.ok) {
    setShortcutOverridesError(validation.message);
    return false;
  }
  writeJsonToStorage(SHORTCUT_OVERRIDES_KEY, overrides);
  shortcutOverridesDraft = null;
  renderShortcutHelpLabels();
  renderShortcutOverrideSettings();
  showToast('Shortcut overrides saved.', { kind: 'info', timeoutMs: 2200 });
  return true;
}

function resetShortcutOverride(actionId) {
  const overrides = cleanShortcutOverrides(shortcutOverridesDraft || readShortcutOverrides());
  delete overrides[actionId];
  shortcutOverridesDraft = overrides;
  renderShortcutOverrideSettings();
}

function resetAllShortcutOverrides() {
  shortcutOverridesDraft = {};
  storage.remove(SHORTCUT_OVERRIDES_KEY);
  renderShortcutHelpLabels();
  renderShortcutOverrideSettings();
  showToast('Shortcut overrides reset.', { kind: 'info', timeoutMs: 2200 });
}

function comboFromNormalizedShortcut(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (!raw.includes('+')) {
    const parts = raw.split(/\s+/).map((part) => normalizeShortcutKey(part)).filter(Boolean);
    return parts.length > 1 ? { sequence: parts } : null;
  }
  const parts = raw.split('+').map((part) => normalizeShortcutKey(part)).filter(Boolean);
  const key = parts[parts.length - 1] || '';
  if (!key) return null;
  return {
    accel: parts.includes('accel'),
    ctrl: parts.includes('ctrl') || undefined,
    meta: parts.includes('meta') || undefined,
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
    key
  };
}

function applyShortcutSuggestion(actionId, normalizedCombo) {
  const action = SHORTCUT_OVERRIDE_ACTION_BY_ID.get(actionId);
  const combo = comboFromNormalizedShortcut(normalizedCombo);
  if (!action || !combo) return false;
  const overrides = cleanShortcutOverrides(shortcutOverridesDraft || readShortcutOverrides());
  if (shortcutComboEquals(combo, action.defaultCombo)) delete overrides[actionId];
  else overrides[actionId] = combo;
  const validation = validateShortcutOverrides(overrides);
  if (!validation.ok) {
    setShortcutOverridesError(validation.message);
    return false;
  }
  writeJsonToStorage(SHORTCUT_OVERRIDES_KEY, overrides);
  shortcutOverridesDraft = cleanShortcutOverrides(overrides);
  renderShortcutHelpLabels();
  renderShortcutOverrideSettings();
  showToast(`Shortcut updated to ${shortcutComboLabel(combo)}.`, { kind: 'info', timeoutMs: 2200 });
  return true;
}

const recurringPromptState = {
  editingId: '',
  items: [],
  historyFilterId: 'all',
  historyRows: [],
  historyLoading: false,
  historyError: ''
};

function formatRecurringDate(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return '—';
  try {
    return new Date(n).toLocaleString();
  } catch {
    return '—';
  }
}

function resetRecurringPromptForm() {
  recurringPromptState.editingId = '';
  if (globalElements.recurringPromptInterval) globalElements.recurringPromptInterval.value = '60';
  if (globalElements.recurringPromptTimezone) globalElements.recurringPromptTimezone.value = 'local';
  if (globalElements.recurringPromptMessage) globalElements.recurringPromptMessage.value = '';
  if (globalElements.recurringPromptEnabled) globalElements.recurringPromptEnabled.checked = true;
  if (globalElements.recurringPromptCreateBtn) globalElements.recurringPromptCreateBtn.textContent = 'Create prompt';
  if (globalElements.recurringPromptCancelEditBtn) globalElements.recurringPromptCancelEditBtn.hidden = true;
}

function populateRecurringPromptForm(prompt) {
  if (!prompt) return;
  recurringPromptState.editingId = String(prompt.id || '');
  if (globalElements.recurringPromptTarget) globalElements.recurringPromptTarget.value = String(prompt.target || prompt.agentId || 'main');
  if (globalElements.recurringPromptInterval) globalElements.recurringPromptInterval.value = String(Math.max(1, Number(prompt.intervalMinutes) || 60));
  if (globalElements.recurringPromptTimezone) globalElements.recurringPromptTimezone.value = String(prompt.timezone || 'local');
  if (globalElements.recurringPromptMessage) globalElements.recurringPromptMessage.value = String(prompt.promptText || prompt.message || '');
  if (globalElements.recurringPromptEnabled) globalElements.recurringPromptEnabled.checked = prompt.enabled !== false;
  if (globalElements.recurringPromptCreateBtn) globalElements.recurringPromptCreateBtn.textContent = 'Save changes';
  if (globalElements.recurringPromptCancelEditBtn) globalElements.recurringPromptCancelEditBtn.hidden = false;
}

function renderRecurringPrompts() {
  const body = globalElements.recurringPromptRows;
  if (!body) return;
  const rows = Array.isArray(recurringPromptState.items) ? recurringPromptState.items : [];
  body.innerHTML = '';
  if (!rows.length) {
    if (globalElements.recurringPromptEmpty) globalElements.recurringPromptEmpty.hidden = false;
    return;
  }
  if (globalElements.recurringPromptEmpty) globalElements.recurringPromptEmpty.hidden = true;

  rows.forEach((prompt) => {
    const tr = document.createElement('tr');
    const enabledText = prompt.enabled !== false ? 'enabled' : 'disabled';
    const nextRun = formatRecurringDate(prompt.nextRun || prompt.nextRunAt);
    const lastRun = formatRecurringDate(prompt?.lastRun?.ts || prompt.lastRunAt);
    tr.innerHTML = `
      <td>${escapeHtml(enabledText)}</td>
      <td>${escapeHtml(String(prompt.target || prompt.agentId || 'main'))}</td>
      <td>${escapeHtml(String(prompt.scheduleSummary || `every ${Math.max(1, Number(prompt.intervalMinutes) || 60)} minutes`))}</td>
      <td>${escapeHtml(lastRun)}</td>
      <td>${escapeHtml(nextRun)}</td>
      <td class="settings-rp-actions">
        <button type="button" class="secondary" data-rp-action="edit" data-rp-id="${escapeHtml(String(prompt.id || ''))}">Edit</button>
        <button type="button" class="secondary" data-rp-action="toggle" data-rp-id="${escapeHtml(String(prompt.id || ''))}">${prompt.enabled !== false ? 'Disable' : 'Enable'}</button>
        <button type="button" class="danger" data-rp-action="delete" data-rp-id="${escapeHtml(String(prompt.id || ''))}">Delete</button>
      </td>
    `;
    body.appendChild(tr);
  });
}

function renderRecurringPromptHistoryFilter() {
  const select = globalElements.recurringPromptHistoryFilter;
  if (!select) return;
  const prior = String(recurringPromptState.historyFilterId || 'all');
  const prompts = Array.isArray(recurringPromptState.items) ? recurringPromptState.items : [];
  select.innerHTML = '<option value="all">All prompts</option>';
  prompts.forEach((prompt) => {
    const id = String(prompt?.id || '').trim();
    if (!id) return;
    const label = String(prompt?.title || prompt?.promptText || prompt?.message || id);
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = label;
    select.appendChild(opt);
  });
  select.value = Array.from(select.options).find((opt) => opt.value === prior) ? prior : 'all';
  recurringPromptState.historyFilterId = String(select.value || 'all');
}

function renderRecurringPromptHistory() {
  const body = globalElements.recurringPromptHistoryRows;
  const empty = globalElements.recurringPromptHistoryEmpty;
  if (!body) return;
  body.innerHTML = '';

  if (recurringPromptState.historyLoading) {
    if (empty) {
      empty.hidden = false;
      empty.textContent = 'Loading run history…';
    }
    return;
  }

  if (recurringPromptState.historyError) {
    if (empty) {
      empty.hidden = false;
      empty.textContent = recurringPromptState.historyError;
    }
    return;
  }

  const rows = Array.isArray(recurringPromptState.historyRows) ? recurringPromptState.historyRows : [];
  if (!rows.length) {
    if (empty) {
      empty.hidden = false;
      empty.textContent = 'No recent runs for this filter yet.';
    }
    return;
  }

  if (empty) empty.hidden = true;
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(formatRecurringDate(row.ts))}</td>
      <td>${escapeHtml(String(row.status || 'unknown'))}</td>
      <td>${escapeHtml(String(row.target || 'main'))}</td>
      <td>${escapeHtml(String(row.promptTitle || row.promptId || '—'))}</td>
      <td>${escapeHtml(String(row.error || '—'))}</td>
    `;
    body.appendChild(tr);
  });
}

async function loadRecurringPromptHistory() {
  const selectedId = String(recurringPromptState.historyFilterId || globalElements.recurringPromptHistoryFilter?.value || 'all');
  const prompts = Array.isArray(recurringPromptState.items) ? recurringPromptState.items : [];
  recurringPromptState.historyLoading = true;
  recurringPromptState.historyError = '';
  renderRecurringPromptHistory();

  try {
    let historyRows = [];
    if (selectedId && selectedId !== 'all') {
      const prompt = prompts.find((p) => String(p?.id || '') === selectedId);
      const fallbackTarget = String(prompt?.target || prompt?.agentId || 'main');
      const fallbackTitle = String(prompt?.title || prompt?.promptText || prompt?.message || selectedId);
      const res = await fetch(`/api/recurring-prompts/${encodeURIComponent(selectedId)}/runs?limit=50`, { credentials: 'include', cache: 'no-store' });
      if (!res.ok) throw new Error('history request failed');
      const payload = await res.json();
      historyRows = (Array.isArray(payload?.runs) ? payload.runs : []).map((run) => ({
        ...run,
        promptId: selectedId,
        promptTitle: fallbackTitle,
        target: fallbackTarget
      }));
    } else {
      historyRows = prompts
        .flatMap((prompt) => (Array.isArray(prompt?.runHistory) ? prompt.runHistory : []).map((run) => ({
          ...run,
          promptId: String(prompt?.id || ''),
          promptTitle: String(prompt?.title || prompt?.promptText || prompt?.message || prompt?.id || '—'),
          target: String(prompt?.target || prompt?.agentId || 'main')
        })))
        .sort((a, b) => (Number(b?.ts) || 0) - (Number(a?.ts) || 0))
        .slice(0, 100);
    }
    recurringPromptState.historyRows = historyRows;
  } catch {
    recurringPromptState.historyRows = [];
    recurringPromptState.historyError = 'Failed to load run history.';
  } finally {
    recurringPromptState.historyLoading = false;
    renderRecurringPromptHistory();
  }
}

async function loadRecurringPromptAgents() {
  const select = globalElements.recurringPromptTarget;
  if (!select) return;
  try {
    const res = await fetch('/agents', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return;
    const payload = await res.json();
    const agents = Array.isArray(payload?.agents) ? payload.agents : [];
    const prior = String(select.value || 'main');
    select.innerHTML = '';
    agents.forEach((agent) => {
      const id = String(agent?.id || '').trim();
      if (!id) return;
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = id;
      select.appendChild(opt);
    });
    if (!select.options.length) {
      const opt = document.createElement('option');
      opt.value = 'main';
      opt.textContent = 'main';
      select.appendChild(opt);
    }
    select.value = Array.from(select.options).find((opt) => opt.value === prior) ? prior : 'main';
  } catch {}
}

async function loadRecurringPrompts() {
  try {
    const res = await fetch('/api/recurring-prompts', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) throw new Error('load failed');
    const payload = await res.json();
    recurringPromptState.items = Array.isArray(payload?.prompts) ? payload.prompts : [];
    renderRecurringPrompts();
    renderRecurringPromptHistoryFilter();
    await loadRecurringPromptHistory();
  } catch {
    recurringPromptState.items = [];
    recurringPromptState.historyRows = [];
    recurringPromptState.historyError = 'Failed to load run history.';
    renderRecurringPrompts();
    renderRecurringPromptHistoryFilter();
    renderRecurringPromptHistory();
    showToast('Failed to load recurring prompts.', { kind: 'error', timeoutMs: 3200 });
  }
}

async function createRecurringPromptFromUi() {
  const message = String(globalElements.recurringPromptMessage?.value || '').trim();
  if (!message) {
    showToast('Prompt text is required.', { kind: 'error', timeoutMs: 2800 });
    return;
  }
  const intervalMinutes = Math.max(1, Number(globalElements.recurringPromptInterval?.value) || 60);
  const body = {
    agentId: String(globalElements.recurringPromptTarget?.value || 'main').trim() || 'main',
    intervalMinutes,
    message,
    enabled: !!globalElements.recurringPromptEnabled?.checked
  };

  const isEdit = !!recurringPromptState.editingId;
  const url = isEdit ? `/api/recurring-prompts/${encodeURIComponent(recurringPromptState.editingId)}` : '/api/recurring-prompts';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('save failed');
    resetRecurringPromptForm();
    await loadRecurringPrompts();
    showToast(isEdit ? 'Recurring prompt updated.' : 'Recurring prompt created.', { kind: 'info', timeoutMs: 2200 });
  } catch {
    showToast('Failed to save recurring prompt.', { kind: 'error', timeoutMs: 3200 });
  }
}

async function toggleRecurringPrompt(id) {
  const current = recurringPromptState.items.find((p) => String(p?.id || '') === String(id));
  if (!current) return;
  try {
    const res = await fetch(`/api/recurring-prompts/${encodeURIComponent(String(id))}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ enabled: current.enabled === false })
    });
    if (!res.ok) throw new Error('toggle failed');
    await loadRecurringPrompts();
  } catch {
    showToast('Failed to update prompt.', { kind: 'error', timeoutMs: 3200 });
  }
}

async function deleteRecurringPrompt(id) {
  try {
    const res = await fetch(`/api/recurring-prompts/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('delete failed');
    if (String(recurringPromptState.editingId) === String(id)) resetRecurringPromptForm();
    await loadRecurringPrompts();
  } catch {
    showToast('Failed to delete prompt.', { kind: 'error', timeoutMs: 3200 });
  }
}

let shortcutsLastFocusedEl = null;
let shortcutsStatusTimer = null;
let paneShortcutBadgesAltHeld = false;

const SHORTCUT_STATUS_LABELS = {
  available: 'Available',
  'typing-focus': 'Blocked: typing-focus',
  'modal-open': 'Blocked: modal-open',
  'layout-state': 'Blocked: layout-state'
};

function isAdminLocked() {
  return !uiState.authed && (
    roleState.role === 'admin' ||
    globalElements.loginOverlay?.classList?.contains('open') ||
    globalElements.loginOverlay?.getAttribute?.('aria-hidden') === 'false'
  );
}

function syncShortcutsLockedState() {
  const locked = isAdminLocked();
  globalElements.shortcutsModal?.classList.toggle('locked-state', locked);
}

function getModalFocusableElements(modalEl) {
  if (!modalEl || !modalEl.querySelectorAll) return [];
  return Array.from(modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    .filter((el) => !el.disabled && !el.hidden && el.getAttribute('aria-hidden') !== 'true');
}

function ensureShortcutStatusChip(row) {
  if (!row) return null;
  let chip = row.querySelector('[data-shortcut-status]');
  if (!chip) {
    chip = document.createElement('div');
    chip.className = 'shortcut-status';
    chip.setAttribute('data-shortcut-status', '');
    row.appendChild(chip);
  }
  return chip;
}

function shortcutsModalIsOpen() {
  return !!globalElements.shortcutsModal?.classList?.contains('open');
}

function getShortcutRowBlockReason(row) {
  const rule = String(row?.getAttribute?.('data-shortcut-rule') || 'typing-modal');
  if (rule === 'always') return '';

  const typingReference = shortcutsModalIsOpen() ? shortcutsLastFocusedEl : document.activeElement;
  if (rule !== 'modal-only' && isTypingContext(typingReference)) return 'typing-focus';

  const panes = paneManager?.panes || [];
  const paneCount = panes.length;
  const chatPaneCount = panes.filter((pane) => pane.kind === 'chat').length;
  const hasUnreadPane = panes.some((pane) => paneUnreadCount(pane) > 0);
  if (rule === 'multi-pane' && paneCount < 2) return 'layout-state';
  if (rule === 'multi-chat-pane' && chatPaneCount < 2) return 'layout-state';
  if (rule === 'unread-pane' && !hasUnreadPane) return 'layout-state';

  if (shortcutsModalIsOpen() && rule !== 'always') return 'modal-open';

  return '';
}

function updateShortcutsStatus() {
  const modal = globalElements.shortcutsModal;
  if (!modal) return;
  modal.querySelectorAll('.shortcut-row').forEach((row) => {
    const chip = ensureShortcutStatusChip(row);
    if (!chip) return;
    const reason = getShortcutRowBlockReason(row);
    const state = reason || 'available';
    chip.textContent = SHORTCUT_STATUS_LABELS[state] || SHORTCUT_STATUS_LABELS.available;
    chip.dataset.state = state;
  });
}

function startShortcutsStatusUpdates() {
  window.clearInterval(shortcutsStatusTimer);
  updateShortcutsStatus();
  shortcutsStatusTimer = window.setInterval(updateShortcutsStatus, 500);
}

function stopShortcutsStatusUpdates() {
  window.clearInterval(shortcutsStatusTimer);
  shortcutsStatusTimer = null;
}

function openShortcuts() {
  const modal = globalElements.shortcutsModal;
  if (!modal) return;
  if (modal.classList.contains('open')) {
    renderShortcutsContent();
    syncShortcutsLockedState();
    updatePaneShortcutBadges();
    updateShortcutsStatus();
    return;
  }
  renderShortcutsContent();
  syncShortcutsLockedState();
  shortcutsLastFocusedEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  openAdminModal(modal, { focusReturn: shortcutsLastFocusedEl });
  startShortcutsStatusUpdates();
  updatePaneShortcutBadges();
  window.setTimeout(() => {
    (globalElements.shortcutsDialog || globalElements.shortcutsCloseBtn || modal).focus?.();
  }, 0);
}

function closeShortcuts({ restoreFocus = true } = {}) {
  const modal = globalElements.shortcutsModal;
  if (!modal || !modal.classList.contains('open')) return;
  closeAdminModal(modal, { restoreFocus });
  stopShortcutsStatusUpdates();
  updatePaneShortcutBadges();
  if (restoreFocus && shortcutsLastFocusedEl && document.contains(shortcutsLastFocusedEl)) {
    shortcutsLastFocusedEl.focus?.();
  }
  shortcutsLastFocusedEl = null;
}

// Pane Manager (admin-only)

const paneManagerUiState = {
  open: false,
  selectedIndex: 0,
  query: '',
  unreadOnly: false,
  attentionOnly: false,
  visiblePaneKeys: [],
  collapsedKinds: {
    chat: false,
    workqueue: false,
    cron: false,
    timeline: false
  }
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

function paneTypeBadgeMarkup(pane, { extraClass = '', testId = '' } = {}) {
  const kind = String(pane?.kind || 'chat');
  const label = paneLabel(pane);
  const icon = paneIcon(pane);
  const classes = ['pane-type-badge', `pane-type-${kind}`, extraClass].filter(Boolean).join(' ');
  const testAttr = testId ? ` data-testid="${escapeHtml(testId)}"` : '';
  return `<span class="${escapeHtml(classes)}" data-pane-type-badge data-pane-accent="${escapeHtml(kind)}"${testAttr} aria-label="${escapeHtml(`Pane type: ${label}`)}"><span class="pane-type-icon" aria-hidden="true">${escapeHtml(icon)}</span><span class="pane-type-text">${escapeHtml(label)}</span></span>`;
}

function paneTargetLabel(pane) {
  if (!pane) return '';
  if (pane.kind === 'workqueue') return formatWorkqueuePaneQueueLabel(pane);
  const current = String(pane?.elements?.agentLabel?.textContent || '').trim();
  if (current) return current;
  if (pane.kind === 'timeline' || pane.kind === 'cron') return 'gateway';
  return String(pane.agentId || 'main');
}

function formatWorkqueuePaneQueueLabel(pane) {
  const queue = String(pane?.workqueue?.queue || '').trim();
  return queue || 'No queue';
}

function normalizePaneNickname(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 48);
}

function paneNickname(pane) {
  return normalizePaneNickname(pane?.nickname || '');
}

function paneBrowserTitle(pane) {
  if (!pane) return 'Clawnsole';
  const parts = ['Clawnsole', paneLabel(pane)];
  const nickname = paneNickname(pane);
  if (nickname) parts.push(nickname);
  if (pane.kind === 'chat' || pane.kind === 'workqueue') {
    const target = paneDisplayTargetLabel(pane);
    if (target) parts.push(target);
  }
  return parts.join(' · ');
}

function updateBrowserTitle(pane = null) {
  const panes = paneManager?.panes || [];
  const selectedPane =
    pane ||
    panes.find((entry) => String(entry?.key || '') === focusedPaneKey()) ||
    panes.find((entry) => String(entry?.key || '') === paneMruOrder()[0]) ||
    null;
  document.title = paneBrowserTitle(selectedPane);
}

function paneIdentityLabel(pane, { includeUnread = false, includeDraft = true } = {}) {
  const letter = paneHeaderLetter(pane);
  const type = paneLabel(pane);
  const target = paneDisplayTargetLabel(pane);
  const nickname = paneNickname(pane);
  const unread = paneUnreadCount(pane);
  const draft = includeDraft && paneHasDraftChanges(pane);
  return `${letter} ${type} · ${target}${nickname ? ` · ${nickname}` : ''}${includeUnread && unread > 0 ? ` • ${unread} unread` : ''}${draft ? ' • unsent draft' : ''}`;
}

function paneSummaryLabel(pane) {
  const letter = paneHeaderLetter(pane);
  const type = paneLabel(pane);
  const target = paneDisplayTargetLabel(pane);
  return `${letter} ${type} · ${target}`;
}

function isPaneSwitchHudEnabled() {
  return String(storage.get(PANE_SWITCH_HUD_ENABLED_KEY, '1') || '1') !== '0';
}

function areHeaderLabeledControlsEnabled() {
  return String(storage.get(HEADER_LABELED_CONTROLS_ENABLED_KEY, '1') || '1') !== '0';
}

function applyHeaderLabeledControlsSetting() {
  document.body.classList.toggle('header-labels-off', !areHeaderLabeledControlsEnabled());
}

applyHeaderLabeledControlsSetting();

let paneSwitchHudHideTimer = null;

function ensurePaneSwitchHud() {
  let hud = document.getElementById('paneSwitchHud');
  if (hud) return hud;
  hud = document.createElement('div');
  hud.id = 'paneSwitchHud';
  hud.className = 'pane-switch-hud';
  hud.setAttribute('role', 'status');
  hud.setAttribute('aria-live', 'polite');
  hud.setAttribute('aria-atomic', 'true');
  hud.tabIndex = -1;
  hud.hidden = true;
  document.body.appendChild(hud);
  return hud;
}

function paneSwitchHudActions(pane) {
  const kind = String(pane?.kind || 'chat');
  if (kind === 'workqueue') return ['Refresh', 'Claim'];
  if (kind === 'cron') return ['Refresh', 'Open job'];
  if (kind === 'timeline') return ['Refresh', 'Filter'];
  return ['Send', 'Attach'];
}

function showPaneSwitchHud(pane) {
  if (!pane || !isPaneSwitchHudEnabled()) return;
  const hud = ensurePaneSwitchHud();
  const actions = paneSwitchHudActions(pane);
  hud.innerHTML = `
    <div class="pane-switch-hud-title">${escapeHtml(paneIdentityLabel(pane))}</div>
    <div class="pane-switch-hud-actions">${actions.map((action) => `<span>${escapeHtml(action)}</span>`).join('')}</div>
  `;
  hud.hidden = false;
  hud.classList.remove('is-hiding');
  hud.classList.add('is-visible');

  if (paneSwitchHudHideTimer) clearTimeout(paneSwitchHudHideTimer);
  paneSwitchHudHideTimer = setTimeout(() => {
    hud.classList.add('is-hiding');
    hud.classList.remove('is-visible');
    paneSwitchHudHideTimer = setTimeout(() => {
      hud.hidden = true;
    }, 180);
  }, 900);
}

function paneDuplicateKey(pane) {
  return `${String(pane?.kind || 'chat')}::${String(paneTargetLabel(pane) || '').trim().toLowerCase()}`;
}

function paneDuplicateOrdinal(pane) {
  const panes = Array.isArray(paneManager?.panes) ? paneManager.panes : [];
  const duplicateKey = paneDuplicateKey(pane);
  const matching = panes.filter((entry) => paneDuplicateKey(entry) === duplicateKey);
  if (matching.length <= 1) return { ordinal: 0, total: matching.length };
  const index = matching.findIndex((entry) => String(entry?.key || '') === String(pane?.key || ''));
  return { ordinal: index >= 0 ? index + 1 : 0, total: matching.length };
}

function paneDisplayTargetLabel(pane) {
  const target = paneTargetLabel(pane);
  const { ordinal } = paneDuplicateOrdinal(pane);
  return ordinal > 0 ? `${target} (${ordinal})` : target;
}

function focusedPaneKey() {
  const active = document.activeElement;
  const panes = paneManager?.panes || [];
  const pane = panes.find((entry) => {
    const root = entry?.elements?.root;
    return !!(root && active && (root === active || root.contains(active)));
  });
  return pane?.key || '';
}

let paneFocusMruKeys = [];
let paneMruTraversal = null;
let paneMruSuppressFocusEvents = false;
let paneActiveRestoreGuardUntil = 0;
const PANE_SWITCH_SEND_GUARD_MS = 800;
const PANE_SWITCH_SEND_GUARD_MESSAGE = 'Pane changed: press Enter again to send';

function paneMruOrder() {
  const panes = paneManager?.panes || [];
  const liveKeys = new Set(panes.map((pane) => String(pane?.key || '')).filter(Boolean));
  paneFocusMruKeys = paneFocusMruKeys.filter((key) => liveKeys.has(key));
  panes.forEach((pane) => {
    const key = String(pane?.key || '');
    if (key && !paneFocusMruKeys.includes(key)) paneFocusMruKeys.push(key);
  });
  return paneFocusMruKeys.slice();
}

function notePaneFocused(pane) {
  if (paneMruSuppressFocusEvents) return;
  const key = String(pane?.key || '');
  if (!key) return;
  const panes = paneManager?.panes || [];
  if (!panes.some((entry) => String(entry?.key || '') === key)) return;
  const rememberedKey = rememberedActivePaneKey();
  if (rememberedKey && key !== rememberedKey && Date.now() < paneActiveRestoreGuardUntil) return;
  paneMruTraversal = null;
  paneMruOrder();
  paneFocusMruKeys = [key, ...paneFocusMruKeys.filter((entry) => entry !== key)];
  rememberActivePaneKey(key);
  renderActivePaneState(pane);
  updateBrowserTitle(pane);
}

function paneMarkSwitchSendGuard(pane, fromPaneKey) {
  const fromKey = String(fromPaneKey || '');
  if (!pane || pane.kind !== 'chat' || !fromKey || fromKey === pane.key) return;
  pane.sendGuard = {
    paneSwitchAt: Date.now(),
    consumed: false,
    fromPaneKey: fromKey
  };
}

function paneConsumeSwitchSendGuard(pane) {
  const guard = pane?.sendGuard;
  if (!guard || guard.consumed) return false;
  const elapsed = Date.now() - Number(guard.paneSwitchAt || 0);
  if (elapsed < 0 || elapsed > PANE_SWITCH_SEND_GUARD_MS) return false;
  guard.consumed = true;
  showToast(PANE_SWITCH_SEND_GUARD_MESSAGE, {
    kind: 'info',
    timeoutMs: 1800,
    testId: 'pane-switch-send-guard-toast'
  });
  return true;
}

function forgetFocusedPaneKey(paneKey) {
  const key = String(paneKey || '');
  if (!key) return;
  paneFocusMruKeys = paneFocusMruKeys.filter((entry) => entry !== key);
  if (rememberedActivePaneKey() === key) storage.remove(ADMIN_ACTIVE_PANE_KEY);
  if (paneMruTraversal?.order) {
    paneMruTraversal.order = paneMruTraversal.order.filter((entry) => entry !== key);
    if (paneMruTraversal.order.length < 2) paneMruTraversal = null;
  }
}

function activePaneFromState() {
  const panes = paneManager?.panes || [];
  if (!panes.length) return null;
  const candidates = [
    paneFocusMruKeys[0],
    focusedPaneKey(),
    rememberedActivePaneKey()
  ].filter(Boolean);
  for (const key of candidates) {
    const pane = panes.find((entry) => String(entry?.key || '') === String(key));
    if (pane) return pane;
  }
  return panes[0] || null;
}

function renderActivePaneState(activePane = activePaneFromState()) {
  const panes = paneManager?.panes || [];
  const activeKey = String(activePane?.key || '');
  panes.forEach((pane) => {
    const isActive = !!activeKey && String(pane?.key || '') === activeKey;
    const root = pane?.elements?.root;
    if (!root) return;
    root.classList.toggle('is-active-pane', isActive);
    root.dataset.activePane = isActive ? 'true' : 'false';
    root.setAttribute('aria-current', isActive ? 'true' : 'false');
  });

  const chip = globalElements.activePaneChip;
  const value = globalElements.activePaneChipValue;
  if (!chip || !value) return;

  if (!activePane) {
    chip.hidden = true;
    value.textContent = '';
    chip.title = 'No active pane';
    chip.setAttribute('aria-label', 'No active pane');
    return;
  }

  const label = paneSummaryLabel(activePane);
  chip.hidden = !uiState.authed;
  value.textContent = label;
  chip.title = `Focus ${label}`;
  chip.setAttribute('aria-label', `Active pane: ${label}. Click to focus.`);
}

function paneIndexByKey(key) {
  return (paneManager?.panes || []).findIndex((pane) => String(pane?.key || '') === String(key || ''));
}

function currentFocusedPaneIndex() {
  const active = document.activeElement;
  const panes = paneManager?.panes || [];
  return panes.findIndex((pane) => {
    const root = pane?.elements?.root;
    return !!(root && active && (root === active || root.contains(active)));
  });
}

function switchPaneByMru(direction = 1) {
  const panes = paneManager?.panes || [];
  if (panes.length < 2) return false;

  const now = Date.now();
  const currentIdx = currentFocusedPaneIndex();
  const currentKey = currentIdx >= 0 ? panes[currentIdx]?.key : '';
  const baseOrder = paneMruOrder();
  const orderedKeys = currentKey
    ? [currentKey, ...baseOrder.filter((key) => key !== currentKey)]
    : baseOrder;

  if (orderedKeys.length < 2) return false;

  const canContinue =
    paneMruTraversal &&
    now - Number(paneMruTraversal.updatedAt || 0) < 1500 &&
    Array.isArray(paneMruTraversal.order) &&
    paneMruTraversal.order.length === orderedKeys.length &&
    paneMruTraversal.order.every((key) => orderedKeys.includes(key));

  const traversal = canContinue
    ? paneMruTraversal
    : { order: orderedKeys, index: 0, updatedAt: now };

  const step = direction >= 0 ? 1 : -1;
  const nextIndex = (Number(traversal.index || 0) + step + traversal.order.length) % traversal.order.length;
  const nextKey = traversal.order[nextIndex];
  const paneIdx = paneIndexByKey(nextKey);
  if (paneIdx < 0) return false;

  traversal.index = nextIndex;
  traversal.updatedAt = now;
  paneMruTraversal = traversal;

  focusPaneIndex(paneIdx, { trackMru: false, showHud: true });
  const pane = panes[paneIdx];
  if (pane) showToast(`Switched to ${paneIdentityLabel(pane)}`, { kind: 'info', timeoutMs: 1400 });
  return true;
}

function paneUnreadCount(pane) {
  return Math.max(0, Number(pane?.unreadCount || 0));
}

function clearPaneUnread(pane) {
  if (!pane) return;
  if (!pane.unreadCount) return;
  pane.unreadCount = 0;
  pane.unreadKind = '';
  renderPaneIdentity(pane);
  renderPaneActivityBadge(pane);
  updateGlobalStatus();
  if (isPaneManagerOpen()) renderPaneManager();
}

function unreadKindLabel(kind) {
  const k = String(kind || '').trim().toLowerCase();
  if (k === 'workqueue') return 'workqueue update';
  if (k === 'activity') return 'activity update';
  return 'chat message';
}

function renderPaneActivityBadge(pane) {
  const badge = pane?.elements?.activityBadge;
  if (!badge) return;

  const count = paneUnreadCount(pane);
  if (count <= 0) {
    badge.hidden = true;
    badge.textContent = '•';
    badge.setAttribute('aria-label', 'No unread activity');
    badge.title = 'No unread activity';
    return;
  }

  const kindLabel = unreadKindLabel(pane?.unreadKind);
  const countLabel = `${count} unread ${kindLabel}${count === 1 ? '' : 's'}`;
  badge.hidden = false;
  badge.textContent = count > 99 ? '99+' : String(count);
  badge.setAttribute('aria-label', countLabel);
  badge.title = countLabel;
}

function renderPaneDraftBadge(pane) {
  const badge = pane?.elements?.draftBadge;
  if (!badge) return;

  const hasDraft = paneHasDraftChanges(pane);
  if (!hasDraft) {
    badge.hidden = true;
    badge.textContent = 'Draft';
    badge.setAttribute('aria-label', 'No unsent draft');
    badge.title = 'No unsent draft';
    return;
  }

  const label = `Unsent draft in this ${paneLabel(pane).toLowerCase()} pane`;
  badge.hidden = false;
  badge.textContent = 'Draft';
  badge.setAttribute('aria-label', label);
  badge.title = label;
}

function refreshPaneDraftState(pane) {
  renderPaneIdentity(pane);
  renderPaneDraftBadge(pane);
  if (isPaneManagerOpen()) renderPaneManager();
}

function markPaneUnread(pane, increment = 1, kind = 'chat') {
  if (!pane) return;
  const activeKey = focusedPaneKey();
  if (activeKey && activeKey === pane.key) return;
  const next = paneUnreadCount(pane) + Math.max(1, Number(increment || 1));
  pane.unreadCount = next;
  pane.unreadKind = String(kind || 'activity');
  renderPaneIdentity(pane);
  renderPaneActivityBadge(pane);
  updateGlobalStatus();
  if (isPaneManagerOpen()) renderPaneManager();
}

function setPaneNickname(pane, value) {
  if (!pane) return;
  const next = normalizePaneNickname(value);
  if (pane.nickname === next) return;
  pane.nickname = next;
  renderPaneIdentity(pane);
  paneManager?.persistAdminPanes?.();
  if (isPaneManagerOpen()) renderPaneManager();
  if (isCommandPaletteOpen()) {
    commandPaletteState.items = buildCommandPaletteItems();
    filterCommandPalette(commandPaletteState.query);
  }
}

function promptPaneNickname(pane) {
  if (!pane) return;
  const current = paneNickname(pane);
  const next = window.prompt('Pane nickname', current);
  if (next === null) return;
  setPaneNickname(pane, next);
}

function paneSearchText(pane) {
  return paneSearchFields(pane)
    .map((field) => field.value)
    .join(' ')
    .toLowerCase();
}

function paneMatchesSearchQuery(pane, query) {
  const needle = String(query || '').trim().toLowerCase();
  if (!needle) return true;
  if (needle.length === 1) return String(paneHeaderLetter(pane) || '').toLowerCase() === needle;
  return paneSearchText(pane).includes(needle);
}

function paneSearchFields(pane) {
  const queue = pane?.kind === 'workqueue' ? String(pane?.workqueue?.queue || '') : '';
  return [
    { key: 'letter', value: paneHeaderLetter(pane) },
    { key: 'label', value: paneSummaryLabel(pane) },
    { key: 'kindLabel', value: paneLabel(pane) },
    { key: 'kind', value: pane?.kind || '' },
    { key: 'target', value: paneTargetLabel(pane) },
    { key: 'targetDisplay', value: paneDisplayTargetLabel(pane) },
    { key: 'nickname', value: paneNickname(pane) },
    { key: 'queue', value: queue },
    { key: 'paneId', value: pane?.key || '' }
  ].map((field) => ({ ...field, value: String(field.value || '') })).filter((field) => field.value);
}

function paneManagerHighlightHtml(value, query) {
  const text = String(value || '');
  const needle = String(query || '').trim();
  if (!text || !needle) return escapeHtml(text);
  const lowerText = text.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const index = lowerText.indexOf(lowerNeedle);
  if (index < 0) return escapeHtml(text);
  return [
    escapeHtml(text.slice(0, index)),
    `<mark class="pane-manager-match">${escapeHtml(text.slice(index, index + needle.length))}</mark>`,
    escapeHtml(text.slice(index + needle.length))
  ].join('');
}

function panePairContextKey(pane) {
  if (!pane) return '';
  const kind = String(pane.kind || 'chat');
  if (kind !== 'chat' && kind !== 'workqueue') return '';
  return normalizeAgentId(pane.agentId || 'main');
}

function paneCounterpartKind(kind) {
  if (kind === 'chat') return 'workqueue';
  if (kind === 'workqueue') return 'chat';
  return '';
}

function findPairedPane(sourcePane, panes = [], { contextKey } = {}) {
  if (!sourcePane) return null;
  const counterpartKind = paneCounterpartKind(String(sourcePane.kind || ''));
  if (!counterpartKind) return null;
  const pairContextKey = contextKey || panePairContextKey(sourcePane);
  return panes.find((entry) =>
    entry &&
    entry !== sourcePane &&
    String(entry.kind || '') === counterpartKind &&
    panePairContextKey(entry) === pairContextKey
  ) || null;
}

const PANE_PAIR_CUE_PALETTE = ['cyan', 'mint', 'amber', 'rose', 'violet', 'blue'];

function panePairStableKey(pane) {
  const target = panePairContextKey(pane);
  return target ? `target:${target}` : '';
}

function panePairCueColor(pairKey) {
  const text = String(pairKey || '');
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return PANE_PAIR_CUE_PALETTE[hash % PANE_PAIR_CUE_PALETTE.length] || PANE_PAIR_CUE_PALETTE[0];
}

function panePairCueState(pane) {
  const pairKey = panePairStableKey(pane);
  if (!pairKey) return null;
  const sibling = findPairedPane(pane, paneManager?.panes || []);
  if (!sibling) return null;
  return {
    pairKey,
    sibling,
    color: panePairCueColor(pairKey),
    siblingLetter: paneHeaderLetter(sibling),
    target: panePairContextKey(pane)
  };
}

function renderPanePairCue(pane) {
  const cue = pane?.elements?.pairCue;
  if (!cue) return;
  const state = panePairCueState(pane);
  if (!state) {
    cue.hidden = true;
    cue.textContent = '';
    delete cue.dataset.pairKey;
    delete cue.dataset.pairColor;
    pane?.elements?.root?.style?.removeProperty('--pane-pair-rgb');
    return;
  }
  cue.hidden = false;
  cue.textContent = `Pair ${state.siblingLetter}`;
  cue.dataset.pairKey = state.pairKey;
  cue.dataset.pairColor = state.color;
  cue.title = `Paired with pane ${state.siblingLetter} for ${state.target}`;
  cue.setAttribute('aria-label', cue.title);
  const pairRgb = {
    cyan: '125, 211, 252',
    mint: '127, 209, 185',
    amber: '245, 158, 11',
    rose: '251, 113, 133',
    violet: '167, 139, 250',
    blue: '96, 165, 250'
  }[state.color] || '125, 211, 252';
  pane?.elements?.root?.style?.setProperty('--pane-pair-rgb', pairRgb);
}

function panePairCueMarkup(pane, { testId = '' } = {}) {
  const state = panePairCueState(pane);
  if (!state) return '';
  const testAttr = testId ? ` data-testid="${escapeHtml(testId)}"` : '';
  return `<span class="pane-pair-cue pane-pair-cue--inline" data-pair-key="${escapeHtml(state.pairKey)}" data-pair-color="${escapeHtml(state.color)}"${testAttr} title="${escapeHtml(`Paired with pane ${state.siblingLetter} for ${state.target}`)}">Pair ${escapeHtml(state.siblingLetter)}</span>`;
}

function setPanePairReveal(pane, active) {
  const state = panePairCueState(pane);
  if (!state) return;
  [pane, state.sibling].forEach((entry) => {
    const root = entry?.elements?.root;
    if (!root) return;
    root.classList.toggle('is-pair-revealed', !!active);
    root.dataset.pairReveal = active ? 'true' : 'false';
  });
}

function paneSupportsTargetLock(pane) {
  if (!pane || pane.role !== 'admin') return false;
  return pane.kind === 'chat' || pane.kind === 'workqueue';
}

function renderPaneTargetLockChip(pane) {
  const chip = pane?.elements?.agentPill;
  if (!chip) return;
  if (!paneSupportsTargetLock(pane)) {
    chip.hidden = true;
    return;
  }
  const locked = !!pane.pairedTargetLock;
  chip.hidden = false;
  chip.textContent = locked ? '🔒 Linked' : 'Unlocked';
  chip.setAttribute('aria-pressed', locked ? 'true' : 'false');
  chip.setAttribute('aria-label', locked ? 'Target lock enabled; click to unlock' : 'Target lock disabled; click to link paired panes');
  chip.title = locked
    ? 'Linked: changing this pane target also retargets its paired pane'
    : 'Unlocked: this pane target changes independently';
}

function paneToggleTargetLock(pane) {
  if (!paneSupportsTargetLock(pane)) return;
  pane.pairedTargetLock = !pane.pairedTargetLock;
  renderPaneTargetLockChip(pane);
  paneManager.persistAdminPanes();
  toast(pane.pairedTargetLock ? 'Target lock enabled.' : 'Target lock disabled.', 'info');
}

function syncPairedPaneTarget(sourcePane, nextAgentId, { previousAgentId } = {}) {
  if (!paneSupportsTargetLock(sourcePane) || !sourcePane.pairedTargetLock) return;
  const previousContextKey = previousAgentId ? normalizeAgentId(previousAgentId) : '';
  const paired = findPairedPane(sourcePane, paneManager?.panes || [], {
    contextKey: previousContextKey || panePairContextKey(sourcePane)
  });
  if (!paired || !paneSupportsTargetLock(paired)) {
    toast('No compatible paired pane to sync.', 'info');
    return;
  }
  paneSetAgent(paired, nextAgentId, {
    requireDraftConfirm: false,
    syncFromPaneKey: sourcePane.key
  });
}

function paneGroupOrder(kind) {
  const order = { chat: 0, workqueue: 1, cron: 2, timeline: 3 };
  return Number.isInteger(order[kind]) ? order[kind] : 99;
}

function isAnchorPaneKind(kind) {
  return kind === 'chat' || kind === 'workqueue';
}

function anchorPaneOptions(pane) {
  const kind = String(pane?.kind || 'chat');
  if (kind === 'workqueue') {
    return {
      forceNew: true,
      agentId: normalizeAgentId(pane?.agentId || storage.get(ADMIN_DEFAULT_AGENT_KEY, 'main') || 'main'),
      queue: pane?.workqueue?.queue || 'dev-team',
      statusFilter: Array.isArray(pane?.workqueue?.statusFilter) ? pane.workqueue.statusFilter.slice() : undefined,
      scopeFilter: pane?.workqueue?.scopeFilter || getDefaultWorkqueueScope()
    };
  }
  return {
    forceNew: true,
    agentId: normalizeAgentId(pane?.agentId || storage.get(ADMIN_DEFAULT_AGENT_KEY, 'main') || 'main')
  };
}

function movePaneWithinVisible(paneKey, direction, visibleKeys) {
  const keys = Array.isArray(visibleKeys) ? visibleKeys : [];
  const visibleIdx = keys.indexOf(paneKey);
  const targetVisibleIdx = visibleIdx + direction;
  if (visibleIdx < 0 || targetVisibleIdx < 0 || targetVisibleIdx >= keys.length) return false;
  const neighborKey = keys[targetVisibleIdx];
  if (!neighborKey || neighborKey === paneKey) return false;

  const panes = paneManager?.panes || [];
  let fromIdx = panes.findIndex((pane) => pane.key === paneKey);
  const toIdx = panes.findIndex((pane) => pane.key === neighborKey);
  if (fromIdx < 0 || toIdx < 0) return false;

  let moved = false;
  const delta = direction > 0 ? 1 : -1;
  while (fromIdx !== toIdx) {
    if (!paneManager.movePane(paneKey, delta)) break;
    moved = true;
    fromIdx += delta;
  }
  return moved;
}

function getPairedPaneKind(pane) {
  if (pane?.kind === 'chat') return 'workqueue';
  if (pane?.kind === 'workqueue') return 'chat';
  return '';
}

function getPanePairTarget(pane) {
  if (!pane || (pane.kind !== 'chat' && pane.kind !== 'workqueue')) return '';
  return normalizeAgentId(pane.agentId || 'main');
}

function findPairedPaneForPane(pane) {
  const pairedKind = getPairedPaneKind(pane);
  const target = getPanePairTarget(pane);
  if (!pairedKind || !target) return null;
  return (
    (paneManager?.panes || []).find(
      (candidate) =>
        candidate &&
        candidate !== pane &&
        candidate.kind === pairedKind &&
        getPanePairTarget(candidate) === target
    ) || null
  );
}

function getPanePairOpenOptions(pane) {
  const pairedKind = getPairedPaneKind(pane);
  const target = getPanePairTarget(pane);
  if (!pairedKind || !target) return null;
  if (pairedKind === 'workqueue') {
    const preferredQueue =
      String((paneManager?.panes || []).find((entry) => entry?.kind === 'workqueue')?.workqueue?.queue || '').trim() ||
      'dev-team';
    return {
      agentId: target,
      queue: preferredQueue,
      scopeFilter: 'assigned'
    };
  }
  return { agentId: target };
}

function getPaneManagerPairedAction(pane) {
  const pairedKind = getPairedPaneKind(pane);
  const target = getPanePairTarget(pane);
  if (!pairedKind || !target) return null;

  const existing = findPairedPaneForPane(pane);
  const labelKind = pairedKind === 'workqueue' ? 'Workqueue' : 'Chat';
  const disabled = !existing && (paneManager?.panes || []).length >= (paneManager?.maxPanes || 0);

  return {
    pairedKind,
    labelKind,
    target,
    state: existing ? 'focus' : 'open',
    text: existing ? `Paired ${labelKind}` : `Open paired ${labelKind}`,
    title: existing
      ? `Focus paired ${labelKind} for ${target}`
      : disabled
        ? `Pane limit reached; close a pane to open paired ${labelKind} for ${target}`
        : `Open paired ${labelKind} for ${target}`,
    disabled
  };
}

function focusOrOpenPairedPaneForPane(pane) {
  const existing = findPairedPaneForPane(pane);
  if (existing) {
    paneManager.focusPanePrimary(existing);
    return existing;
  }

  const pairedKind = getPairedPaneKind(pane);
  const options = getPanePairOpenOptions(pane);
  if (!pairedKind || !options) return null;
  return paneManager.addPane(pairedKind, options);
}

function renderPaneManager() {
  const panes = paneManager?.panes || [];
  const list = globalElements.paneManagerList;
  const empty = globalElements.paneManagerEmpty;
  if (!list || !empty) return;

  const query = String(paneManagerUiState.query || '').trim().toLowerCase();
  const filtered = panes.filter((pane) => {
    if (paneManagerUiState.attentionOnly && !paneNeedsAttention(pane)) return false;
    if (paneManagerUiState.unreadOnly && paneUnreadCount(pane) <= 0) return false;
    return paneMatchesSearchQuery(pane, query);
  });

  const grouped = new Map();
  filtered.forEach((pane) => {
    const kind = String(pane?.kind || 'chat');
    if (!grouped.has(kind)) grouped.set(kind, []);
    grouped.get(kind).push(pane);
  });

  const visibleKeys = [];
  grouped.forEach((items, kind) => {
    if (paneManagerUiState.collapsedKinds[kind]) return;
    items.forEach((pane) => visibleKeys.push(String(pane.key || '')));
  });
  paneManagerUiState.visiblePaneKeys = visibleKeys;

  const duplicateCounts = new Map();
  filtered.forEach((pane) => {
    const key = paneDuplicateKey(pane);
    duplicateCounts.set(key, (duplicateCounts.get(key) || 0) + 1);
  });

  list.innerHTML = '';
  empty.hidden = filtered.length > 0;
  empty.textContent = query ? `No panes match "${String(paneManagerUiState.query || '').trim()}"` : 'No panes match this filter.';
  if (!filtered.length) return;

  const maxIndex = Math.max(0, visibleKeys.length - 1);
  paneManagerUiState.selectedIndex = Math.max(0, Math.min(paneManagerUiState.selectedIndex, maxIndex));

  const sortedKinds = Array.from(grouped.keys()).sort((a, b) => paneGroupOrder(a) - paneGroupOrder(b) || a.localeCompare(b));
  let visibleIdx = 0;

  sortedKinds.forEach((kind) => {
    const items = grouped.get(kind) || [];
    if (!items.length) return;

    const section = document.createElement('section');
    section.className = 'pane-manager-group';

    const collapsed = !!paneManagerUiState.collapsedKinds[kind];
    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'pane-manager-group-header';
    header.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    header.innerHTML = `<span class="pane-manager-group-title">${escapeHtml(paneLabel({ kind }))} <span class="pane-manager-group-count">(${items.length})</span></span><span class="pane-manager-group-caret" aria-hidden="true">${collapsed ? '▸' : '▾'}</span>`;
    header.addEventListener('click', () => {
      paneManagerUiState.collapsedKinds[kind] = !paneManagerUiState.collapsedKinds[kind];
      renderPaneManager();
    });
    section.appendChild(header);

    if (!collapsed) {
      items.forEach((pane) => {
        const idx = panes.findIndex((p) => p.key === pane.key);
        const row = document.createElement('div');
        row.className = 'pane-manager-row';
        row.classList.add(`pane-kind-${pane.kind || 'chat'}`);
        row.setAttribute('role', 'option');
        row.dataset.index = String(idx);
        row.dataset.paneKey = String(pane.key || '');
        row.dataset.paneKind = String(pane.kind || 'chat');
        row.dataset.visibleIndex = String(visibleIdx);
        row.setAttribute('aria-selected', visibleIdx === paneManagerUiState.selectedIndex ? 'true' : 'false');

        const state = String(pane.statusState || (pane.connected ? 'connected' : 'disconnected'));
        const duplicateCount = duplicateCounts.get(paneDuplicateKey(pane)) || 0;
        const isDuplicate = duplicateCount > 1;
        const unreadCount = paneUnreadCount(pane);
        const hasDraft = paneHasDraftChanges(pane);
        const paneIdentity = paneSummaryLabel(pane);
        const nickname = paneNickname(pane);
        const pairedAction = getPaneManagerPairedAction(pane);
        const rowLabel = `${paneIdentity}${nickname ? `, nickname ${nickname}` : ''}${unreadCount > 0 ? `, ${unreadCount} unread` : ''}${hasDraft ? ', unsent draft' : ''}`;
        row.setAttribute('aria-label', rowLabel);

        const lockDisabled = paneManager.isLayoutLocked();

        row.innerHTML = `
          <div class="pane-manager-main">
            <div class="pane-manager-kind" title="${escapeHtml(paneIdentity)}">
              ${paneTypeBadgeMarkup(pane, { extraClass: 'pane-manager-type-badge', testId: 'pane-manager-type-badge' })}
              ${panePairCueMarkup(pane, { testId: 'pane-manager-pair-cue' })}
              <span class="pane-manager-kind-label">${paneManagerHighlightHtml(paneIdentity, query)}</span>
              ${nickname ? `<span class="pane-manager-nickname" data-testid="pane-manager-nickname" title="${escapeHtml(`Pane nickname: ${nickname}`)}">${paneManagerHighlightHtml(nickname, query)}</span>` : ''}
              <span class="pane-manager-pane-id" title="Internal pane id">${paneManagerHighlightHtml(String(pane?.key || ''), query)}</span>
              ${isDuplicate ? `<span class="pane-manager-duplicate-badge" data-testid="pane-manager-duplicate-badge" title="${escapeHtml(`${duplicateCount} duplicate panes`)}">duplicate</span>` : ''}
              ${unreadCount > 0 ? `<span class="pane-manager-unread-badge" data-testid="pane-manager-unread-badge" title="${escapeHtml(`${unreadCount} unread`)}">${escapeHtml(String(unreadCount))}</span>` : ''}
              ${hasDraft ? '<span class="pane-manager-draft-badge" data-testid="pane-manager-draft-badge" title="Unsent draft">Draft</span>' : ''}
            </div>
            <div class="pane-manager-state" data-state="${escapeHtml(state)}">${escapeHtml(state)}</div>
          </div>
          <div class="pane-manager-actions">
            <button class="secondary pane-manager-up" type="button" data-action="move-up" data-testid="pane-manager-move-up" title="${lockDisabled ? 'Layout is locked' : 'Move pane up'}" aria-label="Move pane up" ${(visibleIdx === 0 || lockDisabled) ? 'disabled' : ''}>↑</button>
            <button class="secondary pane-manager-down" type="button" data-action="move-down" data-testid="pane-manager-move-down" title="${lockDisabled ? 'Layout is locked' : 'Move pane down'}" aria-label="Move pane down" ${(visibleIdx === visibleKeys.length - 1 || lockDisabled) ? 'disabled' : ''}>↓</button>
            ${isDuplicate ? '<button class="secondary pane-manager-close-others" type="button" data-action="close-others" data-testid="pane-manager-close-others">Close others</button>' : ''}
            ${pairedAction ? `<button class="secondary pane-manager-paired" type="button" data-action="paired" data-testid="pane-manager-paired-action" data-paired-kind="${escapeHtml(pairedAction.pairedKind)}" data-paired-state="${escapeHtml(pairedAction.state)}" data-paired-target="${escapeHtml(pairedAction.target)}" title="${escapeHtml(pairedAction.title)}" aria-label="${escapeHtml(pairedAction.title)}" ${pairedAction.disabled ? 'disabled' : ''}>${escapeHtml(pairedAction.text)}</button>` : ''}
            <button class="secondary pane-manager-nickname-action" type="button" data-action="nickname" data-testid="pane-manager-nickname-action">Nickname</button>
            <button class="secondary pane-manager-focus" type="button" data-action="focus">Focus</button>
            <button class="secondary pane-manager-close" type="button" data-action="close">Close</button>
          </div>
        `;

        row.querySelector('[data-action="close"]')?.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          paneManagerUiState.selectedIndex = Number(row.dataset.visibleIndex || 0);
          try {
            paneManager.removePane(pane.key, { source: 'manager' });
          } catch {}
          renderPaneManager();
        });

        row.addEventListener('mouseenter', () => {
          const nextIndex = Number(row.dataset.visibleIndex || 0);
          if (paneManagerUiState.selectedIndex === nextIndex) return;
          paneManagerUiState.selectedIndex = nextIndex;
          renderPaneManager();
        });

        row.addEventListener('click', (event) => {
          const actionEl = event?.target instanceof Element ? event.target.closest('[data-action]') : null;
          const action = actionEl?.dataset?.action;
          const selectedVisible = Number(row.dataset.visibleIndex || 0);
          paneManagerUiState.selectedIndex = selectedVisible;
          if (action === 'close') {
            try {
              paneManager.removePane(pane.key, { source: 'manager' });
            } catch {}
            renderPaneManager();
            return;
          }
          if (action === 'move-up') {
            if (paneManager.isLayoutLocked()) return;
            const moved = movePaneWithinVisible(pane.key, -1, paneManagerUiState.visiblePaneKeys);
            if (moved) {
              paneManagerUiState.selectedIndex = Math.max(0, selectedVisible - 1);
              renderPaneManager();
            }
            return;
          }
          if (action === 'move-down') {
            if (paneManager.isLayoutLocked()) return;
            const moved = movePaneWithinVisible(pane.key, 1, paneManagerUiState.visiblePaneKeys);
            if (moved) {
              paneManagerUiState.selectedIndex = Math.min(paneManagerUiState.visiblePaneKeys.length - 1, selectedVisible + 1);
              renderPaneManager();
            }
            return;
          }
          if (action === 'close-others') {
            const keepKey = pane.key || focusedPaneKey();
            const dupKey = paneDuplicateKey(pane);
            const duplicates = (paneManager?.panes || []).filter((entry) => paneDuplicateKey(entry) === dupKey && entry.key !== keepKey);
            duplicates.forEach((entry) => {
              try {
                paneManager.removePane(entry.key, { source: 'manager' });
              } catch {}
            });
            renderPaneManager();
            return;
          }
          if (action === 'nickname') {
            promptPaneNickname(pane);
            return;
          }
          if (action === 'paired') {
            const pairedPane = focusOrOpenPairedPaneForPane(pane);
            if (pairedPane) {
              closePaneManager({ restoreFocus: false });
              paneManager.focusPanePrimary(pairedPane);
            } else {
              renderPaneManager();
            }
            return;
          }
          closePaneManager();
          focusPaneIndex(idx);
        });

        section.appendChild(row);
        visibleIdx += 1;
      });
    }

    list.appendChild(section);
  });
}

function openPaneManager({ attentionOnly = false } = {}) {
  if (roleState.role !== 'admin') return;
  if (!uiState.authed) {
    showLogin('Please sign in to continue.');
    return;
  }
  if (!globalElements.paneManagerModal) return;

  paneManagerUiState.open = true;
  paneManagerUiState.selectedIndex = 0;
  paneManagerUiState.attentionOnly = !!attentionOnly;
  paneManagerUiState.query = String(globalElements.paneManagerSearch?.value || '').trim();
  paneManagerUiState.unreadOnly = !!globalElements.paneManagerUnreadOnly?.checked;

  openAdminModal(globalElements.paneManagerModal);
  renderPaneManager();

  // Focus quick-find for immediate filtering.
  try {
    globalElements.paneManagerSearch?.focus?.();
    globalElements.paneManagerSearch?.select?.();
  } catch {}
}

function closePaneManager({ restoreFocus = true } = {}) {
  if (!globalElements.paneManagerModal) return;
  paneManagerUiState.open = false;
  const pane = paneManager?.panes?.[0];
  closeAdminModal(globalElements.paneManagerModal, { restoreFocus, fallbackFocus: pane?.elements?.input || null });
}

function paneManagerHandleKeydown(event) {
  if (!isPaneManagerOpen()) return false;
  const panes = paneManager?.panes || [];
  const key = String(event.key || '');
  const activeEl = document.activeElement;
  const searchEl = globalElements.paneManagerSearch;
  const isSearchFocused = activeEl === searchEl;

  if ((key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isSearchFocused) ||
    ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && key.toLowerCase() === 'f')) {
    event.preventDefault();
    searchEl?.focus?.();
    searchEl?.select?.();
    return true;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    const query = String(paneManagerUiState.query || '').trim();
    if (query) {
      paneManagerUiState.query = '';
      if (searchEl) searchEl.value = '';
      renderPaneManager();
      searchEl?.focus?.();
      return true;
    }
    closePaneManager();
    return true;
  }

  if (activeEl === globalElements.paneManagerSearch && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    return false;
  }

  const visibleKeys = paneManagerUiState.visiblePaneKeys || [];
  if (visibleKeys.length === 0) return false;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    paneManagerUiState.selectedIndex = Math.min(visibleKeys.length - 1, paneManagerUiState.selectedIndex + 1);
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
    const idx = Math.max(0, Math.min(visibleKeys.length - 1, paneManagerUiState.selectedIndex));
    const key = visibleKeys[idx];
    const paneIdx = panes.findIndex((pane) => pane.key === key);
    if (paneIdx < 0) return true;
    closePaneManager();
    focusPaneIndex(paneIdx);
    return true;
  }
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    const idx = Math.max(0, Math.min(visibleKeys.length - 1, paneManagerUiState.selectedIndex));
    const key = visibleKeys[idx];
    if (key) {
      try {
        paneManager.removePane(key, { source: 'manager-keyboard' });
      } catch {}
      renderPaneManager();
    }
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
  selectedIndex: 0,
  expandedSubgroups: new Set(),
  originPaneKey: ''
};

const COMMAND_PALETTE_GROUP_ORDER = ['Panes', 'Navigation', 'Layout', 'Workqueue', 'Agents', 'Advanced'];

function commandPaletteGroupRank(group) {
  const idx = COMMAND_PALETTE_GROUP_ORDER.indexOf(String(group || ''));
  return idx >= 0 ? idx : COMMAND_PALETTE_GROUP_ORDER.length;
}

function commandPaletteSubgroupKey(group, subgroup) {
  return `${String(group || '')}::${String(subgroup || '')}`;
}

function isCommandPaletteOpen() {
  return !!globalElements.commandPaletteModal?.classList.contains('open');
}

function closeCommandPalette({ restoreFocus = true } = {}) {
  if (!globalElements.commandPaletteModal) return;
  commandPaletteState.open = false;
  commandPaletteState.originPaneKey = '';
  const pane = paneManager?.panes?.[0];
  closeAdminModal(globalElements.commandPaletteModal, { restoreFocus, fallbackFocus: pane?.elements?.input || null });
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

function commandPalettePaneMeta({ type, target, mode }) {
  return [
    { label: type || 'Pane', tone: 'type' },
    { label: target || 'default', tone: 'target' },
    { label: mode || 'open', tone: mode === 'focus existing' ? 'reuse' : 'create' }
  ];
}

function buildCommandPaletteItems() {
  const items = [];
  const withShortcut = (item, shortcut) => ({ ...item, shortcut: shortcut || '' });

  // Focus pane by letter for all open panes.
  paneManager.panes.forEach((pane, idx) => {
    const letter = paneHeaderLetter(pane);
    const type = paneLabel(pane);
    const target = paneDisplayTargetLabel(pane);
    const nickname = paneNickname(pane);
    items.push(
      withShortcut(
        {
          id: `cmd:focus-pane-${pane.key}`,
          label: `Focus ${type}: ${target}${nickname ? ` · ${nickname}` : ''}`,
          detail: `Pane ${letter} · focus existing`,
          paneMeta: [
            ...commandPalettePaneMeta({ type, target, mode: 'focus existing' }),
            ...(nickname ? [{ label: nickname, tone: 'nickname' }] : [])
          ],
          searchText: `open focus existing pane ${letter} ${type} ${target} ${nickname}`,
          run: () => paneManager.focusPanePrimary(pane)
        },
        `g ${String(letter || '').toLowerCase()}`
      )
    );
  });

  const focusedKey = focusedPaneKey();
  const focusedPane = paneManager.panes.find((p) => p?.key === focusedKey) || paneManager.panes[0] || null;
  if (paneSupportsTargetLock(focusedPane)) {
    const nextLabel = focusedPane.pairedTargetLock ? 'Disable' : 'Enable';
    items.push(withShortcut({
      id: 'cmd:toggle-target-lock',
      label: `Pane: ${nextLabel} target lock`,
      detail: `${paneLabel(focusedPane)} · ${paneTargetLabel(focusedPane)}`,
      run: () => paneToggleTargetLock(focusedPane)
    }, '⌘/Ctrl+Shift+L'));
  }

  // Core open actions for all enabled pane types.
  items.push(
    withShortcut(
      {
        id: 'cmd:add-chat',
        label: 'Open Chat: main',
        detail: 'Create or focus the default Chat pane',
        paneMeta: commandPalettePaneMeta({ type: 'Chat', target: 'main', mode: 'create or focus' }),
        run: () => paneManager.addPane('chat')
      },
      '⌘/Ctrl+Shift+C'
    ),
    withShortcut(
      {
        id: 'cmd:reopen-closed-pane',
        label: 'Panes: Reopen last closed pane',
        detail: 'Restore the most recently closed pane and recoverable draft state',
        paneMeta: commandPalettePaneMeta({ type: 'Pane', target: 'last closed', mode: 'restore' }),
        run: () => paneManager.reopenLastClosedPane()
      },
      '⌘/Ctrl+Shift+T'
    ),
    withShortcut(
      {
        id: 'cmd:add-workqueue',
        label: 'Open Workqueue: dev-team',
        detail: 'Focus matching queue target or create one',
        paneMeta: commandPalettePaneMeta({ type: 'Workqueue', target: 'dev-team', mode: 'create or focus' }),
        run: () => paneManager.addPane('workqueue')
      },
      '⌘/Ctrl+Shift+W'
    ),
    withShortcut(
      {
        id: 'cmd:add-workqueue-force',
        label: 'New Workqueue: dev-team',
        detail: 'Create a new Workqueue pane even if matching target exists',
        paneMeta: commandPalettePaneMeta({ type: 'Workqueue', target: 'dev-team', mode: 'create new' }),
        run: () => paneManager.addPane('workqueue', { forceNew: true })
      },
      ''
    ),
    withShortcut(
      {
        id: 'cmd:add-cron',
        label: 'Open Cron: gateway',
        detail: 'Focus matching gateway pane or create one',
        paneMeta: commandPalettePaneMeta({ type: 'Cron', target: 'gateway', mode: 'create or focus' }),
        run: () => paneManager.addPane('cron')
      },
      '⌘/Ctrl+Shift+R'
    ),
    withShortcut(
      {
        id: 'cmd:add-cron-force',
        label: 'New Cron: gateway',
        detail: 'Create a new Cron pane even if matching target exists',
        paneMeta: commandPalettePaneMeta({ type: 'Cron', target: 'gateway', mode: 'create new' }),
        run: () => paneManager.addPane('cron', { forceNew: true })
      },
      ''
    ),
    withShortcut(
      {
        id: 'cmd:add-timeline',
        label: 'Open Timeline: gateway',
        detail: 'Focus matching gateway pane or create one',
        paneMeta: commandPalettePaneMeta({ type: 'Timeline', target: 'gateway', mode: 'create or focus' }),
        run: () => paneManager.addPane('timeline')
      },
      '⌘/Ctrl+Shift+Y'
    ),
    withShortcut(
      {
        id: 'cmd:add-timeline-force',
        label: 'New Timeline: gateway',
        detail: 'Create a new Timeline pane even if matching target exists',
        paneMeta: commandPalettePaneMeta({ type: 'Timeline', target: 'gateway', mode: 'create new' }),
        run: () => paneManager.addPane('timeline', { forceNew: true })
      },
      ''
    ),
    withShortcut(
      {
        id: 'cmd:open-fleet',
        label: 'Open Fleet: all nodes',
        detail: 'Focus existing Fleet pane or open one',
        paneMeta: commandPalettePaneMeta({ type: 'Fleet', target: 'all nodes', mode: 'create or focus' }),
        run: () => openFleetPane()
      },
      '⌘/Ctrl+Shift+F'
    ),
    withShortcut(
      {
        id: 'cmd:add-fleet',
        label: 'New Fleet: all nodes',
        detail: 'Create a new Fleet pane even if one exists',
        paneMeta: commandPalettePaneMeta({ type: 'Fleet', target: 'all nodes', mode: 'create new' }),
        run: () => openFleetPane({ forceNew: true })
      },
      ''
    )
  );

  // Open with target (single action).
  const queues = Array.from(new Set(['dev-team', ...paneManager.panes.filter((p) => p.kind === 'workqueue').map((p) => p.workqueue?.queue || '')]
    .map((q) => String(q || '').trim())
    .filter(Boolean)));
  queues.forEach((queue) => {
    items.push(withShortcut({
      id: `cmd:add-workqueue:${queue}`,
      label: `Open Workqueue: ${queue}`,
      detail: 'Focus matching queue target or create one',
      paneMeta: commandPalettePaneMeta({ type: 'Workqueue', target: queue, mode: 'create or focus' }),
      run: () => paneManager.addPane('workqueue', { queue })
    }, 'targeted open'));
  });

  const agents = uiState.agents.length > 0 ? uiState.agents : [{ id: 'main', name: 'main', displayName: 'main', emoji: '' }];
  items.push(withShortcut({
    id: 'cmd:add-timeline:all',
    label: 'Open Timeline: All agents',
    detail: 'Open Timeline with agent filter set to all',
    paneMeta: commandPalettePaneMeta({ type: 'Timeline', target: 'all agents', mode: 'create or focus' }),
    run: () => paneManager.addPane('timeline', { cronAgentId: 'all' })
  }, 'targeted open'));
  for (const agent of agents) {
    const agentId = normalizeAgentId(agent?.id || 'main');
    const agentLabel = formatAgentLabel(agent, { includeId: false });
    items.push(withShortcut({
      id: `cmd:add-timeline:${agentId}`,
      label: `Open Timeline: ${agentLabel}`,
      detail: `Open Timeline filtered to ${agentId}`,
      paneMeta: commandPalettePaneMeta({ type: 'Timeline', target: agentLabel, mode: 'create or focus' }),
      run: () => paneManager.addPane('timeline', { cronAgentId: agentId })
    }, 'targeted open'));
  }

  items.push(
    withShortcut(
      {
        id: 'cmd:reset-layout',
        label: 'Layout: Reset to recommended layout',
        detail: 'Restore Chat + Workqueue panes',
        run: () => paneManager.resetAdminLayoutToDefault({ confirm: true })
      },
      ''
    ),
    withShortcut(
      {
        id: 'cmd:triage-layout-preset',
        label: 'Layout: Triage focus',
        detail: 'Apply Chat + Workqueue + Fleet panes without duplicating existing panes',
        paneMeta: [
          { label: 'Chat', tone: 'type' },
          { label: 'Workqueue', tone: 'type' },
          { label: 'Fleet', tone: 'type' },
          { label: 'reuse existing', tone: 'reuse' }
        ],
        searchText: 'triage preset chat workqueue fleet layout',
        run: () => applyTriageLayoutPreset()
      },
      ''
    ),
    withShortcut(
      {
        id: 'cmd:toggle-layout-lock',
        label: 'Layout: Toggle lock',
        detail: paneManager.isLayoutLocked() ? 'Unlock pane reordering' : 'Lock pane reordering',
        run: () => paneManager.toggleLayoutLocked({ notify: true })
      },
      ''
    ),
    withShortcut(
      {
        id: 'cmd:toggle-shortcuts',
        label: 'Help: Toggle shortcuts overlay',
        detail: 'Show/hide keyboard shortcuts',
        run: () => {
          if (globalElements.shortcutsModal?.classList.contains('open')) closeShortcuts();
          else openShortcuts();
        }
      },
      '?'
    ),
    withShortcut(
      { id: 'cmd:open-workqueue', label: 'Workqueue: Open', detail: 'Open Workqueue for the active chat target', run: () => openTopbarWorkqueueAction() },
      'g w'
    ),
    withShortcut(
      {
        id: 'cmd:open-workqueue-active-agent',
        label: 'Workqueue for active chat agent',
        detail: 'Open/focus a Workqueue pane scoped to the active chat agent',
        run: () => openWorkqueueForActiveChatAgent()
      },
      '⌘/Ctrl+Shift+G'
    ),
    withShortcut(
      { id: 'cmd:refresh-agents', label: 'Agents: Refresh', detail: 'Refresh agent list', run: () => globalElements.refreshAgentsBtn?.click?.() },
      ''
    ),
    withShortcut(
      {
        id: 'cmd:agents-focus-filter',
        label: 'Agents: Open and focus filter',
        detail: 'Open Agents modal and place cursor in quick filter',
        run: () => openAgentsModal()
      },
      'g a'
    ),
    withShortcut(
      { id: 'cmd:pane-cycle', label: 'Panes: Cycle focus', detail: 'Move focus to next pane', run: () => cyclePaneFocus() },
      '⌘/Ctrl+Shift+K'
    ),
    withShortcut(
      { id: 'cmd:pane-cycle-backward', label: 'Panes: Cycle focus backward', detail: 'Move focus to previous pane', run: () => cyclePaneFocusBackward() },
      '⌘/Ctrl+Shift+J'
    ),
    withShortcut(
      { id: 'cmd:chat-cycle-next', label: 'Chat: Focus next Chat pane', detail: 'Move to the next Chat pane by focus history, skipping non-chat panes', run: () => cycleChatPaneFocus(1) },
      '⌘/Ctrl+Alt+K'
    ),
    withShortcut(
      { id: 'cmd:chat-cycle-previous', label: 'Chat: Focus previous Chat pane', detail: 'Move to the previous Chat pane by focus history, skipping non-chat panes', run: () => cycleChatPaneFocus(-1) },
      '⌘/Ctrl+Alt+J'
    ),
    withShortcut(
      { id: 'cmd:pane-return-last-chat', label: 'Panes: Return to last active Chat pane', detail: 'Jump back to the most recent chat pane in focus history', run: () => returnToLastActiveChatPane() },
      'g c'
    ),
    withShortcut(
      { id: 'cmd:return-triage-source', label: 'Panes: Return to previous triage context', detail: 'Restore the Agents modal row and action that opened Chat or Workqueue', run: () => returnToTriageSource() },
      'Cmd/Ctrl+Shift+B'
    ),
    withShortcut(
      { id: 'cmd:focus-chat-composer', label: 'Chat: Focus composer', detail: 'Jump to the active or most recent Chat composer', run: () => focusChatComposer() },
      '⌘/Ctrl+L'
    ),
    withShortcut(
      { id: 'cmd:pane-mru-next', label: 'Panes: Switch to previous MRU pane', detail: 'Move through panes by most-recent focus order', run: () => switchPaneByMru(1) },
      'Ctrl+Tab'
    ),
    withShortcut(
      { id: 'cmd:pane-mru-prev', label: 'Panes: Reverse MRU switch', detail: 'Reverse most-recent pane traversal', run: () => switchPaneByMru(-1) },
      'Ctrl+Shift+Tab'
    ),
    withShortcut(
      { id: 'cmd:pane-next-unread', label: 'Panes: Next unread', detail: 'Jump to next pane with unread activity', run: () => cycleUnreadPaneFocus(1) },
      '⌘/Ctrl+Shift+]'
    ),
    withShortcut(
      { id: 'cmd:pane-prev-unread', label: 'Panes: Previous unread', detail: 'Jump to previous pane with unread activity', run: () => cycleUnreadPaneFocus(-1) },
      '⌘/Ctrl+Shift+['
    )
  );

  // Agent quick actions (chat target switch)
  for (const agent of agents) {
    const agentId = normalizeAgentId(agent?.id || 'main');
    const label = `Agent: ${formatAgentLabel(agent, { includeId: false })}`;
    items.push(withShortcut({
      id: `agent:${agentId}`,
      label,
      detail: agentId,
      run: () => {
        let pane = paneManager.panes.find((p) => p.kind === 'chat');
        if (!pane) pane = paneManager.addPane('chat');
        if (pane) {
          paneSetAgent(pane, agentId);
          paneManager.focusPanePrimary(pane);
        }
      }
    }, 'chat target'));
  }

  return items.map((item) => {
    const id = String(item.id || '');
    const label = String(item.label || '');
    const enriched = { ...item, group: 'Advanced', subgroup: '', priority: 20, kind: 'action' };

    if (id.startsWith('cmd:focus-pane-') || id === 'cmd:pane-cycle' || id === 'cmd:pane-cycle-backward' || id === 'cmd:pane-return-last-chat' || id === 'cmd:return-triage-source' || id === 'cmd:pane-mru-next' || id === 'cmd:pane-mru-prev' || id === 'cmd:pane-next-unread' || id === 'cmd:pane-prev-unread') {
      enriched.group = 'Panes';
      enriched.priority = id.startsWith('cmd:focus-pane-') ? 130 : 110;
      return enriched;
    }
    if (id.startsWith('cmd:add-')) {
      enriched.group = 'Navigation';
      enriched.priority = id.includes(':') ? 55 : 95;
      if (id.startsWith('cmd:add-timeline:')) {
        enriched.group = 'Agents';
        enriched.subgroup = 'Timeline targets';
        enriched.priority = 45;
      }
      return enriched;
    }
    if (id === 'cmd:reset-layout' || id === 'cmd:triage-layout-preset') {
      enriched.group = 'Layout';
      enriched.priority = id === 'cmd:triage-layout-preset' ? 105 : 100;
      return enriched;
    }
    if (id === 'cmd:toggle-shortcuts') {
      enriched.group = 'Navigation';
      enriched.priority = 85;
      return enriched;
    }
    if (id === 'cmd:open-workqueue' || id === 'cmd:open-workqueue-active-agent') {
      enriched.group = 'Workqueue';
      enriched.priority = id === 'cmd:open-workqueue-active-agent' ? 96 : 92;
      return enriched;
    }
    if (id === 'cmd:refresh-agents') {
      enriched.group = 'Agents';
      enriched.priority = 90;
      return enriched;
    }
    if (id.startsWith('agent:') || label.startsWith('Agent: ')) {
      enriched.group = 'Agents';
      enriched.subgroup = 'Agent targets';
      enriched.priority = 40;
      return enriched;
    }
    return enriched;
  });
}

function getCommandPaletteSelectableIndexes(items) {
  const selectable = [];
  items.forEach((item, idx) => {
    if (item?.kind !== 'header') selectable.push(idx);
  });
  return selectable;
}

function normalizeCommandPaletteSelection(items, preferFirst = false) {
  const selectable = getCommandPaletteSelectableIndexes(items);
  if (!selectable.length) {
    commandPaletteState.selectedIndex = -1;
    return;
  }
  if (preferFirst || !selectable.includes(commandPaletteState.selectedIndex)) {
    commandPaletteState.selectedIndex = selectable[0];
    return;
  }
  commandPaletteState.selectedIndex = Math.max(0, Math.min(items.length - 1, commandPaletteState.selectedIndex));
}

function moveCommandPaletteSelection(step) {
  const items = commandPaletteState.filtered;
  const selectable = getCommandPaletteSelectableIndexes(items);
  if (!selectable.length) return;
  const currentPos = Math.max(0, selectable.indexOf(commandPaletteState.selectedIndex));
  const nextPos = Math.max(0, Math.min(selectable.length - 1, currentPos + step));
  commandPaletteState.selectedIndex = selectable[nextPos];
}

function composeCommandPaletteDisplayItems(scored, query) {
  const q = String(query || '').trim();
  const groups = new Map();
  for (const entry of scored) {
    const group = String(entry.item.group || 'Advanced');
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(entry);
  }

  const out = [];
  const sortedGroups = Array.from(groups.keys()).sort((a, b) => commandPaletteGroupRank(a) - commandPaletteGroupRank(b) || a.localeCompare(b));

  for (const group of sortedGroups) {
    out.push({ kind: 'header', id: `header:${group}`, label: group });
    const groupEntries = groups.get(group);
    const direct = [];
    const subgroupMap = new Map();
    for (const entry of groupEntries) {
      const subgroup = String(entry.item.subgroup || '');
      if (!subgroup) {
        direct.push(entry);
        continue;
      }
      if (!subgroupMap.has(subgroup)) subgroupMap.set(subgroup, []);
      subgroupMap.get(subgroup).push(entry);
    }

    direct
      .sort((a, b) => b.rank - a.rank || String(a.item.label || '').localeCompare(String(b.item.label || '')))
      .forEach((entry) => out.push(entry.item));

    for (const [subgroup, entries] of Array.from(subgroupMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
      const key = commandPaletteSubgroupKey(group, subgroup);
      const hasQuery = !!q;
      const expanded = hasQuery || commandPaletteState.expandedSubgroups.has(key);
      out.push({
        kind: 'toggle',
        id: `toggle:${key}`,
        group,
        subgroup,
        label: `${subgroup} (${entries.length})`,
        detail: expanded ? 'Hide targets' : 'Show targets',
        shortcut: expanded ? '↩ collapse' : '↩ expand',
        run: () => {
          if (commandPaletteState.expandedSubgroups.has(key)) commandPaletteState.expandedSubgroups.delete(key);
          else commandPaletteState.expandedSubgroups.add(key);
          filterCommandPalette(commandPaletteState.query);
        }
      });
      if (expanded) {
        entries
          .sort((a, b) => b.rank - a.rank || String(a.item.label || '').localeCompare(String(b.item.label || '')))
          .forEach((entry) => out.push(entry.item));
      }
    }
  }

  return out;
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

  normalizeCommandPaletteSelection(items);
  const selected = commandPaletteState.selectedIndex;

  items.forEach((item, idx) => {
    if (item.kind === 'header') {
      const header = document.createElement('div');
      header.className = 'command-palette-group';
      header.textContent = item.label;
      list.appendChild(header);
      return;
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `command-palette-item${item.kind === 'toggle' ? ' command-palette-toggle' : ''}`;
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', idx === selected ? 'true' : 'false');
    btn.dataset.commandPaletteId = item.id;
    const paneMeta = Array.isArray(item.paneMeta) ? item.paneMeta : [];
    const paneMetaMarkup = paneMeta.length
      ? `<div class="command-palette-pane-meta">${paneMeta
          .map((meta) => {
            const tone = String(meta?.tone || 'target');
            const label = String(meta?.label || '').trim();
            if (!label) return '';
            return `<span class="command-palette-pane-chip command-palette-pane-chip-${escapeHtml(tone)}">${escapeHtml(label)}</span>`;
          })
          .join('')}</div>`
      : '';
    btn.innerHTML = `
      <div class="command-palette-item-main">
        <div class="command-palette-item-label">${escapeHtml(item.label)}</div>
        ${paneMetaMarkup}
        <div class="command-palette-item-detail">${escapeHtml(item.detail || '')}</div>
      </div>
      <div class="command-palette-item-meta">${escapeHtml(item.shortcut || '')}${idx === selected ? (item.shortcut ? ' · ↵' : '↵') : ''}</div>
    `;

    btn.addEventListener('mouseenter', () => {
      commandPaletteState.selectedIndex = idx;
      renderCommandPalette();
    });

    btn.addEventListener('click', () => {
      if (!item.run) return;
      try {
        item.run();
      } finally {
        if (item.kind !== 'toggle') closeCommandPalette({ restoreFocus: false });
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
      const meta = Array.isArray(item.paneMeta) ? item.paneMeta.map((x) => x?.label || '').join(' ') : '';
      const hay = `${item.label || ''} ${item.detail || ''} ${item.searchText || ''} ${meta} ${item.id || ''} ${item.group || ''} ${item.subgroup || ''}`;
      const score = scoreFuzzy(hay, q);
      const rank = score + Number(item.priority || 0);
      return { item, score, rank };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.rank - a.rank || commandPaletteGroupRank(a.item.group) - commandPaletteGroupRank(b.item.group));

  commandPaletteState.filtered = composeCommandPaletteDisplayItems(scored, q);
  normalizeCommandPaletteSelection(commandPaletteState.filtered, true);
  renderCommandPalette();
}

function openCommandPalette() {
  if (roleState.role !== 'admin') return;
  if (!uiState.authed) return;
  if (!globalElements.commandPaletteModal) return;

  commandPaletteState.open = true;
  commandPaletteState.originPaneKey = focusedPaneKey() || '';
  commandPaletteState.items = buildCommandPaletteItems();
  commandPaletteState.filtered = commandPaletteState.items.slice();
  commandPaletteState.selectedIndex = 0;
  commandPaletteState.expandedSubgroups = new Set();

  openAdminModal(globalElements.commandPaletteModal);

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
  openAdminModal(globalElements.agentsModal);

  // Bootstrap persisted controls.
  const filter = getFleetFilter();
  const sort = getFleetSort();
  const heatmapEnabled = getFleetHeatmapEnabled();
  globalElements.agentsFilterButtons.forEach((btn) => {
    const key = btn.getAttribute('data-agents-filter') || '';
    const active = key === filter;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  if (globalElements.agentsSort) globalElements.agentsSort.value = sort;
  if (globalElements.agentsHeatmapToggle) globalElements.agentsHeatmapToggle.checked = heatmapEnabled;
  if (globalElements.agentsActiveMinutes) {
    const minutes = Number(storage.get(ADMIN_AGENT_ACTIVE_MINUTES_KEY, String(FLEET_DEFAULT_ACTIVE_WINDOW_MINUTES))) || FLEET_DEFAULT_ACTIVE_WINDOW_MINUTES;
    globalElements.agentsActiveMinutes.value = String(Math.max(1, minutes));
  }
  syncFleetDensityControl();
  renderFleetColumnPicker();

  renderAgentsModalList();
  renderAgentsLastRefreshed();
  renderFleetRefreshPaused();
  startAgentsModalAutoRefresh();
  startAgentsModalFreshnessTicker();

  // Focus search by default for fast filtering.
  try {
    globalElements.agentsSearch?.focus?.();
  } catch {}
}

function captureTriageReturnAnchor(agentId, { action = '' } = {}) {
  if (!isAgentsModalOpen()) return;
  const id = String(agentId || fleetSelectionState.selectedAgentId || '').trim();
  if (!id) return;
  const activeAction = document.activeElement instanceof Element
    ? String(document.activeElement.closest?.('[data-agent-action]')?.getAttribute('data-agent-action') || '')
    : '';
  triageReturnAnchor = {
    source: 'agents-modal',
    agentId: id,
    selectedIndex: Number(fleetSelectionState.selectedIndex) || 0,
    action: activeAction || action || '',
    createdAt: Date.now()
  };
}

function returnToTriageSource() {
  const anchor = triageReturnAnchor;
  if (!anchor || anchor.source !== 'agents-modal') {
    showToast('No triage context to return to.', { kind: 'info', timeoutMs: 2200 });
    return false;
  }
  if (!isAgentsModalOpen()) {
    showToast('Previous triage context is no longer open.', { kind: 'error', timeoutMs: 2600 });
    return false;
  }

  renderAgentsModalList();
  const id = String(anchor.agentId || '').trim();
  const selected = id ? selectFleetAgent(id, { focusRow: true }) : false;
  const rows = getFleetSelectableRows();
  const row = selected
    ? rows.find((entry) => String(entry?.dataset?.agentId || '') === id)
    : rows[Math.max(0, Math.min(Number(anchor.selectedIndex) || 0, rows.length - 1))];
  if (!row) {
    showToast('Previous triage row is no longer available.', { kind: 'error', timeoutMs: 2600 });
    return false;
  }

  try {
    row.scrollIntoView({ block: 'nearest' });
    const action = String(anchor.action || '').trim();
    const focusTarget = action
      ? row.querySelector(`[data-agent-action="${cssEscape(action)}"]`)
      : null;
    (focusTarget || row).focus({ preventScroll: true });
  } catch {
    try {
      row.focus({ preventScroll: true });
    } catch {}
  }
  showToast('Returned to triage context.', { kind: 'info', timeoutMs: 1600 });
  return true;
}

function setFleetHeartbeatSort() {
  const current = getFleetSort();
  if (current !== 'heartbeat_age_desc') storage.set(ADMIN_AGENT_PRE_HEARTBEAT_SORT_KEY, current);
  storage.set(ADMIN_AGENT_SORT_KEY, 'heartbeat_age_desc');
  if (globalElements.agentsSort) globalElements.agentsSort.value = 'heartbeat_age_desc';
  renderAgentsModalList();
}

function resetFleetSort() {
  const previous = String(storage.get(ADMIN_AGENT_PRE_HEARTBEAT_SORT_KEY, '') || '').trim();
  const next = previous && previous !== 'heartbeat_age_desc' ? previous : 'recent_desc';
  storage.set(ADMIN_AGENT_SORT_KEY, next);
  storage.remove(ADMIN_AGENT_PRE_HEARTBEAT_SORT_KEY);
  if (globalElements.agentsSort) globalElements.agentsSort.value = next;
  renderAgentsModalList();
}

function closeAgentsModal({ restoreFocus = true } = {}) {
  clearFleetRefreshLock();
  closeAdminModal(globalElements.agentsModal, { restoreFocus });
  stopAgentsModalAutoRefresh();
  stopAgentsModalFreshnessTicker();
}

function findExistingPane(kind, predicate = null) {
  const list = Array.isArray(paneManager?.panes) ? paneManager.panes : [];
  for (const pane of list) {
    if (!pane || pane.role !== 'admin' || pane.kind !== kind) continue;
    if (!predicate || predicate(pane)) return pane;
  }
  return null;
}

function getActiveChatAgentPane() {
  const originKey = commandPaletteState.open ? String(commandPaletteState.originPaneKey || '') : '';
  if (commandPaletteState.open) {
    return (paneManager?.panes || []).find((pane) => String(pane?.key || '') === originKey && pane.kind === 'chat') || null;
  }

  const focusedKey = focusedPaneKey();
  const activeKey = focusedKey || paneMruOrder()[0] || '';
  return (paneManager?.panes || []).find((pane) => String(pane?.key || '') === activeKey && pane.kind === 'chat') || null;
}

function openWorkqueueForActiveChatAgent() {
  if (roleState.role !== 'admin') return null;
  const chatPane = getActiveChatAgentPane();
  const agentId = normalizeAgentId(chatPane?.agentId || '');
  if (!chatPane || !agentId) {
    showToast('No active chat agent selected', { kind: 'error', timeoutMs: 2600 });
    return null;
  }

  const queue = 'dev-team';
  const existing = findExistingPane('workqueue', (pane) =>
    normalizeAgentId(pane.agentId || 'main') === agentId &&
    String(pane.workqueue?.queue || '').trim() === queue
  );

  const pane = existing || paneManager.addPane('workqueue', {
    forceNew: true,
    agentId,
    queue,
    scopeFilter: 'assigned'
  });
  if (!pane) return null;

  pane.agentId = agentId;
  pane.workqueue.scopeFilter = 'assigned';
  paneManager.persistAdminPanes();
  paneManager.focusPanePrimary(pane);
  try {
    const scopeBtn = pane.elements?.thread?.querySelector?.('[data-wq-scope="assigned"]');
    scopeBtn?.click?.();
  } catch {
    renderWorkqueuePaneItems(pane);
  }

  const focusWorkqueuePane = () => {
    try {
      const queueSelect = pane.elements?.thread?.querySelector?.('[data-wq-queue-select]');
      (queueSelect || pane.elements?.thread)?.focus?.();
    } catch {}
  };
  setTimeout(focusWorkqueuePane, 0);
  setTimeout(focusWorkqueuePane, 30);
  setTimeout(focusWorkqueuePane, 120);
  setTimeout(focusWorkqueuePane, 300);
  showToast(`Workqueue scoped to ${agentId}`, { kind: 'info', timeoutMs: 1600 });
  return pane;
}

function openAgentChatFromFleet(agentId) {
  const target = normalizeAgentId(agentId || 'main');
  captureTriageReturnAnchor(target, { action: 'open-chat' });
  const pane =
    findExistingPane('chat', (p) => normalizeAgentId(p.agentId || 'main') === target) ||
    paneManager.addPane('chat');
  if (!pane) return;
  paneSetAgent(pane, target);
  paneManager.focusPanePrimary(pane);
}

function openAgentTimelineFromFleet(agentId) {
  const target = String(agentId || '').trim() || 'all';
  captureTriageReturnAnchor(target, { action: 'open-timeline' });
  const pane =
    findExistingPane('timeline', (p) => String(p.cronAgentId || '').trim() === target) ||
    paneManager.addPane('timeline', { cronAgentId: target });
  if (!pane) return;

  pane.cronAgentId = target;
  paneManager.persistAdminPanes();

  try {
    const agentSel = pane.elements.thread?.querySelector?.('[data-cron-agent]');
    if (agentSel) {
      const exists = Array.from(agentSel.options || []).some((opt) => String(opt.value || '') === target);
      if (exists) {
        agentSel.value = target;
        agentSel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  } catch {}

  paneManager.focusPanePrimary(pane);
}

function openFleetPane({ forceNew = false } = {}) {
  const target = 'all';
  const pane = forceNew
    ? paneManager.addPane('timeline', { cronAgentId: target, forceNew: true })
    : findExistingPane('timeline', (p) => String(p.cronAgentId || '').trim() === target) ||
      findExistingPane('timeline') ||
      paneManager.addPane('timeline', { cronAgentId: target });
  if (!pane) return;

  pane.cronAgentId = target;
  paneManager.persistAdminPanes();
  paneManager.focusPanePrimary(pane);
  return pane;
}

function openAgentWorkqueueFromFleet(agentId) {
  const target = normalizeAgentId(agentId || 'main');
  captureTriageReturnAnchor(target, { action: 'open-workqueue' });
  const preferredQueue =
    String(workqueueState?.selectedQueue || '').trim() ||
    String(findExistingPane('workqueue')?.workqueue?.queue || '').trim() ||
    'dev-team';

  const pane =
    findExistingPane('workqueue', (p) => String(p.workqueue?.queue || '').trim() === preferredQueue && normalizeAgentId(p.agentId || 'main') === target) ||
    findExistingPane('workqueue', (p) => String(p.workqueue?.queue || '').trim() === preferredQueue) ||
    findExistingPane('workqueue') ||
    paneManager.addPane('workqueue', { queue: preferredQueue, agentId: target });
  if (!pane) return;

  pane.agentId = target;
  try {
    const claimAgentInput = pane.elements?.thread?.querySelector?.('[data-wq-claim-agent]');
    const claimAgentPicker = pane.elements?.thread?.querySelector?.('[data-wq-claim-agent-picker]');
    if (claimAgentInput) {
      claimAgentInput.value = target;
      hydrateWorkqueueClaimAgentPicker(claimAgentPicker);
    }
  } catch {}
  paneManager.persistAdminPanes();
  paneManager.focusPanePrimary(pane);
}

function openAgentTriageFromFleet(agentId) {
  const target = normalizeAgentId(agentId || 'main');
  openAgentChatFromFleet(target);
  openAgentWorkqueueFromFleet(target);
}

function renderFleetSelectionBar({ classify = null, lastSeenMap = null } = {}) {
  const bar = globalElements.agentsSelectionBar;
  if (!bar) return;

  const id = String(fleetSelectionState.selectedAgentId || '').trim();
  const visibleRows = getFleetSelectableRows();
  const selectedVisible = id && visibleRows.some((row) => String(row.dataset.agentId || '') === id);
  if (!id || !selectedVisible) {
    bar.hidden = true;
    bar.dataset.agentId = '';
    bar.innerHTML = '';
    return;
  }

  const agent = getAgentRecord(id);
  const label = formatAgentLabel(agent, { includeId: true });
  const map = lastSeenMap || getAgentLastSeenMap();
  const heartbeatTs = Number(map[id]) || 0;
  const heartbeatAge = heartbeatTs > 0 ? formatRelativeAge(Date.now() - heartbeatTs) : 'unknown';
  const triage = typeof classify === 'function'
    ? classify(id)
    : (() => {
        const withinMinutes = Math.max(1, Number(globalElements.agentsActiveMinutes?.value) || FLEET_DEFAULT_ACTIVE_WINDOW_MINUTES);
        const paneState = getAgentPaneStateMap()[id] || 'unknown';
        const ageMs = heartbeatTs > 0 ? Math.max(0, Date.now() - heartbeatTs) : Number.POSITIVE_INFINITY;
        const ageBucket = heartbeatAgeBucket(ageMs, { activeWindowMs: withinMinutes * 60_000, paneState });
        if (paneState === 'error' || paneState === 'offline' || !Number.isFinite(ageMs)) return { bucket: 'offline_error', ageBucket };
        return { bucket: ageMs <= withinMinutes * 60_000 ? 'active' : 'stale', ageBucket };
      })();
  const healthLabel = triage.bucket === 'offline_error'
    ? 'Offline/Error'
    : triage.bucket === 'stale'
      ? 'Stale'
      : 'Healthy';

  bar.hidden = false;
  if (String(bar.dataset.agentId || '') !== id) {
    bar.dataset.agentId = id;
    bar.innerHTML = `
      <div class="agents-selection-main">
        <div class="agents-selection-title" data-agents-selection-title></div>
        <div class="agents-selection-meta">
          <span class="agents-health-state-chip" data-agents-selection-health></span>
          <span class="agents-age-chip" data-agents-selection-age></span>
        </div>
      </div>
      <div class="agents-selection-actions" role="group" aria-label="Selected agent actions">
        <button type="button" class="secondary agents-action-btn" data-agent-action="open-chat" data-agent-id="${escapeHtml(id)}">Open Chat</button>
        <button type="button" class="secondary agents-action-btn" data-agent-action="open-workqueue" data-agent-id="${escapeHtml(id)}">Open Workqueue</button>
        <button type="button" class="secondary agents-action-btn" data-agent-action="open-timeline" data-agent-id="${escapeHtml(id)}">Open Timeline</button>
      </div>
    `;

    bar.querySelectorAll('[data-agent-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = String(btn.getAttribute('data-agent-action') || '').trim();
        const target = String(btn.getAttribute('data-agent-id') || '').trim();
        if (action === 'open-chat') openAgentChatFromFleet(target);
        else if (action === 'open-timeline') openAgentTimelineFromFleet(target);
        else if (action === 'open-workqueue') openAgentWorkqueueFromFleet(target);
      });
    });
  }

  const titleEl = bar.querySelector('[data-agents-selection-title]');
  const healthEl = bar.querySelector('[data-agents-selection-health]');
  const ageEl = bar.querySelector('[data-agents-selection-age]');
  if (titleEl) titleEl.textContent = label;
  if (healthEl) {
    healthEl.textContent = healthLabel;
    healthEl.dataset.healthState = triage.bucket;
  }
  if (ageEl) {
    ageEl.textContent = heartbeatAge;
    ageEl.dataset.heartbeatBucket = triage.ageBucket || '';
  }
}

function findActivePaneFromFocus() {
  const active = document.activeElement;
  if (!active) return null;
  return paneManager.panes.find((pane) => {
    const root = pane?.elements?.root;
    return !!(root && (root === active || root.contains(active)));
  }) || null;
}

function getActiveChatTargetForWorkqueuePairing() {
  const focusedPane = findActivePaneFromFocus();
  const rememberedPane = paneMruOrder()
    .map((key) => paneManager.panes.find((pane) => pane?.key && pane.key === key) || null)
    .find((pane) => pane?.kind === 'chat') || null;
  const activePane = focusedPane || rememberedPane;
  if (activePane?.kind === 'chat') {
    return normalizeAgentId(activePane.agentId || 'main');
  }
  return '';
}

function openOrFocusPairedWorkqueuePaneForTarget(target) {
  const nextTarget = normalizeAgentId(target || '');
  if (!nextTarget) return false;

  const pane =
    findExistingPane('workqueue', (p) => normalizeAgentId(p?.workqueue?.queue || '') === nextTarget) ||
    paneManager.addPane('workqueue', { queue: nextTarget });
  if (!pane) return false;

  pane.workqueue = pane.workqueue || {};
  pane.workqueue.queue = nextTarget;
  paneManager.persistAdminPanes();
  paneManager.focusPanePrimary(pane);
  return true;
}

function openTopbarWorkqueueAction() {
  const activeChatTarget = getActiveChatTargetForWorkqueuePairing();
  if (activeChatTarget && openOrFocusPairedWorkqueuePaneForTarget(activeChatTarget)) return;
  openWorkqueue();
}

function renderAgentsModalList() {
  const root = globalElements.agentsList;
  if (!root) return;

  const scrollAnchor = captureFleetScrollAnchor(root);
  const focusedAgentId = document.activeElement instanceof Element
    ? String(document.activeElement.closest?.('.agents-row')?.dataset?.agentId || '')
    : '';
  const search = String(globalElements.agentsSearch?.value || '').trim().toLowerCase();
  const withinMinutes = Math.max(1, Number(globalElements.agentsActiveMinutes?.value) || FLEET_DEFAULT_ACTIVE_WINDOW_MINUTES);
  const activeWindowMs = withinMinutes * 60_000;
  const filterMode = getFleetFilter();
  const sortMode = getFleetSort();
  const heatmapEnabled = getFleetHeatmapEnabled();
  const visibleColumns = getFleetColumns();
  syncFleetDensityControl();

  const pins = getPinnedAgentIds();
  const lastSeenMap = getAgentLastSeenMap();
  const paneStateMap = getAgentPaneStateMap();
  const statusSnippetMap = getAgentStatusSnippetMap();
  const baseAgents = uiState.agents.length > 0 ? uiState.agents : [{ id: 'main', name: 'main', displayName: 'main', emoji: '' }];

  const classify = (agentId) => {
    const id = String(agentId || '').trim();
    const ts = Number(lastSeenMap[id]) || 0;
    const ageMs = ts > 0 ? Math.max(0, Date.now() - ts) : Number.POSITIVE_INFINITY;
    const paneState = paneStateMap[id] || 'unknown';
    const ageBucket = heartbeatAgeBucket(ageMs, { activeWindowMs, paneState });
    if (paneState === 'error' || paneState === 'offline') return { bucket: 'offline_error', ageBucket, ts, ageMs };
    if (!Number.isFinite(ageMs)) return { bucket: 'offline_error', ageBucket, ts, ageMs };
    if (ageMs <= activeWindowMs) return { bucket: 'active', ageBucket, ts, ageMs };
    return { bucket: 'stale', ageBucket, ts, ageMs };
  };

  const matches = (agent) => {
    const id = String(agent?.id || '').trim();
    const label = formatAgentLabel(agent, { includeId: true }).toLowerCase();
    const snippet = String(statusSnippetMap[id] || '').toLowerCase();
    const haystack = `${label} ${id.toLowerCase()} ${snippet}`.trim();
    if (search && !haystack.includes(search)) return false;
    if (filterMode === 'all') return true;
    const { bucket } = classify(id);
    return bucket === filterMode;
  };

  const sortAgents = (list) => {
    const arr = (Array.isArray(list) ? list : []).slice();
    if (sortMode === 'agent_id_asc') {
      arr.sort((a, b) => String(a?.id || '').localeCompare(String(b?.id || '')));
      return arr;
    }
    if (sortMode === 'heartbeat_age_desc') {
      arr.sort((a, b) => {
        const ca = classify(a?.id);
        const cb = classify(b?.id);
        const da = Number.isFinite(ca.ageMs) ? ca.ageMs : Number.MAX_SAFE_INTEGER;
        const db = Number.isFinite(cb.ageMs) ? cb.ageMs : Number.MAX_SAFE_INTEGER;
        if (db !== da) return db - da;
        return formatAgentLabel(a, { includeId: true }).localeCompare(formatAgentLabel(b, { includeId: true }));
      });
      return arr;
    }
    return sortAgentsByLastSeen(arr);
  };

  const filtered = baseAgents.filter(matches);
  const pinned = sortAgents(filtered.filter((a) => pins.has(String(a?.id || '').trim())));
  const rest = sortAgents(filtered.filter((a) => !pins.has(String(a?.id || '').trim())));
  const ordered = [...pinned, ...rest];
  const needsAttention = rest.filter((agent) => classify(agent?.id).bucket !== 'active');
  const healthy = rest.filter((agent) => classify(agent?.id).bucket === 'active');
  const fleetSummary = baseAgents.reduce((acc, agent) => {
    const { bucket } = classify(agent?.id);
    if (bucket === 'active') acc.healthy += 1;
    else acc.needsTriage += 1;
    if (bucket === 'offline_error') acc.disconnected += 1;
    return acc;
  }, { needsTriage: 0, healthy: 0, disconnected: 0 });
  const healthyCollapseDefault = baseAgents.length > ADMIN_AGENT_HEALTHY_COLLAPSE_THRESHOLD;
  const healthyCollapsed = String(storage.get(ADMIN_AGENT_HEALTHY_COLLAPSED_KEY, healthyCollapseDefault ? '1' : '0')) === '1';
  const visibleAgents = [...pinned, ...needsAttention, ...(healthyCollapsed ? [] : healthy)];
  reconcileFleetSelection(visibleAgents);

  root.innerHTML = '';

  const renderSummary = () => {
    const summary = document.createElement('div');
    summary.className = 'agents-health-summary';
    summary.setAttribute('aria-label', 'Fleet health summary');

    const chips = [
      {
        label: 'Needs triage',
        value: fleetSummary.needsTriage,
        tone: 'attention',
        title: 'Agents outside the active heartbeat window or reporting offline/error.'
      },
      {
        label: 'Healthy',
        value: fleetSummary.healthy,
        tone: 'healthy',
        title: 'Agents active within the selected window and not reporting offline/error.'
      },
      {
        label: 'Disconnected',
        value: fleetSummary.disconnected,
        tone: 'disconnected',
        title: 'Agents with no heartbeat data or a pane reporting offline/error.'
      }
    ];

    for (const chip of chips) {
      const node = document.createElement('div');
      node.className = `agents-health-chip ${chip.tone}`;
      node.title = chip.title;
      node.innerHTML = `
        <span class="agents-health-value">${escapeHtml(String(chip.value))}</span>
        <span class="agents-health-label">${escapeHtml(chip.label)}</span>
      `;
      summary.appendChild(node);
    }

    root.appendChild(summary);
  };

  const renderFleetHeader = () => {
    const header = document.createElement('div');
    header.className = 'agents-table-header';
    header.setAttribute('role', 'presentation');
    header.innerHTML = `
      <span class="agents-table-pin-label" aria-hidden="true">Pin</span>
      <span class="agents-table-agent-label">Agent</span>
      <span class="agents-table-health-label">Health</span>
      <span class="agents-table-details-label">Details</span>
      ${visibleColumns.actions ? '<span class="agents-table-actions-label">Actions</span>' : ''}
    `;
    root.appendChild(header);
  };

  const renderSection = (title, agents, { collapsible = false, collapsed = false } = {}) => {
    const section = document.createElement('div');
    section.className = 'agents-section';
    section.classList.toggle('is-collapsed', collapsible && collapsed);

    const header = document.createElement(collapsible ? 'button' : 'div');
    header.className = 'agents-section-title';
    header.innerHTML = `
      <span>${escapeHtml(title)} (${agents.length})</span>
      ${collapsible ? `<span class="agents-section-toggle">${collapsed ? 'Show' : 'Hide'}</span>` : ''}
    `;
    if (collapsible) {
      header.type = 'button';
      header.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      header.addEventListener('click', () => {
        storage.set(ADMIN_AGENT_HEALTHY_COLLAPSED_KEY, collapsed ? '0' : '1');
        renderAgentsModalList();
      });
    }
    section.appendChild(header);

    const list = document.createElement('div');
    list.className = 'agents-rows';
    if (collapsible && collapsed) list.hidden = true;

    for (const agent of agents) {
      const id = String(agent?.id || '').trim();
      const row = document.createElement('div');
      row.className = 'agents-row';
      row.tabIndex = 0;
      row.dataset.agentId = id;
      row.setAttribute('role', 'option');
      row.setAttribute('aria-selected', id && id === fleetSelectionState.selectedAgentId ? 'true' : 'false');

      const label = formatAgentLabel(agent, { includeId: true });
      const pinnedNow = pins.has(id);
      const heartbeatTs = Number(lastSeenMap[id]) || 0;
      const heartbeatAgeMs = heartbeatTs > 0 ? Math.max(0, Date.now() - heartbeatTs) : Number.POSITIVE_INFINITY;
      const heartbeatAge = heartbeatTs > 0 ? formatRelativeAge(Date.now() - heartbeatTs) : 'unknown';
      const triage = classify(id);
      const healthLabel = triage.bucket === 'offline_error'
        ? 'Offline/Error'
        : triage.bucket === 'stale'
          ? 'Stale'
          : 'Healthy';
      const heatBucketLabel = heartbeatAgeBucketLabel(triage.ageBucket);
      const statusSnippet = String(statusSnippetMap[id] || '').trim();
      const statusSnippetHtml = visibleColumns.status && statusSnippet
        ? `<span class="agents-status-snippet" data-fleet-column="status">${escapeHtml(statusSnippet)}</span>`
        : '';
      const model = String(agent?.model || '').trim();
      const host = String(agent?.host || '').trim();
      const modelHtml = visibleColumns.model && model
        ? `<span class="agents-optional-chip" data-fleet-column="model" title="Model">${escapeHtml(model)}</span>`
        : '';
      const hostHtml = visibleColumns.host && host
        ? `<span class="agents-optional-chip" data-fleet-column="host" title="Host">${escapeHtml(host)}</span>`
        : '';
      const rowActionsHtml = visibleColumns.actions
        ? `
        <div class="agents-row-actions agents-row-actions-inline" role="group" aria-label="Quick actions for ${escapeHtml(label)}">
          <button type="button" class="secondary agents-action-btn" data-agent-action="triage" data-agent-id="${escapeHtml(id)}" title="Open Chat and Workqueue" aria-label="Triage agent ${escapeHtml(label)}">Triage</button>
          <button type="button" class="secondary agents-action-btn" data-agent-action="open-chat" data-agent-id="${escapeHtml(id)}" title="Open Chat" aria-label="Open Chat for ${escapeHtml(label)}">Chat</button>
          <button type="button" class="secondary agents-action-btn" data-agent-action="open-timeline" data-agent-id="${escapeHtml(id)}" title="Open Timeline" aria-label="Open Timeline for ${escapeHtml(label)}">Timeline</button>
          <button type="button" class="secondary agents-action-btn" data-agent-action="open-workqueue" data-agent-id="${escapeHtml(id)}" title="Open Workqueue" aria-label="Open Workqueue">Workqueue</button>
        </div>
        <details class="agents-row-actions-overflow">
          <summary class="secondary" aria-label="More actions for ${escapeHtml(label)}" title="More actions">⋯</summary>
          <div class="agents-row-actions-menu" role="group" aria-label="Quick actions for ${escapeHtml(label)}">
            <button type="button" class="secondary agents-action-btn" data-agent-action="triage" data-agent-id="${escapeHtml(id)}" title="Open Chat and Workqueue" aria-label="Triage agent ${escapeHtml(label)}">Triage agent</button>
            <button type="button" class="secondary agents-action-btn" data-agent-action="open-chat" data-agent-id="${escapeHtml(id)}" title="Open Chat" aria-label="Open Chat for ${escapeHtml(label)}">Open Chat</button>
            <button type="button" class="secondary agents-action-btn" data-agent-action="open-timeline" data-agent-id="${escapeHtml(id)}" title="Open Timeline" aria-label="Open Timeline for ${escapeHtml(label)}">Open Timeline</button>
            <button type="button" class="secondary agents-action-btn" data-agent-action="open-workqueue" data-agent-id="${escapeHtml(id)}" title="Open Workqueue" aria-label="Open Workqueue">Open Workqueue</button>
          </div>
        </details>
      `
        : '';
      row.dataset.heartbeatBucket = triage.ageBucket;
      row.dataset.healthState = triage.bucket;
      row.classList.toggle('is-stale', triage.bucket === 'stale' || heartbeatAgeMs > FLEET_DEFAULT_STALE_THRESHOLD_MINUTES * 60_000);
      row.classList.toggle('agents-row-heatmap', heatmapEnabled);
      row.classList.toggle('agents-row-no-actions', !visibleColumns.actions);

      row.innerHTML = `
        <button type="button" class="agents-pin" aria-label="${pinnedNow ? 'Unpin agent' : 'Pin agent'}" aria-pressed="${pinnedNow ? 'true' : 'false'}" data-agent-pin="${escapeHtml(id)}">${pinnedNow ? '★' : '☆'}</button>
        <div class="agents-row-identity">
          <div class="agents-row-title">${escapeHtml(label)}</div>
          ${visibleColumns.id ? `<div class="agents-row-id" data-fleet-column="id">${escapeHtml(id)}</div>` : ''}
        </div>
        <div class="agents-row-health">
          ${visibleColumns.health ? `<span class="agents-health-state-chip" data-fleet-column="health" data-health-state="${escapeHtml(triage.bucket)}">${escapeHtml(healthLabel)}</span>` : ''}
        </div>
        <div class="agents-row-meta">
            ${visibleColumns.heartbeat ? `<span class="agents-age-chip" data-fleet-column="heartbeat" data-heartbeat-bucket="${escapeHtml(triage.ageBucket)}" title="Heartbeat age: ${escapeHtml(heartbeatAge)} (${escapeHtml(heatBucketLabel)})">${escapeHtml(heartbeatAge)}</span>` : ''}
            ${visibleColumns.heartbeatDetail ? `<span class="agents-age-label" data-fleet-column="heartbeatDetail">${escapeHtml(heatBucketLabel)}</span>` : ''}${statusSnippetHtml}${modelHtml}${hostHtml}
        </div>
        ${rowActionsHtml}
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

      row.addEventListener('click', (e) => {
        if (e.target instanceof Element && e.target.closest('button, summary, details')) return;
        selectFleetAgent(id, { focusRow: true });
      });
      row.addEventListener('focus', () => selectFleetAgent(id));

      const actionButtons = Array.from(row.querySelectorAll('[data-agent-action]'));
      actionButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const action = String(btn.getAttribute('data-agent-action') || '').trim();
          if (action === 'triage') openAgentTriageFromFleet(id);
          else if (action === 'open-chat') openAgentChatFromFleet(id);
          else if (action === 'open-timeline') openAgentTimelineFromFleet(id);
          else if (action === 'open-workqueue') openAgentWorkqueueFromFleet(id);
        });
      });

      row.addEventListener('mouseenter', () => {
        fleetRefreshLock.pointerInsideRow = true;
        setFleetRefreshLock(true);
      });
      row.addEventListener('mouseleave', () => {
        fleetRefreshLock.pointerInsideRow = false;
        setTimeout(() => setFleetRefreshLock(false), 80);
      });
      row.addEventListener('focusin', () => setFleetRefreshLock(true));
      row.addEventListener('focusout', () => {
        setTimeout(() => setFleetRefreshLock(false), 80);
      });
      row.querySelectorAll('.agents-row-actions-overflow').forEach((details) => {
        details.addEventListener('toggle', () => {
          setFleetRefreshLock(details.open);
          if (!details.open) setTimeout(() => setFleetRefreshLock(false), 80);
        });
      });

      list.appendChild(row);
    }

    section.appendChild(list);
    root.appendChild(section);
  };

  renderSummary();
  renderFleetHeader();
  if (pinned.length > 0) renderSection('Pinned', pinned);
  renderSection('Needs attention', needsAttention);
  renderSection('Healthy', healthy, { collapsible: true, collapsed: healthyCollapsed });

  if (globalElements.agentsHeatmapToggle) globalElements.agentsHeatmapToggle.checked = heatmapEnabled;
  if (globalElements.agentsHeartbeatSortBtn) {
    const active = sortMode === 'heartbeat_age_desc';
    globalElements.agentsHeartbeatSortBtn.classList.toggle('active', active);
    globalElements.agentsHeartbeatSortBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
  }
  if (globalElements.agentsSortResetBtn) {
    globalElements.agentsSortResetBtn.disabled = sortMode === 'recent_desc';
  }
  if (globalElements.agentsSortIndicator) {
    globalElements.agentsSortIndicator.textContent =
      sortMode === 'heartbeat_age_desc'
        ? 'Sorted by heartbeat age: stale first. Reset sort returns to the prior/default order.'
        : fleetSelectionState.notice;
  }

  const empty = ordered.length === 0;
  if (globalElements.agentsEmpty) globalElements.agentsEmpty.hidden = !empty;
  restoreFleetScrollAnchor(root, scrollAnchor);
  renderFleetSelectionBar({ classify, lastSeenMap });
  if (focusedAgentId) {
    try {
      root.querySelector(`.agents-row[data-agent-id="${CSS.escape(focusedAgentId)}"]`)?.focus?.({ preventScroll: true });
    } catch {}
  }
}

function captureFleetScrollAnchor(root) {
  if (!root) return null;
  const rows = Array.from(root.querySelectorAll('.agents-row[data-agent-id]')).filter((row) => row.offsetParent !== null);
  const top = Number(root.scrollTop) || 0;
  const anchor = rows.find((row) => row.offsetTop >= top) || rows[0] || null;
  return {
    scrollTop: top,
    agentId: String(anchor?.dataset?.agentId || ''),
    offset: anchor ? anchor.offsetTop - top : 0
  };
}

function restoreFleetScrollAnchor(root, anchor) {
  if (!root || !anchor) return;
  const safeScrollTop = Math.max(0, Number(anchor.scrollTop) || 0);
  if (!anchor.agentId) {
    root.scrollTop = safeScrollTop;
    return;
  }
  const row = root.querySelector(`.agents-row[data-agent-id="${cssEscape(anchor.agentId)}"]`);
  if (!row || row.offsetParent === null) {
    root.scrollTop = safeScrollTop;
    return;
  }
  root.scrollTop = Math.max(0, row.offsetTop - (Number(anchor.offset) || 0));
}

function reconcileFleetSelection(visibleAgents) {
  const agents = Array.isArray(visibleAgents) ? visibleAgents : [];
  const ids = agents.map((agent) => String(agent?.id || '').trim()).filter(Boolean);
  if (!ids.length) {
    fleetSelectionState.selectedAgentId = '';
    fleetSelectionState.selectedIndex = 0;
    fleetSelectionState.notice = '';
    fleetSelectionState.missingAgentId = '';
    renderFleetSelectionBar();
    return;
  }
  const previousId = String(fleetSelectionState.selectedAgentId || '').trim();
  const existingIndex = previousId ? ids.indexOf(previousId) : -1;
  if (existingIndex >= 0) {
    fleetSelectionState.selectedIndex = existingIndex;
    if (!fleetSelectionState.missingAgentId) fleetSelectionState.notice = '';
    return;
  }
  const fallbackIndex = Math.max(0, Math.min(Number(fleetSelectionState.selectedIndex) || 0, ids.length - 1));
  fleetSelectionState.selectedAgentId = ids[fallbackIndex];
  fleetSelectionState.selectedIndex = fallbackIndex;
  fleetSelectionState.missingAgentId = previousId;
  fleetSelectionState.notice = previousId ? 'Selected agent no longer in current filter.' : '';
}

function getFleetSelectableRows() {
  const root = globalElements.agentsList;
  if (!root) return [];
  return Array.from(root.querySelectorAll('.agents-row[data-agent-id]')).filter((row) => row.offsetParent !== null);
}

function selectFleetAgent(agentId, { focusRow = false } = {}) {
  const id = String(agentId || '').trim();
  const rows = getFleetSelectableRows();
  const ix = rows.findIndex((row) => String(row.dataset.agentId || '') === id);
  if (ix < 0) return false;
  fleetSelectionState.selectedAgentId = id;
  fleetSelectionState.selectedIndex = ix;
  fleetSelectionState.notice = '';
  fleetSelectionState.missingAgentId = '';
  rows.forEach((row, index) => row.setAttribute('aria-selected', index === ix ? 'true' : 'false'));
  renderFleetSelectionBar();
  if (focusRow) {
    try {
      rows[ix].focus({ preventScroll: true });
    } catch {}
  }
  return true;
}

function moveFleetSelection(delta) {
  const rows = getFleetSelectableRows();
  if (!rows.length) return false;
  const current = rows.findIndex((row) => String(row.dataset.agentId || '') === String(fleetSelectionState.selectedAgentId || ''));
  const start = current >= 0 ? current : Math.max(0, Math.min(Number(fleetSelectionState.selectedIndex) || 0, rows.length - 1));
  const next = Math.max(0, Math.min(start + delta, rows.length - 1));
  const id = String(rows[next].dataset.agentId || '');
  if (!selectFleetAgent(id, { focusRow: true })) return false;
  rows[next].scrollIntoView({ block: 'nearest' });
  return true;
}

function runFleetSelectedAgent(mode = 'chat') {
  const id = String(fleetSelectionState.selectedAgentId || '').trim();
  if (!id) return false;
  if (mode === 'workqueue') openAgentWorkqueueFromFleet(id);
  else if (mode === 'timeline') openAgentTimelineFromFleet(id);
  else openAgentChatFromFleet(id);
  return true;
}

// Workqueue (admin-only)

const WORKQUEUE_STATUSES = ['ready', 'pending', 'blocked', 'claimed', 'in_progress', 'done', 'failed'];
const WORKQUEUE_PANE_INITIAL_RENDER_LIMIT = 100;
const WORKQUEUE_PANE_RENDER_CHUNK_SIZE = 100;
const WORKQUEUE_CANONICAL_DENSITY_THRESHOLD = 0.2;
const WORKQUEUE_GROUPED_AUTO_THRESHOLD = 20;
const WORKQUEUE_ALL_SCOPE_GUARD_THRESHOLD_KEY = 'clawnsole.admin.workqueue.allScopeGuardThreshold';
const WORKQUEUE_ALL_SCOPE_GUARD_DEFAULT_THRESHOLD = 200;
const WORKQUEUE_HEADER_META = {
  title: { label: 'Task', tooltip: 'Sort by task title.' },
  status: { label: 'Status', tooltip: 'Sort by queue status.' },
  priority: { label: 'Priority', tooltip: 'Sort by priority. Higher values are handled first by default.' },
  attempts: { label: 'Attempts', tooltip: 'Sort by how many times this task has been claimed.' },
  claimedBy: { label: 'Claimed by', tooltip: 'Sort by the agent currently assigned to the task.' },
  leaseUntil: { label: 'Lease expires', tooltip: 'Sort by when the current claim expires.' }
};

function formatWorkqueueStatusLabel(status) {
  const s = String(status || '').trim().toLowerCase();
  if (!s) return 'Unknown';
  return s
    .split('_')
    .filter(Boolean)
    .map((part, ix) => {
      if (ix > 0) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

function formatWorkqueueScopeLabel(scope) {
  const s = String(scope || '').trim().toLowerCase();
  if (s === 'assigned') return 'Assigned';
  if (s === 'unassigned') return 'Unassigned';
  return 'All';
}

function formatWorkqueueSourceLabel(source) {
  const s = String(source || '').trim().toLowerCase();
  if (s === 'issue') return 'Issue';
  if (s === 'routine') return 'Routine';
  if (s === 'coordination') return 'Coordination';
  return 'Other';
}

function buildWorkqueueStatusCounts(items) {
  const counts = Object.fromEntries(WORKQUEUE_STATUSES.map((s) => [s, 0]));
  for (const it of Array.isArray(items) ? items : []) {
    const status = String(it?.status || '').trim().toLowerCase();
    if (!status || !Object.prototype.hasOwnProperty.call(counts, status)) continue;
    counts[status] += 1;
  }
  return counts;
}

function getWorkqueueAllScopeGuardThreshold() {
  const raw = storage.get(WORKQUEUE_ALL_SCOPE_GUARD_THRESHOLD_KEY, String(WORKQUEUE_ALL_SCOPE_GUARD_DEFAULT_THRESHOLD));
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : WORKQUEUE_ALL_SCOPE_GUARD_DEFAULT_THRESHOLD;
}

const workqueueState = {
  queues: [],
  selectedQueue: '',
  statusFilter: new Set(['ready', 'pending', 'blocked', 'claimed', 'in_progress']),
  statusCounts: Object.fromEntries(WORKQUEUE_STATUSES.map((s) => [s, 0])),
  items: [],
  selectedItemId: null,
  groupMode: 'rows',
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
  openAdminModal(globalElements.workqueueModal);
  // Sorting wiring is synchronous; bootstrap it immediately so UI tests can click sort buttons deterministically.
  ensureWorkqueueModalSorting();
  ensureWorkqueueBootstrapped();
  startWorkqueueAutoRefresh();
}

function closeWorkqueue({ restoreFocus = true } = {}) {
  stopWorkqueueAutoRefresh();
  closeAdminModal(globalElements.workqueueModal, { restoreFocus });
}

function renderWorkqueueStatusFilters() {
  const root = globalElements.wqStatusFilters;
  if (!root) return;
  root.innerHTML = '';
  for (const s of WORKQUEUE_STATUSES) {
    const id = `wq-status-${s}`;
    const label = document.createElement('label');
    label.className = 'wq-status-chip';
    const count = Number(workqueueState.statusCounts?.[s] || 0);
    const display = `${formatWorkqueueStatusLabel(s)} (${count})`;
    label.innerHTML = `<input type="checkbox" id="${id}" ${workqueueState.statusFilter.has(s) ? 'checked' : ''} /> <span>${escapeHtml(display)}</span>`;
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
      const meta = WORKQUEUE_HEADER_META[key];
      const active = key && key === workqueueState.sortKey;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      if (meta) btn.textContent = meta.label;
      const sortState = active ? ` Currently sorted ${workqueueState.sortDir === 'asc' ? 'ascending' : 'descending'}.` : '';
      btn.title = `${meta?.tooltip || 'Sort workqueue items.'}${sortState}`;
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
  const filteredUrl = `/api/workqueue/items${params.toString() ? `?${params.toString()}` : ''}`;

  const countsParams = new URLSearchParams();
  if (queue) countsParams.set('queue', queue);
  const countsUrl = `/api/workqueue/items${countsParams.toString() ? `?${countsParams.toString()}` : ''}`;

  try {
    const [filteredRes, countsRes] = await Promise.all([
      fetch(filteredUrl, { credentials: 'include', cache: 'no-store' }),
      fetch(countsUrl, { credentials: 'include', cache: 'no-store' })
    ]);
    if (!filteredRes.ok) throw new Error(String(filteredRes.status));

    const filteredData = await filteredRes.json();
    const items = Array.isArray(filteredData.items) ? filteredData.items : [];

    let countItems = items;
    if (countsRes.ok) {
      const countsData = await countsRes.json().catch(() => ({}));
      if (Array.isArray(countsData.items)) countItems = countsData.items;
    }

    workqueueState.items = items;
    workqueueState.statusCounts = buildWorkqueueStatusCounts(countItems);
    renderWorkqueueStatusFilters();
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
    { status: 'blocked', label: 'Blocked' },
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
    col.setAttribute('data-testid', `wq-col-${colDef.status}`);

    const colItems = Array.isArray(itemsByStatus[colDef.status]) ? itemsByStatus[colDef.status] : [];

    const head = document.createElement('div');
    head.className = 'wq-board-col-header';
    head.innerHTML = `
      <div class="wq-board-col-title">${escapeHtml(colDef.label)}</div>
      <div class="wq-board-col-count mono">${escapeHtml(String(colItems.length))}</div>
    `;

    const lane = document.createElement('div');
    lane.className = 'wq-board-lane';
    lane.setAttribute('data-testid', `wq-lane-${colDef.status}`);

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
      card.setAttribute('data-testid', 'wq-card');

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
        <div class="wq-card-title">${escapeHtml(formatWorkqueueIssueTitle(it))}</div>
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
      <div class="wq-inspect-pre">${escapeHtml(formatWorkqueueIssueTitle(item))}</div>
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
    <button type="button" class="btn" data-wq-action="edit" data-testid="wq-inspect-edit">Edit</button>
    <button type="button" class="btn danger" data-wq-action="delete" data-testid="wq-inspect-delete">Delete</button>
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

  const status = prompt('Edit status (ready|pending|blocked|claimed|in_progress|done|failed)', String(item.status || 'ready'));
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
  const statuses = WORKQUEUE_STATUSES;
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
window.__debug.refreshAgents = refreshAgents;
window.__debug.setAgentsLastRefreshedAtMs = (value) => {
  agentsLastRefreshedAtMs = Math.max(0, Number(value) || 0);
  renderAgentsLastRefreshed();
};

function getWorkqueueItemRepo(item) {
  const repo = String(item?.meta?.repo || '').trim();
  if (repo) return repo;

  const candidates = [String(item?.meta?.url || ''), String(item?.meta?.issueUrl || ''), String(item?.instructions || '')];
  for (const text of candidates) {
    const match = text.match(/github\.com\/([^\s/]+\/[^\s/#?]+)/i);
    if (match?.[1]) return String(match[1]).trim();
  }
  return '';
}

function getWorkqueueItemSource(item) {
  const kind = String(item?.meta?.kind || '').trim().toLowerCase();
  const title = String(item?.title || '').trim().toLowerCase();
  if (kind.includes('coordination') || title.startsWith('[coordination]')) return 'coordination';
  if (kind.includes('issue') || title.startsWith('[issue]')) return 'issue';
  if (kind.includes('routine') || kind.includes('pr-review') || title.startsWith('[routine]')) return 'routine';
  return 'other';
}

const WORKQUEUE_DUPLICATE_TERMINAL_STATUSES = new Set(['done', 'failed']);

function normalizeWorkqueueIssueRepo(repo) {
  return String(repo || '').trim().toLowerCase().replace(/\s+/g, '');
}

function normalizeWorkqueueIssueNumber(raw) {
  const n = Number.parseInt(String(raw || '').trim(), 10);
  return Number.isFinite(n) && n > 0 ? String(n) : '';
}

function parseWorkqueueIssueRef(text) {
  const src = String(text || '').trim();
  if (!src) return null;

  const fromUrl = src.match(/github\.com\/([a-z0-9_.-]+\/[a-z0-9_.-]+)\/issues\/(\d+)/i);
  if (fromUrl) {
    const repo = normalizeWorkqueueIssueRepo(fromUrl[1]);
    const issueNumber = normalizeWorkqueueIssueNumber(fromUrl[2]);
    if (repo && issueNumber) return { repo, issueNumber };
  }

  const repoRefPattern = String.raw`([a-z0-9_.-]+)\s*\/\s*([a-z0-9_.-]+)`;
  const fromFullRef = src.match(new RegExp(String.raw`(?:^|[\s[(])(?:issue:)?${repoRefPattern}\s*#\s*(\d+)\b`, 'i'));
  if (fromFullRef) {
    const repo = normalizeWorkqueueIssueRepo(`${fromFullRef[1]}/${fromFullRef[2]}`);
    const issueNumber = normalizeWorkqueueIssueNumber(fromFullRef[3]);
    if (repo && issueNumber) return { repo, issueNumber };
  }

  const fromColonRef = src.match(new RegExp(String.raw`(?:^|[\s[(])(?:issue:)?${repoRefPattern}\s*:\s*(\d+)\b`, 'i'));
  if (fromColonRef) {
    const repo = normalizeWorkqueueIssueRepo(`${fromColonRef[1]}/${fromColonRef[2]}`);
    const issueNumber = normalizeWorkqueueIssueNumber(fromColonRef[3]);
    if (repo && issueNumber) return { repo, issueNumber };
  }

  const repoLine = src.match(new RegExp(String.raw`\brepo\s*:\s*${repoRefPattern}\b`, 'i'));
  const issueLine = src.match(/\b(?:issue|issueNumber)\s*:\s*#?\s*(\d+)\b/i);
  if (repoLine && issueLine) {
    const repo = normalizeWorkqueueIssueRepo(`${repoLine[1]}/${repoLine[2]}`);
    const issueNumber = normalizeWorkqueueIssueNumber(issueLine[1]);
    if (repo && issueNumber) return { repo, issueNumber };
  }

  return null;
}

function getWorkqueueIssueKey(item) {
  const meta = item?.meta && typeof item.meta === 'object' ? item.meta : {};
  const explicitRepo = normalizeWorkqueueIssueRepo(meta.repo || item?.repo);
  const explicitIssue = normalizeWorkqueueIssueNumber(meta.issueNumber || meta.issue || item?.issueNumber || item?.issue);
  if (explicitRepo && explicitIssue) return `${explicitRepo}#${explicitIssue}`;

  const parsed =
    parseWorkqueueIssueRef(item?.dedupeKey) ||
    parseWorkqueueIssueRef(meta.dedupeKey) ||
    parseWorkqueueIssueRef(meta.url) ||
    parseWorkqueueIssueRef(item?.instructions) ||
    parseWorkqueueIssueRef(item?.title);
  return parsed ? `${parsed.repo}#${parsed.issueNumber}` : '';
}

function normalizeWorkqueueGroupText(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function getWorkqueueDedupeIdentity(item) {
  const meta = item?.meta && typeof item.meta === 'object' ? item.meta : {};
  return normalizeWorkqueueGroupText(meta.dedupeKey || item?.dedupeKey);
}

function getWorkqueueTitleGroupPrefix(item) {
  const title = normalizeWorkqueueGroupText(formatWorkqueueIssueTitle(item) || item?.title);
  if (!title) return '';
  return title.slice(0, 80);
}

function getWorkqueueGroupIdentity(item) {
  const source = getWorkqueueItemSource(item);
  const issueKey = getWorkqueueIssueKey(item);
  const dedupeKey = getWorkqueueDedupeIdentity(item);
  if ((source === 'routine' || source === 'coordination') && dedupeKey) return `dedupe:${dedupeKey}`;
  if (issueKey) return `issue:${issueKey}`;
  if (dedupeKey) return `dedupe:${dedupeKey}`;
  const titlePrefix = getWorkqueueTitleGroupPrefix(item);
  return titlePrefix ? `title:${titlePrefix}` : '';
}

function chooseWorkqueueDuplicateKeepItem(items) {
  const statusRank = { in_progress: 6, claimed: 5, ready: 4, pending: 3, blocked: 2, done: 1, failed: 0 };
  return (Array.isArray(items) ? items : [])
    .slice()
    .sort((a, b) => {
      const pr = Number(b?.priority || 0) - Number(a?.priority || 0);
      if (pr !== 0) return pr;
      const sr = (statusRank[String(b?.status || '')] ?? -1) - (statusRank[String(a?.status || '')] ?? -1);
      if (sr !== 0) return sr;
      const ua = Date.parse(String(a?.updatedAt || '')) || 0;
      const ub = Date.parse(String(b?.updatedAt || '')) || 0;
      if (ub !== ua) return ub - ua;
      const ca = Date.parse(String(a?.createdAt || '')) || 0;
      const cb = Date.parse(String(b?.createdAt || '')) || 0;
      if (cb !== ca) return cb - ca;
      return String(a?.id || '').localeCompare(String(b?.id || ''));
    })[0] || null;
}

function groupWorkqueueDuplicateIssues(items) {
  const grouped = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    if (!item || WORKQUEUE_DUPLICATE_TERMINAL_STATUSES.has(String(item.status || '').trim())) continue;
    const key = getWorkqueueIssueKey(item);
    if (!key) continue;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  }

  return Array.from(grouped.entries())
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => {
      const keep = chooseWorkqueueDuplicateKeepItem(group);
      return {
        key,
        items: group,
        keep,
        remove: group.filter((item) => item?.id && item.id !== keep?.id)
      };
    })
    .filter((group) => group.remove.length > 0)
    .sort((a, b) => a.key.localeCompare(b.key));
}

function applyWorkqueueQuickFilters(items, quickFilters) {
  return getWorkqueueQuickFilterBreakdown(items, quickFilters).items;
}

function formatWorkqueueCountText(shown, total) {
  const shownNum = Number(shown) || 0;
  const totalNum = Number(total) || 0;
  const noun = shownNum === 1 ? 'item' : 'items';
  if (totalNum > 0 && shownNum !== totalNum) return `Showing ${shownNum} of ${totalNum} ${totalNum === 1 ? 'item' : 'items'}`;
  return `Showing ${shownNum} ${noun}`;
}

function formatWorkqueueHiddenBreakdown(hiddenCounts = {}) {
  const parts = [
    ['status', hiddenCounts.status],
    ['scope', hiddenCounts.scope],
    ['source', hiddenCounts.source],
    ['repo', hiddenCounts.repo],
    ['search', hiddenCounts.search]
  ]
    .map(([label, count]) => [label, Math.max(0, Number(count) || 0)])
    .filter(([, count]) => count > 0)
    .map(([label, count]) => `${label} ${count}`);
  return parts.length ? `hidden: ${parts.join(', ')}` : '';
}

function formatWorkqueueVisibleSummary(shown, total, hiddenCounts = {}) {
  const base = formatWorkqueueCountText(shown, total);
  const hidden = formatWorkqueueHiddenBreakdown(hiddenCounts);
  return hidden ? `${base} · ${hidden}` : base;
}

function getWorkqueueQuickFilterBreakdown(items, quickFilters) {
  let current = Array.isArray(items) ? items.slice() : [];
  const hidden = { source: 0, repo: 0, search: 0 };
  const sourceSet = new Set(Array.isArray(quickFilters?.sources) ? quickFilters.sources.map((x) => String(x || '').trim()).filter(Boolean) : []);
  const repoSet = new Set(Array.isArray(quickFilters?.repos) ? quickFilters.repos.map((x) => String(x || '').trim()).filter(Boolean) : []);
  const search = String(quickFilters?.search || '').trim().toLowerCase();

  if (sourceSet.size) {
    const next = current.filter((it) => sourceSet.has(getWorkqueueItemSource(it)));
    hidden.source = current.length - next.length;
    current = next;
  }
  if (repoSet.size) {
    const next = current.filter((it) => repoSet.has(getWorkqueueItemRepo(it)));
    hidden.repo = current.length - next.length;
    current = next;
  }
  if (search) {
    const next = current.filter((it) => {
      const haystack = [
        it?.id,
        it?.title,
        it?.instructions,
        it?.dedupeKey,
        it?.status,
        it?.claimedBy,
        getWorkqueueItemRepo(it),
        getWorkqueueItemSource(it)
      ].map((v) => String(v || '').toLowerCase()).join('\n');
      return haystack.includes(search);
    });
    hidden.search = current.length - next.length;
    current = next;
  }

  return { items: current, hidden };
}

function renderWorkqueueFilterSummaryForPane(pane, { shownCount, totalCount, hiddenCounts } = {}) {
  const root = pane?.elements?.thread?.querySelector?.('[data-wq-filter-summary]');
  if (!root) return;

  const queue = String(pane.workqueue?.queue || '').trim();
  const scope = pane.workqueue?.scopeFilter || 'all';
  const statuses = Array.isArray(pane.workqueue?.statusFilter) ? pane.workqueue.statusFilter.map((s) => String(s || '').trim()).filter(Boolean) : [];
  const quick = pane.workqueue?.quickFilters || {};
  const sources = Array.isArray(quick.sources) ? quick.sources.map((s) => String(s || '').trim()).filter(Boolean) : [];
  const repos = Array.isArray(quick.repos) ? quick.repos.map((s) => String(s || '').trim()).filter(Boolean) : [];
  const search = String(quick.search || '').trim();
  const hasFilters = !!queue || !!scope || statuses.length || sources.length || repos.length || !!search;

  root.innerHTML = '';
  root.hidden = !hasFilters;
  if (!hasFilters) return;

  const count = document.createElement('span');
  count.className = 'wq-filter-count';
  count.textContent = formatWorkqueueVisibleSummary(shownCount, totalCount, hiddenCounts);
  root.appendChild(count);

  const addToken = ({ label, value, title, action, removable = true }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wq-filter-token';
    btn.title = title || (removable ? `Remove ${label} filter` : label);
    btn.setAttribute('aria-label', btn.title);
    btn.disabled = !removable;
    btn.innerHTML = `<span class="wq-filter-token-label">${escapeHtml(label)}</span> <span>${escapeHtml(value)}</span>${removable ? ' <span aria-hidden="true">×</span>' : ''}`;
    if (removable && typeof action === 'function') btn.addEventListener('click', action);
    root.appendChild(btn);
  };

  if (queue) {
    addToken({
      label: 'Queue',
      value: queue,
      title: queue === 'dev-team' ? 'Queue target dev-team' : `Reset queue filter ${queue} to dev-team`,
      removable: queue !== 'dev-team',
      action: () => pane.workqueue?.setQueue?.('dev-team')
    });
  }
  addToken({
    label: 'Scope',
    value: formatWorkqueueScopeLabel(scope),
    title: `Reset scope filter ${formatWorkqueueScopeLabel(scope)} to All`,
    removable: scope !== 'all',
    action: () => pane.workqueue?.setScope?.('all')
  });
  for (const status of statuses) {
    addToken({
      label: 'Status',
      value: formatWorkqueueStatusLabel(status),
      title: `Remove status filter ${formatWorkqueueStatusLabel(status)}`,
      action: () => pane.workqueue?.applyStatuses?.(statuses.filter((s) => s !== status))
    });
  }
  for (const source of sources) {
    addToken({
      label: 'Source',
      value: formatWorkqueueSourceLabel(source),
      title: `Remove source filter ${formatWorkqueueSourceLabel(source)}`,
      action: () => pane.workqueue?.removeQuickFilter?.('source', source)
    });
  }
  for (const repo of repos) {
    addToken({
      label: 'Repo',
      value: repo,
      title: `Remove repo filter ${repo}`,
      action: () => pane.workqueue?.removeQuickFilter?.('repo', repo)
    });
  }
  if (search) {
    addToken({
      label: 'Search',
      value: search,
      title: `Clear search query ${search}`,
      action: () => pane.workqueue?.setQuickSearch?.('')
    });
  }

  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'secondary wq-clear-all-filters';
  clear.setAttribute('data-wq-clear-all-filters', '');
  clear.textContent = 'Clear all filters';
  clear.title = 'Clear status, scope, search, source, and repo filters. Queue target is preserved.';
  clear.addEventListener('click', () => pane.workqueue?.clearAllFilters?.());
  root.appendChild(clear);
}

function formatWorkqueueStatusSummary(items) {
  const counts = buildWorkqueueStatusCounts(items);
  return WORKQUEUE_STATUSES
    .filter((status) => Number(counts[status] || 0) > 0)
    .map((status) => `${formatWorkqueueStatusLabel(status)} ${counts[status]}`)
    .join(' · ');
}

function newestWorkqueueUpdatedAt(items) {
  let best = '';
  let bestMs = 0;
  for (const item of Array.isArray(items) ? items : []) {
    const raw = item?.updatedAt || item?.createdAt || '';
    const ms = Date.parse(String(raw));
    if (Number.isFinite(ms) && ms >= bestMs) {
      bestMs = ms;
      best = String(raw);
    }
  }
  return best;
}

function normalizeWorkqueueExactDuplicateText(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function getWorkqueueExactDuplicateKey(item) {
  if (!item) return '';
  const meta = item.meta && typeof item.meta === 'object' ? item.meta : {};
  const status = normalizeWorkqueueExactDuplicateText(item.status);
  const title = normalizeWorkqueueExactDuplicateText(formatWorkqueueIssueTitle(item) || item.title);
  if (!status || !title) return '';

  const dedupeKey = normalizeWorkqueueExactDuplicateText(meta.dedupeKey || item.dedupeKey);
  if (dedupeKey) return `dedupe:${dedupeKey}|title:${title}|status:${status}`;
  return `title:${title}|status:${status}`;
}

function chooseWorkqueueExactDuplicateRepresentative(items) {
  return (Array.isArray(items) ? items : [])
    .slice()
    .sort((a, b) => {
      const ua = Date.parse(String(a?.updatedAt || a?.createdAt || '')) || 0;
      const ub = Date.parse(String(b?.updatedAt || b?.createdAt || '')) || 0;
      if (ub !== ua) return ub - ua;
      const pr = Number(b?.priority || 0) - Number(a?.priority || 0);
      if (pr !== 0) return pr;
      const ca = Date.parse(String(a?.createdAt || '')) || 0;
      const cb = Date.parse(String(b?.createdAt || '')) || 0;
      if (cb !== ca) return cb - ca;
      return String(a?.id || '').localeCompare(String(b?.id || ''));
    })[0] || null;
}

function summarizeWorkqueueExactDuplicateRows(items) {
  const groups = new Map();
  const sourceEntries = (Array.isArray(items) ? items : []).map((item) => ({ kind: 'item', item }));
  for (const item of Array.isArray(items) ? items : []) {
    const key = getWorkqueueExactDuplicateKey(item);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  const emitted = new Set();
  const out = [];
  for (const entry of sourceEntries) {
    const item = entry.item;
    const key = getWorkqueueExactDuplicateKey(item);
    const groupItems = key ? groups.get(key) || [] : [];
    if (!key || groupItems.length <= 1) {
      out.push({ kind: 'item', item });
      continue;
    }
    if (emitted.has(key)) continue;
    emitted.add(key);
    const representative = chooseWorkqueueExactDuplicateRepresentative(groupItems) || item;
    out.push({
      kind: 'exact-duplicate',
      key,
      items: groupItems,
      representative,
      title: formatWorkqueueIssueTitle(representative),
      newestUpdatedAt: newestWorkqueueUpdatedAt(groupItems)
    });
  }
  return out;
}

function sortWorkqueueRowEntries(entries, { sortKey, sortDir } = {}) {
  const rows = Array.isArray(entries) ? entries : [];
  const sortable = rows.map((entry, index) => {
    const item = entry.kind === 'exact-duplicate' ? entry.representative : entry.item;
    return { ...(item || {}), __wqRowIndex: index };
  });
  return sortWorkqueueItems(sortable, { sortKey, sortDir })
    .map((item) => rows[Number(item?.__wqRowIndex)])
    .filter(Boolean);
}

function formatWorkqueueGroupDisplayKey(key) {
  const text = String(key || '');
  return text.replace(/^(?:issue|dedupe|title):/, '');
}

function chooseWorkqueueGroupRepresentative(key, items) {
  const rows = Array.isArray(items) ? items : [];
  if (String(key || '').startsWith('issue:')) {
    return rows.slice().sort((a, b) => {
      const updated = String(b?.updatedAt || '').localeCompare(String(a?.updatedAt || ''));
      if (updated !== 0) return updated;
      const created = String(b?.createdAt || '').localeCompare(String(a?.createdAt || ''));
      if (created !== 0) return created;
      return String(a?.id || '').localeCompare(String(b?.id || ''));
    })[0] || null;
  }
  return sortWorkqueueItems(rows, { sortKey: 'priority', sortDir: 'desc' })[0] || rows[0] || null;
}

function summarizeWorkqueueGroups(items) {
  const map = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    const key = getWorkqueueGroupIdentity(item);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }

  const groupedKeys = new Set();
  const groups = [];
  for (const [key, groupItems] of map.entries()) {
    if (groupItems.length <= 1) continue;
    groupedKeys.add(key);
    const representative = chooseWorkqueueGroupRepresentative(key, groupItems) || groupItems[0];
    groups.push({
      kind: 'group',
      key,
      displayKey: formatWorkqueueGroupDisplayKey(key),
      items: groupItems,
      representative,
      title: formatWorkqueueIssueTitle(representative),
      priority: Math.max(...groupItems.map((item) => Number(item?.priority || 0))),
      statusSummary: formatWorkqueueStatusSummary(groupItems),
      newestUpdatedAt: newestWorkqueueUpdatedAt(groupItems)
    });
  }

  const out = [];
  const emittedGroups = new Set();
  for (const item of Array.isArray(items) ? items : []) {
    const key = getWorkqueueGroupIdentity(item);
    if (key && groupedKeys.has(key)) {
      if (emittedGroups.has(key)) continue;
      const group = groups.find((entry) => entry.key === key);
      if (group) out.push(group);
      emittedGroups.add(key);
      continue;
    }
    out.push({ kind: 'item', item });
  }
  return out;
}

function normalizeWorkqueueGroupMode(value) {
  const s = String(value || '').trim().toLowerCase();
  if (s === 'rows' || s === 'grouped') return s;
  return 'auto';
}

function resolveWorkqueueGroupMode(value, itemCount, duplicateSummary) {
  const mode = normalizeWorkqueueGroupMode(value);
  if (mode === 'rows' || mode === 'grouped') return mode;
  if (Number(duplicateSummary?.density || 0) >= WORKQUEUE_CANONICAL_DENSITY_THRESHOLD) return 'grouped';
  return Number(itemCount || 0) > WORKQUEUE_GROUPED_AUTO_THRESHOLD ? 'grouped' : 'rows';
}

function appendWorkqueuePaneItemRow(pane, body, item, { child = false } = {}) {
  const row = document.createElement('button');
  row.type = 'button';
  row.className = child ? 'wq-row wq-row-child' : 'wq-row';
  if (item.id && item.id === pane.workqueue.selectedItemId) row.classList.add('selected');
  if (item.id) row.setAttribute('data-wq-item', item.id);

  const leaseMs = item.leaseUntil ? Number(item.leaseUntil) - Date.now() : NaN;
  const leaseLabel = item.leaseUntil ? fmtRemaining(leaseMs) : '';
  const status = String(item.status || '');
  const title = formatWorkqueueIssueTitle(item);
  row.title = title;
  row.setAttribute('aria-label', `Workqueue item: ${title}`);

  row.innerHTML = `
    <div class="wq-col title"><span class="wq-title-text" title="${escapeHtml(title)}">${escapeHtml(title)}</span></div>
    <div class="wq-col status"><span class="wq-badge wq-badge-${escapeHtml(status)}">${escapeHtml(status)}</span></div>
    <div class="wq-col prio mono">${escapeHtml(String(item.priority ?? ''))}</div>
    <div class="wq-col attempts mono">${escapeHtml(String(item.attempts ?? ''))}</div>
    <div class="wq-col claimedBy">${escapeHtml(String(item.claimedBy || ''))}</div>
    <div class="wq-col lease mono" data-lease-until="${escapeHtml(String(item.leaseUntil || ''))}">${escapeHtml(leaseLabel)}</div>
  `;

  row.addEventListener('click', () => {
    pane.workqueue.selectedItemId = item.id || null;
    renderWorkqueuePaneItems(pane);
    renderWorkqueuePaneInspect(pane, item);
  });

  body.appendChild(row);
  return row;
}

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

  const countsParams = new URLSearchParams();
  if (queue) countsParams.set('queue', queue);
  const countsUrl = `/api/workqueue/items${countsParams.toString() ? `?${countsParams.toString()}` : ''}`;

  const statusLine = pane.elements.thread.querySelector('[data-wq-statusline]');
  if (statusLine) statusLine.textContent = 'Loading...';

  try {
    const [res, countsRes] = await Promise.all([
      fetch(url, { credentials: 'include', cache: 'no-store' }),
      fetch(countsUrl, { credentials: 'include', cache: 'no-store' })
    ]);
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    let countItems = items;
    if (countsRes.ok) {
      const countsData = await countsRes.json().catch(() => ({}));
      if (Array.isArray(countsData.items)) countItems = countsData.items;
    }
    const previousSignature = pane.workqueue.itemsSignature || '';
    const nextSignature = JSON.stringify(items.map((it) => [
      it?.id || '',
      it?.status || '',
      it?.updatedAt || '',
      it?.title || ''
    ]));
    pane.workqueue.items = items;
    pane.workqueue.countItems = countItems;
    pane.workqueue.statusCounts = buildWorkqueueStatusCounts(filterWorkqueuePaneItemsByScope(pane, countItems));
    pane.workqueue.itemsSignature = nextSignature;
    if (previousSignature && previousSignature !== nextSignature) {
      markPaneUnread(pane, 1, 'workqueue');
    }
    if (typeof pane.workqueue.renderStatusMultiSelect === 'function') pane.workqueue.renderStatusMultiSelect();
    renderWorkqueuePaneItems(pane);
  } catch (err) {
    if (statusLine) statusLine.textContent = `Failed to load: ${String(err)}`;
  }
}

function filterWorkqueuePaneItemsByScope(pane, items) {
  const itemsRaw = Array.isArray(items) ? items : [];
  const scope = pane.workqueue?.scopeFilter || 'all';
  const activeTarget = String(pane.agentId || '').trim();
  const getOwner = (it) => String(it?.claimedBy || it?.assignee || it?.assignedTo || it?.agentId || '').trim();
  return itemsRaw.filter((it) => {
    const owner = getOwner(it);
    if (scope === 'unassigned') return !owner;
    if (scope === 'assigned') return !!activeTarget && owner === activeTarget;
    return true;
  });
}

function renderWorkqueueDuplicateHealthForPane(pane) {
  const root = pane?.elements?.thread?.querySelector?.('[data-wq-duplicate-health]');
  if (!root) return;

  const sourceItems = filterWorkqueuePaneItemsByScope(pane, pane.workqueue?.countItems || pane.workqueue?.items);
  const groups = groupWorkqueueDuplicateIssues(sourceItems);
  pane.workqueue.duplicateGroups = groups;

  const duplicateRows = groups.reduce((sum, group) => sum + group.remove.length, 0);
  if (!duplicateRows) {
    root.hidden = true;
    root.innerHTML = '';
    return;
  }

  const sampleKeys = groups.slice(0, 3).map((group) => group.key).join(', ');
  root.hidden = false;
  root.innerHTML = `
    <div class="wq-duplicate-summary">
      <strong>Duplicates:</strong>
      <span>${escapeHtml(String(duplicateRows))} row${duplicateRows === 1 ? '' : 's'} across ${escapeHtml(String(groups.length))} issue${groups.length === 1 ? '' : 's'}</span>
      <span class="hint">${escapeHtml(sampleKeys)}</span>
    </div>
    <button type="button" class="secondary danger" data-wq-clean-duplicates>Clean duplicates</button>
    <div class="hint" data-wq-duplicate-audit></div>
  `;

  root.querySelector('[data-wq-clean-duplicates]')?.addEventListener('click', () => cleanWorkqueueDuplicatesForPane(pane));
}

async function cleanWorkqueueDuplicatesForPane(pane) {
  const root = pane?.elements?.thread?.querySelector?.('[data-wq-duplicate-health]');
  const audit = root?.querySelector?.('[data-wq-duplicate-audit]');
  const groups = Array.isArray(pane?.workqueue?.duplicateGroups) ? pane.workqueue.duplicateGroups : [];
  const removeItems = groups.flatMap((group) => group.remove.map((item) => ({ item, key: group.key, keep: group.keep })));
  if (!removeItems.length) return;

  const sampleKeys = groups.slice(0, 5).map((group) => group.key);
  const ok = confirm(
    `Clean ${removeItems.length} duplicate workqueue row${removeItems.length === 1 ? '' : 's'} across ${groups.length} issue${groups.length === 1 ? '' : 's'}?\n\n` +
      `Keep rule: highest priority, then active status, then newest updatedAt, then newest createdAt, then lexical id.\n\n` +
      `Sample: ${sampleKeys.join(', ')}`
  );
  if (!ok) return;

  if (audit) audit.textContent = 'Cleaning duplicates...';
  const sampleText = sampleKeys.join(',');
  let removed = 0;
  for (const { item, key, keep } of removeItems) {
    try {
      await workqueueUpdateItem(item.id, {
        status: 'failed',
        lastError: `duplicate-cleanup:${key}`,
        lastNote: `duplicate cleanup archived; kept ${keep?.id || 'unknown'}; sampleKeys=${sampleText}`
      });
      removed += 1;
    } catch (err) {
      if (audit) audit.textContent = `Cleanup failed after ${removed}/${removeItems.length}: ${String(err)}`;
      return;
    }
  }

  const message = `Cleaned ${removed} duplicate row${removed === 1 ? '' : 's'}; sample keys: ${sampleKeys.join(', ')}`;
  if (audit) audit.textContent = message;
  addFeed('ok', 'workqueue', message);
  await fetchAndRenderWorkqueueItemsForPane(pane);
}

function renderWorkqueuePaneItems(pane) {
  const body = pane.elements?.thread?.querySelector('[data-wq-list-body]');
  const empty = pane.elements?.thread?.querySelector('[data-wq-empty]');
  if (!body) return;
  body.innerHTML = '';
  renderWorkqueueDuplicateHealthForPane(pane);

  const fetchedItems = Array.isArray(pane.workqueue?.items) ? pane.workqueue.items : [];
  const countItems = Array.isArray(pane.workqueue?.countItems) ? pane.workqueue.countItems : fetchedItems;
  const scopedItems = filterWorkqueuePaneItemsByScope(pane, fetchedItems);
  const quickResult = getWorkqueueQuickFilterBreakdown(scopedItems, pane.workqueue?.quickFilters);
  const filteredItems = quickResult.items;
  const items = sortWorkqueueItems(filteredItems, { sortKey: pane.workqueue?.sortKey, sortDir: pane.workqueue?.sortDir });
  renderWorkqueueAllScopeGuard(pane, items.length);
  const totalCount = Math.max(items.length, countItems.length);
  const hiddenCounts = {
    status: Math.max(0, countItems.length - fetchedItems.length),
    scope: Math.max(0, fetchedItems.length - scopedItems.length),
    ...quickResult.hidden
  };
  const statusLine = pane.elements?.thread?.querySelector('[data-wq-statusline]');
  if (statusLine) statusLine.textContent = formatWorkqueueVisibleSummary(items.length, totalCount, hiddenCounts);
  renderWorkqueueFilterSummaryForPane(pane, { shownCount: items.length, totalCount, hiddenCounts });
  const duplicateSummary = summarizeWorkqueueIssueDuplicateDensity(items);
  const groupMode = resolveWorkqueueGroupMode(pane.workqueue?.groupMode, items.length, duplicateSummary);
  const rows = groupMode === 'grouped'
    ? summarizeWorkqueueGroups(items)
    : sortWorkqueueRowEntries(summarizeWorkqueueExactDuplicateRows(items), { sortKey: pane.workqueue?.sortKey, sortDir: pane.workqueue?.sortDir });
  const renderLimit = Math.max(
    WORKQUEUE_PANE_INITIAL_RENDER_LIMIT,
    Number(pane.workqueue?.renderLimit || WORKQUEUE_PANE_INITIAL_RENDER_LIMIT)
  );
  const visibleRows = rows.slice(0, renderLimit);
  const visibleItems = visibleRows.flatMap((entry) => {
    if (entry.kind === 'group') return entry.items;
    if (entry.kind === 'exact-duplicate') return [entry.representative];
    return [entry.item];
  }).filter(Boolean);
  pane.workqueue.visibleItemIds = visibleItems.map((it) => it.id).filter(Boolean);

  if (pane.workqueue.keyboardMode && visibleItems.length && !pane.workqueue.selectedItemId) {
    pane.workqueue.selectedItemId = visibleItems[0].id || null;
  }

  if (empty) {
    const hasItems = items.length > 0;
    empty.hidden = hasItems;
    if (!hasItems) {
      const queue = String(pane.workqueue?.queue || '').trim() || 'dev-team';
      const statuses = Array.isArray(pane.workqueue?.statusFilter) ? pane.workqueue.statusFilter : [];
      const statusLabel = statuses.length ? statuses.join(', ') : 'default';
      const scopeLabel = pane.workqueue?.scopeFilter || 'all';
      const filtersHidingAll = totalCount > 0;
      const title = filtersHidingAll ? 'No items match current filters.' : 'No items in this queue.';
      const hiddenSummary = formatWorkqueueHiddenBreakdown(hiddenCounts);
      empty.innerHTML = `
        <div class="empty-state">
          <div style="font-weight:700; margin-bottom:6px;">${escapeHtml(title)}</div>
          <div class="hint">Queue: <span class="mono">${escapeHtml(queue)}</span> · Status: <span class="mono">${escapeHtml(statusLabel)}</span> · Scope: <span class="mono">${escapeHtml(scopeLabel)}</span></div>
          ${filtersHidingAll ? `<div class="hint" style="margin-top:6px;">Showing 0 of <span class="mono">${escapeHtml(String(totalCount))}</span> items${hiddenSummary ? ` · ${escapeHtml(hiddenSummary)}` : ''}.</div>` : ''}
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

  for (const entry of visibleRows) {
    if (entry.kind === 'item') {
      appendWorkqueuePaneItemRow(pane, body, entry.item);
      continue;
    }

    const isExactDuplicate = entry.kind === 'exact-duplicate';
    const representative = isExactDuplicate ? entry.representative : null;
    const expanded = pane.workqueue.expandedGroupKeys?.has(entry.key);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = isExactDuplicate ? 'wq-row wq-group-row wq-exact-duplicate-row' : 'wq-row wq-group-row';
    row.setAttribute(isExactDuplicate ? 'data-wq-duplicate-row' : 'data-wq-group-row', entry.displayKey || entry.key);
    if (isExactDuplicate && representative?.id) {
      row.setAttribute('data-wq-item', representative.id);
      if (representative.id === pane.workqueue.selectedItemId) row.classList.add('selected');
    }
    row.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    row.title = entry.title;
    row.innerHTML = `
      <div class="wq-col title">
        <span class="wq-group-caret">${expanded ? '-' : '+'}</span>
        <span class="wq-title-text" title="${escapeHtml(entry.title)}">${escapeHtml(entry.title)}</span>
        <span class="wq-group-count">${isExactDuplicate ? `x${escapeHtml(String(entry.items.length))}` : `${escapeHtml(String(entry.items.length))} rows`}</span>
      </div>
      <div class="wq-col status">${isExactDuplicate ? `<span class="wq-badge wq-badge-${escapeHtml(String(representative?.status || ''))}">${escapeHtml(String(representative?.status || ''))}</span>` : escapeHtml(entry.statusSummary || '')}</div>
      <div class="wq-col prio mono">${escapeHtml(String(isExactDuplicate ? representative?.priority ?? '' : entry.priority ?? ''))}</div>
      <div class="wq-col attempts mono">${escapeHtml(String(isExactDuplicate ? representative?.attempts ?? '' : entry.items.length))}</div>
      <div class="wq-col claimedBy">${escapeHtml(String(isExactDuplicate ? representative?.claimedBy || '' : 'grouped'))}</div>
      <div class="wq-col lease mono">${escapeHtml(entry.newestUpdatedAt || '')}</div>
    `;
    row.addEventListener('click', () => {
      if (isExactDuplicate && representative) {
        pane.workqueue.selectedItemId = representative.id || null;
        renderWorkqueuePaneInspect(pane, representative);
      }
      if (!pane.workqueue.expandedGroupKeys) pane.workqueue.expandedGroupKeys = new Set();
      if (pane.workqueue.expandedGroupKeys.has(entry.key)) pane.workqueue.expandedGroupKeys.delete(entry.key);
      else pane.workqueue.expandedGroupKeys.add(entry.key);
      renderWorkqueuePaneItems(pane);
    });
    body.appendChild(row);

    if (expanded) {
      for (const item of entry.items) appendWorkqueuePaneItemRow(pane, body, item, { child: true });
    }
  }

  const list = body.closest('.wq-list');
  let more = list?.querySelector('[data-wq-load-more]');
  if (more) more.remove();
  if (rows.length > visibleRows.length && list) {
    more = document.createElement('button');
    more.type = 'button';
    more.className = 'secondary wq-load-more';
    more.setAttribute('data-wq-load-more', '');
    more.textContent = `Load more (${visibleRows.length}/${rows.length})`;
    more.addEventListener('click', () => {
      pane.workqueue.renderLimit = visibleRows.length + WORKQUEUE_PANE_RENDER_CHUNK_SIZE;
      renderWorkqueuePaneItems(pane);
    });
    list.insertBefore(more, empty || null);
  }

  // Keep inspect in sync if selection vanished.
  if (pane.workqueue.selectedItemId && !items.some((it) => it.id === pane.workqueue.selectedItemId)) {
    pane.workqueue.selectedItemId = null;
    renderWorkqueuePaneInspect(pane, null);
  }
}

function renderWorkqueueAllScopeGuard(pane, visibleCount) {
  const root = pane?.elements?.thread?.querySelector?.('[data-wq-all-scope-guard]');
  if (!root) return;

  const scope = normalizeWorkqueueScope(pane?.workqueue?.scopeFilter || 'all');
  const threshold = getWorkqueueAllScopeGuardThreshold();
  const count = Number(visibleCount || 0);
  const guardKey = `${scope}:${count}:${threshold}`;
  const shouldShow = scope === 'all' && count > threshold && !pane.workqueue?.allScopeGuardDismissed;

  root.hidden = !shouldShow;
  if (!shouldShow) {
    root.innerHTML = '';
    return;
  }

  if (pane.workqueue.allScopeGuardShownKey !== guardKey) {
    pane.workqueue.allScopeGuardShownKey = guardKey;
    addFeed('event', 'workqueue.guardrail', `all-scope shown count=${count} threshold=${threshold}`);
  }

  root.innerHTML = `
    <span class="wq-all-scope-guard-text">Viewing all items (${escapeHtml(String(count))}). Narrow scope?</span>
    <button type="button" class="wq-scope-btn" data-wq-downscope="assigned">Assigned to active target</button>
    <button type="button" class="wq-scope-btn" data-wq-downscope="unassigned">Unassigned</button>
    <button type="button" class="wq-scope-btn wq-guard-dismiss" data-wq-guard-dismiss aria-label="Dismiss all scope guardrail">Dismiss</button>
  `;
  root.querySelectorAll('[data-wq-downscope]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const scopeKey = btn.getAttribute('data-wq-downscope') || '';
      addFeed('event', 'workqueue.guardrail', `all-scope action=${scopeKey} count=${count} threshold=${threshold}`);
      pane?.elements?.thread?.querySelector?.(`[data-wq-scope="${scopeKey}"]`)?.click?.();
    });
  });
  root.querySelector('[data-wq-guard-dismiss]')?.addEventListener('click', () => {
    pane.workqueue.allScopeGuardDismissed = true;
    addFeed('event', 'workqueue.guardrail', `all-scope dismissed count=${count} threshold=${threshold}`);
    renderWorkqueueAllScopeGuard(pane, count);
  });
}

function selectWorkqueuePaneItemByDelta(pane, delta) {
  const ids = Array.isArray(pane?.workqueue?.visibleItemIds) ? pane.workqueue.visibleItemIds : [];
  if (!ids.length) return;
  const current = pane.workqueue.selectedItemId;
  const currentIndex = Math.max(0, ids.indexOf(current));
  const nextIndex = Math.max(0, Math.min(ids.length - 1, currentIndex + delta));
  pane.workqueue.selectedItemId = ids[nextIndex] || null;
  const selected = (pane.workqueue.items || []).find((it) => it.id === pane.workqueue.selectedItemId) || null;
  renderWorkqueuePaneItems(pane);
  renderWorkqueuePaneInspect(pane, selected);
  const row = pane.elements?.thread?.querySelector?.(`[data-wq-item="${CSS.escape(String(pane.workqueue.selectedItemId || ''))}"]`);
  row?.focus?.({ preventScroll: true });
  row?.scrollIntoView?.({ block: 'nearest' });
}

async function setWorkqueuePaneSelectedStatus(pane, status) {
  const itemId = pane?.workqueue?.selectedItemId;
  if (!itemId) return;
  try {
    const res = await fetch('/api/workqueue/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ itemId, patch: { status } })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) throw new Error(data?.error || String(res.status));
    const ix = Array.isArray(pane.workqueue.items) ? pane.workqueue.items.findIndex((it) => it.id === itemId) : -1;
    if (ix >= 0) pane.workqueue.items[ix] = data.item;
    addFeed('ok', 'workqueue', `Updated ${itemId} to ${status}`);
    renderWorkqueuePaneItems(pane);
    renderWorkqueuePaneInspect(pane, data.item);
    const row = pane.elements?.thread?.querySelector?.(`[data-wq-item="${CSS.escape(String(itemId))}"]`);
    row?.focus?.({ preventScroll: true });
  } catch (err) {
    addFeed('err', 'workqueue', `status update failed: ${String(err)}`);
  }
}

function handleWorkqueuePaneKeyboard(event, pane) {
  if (!pane?.workqueue?.keyboardMode) return false;
  if (isTypingContext(event.target) || isAnyOverlayOpen()) return false;
  if (event.metaKey || event.ctrlKey || event.altKey) return false;

  const key = String(event.key || '').toLowerCase();
  const statusByKey = { '1': 'ready', '2': 'in_progress', '3': 'blocked', '4': 'done' };
  if (key === 'j' || key === 'arrowdown') {
    event.preventDefault();
    selectWorkqueuePaneItemByDelta(pane, 1);
    return true;
  }
  if (key === 'k' || key === 'arrowup') {
    event.preventDefault();
    selectWorkqueuePaneItemByDelta(pane, -1);
    return true;
  }
  if (key === 'enter') {
    event.preventDefault();
    const selected = (pane.workqueue.items || []).find((it) => it.id === pane.workqueue.selectedItemId) || null;
    renderWorkqueuePaneInspect(pane, selected);
    pane.elements?.thread?.querySelector?.('[data-wq-inspect]')?.scrollIntoView?.({ block: 'nearest' });
    return true;
  }
  if (key === 'e') {
    event.preventDefault();
    const selected = (pane.workqueue.items || []).find((it) => it.id === pane.workqueue.selectedItemId) || null;
    if (selected) workqueueEditItem(selected);
    return true;
  }
  if (statusByKey[key]) {
    event.preventDefault();
    setWorkqueuePaneSelectedStatus(pane, statusByKey[key]);
    return true;
  }
  return false;
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
      <div class="wq-inspect-pre">${escapeHtml(formatWorkqueueIssueTitle(item))}</div>
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
    const assignLabel = 'Queued as Unassigned';
    setWorkqueueActionStatus(item && item._deduped ? `Deduped (already exists): ${item.id} (${assignLabel})` : assignLabel);

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
const ADMIN_LAYOUT_LOCK_KEY = 'clawnsole.admin.layout.lock.v1';
// Layout is inferred from pane count; no manual layout toggle.
const ADMIN_LAYOUT_MODE_KEY = 'clawnsole.admin.layoutMode';
const ADMIN_DEFAULT_AGENT_KEY = 'clawnsole.admin.agentId';
const WORKQUEUE_SCOPE_PREF_KEY = 'clawnsole.admin.workqueue.scope.v1';

function normalizeWorkqueueScope(scope) {
  return scope === 'assigned' || scope === 'unassigned' ? scope : 'all';
}

function getDefaultWorkqueueScope() {
  // Low-noise triage default: focus on unassigned work first.
  return normalizeWorkqueueScope(storage.get(WORKQUEUE_SCOPE_PREF_KEY, 'unassigned'));
}

function getDefaultWorkqueueScopeForTarget(agentId) {
  const target = typeof agentId === 'string' ? agentId.trim() : '';
  return target && target !== 'main' ? 'assigned' : getDefaultWorkqueueScope();
}

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
  if (role === 'assistant' && !streaming) {
    markPaneUnread(pane, 1, 'chat');
  }
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
  if (done) {
    markPaneUnread(pane, 1, 'chat');
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
      refreshPaneDraftState(pane);
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
  refreshPaneDraftState(pane);
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
  refreshPaneDraftState(pane);
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

function paneHasUnsentDraft(pane) {
  if (!pane || pane.kind !== 'chat') return false;
  return Boolean(String(pane.elements?.input?.value || '').trim());
}

function paneHasActiveRun(pane) {
  if (!pane || pane.kind !== 'chat') return false;
  return Boolean(
    pane.thinking?.active ||
      pane.activeRunId ||
      (pane.chat?.runs && pane.chat.runs.size > 0) ||
      pane.abortState?.active ||
      pane.inFlight ||
      pane.pendingSend ||
      (Array.isArray(pane.outbox) && pane.outbox.length > 0)
  );
}

function paneRenderStopControl(pane) {
  const btn = pane?.elements?.stopBtn;
  if (!btn) return;
  const visible = Boolean(
    uiState.authed &&
      pane.connected &&
      (pane.thinking?.active || (pane.chat?.runs && pane.chat.runs.size > 0) || (pane.abortState && pane.abortState.active)
    )
  );
  btn.hidden = !visible;

  const isCanceling = Boolean(pane.abortState && pane.abortState.active);
  btn.disabled = !visible || isCanceling;
  btn.setAttribute('aria-label', isCanceling ? 'Canceling…' : 'Stop generating');
}

function paneRecentRunId(pane) {
  if (!pane?.chat?.runs) return null;
  let latest = null;
  for (const key of pane.chat.runs.keys()) {
    latest = key;
  }
  return latest;
}

function paneFinishCanceledRun(pane, { runId = null, resetSession = false, fallbackText = '' } = {}) {
  if (!pane?.abortState) return;
  if (pane.abortState.finished) return;
  pane.abortState.finished = true;

  if (pane.abortState.timer) {
    clearTimeout(pane.abortState.timer);
    pane.abortState.timer = null;
  }

  const targetRunId = runId || pane.abortState.targetRunId || pane.activeRunId;
  const rid = targetRunId;
  if (rid) {
    try {
      const entry = pane.chat?.runs?.get(rid);
      const current = entry?.body?.textContent || '';
      const nextText = current ? `${current}\n\n${fallbackText || '_(canceled)_'}` : `${fallbackText || '_(canceled)_'}`;
      paneUpdateChatRun(pane, rid, nextText, true);
    } catch {
      paneAddChatMessage(pane, {
        role: 'assistant',
        text: fallbackText || '_Canceled._',
        persist: true,
        state: 'canceled',
        metaLabel: `${paneAssistantLabel(pane)} · Canceled`
      });
    }
    pane.abortState.canceledRunIds.add(String(rid));
  } else {
    paneAddChatMessage(pane, {
      role: 'assistant',
      text: fallbackText || '_Canceled._',
      persist: true,
      state: 'canceled',
      metaLabel: `${paneAssistantLabel(pane)} · Canceled`
    });
  }

  paneStopThinking(pane);
  pane.activeRunId = null;

  // Stop processing the active queue item and allow next messages to flow.
  pane.pendingSend = null;
  pane.inFlight = null;
  panePumpOutbox(pane);

  pane.abortState.targetRunId = null;
  pane.abortState.active = false;
  if (resetSession) {
    try {
      pane.client.request('sessions.reset', { key: pane.sessionKey() });
    } catch {}
  }
  paneRenderStopControl(pane);
}

function paneIsAbortCanceledEvent(payload = {}) {
  const state = String(payload.state || '').toLowerCase();
  if (state !== 'error') return false;
  const text = String(payload.errorMessage || '').toLowerCase();
  return ['cancel', 'canceled', 'cancelled', 'aborted', 'interrupt'].some((needle) => text.includes(needle));
}

async function paneAbortRun(pane) {
  if (!pane || !uiState.authed || !pane.connected) return;
  if (pane.abortState && pane.abortState.active) return;

  pane.abortState.active = true;
  pane.abortState.finished = false;
  pane.abortState.requestedAt = Date.now();
  pane.abortState.targetRunId = pane.activeRunId || paneRecentRunId(pane) || null;
  paneRenderStopControl(pane);

  const sessionKey = pane.sessionKey();
  const runId = pane.abortState.targetRunId;

  // If we don't get a terminal event quickly, reset the session and force a canceled marker locally.
  if (pane.abortState.timer) {
    clearTimeout(pane.abortState.timer);
    pane.abortState.timer = null;
  }
  pane.abortState.timer = setTimeout(() => {
    paneFinishCanceledRun(pane, { runId, resetSession: true, fallbackText: '_(canceled)_' });
  }, 2000);

  try {
    await pane.client.request('chat.abort', { sessionKey, runId: runId || undefined });
  } catch (err) {
    addFeed('err', 'chat.abort', String(err));
    paneFinishCanceledRun(pane, { runId, resetSession: true, fallbackText: '_(canceled)_' });
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
    refreshPaneDraftState(pane);
    addFeed('event', 'chat', `cleared local history (${pane.sessionKey()})`);
    return;
  }
  if (command === '/new') {
    const key = pane.sessionKey();
    paneClearChatHistory(pane, { wipeStorage: true });
    pane.elements.input.value = '';
    paneUpdateCommandHints(pane);
    refreshPaneDraftState(pane);
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
  refreshPaneDraftState(pane);
}

function handleGatewayFrame(pane, data) {
  pulse.eventCount += 1;
  pulse.lastEvent = data?.event || data?.method || data?.type || 'event';
  spawnPulse(Math.min(2, 0.5 + pulse.eventRate / 2));

  if (data?.type !== 'event') return;

  // Any agent-scoped gateway event counts as a heartbeat for triage freshness.
  if (pane?.agentId) {
    markAgentSeen(pane.agentId);
  }

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
    const abortedRun = runId && pane.abortState?.canceledRunIds?.has(String(runId));
    if (abortedRun) {
      pane.pendingSend = null;
      pane.inFlight = null;
      panePumpOutbox(pane);
      paneStopThinking(pane);
      paneRenderStopControl(pane);
      return;
    }
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
      const shouldMarkCanceled =
        pane.abortState?.active &&
        (Boolean(!pane.abortState.targetRunId || !runId || String(pane.abortState.targetRunId) === String(runId)) && paneIsAbortCanceledEvent(payload));

      if (shouldMarkCanceled) {
        paneFinishCanceledRun(pane, {
          runId,
          resetSession: false,
          fallbackText: '_(canceled)_'
        });
        return;
      }

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
      renderPaneManager();
      paneSetChatEnabled(pane);
    },
    onFrame: (data) => handleGatewayFrame(pane, data),
    onConnected: () => {
      pane.connected = true;
      if (pane?.agentId) markAgentSeen(pane.agentId);
      if (pane.elements.root) pane.elements.root.dataset.connected = 'true';
      paneSetChatEnabled(pane);
      updateGlobalStatus();
      updateConnectionControls();
      renderPaneManager();
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
      renderPaneManager();
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

function paneHeaderLetter(pane) {
  try {
    const idx = paneManager?.panes?.indexOf?.(pane) ?? -1;
    return idx >= 0 ? String.fromCharCode(65 + (idx % 26)) : '?';
  } catch {
    return '?';
  }
}

function shouldShowPaneShortcutBadges() {
  return paneShortcutBadgesAltHeld || isOverlayElementOpen(globalElements.shortcutsModal);
}

function updatePaneShortcutBadges() {
  const visible = shouldShowPaneShortcutBadges();
  (paneManager?.panes || []).forEach((pane, idx) => {
    const badge = pane?.elements?.indexBadge;
    if (!badge) return;
    const shortcutIndex = idx + 1;
    const supported = shortcutIndex >= 1 && shortcutIndex <= 9;
    badge.hidden = !visible;
    badge.classList.toggle('is-visible', visible);
    badge.classList.toggle('is-excluded', visible && !supported);
    badge.textContent = supported ? String(shortcutIndex) : '–';
    badge.setAttribute('aria-hidden', 'true');
    badge.title = supported
      ? `Alt/Option+${shortcutIndex} focuses this pane`
      : 'No direct number shortcut for this pane';
  });
}

function renderPaneIdentity(pane) {
  if (!pane?.elements?.name) return;
  const letter = paneHeaderLetter(pane);
  const type = paneLabel(pane);
  const target = paneDisplayTargetLabel(pane);
  const nickname = paneNickname(pane);
  const unread = paneUnreadCount(pane);
  const draft = paneHasDraftChanges(pane);
  const identity = `${letter} ${type} · ${target}${nickname ? ` · ${nickname}` : ''}${unread > 0 ? ` • ${unread} unread` : ''}${draft ? ' • unsent draft' : ''}`;
  pane.elements.name.title = paneIdentityLabel(pane, { includeUnread: false });
  pane.elements.name.setAttribute('aria-label', identity);
  if (pane.elements.nameToken && pane.elements.nameTarget) {
    pane.elements.nameToken.textContent = `${letter} ${type}`;
    pane.elements.nameTarget.textContent = ` · ${target}${nickname ? ` · ${nickname}` : ''}${unread > 0 ? ` • ${unread} unread` : ''}${draft ? ' • unsent draft' : ''}`;
  } else {
    pane.elements.name.textContent = identity;
  }
  renderPanePairCue(pane);
  renderActivePaneState();
  if (pane.elements.nicknameBtn) {
    pane.elements.nicknameBtn.classList.toggle('has-nickname', !!nickname);
    pane.elements.nicknameBtn.title = nickname ? `Rename pane nickname: ${nickname}` : 'Set pane nickname';
    pane.elements.nicknameBtn.setAttribute('aria-label', nickname ? `Rename pane nickname: ${nickname}` : 'Set pane nickname');
  }
  const activeKey = focusedPaneKey() || paneMruOrder()[0] || '';
  if (activeKey && String(pane.key || '') === activeKey) updateBrowserTitle(pane);
}

function paneSetHeaderTarget(pane, { label, value, ariaLabel, onClick } = {}) {
  if (!pane?.elements) return;
  const { targetLabel, agentButton, agentLabel, agentSelect, agentWarning, destinationValue } = pane.elements;

  if (targetLabel && typeof label === 'string') targetLabel.textContent = label;
  if (agentLabel && typeof value === 'string') agentLabel.textContent = value;
  if (destinationValue && typeof value === 'string') destinationValue.textContent = value;

  // Non-chat panes use the pill button as a "focus/chooser" affordance.
  if (agentSelect) agentSelect.hidden = true;
  if (agentWarning) agentWarning.hidden = true;

  if (agentButton) {
    if (typeof ariaLabel === 'string' && ariaLabel.trim()) agentButton.setAttribute('aria-label', ariaLabel);

    // Replace prior handler (chat panes attach a chooser later).
    try {
      if (agentButton._paneTargetHandler) agentButton.removeEventListener('click', agentButton._paneTargetHandler);
    } catch {}

    if (typeof onClick === 'function') {
      const handler = (e) => {
        try {
          e.preventDefault();
          e.stopPropagation();
        } catch {}
        onClick();
      };
      agentButton._paneTargetHandler = handler;
      agentButton.addEventListener('click', handler);
    }
  }

  if (paneManager?.panes?.includes?.(pane)) paneManager.updatePaneLabels();
  else renderPaneIdentity(pane);
}

function renderPaneAgentIdentity(pane) {
  if (!pane || pane.role !== 'admin' || pane.kind !== 'chat') return;
  const elements = pane.elements;
  if (!elements) return;

  const raw = typeof pane.agentId === 'string' ? pane.agentId.trim() : '';
  const hasSelection = Boolean(raw);

  const agentId = hasSelection ? normalizeAgentId(raw) : '';
  const known = !hasSelection ? true : uiState.agents.length === 0 ? true : agentIdExists(agentId);
  const agent = hasSelection ? getAgentRecord(agentId) : null;

  // Keep this short; the chooser shows full labels/ids.
  const displayText = hasSelection ? formatAgentLabel(agent, { includeId: false }) : 'Pick agent…';

  if (elements.targetLabel) {
    elements.targetLabel.textContent = 'Agent';
  }

  if (elements.agentLabel) {
    elements.agentLabel.textContent = displayText;
  }

  // Make the control self-describing for screen readers and reduce mixed-pane mistakes.
  if (elements.agentButton) {
    elements.agentButton.setAttribute('aria-label', `Change agent (current: ${displayText})`);
  }

  if (elements.root) {
    elements.root.dataset.agentMissing = known ? 'false' : 'true';
  }

  if (elements.agentWarning) {
    if (!hasSelection || known) {
      elements.agentWarning.hidden = true;
      elements.agentWarning.textContent = '';
    } else {
      elements.agentWarning.hidden = false;
      elements.agentWarning.textContent = `Selected agent “${agentId}” is unavailable — choose a replacement.`;
    }
  }

  paneSetDestinationStrip(pane);
  renderPaneIdentity(pane);
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

function paneHasDraftChanges(pane) {
  if (!pane?.elements) return false;
  const draftText = String(pane.elements.input?.value || '').trim();
  const hasAttachments = Array.isArray(pane.attachments?.files) && pane.attachments.files.length > 0;
  return Boolean(draftText || hasAttachments);
}

function anyPaneHasDraftChanges(panes) {
  return (Array.isArray(panes) ? panes : []).some((pane) => pane?.kind === 'chat' && paneHasDraftChanges(pane));
}

function paneSetDestinationStrip(pane) {
  const strip = pane?.elements?.destinationStrip;
  const valueEl = pane?.elements?.destinationValue;
  if (!strip || !valueEl) return;
  if (pane.kind !== 'chat' || pane.role !== 'admin') {
    strip.hidden = true;
    return;
  }
  strip.hidden = false;
  const raw = typeof pane.agentId === 'string' ? pane.agentId.trim() : '';
  const hasSelection = Boolean(raw);
  const agentId = hasSelection ? normalizeAgentId(raw) : '';
  const agent = hasSelection ? getAgentRecord(agentId) : null;
  const displayText = hasSelection ? formatAgentLabel(agent, { includeId: false }) : 'Pick agent…';
  valueEl.textContent = displayText;
}

function paneSetAgent(pane, nextAgentId, { requireDraftConfirm = true, syncFromPaneKey = '' } = {}) {
  if (pane.role !== 'admin') return;
  const next = normalizeAgentId(nextAgentId);
  if (next === pane.agentId) return;
  const previous = pane.agentId;

  if (requireDraftConfirm && pane.kind === 'chat' && paneHasDraftChanges(pane)) {
    const nextAgent = getAgentRecord(next);
    const nextLabel = formatAgentLabel(nextAgent, { includeId: false }) || next;
    const ok = window.confirm(`Switch destination to “${nextLabel}”?\n\nYou have an unsent draft/attachment. Switching destination will clear this pane's draft and message history.`);
    if (!ok) return;
  }

  pane.agentId = next;
  markAgentSeen(next);
  if (pane.kind === 'chat') {
    storage.set(ADMIN_DEFAULT_AGENT_KEY, next);
  }
  try {
    renderAgentOptions(pane.elements.agentSelect, next);
    if (pane.elements.agentSelect) pane.elements.agentSelect.value = next;
  } catch {}

  if (pane.kind === 'chat') {
    renderPaneAgentIdentity(pane);
    pane.attachments.files = [];
    paneRenderAttachments(pane);
    paneStopThinking(pane);
    paneClearChatHistory(pane, { wipeStorage: false });
    paneRestoreChatHistory(pane);
    paneSetChatEnabled(pane);
  } else {
    renderPaneIdentity(pane);
    renderPaneTargetLockChip(pane);
    if (pane.kind === 'workqueue') {
      renderWorkqueuePaneItems(pane);
    }
  }

  paneManager.persistAdminPanes();
  if (!syncFromPaneKey || syncFromPaneKey !== pane.key) {
    syncPairedPaneTarget(pane, next, { previousAgentId: previous });
  }
  if (pane.kind === 'chat' && pane.connected) {
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

function createPane({ key, role, kind = 'chat', agentId, queue, statusFilter, scopeFilter, quickFilters, groupMode, sortKey, sortDir, cronAgentId, nickname, pairedTargetLock = false, closable = true } = {}) {
  const template = globalElements.paneTemplate;
  const root = template.content.firstElementChild.cloneNode(true);
  root.tabIndex = -1;
  const elements = {
    root,
    header: root.querySelector('.pane-header'),
    name: root.querySelector('[data-pane-name]'),
    nameToken: root.querySelector('[data-pane-name-token]'),
    nameTarget: root.querySelector('[data-pane-name-target]'),
    indexBadge: root.querySelector('[data-pane-index-badge]'),
    nicknameBtn: root.querySelector('[data-pane-nickname]'),
    typePill: root.querySelector('[data-pane-type-pill]'),
    pairCue: root.querySelector('[data-pane-pair-cue]'),
    typeIcon: root.querySelector('[data-pane-type-icon]'),
    typeText: root.querySelector('[data-pane-type-text]'),
    agentSelect: root.querySelector('[data-pane-agent-select]'),
    agentWrap: root.querySelector('[data-pane-agent-wrap]') || root.querySelector('.pane-agent'),
    targetLabel: root.querySelector('[data-pane-target-label]') || root.querySelector('.agent-label'),
    agentButton: root.querySelector('[data-pane-agent-button]'),
    agentLabel: root.querySelector('[data-pane-agent-label]'),
    agentWarning: root.querySelector('[data-pane-agent-warning]'),
    agentPill: root.querySelector('[data-pane-agent-pill]'),
    status: root.querySelector('[data-pane-status]'),
    draftBadge: root.querySelector('[data-pane-draft-badge]'),
    activityBadge: root.querySelector('[data-pane-activity-badge]'),
    helpDetails: root.querySelector('[data-pane-help]'),
    helpPopover: root.querySelector('[data-pane-help-popover]'),
    closeBtn: root.querySelector('[data-pane-close]'),
    thread: root.querySelector('[data-pane-thread]'),
    scrollDownBtn: root.querySelector('[data-pane-scroll-down]'),
    inputRow: root.querySelector('.chat-input-row'),
    destinationStrip: root.querySelector('[data-pane-destination-strip]'),
    destinationButton: root.querySelector('[data-pane-destination-button]'),
    destinationValue: root.querySelector('[data-pane-destination-value]'),
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
      statusFilter: Array.isArray(statusFilter) ? statusFilter : ['ready', 'pending', 'blocked', 'claimed', 'in_progress'],
      scopeFilter: normalizeWorkqueueScope(scopeFilter ?? getDefaultWorkqueueScopeForTarget(agentId)),
      quickFilters: {
        sources: Array.isArray(quickFilters?.sources) ? quickFilters.sources.map((s) => String(s || '').trim()).filter(Boolean) : [],
        repos: Array.isArray(quickFilters?.repos) ? quickFilters.repos.map((s) => String(s || '').trim()).filter(Boolean) : [],
        search: String(quickFilters?.search || '').trim()
      },
      statusCounts: Object.fromEntries(WORKQUEUE_STATUSES.map((s) => [s, 0])),
      items: [],
      countItems: [],
      selectedItemId: null,
      expandedGroupKeys: new Set(),
      groupMode: normalizeWorkqueueGroupMode(groupMode),
      visibleItemIds: [],
      keyboardMode: false,
      renderLimit: WORKQUEUE_PANE_INITIAL_RENDER_LIMIT,
      sortKey: typeof sortKey === 'string' && sortKey.trim() ? sortKey.trim() : 'priority',
      sortDir: sortDir === 'asc' ? 'asc' : 'desc'
    },
    cronAgentId: typeof cronAgentId === 'string' ? cronAgentId.trim() : '',
    nickname: normalizePaneNickname(nickname),
    connected: false,
    statusState: 'disconnected',
    statusMeta: '',
    elements,
    chat: { runs: new Map(), history: [] },
    unreadCount: 0,
    unreadKind: '',
    pairedTargetLock: !!pairedTargetLock,
    scroll: { pinned: true },
    thinking: { active: false, timer: null, dotsTimer: null, bubble: null },
    activeRunId: null,
    abortState: { active: false, requestedAt: 0, targetRunId: null, timer: null, finished: false, canceledRunIds: new Set() },
    attachments: { files: [] },
    pendingSend: null,
    catchUp: { active: false, attemptsLeft: 0, timer: null },
    outbox: [],
    inFlight: null,
    sendGuard: null,
    chatKey: () => computeChatKey({ role: pane.role, agentId: pane.agentId }),
    legacySessionKey: () => computeLegacySessionKey({ role: pane.role, agentId: pane.agentId }),
    sessionKey: () => computeSessionKey({ role: pane.role, agentId: pane.agentId, paneKey: pane.key }),
    onConnectedHook: null,
    client: null
  };

  // Mark pane kind on root for CSS + debugging.
  try {
    elements.root.dataset.paneKey = pane.key;
    elements.root.dataset.paneKind = pane.kind;
    elements.root.dataset.paneAccentKind = pane.kind;
    elements.root.classList.add(`pane-kind-${pane.kind}`);
  } catch {}

  elements.root.addEventListener('click', () => notePaneFocused(pane));
  elements.header?.addEventListener('mouseenter', () => setPanePairReveal(pane, true));
  elements.header?.addEventListener('mouseleave', () => setPanePairReveal(pane, false));
  elements.header?.addEventListener('focusin', () => setPanePairReveal(pane, true));
  elements.header?.addEventListener('focusout', () => setPanePairReveal(pane, false));
  elements.nicknameBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    promptPaneNickname(pane);
  });
  elements.agentPill?.addEventListener('click', () => paneToggleTargetLock(pane));
  renderPaneTargetLockChip(pane);

  // Pane header: kind label + type pill (icon + text)
  try {
    if (elements.name) {
      if (elements.nameToken && elements.nameTarget) {
        elements.name.replaceChildren(elements.nameToken, elements.nameTarget);
        elements.nameToken.textContent = `? ${paneLabel(pane)}`;
        elements.nameTarget.textContent = '';
      } else {
        elements.name.textContent = paneLabel(pane);
      }
    }
    if (elements.typeIcon) elements.typeIcon.textContent = paneIcon(pane);
    if (elements.typeText) elements.typeText.textContent = String(paneLabel(pane) || pane.kind || 'chat').toUpperCase();
    if (elements.typePill) {
      elements.typePill.setAttribute('aria-label', `Pane type: ${paneLabel(pane)}`);
      elements.typePill.classList.add('pane-type-badge');
      elements.typePill.classList.add(`pane-type-${pane.kind}`);
      elements.typePill.dataset.paneAccent = pane.kind;
    }
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
              ['Keyboard mode: j/k', 'move selected Workqueue row'],
              ['Keyboard mode: Enter', 'inspect selected Workqueue row'],
              ['Keyboard mode: e', 'edit selected Workqueue row'],
              ['Keyboard mode: 1/2/3/4', 'set ready / in progress / blocked / done'],
              ['Cmd/Ctrl+L', 'focus Chat composer'],
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
              ['Cmd/Ctrl+L', 'focus Chat composer'],
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
              ['Cmd/Ctrl+L', 'focus Chat composer'],
              ['Cmd/Ctrl+K', 'cycle focus between panes']
            ]
          };
        }
        return {
          title: 'Chat',
          lines: ['Chat with an agent/session.', 'Pick an agent target, then send messages/files.', 'Use Stop to cancel a long response.'],
          shortcuts: [
            ['Alt/Option+1..9', 'focus panes 1-9 by visible order'],
            ['Cmd/Ctrl+1..9', 'focus panes 1-9 by visible order'],
            ['Cmd/Ctrl+L', 'focus Chat composer'],
            ['Cmd/Ctrl+Shift+K', 'focus next pane'],
            ['Cmd/Ctrl+Shift+J', 'focus previous pane']
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

  elements.root?.addEventListener('focusin', () => {
    notePaneFocused(pane);
    clearPaneUnread(pane);
  });
  elements.root?.addEventListener('pointerdown', () => {
    notePaneFocused(pane);
    clearPaneUnread(pane);
  });
  renderPaneActivityBadge(pane);

  // WORKQUEUE PANE
  if (pane.role === 'admin' && pane.kind === 'workqueue') {
    if (elements.agentWrap) elements.agentWrap.hidden = false;
    if (elements.inputRow) elements.inputRow.hidden = true;
    if (elements.scrollDownBtn) elements.scrollDownBtn.hidden = true;

    // Header should describe the pane's primary target (queue), not an agent.
    paneSetHeaderTarget(pane, {
      label: 'Queue',
      value: formatWorkqueuePaneQueueLabel(pane),
      ariaLabel: `Change queue (current: ${formatWorkqueuePaneQueueLabel(pane)})`
    });

    // Replace thread with workqueue list + inspect.
    elements.thread.classList.add('wq-pane');
    elements.thread.innerHTML = `
      <div class="wq-toolbar">
        <div class="wq-toolbar-row">
          <label class="wq-field">
            <span class="wq-label">Queue</span>
            <input data-wq-queue-search type="search" placeholder="Search queues" aria-label="Search queues" autocomplete="off" />
            <select data-wq-queue-select aria-label="Select workqueue target"></select>
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

          <div class="wq-scope" role="group" aria-label="Workqueue scope">
            <span class="wq-scope-label">Scope</span>
            <button type="button" class="wq-scope-btn" data-wq-scope="assigned">Assigned to active target</button>
            <button type="button" class="wq-scope-btn" data-wq-scope="unassigned">Unassigned</button>
            <button type="button" class="wq-scope-btn" data-wq-scope="all">All</button>
          </div>
          <div class="wq-all-scope-guard" data-wq-all-scope-guard role="status" aria-live="polite" hidden></div>

          <div class="wq-field" data-wq-source-group role="group" aria-label="Filter by source">
            <span class="wq-label">Source</span>
            <div class="wq-scope">
              <button type="button" class="wq-scope-btn" data-wq-source="issue">Issue</button>
              <button type="button" class="wq-scope-btn" data-wq-source="routine">Routine</button>
              <button type="button" class="wq-scope-btn" data-wq-source="coordination">Coordination</button>
              <button type="button" class="wq-scope-btn" data-wq-source="other">Other</button>
            </div>
          </div>

          <div class="wq-field" data-wq-repo-group role="group" aria-label="Filter by repo">
            <span class="wq-label">Repo</span>
            <div class="wq-scope" data-wq-repo-chips></div>
          </div>

          <label class="wq-field wq-search-field">
            <span class="wq-label">Search</span>
            <input data-wq-search type="search" placeholder="Filter tasks" autocomplete="off" />
          </label>

          <button data-wq-preset-clawnsole class="secondary" type="button">Clawnsole only</button>
          <button data-wq-clear-quick class="secondary" type="button">Clear filters</button>
          <button data-wq-refresh class="secondary" type="button">Refresh</button>
          <button data-wq-keyboard-mode class="secondary wq-keyboard-toggle" type="button" aria-pressed="false">Keyboard mode</button>

          <div class="wq-sort" role="group" aria-label="Sort workqueue items">
            <span class="wq-sort-label">Sort</span>
            <button type="button" class="wq-sort-btn" data-wq-sort="default">Default</button>
            <button type="button" class="wq-sort-btn" data-wq-sort="priority">Priority</button>
            <button type="button" class="wq-sort-btn" data-wq-sort="updatedAt">Updated</button>
            <button type="button" class="wq-sort-btn" data-wq-sort="createdAt">Created</button>
          </div>

          <div class="wq-sort" role="group" aria-label="Workqueue row grouping">
            <span class="wq-sort-label">View</span>
            <button type="button" class="wq-sort-btn" data-wq-group-mode="auto">Auto</button>
            <button type="button" class="wq-sort-btn" data-wq-group-mode="rows">Raw rows</button>
            <button type="button" class="wq-sort-btn" data-wq-group-mode="grouped">Grouped (latest)</button>
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
              <label class="wq-field wq-agent-picker-field">
                <span class="wq-label">Assign to</span>
                <div class="wq-agent-picker" data-wq-claim-agent-picker>
                  <input data-wq-claim-agent-search type="search" aria-label="Search enqueue assignment target" autocomplete="off" />
                  <input data-wq-claim-agent type="hidden" value="" />
                  <div class="wq-agent-picker-list" data-wq-claim-agent-list role="listbox" aria-label="Enqueue assignment targets"></div>
                </div>
                <span class="hint">Who should pick this up</span>
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
        <div class="hint wq-keyboard-hint" data-wq-keyboard-hint hidden>j/k move, Enter inspect, e edit, 1 ready, 2 in progress, 3 blocked, 4 done</div>
        <div class="wq-filter-summary" data-wq-filter-summary aria-live="polite" hidden></div>
        <div class="wq-duplicate-health" data-wq-duplicate-health aria-live="polite" hidden></div>
      </div>

      <div class="wq-layout">
        <section class="wq-list" aria-label="Workqueue items">
          <div class="wq-list-header">
            <button type="button" class="wq-list-sort" data-wq-sort="title">Task</button>
            <button type="button" class="wq-list-sort" data-wq-sort="status">Status</button>
            <button type="button" class="wq-list-sort" data-wq-sort="priority">Priority</button>
            <button type="button" class="wq-list-sort" data-wq-sort="attempts">Attempts</button>
            <button type="button" class="wq-list-sort" data-wq-sort="claimedBy">Claimed by</button>
            <button type="button" class="wq-list-sort" data-wq-sort="leaseUntil">Lease expires</button>
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

    const queueSearchEl = elements.thread.querySelector('[data-wq-queue-search]');
    const queueSelectEl = elements.thread.querySelector('[data-wq-queue-select]');
    const queueCustomEl = elements.thread.querySelector('[data-wq-queue-custom]');

    // Make header pill focus the queue selector in the body (no duplicated selector state).
    paneSetHeaderTarget(pane, {
      label: 'Queue',
      value: formatWorkqueuePaneQueueLabel(pane),
      ariaLabel: `Change queue (current: ${formatWorkqueuePaneQueueLabel(pane)})`,
      onClick: () => {
        try {
          queueSelectEl?.focus?.();
          queueSelectEl?.click?.();
        } catch {}
      }
    });
    renderAgentOptions(elements.agentSelect, pane.agentId);
    if (elements.agentSelect) {
      try {
        elements.agentSelect.value = pane.agentId;
      } catch {}
      elements.agentSelect.addEventListener('change', (event) => {
        paneSetAgent(pane, String(event.target.value || '').trim());
      });
    }
    const statusRootEl = elements.thread.querySelector('[data-wq-status]');
    const statusSelectedEl = elements.thread.querySelector('[data-wq-status-selected]');
    const statusOptionsEl = elements.thread.querySelector('[data-wq-status-options]');
    const statusDetailsEl = elements.thread.querySelector('[data-wq-status-details]');
    const statusClearBtn = elements.thread.querySelector('[data-wq-status-clear]');
    const sourceBtns = Array.from(elements.thread.querySelectorAll('[data-wq-source]'));
    const repoChipsEl = elements.thread.querySelector('[data-wq-repo-chips]');
    const clawnsoleOnlyBtn = elements.thread.querySelector('[data-wq-preset-clawnsole]');
    const clearQuickBtn = elements.thread.querySelector('[data-wq-clear-quick]');
    const searchEl = elements.thread.querySelector('[data-wq-search]');
    const refreshBtn = elements.thread.querySelector('[data-wq-refresh]');
    const keyboardModeBtn = elements.thread.querySelector('[data-wq-keyboard-mode]');
    const keyboardHint = elements.thread.querySelector('[data-wq-keyboard-hint]');

    const DEFAULT_STATUSES = ['ready', 'pending', 'blocked', 'claimed', 'in_progress'];

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

    const initQuick = pane.workqueue?.quickFilters || {};
    const sourceSet = new Set(Array.isArray(initQuick.sources) ? initQuick.sources.map((x) => String(x || '').trim()).filter(Boolean) : []);
    const repoSet = new Set(Array.isArray(initQuick.repos) ? initQuick.repos.map((x) => String(x || '').trim()).filter(Boolean) : []);
    let searchQuery = String(initQuick.search || '').trim();
    if (searchEl) searchEl.value = searchQuery;

    const persistQuickFilters = () => {
      pane.workqueue.quickFilters = { sources: Array.from(sourceSet), repos: Array.from(repoSet), search: searchQuery };
      paneManager.persistAdminPanes();
    };

    const resetRenderLimit = () => {
      pane.workqueue.renderLimit = WORKQUEUE_PANE_INITIAL_RENDER_LIMIT;
    };

    const renderKeyboardMode = () => {
      const enabled = !!pane.workqueue.keyboardMode;
      keyboardModeBtn?.classList.toggle('active', enabled);
      keyboardModeBtn?.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      if (keyboardHint) keyboardHint.hidden = !enabled;
    };

    keyboardModeBtn?.addEventListener('click', () => {
      pane.workqueue.keyboardMode = !pane.workqueue.keyboardMode;
      renderKeyboardMode();
      renderWorkqueuePaneItems(pane);
      if (pane.workqueue.keyboardMode) {
        const selectedId = pane.workqueue.selectedItemId;
        elements.thread.querySelector(`[data-wq-item="${CSS.escape(String(selectedId || ''))}"]`)?.focus?.();
      }
    });

    elements.thread.addEventListener('keydown', (event) => {
      handleWorkqueuePaneKeyboard(event, pane);
    });

    renderKeyboardMode();

    const updateQuickFilterUi = () => {
      sourceBtns.forEach((btn) => {
        const key = String(btn.getAttribute('data-wq-source') || '').trim();
        const active = sourceSet.has(key);
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      const repos = Array.from(new Set((Array.isArray(pane.workqueue?.items) ? pane.workqueue.items : []).map(getWorkqueueItemRepo).filter(Boolean))).sort((a, b) => a.localeCompare(b));
      if (repoChipsEl) {
        repoChipsEl.innerHTML = '';
        for (const repo of repos) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'wq-scope-btn';
          btn.setAttribute('data-wq-repo', repo);
          btn.textContent = repo;
          const active = repoSet.has(repo);
          btn.classList.toggle('active', active);
          btn.setAttribute('aria-pressed', active ? 'true' : 'false');
          btn.addEventListener('click', () => {
            if (repoSet.has(repo)) repoSet.delete(repo);
            else repoSet.add(repo);
            resetRenderLimit();
            persistQuickFilters();
            updateQuickFilterUi();
            renderWorkqueuePaneItems(pane);
          });
          repoChipsEl.appendChild(btn);
        }
      }
    };

    const setQuickSearch = (next) => {
      searchQuery = String(next || '').trim();
      if (searchEl && searchEl.value !== searchQuery) searchEl.value = searchQuery;
      resetRenderLimit();
      persistQuickFilters();
      renderWorkqueuePaneItems(pane);
    };

    const removeQuickFilter = (type, value) => {
      const key = String(value || '').trim();
      if (type === 'source') sourceSet.delete(key);
      if (type === 'repo') repoSet.delete(key);
      resetRenderLimit();
      persistQuickFilters();
      updateQuickFilterUi();
      renderWorkqueuePaneItems(pane);
    };

    const applyStatuses = async (next, { closeMenu = false } = {}) => {
      statusSet.clear();
      for (const s of next) statusSet.add(s);
      pane.workqueue.statusFilter = Array.from(statusSet);
      resetRenderLimit();
      renderStatusMultiSelect();
      if (closeMenu) statusDetailsEl?.removeAttribute('open');
      await fetchAndRenderWorkqueueItemsForPane(pane);
      updateQuickFilterUi();
      paneManager.persistAdminPanes();
    };

    const doRefresh = async () => {
      const q = getQueueValue() || 'dev-team';
      pane.workqueue.queue = q;
      resetRenderLimit();
      rememberRecentWorkqueueTarget(q);
      paneSetHeaderTarget(pane, {
        label: 'Queue',
        value: formatWorkqueuePaneQueueLabel(pane),
        ariaLabel: `Change queue (current: ${formatWorkqueuePaneQueueLabel(pane)})`,
        onClick: () => {
          try {
            queueSelectEl?.focus?.();
            queueSelectEl?.click?.();
          } catch {}
        }
      });
      if (!statusSet.size) {
        for (const s of DEFAULT_STATUSES) statusSet.add(s);
        pane.workqueue.statusFilter = Array.from(statusSet);
        renderStatusMultiSelect();
      }
      await fetchAndRenderWorkqueueItemsForPane(pane);
      updateQuickFilterUi();
      paneManager.persistAdminPanes();
    };

    const setQueue = async (queue) => {
      const q = String(queue || '').trim() || 'dev-team';
      if (queueSelectEl) {
        const existing = Array.from(queueSelectEl.options || []).find((opt) => String(opt.value) === q);
        if (existing) {
          queueSelectEl.value = q;
          if (queueCustomEl) queueCustomEl.hidden = true;
        } else {
          queueSelectEl.value = '__custom__';
          if (queueCustomEl) {
            queueCustomEl.hidden = false;
            queueCustomEl.value = q;
          }
        }
      }
      await doRefresh();
    };

    const renderStatusMultiSelect = () => {
      if (!statusRootEl || !statusSelectedEl || !statusOptionsEl) return;

      statusSelectedEl.innerHTML = '';
      const selected = Array.from(statusSet);
      if (selected.length) {
        for (const s of selected) {
          const chip = document.createElement('span');
          chip.className = 'wq-pill';
          chip.textContent = formatWorkqueueStatusLabel(s);
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
        const count = Number(pane.workqueue?.statusCounts?.[s] || 0);
        const display = `${formatWorkqueueStatusLabel(s)} (${count})`;
        label.innerHTML = `<input type="checkbox" id="${id}" ${statusSet.has(s) ? 'checked' : ''} /> <span>${escapeHtml(display)}</span>`;
        const checkbox = label.querySelector('input');
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) statusSet.add(s);
          else statusSet.delete(s);
          applyStatuses(Array.from(statusSet));
        });
        statusOptionsEl.appendChild(label);
      }
    };
    pane.workqueue.renderStatusMultiSelect = renderStatusMultiSelect;
    pane.workqueue.applyStatuses = applyStatuses;
    pane.workqueue.setQueue = setQueue;
    pane.workqueue.setQuickSearch = setQuickSearch;
    pane.workqueue.removeQuickFilter = removeQuickFilter;

    const applyQueueSearchFilter = () => {
      if (!queueSelectEl) return;
      const query = String(queueSearchEl?.value || '').trim().toLowerCase();
      const options = Array.from(queueSelectEl.querySelectorAll('option'));
      options.forEach((opt) => {
        if (String(opt.value) === '__custom__') {
          opt.hidden = false;
          return;
        }
        const visible = !query || String(opt.textContent || '').toLowerCase().includes(query);
        opt.hidden = !visible;
      });

      const active = options.find((opt) => !opt.hidden && String(opt.value) !== '__custom__');
      if (active && (queueSelectEl.value === '__custom__' || !queueSelectEl.selectedOptions?.[0] || queueSelectEl.selectedOptions[0].hidden)) {
        queueSelectEl.value = active.value;
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

        const recent = readRecentWorkqueueTargets().filter((q) => q !== current);

        queueSelectEl.innerHTML = '';
        const appendOption = (value, label = value) => {
          const opt = document.createElement('option');
          opt.value = value;
          opt.textContent = label;
          queueSelectEl.appendChild(opt);
        };

        appendOption(current);
        for (const q of recent) appendOption(q, `★ ${q}`);
        for (const q of unique) {
          if (q === current || recent.includes(q)) continue;
          appendOption(q);
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
        applyQueueSearchFilter();
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
        applyQueueSearchFilter();
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
    queueSelectEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doRefresh();
      }
    });

    queueSearchEl?.addEventListener('input', () => applyQueueSearchFilter());
    queueSearchEl?.addEventListener('keydown', (e) => {
      if (!queueSelectEl) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        queueSelectEl.focus();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        doRefresh();
      }
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

    // Scope controls (client-side): assignment triage quick filters.
    const scopeBtns = Array.from(elements.thread.querySelectorAll('[data-wq-scope]'));
    const updateScopeUi = () => {
      const current = pane.workqueue?.scopeFilter || 'all';
      scopeBtns.forEach((btn) => {
        const key = btn.getAttribute('data-wq-scope') || '';
        const active = key && key === current;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    };
    const setScope = (scope) => {
      pane.workqueue.scopeFilter = normalizeWorkqueueScope(scope);
      resetRenderLimit();
      storage.set(WORKQUEUE_SCOPE_PREF_KEY, pane.workqueue.scopeFilter);
      pane.workqueue.statusCounts = buildWorkqueueStatusCounts(filterWorkqueuePaneItemsByScope(pane, pane.workqueue.countItems));
      if (typeof pane.workqueue.renderStatusMultiSelect === 'function') pane.workqueue.renderStatusMultiSelect();
      updateScopeUi();
      renderWorkqueuePaneItems(pane);
      paneManager.persistAdminPanes();
    };
    pane.workqueue.setScope = setScope;
    scopeBtns.forEach((btn) => {
      btn.addEventListener('click', () => setScope(btn.getAttribute('data-wq-scope')));
    });
    updateScopeUi();

    sourceBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = String(btn.getAttribute('data-wq-source') || '').trim();
        if (!key) return;
        if (sourceSet.has(key)) sourceSet.delete(key);
        else sourceSet.add(key);
        resetRenderLimit();
        persistQuickFilters();
        updateQuickFilterUi();
        renderWorkqueuePaneItems(pane);
      });
    });

    searchEl?.addEventListener('input', () => setQuickSearch(searchEl.value));

    clawnsoleOnlyBtn?.addEventListener('click', () => {
      sourceSet.clear();
      repoSet.clear();
      repoSet.add('rmdmattingly/clawnsole');
      resetRenderLimit();
      persistQuickFilters();
      updateQuickFilterUi();
      renderWorkqueuePaneItems(pane);
    });

    const clearAllFilters = async () => {
      sourceSet.clear();
      repoSet.clear();
      searchQuery = '';
      if (searchEl) searchEl.value = '';
      resetRenderLimit();
      persistQuickFilters();
      updateQuickFilterUi();
      setScope('all');
      await applyStatuses(DEFAULT_STATUSES);
    };
    pane.workqueue.clearAllFilters = clearAllFilters;

    clearQuickBtn?.addEventListener('click', () => {
      sourceSet.clear();
      repoSet.clear();
      searchQuery = '';
      if (searchEl) searchEl.value = '';
      resetRenderLimit();
      persistQuickFilters();
      updateQuickFilterUi();
      renderWorkqueuePaneItems(pane);
    });

    updateQuickFilterUi();

    // Sort controls (client-side): stable sorting with a status-grouping default.
    const sortBtns = Array.from(elements.thread.querySelectorAll('[data-wq-sort]'));
    const updateSortUi = () => {
      sortBtns.forEach((btn) => {
        const key = btn.getAttribute('data-wq-sort') || '';
        const meta = WORKQUEUE_HEADER_META[key];
        const active = key && key === pane.workqueue.sortKey;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        if (meta) btn.textContent = meta.label;
        const sortState = active ? ` Currently sorted ${pane.workqueue.sortDir === 'asc' ? 'ascending' : 'descending'}.` : '';
        btn.title = `${meta?.tooltip || 'Sort workqueue items.'}${sortState}`;
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
      resetRenderLimit();
      updateSortUi();
      renderWorkqueuePaneItems(pane);
      paneManager.persistAdminPanes();
    };

    sortBtns.forEach((btn) => {
      btn.addEventListener('click', () => setSort(btn.getAttribute('data-wq-sort')));
    });
    updateSortUi();

    const groupModeBtns = Array.from(elements.thread.querySelectorAll('[data-wq-group-mode]'));
    const updateGroupModeUi = () => {
      const current = normalizeWorkqueueGroupMode(pane.workqueue?.groupMode);
      groupModeBtns.forEach((btn) => {
        const key = normalizeWorkqueueGroupMode(btn.getAttribute('data-wq-group-mode'));
        const active = key === current;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        if (key === 'auto') btn.title = `Auto shows grouped latest rows when canonical issue duplicate density is at least ${Math.round(WORKQUEUE_CANONICAL_DENSITY_THRESHOLD * 100)}% or more than ${WORKQUEUE_GROUPED_AUTO_THRESHOLD} items are visible.`;
        else if (key === 'rows') btn.title = 'Show individual workqueue rows; exact duplicate rows still collapse.';
        else btn.title = 'Group related issue, routine, or coordination rows and show the latest issue row as the representative.';
      });
    };

    groupModeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        pane.workqueue.groupMode = normalizeWorkqueueGroupMode(btn.getAttribute('data-wq-group-mode'));
        resetRenderLimit();
        updateGroupModeUi();
        renderWorkqueuePaneItems(pane);
        paneManager.persistAdminPanes();
      });
    });
    updateGroupModeUi();

    // Enqueue assignment target picker (searchable + recent targets).
    const claimAgentPicker = elements.thread.querySelector('[data-wq-claim-agent-picker]');
    const claimAgentHidden = elements.thread.querySelector('[data-wq-claim-agent]');
    if (claimAgentHidden) claimAgentHidden.value = normalizeAgentId(pane.agentId || 'main');
    hydrateWorkqueueClaimAgentPicker(claimAgentPicker);

    // Enqueue (inline form).
    const enqueueForm = elements.thread.querySelector('[data-wq-enqueue-form]');
    const enqueueStatus = elements.thread.querySelector('[data-wq-enqueue-status]');
    const enqueueTitle = elements.thread.querySelector('[data-wq-enqueue-title]');
    const enqueueInstructions = elements.thread.querySelector('[data-wq-enqueue-instructions]');
    const enqueuePriority = elements.thread.querySelector('[data-wq-enqueue-priority]');
    const enqueueDedupe = elements.thread.querySelector('[data-wq-enqueue-dedupe]');
    const enqueueAssignTo = elements.thread.querySelector('[data-wq-claim-agent]');

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

      rememberRecentWorkqueueTarget(queue);
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
        const assignToAgentId = String(enqueueAssignTo?.value || '').trim();
        const assignLabel = assignToAgentId
          ? `Queued for ${formatAgentLabel(getAgentRecord(assignToAgentId), { includeId: false })}`
          : 'Queued as Unassigned';
        setEnqueueStatus(item && item._deduped ? `Deduped: ${item.id} (${assignLabel})` : assignLabel);
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
    pane.statusState = 'connected';
    pane.statusMeta = '';
    if (pane.elements?.root) pane.elements.root.dataset.connected = 'true';
    return pane;
  }

  // CRON + TIMELINE PANES (admin-only)
  if (pane.role === 'admin' && (pane.kind === 'cron' || pane.kind === 'timeline')) {
    if (elements.agentWrap) elements.agentWrap.hidden = false;
    if (elements.inputRow) elements.inputRow.hidden = true;
    if (elements.scrollDownBtn) elements.scrollDownBtn.hidden = true;

    const isTimeline = pane.kind === 'timeline';

    // Header should describe the pane's context (jobs/timeline), not an agent target.
    paneSetHeaderTarget(pane, {
      label: isTimeline ? 'Timeline' : 'Jobs',
      value: isTimeline ? 'Last 24h' : 'Cron',
      ariaLabel: isTimeline ? 'Timeline filters' : 'Cron job filters'
    });
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

    // Header target pill should jump to the primary filter control.
    paneSetHeaderTarget(pane, {
      label: isTimeline ? 'Timeline' : 'Jobs',
      value: isTimeline ? 'Last 24h' : 'Cron',
      ariaLabel: isTimeline ? 'Timeline filters' : 'Cron job filters',
      onClick: () => {
        try {
          if (isTimeline) (tlRangeEl || agentSel || tlSearchEl)?.focus?.();
          else (agentSel || cronSearchEl)?.focus?.();
        } catch {}
      }
    });

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
    if (agentSel && pane.cronAgentId && Array.from(agentSel.options || []).some((opt) => opt.value === pane.cronAgentId)) {
      agentSel.value = pane.cronAgentId;
    }

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

        // Keep the pane header context in sync with the active filters.
        try {
          const agentLabel = agentFilter === 'all' ? 'All agents' : agentFilter;
          if (isTimeline) {
            const rangeMs = Number(tlRangeEl?.value || 86400000);
            const rangeLabel = rangeMs === 3600000 ? 'Last 1h' : rangeMs === 21600000 ? 'Last 6h' : rangeMs === 604800000 ? 'Last 7d' : 'Last 24h';
            const statusLabel = String(tlStatusEl?.value || 'all');
            const parts = [agentLabel, rangeLabel];
            if (statusLabel !== 'all') parts.push(statusLabel);
            if (search) parts.push(`search:${search}`);
            paneSetHeaderTarget(pane, {
              label: 'Timeline',
              value: parts.join(' · '),
              ariaLabel: 'Timeline filters',
              onClick: () => {
                try {
                  (tlRangeEl || agentSel || tlSearchEl)?.focus?.();
                } catch {}
              }
            });
          } else {
            const flags = [];
            if (onlyFailing) flags.push('failing');
            if (onlyDisabled) flags.push('disabled');
            if (dueSoon) flags.push('due soon');
            const parts = [agentLabel];
            if (flags.length) parts.push(flags.join(','));
            if (search) parts.push(`search:${search}`);
            paneSetHeaderTarget(pane, {
              label: 'Jobs',
              value: parts.join(' · '),
              ariaLabel: 'Cron job filters',
              onClick: () => {
                try {
                  (agentSel || cronSearchEl)?.focus?.();
                } catch {}
              }
            });
          }
        } catch {}

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
    renderPaneIdentity(pane);
    renderPaneDraftBadge(pane);
    return pane;
  }

  // CHAT PANE (existing behavior)

  if (pane.role === 'admin') {
    renderAgentOptions(elements.agentSelect, pane.agentId);
    renderPaneAgentIdentity(pane);

    // Explicit switching: header and destination strip both open the chooser.
    elements.agentButton?.addEventListener('click', () => openAgentChooser(pane));
    elements.destinationButton?.addEventListener('click', () => openAgentChooser(pane));

    // Keep select handler for accessibility/debug (even though the select is hidden by default).
    elements.agentSelect?.addEventListener('change', (event) => {
      paneSetAgent(pane, String(event.target.value || '').trim());
    });

    paneSetDestinationStrip(pane);
  } else {
    if (elements.agentWrap) elements.agentWrap.hidden = true;
    if (elements.destinationStrip) elements.destinationStrip.hidden = true;
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
      if (!event.metaKey && !event.ctrlKey && paneConsumeSwitchSendGuard(pane)) return;
      paneSendChat(pane);
    }
  });

  elements.input.addEventListener('input', () => {
    paneUpdateCommandHints(pane);
    refreshPaneDraftState(pane);
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
  renderPaneIdentity(pane);
  renderPaneDraftBadge(pane);
  return pane;
}


/* inlined to AppCore */
const paneManager = {
  panes: [],
  maxPanes: 6,
  closedPaneStack: [],
  closedPaneStackLimit: 5,
  layoutLocked: false,
  lastFocusedPaneKey: '',
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
    this.layoutLocked = storage.get(ADMIN_LAYOUT_LOCK_KEY, '0') === '1';
    this.updateLayoutLockButton();
    const panes = this.loadAdminPanes();
    this.panes = panes.map((cfg) =>
      createPane({
        key: cfg.key,
        role: 'admin',
        kind: cfg.kind || 'chat',
        agentId: cfg.agentId,
        queue: cfg.queue,
        statusFilter: cfg.statusFilter,
        scopeFilter: cfg.scopeFilter,
        quickFilters: cfg.quickFilters,
        groupMode: cfg.groupMode,
        sortKey: cfg.sortKey,
        sortDir: cfg.sortDir,
        nickname: cfg.nickname,
        pairedTargetLock: cfg.pairedTargetLock,
        closable: true
      })
    );
    this.panes.forEach((pane) => globalElements.paneGrid.appendChild(pane.elements.root));
    this.updatePaneLabels();
    this.updateCloseButtons();
    this.applyInferredLayout();
    const storedActivePaneKey = rememberedActivePaneKey();
    const restoredActivePane = this.panes.find((pane) => pane.key === storedActivePaneKey) || this.panes[0] || null;
    paneActiveRestoreGuardUntil = storedActivePaneKey ? Date.now() + 1000 : 0;
    if (restoredActivePane) {
      paneFocusMruKeys = [
        restoredActivePane.key,
        ...this.panes.map((pane) => pane.key).filter((key) => key && key !== restoredActivePane.key)
      ];
    }
    renderActivePaneState(restoredActivePane);
    updateBrowserTitle(restoredActivePane);
  },
  isLayoutLocked() {
    return !!this.layoutLocked;
  },
  setLayoutLocked(next, { persist = true, notify = false } = {}) {
    this.layoutLocked = !!next;
    if (persist) storage.set(ADMIN_LAYOUT_LOCK_KEY, this.layoutLocked ? '1' : '0');
    this.updateLayoutLockButton();
    if (paneManagerUiState.open) renderPaneManager();
    if (notify) showToast(this.layoutLocked ? 'Pane layout locked.' : 'Pane layout unlocked.', { kind: 'info', timeoutMs: 1800 });
  },
  toggleLayoutLocked({ notify = true } = {}) {
    this.setLayoutLocked(!this.layoutLocked, { persist: true, notify });
    return this.layoutLocked;
  },
  updateLayoutLockButton() {
    const btn = globalElements.layoutLockBtn;
    if (!btn) return;
    const locked = !!this.layoutLocked;
    btn.textContent = locked ? '🔒' : '🔓';
    btn.setAttribute('aria-pressed', locked ? 'true' : 'false');
    btn.setAttribute('aria-label', locked ? 'Unlock pane layout' : 'Lock pane layout');
    btn.title = locked ? 'Pane layout locked (reorder disabled)' : 'Pane layout unlocked';
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
    this.closedPaneStack = [];
    renderActivePaneState(null);
  },
  loadAdminPanes() {
    const storedDefault = storage.get(ADMIN_DEFAULT_AGENT_KEY, 'main');
    const defaultAgent = normalizeAgentId(storedDefault || 'main');

    const coerce = (item) => {
      // Legacy format: { key, agentId }
      if (item && typeof item === 'object') {
        const key = typeof item.key === 'string' && item.key ? item.key : '';
        const rawKind = typeof item.kind === 'string' ? item.kind.trim().toLowerCase() : '';
        const rawMode = typeof item.mode === 'string' ? item.mode.trim().toLowerCase() : '';
        const kind = rawKind === 'workqueue' || rawKind === 'cron' || rawKind === 'timeline'
          ? rawKind
          : rawMode === 'workqueue' || rawMode === 'cron' || rawMode === 'timeline'
            ? rawMode
            : 'chat';
        if (!key) return null;
        const nickname = normalizePaneNickname(item.nickname);
        if (kind === 'workqueue') {
          const pairedTargetLock = !!item.pairedTargetLock;
          const queue = typeof item.queue === 'string' && item.queue.trim() ? item.queue.trim() : 'dev-team';
          const agentId = normalizeAgentId(typeof item.agentId === 'string' ? item.agentId : defaultAgent);
          const statusFilter = Array.isArray(item.statusFilter)
            ? item.statusFilter.map((s) => String(s || '').trim()).filter(Boolean)
            : ['ready', 'pending', 'blocked', 'claimed', 'in_progress'];
          const scopeFilter = normalizeWorkqueueScope(item.scopeFilter ?? getDefaultWorkqueueScopeForTarget(agentId));
          const quickFilters = {
            sources: Array.isArray(item?.quickFilters?.sources) ? item.quickFilters.sources.map((s) => String(s || '').trim()).filter(Boolean) : [],
            repos: Array.isArray(item?.quickFilters?.repos) ? item.quickFilters.repos.map((s) => String(s || '').trim()).filter(Boolean) : [],
            search: String(item?.quickFilters?.search || '').trim()
          };
          const sortKey = typeof item.sortKey === 'string' ? item.sortKey : 'priority';
          const sortDir = item.sortDir === 'asc' ? 'asc' : 'desc';
          const groupMode = normalizeWorkqueueGroupMode(item.groupMode);
          return { key, kind, agentId, queue, statusFilter, scopeFilter, quickFilters, groupMode, sortKey, sortDir, nickname, pairedTargetLock };
        }
        if (kind === 'cron' || kind === 'timeline') {
          const cronAgentId = typeof item.cronAgentId === 'string' ? item.cronAgentId.trim() : '';
          return { key, kind, cronAgentId, nickname };
        }
        const agentId = normalizeAgentId(typeof item.agentId === 'string' ? item.agentId : defaultAgent);
        return { key, kind: 'chat', agentId, nickname, pairedTargetLock: !!item.pairedTargetLock };
      }
      // Super-legacy format: ['pabc','pdef'] (treat as chat panes)
      if (typeof item === 'string' && item) {
        return { key: item, kind: 'chat', agentId: defaultAgent, pairedTargetLock: false };
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
    const list = buildDefaultAdminPanes(defaultAgent).slice(0, this.maxPanes);
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
          agentId: pane.agentId || 'main',
          pairedTargetLock: !!pane.pairedTargetLock,
          queue: pane.workqueue?.queue || 'dev-team',
          statusFilter: Array.isArray(pane.workqueue?.statusFilter) ? pane.workqueue.statusFilter : [],
          scopeFilter: pane.workqueue?.scopeFilter || 'all',
          quickFilters: {
            sources: Array.isArray(pane.workqueue?.quickFilters?.sources) ? pane.workqueue.quickFilters.sources : [],
            repos: Array.isArray(pane.workqueue?.quickFilters?.repos) ? pane.workqueue.quickFilters.repos : [],
            search: String(pane.workqueue?.quickFilters?.search || '').trim()
          },
          groupMode: normalizeWorkqueueGroupMode(pane.workqueue?.groupMode),
          sortKey: pane.workqueue?.sortKey || 'priority',
          sortDir: pane.workqueue?.sortDir || 'desc',
          nickname: paneNickname(pane)
        };
      }
      if (pane.kind === 'cron' || pane.kind === 'timeline') {
        return { key: pane.key, kind: pane.kind, cronAgentId: String(pane.cronAgentId || '').trim(), nickname: paneNickname(pane) };
      }
      return { key: pane.key, kind: 'chat', agentId: pane.agentId || 'main', nickname: paneNickname(pane), pairedTargetLock: !!pane.pairedTargetLock };
    });
    storage.set(ADMIN_PANES_KEY, JSON.stringify(payload));
  },
  hasUnsentDrafts() {
    return anyPaneHasDraftChanges(this.panes);
  },
  snapshotClosedPane(pane, index = -1) {
    if (!pane) return null;
    const kind = normalizePaneKind(pane.kind || 'chat');
    const snapshot = {
      kind,
      index: Number.isInteger(index) ? index : -1,
      agentId: normalizeAgentId(pane.agentId || 'main'),
      cronAgentId: String(pane.cronAgentId || '').trim(),
      nickname: paneNickname(pane),
      pairedTargetLock: !!pane.pairedTargetLock,
      draftText: kind === 'chat' ? String(pane.elements?.input?.value || '') : ''
    };

    if (kind === 'workqueue') {
      snapshot.queue = String(pane.workqueue?.queue || 'dev-team').trim() || 'dev-team';
      snapshot.statusFilter = Array.isArray(pane.workqueue?.statusFilter) ? pane.workqueue.statusFilter.slice() : [];
      snapshot.scopeFilter = normalizeWorkqueueScope(pane.workqueue?.scopeFilter);
      snapshot.quickFilters = {
        sources: Array.isArray(pane.workqueue?.quickFilters?.sources) ? pane.workqueue.quickFilters.sources.slice() : [],
        repos: Array.isArray(pane.workqueue?.quickFilters?.repos) ? pane.workqueue.quickFilters.repos.slice() : [],
        search: String(pane.workqueue?.quickFilters?.search || '').trim()
      };
      snapshot.groupMode = normalizeWorkqueueGroupMode(pane.workqueue?.groupMode);
      snapshot.sortKey = pane.workqueue?.sortKey || 'priority';
      snapshot.sortDir = pane.workqueue?.sortDir === 'asc' ? 'asc' : 'desc';
    }

    return snapshot;
  },
  pushClosedPaneSnapshot(pane, index = -1) {
    const snapshot = this.snapshotClosedPane(pane, index);
    if (!snapshot) return;
    this.closedPaneStack.unshift(snapshot);
    this.closedPaneStack = this.closedPaneStack.slice(0, this.closedPaneStackLimit);
  },
  reopenLastClosedPane() {
    if (roleState.role !== 'admin') return null;
    if (!this.closedPaneStack.length) {
      showToast('No recently closed pane.', { kind: 'info', timeoutMs: 1800, testId: 'reopen-pane-empty-toast' });
      return null;
    }
    if (this.panes.length >= this.maxPanes) {
      showToast('Maximum panes are already open.', { kind: 'info', timeoutMs: 1800, testId: 'reopen-pane-full-toast' });
      return null;
    }

    const snapshot = this.closedPaneStack.shift();
    const pane = this.restoreClosedPaneSnapshot(snapshot);
    if (!pane) {
      showToast('Could not reopen pane.', { kind: 'info', timeoutMs: 1800, testId: 'reopen-pane-failed-toast' });
      return null;
    }
    showToast(`Reopened ${paneLabel(pane)} pane.`, { kind: 'success', timeoutMs: 1600, testId: 'reopen-pane-toast' });
    return pane;
  },
  restoreClosedPaneSnapshot(snapshot) {
    if (!snapshot) return null;
    const kind = normalizePaneKind(snapshot.kind || 'chat');
    const options = {
      forceNew: true,
      insertIndex: Number.isInteger(snapshot.index) ? snapshot.index : undefined,
      agentId: snapshot.agentId,
      cronAgentId: snapshot.cronAgentId,
      nickname: snapshot.nickname,
      pairedTargetLock: !!snapshot.pairedTargetLock,
      restoreDraftText: kind === 'chat' ? String(snapshot.draftText || '') : ''
    };

    if (kind === 'workqueue') {
      Object.assign(options, {
        queue: snapshot.queue,
        statusFilter: snapshot.statusFilter,
        scopeFilter: snapshot.scopeFilter,
        quickFilters: snapshot.quickFilters,
        groupMode: snapshot.groupMode,
        sortKey: snapshot.sortKey,
        sortDir: snapshot.sortDir
      });
    }

    return this.addPane(kind, options);
  },
  resetAdminLayoutToDefault({ confirm = true } = {}) {
    if (roleState.role !== 'admin') return;
    if (confirm && this.hasUnsentDrafts()) {
      const ok = window.confirm('Reset to recommended layout? Unsent draft text or attachments will be discarded.');
      if (!ok) return;
    }

    const storedDefault = storage.get(ADMIN_DEFAULT_AGENT_KEY, 'main');
    const defaultAgent = normalizeAgentId(storedDefault || 'main');
    storage.set(ADMIN_PANES_KEY, JSON.stringify(buildDefaultAdminPanes(defaultAgent)));

    this.init();

    // If authed, make sure panes reconnect after reset.
    this.connectAll();

    try {
      const firstPane = this.panes[0];
      firstPane?.elements?.input?.focus?.();
    } catch {}
  },
  addPane(kind = 'chat', options = {}) {
    if (roleState.role !== 'admin') return;

    const normalizedKind = normalizePaneKind(kind);
    const nextQueue = String(options?.queue || 'dev-team').trim() || 'dev-team';
    const nextAgentId = normalizeAgentId(options?.agentId || storage.get(ADMIN_DEFAULT_AGENT_KEY, 'main'));
    const nextCronAgentId = String(options?.cronAgentId || '').trim();
    const nextScopeFilter = normalizeWorkqueueScope(options?.scopeFilter ?? getDefaultWorkqueueScopeForTarget(nextAgentId));
    const forceNew = Boolean(options?.forceNew);
    const insertCreatedPane = (pane) => {
      const rawIndex = Number(options?.insertIndex);
      const idx = Number.isInteger(rawIndex) ? Math.max(0, Math.min(rawIndex, this.panes.length)) : this.panes.length;
      const beforeRoot = this.panes[idx]?.elements?.root || null;
      this.panes.splice(idx, 0, pane);
      globalElements.paneGrid.insertBefore(pane.elements.root, beforeRoot);
    };
    const finishCreatedPane = (pane, { connect = false } = {}) => {
      this.updatePaneLabels();
      this.updateCloseButtons();
      this.applyInferredLayout();
      this.persistAdminPanes();
      if (connect && uiState.authed) {
        pane.client.connect();
      }
      this.focusPanePrimary(pane);
      renderActivePaneState(pane);
      return pane;
    };

    const findMatchingPane = () => {
      if (normalizedKind === 'workqueue') {
        return this.panes.find((p) =>
          p?.role === 'admin' &&
          p.kind === 'workqueue' &&
          String(p.workqueue?.queue || '').trim() === nextQueue &&
          normalizeAgentId(p.agentId || 'main') === nextAgentId &&
          normalizeWorkqueueScope(p.workqueue?.scopeFilter) === nextScopeFilter
        ) || null;
      }
      if (normalizedKind === 'cron' || normalizedKind === 'timeline') {
        return this.panes.find((p) => p?.role === 'admin' && p.kind === normalizedKind && String(p.cronAgentId || '').trim() === nextCronAgentId) || null;
      }
      return null;
    };

    if (!forceNew) {
      const existing = findMatchingPane();
      if (existing) {
        this.focusPanePrimary(existing);
        return existing;
      }
    }

    if (this.panes.length >= this.maxPanes) return;

    if (normalizedKind === 'workqueue') {
      const pane = createPane({
        key: `p${randomId().slice(0, 8)}`,
        role: 'admin',
        kind: 'workqueue',
        agentId: nextAgentId,
        queue: nextQueue,
        statusFilter: Array.isArray(options?.statusFilter) && options.statusFilter.length
          ? options.statusFilter
          : ['ready', 'pending', 'blocked', 'claimed', 'in_progress'],
        scopeFilter: nextScopeFilter,
        quickFilters: options?.quickFilters,
        groupMode: normalizeWorkqueueGroupMode(options?.groupMode),
        sortKey: options?.sortKey,
        sortDir: options?.sortDir,
        nickname: options?.nickname,
        pairedTargetLock: !!options?.pairedTargetLock,
        closable: true
      });
      insertCreatedPane(pane);
      return finishCreatedPane(pane);
    }

    if (normalizedKind === 'cron' || normalizedKind === 'timeline') {
      const pane = createPane({
        key: `p${randomId().slice(0, 8)}`,
        role: 'admin',
        kind: normalizedKind,
        cronAgentId: nextCronAgentId,
        nickname: options?.nickname,
        closable: true
      });
      insertCreatedPane(pane);
      return finishCreatedPane(pane, { connect: true });
    }

    const agentId = normalizeAgentId(options?.agentId || storage.get(ADMIN_DEFAULT_AGENT_KEY, 'main'));
    const pane = createPane({
      key: `p${randomId().slice(0, 8)}`,
      role: 'admin',
      kind: 'chat',
      agentId,
      nickname: options?.nickname,
      pairedTargetLock: !!options?.pairedTargetLock,
      closable: true
    });
    if (typeof options?.restoreDraftText === 'string' && pane.elements?.input) {
      pane.elements.input.value = options.restoreDraftText;
      paneUpdateCommandHints(pane);
    }
    insertCreatedPane(pane);
    return finishCreatedPane(pane, { connect: true });
  },
  focusPanePrimary(pane) {
    if (!pane?.elements?.root) return;
    const previousPaneKey = focusedPaneKey() || paneMruOrder()[0] || '';
    notePaneFocused(pane);
    paneMarkSwitchSendGuard(pane, previousPaneKey);

    try {
      pane.elements.root.focus?.({ preventScroll: true });
    } catch {}

    // Defer until DOM has painted.
    setTimeout(() => {
      if (paneFocusMruKeys[0] !== pane.key) return;
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
  baselineGuardEnabled() {
    if (roleState.role !== 'admin') return false;
    return String(storage.get(ADMIN_LAYOUT_MODE_KEY, 'default') || 'default') !== 'custom';
  },
  isLastAnchorPane(pane) {
    if (!this.baselineGuardEnabled()) return false;
    const kind = String(pane?.kind || '');
    if (!isAnchorPaneKind(kind)) return false;
    return this.panes.filter((entry) => String(entry?.kind || 'chat') === kind).length === 1;
  },
  maybeOfferCloseLossGuard(pane) {
    if (pane?.kind !== 'chat') return false;
    const hasDraft = paneHasUnsentDraft(pane);
    const hasRun = paneHasActiveRun(pane);
    if (!hasDraft && !hasRun) return false;

    const message = hasRun
      ? 'Closing this pane will stop an active run and discard any unsent text.'
      : 'Closing this pane will discard unsent draft text.';

    showToast(message, {
      kind: 'error',
      timeoutMs: 12000,
      role: 'dialog',
      ariaLabel: 'Close pane warning',
      actionLabel: 'Close pane',
      secondaryActionLabel: 'Cancel',
      testId: 'pane-close-loss-guard-toast',
      autoFocusAction: true,
      onAction: () => this.removePane(pane.key, { skipCloseLossGuard: true }),
      onSecondaryAction: () => {}
    });

    return true;
  },
  maybeOfferAnchorReplace(pane) {
    if (!this.isLastAnchorPane(pane)) return false;

    const kind = String(pane?.kind || 'chat');
    const labelKind = kind === 'workqueue' ? 'Workqueue' : 'Chat';

    showToast(`This is the last ${labelKind} pane.`, {
      timeoutMs: 10000,
      actionLabel: `Replace ${labelKind} pane`,
      secondaryActionLabel: 'Cancel',
      testId: `close-guard-${kind}-toast`,
      onAction: () => this.replacePane(pane.key, kind, anchorPaneOptions(pane)),
      onSecondaryAction: () => {}
    });

    return true;
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

      const makeButton = ({ testId, title, subtitle, shortcut }) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pane-add-menu__item';
        btn.dataset.testid = testId;
        btn.title = shortcut;
        btn.innerHTML = `
          <span class="pane-add-menu__label">${escapeHtml(title)}</span>
          <span class="pane-add-menu__summary" data-pane-add-summary>${escapeHtml(subtitle)}</span>
        `;
        return btn;
      };

      const makeControl = (label, control) => {
        const wrap = document.createElement('label');
        wrap.className = 'pane-add-menu__control';
        const text = document.createElement('span');
        text.textContent = label;
        wrap.appendChild(text);
        wrap.appendChild(control);
        return wrap;
      };

      const chatBtn = makeButton({
        testId: 'pane-add-menu-chat',
        title: 'New Chat pane',
        subtitle: 'Chat -> active agent',
        shortcut: 'Shortcut: Ctrl/Cmd+Shift+C'
      });
      const chatAgentSelect = document.createElement('select');
      chatAgentSelect.dataset.testid = 'pane-add-menu-chat-agent';
      chatAgentSelect.setAttribute('aria-label', 'Chat agent');

      const wqBtn = makeButton({
        testId: 'pane-add-menu-workqueue',
        title: 'New Workqueue pane',
        subtitle: 'Workqueue -> dev-team / unassigned',
        shortcut: 'Shortcut: Ctrl/Cmd+Shift+W (Alt/Option+click = Open anyway)'
      });
      const wqQueueInput = document.createElement('input');
      wqQueueInput.type = 'text';
      wqQueueInput.dataset.testid = 'pane-add-menu-workqueue-queue';
      wqQueueInput.setAttribute('aria-label', 'Workqueue queue');
      wqQueueInput.autocomplete = 'off';
      const wqScopeSelect = document.createElement('select');
      wqScopeSelect.dataset.testid = 'pane-add-menu-workqueue-scope';
      wqScopeSelect.setAttribute('aria-label', 'Workqueue scope');
      [
        ['unassigned', 'Unassigned'],
        ['assigned', 'Assigned to active target'],
        ['all', 'All']
      ].forEach(([value, label]) => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = label;
        wqScopeSelect.appendChild(opt);
      });

      const cronBtn = makeButton({
        testId: 'pane-add-menu-cron',
        title: 'New Cron pane',
        subtitle: 'Cron -> gateway',
        shortcut: 'Shortcut: Ctrl/Cmd+Shift+R (Alt/Option+click = Open anyway)'
      });

      const timelineBtn = makeButton({
        testId: 'pane-add-menu-timeline',
        title: 'New Timeline pane',
        subtitle: 'Timeline -> gateway',
        shortcut: 'Shortcut: Ctrl/Cmd+Shift+Y (Alt/Option+click = Open anyway)'
      });

      menu.appendChild(chatBtn);
      menu.appendChild(makeControl('Agent', chatAgentSelect));
      menu.appendChild(wqBtn);
      menu.appendChild(makeControl('Queue', wqQueueInput));
      menu.appendChild(makeControl('Scope', wqScopeSelect));
      menu.appendChild(cronBtn);
      menu.appendChild(timelineBtn);

      const stopMenuControlEvent = (event) => event.stopPropagation();
      [chatAgentSelect, wqQueueInput, wqScopeSelect].forEach((el) => {
        el.addEventListener('click', stopMenuControlEvent);
        el.addEventListener('mousedown', stopMenuControlEvent);
      });

      const refreshDestinationControls = () => {
        const defaultAgent = normalizeAgentId(storage.get(ADMIN_DEFAULT_AGENT_KEY, 'main'));
        renderAgentOptions(chatAgentSelect, defaultAgent);
        chatAgentSelect.value = defaultAgent;

        const queues = Array.from(new Set([
          'dev-team',
          ...this.panes
            .filter((pane) => pane?.kind === 'workqueue')
            .map((pane) => String(pane.workqueue?.queue || '').trim())
            .filter(Boolean)
        ]));
        const preferredQueue = queues[0] || 'dev-team';
        wqQueueInput.value = preferredQueue;
        wqQueueInput.setAttribute('list', 'pane-add-workqueue-queues');
        let datalist = menu.querySelector('#pane-add-workqueue-queues');
        if (!datalist) {
          datalist = document.createElement('datalist');
          datalist.id = 'pane-add-workqueue-queues';
          menu.appendChild(datalist);
        }
        datalist.innerHTML = '';
        queues.forEach((queue) => {
          const opt = document.createElement('option');
          opt.value = queue;
          datalist.appendChild(opt);
        });
        wqScopeSelect.value = getDefaultWorkqueueScopeForTarget(chatAgentSelect.value);
        chatBtn.querySelector('[data-pane-add-summary]').textContent = `Chat -> Agent: ${chatAgentSelect.value || 'main'}`;
        wqBtn.querySelector('[data-pane-add-summary]').textContent = `Workqueue -> Queue: ${wqQueueInput.value || 'dev-team'} / ${wqScopeSelect.value}`;
      };

      chatAgentSelect.addEventListener('change', () => {
        chatBtn.querySelector('[data-pane-add-summary]').textContent = `Chat -> Agent: ${chatAgentSelect.value || 'main'}`;
        wqScopeSelect.value = getDefaultWorkqueueScopeForTarget(chatAgentSelect.value);
        wqBtn.querySelector('[data-pane-add-summary]').textContent = `Workqueue -> Queue: ${wqQueueInput.value || 'dev-team'} / ${wqScopeSelect.value}`;
      });
      wqQueueInput.addEventListener('input', () => {
        wqBtn.querySelector('[data-pane-add-summary]').textContent = `Workqueue -> Queue: ${wqQueueInput.value || 'dev-team'} / ${wqScopeSelect.value}`;
      });
      wqScopeSelect.addEventListener('change', () => {
        wqBtn.querySelector('[data-pane-add-summary]').textContent = `Workqueue -> Queue: ${wqQueueInput.value || 'dev-team'} / ${wqScopeSelect.value}`;
      });

      const onMenuAdd = (kind, getOptions = () => ({})) => (event) => {
        if (state.menuActionInFlight) return;
        state.menuActionInFlight = true;
        if (event?.preventDefault) event.preventDefault();
        if (event?.stopPropagation) event.stopPropagation();

        this.closeAddPaneMenu();
        this.addPane(kind, { ...getOptions(), forceNew: !!event?.altKey });

        queueMicrotask(() => {
          state.menuActionInFlight = false;
        });
      };

      chatBtn.addEventListener('click', onMenuAdd('chat', () => ({ agentId: chatAgentSelect.value || 'main' })));

      wqBtn.addEventListener('click', onMenuAdd('workqueue', () => ({
        agentId: chatAgentSelect.value || 'main',
        queue: wqQueueInput.value || 'dev-team',
        scopeFilter: wqScopeSelect.value || getDefaultWorkqueueScopeForTarget(chatAgentSelect.value)
      })));

      cronBtn.addEventListener('click', onMenuAdd('cron'));

      timelineBtn.addEventListener('click', onMenuAdd('timeline'));

      state.menuEl = menu;
      state.chatBtn = chatBtn;
      state.wqBtn = wqBtn;
      state.cronBtn = cronBtn;
      state.timelineBtn = timelineBtn;
      state.refreshDestinationControls = refreshDestinationControls;
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
    state.refreshDestinationControls?.();

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
  replacePane(key, kind = 'chat', options = {}) {
    if (roleState.role !== 'admin') return null;
    const idx = this.panes.findIndex((pane) => pane.key === key);
    if (idx < 0) return null;
    const targetKind = isAnchorPaneKind(kind) ? kind : 'chat';
    const removed = this.removePane(key, { skipAnchorGuard: true, focusFallback: false, recordClosed: false });
    if (!removed) return null;
    return this.addPane(targetKind, { ...options, forceNew: true });
  },
  removePane(key, {
    skipAnchorGuard = false,
    skipCloseLossGuard = false,
    focusFallback = true,
    source = 'unknown',
    recordClosed = true
  } = {}) {
    if (roleState.role !== 'admin') return;
    if (this.panes.length <= 1) return;
    const idx = this.panes.findIndex((pane) => pane.key === key);
    if (idx < 0) return;
    const candidate = this.panes[idx];
    if (!skipCloseLossGuard && this.maybeOfferCloseLossGuard(candidate, { source })) return;
    if (!skipAnchorGuard && this.maybeOfferAnchorReplace(candidate, { source })) return;
    const [pane] = this.panes.splice(idx, 1);
    if (recordClosed) this.pushClosedPaneSnapshot(pane, idx);
    forgetFocusedPaneKey(pane?.key || key);
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
    if (focusFallback) {
      const fallbackPane = this.panes[Math.min(idx, this.panes.length - 1)] || this.panes[0] || null;
      if (fallbackPane) notePaneFocused(fallbackPane);
      else updateBrowserTitle(null);
    }
    updateGlobalStatus();
    updateConnectionControls();
    return pane;
  },
  movePane(key, delta = 0) {
    if (roleState.role !== 'admin') return false;
    if (this.isLayoutLocked()) return false;
    const idx = this.panes.findIndex((pane) => pane.key === key);
    if (idx < 0) return false;

    const nextIdx = idx + Number(delta || 0);
    if (nextIdx < 0 || nextIdx >= this.panes.length) return false;

    const [pane] = this.panes.splice(idx, 1);
    this.panes.splice(nextIdx, 0, pane);

    if (globalElements.paneGrid) {
      this.panes.forEach((next) => {
        if (!next.elements?.root) return;
        globalElements.paneGrid.appendChild(next.elements.root);
      });
    }

    this.updatePaneLabels();
    this.persistAdminPanes();
    updateGlobalStatus();
    return true;
  },
  updatePaneLabels() {
    this.panes.forEach((pane) => renderPaneIdentity(pane));
    updatePaneShortcutBadges();
    this.updatePaneGridLabel();
  },
  updatePaneGridLabel() {
    const grid = globalElements.paneGrid;
    if (!grid) return;
    const hasNonChat = this.panes.some((pane) => pane?.kind && pane.kind !== 'chat');
    grid.setAttribute('aria-label', hasNonChat ? 'Panes' : 'Chat panes');
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
renderShortcutHelpLabels();

globalElements.settingsBtn?.addEventListener('click', () => openSettings());
globalElements.settingsCloseBtn?.addEventListener('click', () => closeSettings());
globalElements.settingsModal?.addEventListener('click', (event) => {
  if (event.target === globalElements.settingsModal) closeSettings();
});
globalElements.paneSwitchHudEnabled?.addEventListener('change', () => {
  storage.set(PANE_SWITCH_HUD_ENABLED_KEY, globalElements.paneSwitchHudEnabled.checked ? '1' : '0');
});
globalElements.headerLabeledControlsEnabled?.addEventListener('change', () => {
  storage.set(HEADER_LABELED_CONTROLS_ENABLED_KEY, globalElements.headerLabeledControlsEnabled.checked ? '1' : '0');
  applyHeaderLabeledControlsSetting();
});
function handleShortcutOverrideInputKeydown(event) {
  const input = event.target?.closest?.('[data-shortcut-action]');
  if (!input) return;
  const combo = shortcutComboFromEvent(event);
  if (!combo) return;
  event.preventDefault();
  event.stopPropagation();
  const actionId = String(input.dataset.shortcutAction || '');
  const overrides = cleanShortcutOverrides(shortcutOverridesDraft || readShortcutOverrides());
  const action = SHORTCUT_OVERRIDE_ACTION_BY_ID.get(actionId);
  if (!action) return;
  if (shortcutComboEquals(combo, action.defaultCombo)) delete overrides[actionId];
  else overrides[actionId] = combo;
  shortcutOverridesDraft = overrides;
  renderShortcutOverrideSettings();
  const nextInput = globalElements.shortcutOverridesList?.querySelector?.(`[data-shortcut-action="${CSS.escape(actionId)}"]`);
  nextInput?.focus?.();
  nextInput?.select?.();
}
window.addEventListener('keydown', handleShortcutOverrideInputKeydown, true);
globalElements.shortcutOverridesList?.addEventListener('click', (event) => {
  const suggestionBtn = event.target?.closest?.('[data-shortcut-suggestion]');
  if (suggestionBtn) {
    applyShortcutSuggestion(
      String(suggestionBtn.dataset.shortcutSuggestion || ''),
      String(suggestionBtn.dataset.shortcutCombo || '')
    );
    return;
  }
  const resetBtn = event.target?.closest?.('[data-shortcut-reset]');
  if (!resetBtn) return;
  resetShortcutOverride(String(resetBtn.dataset.shortcutReset || ''));
});
globalElements.shortcutOverridesSave?.addEventListener('click', () => saveShortcutOverridesFromSettings());
globalElements.shortcutOverridesResetAll?.addEventListener('click', () => resetAllShortcutOverrides());

globalElements.shortcutsBtn?.addEventListener('click', () => openShortcuts());
globalElements.shortcutsCloseBtn?.addEventListener('click', () => closeShortcuts());
globalElements.shortcutsModal?.addEventListener('click', (event) => {
  if (event.target === globalElements.shortcutsModal) closeShortcuts();
});
globalElements.shortcutsModal?.addEventListener('keydown', (event) => {
  if (!globalElements.shortcutsModal?.classList.contains('open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    closeShortcuts();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = getModalFocusableElements(globalElements.shortcutsModal);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (event.shiftKey) {
    if (active === first || !globalElements.shortcutsModal.contains(active)) {
      event.preventDefault();
      last.focus();
    }
    return;
  }
  if (active === last) {
    event.preventDefault();
    first.focus();
  }
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
    event.stopPropagation();
    closeCommandPalette();
    return;
  }
  if (key === 'ArrowDown') {
    event.preventDefault();
    moveCommandPaletteSelection(1);
    renderCommandPalette();
    return;
  }
  if (key === 'ArrowUp') {
    event.preventDefault();
    moveCommandPaletteSelection(-1);
    renderCommandPalette();
    return;
  }
  if (key === 'Enter') {
    event.preventDefault();
    const item = commandPaletteState.filtered[commandPaletteState.selectedIndex];
    if (!item || item.kind === 'header') return;
    if (!item.run) return;
    try {
      item.run();
    } finally {
      if (item.kind !== 'toggle') closeCommandPalette({ restoreFocus: false });
    }
  }
});

globalElements.saveGuestPromptBtn?.addEventListener('click', () => saveGuestPrompt());
globalElements.recurringPromptCreateBtn?.addEventListener('click', () => createRecurringPromptFromUi());
globalElements.recurringPromptCancelEditBtn?.addEventListener('click', () => resetRecurringPromptForm());
globalElements.recurringPromptRefreshBtn?.addEventListener('click', () => loadRecurringPrompts());
globalElements.recurringPromptHistoryRefreshBtn?.addEventListener('click', () => loadRecurringPromptHistory());
globalElements.recurringPromptHistoryFilter?.addEventListener('change', () => {
  recurringPromptState.historyFilterId = String(globalElements.recurringPromptHistoryFilter?.value || 'all');
  loadRecurringPromptHistory();
});
globalElements.recurringPromptRows?.addEventListener('click', (event) => {
  const btn = event.target instanceof HTMLElement ? event.target.closest('[data-rp-action]') : null;
  if (!btn) return;
  const action = String(btn.getAttribute('data-rp-action') || '');
  const id = String(btn.getAttribute('data-rp-id') || '');
  if (!id) return;
  if (action === 'edit') {
    const prompt = recurringPromptState.items.find((p) => String(p?.id || '') === id);
    if (prompt) {
      populateRecurringPromptForm(prompt);
      recurringPromptState.historyFilterId = id;
      if (globalElements.recurringPromptHistoryFilter) globalElements.recurringPromptHistoryFilter.value = id;
      loadRecurringPromptHistory();
    }
    return;
  }
  if (action === 'toggle') {
    toggleRecurringPrompt(id);
    return;
  }
  if (action === 'delete') {
    if (!window.confirm('Delete this recurring admin/system prompt?')) return;
    deleteRecurringPrompt(id);
  }
});

globalElements.refreshAgentsBtn?.addEventListener('click', () => {
  clearFleetRefreshLock();
  refreshAgents({ reason: 'manual', showSuccessToast: true }).catch(() => {
    showToast('Agent refresh failed.', { kind: 'error', timeoutMs: 3500 });
  });
});
globalElements.agentsModalRefreshBtn?.addEventListener('click', () => {
  refreshAgents({ reason: 'manual', showSuccessToast: true }).catch(() => {
    showToast('Agent refresh failed.', { kind: 'error', timeoutMs: 3500 });
  });
});
globalElements.agentsRefreshStateBtn?.addEventListener('click', () => {
  clearFleetRefreshLock();
  refreshAgents({ reason: 'manual', showSuccessToast: true }).catch(() => {
    showToast('Agent refresh failed.', { kind: 'error', timeoutMs: 3500 });
  });
});

globalElements.agentsBtn?.addEventListener('click', () => openAgentsModal());
globalElements.agentsCloseBtn?.addEventListener('click', () => {
  clearFleetRefreshLock();
  closeAgentsModal();
});
globalElements.agentsModal?.addEventListener('click', (event) => {
  if (event.target === globalElements.agentsModal) {
    clearFleetRefreshLock();
    closeAgentsModal();
  }
});
globalElements.agentsModal?.addEventListener('keydown', (event) => {
  if (isTypingContext(event.target)) return;
  if (event.target instanceof Element && event.target.closest('button, a, input, select, textarea, summary')) return;
  const key = String(event.key || '');
  const lower = key.toLowerCase();
  if (matchesKeybind(event, 'triage.return')) {
    event.preventDefault();
    returnToTriageSource();
    return;
  }
  if (!event.metaKey && !event.ctrlKey && !event.altKey) {
    if (key === 'ArrowDown' || lower === 'j') {
      event.preventDefault();
      moveFleetSelection(1);
      return;
    }
    if (key === 'ArrowUp' || lower === 'k') {
      event.preventDefault();
      moveFleetSelection(-1);
      return;
    }
    if (key === 'Enter') {
      event.preventDefault();
      runFleetSelectedAgent(event.shiftKey ? 'workqueue' : 'chat');
      return;
    }
    if (key === '.') {
      event.preventDefault();
      runFleetSelectedAgent('timeline');
      return;
    }
  }
  if (lower !== 'h' || event.metaKey || event.ctrlKey || event.altKey) return;
  event.preventDefault();
  if (event.shiftKey || getFleetSort() !== 'heartbeat_age_desc') setFleetHeartbeatSort();
  else resetFleetSort();
});

globalElements.agentsSearch?.addEventListener('input', () => renderAgentsModalList());
globalElements.agentsSearch?.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  event.preventDefault();
  event.stopPropagation();
  globalElements.agentsSearch.value = '';
  renderAgentsModalList();
  globalElements.agentsSearch.focus();
});

globalElements.agentsFilterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = String(btn.getAttribute('data-agents-filter') || 'all').trim() || 'all';
    storage.set(ADMIN_AGENT_FILTER_KEY, key);
    globalElements.agentsFilterButtons.forEach((chip) => {
      const active = (chip.getAttribute('data-agents-filter') || '') === key;
      chip.classList.toggle('active', active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    renderAgentsModalList();
  });
});

globalElements.agentsDensityButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const density = String(btn.getAttribute('data-agents-density') || 'comfortable') === 'compact' ? 'compact' : 'comfortable';
    storage.set(ADMIN_AGENT_DENSITY_KEY, density);
    syncFleetDensityControl();
  });
});

globalElements.agentsSort?.addEventListener('change', () => {
  storage.set(ADMIN_AGENT_SORT_KEY, String(globalElements.agentsSort.value || 'recent_desc'));
  renderAgentsModalList();
});

globalElements.agentsHeatmapToggle?.addEventListener('change', () => {
  storage.set(ADMIN_AGENT_HEATMAP_KEY, globalElements.agentsHeatmapToggle.checked ? '1' : '0');
  renderAgentsModalList();
});

globalElements.agentsHeartbeatSortBtn?.addEventListener('click', () => setFleetHeartbeatSort());
globalElements.agentsSortResetBtn?.addEventListener('click', () => resetFleetSort());

globalElements.agentsActiveMinutes?.addEventListener('change', () => {
  const minutes = Math.max(1, Number(globalElements.agentsActiveMinutes.value) || FLEET_DEFAULT_ACTIVE_WINDOW_MINUTES);
  globalElements.agentsActiveMinutes.value = String(minutes);
  storage.set(ADMIN_AGENT_ACTIVE_MINUTES_KEY, minutes);
  renderAgentsLastRefreshed();
  renderAgentsModalList();
});

document.addEventListener('visibilitychange', () => {
  if (!isAgentsModalOpen()) return;
  if (document.hidden) return;
  refreshAgents({ reason: 'fleet_visibility_resume' }).catch(() => {});
});

window.addEventListener('focus', () => {
  if (!isAgentsModalOpen()) return;
  if (document.hidden) return;
  refreshAgents({ reason: 'fleet_focus_resume' }).catch(() => {});
});

globalElements.workqueueBtn?.addEventListener('click', () => openTopbarWorkqueueAction());
globalElements.fleetBtn?.addEventListener('click', (event) => {
  const forceNew = !!event?.altKey;
  openFleetPane({ forceNew });
});
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

let shortcutState = { lastGAtMs: 0, blockedReasonLastShownAt: new Map() };
const GO_TO_PANE_TIMEOUT_MS = 1200;
const SHORTCUT_BLOCK_RATE_LIMIT_MS = 5000;
const SHORTCUT_BLOCK_MESSAGES = {
  typing: 'Shortcut paused while typing',
  modal: 'Close modal to use this shortcut',
  layout: 'Use Cmd/Ctrl+1..9 on this keyboard layout'
};

function reportBlockedShortcut(reason) {
  const key = String(reason || '').trim();
  const message = SHORTCUT_BLOCK_MESSAGES[key];
  if (!message) return false;
  const now = Date.now();
  const lastShownAt = shortcutState.blockedReasonLastShownAt.get(key) || 0;
  if (now - lastShownAt < SHORTCUT_BLOCK_RATE_LIMIT_MS) return true;
  shortcutState.blockedReasonLastShownAt.set(key, now);
  showToast(message, { kind: 'info', timeoutMs: 2600, testId: 'shortcut-blocked-toast' });
  return true;
}

function isTypingContext(target) {
  const el = target === undefined ? document.activeElement : target;
  if (!(el instanceof Element)) return false;
  if (!el) return false;
  try {
    if (el.hidden || el.disabled) return false;
    if (el.getClientRects && el.getClientRects().length === 0) return false;
  } catch {}
  const editable = el.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]');
  if (editable) return true;
  if (el.isContentEditable || el.closest?.('[contenteditable="true"], [contenteditable=""]')) return true;
  const editorSurface = el.closest?.([
    '.monaco-editor',
    '.cm-editor',
    '.CodeMirror',
    '.ace_editor',
    '[data-gramm]',
    '[data-slate-editor="true"]',
    '[data-lexical-editor="true"]'
  ].join(', '));
  if (editorSurface) return true;
  return false;
}

function isOverlayElementOpen(el) {
  if (!el) return false;
  if (el.classList?.contains('open')) return true;
  return el.getAttribute?.('aria-hidden') === 'false';
}

function isAnyOverlayOpen() {
  return !!(
    isOverlayElementOpen(globalElements.commandPaletteModal) ||
    isOverlayElementOpen(globalElements.paneManagerModal) ||
    isOverlayElementOpen(globalElements.agentsModal) ||
    isOverlayElementOpen(globalElements.shortcutsModal) ||
    isOverlayElementOpen(globalElements.settingsModal) ||
    isOverlayElementOpen(globalElements.workqueueModal) ||
    isOverlayElementOpen(globalElements.loginOverlay) ||
    paneManager?._addPaneMenuState?.open
  );
}

function isPaneNumberShortcutIntent(event) {
  if (!(event?.metaKey || event?.ctrlKey) || event.shiftKey || event.altKey) return false;
  const n = Number.parseInt(String(event.key || ''), 10);
  if (Number.isFinite(n) && n >= 1 && n <= 9) return true;
  return /^Digit[1-9]$/.test(String(event.code || ''));
}

function hasPaneNumberLayoutMismatch(event) {
  if (!isPaneNumberShortcutIntent(event)) return false;
  const keyNumber = Number.parseInt(String(event.key || ''), 10);
  return !(Number.isFinite(keyNumber) && keyNumber >= 1 && keyNumber <= 9);
}

function isTypingShortcutExempt(event) {
  const key = String(event?.key || '').toLowerCase();
  const override = matchingShortcutOverrideAction(event);
  if (override?.typingExempt) return true;
  if (matchesKeybind(event, 'workqueue.openForActiveChat')) return true;
  return (event?.metaKey || event?.ctrlKey) && !event.shiftKey && !event.altKey && (key === 'p' || key === 'k' || key === 'l');
}

function isNonTrivialGlobalShortcut(event) {
  if (!event) return false;
  if (KEYBIND_CATALOG.some((entry) => isGlobalKeybindEntry(entry) && matchesKeybind(event, entry.id))) return true;
  if (matchingShortcutOverrideAction(event)) return true;
  const key = String(event.key || '');
  const lower = key.toLowerCase();
  const hasMetaCtrl = !!(event.metaKey || event.ctrlKey);
  const isAccel = hasMetaCtrl && event.shiftKey;
  if (isAccel && ['c', 'w', 'r', 't', 'k', 'j', 'n', 'f', 'h'].includes(lower)) return true;
  if (hasMetaCtrl && event.altKey && !event.shiftKey && ['k', 'j'].includes(lower)) return true;
  if (isAccel && (key === ']' || key === '}' || key === '[' || key === '{')) return true;
  if (hasMetaCtrl && !event.shiftKey && !event.altKey && ['p', 'k', 'r'].includes(lower)) return true;
  if (hasMetaCtrl && !event.shiftKey && !event.altKey && lower === 'l') return true;
  if (event.ctrlKey && !event.metaKey && !event.altKey && key === 'Tab') return true;
  if ((key === '?' || (key === '/' && event.shiftKey)) && !event.metaKey && !event.ctrlKey && !event.altKey) return true;
  if (event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
    const n = Number.parseInt(key, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 9) return true;
  }
  return isPaneNumberShortcutIntent(event);
}

function blockedGlobalShortcutReason(event) {
  if (!isNonTrivialGlobalShortcut(event)) return '';
  const key = String(event.key || '');
  const isQuestion = (key === '?' || (key === '/' && event.shiftKey)) && !event.metaKey && !event.ctrlKey && !event.altKey;
  if (isQuestion && isAdminLocked()) return '';
  if (isAnyOverlayOpen()) return 'modal';
  if (isTypingContext(event.target) && !isTypingShortcutExempt(event)) return 'typing';
  if (hasPaneNumberLayoutMismatch(event)) return 'layout';
  return '';
}

function isShortcutOverrideEvent(event, combo) {
  if (!combo || Array.isArray(combo.sequence)) return false;
  if (normalizeShortcutKey(event?.key) !== normalizeShortcutKey(combo.key)) return false;
  if (!!combo.accel !== !!(event.metaKey || event.ctrlKey)) return false;
  if (!!combo.shift !== !!event.shiftKey) return false;
  if (!!combo.alt !== !!event.altKey) return false;
  if (combo.ctrl !== undefined && !!combo.ctrl !== !!event.ctrlKey) return false;
  if (combo.meta !== undefined && !!combo.meta !== !!event.metaKey) return false;
  return true;
}

function matchingShortcutOverrideAction(event) {
  if (isAnyOverlayOpen()) return null;
  for (const action of SHORTCUT_OVERRIDE_ACTIONS) {
    const combo = activeShortcutCombo(action.id);
    if (Array.isArray(combo?.sequence)) continue;
    if (isShortcutOverrideEvent(event, combo)) return action;
  }
  return null;
}

function closeTopmostOverlay() {
  if (paneManager?._addPaneMenuState?.open) {
    paneManager.closeAddPaneMenu();
    return true;
  }
  if (isCommandPaletteOpen()) {
    closeCommandPalette();
    return true;
  }
  if (isPaneManagerOpen()) {
    closePaneManager();
    return true;
  }
  if (isOverlayElementOpen(globalElements.agentsModal)) {
    closeAgentsModal();
    return true;
  }
  if (isOverlayElementOpen(globalElements.shortcutsModal)) {
    closeShortcuts();
    return true;
  }
  if (isOverlayElementOpen(globalElements.settingsModal)) {
    closeSettings();
    return true;
  }
  if (isOverlayElementOpen(globalElements.workqueueModal)) {
    closeWorkqueue();
    return true;
  }
  return false;
}

function focusPaneIndex(idx, { trackMru = true, showHud = false } = {}) {
  const pane = paneManager.panes[idx];
  if (!pane) return;
  const previousPaneKey = focusedPaneKey() || paneMruOrder()[0] || '';
  clearPaneUnread(pane);
  if (trackMru) notePaneFocused(pane);
  else {
    rememberActivePaneKey(pane.key);
    renderActivePaneState(pane);
    updateBrowserTitle(pane);
  }
  paneMarkSwitchSendGuard(pane, previousPaneKey);
  if (showHud) showPaneSwitchHud(pane);

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
      if (trackMru) {
        input.focus();
      } else {
        paneMruSuppressFocusEvents = true;
        try {
          input.focus();
        } finally {
          queueMicrotask(() => {
            paneMruSuppressFocusEvents = false;
          });
        }
      }
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
    if (trackMru) {
      focusable.focus();
    } else {
      paneMruSuppressFocusEvents = true;
      try {
        focusable.focus();
      } finally {
        queueMicrotask(() => {
          paneMruSuppressFocusEvents = false;
        });
      }
    }
  }
}

function focusPaneByHeaderLetter(letter, { showHud = true } = {}) {
  const wanted = String(letter || '').trim().toUpperCase();
  if (!/^[A-Z]$/.test(wanted)) return false;
  const idx = paneManager.panes.findIndex((pane) => paneHeaderLetter(pane).toUpperCase() === wanted);
  if (idx < 0) return false;
  focusPaneIndex(idx, { showHud });
  return true;
}

function returnToLastActiveChatPane() {
  const panes = paneManager?.panes || [];
  if (!panes.length) return false;

  const activeKey = focusedPaneKey();
  for (const key of paneMruOrder()) {
    if (!key || key === activeKey) continue;
    const idx = panes.findIndex((pane) => pane.key === key && pane.kind === 'chat');
    if (idx >= 0) {
      focusPaneIndex(idx);
      return true;
    }
  }

  const fallbackIdx = panes.findIndex((pane) => pane.kind === 'chat' && pane.key !== activeKey);
  if (fallbackIdx >= 0) {
    focusPaneIndex(fallbackIdx);
    return true;
  }

  showToast('No previous chat pane.', { kind: 'info', timeoutMs: 1800 });
  return false;
}

function focusChatComposer() {
  const panes = paneManager?.panes || [];
  if (!panes.length) {
    paneManager?.addPane?.('chat');
    return true;
  }

  const activeKey = focusedPaneKey();
  const activeIdx = panes.findIndex((pane) => pane.key === activeKey && pane.kind === 'chat');
  if (activeIdx >= 0) {
    focusPaneIndex(activeIdx);
    return true;
  }

  for (const key of paneMruOrder()) {
    const idx = panes.findIndex((pane) => pane.key === key && pane.kind === 'chat');
    if (idx >= 0) {
      focusPaneIndex(idx);
      return true;
    }
  }

  const fallbackIdx = panes.findIndex((pane) => pane.kind === 'chat');
  if (fallbackIdx >= 0) {
    focusPaneIndex(fallbackIdx);
    return true;
  }

  const pane = paneManager.addPane('chat');
  const idx = panes.indexOf(pane);
  if (idx >= 0) focusPaneIndex(idx);
  return true;
}

function cyclePaneFocus() {
  const panes = paneManager.panes;
  if (!panes || panes.length === 0) return;

  const active = document.activeElement;
  const idx = panes.findIndex((p) => p.elements?.root && (p.elements.root === active || p.elements.root.contains(active)));
  const next = idx >= 0 ? (idx + 1) % panes.length : 0;
  focusPaneIndex(next, { showHud: true });
}

function cyclePaneFocusBackward() {
  const panes = paneManager.panes;
  if (!panes || panes.length === 0) return;

  const active = document.activeElement;
  const idx = panes.findIndex((p) => p.elements?.root && (p.elements.root === active || p.elements.root.contains(active)));
  const next = idx >= 0 ? (idx - 1 + panes.length) % panes.length : panes.length - 1;
  focusPaneIndex(next, { showHud: true });
}

function cycleChatPaneFocus(direction = 1) {
  const panes = paneManager?.panes || [];
  const chatPanes = panes.filter((pane) => pane?.kind === 'chat');
  if (chatPanes.length < 2) {
    showToast('Only one Chat pane is open.', { kind: 'info', timeoutMs: 1600 });
    return false;
  }

  const activeKey = focusedPaneKey();
  const orderedKeys = [
    activeKey,
    ...paneMruOrder().filter((key) => key !== activeKey)
  ].filter((key) => chatPanes.some((pane) => pane.key === key));

  chatPanes.forEach((pane) => {
    if (pane?.key && !orderedKeys.includes(pane.key)) orderedKeys.push(pane.key);
  });

  const currentIndex = Math.max(0, orderedKeys.indexOf(activeKey));
  const step = direction >= 0 ? 1 : -1;
  const nextKey = orderedKeys[(currentIndex + step + orderedKeys.length) % orderedKeys.length];
  const nextIndex = panes.findIndex((pane) => pane?.key === nextKey);
  if (nextIndex < 0) return false;

  focusPaneIndex(nextIndex, { showHud: true });
  return true;
}

function cycleUnreadPaneFocus(direction = 1) {
  const panes = paneManager?.panes || [];
  if (!panes.length) return false;
  const unreadIndexes = panes
    .map((pane, idx) => ({ pane, idx }))
    .filter(({ pane }) => paneUnreadCount(pane) > 0)
    .map(({ idx }) => idx);
  if (!unreadIndexes.length) {
    showToast('No unread panes.', { kind: 'info', timeoutMs: 1800 });
    return false;
  }

  const active = document.activeElement;
  const currentIdx = panes.findIndex((p) => p.elements?.root && (p.elements.root === active || p.elements.root.contains(active)));

  const dir = direction >= 0 ? 1 : -1;
  const ordered = dir > 0 ? unreadIndexes : unreadIndexes.slice().reverse();
  const pick = ordered.find((idx) => dir > 0 ? idx > currentIdx : idx < currentIdx);
  const next = Number.isInteger(pick) ? pick : ordered[0];
  focusPaneIndex(next, { showHud: true });
  return true;
}

function isBlockingOverlayOpenForPaneShortcuts() {
  const blockers = [
    globalElements.loginOverlay,
    globalElements.settingsModal,
    globalElements.shortcutsModal,
    globalElements.commandPaletteModal,
    globalElements.paneManagerModal,
    globalElements.workqueueModal,
    globalElements.agentsModal
  ];
  return blockers.some((el) => !!el?.classList?.contains('open')) || !!paneManager?._addPaneMenuState?.open;
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Alt' && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
    paneShortcutBadgesAltHeld = true;
    updatePaneShortcutBadges();
  }

  const isEditableTarget = isTypingContext(event.target);

  if (event.key === 'Escape') {
    const closedOverlay = closeTopmostOverlay();
    if (closedOverlay || !isEditableTarget) {
      event.preventDefault();
    }
    if (closedOverlay) event.stopPropagation();
    return;
  }

  // If Pane Manager is open, it gets first dibs on keys.
  if (paneManagerHandleKeydown(event)) return;
  if (event.defaultPrevented) return;

  if (matchesKeybind(event, 'triage.return') && roleState.role === 'admin' && isAgentsModalOpen()) {
    event.preventDefault();
    returnToTriageSource();
    return;
  }

  const blockedReason = blockedGlobalShortcutReason(event);
  if (blockedReason) {
    event.preventDefault();
    event.stopPropagation();
    reportBlockedShortcut(blockedReason);
    return;
  }

  if (matchesKeybind(event, 'triage.return') && roleState.role === 'admin') {
    event.preventDefault();
    returnToTriageSource();
    return;
  }

  const overrideAction = matchingShortcutOverrideAction(event);
  if (overrideAction && (!isTypingContext(event.target) || overrideAction.typingExempt)) {
    event.preventDefault();
    overrideAction.run();
    return;
  }

  // Reopen closed pane (admin-only)
  if (matchesKeybind(event, 'pane.reopenClosed') && roleState.role === 'admin' && !isTypingContext(event.target) && !isAnyOverlayOpen()) {
    event.preventDefault();
    paneManager.closeAddPaneMenu();
    paneManager.reopenLastClosedPane();
    return;
  }

  // Add-pane shortcuts (admin-only)
  // Ctrl/Cmd+Shift+C → new chat
  // Ctrl/Cmd+Shift+W → focus matching workqueue target (Alt/Option adds anyway)
  // Ctrl/Cmd+Shift+R → focus matching cron target (Alt/Option adds anyway)
  // Ctrl/Cmd+Shift+Y → focus matching timeline target (Alt/Option adds anyway)
  const isAccel = (event.metaKey || event.ctrlKey) && event.shiftKey;
  if (isAccel && roleState.role === 'admin' && !isAnyOverlayOpen()) {
    if (matchesKeybind(event, 'workqueue.openForActiveChat')) {
      event.preventDefault();
      openWorkqueueForActiveChatAgent();
      return;
    }
    if (matchesKeybindWithOptionalAlt(event, 'triage.return') && !event.altKey) {
      event.preventDefault();
      paneManager.closeAddPaneMenu();
      returnToTriageSource();
      return;
    }
    if (isTypingContext(event.target)) return;
    const addPaneShortcuts = [
      ['pane.addChat', 'chat'],
      ['pane.addWorkqueue', 'workqueue'],
      ['pane.addCron', 'cron'],
      ['pane.addTimeline', 'timeline']
    ];
    const match = addPaneShortcuts.find(([id]) => matchesKeybindWithOptionalAlt(event, id));
    const kind = match?.[1] || '';
    if (kind) {
      // Don't hijack add-pane shortcuts while typing or while overlays are active.
      event.preventDefault();
      paneManager.closeAddPaneMenu();
      paneManager.addPane(kind, { forceNew: !!event.altKey });
      return;
    }
  }

  // Cmd/Ctrl+P opens Pane Manager (even while typing).
  if (matchesKeybind(event, 'pane.manager')) {
    event.preventDefault();
    openPaneManager();
    return;
  }

  // Cmd/Ctrl+K opens command palette (even while typing).
  if (matchesKeybind(event, 'command.palette')) {
    event.preventDefault();
    openCommandPalette();
    return;
  }

  // Cmd/Ctrl+L focuses the active/most recent Chat composer (even while typing).
  if (matchesKeybind(event, 'chat.composer')) {
    event.preventDefault();
    focusChatComposer();
    return;
  }

  if (!event.defaultPrevented && roleState.role === 'admin') {
    const activeKey = focusedPaneKey() || paneMruOrder()[0] || '';
    const activePane = (paneManager?.panes || []).find((pane) => String(pane?.key || '') === activeKey);
    if (activePane?.kind === 'workqueue' && activePane?.workqueue?.keyboardMode) {
      if (handleWorkqueuePaneKeyboard(event, activePane)) return;
    }
  }

  const key = String(event.key || '');

  const isQuestion = key === '?' || (key === '/' && event.shiftKey);
  if (isAdminLocked() && isQuestion && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    openShortcuts();
    return;
  }

  // Never steal focus / override browser shortcuts while typing.
  if (isTypingContext(event.target)) return;
  if (
    isAgentsModalOpen() &&
    roleState.role === 'admin' &&
    key.toLowerCase() === 'r' &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  ) {
    event.preventDefault();
    globalElements.agentsRefreshStateBtn?.click?.();
    return;
  }
  if (isAnyOverlayOpen()) return;

  // Ctrl+Tab walks panes in most-recently-used order; Shift reverses the traversal.
  if (matchesKeybind(event, 'pane.mruNext') || matchesKeybind(event, 'pane.mruPrev')) {
    if (isTypingContext(document.activeElement) && !paneMruTraversal) return;
    event.preventDefault();
    switchPaneByMru(matchesKeybind(event, 'pane.mruPrev') ? -1 : 1);
    return;
  }

  if (isQuestion && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    openShortcuts();
    return;
  }

  // Alt/Option+1..9 focuses panes by visible order.
  if (event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
    const n = Number.parseInt(key, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 9) {
      event.preventDefault();
      focusPaneIndex(n - 1, { showHud: true });
      return;
    }
  }

  // Cmd/Ctrl+1..9 focuses panes by visible order (layout-safe fallback to Alt/Option).
  if (matchesKeybind(event, 'pane.focusVisibleAccel')) {
    const n = Number.parseInt(key, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 9) {
      event.preventDefault();
      focusPaneIndex(n - 1, { showHud: true });
      return;
    }
  }

  // Cmd/Ctrl+Shift+K cycles focus across panes.
  if (matchesKeybind(event, 'pane.next')) {
    event.preventDefault();
    cyclePaneFocus();
    return;
  }

  // Cmd/Ctrl+Shift+J cycles focus backward across panes.
  if (matchesKeybind(event, 'pane.prev')) {
    event.preventDefault();
    cyclePaneFocusBackward();
    return;
  }

  // Cmd/Ctrl+Alt+K/J cycles only Chat panes, skipping Workqueue/Cron/Timeline/Fleet panes.
  if (matchesKeybind(event, 'chat.next')) {
    event.preventDefault();
    cycleChatPaneFocus(1);
    return;
  }
  if (matchesKeybind(event, 'chat.prev')) {
    event.preventDefault();
    cycleChatPaneFocus(-1);
    return;
  }

  // Cmd/Ctrl+Shift+] jumps to next unread pane; Cmd/Ctrl+Shift+[ goes backward.
  if (matchesKeybind(event, 'pane.unreadNext')) {
    event.preventDefault();
    cycleUnreadPaneFocus(1);
    return;
  }
  if (matchesKeybind(event, 'pane.unreadPrev')) {
    event.preventDefault();
    cycleUnreadPaneFocus(-1);
    return;
  }

  // Cmd/Ctrl+Shift+N opens Add pane menu.
  if (matchesKeybind(event, 'pane.addMenu') && !isAnyOverlayOpen()) {
    event.preventDefault();
    paneManager.openAddPaneMenu(globalElements.addPaneBtn);
    return;
  }

  // Cmd/Ctrl+Shift+F opens/focuses Fleet pane.
  if (matchesKeybind(event, 'fleet.open')) {
    event.preventDefault();
    openFleetPane();
    return;
  }

  // Cmd/Ctrl+Shift+L toggles paired target lock on focused Chat/Workqueue pane.
  if (matchesKeybind(event, 'workqueue.togglePair')) {
    const focusedKey = focusedPaneKey();
    const pane = paneManager.panes.find((p) => p?.key === focusedKey) || paneManager.panes[0] || null;
    if (paneSupportsTargetLock(pane)) {
      event.preventDefault();
      paneToggleTargetLock(pane);
      return;
    }
  }

  // Cmd/Ctrl+Shift+H opens Agents and sorts by heartbeat age (stale first).
  if (matchesKeybind(event, 'fleet.sortHeartbeatGlobal')) {
    event.preventDefault();
    if (roleState.role === 'admin') {
      openAgentsModal();
      setFleetHeartbeatSort();
      showToast('Sorted fleet by heartbeat age.', { kind: 'info', timeoutMs: 1800 });
    }
    return;
  }

  // Cmd/Ctrl+R refreshes agent list (instead of page reload).
  if (matchesKeybind(event, 'agents.refresh')) {
    event.preventDefault();
    globalElements.refreshAgentsBtn?.click?.();
    showToast('Refreshed agents.', { kind: 'info', timeoutMs: 1800 });
    return;
  }

  // 'g' chords jump between common triage surfaces.
  const now = Date.now();
  if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    if (key.toLowerCase() === 'g') {
      shortcutState.lastGAtMs = now;
      event.preventDefault();
      return;
    }
    if (shortcutState.lastGAtMs && now - shortcutState.lastGAtMs < GO_TO_PANE_TIMEOUT_MS && /^[a-z]$/i.test(key)) {
      shortcutState.lastGAtMs = 0;
      event.preventDefault();
      if (key.toLowerCase() === 't') {
        returnToTriageSource();
        return;
      }
      if (focusPaneByHeaderLetter(key, { showHud: true })) return;
      if (key.toLowerCase() === 'c') {
        returnToLastActiveChatPane();
        return;
      }
      if (key.toLowerCase() === 'w') {
        openTopbarWorkqueueAction();
        return;
      }
      return;
    }
    if (shortcutState.lastGAtMs && now - shortcutState.lastGAtMs >= GO_TO_PANE_TIMEOUT_MS) {
      shortcutState.lastGAtMs = 0;
    }
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key !== 'Alt') return;
  paneShortcutBadgesAltHeld = false;
  updatePaneShortcutBadges();
});

window.addEventListener('blur', () => {
  if (!paneShortcutBadgesAltHeld) return;
  paneShortcutBadgesAltHeld = false;
  updatePaneShortcutBadges();
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

if (globalElements.resetLayoutBtn) {
  globalElements.resetLayoutBtn.textContent = 'Reset to recommended layout';
}

globalElements.resetLayoutBtn?.addEventListener('click', () => {
  paneManager.resetAdminLayoutToDefault({ confirm: true });
});

globalElements.layoutLockBtn?.addEventListener('click', () => {
  paneManager.toggleLayoutLocked({ notify: true });
});

globalElements.paneManagerBtn?.addEventListener('click', (event) => {
  event?.preventDefault?.();
  openPaneManager({ attentionOnly: !!event?.shiftKey });
});

globalElements.paneManagerCloseBtn?.addEventListener('click', () => closePaneManager());

globalElements.paneManagerSearch?.addEventListener('input', () => {
  paneManagerUiState.query = String(globalElements.paneManagerSearch?.value || '').trim();
  paneManagerUiState.selectedIndex = 0;
  paneManagerUiState.attentionOnly = false;
  renderPaneManager();
});

globalElements.paneManagerSearch?.addEventListener('keydown', (event) => {
  if (paneManagerHandleKeydown(event)) event.stopPropagation();
});

globalElements.paneManagerUnreadOnly?.addEventListener('change', () => {
  paneManagerUiState.unreadOnly = !!globalElements.paneManagerUnreadOnly?.checked;
  paneManagerUiState.selectedIndex = 0;
  paneManagerUiState.attentionOnly = false;
  renderPaneManager();
});

globalElements.paneManagerModal?.addEventListener('click', (event) => {
  if (event.target === globalElements.paneManagerModal) closePaneManager();
});

globalElements.status?.addEventListener('click', () => {
  if (!uiState.authed) {
    showLogin('Please sign in to continue.');
    return;
  }
  paneManager.panes.forEach((pane) => {
    if (pane?.client?.manualDisconnect) pane.client.manualDisconnect = false;
  });
  paneManager.connectIfNeeded();
});

globalElements.rolePill?.addEventListener('click', () => {
  if (!uiState.authed) {
    closeAuthSessionPopover();
    showLogin('Please sign in to continue.');
    return;
  }
  renderAuthSessionUi();
  const popover = globalElements.authSessionPopover;
  if (!popover) return;
  const nextOpen = popover.hidden;
  popover.hidden = !nextOpen;
  globalElements.rolePill.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
});

globalElements.authSessionPopover?.addEventListener('click', async (event) => {
  const btn = event.target instanceof HTMLElement ? event.target.closest('[data-auth-session-action]') : null;
  if (!btn) return;
  const action = btn.getAttribute('data-auth-session-action');
  if (action === 'settings') {
    closeAuthSessionPopover();
    openSettings();
    return;
  }
  if (action === 'unlock') {
    closeAuthSessionPopover();
    showLogin('Please sign in to continue.');
    return;
  }
  if (action === 'logout') {
    closeAuthSessionPopover();
    try {
      await fetch('/auth/logout', { method: 'POST' });
    } catch {}
    storage.set('clawnsole.auth.role', '');
    paneManager.disconnectAll({ silent: true });
    roleState.role = null;
    window.location.replace('/');
  }
});

document.addEventListener('click', (event) => {
  const target = event.target instanceof Node ? event.target : null;
  if (!target || !globalElements.authSessionPopover || globalElements.authSessionPopover.hidden) return;
  if (globalElements.rolePill?.contains(target) || globalElements.authSessionPopover.contains(target)) return;
  closeAuthSessionPopover();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeAuthSessionPopover();
});

globalElements.loginBtn?.addEventListener('click', () => attemptLogin());
globalElements.loginPassword?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    attemptLogin();
  }
});

globalElements.logoutBtn?.addEventListener('click', async () => {
  if (!uiState.authed) {
    showLogin();
    return;
  }
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

globalElements.activePaneChip?.addEventListener('click', () => {
  const pane = activePaneFromState();
  const idx = paneManager?.panes?.indexOf?.(pane) ?? -1;
  if (idx >= 0) focusPaneIndex(idx, { showHud: true });
});

globalElements.addChatPaneBtn?.addEventListener('click', (event) => {
  event?.preventDefault?.();
  paneManager.addPane('chat');
});

globalElements.addQueuePaneBtn?.addEventListener('click', (event) => {
  event?.preventDefault?.();
  paneManager.addPane('workqueue');
});

globalElements.triageLayoutPresetBtn?.addEventListener('click', (event) => {
  event?.preventDefault?.();
  applyTriageLayoutPreset();
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
        if (uiState.agents.length > 0) {
          agentsLastRefreshedAtMs = Date.now();
        }
        if (uiState.agents.length === 0) {
          uiState.agents = [{ id: 'main', name: 'main', displayName: 'main', emoji: '' }];
        }
      }

      paneManager.init();
      applyPendingAdminRestore();

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
