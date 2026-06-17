# Pane accent tokens

Persistent pane-kind accents use the following dark-theme tokens in `styles.css`:

- `--pane-accent-chat-rgb`: `127, 209, 185`
- `--pane-accent-workqueue-rgb`: `255, 179, 71`
- `--pane-accent-cron-rgb`: `162, 155, 254`
- `--pane-accent-timeline-rgb`: `86, 204, 242`
- `--pane-accent-fleet-rgb`: `244, 114, 182` (reserved for Fleet surfaces)

These feed per-pane variables (`--pane-accent-rgb`, `--pane-accent`, `--pane-header-tint`) used consistently in:

1. Pane container/card chrome (`.chat-panel.pane`)
2. Pane header accent bar (`.pane-header`)
3. Pane type pill (`.pane-type-*`)
4. Pane Manager rows and swatch dots (`.pane-manager-row`, `.pane-manager-accent`)

Testing hook selectors:

- Pane root: `[data-pane][data-pane-kind="<kind>"][data-pane-accent-kind="<kind>"]`
- Type pill: `[data-pane-type-pill][data-pane-accent="<kind>"]`
- Pane Manager row swatch: `[data-pane-manager-accent="<kind>"]`
