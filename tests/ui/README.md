# UI pane E2E coverage

Each spec boots the app (mock gateway + server), logs in as admin, opens/creates one pane type, asserts it renders, exercises the core interaction(s), and fails on any browser console/page errors.

## Pane types

- **Chat pane** → `tests/ui/chat-pane.spec.js`
- **Workqueue pane** → `tests/ui/workqueue-pane.spec.js`
- **Cron pane** → `tests/ui/cron-pane.spec.js`
- **Timeline pane** → `tests/ui/timeline-pane.spec.js`
