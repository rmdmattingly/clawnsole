# Workqueue (Clawnsole)

Clawnsole includes a small, file-backed workqueue used by scripts and by OpenClaw “workers”.

This doc focuses on the **assignments contract** (how workers discover which queues to claim from).

## Data location

Workqueue state lives on disk at:

- `${OPENCLAW_HOME:-~/.openclaw}/clawnsole/work-queues.json`

(See `clawnsole workqueue --help`.)

A lock file is used for concurrency:

- `${OPENCLAW_HOME:-~/.openclaw}/clawnsole/work-queues.lock`

## State schema (MVP)

`work-queues.json` is a single JSON object:

```json
{
  "version": 1,
  "queues": {},
  "items": [],
  "assignments": {}
}
```

Key fields:

- `items[]`: array of work items.
  - Each item has (at minimum): `id`, `queue`, `title`, `instructions`, `priority`, `status`, timestamps, and lease fields.
- `assignments`: `{ [agentId: string]: string[] }`
  - Maps an `agentId` to an ordered list of queue names that agent should claim from.

## Queue discovery (how a worker chooses queues)

When a worker runs `clawnsole workqueue claim-next`, queues are resolved in this order:

1) **Explicit request**: `--queues q1,q2`
2) **Agent assignment**: `work-queues.json -> assignments[agentId]`
3) **Default queues**: `CLAWNSOLE_DEFAULT_QUEUES` (CSV), falling back to `dev-team`

If none resolve to a non-empty list, claim-next returns `item: null` with `reason: "NO_QUEUES"`.

## CLI usage

### Set assignments for an agent

```bash
clawnsole workqueue assignments set --agent dev-3 --queues dev-team,qa
```

### List assignments

```bash
clawnsole workqueue assignments list
```

### Claim next item (using assignments/defaults)

```bash
clawnsole workqueue claim-next --agent dev-3
```

### Claim next item (explicit queues)

```bash
clawnsole workqueue claim-next --agent dev-3 --queues dev-team
```

## Clawnsole UI grouping

Workqueue panes default routine grouping to `Auto`. In auto mode, repetitive routine rows are collapsed once more than 50 rows are visible after the pane's queue, status, scope, and sort filters are applied. Operators can switch the pane control to `On` or `Off` when they need forced grouping or a fully expanded list.

## Examples

### Single-agent worker (recommended)

```bash
# One-time setup
clawnsole workqueue assignments set --agent dev-3 --queues dev-team

# Worker loop
while true; do
  clawnsole workqueue claim-next --agent dev-3
  sleep 2
done
```

### Multiple workers, different queues

```bash
clawnsole workqueue assignments set --agent dev-1 --queues dev-team
clawnsole workqueue assignments set --agent qa-worker --queues qa

clawnsole workqueue claim-next --agent dev-1
clawnsole workqueue claim-next --agent qa-worker
```
