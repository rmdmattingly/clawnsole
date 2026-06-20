const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function randomId() {
  try {
    return crypto.randomUUID();
  } catch {
    return String(Date.now()) + '-' + Math.random().toString(16).slice(2);
  }
}

function toBoolInt(value) {
  return value === false || value === 0 ? 0 : 1;
}

function normalizeRun(row) {
  if (!row) return null;
  const ts = Number(row.ts ?? row.created_at ?? row.lastRunAt ?? 0);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  return {
    id: String(row.id || ''),
    promptId: String(row.prompt_id || row.promptId || ''),
    idempotencyKey: String(row.idempotency_key || row.idempotencyKey || ''),
    ts,
    status: String(row.status || row.lastStatus || 'unknown').trim() || 'unknown',
    error: String(row.error || row.lastError || '').trim()
  };
}

function promptFromRow(row, runs = []) {
  if (!row) return null;
  const runHistory = runs.map(normalizeRun).filter(Boolean);
  return {
    id: String(row.id),
    title: String(row.title || 'Recurring prompt'),
    agentId: String(row.agent_id || 'main'),
    message: String(row.message || ''),
    intervalMinutes: Number(row.interval_minutes || 60) || 60,
    enabled: Number(row.enabled) !== 0,
    createdAt: Number(row.created_at || 0) || Date.now(),
    updatedAt: Number(row.updated_at || 0) || Date.now(),
    lastRunAt: row.last_run_at == null ? null : Number(row.last_run_at),
    nextRunAt: row.next_run_at == null ? null : Number(row.next_run_at),
    lastStatus: String(row.last_status || 'never'),
    lastError: String(row.last_error || ''),
    runHistory
  };
}

function legacyRunsForPrompt(prompt) {
  const rows = Array.isArray(prompt?.runHistory) ? prompt.runHistory : [];
  const normalized = rows.map(normalizeRun).filter(Boolean);
  const lastRunAt = Number(prompt?.lastRunAt);
  if (!normalized.length && Number.isFinite(lastRunAt) && lastRunAt > 0) {
    normalized.push({
      id: randomId(),
      promptId: String(prompt.id || ''),
      idempotencyKey: '',
      ts: lastRunAt,
      status: String(prompt.lastStatus || 'unknown').trim() || 'unknown',
      error: String(prompt.lastError || '').trim()
    });
  }
  return normalized;
}

