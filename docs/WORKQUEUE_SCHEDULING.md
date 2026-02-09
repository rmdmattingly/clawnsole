# Workqueue Scheduling (Recurring Enqueue Jobs)

## Goal
Sometimes you want to *add* a recurring work item into a queue on an interval (e.g. "Review open PRs" every hour) instead of keeping a worker running continuously.

This repo supports that pattern by:
- using `clawnsole workqueue enqueue ...` as the scriptable entrypoint
- supporting **idempotency** via `--dedupeKey` so a given schedule window doesn't create duplicates

## CLI: enqueue with de-dupe

`--dedupeKey` makes enqueue idempotent. If an item already exists with the same `queue` + `dedupeKey`, the enqueue returns the existing item instead of creating a new one.

Example:

```bash
clawnsole workqueue enqueue \
  --queue dev-team \
  --title "Review open PRs" \
  --instructions "Review and ship any safe PRs. Leave comments if blocked." \
  --priority 50 \
  --dedupeKey "hourly-pr-review:$(date -u +%Y-%m-%dT%H)"
```

Notes:
- Use UTC for the key so it behaves consistently across machines.
- The key format is up to you; the important part is it changes once per schedule window.

## Scheduling option A: cron

Add a crontab entry (hourly):

```cron
# Enqueue hourly PR review
0 * * * * /bin/bash -lc 'clawnsole workqueue enqueue --queue dev-team --title "Review open PRs" --instructions "Review and ship any safe PRs. Leave comments if blocked." --priority 50 --dedupeKey "hourly-pr-review:$(date -u +%Y-%m-%dT%H)"'
```

## Scheduling option B: macOS LaunchAgent

Create a LaunchAgent that runs every hour and calls the same command.

This repo doesn't ship a LaunchAgent template yet; if we standardize one, we should add it to `scripts/`.

---

## Unattended operation (workers)

Enqueue jobs are only half the story: you also need **workers** to claim and transition items.

Recommended pattern:
- run workers under a dedicated OS user (least privilege)
- each worker process uses a stable `--agent` id
- workers should renew their lease periodically while in progress

### Safety notes

- **Use a dedicated queue for automation** (e.g. `ops`, `demo-*`) to avoid interfering with human workflows.
- **Prefer idempotent enqueue** (`--dedupeKey`) so cron/systemd retries don't spam duplicates.
- **Don’t run as root** unless you absolutely must.
- Treat `instructions` as potentially sensitive; they may contain internal links/tokens.

### Example: one-shot worker pass (cron)

This pattern runs a “worker pass” every minute. Your worker script should:
1) `claim-next`
2) if no item, exit 0
3) if item, do work and `progress`/`done`/`fail`

```cron
* * * * * /bin/bash -lc 'cd /path/to/your/worker && node worker-pass.mjs >> /var/log/workqueue-worker.log 2>&1'
```

### Example: long-running worker (systemd)

A long-running worker is usually simpler and lower-latency than cron.

`/etc/systemd/system/clawnsole-workqueue-worker.service`

```ini
[Unit]
Description=Clawnsole workqueue worker
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=clawnsole
WorkingDirectory=/path/to/your/worker
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /path/to/your/worker/worker-loop.mjs
Restart=always
RestartSec=2

# Hardening (tune to your needs)
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true

[Install]
WantedBy=multi-user.target
```

---

## Demo: 2 workers concurrently

A runnable demo lives here:

```bash
node examples/workqueue/two-workers-demo.mjs
```

What it does:
- seeds a unique `demo-two-workers-<timestamp>` queue with 3 items
- starts two worker processes
- asserts they claimed different items
- transitions one to `done` and one to `failed`
- prints the final queue state
