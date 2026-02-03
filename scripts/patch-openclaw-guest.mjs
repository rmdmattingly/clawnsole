import fs from "fs";
import path from "path";

const home = process.env.HOME || "";
const openclawPath =
  process.env.OPENCLAW_CONFIG || path.join(home, ".openclaw", "openclaw.json");
const guestId = process.env.CLAWNSOLE_GUEST_AGENT_ID || "clawnsole-guest";

function readConfig() {
  try {
    const raw = fs.readFileSync(openclawPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function writeConfig(cfg) {
  fs.writeFileSync(openclawPath, JSON.stringify(cfg, null, 2) + "\n", "utf8");
}

const cfg = readConfig();
if (!cfg) {
  console.log("OpenClaw config not found; skipping guest agent patch.");
  process.exit(0);
}

cfg.agents = cfg.agents || {};
cfg.agents.list = Array.isArray(cfg.agents.list) ? cfg.agents.list : [];

let entry = cfg.agents.list.find((item) => item && item.id === guestId);
if (!entry) {
  cfg.agents.list.push({
    id: guestId,
    name: guestId,
    workspace: path.join(home, ".openclaw", "agents", guestId, "workspace"),
    agentDir: path.join(home, ".openclaw", "agents", guestId, "agent")
  });
  entry = cfg.agents.list.find((item) => item && item.id === guestId);
}

entry.memorySearch = { enabled: false };

writeConfig(cfg);

console.log(`Updated ${openclawPath} for guest agent memorySearch=false`);
