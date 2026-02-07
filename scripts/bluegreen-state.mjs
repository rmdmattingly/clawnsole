import fs from 'fs';
import path from 'path';

const home = process.env.HOME || '';
const statePath = process.env.CLAWNSOLE_STATE_PATH || path.join(home, '.openclaw', 'clawnsole-install.json');

function readState() {
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8')) || {};
  } catch {
    return {};
  }
}

function writeState(next) {
  const dir = path.dirname(statePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(next, null, 2) + '\n', 'utf8');
}

const cmd = process.argv[2] || 'get';
const state = readState();

if (cmd === 'get') {
  process.stdout.write(JSON.stringify(state));
  process.exit(0);
}

if (cmd === 'init') {
  const portA = Number(process.env.CLAWNSOLE_PORT_A || process.argv[3] || 5173);
  const portB = Number(process.env.CLAWNSOLE_PORT_B || process.argv[4] || portA + 2);
  const activePort = Number(process.env.CLAWNSOLE_ACTIVE_PORT || process.argv[5] || portA);
  const next = {
    ...state,
    ports: [portA, portB],
    activePort,
    updatedAt: new Date().toISOString()
  };
  writeState(next);
  process.stdout.write(JSON.stringify(next));
  process.exit(0);
}

if (cmd === 'set-active') {
  const activePort = Number(process.env.CLAWNSOLE_ACTIVE_PORT || process.argv[3]);
  if (!Number.isFinite(activePort) || !activePort) {
    throw new Error('missing activePort');
  }
  const next = {
    ...state,
    activePort,
    updatedAt: new Date().toISOString()
  };
  writeState(next);
  process.stdout.write(JSON.stringify(next));
  process.exit(0);
}

throw new Error(`unknown cmd: ${cmd}`);
