# CLAWNSOLE: Current State Handoff (QA/Prod + Identity + Retention + Opacity)

Workspace: `/Users/raysopenclaw/src/clawnsole`

Goal: keep Clawnsole usable day-to-day (stable Prod) while iterating (QA), and prevent regressions in connection reliability, role routing, agent identity, and per-agent chat history.

## TL;DR (How To Use Prod vs QA)

Clawnsole now supports instance-scoped cookies via `CLAWNSOLE_INSTANCE`, so you can run Prod and QA at the same time without login collisions (cookies are not port-scoped in browsers).

Commands:

```bash
# Prod (stable)
npm run dev:prod   # CLAWNSOLE_INSTANCE=prod PORT=5173

# QA (fast iteration)
npm run dev:qa     # CLAWNSOLE_INSTANCE=qa PORT=5174
```

URLs:

- Prod: `http://localhost:5173/admin`
- QA: `http://localhost:5174/admin`

You sign in separately per instance because cookies are now suffixed:

- Prod cookies: `clawnsole_auth_prod`, `clawnsole_role_prod`
- QA cookies: `clawnsole_auth_qa`, `clawnsole_role_qa`

## Architecture Snapshot

- HTTP server: `server.js` boots `createClawnsoleServer()` from `clawnsole-server.js`.
- Static UI: `index.html` + `styles.css` + `app.js`.
- Gateway connectivity:
  - UI connects to Clawnsole server WS endpoints, which proxy to the real OpenClaw gateway WS.
  - This keeps the gateway token off the browser (and allows role enforcement).

Key server endpoints (see `clawnsole-server.js`):

- `POST /auth/login`, `POST /auth/logout`, `GET /auth/role`: simple cookie auth.
- `GET /agents` (admin-only): returns agent list including `displayName` + `emoji`.
- `POST /upload`, `GET /uploads/...`: attachment support.

## Connection Reliability / Multi-Tab / Multi-Pane

Client connection behavior lives in `gateway-client.js` and pane management in `app.js`.

Notable reliability hardening (covered by unit tests):

- Handshake prefers `connect.challenge` when present, but falls back if it never arrives.
- Reconnect scheduling avoids timer explosions (single reconnect timer).
- Manual disconnect does not auto-reconnect.
- Offline state does not schedule reconnect.
- Auth-expired behavior triggers `onAuthExpired` and stops reconnect loops.

The UI sends a `connect` with a stable `client.id` and a unique `instanceId` per tab/pane:

- `client.id` stays stable (gateway validates `client.id` against a schema).
- `client.instanceId` differentiates panes/tabs and prevents session collisions.

See: `app.js` `computeConnectClient()`, `computeSessionKey()`.

High-level rules:

- Session keys are role-scoped (and for admin, also pane-scoped) to prevent cross-talk:
  - Admin session key: `agent:<agentId>:admin:<device>-<pane>`

See: `app.js` `computeSessionKey()`.

## Agent Identity (Name + Signature Emoji)

Objective: replace hardcoded "OpenClaw" labels with the agent’s identity.

Server-side (`clawnsole-server.js`):

- `GET /agents` returns `{ id, name, displayName, emoji }` per agent.
- `displayName`/`emoji` come from (priority order):
  1. agent entry inline `identity` fields in `~/.openclaw/openclaw.json` (if set)
  2. the agent’s workspace `IDENTITY.md` fields:
     - `- **Name:** ...`
     - `- **Emoji:** ...` (also accepts `Signature Emoji` or `Signature`)
  3. fallback to `name`/`id`
- Special-case: if `main` isn’t present in the agent list, the server now derives `main` identity from the default workspace.

Client-side (`app.js`):

- Dropdown shows `displayName` + emoji and includes id when helpful.
- Assistant bubbles and “Thinking…” bubbles show the agent label.
- Input placeholder is per-pane and uses the agent label.
- Emoji is treated as a signature suffix: `Name Emoji` (not `Emoji Name`).

