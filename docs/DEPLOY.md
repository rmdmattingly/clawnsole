# Deploying Clawnsole to QA and Prod (local)

Clawnsole runs two instances on one host:

- **QA (direct app port, HTTP):** `http://clawnsole.local:5174` (`CLAWNSOLE_INSTANCE=qa`, `PORT=5174`)
- **Prod (direct app port, HTTP):** `http://clawnsole.local:5173` (`CLAWNSOLE_INSTANCE=prod`, `PORT=5173`)

The default end-user install also sets up **Caddy TLS termination**, so the friendly URL is:
- `https://clawnsole.local` (no port)

> Why `CLAWNSOLE_INSTANCE` matters: browser cookies are not port-scoped, so QA/Prod must namespace cookies to avoid login collisions.

## Source of truth for code
- The app code is in a git checkout under `~/src/dev/clawnsole` (or another workspace folder).
- Deployed instances can be started directly from a checkout during development.

## Deploy procedure (manual, deterministic)

### 1) Update code
```bash
cd ~/src/dev/clawnsole

git fetch origin

git checkout main
# Choose one:
# - Fast-forward to latest main
# - Or checkout a specific commit/tag for a pinned deploy

git pull --ff-only

npm ci
npm test
```

### 2) QA deploy (port 5174)
Start (or restart) QA:
```bash
cd ~/src/dev/clawnsole

# If an older QA node process is running, stop it.
# (Use Activity Monitor or `ps aux | rg 'node server.js'` then `kill <pid>`.)

CLAWNSOLE_INSTANCE=qa PORT=5174 node server.js
```

Sanity checks:
- `curl http://127.0.0.1:5174/meta`
- Visit `http://clawnsole.local:5174/`
- Log in (admin)
- Verify: pane shows CONNECTED, send/receive works, reload persists

### 3) Prod deploy (port 5173)
After QA is good, start (or restart) Prod:
```bash
cd ~/src/dev/clawnsole

CLAWNSOLE_INSTANCE=prod PORT=5173 node server.js
```

Sanity checks:
- `curl http://127.0.0.1:5173/meta`
- Visit `http://clawnsole.local:5173/`
- Log in (admin)
- Verify: CONNECTED + send/receive + reload persistence

## Rollback
- Re-checkout the previous known-good commit on `main` (or a tag), restart the instance.

## Notes
- The installer/LaunchAgent-based deployment in `~/.openclaw/apps/clawnsole` is a separate "end-user install" path.
- During active development, prefer running QA/Prod from a workspace checkout so changes are auditable and branch-based.
