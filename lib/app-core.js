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
      if (v === 'failed') return 4;
      if (v === 'done') return 5;
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

        // Default: priority-first (desc), then recency, then status rank as a stable tie-breaker.
        if (sortKey === 'default') {
          const pr = numOr0(B.priority) - numOr0(A.priority);
          if (pr) return pr;
          const ur = timeOr0(B.updatedAt) - timeOr0(A.updatedAt);
          if (ur) return ur;
          const cr = timeOr0(B.createdAt) - timeOr0(A.createdAt);
          if (cr) return cr;
          const sr = statusRank(A.status) - statusRank(B.status);
          if (sr) return sr;
          return a.idx - b.idx;
        }

        if (sortKey === 'status') {
          const sr = (statusRank(A.status) - statusRank(B.status)) * dir;
          if (sr) return sr;
        }

        if (sortKey === 'priority') {
          const pr = (numOr0(A.priority) - numOr0(B.priority)) * dir;
          if (pr) return pr;
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
          const av = String(A.title || '');
          const bv = String(B.title || '');
          const r = av.localeCompare(bv);
          if (r) return r * dir;
        }

        // Stable fallback.
        return a.idx - b.idx;
      })
      .map((x) => x.it);
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

  function deriveInitialWorkqueueScope({ kind = 'chat', role = null, agentId = '', scope = '' } = {}) {
    const explicit = String(scope || '').trim().toLowerCase();
    if (explicit === 'assigned' || explicit === 'unassigned' || explicit === 'all') return explicit;

    const paneKind = String(kind || '').trim().toLowerCase();
    if (paneKind !== 'workqueue') return 'all';
    if (String(role || '').trim().toLowerCase() !== 'admin') return 'all';

    const target = String(agentId || '').trim().toLowerCase();
    return target && target !== 'main' ? 'assigned' : 'all';
  }

  function deriveWorkqueueDisplayTitle(item) {
    const rawTitle = String(item?.title || '').trim();
    const kind = String(item?.meta?.kind || '').trim().toLowerCase();
    const issueUrl = String(item?.meta?.issueUrl || item?.meta?.url || '').trim();

    const looksIssue = kind === 'issue' || rawTitle.toLowerCase().startsWith('[issue]') || /\/issues\/\d+$/i.test(issueUrl);
    if (!looksIssue) return { title: rawTitle, rawTitle, canonicalized: false };

    const repoFromMeta = String(item?.meta?.repo || '').trim();
    const repoFromUrl = (() => {
      const m = issueUrl.match(/github\.com\/([^\s/]+\/[^\s/#?]+)\/issues\/\d+/i);
      return m?.[1] ? String(m[1]).trim() : '';
    })();
    const repoFromTitle = (() => {
      const m = rawTitle.match(/([a-z0-9_.-]+\/[a-z0-9_.-]+)#\d+/i);
      return m?.[1] ? String(m[1]).trim() : '';
    })();
    const repo = repoFromMeta || repoFromUrl || repoFromTitle;

    const issueNumber = (() => {
      const n = Number(item?.meta?.issueNumber);
      if (Number.isFinite(n) && n > 0) return String(Math.trunc(n));
      const fromUrl = issueUrl.match(/\/issues\/(\d+)/i)?.[1] || '';
      if (fromUrl) return fromUrl;
      const fromTitle = rawTitle.match(/#(\d+)/)?.[1] || '';
      return fromTitle;
    })();

    let cleaned = rawTitle
      .replace(/^\s*\[[^\]]+\]\s*/i, '')
      .replace(/^\s*(?:open issue|triager|issue coverage)\s*:\s*/i, '')
      .trim();
    if (repo && issueNumber) {
      const locatorRe = new RegExp(`^${repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}#${issueNumber}(?:\s*[\-–—:]\s*)?`, 'i');
      cleaned = cleaned.replace(locatorRe, '').trim();
    }
    cleaned = cleaned.replace(/^#\d+(?:\s*[\-–—:]\s*)?/, '').trim();

    const canonical = repo && issueNumber
      ? (cleaned ? `${repo}#${issueNumber} — ${cleaned}` : `${repo}#${issueNumber}`)
      : cleaned || rawTitle;

    return {
      title: canonical,
      rawTitle,
      canonicalized: canonical !== rawTitle
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

  function detectShortcutConflict(keysText, { platform = '' } = {}) {
    const normalized = String(keysText || '').toLowerCase().replace(/\s+/g, '');
    if (!normalized) return null;

    const isMac = String(platform || '').toLowerCase().includes('mac');

    if (normalized.includes('cmd/ctrl+r') || normalized.includes('cmd+ctrl+r') || normalized.includes('cmd+rr') || normalized.includes('ctrl+r')) {
      return {
        level: 'warn',
        reason: 'Often intercepted by browser refresh before web apps can handle it.',
        suggestion: isMac ? 'Use Cmd+Shift+G, or click Refresh in Agents.' : 'Use Ctrl+Shift+G, or click Refresh in Agents.'
      };
    }

    if (normalized.includes('ctrl+tab')) {
      return {
        level: 'warn',
        reason: 'Usually reserved by browsers for tab switching.',
        suggestion: isMac ? 'Use Cmd+Shift+K / Cmd+Shift+J for pane navigation.' : 'Use Ctrl+Shift+K / Ctrl+Shift+J for pane navigation.'
      };
    }

    return null;
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
    sortWorkqueueItems,
    inferPaneCols,
    normalizePaneKind,
    deriveInitialWorkqueueScope,
    deriveAuthOverlayState,
    extractChatText,
    normalizeHistoryEntries,
    detectShortcutConflict,
    renderMarkdown,
    deriveWorkqueueDisplayTitle
  };

  try {
    if (typeof module !== 'undefined' && module.exports) module.exports = AppCore;
  } catch {}

  try {
    root.AppCore = Object.assign({}, root.AppCore || {}, AppCore);
  } catch {}
})(typeof window !== 'undefined' ? window : globalThis);