## Chat Retention (Per-Agent)

Clawnsole stores chat history locally in `localStorage` and now does so with a stable per-agent key:

Migration:

- If the stable key is empty/missing, the client tries to migrate from older per-pane or legacy session-based keys.
- Migration chooses the longest available history array to avoid overwriting non-empty histories.

See: `app.js` `computeChatKey()`, `paneRestoreChatHistory()`, and the migration logic around history keys.

## UI: Opacity + Flux (“Neuron”) Effect

Background effect:

- Global canvas in `index.html`: `<canvas id="pulseCanvas" class="flux-canvas">`
- Renderer in `app.js` (the `pulse` object + `renderPulse()`).

Recent tuning:

- Lowered pane/bubble/input alpha and added light blur/saturation so the flux effect is visible behind chat content.
- Reduced canvas “dark wash” fill alpha and increased edge alpha so the network lines pop more.

Files:

- `styles.css`: `.chat-panel`, `.pane-header`, `.chat-bubble.assistant`, `.chat-input-row`
- `app.js`: `renderPulse()` fill alpha + edge alpha.

If it still looks opaque on a specific display, adjust the RGBA alphas in `styles.css` and the fill alpha in `app.js`.

## QA/Prod Workflow State

Implemented:

- Cookie names are instance-scoped using `CLAWNSOLE_INSTANCE` to avoid QA/Prod collisions.
- NPM scripts:
  - `dev:prod`: `CLAWNSOLE_INSTANCE=prod PORT=5173 node server.js`
  - `dev:qa`: `CLAWNSOLE_INSTANCE=qa PORT=5174 node server.js`
- Docs:
  - `README.md` has a “QA vs Prod (local)” section.

Not implemented yet (future):

- True “Prod deploy” from a pinned commit (git worktree or install script pin).
- One-command “promote QA -> Prod” flow.

## Tests (Designed To Prevent Regressions)

Current test entrypoints (see `package.json`):

- `npm test`: runs syntax checks + unit tests + proxy self-test
- `npm run test:unit`: `node --test tests/unit/*.test.js`
- `npm run test:proxy`: `node scripts/proxy-self-test.js`
- `npm run test:ui`: Playwright (see `tests/ui.spec.js`)

What unit tests cover (high value):

- Auth flows and cookie behavior (including instance-scoped cookies).
- `/agents` is admin-only and returns parsed `displayName`/`emoji` from `IDENTITY.md`.
- Gateway-client handshake, reconnect, offline handling, and auth-expiry behavior.

## Operational Notes / Gotchas

- `scripts/mock-gateway.js` binds `127.0.0.1:18789` by default (same as the real gateway port). If it is running, it can block or impersonate the real OpenClaw gateway. Kill it when using real OpenClaw.
- OpenClaw gateway port is currently `18789` (from `~/.openclaw/openclaw.json`).
- OpenClaw agent default model is set to `openai-codex/gpt-5.2` (and `gpt-5.3` is present but not primary).
- Repo working tree is currently dirty with multiple modified/untracked files; confirm what should be committed vs local-only.

## Key Files

- Server: `server.js`, `clawnsole-server.js`, `proxy.js`
- Client: `index.html`, `styles.css`, `app.js`, `gateway-client.js`
- Tests: `tests/unit/clawnsole-server.test.js` and other `tests/unit/*.test.js`, `scripts/proxy-self-test.js`

## Suggested Next Steps

1. Finish “real” Prod deployment:
   - Use `git worktree` for a pinned Prod checkout, or make the install/update scripts pin a specific tag/commit.
2. Add a small smoke test that starts two instances (Prod+QA) and asserts cookie separation + independent login.
3. If opacity still isn’t right on the target monitor, tune:
   - `.chat-panel` / `.chat-bubble.assistant` alpha
   - `renderPulse()` background fill alpha
