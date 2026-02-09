# Workqueue Worker (Agent Loop)

## Goal
A "worker" continuously:
- claims the next available item
- executes the item (usually as an agent/human following natural-language instructions)
- reports progress
- marks the item done/failed

This repo provides a minimal runner script that can be used by OpenClaw agents (or any supervisor) to:
- claim work deterministically via the Clawnsole workqueue CLI
- output a machine-readable JSON envelope describing the claimed item
- optionally auto-execute explicit runnable tasks (opt-in)

## Runner: `scripts/workqueue-worker.mjs`

### Install/requirements
- Node.js
- `clawnsole` available on PATH (or set `CLAWNSOLE_CMD`)

### Mode A (recommended): emit a claimed item for the agent to execute

This mode claims one item, prints it as JSON (including `instructions`), then exits.

```bash
# one-shot claim + print envelope
CLAWNSOLE_AGENT_ID=dev-3 \
node scripts/workqueue-worker.mjs --once --mode emit --queues dev-team
```

Typical OpenClaw usage:
- a cron/heartbeat triggers an agent turn
- the agent runs the command above
- the agent follows `item.instructions`
- the agent calls:
  - `clawnsole workqueue progress <id> --agent <agentId> --note "..."`
  - `clawnsole workqueue done <id> --agent <agentId> --result '{...}'`
  - or `clawnsole workqueue fail <id> --agent <agentId> --error "..."`

### Mode B: run continuously (polling)

```bash
CLAWNSOLE_AGENT_ID=dev-3 \
node scripts/workqueue-worker.mjs --mode emit --queues dev-team --pollMs 2000
```

In `emit` mode the script exits after claiming; to run continuously you typically wrap it with a supervisor
that restarts it after each claim+execute cycle (LaunchAgent/systemd/OpenClaw cron).

## Optional auto-execution (advanced / opt-in)

Some queue items may be safe to run automatically (e.g. scripted maintenance). For those, add:

```json
{
  "meta": {
    "command": ["bash", "-lc", "echo hello"]
  }
}
```

Then run:

```bash
CLAWNSOLE_AGENT_ID=dev-3 \
node scripts/workqueue-worker.mjs --once --mode auto --queues dev-team
```

Notes:
- If `meta.command` is missing, `auto` mode will mark the item failed with guidance.
- Do **not** use `auto` mode for natural-language tasks.

## Unattended operation (examples)

### OpenClaw cron pattern (recommended)
Schedule periodic agent turns that:
1) run `workqueue-worker.mjs --once --mode emit`
2) execute the claimed item
3) mark it done/failed

This keeps "execution" inside OpenClaw (where credentials/context live) while Clawnsole provides the durable queue state.

Example cron job (conceptual):

```json
{
  "name": "dev-team worker (every 15m)",
  "schedule": { "kind": "every", "everyMs": 900000 },
  "sessionTarget": "isolated",
  "payload": {
    "kind": "agentTurn",
    "message": "Run one dev-team workqueue worker pass:\n- claim-next (or noop)\n- if claimed: set in_progress + notify + execute + done/fail\n\nHint: use `node scripts/workqueue-worker.mjs --once --mode emit --queues dev-team` to claim + print the item envelope."
  }
}
```

(Exact details depend on your OpenClaw deployment and worker prompt conventions.)

### systemd / LaunchAgent
If you want an always-on local worker, use a supervisor to restart the script after each claim.

Safety notes:
- Prefer `--once` + a supervisor, so crashes don't create a wedged long-running process.
- Keep leases short (default 15m) and refresh via `progress --leaseMs` if needed.
- Never auto-execute arbitrary instructions; only auto-execute explicit `meta.command` items.
