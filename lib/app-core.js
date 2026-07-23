// lib/app-core.js
// Shared pure helpers extracted from app.js so they can be unit-tested under Node.
//
// - In browser: attaches to window.AppCore
// - In Node: module.exports = AppCore
(function attachAppCore(root) {
  function escapeHtml(value) {
    const s = String(value ?? '');
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  function sortWorkqueueItems(items, { sortKey = 'default', sortDir = 'desc' } = {}) {
    const dir = sortDir === 'asc' ? 1 : -1;
    const statusRank = (s) => {
      const v = String(s || '').trim();
      if (v === 'in_progress') return 0;
      if (v === 'claimed') return 1;
      if (v === 'ready') return 2;
      if (v === 'pending') return 3;
      if (v === 'blocked') return 4;
      if (v === 'failed') return 5;
      if (v === 'done') return 6;
      return 6;
    };

    const numOr0 = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
    const timeOr0 = (v) => {
      if (!v) return 0;
      const n = Date.parse(String(v));
      return Number.isFinite(n) ? n : 0;
    };
    const leaseOr0 = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

    return (Array.isArray(items) ? items : [])
      .map((it, idx) => ({ it, idx }))
      .sort((a, b) => {
        const A = a.it || {};
        const B = b.it || {};

        // Default: status grouping (active first), then priority desc, then updatedAt desc, then createdAt desc.
        if (sortKey === 'default') {
          const sr = statusRank(A.status) - statusRank(B.status);
          if (sr) return sr;
          const pr = numOr0(B.priority) - numOr0(A.priority);
          if (pr) return pr;
          const ur = timeOr0(B.updatedAt) - timeOr0(A.updatedAt);
          if (ur) return ur;
          const cr = timeOr0(B.createdAt) - timeOr0(A.createdAt);
          if (cr) return cr;
          return a.idx - b.idx;
        }

        if (sortKey === 'status') {
          const sr = (statusRank(A.status) - statusRank(B.status)) * dir;
          if (sr) return sr;
        }

        if (sortKey === 'priority') {
          const pr = (numOr0(A.priority) - numOr0(B.priority)) * dir;
          if (pr) return pr;
          // Deterministic tiebreaker for equal priority items.
          // Prefer most recently updated, then created.
          const ur = timeOr0(B.updatedAt) - timeOr0(A.updatedAt);
          if (ur) return ur;
          const cr = timeOr0(B.createdAt) - timeOr0(A.createdAt);
          if (cr) return cr;
        }

        if (sortKey === 'updatedAt') {
          const ur = (timeOr0(A.updatedAt) - timeOr0(B.updatedAt)) * dir;
          if (ur) return ur;
        }

        if (sortKey === 'createdAt') {
          const cr = (timeOr0(A.createdAt) - timeOr0(B.createdAt)) * dir;
          if (cr) return cr;
        }

        if (sortKey === 'leaseUntil') {
          const lr = (leaseOr0(A.leaseUntil) - leaseOr0(B.leaseUntil)) * dir;
          if (lr) return lr;
        }

        if (sortKey === 'attempts') {
          const ar = (numOr0(A.attempts) - numOr0(B.attempts)) * dir;
          if (ar) return ar;
        }

        if (sortKey === 'claimedBy') {
          const av = String(A.claimedBy || '');
          const bv = String(B.claimedBy || '');
          const r = av.localeCompare(bv);
          if (r) return r * dir;
        }

        if (sortKey === 'title') {
          const av = formatWorkqueueIssueTitle(A);
          const bv = formatWorkqueueIssueTitle(B);
          const r = av.localeCompare(bv);
          if (r) return r * dir;
        }

        // Stable fallback.
        return a.idx - b.idx;
      })
      .map((x) => x.it);
  }

  function normalizeWorkqueueIssueRepo(value) {
    const s = String(value || '').trim().toLowerCase();
    if (!s || !/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/.test(s)) return '';
    return s;
  }

  function normalizeWorkqueueIssueNumber(value) {
    const s = String(value || '').trim().replace(/^#/, '');
    return /^\d+$/.test(s) ? s : '';
  }

  function parseWorkqueueIssueRef(value) {
    const src = String(value || '');
    if (!src) return null;

    const metaUrl = src.match(/github\.com\/([a-z0-9_.-]+\/[a-z0-9_.-]+)\/issues\/(\d+)/i);
    if (metaUrl) {
      const repo = normalizeWorkqueueIssueRepo(metaUrl[1]);
      const issueNumber = normalizeWorkqueueIssueNumber(metaUrl[2]);
      if (repo && issueNumber) return { repo, issueNumber };
    }

    const repoRefPattern = String.raw`([a-z0-9_.-]+)\s*\/\s*([a-z0-9_.-]+)`;
    const fullRef = src.match(new RegExp(String.raw`(?:^|[\s[(])(?:issue:)?${repoRefPattern}\s*#\s*(\d+)\b`, 'i'));
    if (fullRef) {
      const repo = normalizeWorkqueueIssueRepo(`${fullRef[1]}/${fullRef[2]}`);
      const issueNumber = normalizeWorkqueueIssueNumber(fullRef[3]);
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

  function getWorkqueueIssueRef(item) {
    const meta = item?.meta && typeof item.meta === 'object' ? item.meta : {};
    const explicitRepo = normalizeWorkqueueIssueRepo(meta.repo || item?.repo);
    const explicitIssue = normalizeWorkqueueIssueNumber(meta.issueNumber || meta.issue || item?.issueNumber || item?.issue);
    if (explicitRepo && explicitIssue) return { repo: explicitRepo, issueNumber: explicitIssue };

    return (
      parseWorkqueueIssueRef(item?.dedupeKey) ||
      parseWorkqueueIssueRef(meta.dedupeKey) ||
      parseWorkqueueIssueRef(meta.url) ||
      parseWorkqueueIssueRef(item?.instructions) ||
      parseWorkqueueIssueRef(item?.title)
    );
  }

  function stripWorkqueueIssueTitlePrefix(title, ref) {
    let text = String(title || '').trim();
    if (!text) return '';

    text = text
      .replace(/^\s*\[(?:issue|open issue|issue coverage)\]\s*/i, '')
      .replace(/^\s*(?:open\s+issue|issue\s+coverage|issue)\s*:\s*/i, '')
      .trim();

    if (ref?.repo && ref?.issueNumber) {
      const escapedRepo = ref.repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('/', String.raw`\s*\/\s*`);
      const refPattern = new RegExp(String.raw`^\s*${escapedRepo}\s*#\s*${ref.issueNumber}\b\s*(?:[-:|]+)?\s*`, 'i');
      text = text.replace(refPattern, '').trim();
    }

    text = text
      .replace(/^[-:|]+\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  }

  function formatWorkqueueIssueTitle(item) {
    const rawTitle = String(item?.title || '').trim();
    const ref = getWorkqueueIssueRef(item);
    if (!ref?.repo || !ref?.issueNumber) return rawTitle;

    const displayTitle = stripWorkqueueIssueTitlePrefix(rawTitle, ref);
    return `[ISSUE] ${ref.repo}#${ref.issueNumber}${displayTitle ? ` - ${displayTitle}` : ''}`;
  }

  function getWorkqueueDedupeKey(item) {
    const meta = item?.meta && typeof item.meta === 'object' ? item.meta : {};
    return String(meta.dedupeKey || item?.dedupeKey || '').trim();
  }

  function summarizeExactWorkqueueDuplicateRows(items) {
    const source = Array.isArray(items) ? items : [];
    const grouped = new Map();
    for (const item of source) {
      const dedupeKey = getWorkqueueDedupeKey(item);
      if (!dedupeKey) continue;
      const title = formatWorkqueueIssueTitle(item).trim();
      const status = String(item?.status || '').trim();
      const key = JSON.stringify([dedupeKey, title, status]);
      if (!grouped.has(key)) grouped.set(key, { key, dedupeKey, title, status, items: [] });
      grouped.get(key).items.push(item);
    }

    const duplicateGroups = Array.from(grouped.values())
      .filter((group) => group.items.length > 1)
      .map((group) => ({
        kind: 'exact_duplicate',
        key: `exact:${group.key}`,
        dedupeKey: group.dedupeKey,
        items: group.items,
        representative: group.items[0],
        title: group.title,
        status: group.status,
        count: group.items.length
      }));

    const byKey = new Map(duplicateGroups.map((group) => [group.key, group]));
    const itemToGroupKey = new Map();
    for (const group of duplicateGroups) {
      for (const item of group.items) {
        if (item?.id) itemToGroupKey.set(String(item.id), group.key);
      }
    }

    const rows = [];
    const emitted = new Set();
    for (const item of source) {
      const groupKey = item?.id ? itemToGroupKey.get(String(item.id)) : '';
      if (!groupKey) {
        rows.push({ kind: 'item', item });
        continue;
      }
      if (emitted.has(groupKey)) continue;
      const group = byKey.get(groupKey);
      if (group) rows.push(group);
      emitted.add(groupKey);
    }
    return rows;
  }

  function inferPaneCols(count) {
    const n = Number(count);
    if (!Number.isFinite(n) || n <= 1) return 1;
    if (n === 2) return 2;
    if (n === 3) return 3;
    if (n === 4) return 2;
    // 5-6 panes: pack into 3 columns.
    return 3;
  }

  function normalizePaneKind(rawKind) {
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
  }

  function normalizeAdminDestination(candidate, { origin = '', now = Date.now(), ttlMs = 10 * 60 * 1000 } = {}) {
    const value = candidate && typeof candidate === 'object' ? candidate : {};
    const href = typeof value.href === 'string' ? value.href.trim() : '';
    if (!href) return { ok: false, reason: 'missing' };

    const createdAt = Number(value.createdAt || 0);
    if (createdAt > 0 && Number.isFinite(ttlMs) && ttlMs > 0 && now - createdAt > ttlMs) {
      return { ok: false, reason: 'stale' };
    }

    let url;
    try {
      url = new URL(href, origin || 'http://127.0.0.1');
    } catch {
      return { ok: false, reason: 'invalid' };
    }

    if (origin) {
      let base;
      try {
        base = new URL(origin);
      } catch {
        return { ok: false, reason: 'invalid_origin' };
      }
      if (url.origin !== base.origin) return { ok: false, reason: 'external' };
    }

    if (!(url.pathname === '/admin' || url.pathname.startsWith('/admin/'))) {
      return { ok: false, reason: 'outside_admin' };
    }

    const normalized = `${url.pathname}${url.search}${url.hash}`;
    return {
      ok: true,
      href: normalized || '/admin',
      activePaneKey: typeof value.activePaneKey === 'string' ? value.activePaneKey : ''
    };
  }

  function deriveAuthOverlayState({ authed, role = null } = {}) {
    const isAdmin = role === 'admin';
    return {
      isAdmin,
      startAgentAutoRefresh: isAdmin && !!authed,
      stopAgentAutoRefresh: !isAdmin || !authed,
      rolePillText: isAdmin ? 'signed in' : (role || 'signed out'),
      rolePillAdmin: isAdmin,
      showAdminControls: isAdmin,
      logoutEnabled: !!authed,
      logoutOpacity: authed ? '1' : '0.5'
    };
  }

  function deriveGlobalConnectionState({ authed, panes } = {}) {
    if (!authed) {
      return { state: 'disconnected', meta: 'sign in required' };
    }

    const list = Array.isArray(panes) ? panes : [];
    if (list.length === 0) {
      return { state: 'disconnected', meta: '' };
    }

    const connectedCount = list.filter((pane) => !!pane?.connected).length;
    const total = list.length;
    const anyConnecting = list.some((pane) => pane?.statusState === 'connecting' || pane?.statusState === 'reconnecting');
    const anyError = list.some((pane) => pane?.statusState === 'error');
    const firstError = list.find((pane) => pane?.statusState === 'error' && pane?.statusMeta);

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
        ? String(firstError.statusMeta || '')
        : `panes: ${connectedCount}/${total} connected`;

    return { state, meta };
  }

  function deriveDisconnectButtonState({ authed, panes } = {}) {
    if (!authed) {
      return { disabled: true, text: 'Reconnect' };
    }

    const list = Array.isArray(panes) ? panes : [];
    const anyActive = list.some((pane) =>
      pane?.statusState === 'connected' || pane?.statusState === 'connecting' || pane?.statusState === 'reconnecting'
    );
    return { disabled: false, text: anyActive ? 'Disconnect' : 'Reconnect' };
  }

  function extractChatText(message) {
    if (!message) return '';
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) {
      return message
        .map((part) => {
          if (!part) return '';
          if (typeof part.text === 'string') return part.text;
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
          if (typeof part.url === 'string') {
            return `\n\n${part.url}\n\n`;
          }
          return '';
        })
        .filter(Boolean)
        .join('');
    }
    if (typeof message.text === 'string') return message.text;
    if (Array.isArray(message.content)) {
      return message.content
        .map((part) => {
          if (!part) return '';
          if (typeof part.text === 'string') return part.text;

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

  const AppCore = {
    escapeHtml,
    fmtRemaining,
    formatWorkqueueIssueTitle,
    summarizeExactWorkqueueDuplicateRows,
    sortWorkqueueItems,
    inferPaneCols,
    normalizePaneKind,
    normalizeAdminDestination,
    deriveAuthOverlayState,
    deriveGlobalConnectionState,
    deriveDisconnectButtonState,
    extractChatText,
    normalizeHistoryEntries,
    renderMarkdown
  };

  try {
    if (typeof module !== 'undefined' && module.exports) module.exports = AppCore;
  } catch {}

  try {
    root.AppCore = Object.assign({}, root.AppCore || {}, AppCore);
  } catch {}
})(typeof window !== 'undefined' ? window : globalThis);
