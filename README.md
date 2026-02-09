# Clawnsole

A live, visual chat console for OpenClaw. It connects directly to the local
gateway and renders an interactive chat experience.

## Demo

![Clawnsole demo](assets/clawnsole-demo.gif)

[Watch the demo](assets/clawnsole-demo.mov)

## One-line install

```bash
curl -fsSL https://raw.githubusercontent.com/rmdmattingly/clawnsole/main/scripts/install.sh | bash
```

The installer will prompt for admin/guest passwords and will install a
LaunchAgent to auto-start Clawnsole on login.
You can also enable automatic updates (LaunchAgent).
It will expose a nice local URL at https://clawnsole.local (macOS + sudo required).
(HTTP redirects to HTTPS; HTTPS uses a local/internal Caddy certificate.)

### HTTPS
If you’re trying to access a QA/hosted Clawnsole instance over **https** and see `ERR_SSL_PROTOCOL_ERROR`, you likely need TLS termination in front of the app (Caddy/nginx). See: [`docs/HTTPS.md`](./docs/https-tls.md)

You can override defaults:

- `CLAWNSOLE_REPO` (repo URL)
- `CLAWNSOLE_DIR` (install location)
- `OPENCLAW_HOME` (default: `~/.openclaw`)

## One-line update

```bash
curl -fsSL https://raw.githubusercontent.com/rmdmattingly/clawnsole/main/scripts/update.sh | bash
```

**Deploy hardening:** the updater now does a *staging health check* **and** a *login-flow verification* on the new (blue/green) instance **before** cutting Caddy over. If login breaks, the update aborts and leaves the previous version serving traffic.

## Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/rmdmattingly/clawnsole/main/scripts/uninstall.sh | bash
```

You can also run:

```bash
curl -fsSL https://raw.githubusercontent.com/rmdmattingly/clawnsole/main/scripts/install.sh | bash -s -- --uninstall
```

## Connect

- WS URL: `ws://127.0.0.1:18789`
- Token: auto-fetched from `~/.openclaw/openclaw.json` via `/token`

The UI sends a `connect` request on the first frame, as required by the gateway
protocol.

## Password protection (optional)

Passwords live in `~/.openclaw/clawnsole.json`. The installer sets these for you,
but you can update them manually too:

```json
{
  "adminPassword": "your-strong-password",
  "guestPassword": "guest-password"
}
```

Clawnsole uses HTTP Basic auth; any username is accepted, the password must match.
If omitted, admin defaults to `admin` and guest defaults to `guest`.

## Notes

- Existing OpenClaw sessions keep their model. Start a new session to pick up a
  new default.
- Clawnsole stores your token and device ID in localStorage for convenience.

<details>
<summary>Developers: run locally</summary>

```bash
cd /Users/raysopenclaw/src/clawnsole
npm run dev
```

Then open http://localhost:5173 in a browser.
</details>

## QA vs Prod (local)

If you want a stable Prod instance while iterating in QA, run them on different
ports and set `CLAWNSOLE_INSTANCE` so their auth cookies do not collide.

```bash
# Prod (stable)
CLAWNSOLE_INSTANCE=prod PORT=5173 npm run dev

# QA (fast iteration)
CLAWNSOLE_INSTANCE=qa PORT=5174 npm run dev
```

Connect:

- Prod: `http://localhost:5173/admin` (or `/guest`)
- QA: `http://localhost:5174/admin` (or `/guest`)
