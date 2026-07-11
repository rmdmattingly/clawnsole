# Recurring Prompts External Worker (Python)

This worker runs outside OpenClaw Gateway scheduling. It logs into Clawnsole, polls recurring prompts, filters due slots, and asks Clawnsole to trigger each delivery with a deterministic idempotency key per slot.

## API contract expected

- `POST /auth/login`
  - Body: `{ password }`
  - Returns the admin auth cookie used by later calls
- `GET /api/recurring-prompts`
  - Returns `{ ok: true, prompts: [{ id, agentId, message, nextRunAt, enabled? }, ...] }`
- `POST /api/recurring-prompts/:id/trigger`
  - Body: `{ scheduledAt, idempotencyKey, deviceLabel, dryRun? }`
  - Returns `{ ok: true, ... }`

## Run manually

```bash
python3 scripts/recurring_prompts_worker.py \
  --base-url http://127.0.0.1:5173 \
  --admin-password "$CLAWNSOLE_ADMIN_PASSWORD" \
  --once
```

If a caller already has an admin cookie, pass `--cookie "$CLAWNSOLE_ADMIN_COOKIE"` instead of `--admin-password`.

Loop mode (default) runs every `--loop-seconds` (default 60s).

## Flags / env

- `--base-url` / `CLAWNSOLE_BASE_URL`
- `--admin-password` / `CLAWNSOLE_ADMIN_PASSWORD`
- `--cookie` / `CLAWNSOLE_ADMIN_COOKIE`
- `--loop-seconds`
- `--timeout`
- `--retries`
- `--backoff`
- `--max-backoff`
- `--once`
- `--dry-run`

## systemd example

`/etc/systemd/system/clawnsole-recurring-worker.service`

```ini
[Unit]
Description=Clawnsole recurring prompts worker
After=network-online.target

[Service]
Type=simple
Environment=CLAWNSOLE_BASE_URL=http://127.0.0.1:5173
Environment=CLAWNSOLE_ADMIN_PASSWORD=replace-with-admin-password
WorkingDirectory=/opt/clawnsole
ExecStart=/usr/bin/python3 /opt/clawnsole/scripts/recurring_prompts_worker.py --loop-seconds 60
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

## launchd (macOS) example

`~/Library/LaunchAgents/com.clawnsole.recurring-worker.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key><string>com.clawnsole.recurring-worker</string>
    <key>ProgramArguments</key>
    <array>
      <string>/usr/bin/python3</string>
      <string>/Users/you/src/dev/clawnsole/scripts/recurring_prompts_worker.py</string>
      <string>--loop-seconds</string><string>60</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
      <key>CLAWNSOLE_BASE_URL</key><string>http://127.0.0.1:5173</string>
      <key>CLAWNSOLE_ADMIN_PASSWORD</key><string>replace-with-admin-password</string>
    </dict>
    <key>RunAtLoad</key><true/>
    <key>KeepAlive</key><true/>
    <key>StandardOutPath</key><string>/tmp/clawnsole-recurring-worker.log</string>
    <key>StandardErrorPath</key><string>/tmp/clawnsole-recurring-worker.err.log</string>
  </dict>
</plist>
```

Load:

```bash
launchctl unload ~/Library/LaunchAgents/com.clawnsole.recurring-worker.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.clawnsole.recurring-worker.plist
```
