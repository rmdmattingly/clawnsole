#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  enqueueItem,
  claimNext,
  transitionItem,
  loadState,
  statePaths,
  listAssignments,
  setAssignments,
  resolveClaimQueues
} = require('../lib/workqueue');

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
      if (!next || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = args.shift();
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

function die(msg, code = 1) {
  process.stderr.write(String(msg || 'error') + '\n');
  process.exit(code);
}

function printJson(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

function usage() {
  return `clawnsole (MVP)

Usage:
  clawnsole workqueue <command> [options]

Workqueue commands:
  enqueue            --queue <name> --title <t> --instructions <text> [--priority <n>] [--dedupeKey <k>]
  claim-next         --agent <id> [--queues <q1,q2>] [--leaseMs <ms>]
  done               <itemId> --agent <id> [--result <json|@file>]
  fail               <itemId> --agent <id> --error <text>
  progress           <itemId> --agent <id> --note <text> [--leaseMs <ms>]
  inspect            <itemId>
  list               [--queue <name>] [--status <s1,s2>]
  assignments list
  assignments set    --agent <id> --queues <q1,q2>

Notes:
  - Data is stored at: ${statePaths().stateFile}
`;
}

function parseCsv(value) {
  const raw = String(value || '').trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseMaybeJsonOrFile(value) {
  if (value === undefined) return undefined;
  const raw = String(value);
  if (raw.startsWith('@')) {
    const filePath = raw.slice(1);
    const text = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(text);
  }
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const [top, sub, ...rest] = args._;

  if (!top || top === 'help' || top === '--help' || top === '-h') {
    process.stdout.write(usage());
    return;
  }

  if (top !== 'workqueue') {
    die(`unknown command: ${top}\n\n${usage()}`);
  }

  const cmd = sub;
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    process.stdout.write(usage());
    return;
  }

  if (cmd === 'enqueue') {
    const queue = args.queue;
    const title = args.title;
    const instructions = args.instructions;
    const priority = args.priority !== undefined ? Number(args.priority) : 0;
    const dedupeKey = args.dedupeKey !== undefined ? String(args.dedupeKey) : '';
    if (!queue) die('enqueue requires --queue');
    if (!instructions) die('enqueue requires --instructions');
    const item = enqueueItem(null, { queue, title, instructions, priority, dedupeKey });
    printJson({ ok: true, item });
    return;
  }

  if (cmd === 'claim-next') {
    const agent = args.agent;
    const requested = parseCsv(args.queues);
    const leaseMs = args.leaseMs !== undefined ? Number(args.leaseMs) : undefined;
    if (!agent) die('claim-next requires --agent');

    const defaultQueues = parseCsv(process.env.CLAWNSOLE_DEFAULT_QUEUES ?? 'dev-team');
    const resolved = resolveClaimQueues(null, {
      agentId: agent,
      requestedQueues: requested,
      defaultQueues
    });

    if (!resolved.queues.length) {
      printJson({ ok: true, item: null, reason: resolved.reason || 'NO_QUEUES' });
      return;
    }

    const item = claimNext(null, { agentId: agent, queues: resolved.queues, leaseMs });
    printJson({ ok: true, item });
    return;
  }

  if (cmd === 'done') {
    const itemId = rest[0];
    const agent = args.agent;
    if (!itemId) die('done requires <itemId>');
    if (!agent) die('done requires --agent');
    const result = parseMaybeJsonOrFile(args.result);
    const item = transitionItem(null, { itemId, agentId: agent, status: 'done', result });
    printJson({ ok: true, item });
    return;
  }

  if (cmd === 'fail') {
    const itemId = rest[0];
    const agent = args.agent;
    const error = args.error;
    if (!itemId) die('fail requires <itemId>');
    if (!agent) die('fail requires --agent');
    if (!error) die('fail requires --error');
    const item = transitionItem(null, { itemId, agentId: agent, status: 'failed', error });
    printJson({ ok: true, item });
    return;
  }

  if (cmd === 'progress') {
    const itemId = rest[0];
    const agent = args.agent;
    const note = args.note;
    const leaseMs = args.leaseMs !== undefined ? Number(args.leaseMs) : undefined;
    if (!itemId) die('progress requires <itemId>');
    if (!agent) die('progress requires --agent');
    if (!note) die('progress requires --note');
    const item = transitionItem(null, { itemId, agentId: agent, status: 'in_progress', note, leaseMs });
    printJson({ ok: true, item });
    return;
  }

  if (cmd === 'inspect') {
    const itemId = rest[0];
    if (!itemId) die('inspect requires <itemId>');
    const state = loadState(null);
    const item = state.items.find((it) => it.id === itemId) || null;
    printJson({ ok: true, item });
    return;
  }

  if (cmd === 'list') {
    const queue = args.queue;
    const status = parseCsv(args.status);
    const state = loadState(null);
    const items = state.items
      .filter((it) => {
        if (queue && it.queue !== queue) return false;
        if (status.length && !status.includes(it.status)) return false;
        return true;
      })
      .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    printJson({ ok: true, items });
    return;
  }

  if (cmd === 'assignments') {
    const subcmd = rest[0];

    if (!subcmd || subcmd === 'help' || subcmd === '--help' || subcmd === '-h') {
      process.stdout.write(usage());
      return;
    }

    if (subcmd === 'list') {
      const assignments = listAssignments(null);
      printJson({ ok: true, assignments });
      return;
    }

    if (subcmd === 'set') {
      const agent = args.agent;
      const queues = parseCsv(args.queues);
      if (!agent) die('assignments set requires --agent');
      if (!queues.length) die('assignments set requires --queues q1,q2');
      const result = setAssignments(null, { agentId: agent, queues });
      printJson({ ok: true, agentId: result.agentId, queues: result.queues });
      return;
    }

    die(`unknown workqueue assignments command: ${subcmd}\n\n${usage()}`);
  }

  die(`unknown workqueue command: ${cmd}\n\n${usage()}`);
}

main().catch((err) => {
  die(err && err.stack ? err.stack : String(err));
});
