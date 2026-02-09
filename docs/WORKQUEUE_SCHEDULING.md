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
