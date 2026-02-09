#!/usr/bin/env node
/**
 * Demo: run two independent workers concurrently and verify:
 * - they claim distinct items
 * - they transition them to done/failed
 * - final queue state looks right
 *
 * This intentionally uses a unique demo queue name to avoid interfering with real queues.
 */

import { spawn } from 'node:child_process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);

function parseArgs(argv) {
  const args = argv.slice(2);
  const out = { _: [] };
  while (args.length) {
    const a = args.shift();
    if (a === '--') {
      out._.push(...args);
      break;
    }
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = args[0];
      if (!next || next.startsWith('--')) out[key] = true;
      else out[key] = args.shift();
    } else {
      out._.push(a);
    }
  }
  return out;
}

function cwdRoot() {
  return new URL('../../', import.meta.url).pathname;
}

async function clawnsole(args) {
  const { stdout } = await execFileP('node', ['bin/clawnsole.js', 'workqueue', ...args], {
    cwd: cwdRoot(),
    maxBuffer: 10 * 1024 * 1024
  });
  return JSON.parse(stdout);
}

function lineReader(stream, onLine) {
  let buf = '';
  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    buf += chunk;
    while (true) {
      const idx = buf.indexOf('\n');
      if (idx < 0) break;
      const line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.trim()) onLine(line);
    }
  });
}

function spawnWorkerOnce({ agent, queues, mode }) {
  const child = spawn(
    'node',
    ['examples/workqueue/worker-once.mjs', '--agent', agent, '--queues', queues, '--mode', mode],
    { cwd: cwdRoot(), stdio: ['ignore', 'pipe', 'pipe'] }
  );

  const events = [];
  lineReader(child.stdout, (line) => {
    try {
      events.push(JSON.parse(line));
    } catch {
      // ignore
    }
  });

  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (d) => (stderr += d));

  const done = new Promise((resolve) => {
    child.on('exit', (code, signal) => resolve({ code, signal, events, stderr }));
  });

  return { child, done };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assert failed');
}

async function main() {
  const args = parseArgs(process.argv);

  const queue = String(args.queue || `demo-two-workers-${Date.now()}`);
  const agentA = String(args.agentA || 'demo-worker-a');
  const agentB = String(args.agentB || 'demo-worker-b');
  const seedCount = args.seed !== undefined ? Number(args.seed) : 3;

  // Seed 2-3 dummy items.
  const seededIds = [];
  for (let i = 1; i <= seedCount; i++) {
    const res = await clawnsole([
      'enqueue',
      '--queue',
      queue,
      '--title',
      `demo item ${i}`,
      '--instructions',
      `demo instructions ${i}`,
      '--priority',
      '0',
      '--dedupeKey',
      `demo:${Date.now()}:${i}`
    ]);
    seededIds.push(res.item.id);
  }

  process.stdout.write(`Seeded queue=${queue} items=${seededIds.join(', ')}\n`);

  // Start two workers concurrently.
  const queuesCsv = queue;
  const w1 = spawnWorkerOnce({ agent: agentA, queues: queuesCsv, mode: 'done' });
  const w2 = spawnWorkerOnce({ agent: agentB, queues: queuesCsv, mode: 'fail' });

  const [r1, r2] = await Promise.all([w1.done, w2.done]);

  if (r1.stderr) process.stderr.write(`[${agentA} stderr]\n${r1.stderr}\n`);
  if (r2.stderr) process.stderr.write(`[${agentB} stderr]\n${r2.stderr}\n`);

  const c1 = r1.events.find((e) => e.event === 'claimed');
  const c2 = r2.events.find((e) => e.event === 'claimed');

  assert(c1 && c1.itemId, `${agentA} did not claim an item`);
  assert(c2 && c2.itemId, `${agentB} did not claim an item`);
  assert(c1.itemId !== c2.itemId, `workers claimed same itemId=${c1.itemId}`);
  assert(seededIds.includes(c1.itemId), `${agentA} claimed unexpected itemId=${c1.itemId}`);
  assert(seededIds.includes(c2.itemId), `${agentB} claimed unexpected itemId=${c2.itemId}`);

  process.stdout.write(`OK: distinct claims: ${agentA}=>${c1.itemId} ${agentB}=>${c2.itemId}\n`);

  // Print final queue state.
  const listed = await clawnsole(['list', '--queue', queue]);
  const items = listed.items;

  const byId = new Map(items.map((it) => [it.id, it]));
  const it1 = byId.get(c1.itemId);
  const it2 = byId.get(c2.itemId);

  assert(it1?.status === 'done', `${agentA} item not done; status=${it1?.status}`);
  assert(it2?.status === 'failed', `${agentB} item not failed; status=${it2?.status}`);

  const remaining = seededIds.filter((id) => id !== c1.itemId && id !== c2.itemId);
  if (remaining.length) {
    const r = byId.get(remaining[0]);
    assert(r?.status === 'ready', `expected one remaining item to be ready; status=${r?.status}`);
  }

  process.stdout.write('\nFinal items:\n');
  for (const it of items) {
    process.stdout.write(`- ${it.id} ${it.status} claimedBy=${it.claimedBy || ''}\n`);
  }

  process.stdout.write('\nPASS\n');
}

main().catch((err) => {
  process.stderr.write(String(err?.stack || err) + '\n');
  process.exit(1);
});
