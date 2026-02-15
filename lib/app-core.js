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

  const AppCore = { escapeHtml, fmtRemaining, sortWorkqueueItems };

  try {
    if (typeof module !== 'undefined' && module.exports) module.exports = AppCore;
  } catch {}

  try {
    root.AppCore = Object.assign({}, root.AppCore || {}, AppCore);
  } catch {}
})(typeof window !== 'undefined' ? window : globalThis);
