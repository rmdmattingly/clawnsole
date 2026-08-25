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
  const archivedItems = Array.isArray(s.archivedItems) ? s.archivedItems : [];
  const assignments = s.assignments && typeof s.assignments === 'object' ? s.assignments : {};
  return {
    version: 1,
    queues,
    items,
    archivedItems,
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

function cleanMeta(meta) {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return undefined;
  const out = {};
  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return Object.keys(out).length ? out : undefined;
}

function createItem({ queue, title, instructions, priority, meta }) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const item = {
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
  const normalizedMeta = cleanMeta(meta);
  if (normalizedMeta) item.meta = normalizedMeta;
  return item;
}



const TERMINAL_STATUSES = new Set(['done', 'failed']);

function normalizeIssueRepoName(repo) {
  return String(repo || '').trim().toLowerCase().replace(/\s+/g, '');
}

function normalizeIssueRepoParts(owner, name) {
  return normalizeIssueRepoName(`${owner || ''}/${name || ''}`);
}

function normalizeIssueNumber(raw) {
  const n = Number.parseInt(String(raw || '').trim(), 10);
  return Number.isFinite(n) && n > 0 ? String(n) : '';
}

function parseIssueRef(text) {
  const src = String(text || '').trim();
  if (!src) return null;

  const fromUrl = src.match(/github\.com\/([a-z0-9_.-]+\/[a-z0-9_.-]+)\/issues\/(\d+)/i);
  if (fromUrl) {
    const repo = normalizeIssueRepoName(fromUrl[1]);
    const issueNumber = normalizeIssueNumber(fromUrl[2]);
    if (repo && issueNumber) return { repo, issueNumber };
  }

  const repoRefPattern = String.raw`([a-z0-9_.-]+)\s*\/\s*([a-z0-9_.-]+)`;

  const fromFullRef = src.match(new RegExp(String.raw`(?:^|[\s[(])(?:issue:)?${repoRefPattern}\s*#\s*(\d+)\b`, 'i'));
  if (fromFullRef) {
    const repo = normalizeIssueRepoParts(fromFullRef[1], fromFullRef[2]);
    const issueNumber = normalizeIssueNumber(fromFullRef[3]);
    if (repo && issueNumber) return { repo, issueNumber };
  }

  const fromColonRef = src.match(new RegExp(String.raw`(?:^|[\s[(])(?:issue:)?${repoRefPattern}\s*:\s*(\d+)\b`, 'i'));
  if (fromColonRef) {
    const repo = normalizeIssueRepoParts(fromColonRef[1], fromColonRef[2]);
    const issueNumber = normalizeIssueNumber(fromColonRef[3]);
    if (repo && issueNumber) return { repo, issueNumber };
  }

  const repoLine = src.match(new RegExp(String.raw`\brepo\s*:\s*${repoRefPattern}\b`, 'i'));
  const issueLine = src.match(/\b(?:issue|issueNumber)\s*:\s*#?\s*(\d+)\b/i);
  if (repoLine && issueLine) {
    const repo = normalizeIssueRepoParts(repoLine[1], repoLine[2]);
    const issueNumber = normalizeIssueNumber(issueLine[1]);
    if (repo && issueNumber) return { repo, issueNumber };
  }

  return null;
}

function canonicalizeIssueDedupeKey({ repo, issueNumber, dedupeKey, title, instructions, meta }) {
  const metaObj = meta && typeof meta === 'object' ? meta : {};
  const explicitRepo = normalizeIssueRepoName(repo ?? metaObj.repo);
  const explicitIssue = normalizeIssueNumber(issueNumber ?? metaObj.issueNumber ?? metaObj.issue);
  if (explicitRepo && explicitIssue) return `${explicitRepo}#${explicitIssue}`;

  const parsed = parseIssueRef(dedupeKey) || parseIssueRef(metaObj.dedupeKey) || parseIssueRef(metaObj.url) || parseIssueRef(instructions) || parseIssueRef(title);
  if (parsed) return `${parsed.repo}#${parsed.issueNumber}`;

  return String(dedupeKey || '').trim();
}

function findItemByDedupeKey(state, { queue, dedupeKey, title, instructions, repo, issueNumber, meta, includeTerminal = true }) {
  const q = String(queue || '').trim();
  const key = canonicalizeIssueDedupeKey({ dedupeKey, title, instructions, repo, issueNumber, meta });
  if (!q || !key) return null;
  // Search newest-first so if there are multiple (e.g. old data), we return the most recent.
  for (let i = state.items.length - 1; i >= 0; i--) {
    const it = state.items[i];
    if (!it || it.queue !== q) continue;
    if (!includeTerminal && TERMINAL_STATUSES.has(String(it.status || '').trim())) continue;
    const itemKey = canonicalizeIssueDedupeKey({
      dedupeKey: it.dedupeKey,
      title: it.title,
      instructions: it.instructions,
      repo: it.meta?.repo,
      issueNumber: it.meta?.issueNumber ?? it.meta?.issue,
      meta: it.meta
    });
    if (itemKey === key) return it;
  }
  return null;
}

function noteDedupedIssueTask(existing, { title, priority, dedupeKey, meta }) {
  const now = new Date().toISOString();
  const incomingMeta = meta && typeof meta === 'object' && !Array.isArray(meta) ? meta : {};
  const currentMeta = existing.meta && typeof existing.meta === 'object' && !Array.isArray(existing.meta) ? existing.meta : {};
  const seenCount = Number(existing.seenCount || currentMeta.seenCount || 1) + 1;
  const provenance = Array.isArray(currentMeta.provenance) ? currentMeta.provenance.slice(-9) : [];

  provenance.push({
    at: now,
    source: incomingMeta.source || '',
    dedupeKey: dedupeKey || '',
    title: String(title || '').trim(),
    priority: Number.isFinite(Number(priority)) ? Number(priority) : undefined
  });

  existing.seenCount = seenCount;
  existing.meta = cleanMeta({
    ...currentMeta,
    ...incomingMeta,
    seenCount,
    lastSeenAt: now,
    provenance
  });
}

function enqueueItem(rootDir, { queue, title, instructions, priority, dedupeKey, repo, issueNumber, meta }) {
  const { lockFile } = statePaths(rootDir);
  return withFileLock(lockFile, () => {
    const state = loadState(rootDir);
    ensureQueue(state, queue);

    const issueRepo = normalizeIssueRepoName(repo ?? meta?.repo);
    const issue = normalizeIssueNumber(issueNumber ?? meta?.issueNumber ?? meta?.issue);
    const mergedMeta = cleanMeta({
      ...(meta && typeof meta === 'object' && !Array.isArray(meta) ? meta : {}),
      ...(issueRepo ? { repo: issueRepo } : {}),
      ...(issue ? { issueNumber: issue } : {})
    });
    const key = canonicalizeIssueDedupeKey({ dedupeKey, title, instructions, repo: issueRepo, issueNumber: issue, meta: mergedMeta });
    if (key) {
      const existing = findItemByDedupeKey(state, {
        queue,
        dedupeKey: key,
        title,
        instructions,
        repo: issueRepo,
        issueNumber: issue,
        meta: mergedMeta,
        includeTerminal: false
      });
      if (existing) {
        const nextPriority = Number(priority);
        if (Number.isFinite(nextPriority)) existing.priority = nextPriority;
        if (title !== undefined) existing.title = String(title || '').trim() || '(untitled)';
        if (instructions !== undefined) existing.instructions = String(instructions || '').trim();
        if (mergedMeta) existing.meta = cleanMeta({ ...(existing.meta || {}), ...mergedMeta });
        existing.dedupeKey = key;
        noteDedupedIssueTask(existing, { title, priority, dedupeKey: key, meta: mergedMeta });
        existing.updatedAt = new Date().toISOString();
        saveState(rootDir, state);
        return { ...existing, _deduped: true, _enqueueAction: 'updated_existing' };
      }
    }

    const item = createItem({ queue, title, instructions, priority, meta: mergedMeta });
    if (key) item.dedupeKey = key;
    state.items.push(item);
    saveState(rootDir, state);
    return { ...item, _enqueueAction: 'created' };
  });
}

function isTerminalStatus(status) {
  return TERMINAL_STATUSES.has(String(status || '').trim());
}

function compareIssueDuplicateSurvivors(a, b) {
  const aTerminal = isTerminalStatus(a?.status);
  const bTerminal = isTerminalStatus(b?.status);
  if (aTerminal !== bTerminal) return aTerminal ? 1 : -1;

  const aUpdated = Date.parse(a?.updatedAt || '') || 0;
  const bUpdated = Date.parse(b?.updatedAt || '') || 0;
  if (aUpdated !== bUpdated) return bUpdated - aUpdated;

  const aPriority = Number(a?.priority || 0);
  const bPriority = Number(b?.priority || 0);
  if (aPriority !== bPriority) return bPriority - aPriority;

  return String(a?.id || '').localeCompare(String(b?.id || ''));
}

function summarizeMergedIssueDuplicate(item, key, keptId, mergeRunId, mergedAt) {
  return cleanMeta({
    id: item.id,
    queue: item.queue,
    dedupeKey: key,
    keptId,
    title: item.title,
    status: item.status,
    priority: item.priority,
    lastNote: item.lastNote,
    lastError: item.lastError,
    result: item.result,
    mergedAt,
    mergeRunId
  });
}

function backupWorkqueueState(rootDir, state, mergeRunId) {
  const { dir } = statePaths(rootDir);
  ensureDir(dir);
  const backupFile = path.join(dir, `work-queues.backup.${mergeRunId}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(normalizeState(state), null, 2) + '\n', 'utf8');
  return backupFile;
}

function collapseCanonicalIssueDuplicates(rootDir, { queue, dryRun } = {}) {
  const { lockFile } = statePaths(rootDir);
  return withFileLock(lockFile, () => {
    const state = loadState(rootDir);
    const originalState = dryRun ? null : JSON.parse(JSON.stringify(state));
    const q = String(queue || '').trim();
    const groups = new Map();
    const removed = [];

    for (const item of state.items) {
      const key = canonicalizeIssueDedupeKey({
        dedupeKey: item?.dedupeKey,
        title: item?.title,
        instructions: item?.instructions,
        repo: item?.meta?.repo,
        issueNumber: item?.meta?.issueNumber ?? item?.meta?.issue,
        meta: item?.meta
      });
      if (!key || (q && item.queue !== q)) continue;

      const compoundKey = `${item.queue}\n${key}`;
      const group = groups.get(compoundKey) || { key, queue: item.queue, items: [] };
      group.items.push(item);
      groups.set(compoundKey, group);
    }

    const mergeRunId = new Date().toISOString().replace(/[:.]/g, '');
    const mergedAt = new Date().toISOString();
    const survivorById = new Map();
    const removedIds = new Set();

    for (const group of groups.values()) {
      if (group.items.length < 2) continue;

      const sorted = group.items.slice().sort(compareIssueDuplicateSurvivors);
      const survivor = sorted[0];
      const duplicates = sorted.slice(1);
      const existingMerged = Array.isArray(survivor?.result?.migrationMerged)
        ? survivor.result.migrationMerged
        : [];
      const migrationMerged = existingMerged.slice();

      for (const item of duplicates) {
        migrationMerged.push(summarizeMergedIssueDuplicate(item, group.key, survivor.id, mergeRunId, mergedAt));
        removed.push({ id: item.id, queue: item.queue, dedupeKey: group.key, keptId: survivor.id });
        removedIds.add(item.id);
      }

      if (!dryRun) {
        survivor.dedupeKey = group.key;
        survivor.result = {
          ...(survivor.result && typeof survivor.result === 'object' && !Array.isArray(survivor.result) ? survivor.result : {}),
          migrationMerged
        };
        survivor.meta = cleanMeta({
          ...(survivor.meta || {}),
          migrationMergedCount: migrationMerged.length,
          migrationLastRunId: mergeRunId,
          migrationLastMergedAt: mergedAt
        });
        survivor.updatedAt = mergedAt;
        survivorById.set(survivor.id, survivor);
      }
    }

    let backupFile = '';
    if (!dryRun && removed.length) {
      backupFile = backupWorkqueueState(rootDir, originalState, mergeRunId);
      state.items = state.items
        .filter((item) => !removedIds.has(item.id))
        .map((item) => survivorById.get(item.id) || item);
      saveState(rootDir, state);
    }

    return { ok: true, dryRun: !!dryRun, removedCount: removed.length, removed, backupFile };
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

function updateItem(rootDir, { itemId, patch } = {}) {
  const { lockFile } = statePaths(rootDir);
  const id = String(itemId || '').trim();
  const p = patch && typeof patch === 'object' ? patch : {};
  if (!id) throw new Error('itemId required');

  const allowedStatuses = new Set(['ready', 'pending', 'blocked', 'claimed', 'in_progress', 'done', 'failed']);

  return withFileLock(lockFile, () => {
    const state = loadState(rootDir);
    reapExpiredLeases(state);

    const item = state.items.find((it) => it.id === id);
    if (!item) {
      const e = new Error(`item not found: ${id}`);
      e.code = 'NOT_FOUND';
      throw e;
    }

    if (p.title !== undefined) item.title = String(p.title || '').trim() || '(untitled)';
    if (p.instructions !== undefined) item.instructions = String(p.instructions || '').trim();
    if (p.priority !== undefined) {
      const pr = Number(p.priority);
      item.priority = Number.isFinite(pr) ? pr : item.priority;
    }
    if (p.status !== undefined) {
      const st = String(p.status || '').trim();
      if (!allowedStatuses.has(st)) {
        const e = new Error(`invalid status: ${st}`);
        e.code = 'INVALID_STATUS';
        throw e;
      }
      item.status = st;

      // If an admin resets to a non-active state, clear ownership/lease.
      if (st === 'ready' || st === 'pending' || st === 'blocked') {
        item.claimedBy = '';
        item.claimedAt = '';
        item.leaseUntil = 0;
      }
    }
    if (p.lastError !== undefined) item.lastError = String(p.lastError || '').trim();
    if (p.lastNote !== undefined) item.lastNote = String(p.lastNote || '').trim();

    item.updatedAt = new Date().toISOString();
    saveState(rootDir, state);
    return item;
  });
}

function deleteItem(rootDir, { itemId } = {}) {
  const { lockFile } = statePaths(rootDir);
  const id = String(itemId || '').trim();
  if (!id) throw new Error('itemId required');

  return withFileLock(lockFile, () => {
    const state = loadState(rootDir);
    const idx = state.items.findIndex((it) => it && it.id === id);
    if (idx < 0) {
      const e = new Error(`item not found: ${id}`);
      e.code = 'NOT_FOUND';
      throw e;
    }
    const [removed] = state.items.splice(idx, 1);
    saveState(rootDir, state);
    return removed;
  });
}

const ARCHIVABLE_TERMINAL_STATUSES = new Set(['done', 'failed']);

function itemArchiveAgeMs(item) {
  const raw = item?.updatedAt || item?.createdAt || '';
  const parsed = Date.parse(String(raw));
  return Number.isFinite(parsed) ? parsed : null;
}

function archiveTerminalItems(rootDir, { queue = '', olderThanDays, previewOnly = false } = {}) {
  const { lockFile } = statePaths(rootDir);
  const q = String(queue || '').trim();
  const days = Number(olderThanDays);
  if (!Number.isFinite(days) || days <= 0) {
    const e = new Error('olderThanDays must be greater than 0');
    e.code = 'INVALID_THRESHOLD';
    throw e;
  }

  const cutoffMs = nowMs() - Math.floor(days * 24 * 60 * 60 * 1000);

  return withFileLock(lockFile, () => {
    const state = loadState(rootDir);
    const matches = [];
    const kept = [];

    for (const item of state.items) {
      const status = String(item?.status || 'ready');
      const terminalAt = itemArchiveAgeMs(item);
      const matchesQueue = !q || item?.queue === q;
      const eligible = matchesQueue && ARCHIVABLE_TERMINAL_STATUSES.has(status) && terminalAt !== null && terminalAt < cutoffMs;
      if (eligible) matches.push(item);
      else kept.push(item);
    }

    if (!previewOnly && matches.length) {
      const archivedAt = new Date().toISOString();
      state.items = kept;
      state.archivedItems = [
        ...(Array.isArray(state.archivedItems) ? state.archivedItems : []),
        ...matches.map((item) => ({ ...item, archivedAt, archivedReason: `terminal-older-than-${days}d` }))
      ];
      saveState(rootDir, state);
    }

    return {
      ok: true,
      queue: q,
      olderThanDays: days,
      cutoffMs,
      previewCount: matches.length,
      archivedCount: previewOnly ? 0 : matches.length
    };
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
  updateItem,
  deleteItem,
  archiveTerminalItems,
  listAssignments,
  setAssignments,
  resolveClaimQueues,
  collapseCanonicalIssueDuplicates,
  // exported for tests
  findItemByDedupeKey,
  canonicalizeIssueDedupeKey
};
