# Clawnsole

A live, visual chat console for OpenClaw. It connects directly to the local
gateway and renders an interactive chat experience.

## Run (local server)

```bash
cd /Users/raysopenclaw/src/clawnsole
npm run dev
```

Then open http://localhost:5173 in a browser.

## One-line install

```bash
curl -fsSL https://raw.githubusercontent.com/rmdmattingly/clawnsole/main/scripts/install.sh | bash
```

The installer will prompt for admin/guest passwords and optionally install a
LaunchAgent to auto-start Clawnsole on login.
You can also enable automatic updates (LaunchAgent).
Optional: expose a nice local URL at http://clawnsole.local (macOS + sudo).

You can override defaults:

- `CLAWNSOLE_REPO` (repo URL)
- `CLAWNSOLE_DIR` (install location)
- `OPENCLAW_HOME` (default: `~/.openclaw`)

## One-line update

```bash
curl -fsSL https://raw.githubusercontent.com/rmdmattingly/clawnsole/main/scripts/update.sh | bash
```

## Connect

- WS URL: `ws://127.0.0.1:18789`
- Token: auto-fetched from `~/.openclaw/openclaw.json` via `/token`

The UI sends a `connect` request on the first frame, as required by the gateway
protocol.

## Password protection (optional)

To require a password (useful for LAN access), add this to your OpenClaw config:

```json
{
  "ui": {
    "clawnsole": {
      "adminPassword": "your-strong-password",
      "guestPassword": "guest-password"
    }
  }
}
```

Clawnsole uses HTTP Basic auth; any username is accepted, the password must match.
If omitted, admin defaults to `admin` and guest defaults to `guest`.

## Notes

- Existing OpenClaw sessions keep their model. Start a new session to pick up a
  new default.
- Clawnsole stores your token and device ID in localStorage for convenience.
