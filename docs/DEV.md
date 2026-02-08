# Clawnsole Dev + Deploy Guide (Hardening)

This doc exists because we had a real incident: a regression in the login flow required a revert and we couldn’t quickly restore it.

Goal: **make it hard to ship a broken login**, and easy to catch it *before* cutover.

## Non-negotiables (login invariants)

These are the basics we must never break:

1. `POST /auth/login` accepts `{ role, password }` and returns `{ ok:true, role }` on success.
2. Successful login **sets** cookies:
   - `clawnsole_auth[_<instance>]` (HttpOnly)
   - `clawnsole_role[_<instance>]`
3. `GET /auth/role` returns `{ role: "admin"|"guest" }` when cookies are present; `{ role:null }` otherwise.
4. `GET /token` is **admin-only**:
   - 401 when not logged in
   - 403 for guest
   - 200 with `{ token, mode }` for admin
5. `GET /auth/logout` clears cookies.

If you change anything that touches cookie names/scoping, auth versioning, or these endpoints: **you must update tests**.

## Deploy/update flow (blue/green)

Clawnsole uses a blue/green local deployment and switches the reverse proxy (Caddy) to the new port.

**Critical guardrail (new):** `scripts/update.sh` now performs:

- Stage the new version on the inactive port
- Wait for `GET /meta` to be healthy
- Run `node scripts/verify-login.js` against the staging instance
- Only then cut Caddy over to the new port

If verification fails, the update aborts and stops the staging instance.

### Manual staging verification

If you’re debugging a machine in the field:

```bash
# replace port with whichever you’re testing
node ~/.openclaw/apps/clawnsole/scripts/verify-login.js \
  --base-url http://127.0.0.1:5175 \
  --role admin
```

## Local dev checklist (before pushing)

Run this in `~/src/clawnsole`:

```bash
npm run test:syntax
npm run test:unit
npm run test:proxy
npm run test:smoke
```

If you touched UI login behavior, also run:

```bash
npm run test:ui
```

## CI expectations

CI runs, in order:

- syntax check
- unit tests
- proxy test
- smoke test (headless)
- playwright UI test

The intent is to catch login regressions early *and* catch deploy/runtime regressions that only show up with a running server.
