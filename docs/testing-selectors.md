# Testing selectors (data-testid)

Clawnsole’s E2E tests (Playwright) should prefer **stable, semantic selectors** over CSS/layout selectors.

## Convention

- Use `data-testid="..."` attributes on UI elements that tests interact with or assert on.
- IDs/classes may change as UI evolves; **testids should be treated as API**.
- Use **kebab-case** names.
- Keep testids **purpose-based**, not style-based.

## Current testids

### Global

- `connection-status`
- `role-pill`
- `pane-grid`
- `login-overlay`
- `login-password`
- `login-button`
- `login-error`
- `toast-host`
- `toast` (each toast item; see `data-toast-kind` for `info|error`)

### Pane template

- `pane`
- `pane-type-label`
- `pane-agent-select`
- `pane-connection-status`
- `pane-close`
- `pane-thread`
- `pane-scroll-down`
- `pane-input`
- `pane-send`
- `pane-stop`
- `pane-attachment-input`
- `pane-attachment-list`
