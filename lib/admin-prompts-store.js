const fs = require('fs')
const path = require('path')
const { DatabaseSync } = require('node:sqlite')

function randomId() {
  try {
    return require('crypto').randomUUID()
  } catch {
    return String(Date.now()) + '-' + Math.random().toString(16).slice(2) + '-' + Math.random().toString(16).slice(2)
  }
}

function coercePromptRow(row) {
  if (!row) return null
  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    agentId: String(row.agent_id || 'main'),
    message: String(row.message || ''),
    intervalMinutes: Number(row.interval_minutes || 60),
    enabled: Number(row.enabled || 0) !== 0,
    createdAt: Number(row.created_at || 0) || Date.now(),
    updatedAt: Number(row.updated_at || 0) || Date.now(),
    lastRunAt: row.last_run_at == null ? null : Number(row.last_run_at),
    nextRunAt: row.next_run_at == null ? null : Number(row.next_run_at),
    lastStatus: String(row.last_status || 'never'),
    lastError: String(row.last_error || '')
  }
}

function coerceRunRow(row) {
  if (!row) return null
  return {
    id: String(row.id || ''),
    promptId: String(row.prompt_id || ''),
    idempotencyKey: String(row.idempotency_key || ''),
    sessionKey: String(row.session_key || ''),
    status: String(row.status || 'pending'),
    error: String(row.error || ''),
    createdAt: Number(row.created_at || 0) || Date.now(),
    deliveredAt: row.delivered_at == null ? null : Number(row.delivered_at)
  }
}

