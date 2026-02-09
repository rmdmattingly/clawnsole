const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

function nowMs() {
  return Date.now();
}

function toInt(value, fallback) {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function defaultDataRoot() {
  const openclawHome = process.env.OPENCLAW_HOME || path.join(os.homedir(), '.openclaw');
  return path.join(openclawHome, 'clawnsole');
}

function statePaths(rootDir) {
  const dir = rootDir || defaultDataRoot();
  return {
    dir,
    stateFile: path.join(dir, 'work-queues.json'),
    lockFile: path.join(dir, 'work-queues.lock')
  };
}

function readJson(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(filePath, data) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  const tmp = `${filePath}.tmp.${process.pid}.${nowMs()}`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, filePath);
}

function normalizeState(state) {
  const s = state && typeof state === 'object' ? state : {};
  const queues = s.queues && typeof s.queues === 'object' ? s.queues : {};
  const items = Array.isArray(s.items) ? s.items : [];
  const assignments = s.assignments && typeof s.assignments === 'object' ? s.assignments : {};
  return {
    version: 1,
    queues,
    items,
    assignments
  };
}

function withFileLock(lockPath, fn, opts = {}) {
  const staleMs = opts.staleMs ?? 60_000;
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const start = nowMs();

  ensureDir(path.dirname(lockPath));

  while (true) {
    let fd;
    try {
      fd = fs.openSync(lockPath, 'wx');
    } catch (err) {
      // Only retry when the lock already exists.
      if (err && err.code !== 'EEXIST') {
        throw err;
      }

      // lock exists
      try {
        const st = fs.statSync(lockPath);
        const age = nowMs() - st.mtimeMs;
        if (age > staleMs) {
          try {
            fs.rmSync(lockPath, { force: true });
            continue;
          } catch {}
        }
      } catch {}

      if (nowMs() - start > timeoutMs) {
        const e = new Error(`Timed out waiting for lock: ${lockPath}`);
        e.code = 'LOCK_TIMEOUT';
        throw e;
      }

      // simple backoff
      const sleepMs = 25 + Math.floor(Math.random() * 50);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, sleepMs);
      continue;
    }

    try {
      try {
        fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, at: new Date().toISOString() }) + '\n');
      } catch {}
      return fn();
    } finally {
      try {
        fs.closeSync(fd);
      } catch {}
      try {
        fs.rmSync(lockPath, { force: true });
      } catch {}
    }
  }
}

function loadState(rootDir) {
  const { stateFile } = statePaths(rootDir);
  return normalizeState(readJson(stateFile, null));
}

function saveState(rootDir, state) {
  const { stateFile } = statePaths(rootDir);
  writeJsonAtomic(stateFile, normalizeState(state));
}

function ensureQueue(state, queueName) {
  const name = String(queueName || '').trim();
  if (!name) throw new Error('queue name required');
  if (!state.queues[name]) {
    state.queues[name] = { name, createdAt: new Date().toISOString() };
  }
  return state.queues[name];
}

function createItem({ queue, title, instructions, priority }) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  return {
    id,
    queue,
    title: String(title || '').trim() || '(untitled)',
    instructions: String(instructions || '').trim(),
    priority: Number.isFinite(priority) ? priority : 0,
    status: 'ready',
    claimedBy: '',
    claimedAt: '',
    leaseUntil: 0,
    attempts: 0,
    lastError: '',
    createdAt,
    updatedAt: createdAt
  };
}



function findItemByDedupeKey(state, { queue, dedupeKey }) {
  const q = String(queue || '').trim();
  const key = String(dedupeKey || '').trim();
  if (!q || !key) return null;
  // Search newest-first so if there are multiple (e.g. old data), we return the most recent.
  for (let i = state.items.length - 1; i >= 0; i--) {
    const it = state.items[i];
    if (it && it.queue === q && it.dedupeKey === key) return it;
  }
  return null;
}

function enqueueItem(rootDir, { queue, title, instructions, priority, dedupeKey }) {
  const { lockFile } = statePaths(rootDir);
  return withFileLock(lockFile, () => {
    const state = loadState(rootDir);
    ensureQueue(state, queue);

    const key = String(dedupeKey || '').trim();
    if (key) {
      const existing = findItemByDedupeKey(state, { queue, dedupeKey: key });
      if (existing) {
        return { ...existing, _deduped: true };
      }
    }

    const item = createItem({ queue, title, instructions, priority });
    if (key) item.dedupeKey = key;
    state.items.push(item);
    saveState(rootDir, state);
    return item;
  });
}

function listItems(state, { queues, status } = {}) {
  const queueSet = queues && queues.length ? new Set(queues) : null;
  const statusSet = status && status.length ? new Set(status) : null;
  return state.items
    .filter((it) => {
      if (queueSet && !queueSet.has(it.queue)) return false;
      if (statusSet && !statusSet.has(it.status)) return false;
      return true;
    })
    .slice();
}

