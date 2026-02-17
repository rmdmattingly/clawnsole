# Workqueue HTTP API (Admin)

This document specifies the **admin-only** HTTP contract for Clawnsole’s workqueue API.

It’s intended for:
- UI work (web app, mobile wrappers)
- scripting clients
- integration tests

## Auth / access control

All `/api/workqueue/*` endpoints:
- require being **logged in** (cookie auth)

Behavior:
- **401** `{ "error": "unauthorized" }` if not logged in (`requireAuth` fails)
- **405** `{ "error": "method_not_allowed" }` when the HTTP method is wrong

To obtain cookies, use the standard login endpoint:

```bash
# 1) login, store cookies
curl -sS -c /tmp/clawnsole.cookies \
  -H 'content-type: application/json' \
  -d '{"password":"..."}' \
  http://127.0.0.1:5174/auth/login

# 2) call workqueue endpoints with cookies
curl -sS -b /tmp/clawnsole.cookies http://127.0.0.1:5174/api/workqueue/queues
```

Notes:
- Requests use cookie auth (`credentials: 'include'` in browser fetch).
- Request bodies are read up to ~100KB; oversized bodies may be dropped.

## Data model: WorkqueueItem

Work items are stored in a local JSON state file (see `lib/workqueue.js`). The server returns items as plain JSON.

Shape (current):

```ts
type WorkqueueStatus =
  | 'ready'
  | 'pending'        // reserved for future use (may exist in data)
  | 'claimed'
  | 'in_progress'
  | 'done'
  | 'failed';

type WorkqueueItem = {
  id: string;                 // uuid
  queue: string;
  title: string;
  instructions: string;
  priority: number;

  status: WorkqueueStatus;

  claimedBy: string;
  claimedAt: string;          // ISO timestamp
  leaseUntil: number;         // unix epoch millis

  attempts: number;
  lastError: string;

  createdAt: string;          // ISO timestamp
  updatedAt: string;          // ISO timestamp

  // optional fields
  dedupeKey?: string;
  lastNote?: string;
  result?: unknown;

  // only present on enqueue dedupe hits
  _deduped?: true;
};
```

## Endpoints

### POST `/api/workqueue/enqueue`

Create a new item in a queue.

**Request JSON:**

```json
{
  "queue": "dev-team",
  "title": "Review open PRs",
  "instructions": "Review and ship any safe PRs.",
  "priority": 50,
  "dedupeKey": "hourly-pr-review:2026-02-09T20" 
}
```

Fields:
- `queue` (string, required)
- `title` (string, optional; defaults to `"(untitled)"`)
- `instructions` (string, optional)
- `priority` (number, optional; defaults to `0`)
- `dedupeKey` (string, optional): idempotency key scoped to `{queue, dedupeKey}`

**Responses:**
- **200**

```json
{ "ok": true, "item": { "id": "...", "queue": "..." } }
```

If a `dedupeKey` match already exists, the existing item is returned with an `_deduped: true` marker:

```json
{ "ok": true, "item": { "id": "...", "_deduped": true } }
```

- **400** on invalid JSON/body:

```json
{ "ok": false, "error": "invalid_request" }
```

- **400** when `queue` is missing/blank:

```json
{ "ok": false, "error": "queue_required" }
```

**Example:**

```bash
curl -sS -b /tmp/clawnsole.cookies \
  -H 'content-type: application/json' \
  -d '{"queue":"dev-team","title":"hello","instructions":"do thing","priority":10}' \
  http://127.0.0.1:5174/api/workqueue/enqueue | jq
```

---

### POST `/api/workqueue/claim-next`

Claim the next `ready` item (highest priority first; tie-breaker: oldest `createdAt`).

**Request JSON:**

```json
{
  "agentId": "dev",
  "queue": "dev-team",
  "leaseMs": 900000
}
```

Fields:
- `agentId` (string, required)
- `queue` (string, optional). If omitted/blank, claims from **all queues**.
- `leaseMs` (number, optional). Defaults to 15 minutes.

**Responses:**
- **200** with claimed item:

```json
{ "ok": true, "item": { "id": "...", "status": "claimed", "claimedBy": "dev" } }
```

- **200** when nothing is claimable:

```json
{ "ok": true, "item": null }
```

- **400** on invalid JSON/body:

```json
{ "ok": false, "error": "invalid_request" }
```

Notes:
- `claim-next` also reaps expired leases: items in `claimed|in_progress` with `leaseUntil < now` get reset to `ready`.

---

### GET `/api/workqueue/items`

List items.

**Query params:**
- `queue` (string, optional) – exact queue name
- `status` (string, optional) – comma-separated list, e.g. `ready,claimed,in_progress`

**Response:**
- **200**

```json
{ "ok": true, "items": [ { "id": "..." } ] }
```

Sorting:
- currently sorted **newest-first** by `createdAt` string.

---

### GET `/api/workqueue/item/:id`

Fetch a single item by id.

**Response:**

```json
{ "ok": true, "item": { "id": "..." } }
```

If not found:

```json
{ "ok": true, "item": null }
```

---

### GET `/api/workqueue/queues`

List known queues.

**Response:**

```json
{ "ok": true, "queues": ["dev-team", "ops"] }
```

---

### GET `/api/workqueue/summary`

Summarize counts by status and list active (claimed/in_progress) items.

**Query params:**
- `queue` (string, optional) – if present, scope results to this queue

**Response:**

```json
{
  "ok": true,
  "queue": "dev-team",
  "counts": { "ready": 3, "claimed": 1, "done": 9 },
  "active": [
    {
      "id": "...",
      "queue": "dev-team",
      "title": "...",
      "status": "claimed",
      "priority": 60,
      "claimedBy": "dev",
      "claimedAt": "2026-02-09T20:20:35.682Z",
      "leaseUntil": 1770669335682,
      "attempts": 1,
      "updatedAt": "2026-02-09T20:20:38.482Z"
    }
  ]
}
```

Errors:
- **500** `{ "error": "workqueue_error" }` on unexpected server errors.

## Admin mutation endpoints

All endpoints in this document are **admin-only**.

In addition to `enqueue` and `claim-next`, Clawnsole currently exposes a small set of admin mutation endpoints to support UI integration.

### POST `/api/workqueue/transition`

Transition an item to `in_progress`, `done`, or `failed`.

Body:

```json
{
  "itemId": "...",
  "agentId": "dev",
  "status": "in_progress",
  "note": "optional",
  "leaseMs": 900000
}
```

- When `status="failed"`, include `error`.
- When `status="done"`, you may include `result`.

Errors:
- **404** `{ "error": "not_found" }`
- **409** `{ "error": "not_claimed" }` if the item isn’t claimed yet
- **409** `{ "error": "claimed_by_other" }` if it’s claimed by another agent

### POST `/api/workqueue/update`

Update a workqueue item (admin override).

```json
{ "itemId": "...", "patch": { "title": "...", "instructions": "...", "priority": 50, "status": "pending" } }
```

### POST `/api/workqueue/delete`

Delete a workqueue item.

```json
{ "itemId": "..." }
```
