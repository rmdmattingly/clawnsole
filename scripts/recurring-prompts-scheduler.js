#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token) continue;
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function safeJsonParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function readJsonFile(filePath, fallback) {
  try {
    return safeJsonParse(fs.readFileSync(filePath, 'utf8'), fallback);
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(filePath, value) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, filePath);
}

function randomId() {
  try {
    return require('crypto').randomUUID();
  } catch {
    return String(Date.now()) + '-' + Math.random().toString(16).slice(2) + '-' + Math.random().toString(16).slice(2);
  }
}

function computeSessionKey(agentId, deviceLabel) {
  const resolved = (agentId || 'main').trim() || 'main';
  const device = (deviceLabel || 'scheduler').trim() || 'scheduler';
  return `agent:${resolved}:admin:${device}`;
}

async function connectGateway({ wsUrl, token }) {
  const socket = new WebSocket(wsUrl);
  const pending = new Map();

  const sendReq = (method, params) => {
    const id = randomId();
    const payload = { type: 'req', id, method, params: params || {} };
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error('request timeout'));
      }, 15000);
      pending.set(id, (res) => {
        clearTimeout(timer);
        resolve(res);
      });
      socket.send(JSON.stringify(payload));
    });
  };

  socket.on('message', (raw) => {
    const msg = safeJsonParse(String(raw || ''), null);
    if (!msg || msg.type !== 'res' || !msg.id) return;
    const resolver = pending.get(msg.id);
    if (resolver) {
      pending.delete(msg.id);
      resolver(msg);
    }
  });

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('socket open timeout')), 10000);
    socket.on('open', () => {
      clearTimeout(timer);
      resolve();
    });
    socket.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });

  const connectRes = await sendReq('connect', {
    minProtocol: 3,
    maxProtocol: 3,
    client: {
      id: 'recurring-prompt-scheduler',
      version: '0.1.0',
      platform: 'node',
      mode: 'scheduler',
      instanceId: 'recurring-prompt-scheduler'
    },
    role: 'operator',
    scopes: ['operator.read', 'operator.write', 'operator.admin'],
    caps: [],
    commands: [],
    permissions: {},
    auth: token ? { token } : undefined,
    locale: 'en-US',
    userAgent: 'clawnsole-recurring-scheduler/0.1.0'
  });

  if (!connectRes?.ok) {
    const msg = connectRes?.error?.message || 'connect failed';
    socket.close();
    throw new Error(msg);
  }

  return {
    sendReq,
    close: () => {
      try {
        socket.close();
      } catch {}
    }
  };
}

async function deliverPrompt(gateway, { agentId, message, deviceLabel }) {
  const sessionKey = computeSessionKey(agentId, deviceLabel);
  const idempotencyKey = randomId();
  const res = await gateway.sendReq('chat.send', {
    sessionKey,
    message,
    deliver: true,
    idempotencyKey
  });
  if (!res?.ok) {
    throw new Error(res?.error?.message || 'chat.send failed');
  }
}

function findDuePrompts(prompts, now) {
  return prompts.filter((p) => {
    if (!p || p.enabled === false) return false;
    const nextRunAt = Number(p.nextRunAt);
    if (!Number.isFinite(nextRunAt)) return true;
    return nextRunAt <= now;
  });
}

async function runOnce({ promptsPath, openclawConfigPath, deviceLabel, dryRun = false }) {
  const state = readJsonFile(promptsPath, { prompts: [] });
  const prompts = Array.isArray(state?.prompts) ? state.prompts : [];
  const now = Date.now();

  const due = findDuePrompts(prompts, now);
  if (due.length === 0) {
    return { ok: true, delivered: 0, due: 0 };
  }

  const openclawCfg = readJsonFile(openclawConfigPath, {});
  const token = openclawCfg?.gateway?.auth?.token || '';
  const port = Number(openclawCfg?.gateway?.port || 18789) || 18789;
  const wsUrl = `ws://127.0.0.1:${port}`;

  let gateway = null;
  try {
    gateway = await connectGateway({ wsUrl, token });
  } catch (err) {
    // mark all due as failed
    const message = String(err || 'gateway connect failed');
    due.forEach((p) => {
      p.lastStatus = 'error';
      p.lastError = message;
      p.lastRunAt = now;
      p.updatedAt = now;
      const minutes = Number(p.intervalMinutes) || 60;
      p.nextRunAt = now + Math.max(1, minutes) * 60 * 1000;
    });
    writeJsonAtomic(promptsPath, { prompts });
    return { ok: false, delivered: 0, due: due.length, error: message };
  }

  let delivered = 0;
  for (const prompt of due) {
    const minutes = Math.max(1, Number(prompt.intervalMinutes) || 60);
    const nextRunAt = now + minutes * 60 * 1000;

    try {
      if (!dryRun) {
        await deliverPrompt(gateway, { agentId: prompt.agentId || 'main', message: prompt.message || '', deviceLabel });
      }
      prompt.lastStatus = dryRun ? 'dry_run' : 'ok';
      prompt.lastError = '';
      delivered += 1;
    } catch (err) {
      prompt.lastStatus = 'error';
      prompt.lastError = String(err || 'delivery failed');
    }

    prompt.lastRunAt = now;
    prompt.nextRunAt = nextRunAt;
    prompt.updatedAt = now;
  }

  writeJsonAtomic(promptsPath, { prompts });
  gateway.close();

  return { ok: true, delivered, due: due.length };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const homeDir = process.env.HOME || '';
  const openclawHome = process.env.OPENCLAW_HOME || path.join(homeDir, '.openclaw');
  const promptsPath = args.promptsPath || args.prompts || process.env.CLAWNSOLE_RECURRING_PROMPTS_PATH || path.join(openclawHome, 'clawnsole-recurring-prompts.json');
  const openclawConfigPath = args.openclawConfig || process.env.OPENCLAW_CONFIG || path.join(openclawHome, 'openclaw.json');
  const deviceLabel = args.deviceLabel || 'scheduler';
  const loopSeconds = Number(args.loopSeconds || 60) || 60;
  const once = Boolean(args.once);
  const dryRun = Boolean(args.dryRun);

  const tick = async () => {
    const result = await runOnce({ promptsPath, openclawConfigPath, deviceLabel, dryRun });
    const summary = `[recurring-prompts] ok=${result.ok} due=${result.due} delivered=${result.delivered}${result.error ? ' err=' + result.error : ''}`;
    console.log(summary);
  };

  await tick();
  if (once) return;

  setInterval(() => {
    tick().catch((err) => console.error('[recurring-prompts] tick failed', err));
  }, Math.max(5, loopSeconds) * 1000);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
