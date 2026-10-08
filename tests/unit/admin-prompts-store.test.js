const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { createAdminPromptsStore } = require('../../lib/admin-prompts-store')

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'clawnsole-admin-prompts-'))
}

test('admin-prompts-store: initializes schema on fresh db', () => {
  const root = tempRoot()
  const dbPath = path.join(root, 'admin-prompts.sqlite')
  const store = createAdminPromptsStore({ dbPath })

  const prompts = store.listPrompts()
  assert.deepEqual(prompts, [])

  // smoke: create + read proves table exists and is writable
  const created = store.createPrompt({ title: 'A', agentId: 'main', message: 'hello', intervalMinutes: 5 })
  assert.ok(created.id)
  assert.equal(store.getPrompt(created.id)?.message, 'hello')

  store.close()
})

test('admin-prompts-store: prompt CRUD persists across reopen', () => {
  const root = tempRoot()
  const dbPath = path.join(root, 'admin-prompts.sqlite')

  let store = createAdminPromptsStore({ dbPath })
  const created = store.createPrompt({
    title: 'Daily check-in',
    agentId: 'main',
    message: 'Ping me',
    intervalMinutes: 60,
    enabled: true,
    nextRunAt: Date.now() + 60_000
  })
  store.updatePrompt(created.id, { enabled: false, title: 'Updated title' })
  store.close()

  store = createAdminPromptsStore({ dbPath })
  const fetched = store.getPrompt(created.id)
  assert.ok(fetched)
  assert.equal(fetched.title, 'Updated title')
  assert.equal(fetched.enabled, false)

  const deleted = store.deletePrompt(created.id)
  assert.equal(deleted, true)
  assert.equal(store.getPrompt(created.id), null)
  store.close()
})

test('admin-prompts-store: run insert/list and idempotency lookup', () => {
  const root = tempRoot()
  const dbPath = path.join(root, 'admin-prompts.sqlite')
  const store = createAdminPromptsStore({ dbPath })

  const prompt = store.createPrompt({ title: 'x', agentId: 'main', message: 'm', intervalMinutes: 5 })
  const first = store.insertRun({
    promptId: prompt.id,
    idempotencyKey: 'k1',
    sessionKey: 'agent:main:admin:scheduler',
    status: 'pending'
  })
  assert.equal(first.deduped, false)

  const second = store.insertRun({
    promptId: prompt.id,
    idempotencyKey: 'k1',
    sessionKey: 'agent:main:admin:scheduler',
    status: 'pending'
  })
  assert.equal(second.deduped, true)
  assert.equal(second.run.id, first.run.id)

  const listed = store.listRunsByPrompt(prompt.id, { limit: 10 })
  assert.equal(listed.length, 1)
  assert.equal(listed[0].idempotencyKey, 'k1')

  const found = store.findRunByIdempotencyKey('k1')
  assert.ok(found)
  assert.equal(found.promptId, prompt.id)

  store.close()
})
