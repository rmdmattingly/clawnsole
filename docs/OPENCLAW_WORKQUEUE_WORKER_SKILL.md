# OpenClaw Workqueue Worker Skill — API + Config Design

> Scope: design a *skill* in the **openclaw/openclaw** repo that lets OpenClaw run as a “workqueue worker” for **clawnsole** work items.
>
> This doc lives in clawnsole for now because it’s primarily describing how to drive the clawnsole workqueue from OpenClaw.

## Goals

- Provide a first-class **OpenClaw skill** that:
  - sweeps/enqueues PR review items (optional)
  - claims/resumes **exactly one** work item from clawnsole
  - maintains a lease (progress heartbeats)
  - executes item instructions using OpenClaw’s tool surface
  - marks done/fail with a structured payload
- Keep the worker predictable, safe, and easy to operate via cron/heartbeat.

Non-goals:
- Building a full CI/CD orchestrator.
- Supporting multiple simultaneous items in one worker invocation.

## Where it should live

- **Implementation**: `openclaw/openclaw` (skills are an OpenClaw concern; it needs access to OpenClaw tools, cron wiring, session routing).
- **Reference docs**:
  - Short “how-to” section in OpenClaw docs (`/docs`) describing configuration + examples.
  - This clawnsole doc can remain as the “protocol details / clawnsole command mapping”.

## Skill name + surface

Proposed skill name: `workqueue-worker`

- Primary entrypoint: `runOnce` (one pass: sweep → claim/resume → execute one item → done/fail)
- Optional entrypoint: `sweepPRs` (only PR sweep)

## Inputs (skill config)

These are stable, declarative skill inputs (YAML/JSON) suitable for OpenClaw config.

```ts
type WorkqueueWorkerConfig = {
  // Identity + scope
  agentId: string;              // e.g. "dev-3"
  queues: string[];             // e.g. ["dev-team"]

  // Leasing
  leaseMs?: number;             // default 15m
  progressEveryMs?: number;     // default 10m (extend lease + note)

  // Worker loop
  maxIterations?: number;       // default 1 (runOnce)
  pollIntervalMs?: number;      // only used if maxIterations > 1

  // Behaviors
  enablePrSweep?: boolean;      // default true
  allowStatuses?: ("ready"|"pending")[]; // default ["ready"] (see missing flags)

  // Execution routing
  executionMode?: "isolated" | "main";  // default "isolated" (recommended)
  model?: string;              // optional model override
  thinking?: "low"|"medium"|"high";     // optional

  // Safety rails
  maxToolCalls?: number;       // optional guardrail
  maxRunSeconds?: number;      // optional guardrail
};
```

### Defaults (recommended)

- `executionMode="isolated"` to keep worker runs from polluting the main chat context.
- `leaseMs=900000` (15m)
- `progressEveryMs=600000` (10m)
- `maxIterations=1` (cron drives repetition)

## Outputs (result payload schema)

The skill should return a compact, structured result so cron can “announce” a summary.

```ts
type WorkqueueWorkerResult =
  | {
      ok: true;
      action: "noop_empty" | "completed";
      itemId?: string;
      title?: string;
      summary?: string;      // 1–3 sentences
      links?: string[];      // PR URLs etc.
      elapsedMs: number;
    }
  | {
      ok: false;
      action: "failed" | "blocked";
      itemId?: string;
      title?: string;
      error: string;         // 1 line
      nextSteps?: string;    // 1–3 bullets in a string
      elapsedMs: number;
    };
```

## Execution model (how instructions run)

### Recommended: `isolated` execution mode

- The worker claims one item, then spawns an **isolated agent turn** to execute it.
- The isolated run receives:
  - the work item payload (id/title/instructions)
  - the command mapping (how to extend lease, mark progress, done/fail)
  - constraints (token discipline, keep logs short)
- The isolated run is allowed to use normal OpenClaw tools (browser, exec, gh, etc.) but MUST:
  - extend lease every `progressEveryMs`
  - keep progress notes short
  - fail fast when blocked

Why isolated:
- avoids contaminating the main session
- easier to set a worker-specific model/thinking
- cron jobs already prefer isolated `agentTurn`

### `main` execution mode (only if explicitly needed)

- Use only when the workflow requires the main-session context (rare).
- Still keep the work item execution in a single deterministic pass.

## Exact clawnsole commands this skill should use

Assuming the OpenClaw host has `clawnsole` CLI available.

- Claim next:
  - `clawnsole workqueue claim-next --agent <agentId> --queues <q1,q2,...> --leaseMs <leaseMs>`
- Progress / extend lease:
  - `clawnsole workqueue progress <itemId> --agent <agentId> --note "..." --leaseMs <leaseMs>`
- Done:
  - `clawnsole workqueue done <itemId> --agent <agentId> --result '<json>'`
- Fail:
  - `clawnsole workqueue fail <itemId> --agent <agentId> --error "..."`
- Inspect (optional for richer context):
  - `clawnsole workqueue inspect <itemId> --json`

Note: in this repo there are also helper scripts (`scripts/workqueue/*.mjs`) that wrap the above; the OpenClaw skill can either:
- call clawnsole CLI directly (preferred long-term), or
- call the wrapper scripts during bootstrap.

## PR sweep

If enabled, first run:

- `node <openclaw-workspace>/scripts/workqueue/enqueue-pr-review.mjs`

This stays an implementation detail; the skill should expose it as `enablePrSweep`.

## Missing / desirable CLI flags

To make the worker robust, we likely need one (or both) of:

1) **Claim from multiple statuses**
- Today the worker often treats `pending` like `ready` (legacy behavior).
- Add flag to `claim-next`:
  - `--includeStatuses ready,pending` (default `ready`)

2) **Resume owned active item**
- If an agent already holds a lease on an item (e.g., crash/restart), worker should resume it.
- Add flag:
  - `--resumeOwned` (or `--preferOwned`) to pick currently `claimed|in_progress` with `claimedBy=agentId` first.

3) **JSON output everywhere**
- Ensure `claim-next`, `progress`, `done`, `fail` support `--json` with stable schema.

## Checklist (ship order)

1. **OpenClaw repo**: create `skills/workqueue-worker/` with:
   - `SKILL.md` describing config + examples
   - `index.ts` implementing `runOnce`
2. Implement clawnsole command adapter (thin wrapper):
   - claim/resume
   - progress heartbeat
   - done/fail
3. Add cron example to OpenClaw docs:
   - every 15m runOnce
4. **Clawnsole repo**:
   - add/confirm missing CLI flags (`includeStatuses`, `resumeOwned`, `--json`)
   - update clawnsole docs with worker expectations
5. Add a small integration test (optional):
   - mocked clawnsole responses → verify done/fail payload is emitted

## Example OpenClaw cron job (concept)

```json
{
  "name": "dev-3 workqueue worker",
  "schedule": { "kind": "every", "everyMs": 900000 },
  "payload": {
    "kind": "agentTurn",
    "message": "Run workqueue-worker.runOnce with agentId=dev-3 queues=[dev-team] leaseMs=900000"
  },
  "sessionTarget": "isolated",
  "enabled": true
}
```
