#!/usr/bin/env node
/**
 * Worker that claims exactly one item and transitions it to done/failed.
 *
 * Used by: examples/workqueue/two-workers-demo.mjs
 */

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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function clawnsole(args) {
  const { stdout } = await execFileP('node', ['bin/clawnsole.js', 'workqueue', ...args], {
    cwd: new URL('../../', import.meta.url).pathname,
    maxBuffer: 10 * 1024 * 1024
  });
  return JSON.parse(stdout);
}

async function main() {
  const args = parseArgs(process.argv);

  const agent = String(args.agent || 'demo-worker');
  const queues = String(args.queues || '').trim();
  const leaseMs = args.leaseMs !== undefined ? Number(args.leaseMs) : 5 * 60 * 1000;
  const mode = String(args.mode || 'done'); // done|fail
  const sleepMs = args.sleepMs !== undefined ? Number(args.sleepMs) : 200;

  if (!queues) {
    process.stderr.write('worker-once requires --queues <q1,q2>\n');
    process.exit(2);
  }

  const claim = await clawnsole(['claim-next', '--agent', agent, '--queues', queues, '--leaseMs', String(leaseMs)]);
  const item = claim.item;

  if (!item) {
    process.stdout.write(JSON.stringify({ event: 'no_item', agent }) + '\n');
    process.exit(3);
  }

  process.stdout.write(
    JSON.stringify({ event: 'claimed', agent, itemId: item.id, queue: item.queue, status: item.status }) + '\n'
  );

  await sleep(sleepMs);

  if (mode === 'fail') {
    const transitioned = await clawnsole(['fail', item.id, '--agent', agent, '--error', 'demo failure']);
    process.stdout.write(
      JSON.stringify({ event: 'failed', agent, itemId: item.id, status: transitioned.item?.status }) + '\n'
    );
    return;
  }

  const transitioned = await clawnsole([
    'done',
    item.id,
    '--agent',
    agent,
    '--result',
    JSON.stringify({ ok: true, demo: true, worker: agent })
  ]);
  process.stdout.write(
    JSON.stringify({ event: 'done', agent, itemId: item.id, status: transitioned.item?.status }) + '\n'
  );
}

main().catch((err) => {
  process.stderr.write(String(err?.stack || err) + '\n');
  process.exit(1);
});
