const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

function nowMs() {
  return Date.now();
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function defaultDataRoot() {
  const openclawHome = process.env.OPENCLAW_HOME || path.join(os.homedir(), '.openclaw');
  return path.join(openclawHome, 'clawnsole');
}

function assignmentsPath(rootDir) {
  const dir = rootDir || defaultDataRoot();
  return path.join(dir, 'work-queue-assignments.json');
}

function readJson(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(filePath, data) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  const tmp = `${filePath}.tmp.${process.pid}.${nowMs()}`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, filePath);
}

function normalizeAssignments(input) {
  const s = input && typeof input === 'object' ? input : {};
  const agents = s.agents && typeof s.agents === 'object' ? s.agents : {};
  const defaults = s.defaults && typeof s.defaults === 'object' ? s.defaults : {};

  const outAgents = {};
  for (const [agentId, v] of Object.entries(agents)) {
    if (!v || typeof v !== 'object') continue;
    const queues = Array.isArray(v.queues) ? v.queues.map((x) => String(x).trim()).filter(Boolean) : [];
    outAgents[String(agentId)] = { queues };
  }

  const defaultQueues = Array.isArray(defaults.queues)
    ? defaults.queues.map((x) => String(x).trim()).filter(Boolean)
    : [];

  return {
    version: 1,
    agents: outAgents,
    defaults: { queues: defaultQueues }
  };
}

function loadAssignments(rootDir) {
  const filePath = assignmentsPath(rootDir);
  return normalizeAssignments(readJson(filePath, null));
}

function saveAssignments(rootDir, assignments) {
  const filePath = assignmentsPath(rootDir);
  writeJsonAtomic(filePath, normalizeAssignments(assignments));
}

function resolveQueuesForAgent(agentId, { defaultQueues } = {}) {
  const id = String(agentId || '').trim();
  const assignments = loadAssignments();
  const agentQueues = assignments.agents?.[id]?.queues;
  if (Array.isArray(agentQueues) && agentQueues.length) return agentQueues;

  const defaults = assignments.defaults?.queues;
  if (Array.isArray(defaults) && defaults.length) return defaults;

  const fallback = Array.isArray(defaultQueues) ? defaultQueues.map((x) => String(x).trim()).filter(Boolean) : [];
  return fallback;
}

module.exports = {
  loadAssignments,
  saveAssignments,
  resolveQueuesForAgent
};