function createAdminPromptsStore({ dbPath, legacyPromptsPath } = {}) {
  const resolvedPath = typeof dbPath === 'string' && dbPath.trim() ? dbPath.trim() : path.join(process.cwd(), 'clawnsole.db')
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true })

  const db = new DatabaseSync(resolvedPath)
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA busy_timeout = 5000;')

  db.exec(`
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
      idempotency_key TEXT NOT NULL,
      session_key TEXT NOT NULL,
      status TEXT NOT NULL,
      error TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      delivered_at INTEGER,
      FOREIGN KEY (prompt_id) REFERENCES admin_prompts(id) ON DELETE CASCADE,
      UNIQUE (idempotency_key)
    );

    CREATE INDEX IF NOT EXISTS idx_admin_prompts_next_run
      ON admin_prompts (enabled, next_run_at);

    CREATE INDEX IF NOT EXISTS idx_admin_prompt_runs_prompt_created
      ON admin_prompt_runs (prompt_id, created_at DESC);
  `)

  const countStmt = db.prepare('SELECT COUNT(*) AS c FROM admin_prompts')
  const promptCount = Number(countStmt.get()?.c || 0)

  if (promptCount === 0 && legacyPromptsPath) {
    try {
      const raw = fs.readFileSync(legacyPromptsPath, 'utf8')
      const data = JSON.parse(raw)
      const prompts = Array.isArray(data?.prompts) ? data.prompts : []
      const insert = db.prepare(`
        INSERT INTO admin_prompts (
          id, title, agent_id, message, interval_minutes, enabled,
          created_at, updated_at, last_run_at, next_run_at, last_status, last_error
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      const tx = db.transaction((rows) => {
        for (const p of rows) {
          if (!p || typeof p !== 'object') continue
          const now = Date.now()
          insert.run(
            String(p.id || randomId()),
            String(p.title || 'Recurring prompt'),
            String(p.agentId || 'main'),
            String(p.message || ''),
            Math.max(1, Number(p.intervalMinutes) || 60),
            p.enabled === false ? 0 : 1,
            Number(p.createdAt || now),
            Number(p.updatedAt || now),
            p.lastRunAt == null ? null : Number(p.lastRunAt),
            p.nextRunAt == null ? null : Number(p.nextRunAt),
            String(p.lastStatus || 'never'),
            String(p.lastError || '')
          )
        }
      })
      tx(prompts)
    } catch {}
  }

  const stmtListPrompts = db.prepare('SELECT * FROM admin_prompts ORDER BY created_at ASC, id ASC')
  const stmtGetPrompt = db.prepare('SELECT * FROM admin_prompts WHERE id = ? LIMIT 1')
  const stmtDeletePrompt = db.prepare('DELETE FROM admin_prompts WHERE id = ?')
  const stmtInsertPrompt = db.prepare(`
    INSERT INTO admin_prompts (
      id, title, agent_id, message, interval_minutes, enabled,
      created_at, updated_at, last_run_at, next_run_at, last_status, last_error
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const stmtUpdatePrompt = db.prepare(`
    UPDATE admin_prompts
    SET title=?, agent_id=?, message=?, interval_minutes=?, enabled=?,
        updated_at=?, last_run_at=?, next_run_at=?, last_status=?, last_error=?
    WHERE id=?
  `)

  const stmtFindRunByIdempotency = db.prepare('SELECT * FROM admin_prompt_runs WHERE idempotency_key = ? LIMIT 1')
  const stmtInsertRun = db.prepare(`
    INSERT INTO admin_prompt_runs (
      id, prompt_id, idempotency_key, session_key, status, error, created_at, delivered_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const stmtUpdateRun = db.prepare(`
    UPDATE admin_prompt_runs
    SET status = ?, error = ?, delivered_at = ?
    WHERE id = ?
  `)
  const stmtListRunsByPrompt = db.prepare(`
    SELECT * FROM admin_prompt_runs
    WHERE prompt_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT ?
  `)

  return {
    dbPath: resolvedPath,

    listPrompts() {
      return stmtListPrompts.all().map(coercePromptRow)
    },

    getPrompt(id) {
      return coercePromptRow(stmtGetPrompt.get(String(id || '')))
    },

    createPrompt(input) {
      const now = Date.now()
      const prompt = {
        id: String(input?.id || randomId()),
        title: String(input?.title || 'Recurring prompt'),
        agentId: String(input?.agentId || 'main'),
        message: String(input?.message || ''),
        intervalMinutes: Math.max(1, Number(input?.intervalMinutes) || 60),
        enabled: input?.enabled === false ? false : true,
        createdAt: Number(input?.createdAt || now),
        updatedAt: Number(input?.updatedAt || now),
        lastRunAt: input?.lastRunAt == null ? null : Number(input.lastRunAt),
        nextRunAt: input?.nextRunAt == null ? null : Number(input.nextRunAt),
        lastStatus: String(input?.lastStatus || 'never'),
        lastError: String(input?.lastError || '')
      }
      stmtInsertPrompt.run(
        prompt.id,
        prompt.title,
        prompt.agentId,
        prompt.message,
        prompt.intervalMinutes,
        prompt.enabled ? 1 : 0,
        prompt.createdAt,
        prompt.updatedAt,
        prompt.lastRunAt,
        prompt.nextRunAt,
        prompt.lastStatus,
        prompt.lastError
      )
      return prompt
    },

    updatePrompt(id, input) {
      const existing = this.getPrompt(id)
      if (!existing) return null
      const now = Date.now()
      const next = {
        ...existing,
        ...input,
        id: existing.id,
        updatedAt: Number(input?.updatedAt || now)
      }
      stmtUpdatePrompt.run(
        String(next.title || 'Recurring prompt'),
        String(next.agentId || 'main'),
        String(next.message || ''),
        Math.max(1, Number(next.intervalMinutes) || 60),
        next.enabled === false ? 0 : 1,
        Number(next.updatedAt || now),
        next.lastRunAt == null ? null : Number(next.lastRunAt),
        next.nextRunAt == null ? null : Number(next.nextRunAt),
        String(next.lastStatus || 'never'),
        String(next.lastError || ''),
        existing.id
      )
      return this.getPrompt(existing.id)
    },

    deletePrompt(id) {
      const info = stmtDeletePrompt.run(String(id || ''))
      return Number(info?.changes || 0) > 0
    },

    findRunByIdempotencyKey(idempotencyKey) {
      return coerceRunRow(stmtFindRunByIdempotency.get(String(idempotencyKey || '')))
    },

    insertRun(input) {
      const existing = this.findRunByIdempotencyKey(input?.idempotencyKey)
      if (existing) return { run: existing, deduped: true }
      const run = {
        id: String(input?.id || randomId()),
        promptId: String(input?.promptId || ''),
        idempotencyKey: String(input?.idempotencyKey || randomId()),
        sessionKey: String(input?.sessionKey || ''),
        status: String(input?.status || 'pending'),
        error: String(input?.error || ''),
        createdAt: Number(input?.createdAt || Date.now()),
        deliveredAt: input?.deliveredAt == null ? null : Number(input.deliveredAt)
      }
      stmtInsertRun.run(
        run.id,
        run.promptId,
        run.idempotencyKey,
        run.sessionKey,
        run.status,
        run.error,
        run.createdAt,
        run.deliveredAt
      )
      return { run, deduped: false }
    },

    updateRun(id, patch) {
      const existing = db.prepare('SELECT * FROM admin_prompt_runs WHERE id = ? LIMIT 1').get(String(id || ''))
      if (!existing) return null
      const status = patch?.status != null ? String(patch.status) : String(existing.status || 'pending')
      const error = patch?.error != null ? String(patch.error) : String(existing.error || '')
      const deliveredAt = patch?.deliveredAt === undefined
        ? (existing.delivered_at == null ? null : Number(existing.delivered_at))
        : (patch.deliveredAt == null ? null : Number(patch.deliveredAt))
      stmtUpdateRun.run(status, error, deliveredAt, String(id))
      return coerceRunRow(db.prepare('SELECT * FROM admin_prompt_runs WHERE id = ? LIMIT 1').get(String(id || '')))
    },

    listRunsByPrompt(promptId, { limit = 50 } = {}) {
      const max = Math.max(1, Math.min(500, Number(limit) || 50))
      return stmtListRunsByPrompt.all(String(promptId || ''), max).map(coerceRunRow)
    },

    close() {
      try {
        db.close()
      } catch {}
    }
  }
}

module.exports = {
  createAdminPromptsStore
}