function createJsonTableStore({ dbPath, legacyJsonPath } = {}) {
  const jsonPath = `${dbPath}.json`;

  function readTables() {
    try {
      const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return {
        admin_prompts: Array.isArray(raw?.admin_prompts) ? raw.admin_prompts : [],
        admin_prompt_runs: Array.isArray(raw?.admin_prompt_runs) ? raw.admin_prompt_runs : []
      };
    } catch {
      return { admin_prompts: [], admin_prompt_runs: [] };
    }
  }

  function writeTables(tables) {
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    const tmp = `${jsonPath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({
      admin_prompts: Array.isArray(tables?.admin_prompts) ? tables.admin_prompts : [],
      admin_prompt_runs: Array.isArray(tables?.admin_prompt_runs) ? tables.admin_prompt_runs : []
    }, null, 2) + '\n', 'utf8');
    fs.renameSync(tmp, jsonPath);
  }

  function migrateLegacyIfEmpty() {
    const tables = readTables();
    if (tables.admin_prompts.length || !legacyJsonPath || !fs.existsSync(legacyJsonPath)) return;
    try {
      const raw = JSON.parse(fs.readFileSync(legacyJsonPath, 'utf8'));
      const prompts = Array.isArray(raw?.prompts) ? raw.prompts : [];
      for (const prompt of prompts) {
        if (!prompt || typeof prompt !== 'object') continue;
        const id = String(prompt.id || randomId());
        const createdAt = Number(prompt.createdAt || Date.now()) || Date.now();
        const updatedAt = Number(prompt.updatedAt || createdAt) || createdAt;
        tables.admin_prompts.push({
          id,
          title: String(prompt.title || 'Recurring prompt'),
          agent_id: String(prompt.agentId || 'main').trim() || 'main',
          message: String(prompt.message || ''),
          interval_minutes: Math.max(1, Number(prompt.intervalMinutes || 60) || 60),
          enabled: toBoolInt(prompt.enabled),
          created_at: createdAt,
          updated_at: updatedAt,
          last_run_at: Number.isFinite(Number(prompt.lastRunAt)) ? Number(prompt.lastRunAt) : null,
          next_run_at: Number.isFinite(Number(prompt.nextRunAt)) ? Number(prompt.nextRunAt) : null,
          last_status: String(prompt.lastStatus || 'never'),
          last_error: String(prompt.lastError || '')
        });
        for (const run of legacyRunsForPrompt({ ...prompt, id })) {
          tables.admin_prompt_runs.push({
            id: run.id || randomId(),
            prompt_id: id,
            idempotency_key: run.idempotencyKey || null,
            status: run.status,
            error: run.error,
            created_at: run.ts
          });
        }
      }
      writeTables(tables);
    } catch {
      writeTables(tables);
    }
  }

  function listRunsFromTables(tables, promptId, limit = 50) {
    return tables.admin_prompt_runs
      .filter((run) => run && run.prompt_id === String(promptId || ''))
      .sort((a, b) => Number(b.created_at || 0) - Number(a.created_at || 0))
      .slice(0, Math.max(1, Math.min(200, Number(limit) || 50)))
      .map((run) => normalizeRun({ ...run, ts: run.created_at }))
      .filter(Boolean);
  }

  migrateLegacyIfEmpty();

  return {
    listPrompts() {
      const tables = readTables();
      return tables.admin_prompts
        .slice()
        .sort((a, b) => {
          const c = Number(b.created_at || 0) - Number(a.created_at || 0);
          return c || String(a.id || '').localeCompare(String(b.id || ''));
        })
        .map((row) => promptFromRow(row, listRunsFromTables(tables, row.id, 200)));
    },

    getPrompt(id) {
      const tables = readTables();
      const row = tables.admin_prompts.find((prompt) => prompt && prompt.id === String(id || ''));
      return row ? promptFromRow(row, listRunsFromTables(tables, id, 200)) : null;
    },

    createPrompt(input, now = Date.now()) {
      const tables = readTables();
      const prompt = {
        id: input.id || randomId(),
        title: input.title || 'Recurring prompt',
        agentId: input.agentId || 'main',
        message: input.message || '',
        intervalMinutes: Math.max(1, Number(input.intervalMinutes || 60) || 60),
        enabled: input.enabled === false ? false : true,
        createdAt: now,
        updatedAt: now,
        lastRunAt: null,
        nextRunAt: Number.isFinite(Number(input.nextRunAt)) ? Number(input.nextRunAt) : null,
        lastStatus: 'never',
        lastError: '',
        runHistory: []
      };
      tables.admin_prompts.push({
        id: prompt.id,
        title: prompt.title,
        agent_id: prompt.agentId,
        message: prompt.message,
        interval_minutes: prompt.intervalMinutes,
        enabled: toBoolInt(prompt.enabled),
        created_at: prompt.createdAt,
        updated_at: prompt.updatedAt,
        last_run_at: prompt.lastRunAt,
        next_run_at: prompt.nextRunAt,
        last_status: prompt.lastStatus,
        last_error: prompt.lastError
      });
      writeTables(tables);
      return prompt;
    },

    updatePrompt(id, input, now = Date.now()) {
      const tables = readTables();
      const idx = tables.admin_prompts.findIndex((prompt) => prompt && prompt.id === String(id || ''));
      if (idx < 0) return null;
      const existing = promptFromRow(tables.admin_prompts[idx], listRunsFromTables(tables, id, 200));
      tables.admin_prompts[idx] = {
        ...tables.admin_prompts[idx],
        title: input.title || existing.title || 'Recurring prompt',
        agent_id: input.agentId || existing.agentId || 'main',
        message: input.message || existing.message || '',
        interval_minutes: Math.max(1, Number(input.intervalMinutes || existing.intervalMinutes || 60) || 60),
        enabled: toBoolInt(input.enabled),
        next_run_at: Number.isFinite(Number(input.nextRunAt)) ? Number(input.nextRunAt) : existing.nextRunAt,
        updated_at: now
      };
      writeTables(tables);
      return this.getPrompt(id);
    },

    deletePrompt(id) {
      const tables = readTables();
      const before = tables.admin_prompts.length;
      tables.admin_prompts = tables.admin_prompts.filter((prompt) => prompt && prompt.id !== String(id || ''));
      tables.admin_prompt_runs = tables.admin_prompt_runs.filter((run) => run && run.prompt_id !== String(id || ''));
      writeTables(tables);
      return tables.admin_prompts.length !== before;
    },

    listRuns(promptId, limit = 50) {
      return listRunsFromTables(readTables(), promptId, limit);
    },

    triggerPrompt(id, { status = 'ok', error = '', idempotencyKey = '', now = Date.now() } = {}) {
      const tables = readTables();
      const idx = tables.admin_prompts.findIndex((prompt) => prompt && prompt.id === String(id || ''));
      if (idx < 0) return null;
      const key = String(idempotencyKey || '').trim();
      if (key) {
        const existingRun = tables.admin_prompt_runs.find((run) => run && run.prompt_id === String(id) && run.idempotency_key === key);
        if (existingRun) {
          return {
            prompt: promptFromRow(tables.admin_prompts[idx], listRunsFromTables(tables, id, 200)),
            run: normalizeRun({ ...existingRun, ts: existingRun.created_at }),
            deduped: true
          };
        }
      }
      const prompt = promptFromRow(tables.admin_prompts[idx], listRunsFromTables(tables, id, 200));
      const runStatus = String(status || 'ok').trim() || 'ok';
      const runError = String(error || '').trim();
      const run = {
        id: randomId(),
        prompt_id: String(id),
        idempotency_key: key || null,
        status: runStatus,
        error: runError,
        created_at: now
      };
      tables.admin_prompt_runs.push(run);
      tables.admin_prompts[idx] = {
        ...tables.admin_prompts[idx],
        last_run_at: now,
        next_run_at: now + Math.max(1, Number(prompt.intervalMinutes) || 60) * 60 * 1000,
        last_status: runStatus,
        last_error: runError,
        updated_at: now
      };
      writeTables(tables);
      return {
        prompt: promptFromRow(tables.admin_prompts[idx], listRunsFromTables(tables, id, 200)),
        run: normalizeRun({ ...run, ts: run.created_at }),
        deduped: false
      };
    },

    close() {}
  };
}

function createRecurringPromptsStore({ dbPath, legacyJsonPath } = {}) {
  if (!dbPath) throw new Error('dbPath required');
  let DatabaseSync;
  try {
    ({ DatabaseSync } = require('node:sqlite'));
  } catch {
    return createJsonTableStore({ dbPath, legacyJsonPath });
  }
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS admin_prompts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      message TEXT NOT NULL,
      interval_minutes INTEGER NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_run_at INTEGER,
      next_run_at INTEGER,
      last_status TEXT NOT NULL DEFAULT 'never',
      last_error TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS admin_prompt_runs (
      id TEXT PRIMARY KEY,
      prompt_id TEXT NOT NULL,
      idempotency_key TEXT,
      status TEXT NOT NULL,
      error TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      FOREIGN KEY(prompt_id) REFERENCES admin_prompts(id) ON DELETE CASCADE,
      UNIQUE(prompt_id, idempotency_key)
    );
    CREATE INDEX IF NOT EXISTS idx_admin_prompt_runs_prompt_created
      ON admin_prompt_runs(prompt_id, created_at DESC);
  `);

  const count = db.prepare('SELECT COUNT(*) AS n FROM admin_prompts').get().n;
  if (count === 0 && legacyJsonPath && fs.existsSync(legacyJsonPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(legacyJsonPath, 'utf8'));
      const prompts = Array.isArray(raw?.prompts) ? raw.prompts : [];
      const insertPrompt = db.prepare(`
        INSERT OR IGNORE INTO admin_prompts
          (id, title, agent_id, message, interval_minutes, enabled, created_at, updated_at, last_run_at, next_run_at, last_status, last_error)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertRun = db.prepare(`
        INSERT OR IGNORE INTO admin_prompt_runs
          (id, prompt_id, idempotency_key, status, error, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      db.exec('BEGIN');
      try {
        for (const prompt of prompts) {
          if (!prompt || typeof prompt !== 'object') continue;
          const id = String(prompt.id || randomId());
          const createdAt = Number(prompt.createdAt || Date.now()) || Date.now();
          const updatedAt = Number(prompt.updatedAt || createdAt) || createdAt;
          insertPrompt.run(
            id,
            String(prompt.title || 'Recurring prompt'),
            String(prompt.agentId || 'main').trim() || 'main',
            String(prompt.message || ''),
            Math.max(1, Number(prompt.intervalMinutes || 60) || 60),
            toBoolInt(prompt.enabled),
            createdAt,
            updatedAt,
            Number.isFinite(Number(prompt.lastRunAt)) ? Number(prompt.lastRunAt) : null,
            Number.isFinite(Number(prompt.nextRunAt)) ? Number(prompt.nextRunAt) : null,
            String(prompt.lastStatus || 'never'),
            String(prompt.lastError || '')
          );
          for (const run of legacyRunsForPrompt({ ...prompt, id })) {
            insertRun.run(run.id || randomId(), id, run.idempotencyKey || null, run.status, run.error, run.ts);
          }
        }
        db.exec('COMMIT');
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    } catch {
      // Corrupt legacy JSON should not prevent a clean DB from starting.
    }
  }

  function rowsToPrompts(rows) {
    if (!rows.length) return [];
    const runsByPrompt = new Map();
    const runRows = db.prepare(`
      SELECT id, prompt_id, idempotency_key, status, error, created_at AS ts
      FROM admin_prompt_runs
      ORDER BY created_at DESC
    `).all();
    for (const run of runRows) {
      const list = runsByPrompt.get(run.prompt_id) || [];
      if (list.length < 200) list.push(run);
      runsByPrompt.set(run.prompt_id, list);
    }
    return rows.map((row) => promptFromRow(row, runsByPrompt.get(row.id) || []));
  }

  return {
    listPrompts() {
      const rows = db.prepare('SELECT * FROM admin_prompts ORDER BY created_at DESC, id ASC').all();
      return rowsToPrompts(rows);
    },

    getPrompt(id) {
      const row = db.prepare('SELECT * FROM admin_prompts WHERE id = ?').get(String(id || ''));
      if (!row) return null;
      return promptFromRow(row, this.listRuns(id, 200));
    },

    createPrompt(input, now = Date.now()) {
      const id = input.id || randomId();
      const prompt = {
        id,
        title: input.title || 'Recurring prompt',
        agentId: input.agentId || 'main',
        message: input.message || '',
        intervalMinutes: Math.max(1, Number(input.intervalMinutes || 60) || 60),
        enabled: input.enabled === false ? false : true,
        createdAt: now,
        updatedAt: now,
        lastRunAt: null,
        nextRunAt: Number.isFinite(Number(input.nextRunAt)) ? Number(input.nextRunAt) : null,
        lastStatus: 'never',
        lastError: '',
        runHistory: []
      };
      db.prepare(`
        INSERT INTO admin_prompts
          (id, title, agent_id, message, interval_minutes, enabled, created_at, updated_at, last_run_at, next_run_at, last_status, last_error)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        prompt.id,
        prompt.title,
        prompt.agentId,
        prompt.message,
        prompt.intervalMinutes,
        toBoolInt(prompt.enabled),
        prompt.createdAt,
        prompt.updatedAt,
        prompt.lastRunAt,
        prompt.nextRunAt,
        prompt.lastStatus,
        prompt.lastError
      );
      return prompt;
    },

    updatePrompt(id, input, now = Date.now()) {
      const existing = this.getPrompt(id);
      if (!existing) return null;
      const updated = {
        ...existing,
        title: input.title || existing.title || 'Recurring prompt',
        agentId: input.agentId || existing.agentId || 'main',
        message: input.message || existing.message || '',
        intervalMinutes: Math.max(1, Number(input.intervalMinutes || existing.intervalMinutes || 60) || 60),
        enabled: input.enabled === false ? false : true,
        nextRunAt: Number.isFinite(Number(input.nextRunAt)) ? Number(input.nextRunAt) : existing.nextRunAt,
        updatedAt: now
      };
      db.prepare(`
        UPDATE admin_prompts
        SET title = ?, agent_id = ?, message = ?, interval_minutes = ?, enabled = ?, next_run_at = ?, updated_at = ?
        WHERE id = ?
      `).run(
        updated.title,
        updated.agentId,
        updated.message,
        updated.intervalMinutes,
        toBoolInt(updated.enabled),
        updated.nextRunAt,
        updated.updatedAt,
        String(id)
      );
      return this.getPrompt(id);
    },

    deletePrompt(id) {
      db.prepare('DELETE FROM admin_prompt_runs WHERE prompt_id = ?').run(String(id || ''));
      const info = db.prepare('DELETE FROM admin_prompts WHERE id = ?').run(String(id || ''));
      return info.changes > 0;
    },

    listRuns(promptId, limit = 50) {
      return db.prepare(`
        SELECT id, prompt_id, idempotency_key, status, error, created_at AS ts
        FROM admin_prompt_runs
        WHERE prompt_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `).all(String(promptId || ''), Math.max(1, Math.min(200, Number(limit) || 50))).map(normalizeRun).filter(Boolean);
    },

    triggerPrompt(id, { status = 'ok', error = '', idempotencyKey = '', now = Date.now() } = {}) {
      const prompt = this.getPrompt(id);
      if (!prompt) return null;
      const key = String(idempotencyKey || '').trim();
      if (key) {
        const existingRun = db.prepare(`
          SELECT id, prompt_id, idempotency_key, status, error, created_at AS ts
          FROM admin_prompt_runs
          WHERE prompt_id = ? AND idempotency_key = ?
        `).get(String(id), key);
        if (existingRun) return { prompt, run: normalizeRun(existingRun), deduped: true };
      }

      const runId = randomId();
      const runStatus = String(status || 'ok').trim() || 'ok';
      const runError = String(error || '').trim();
      const nextRunAt = now + Math.max(1, Number(prompt.intervalMinutes) || 60) * 60 * 1000;
      db.exec('BEGIN');
      try {
        db.prepare(`
          INSERT INTO admin_prompt_runs
            (id, prompt_id, idempotency_key, status, error, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(runId, String(id), key || null, runStatus, runError, now);
        db.prepare(`
          UPDATE admin_prompts
          SET last_run_at = ?, next_run_at = ?, last_status = ?, last_error = ?, updated_at = ?
          WHERE id = ?
        `).run(now, nextRunAt, runStatus, runError, now, String(id));
        db.exec('COMMIT');
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
      return { prompt: this.getPrompt(id), run: { id: runId, promptId: String(id), idempotencyKey: key, ts: now, status: runStatus, error: runError }, deduped: false };
    },

    close() {
      db.close();
    }
  };
}

module.exports = {
  createRecurringPromptsStore,
  normalizeRun,
  randomId
};
