#!/usr/bin/env node
/**
 * workqueue-worker.mjs
 *
 * Minimal workqueue "worker loop" runner for Clawnsole.
 *
 * Primary use:
 * - Run under an OpenClaw agent (or any supervisor) to continuously:
 *   - claim-next
 *   - emit the claimed item's instructions for execution by the agent
 *   - (optionally) auto-run meta.command tasks
 *   - mark done/failed
 *
 * This intentionally keeps "execution" pluggable; most queue items are natural-language
 * instructions that should be carried out by an agent/human, not blindly run.
 */

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

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
    } else out._.push(a);
  }
  return out;
}

function csv(v) {
  const raw = String(v || '').trim();
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function run(cmd, cmdArgs, { json = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        const e = new Error(`command failed (${code}): ${cmd} ${cmdArgs.join(' ')}\n${err || out}`);
        // @ts-ignore
        e.code = code;
        return reject(e);
      }
      if (!json) return resolve(out);
      try {
        resolve(JSON.parse(out));
      } catch (e) {
        reject(new Error(`failed to parse JSON output from: ${cmd} ${cmdArgs.join(' ')}\n${out}`));
      }
    });
  });
}

function pickExecutorMode(mode) {
  const m = String(mode || 'emit').toLowerCase();
  if (['emit', 'auto'].includes(m)) return m;
  throw new Error(`Unknown --mode: ${mode} (expected emit|auto)`);
}

async function claimOnce({ clawnsoleCmd, agentId, queues, leaseMs }) {
  const args = [
    'workqueue',
    'claim-next',
    '--agent',
    agentId,
    ...(queues?.length ? ['--queues', queues.join(',')] : []),
    ...(leaseMs ? ['--leaseMs', String(leaseMs)] : [])
  ];
  const res = await run(clawnsoleCmd, args, { json: true });
  return res?.item ?? null;
}

async function progress({ clawnsoleCmd, agentId, itemId, note, leaseMs }) {
  const args = [
    'workqueue',
    'progress',
    itemId,
    '--agent',
    agentId,
    '--note',
    note,
    ...(leaseMs ? ['--leaseMs', String(leaseMs)] : [])
  ];
  await run(clawnsoleCmd, args, { json: true });
}

async function done({ clawnsoleCmd, agentId, itemId, result }) {
  const args = ['workqueue', 'done', itemId, '--agent', agentId];
  if (result !== undefined) {
    args.push('--result', JSON.stringify(result));
  }
  await run(clawnsoleCmd, args, { json: true });
}

async function fail({ clawnsoleCmd, agentId, itemId, error }) {
  const args = ['workqueue', 'fail', itemId, '--agent', agentId, '--error', String(error || 'failed')];
  await run(clawnsoleCmd, args, { json: true });
}

async function autoExecute(item) {
  // Convention: runnable tasks can include meta.command=["cmd","arg1",...]
  const command = item?.meta?.command;
  if (!Array.isArray(command) || command.length === 0) {
    return { ok: false, skipped: true, reason: 'no meta.command on item' };
  }

  const [cmd, ...cmdArgs] = command.map(String);
  const output = await run(cmd, cmdArgs, { json: false });
  return { ok: true, skipped: false, output: String(output) };
}

async function main() {
  const args = parseArgs(process.argv);

  const agentId = String(args.agent || process.env.CLAWNSOLE_AGENT_ID || '').trim();
  if (!agentId) throw new Error('Missing --agent (or env CLAWNSOLE_AGENT_ID)');

  const clawnsoleCmd = String(args.clawnsoleCmd || process.env.CLAWNSOLE_CMD || 'clawnsole');
  const queues = csv(args.queues || process.env.CLAWNSOLE_QUEUES);
  const pollMs = args.pollMs !== undefined ? Number(args.pollMs) : Number(process.env.CLAWNSOLE_POLL_MS || 2000);
  const leaseMs = args.leaseMs !== undefined ? Number(args.leaseMs) : Number(process.env.CLAWNSOLE_LEASE_MS || 15 * 60_000);
  const mode = pickExecutorMode(args.mode || process.env.CLAWNSOLE_MODE || 'emit');

  // One-shot mode if requested (useful for cron)
  const once = Boolean(args.once || false);

  // Basic loop
  while (true) {
    const item = await claimOnce({ clawnsoleCmd, agentId, queues, leaseMs });

    if (!item) {
      if (once) {
        process.stdout.write(JSON.stringify({ ok: true, claimed: false }) + '\n');
        return;
      }
      await sleep(pollMs);
      continue;
    }

    // Emit a machine-readable envelope for the caller (OpenClaw worker prompt runner, etc.)
    process.stdout.write(
      JSON.stringify(
        {
          ok: true,
          claimed: true,
          item: {
            id: item.id,
            queue: item.queue,
            title: item.title,
            instructions: item.instructions,
            priority: item.priority,
            claimedBy: item.claimedBy,
            claimedAt: item.claimedAt,
            leaseUntil: item.leaseUntil,
            meta: item.meta || null
          }
        },
        null,
        2
      ) + '\n'
    );

    // In emit-mode, we stop after claiming and printing. The agent/human should execute the instructions
    // and then transition the item with clawnsole workqueue done/fail.
    if (mode === 'emit') {
      return;
    }

    // auto-mode: only executes tasks with explicit meta.command
    await progress({
      clawnsoleCmd,
      agentId,
      itemId: item.id,
      note: 'Auto-executor starting (meta.command)...',
      leaseMs
    });

    try {
      const execRes = await autoExecute(item);
      if (execRes.skipped) {
        await fail({
          clawnsoleCmd,
          agentId,
          itemId: item.id,
          error: `Auto-executor skipped: ${execRes.reason}. Run manually or add meta.command to item.`
        });
        return;
      }
      await done({ clawnsoleCmd, agentId, itemId: item.id, result: execRes });
    } catch (e) {
      await fail({ clawnsoleCmd, agentId, itemId: item.id, error: e?.stack || String(e) });
    }

    if (once) return;
  }
}

main().catch((e) => {
  process.stderr.write(String(e?.stack || e) + '\n');
  process.exit(1);
});
