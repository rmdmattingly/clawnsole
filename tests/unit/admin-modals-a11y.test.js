const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('inactive admin modals start hidden/inert to avoid hidden-dialog focus noise', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', '..', 'index.html'), 'utf8');
  const required = [
    'id="commandPaletteModal" class="modal" aria-hidden="true" hidden inert',
    'id="workqueueModal" class="modal" aria-hidden="true" hidden inert',
    'id="settingsModal" class="modal" aria-hidden="true" hidden inert'
  ];

  for (const snippet of required) {
    assert.ok(html.includes(snippet), `missing expected modal accessibility baseline: ${snippet}`);
  }
});