function pickNextReady(items) {
  // Treat `pending` as equivalent to `ready` for pickup.
  const ready = items.filter((it) => it.status === 'ready' || it.status === 'pending');
  ready.sort((a, b) => {
    const pr = (b.priority || 0) - (a.priority || 0);
    if (pr !== 0) return pr;

    const ca = String(a.createdAt || '');
    const cb = String(b.createdAt || '');
    const createdCmp = ca.localeCompare(cb);
    if (createdCmp !== 0) return createdCmp;

    // Final deterministic tie-breaker.
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
  return ready[0] || null;
}

function reapExpiredLeases(state) {
  const now = nowMs();
  let changed = false;
  for (const it of state.items) {
    if ((it.status === 'claimed' || it.status === 'in_progress') && it.leaseUntil && it.leaseUntil < now) {
      it.status = 'ready';
      it.claimedBy = '';
      it.claimedAt = '';
      it.leaseUntil = 0;
      it.updatedAt = new Date().toISOString();
      changed = true;
    }
  }
  return changed;
}

function claimNext(rootDir, { agentId, queues, leaseMs }) {
  const { lockFile } = statePaths(rootDir);
  const lease = toInt(leaseMs, 15 * 60_000);
  const agent = String(agentId || '').trim();
  if (!agent) throw new Error('agentId required');

  return withFileLock(lockFile, () => {
    const state = loadState(rootDir);
    const changedByReap = reapExpiredLeases(state);

    const items = listItems(state, {
      queues: queues && queues.length ? queues : null
    });

    const next = pickNextReady(items);
    if (!next) {
      if (changedByReap) saveState(rootDir, state);
      return null;
    }

    const now = nowMs();
    next.status = 'claimed';
    next.claimedBy = agent;
    next.claimedAt = new Date(now).toISOString();
    next.leaseUntil = now + lease;
    next.attempts = (next.attempts || 0) + 1;
    next.updatedAt = new Date().toISOString();

    saveState(rootDir, state);
    return next;
  });
}

function listAssignments(rootDir) {
  const { lockFile } = statePaths(rootDir);
  return withFileLock(lockFile, () => {
    const state = loadState(rootDir);
    const assignments = state.assignments && typeof state.assignments === 'object' ? state.assignments : {};
    return assignments;
  });
}

function setAssignments(rootDir, { agentId, queues }) {
  const { lockFile } = statePaths(rootDir);
  const agent = String(agentId || '').trim();
  if (!agent) throw new Error('agentId required');

  const q = Array.isArray(queues) ? queues : [];
  const normalized = q.map((s) => String(s).trim()).filter(Boolean);
  if (!normalized.length) throw new Error('queues required');

  return withFileLock(lockFile, () => {
    const state = loadState(rootDir);
    if (!state.assignments || typeof state.assignments !== 'object') state.assignments = {};
    state.assignments[agent] = normalized;
    saveState(rootDir, state);
    return { agentId: agent, queues: normalized };
  });
}

function resolveClaimQueues(rootDir, { agentId, requestedQueues, defaultQueues } = {}) {
  const agent = String(agentId || '').trim();
  if (!agent) throw new Error('agentId required');

  const req = Array.isArray(requestedQueues) ? requestedQueues : [];
  const normalizedReq = req.map((s) => String(s).trim()).filter(Boolean);
  if (normalizedReq.length) {
    return { queues: normalizedReq, source: 'requested' };
  }

  const state = loadState(rootDir);
  const assignments = state.assignments && typeof state.assignments === 'object' ? state.assignments : {};
  const assigned = Array.isArray(assignments[agent]) ? assignments[agent] : [];
  const normalizedAssigned = assigned.map((s) => String(s).trim()).filter(Boolean);
  if (normalizedAssigned.length) {
    return { queues: normalizedAssigned, source: 'assignment' };
  }

  const def = Array.isArray(defaultQueues) ? defaultQueues : [];
  const normalizedDef = def.map((s) => String(s).trim()).filter(Boolean);
  if (normalizedDef.length) {
    return { queues: normalizedDef, source: 'default' };
  }

  return { queues: [], reason: 'NO_QUEUES' };
}

function transitionItem(rootDir, { itemId, agentId, status, error, result, note, leaseMs }) {
  const { lockFile } = statePaths(rootDir);
  const id = String(itemId || '').trim();
  const agent = String(agentId || '').trim();
  if (!id) throw new Error('itemId required');
  if (!agent) throw new Error('agentId required');

  return withFileLock(lockFile, () => {
    const state = loadState(rootDir);
    reapExpiredLeases(state);

    const item = state.items.find((it) => it.id === id);
    if (!item) {
      const e = new Error(`item not found: ${id}`);
      e.code = 'NOT_FOUND';
      throw e;
    }

    // Ownership enforcement:
    // - For progress/terminal transitions, the item must already be claimed by *this* agent.
    // - This prevents another agent from completing/failing someone else's work, and prevents
    //   unclaimed items from being transitioned without an explicit claim-next.
    const ownershipRequired = status === 'in_progress' || status === 'done' || status === 'failed';
    if (ownershipRequired) {
      if (!item.claimedBy) {
        const e = new Error('item is not claimed');
        e.code = 'NOT_CLAIMED';
        throw e;
      }
      if (item.claimedBy !== agent) {
        const e = new Error(`item claimed by another agent: ${item.claimedBy}`);
        e.code = 'CLAIMED_BY_OTHER';
        throw e;
      }
    }

    item.status = status;
    item.updatedAt = new Date().toISOString();

    if (status === 'in_progress') {
      // No implicit claim on progress; callers must claim-next first.
    }

    if (status === 'failed') {
      item.lastError = String(error || '').trim();
    }

    if (status === 'done') {
      // store a small result snapshot (optional)
      if (result !== undefined) item.result = result;
    }

    if (note) {
      item.lastNote = String(note);
    }

    if (leaseMs) {
      const lease = toInt(leaseMs, null);
      if (lease && (status === 'claimed' || status === 'in_progress')) {
        item.leaseUntil = nowMs() + lease;
      }
    }

    saveState(rootDir, state);
    return item;
  });
}

module.exports = {
  statePaths,
  loadState,
  saveState,
  ensureQueue,
  enqueueItem,
  claimNext,
  transitionItem,
  listAssignments,
  setAssignments,
  resolveClaimQueues,
  // exported for tests
  findItemByDedupeKey
};
