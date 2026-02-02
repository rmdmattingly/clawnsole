const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function fail(message) {
  console.error(`preflight: ${message}`);
  process.exit(1);
}

try {
  require('ws');
} catch (err) {
  fail('ws dependency missing');
}

if (!fs.existsSync(path.join(root, 'server.js'))) {
  fail('server.js missing');
}

const portRaw = process.env.PORT;
const parsedPort = Number.parseInt(portRaw || '', 10);
if (portRaw && !Number.isFinite(parsedPort)) {
  fail('PORT is invalid');
}

console.log('preflight: ok');
