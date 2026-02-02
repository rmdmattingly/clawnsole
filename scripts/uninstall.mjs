import fs from "fs";
import path from "path";

const home = process.env.HOME || "";
const configPath = process.env.OPENCLAW_CONFIG || path.join(home, ".openclaw", "openclaw.json");
const statePath = process.env.CLAWNSOLE_STATE_PATH || path.join(home, ".openclaw", "clawnsole-install.json");

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    return null;
  }
}

function writeConfig(cfg) {
  const dir = path.dirname(configPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n", "utf8");
}

const cfg = readConfig();
if (cfg && cfg.ui && cfg.ui.clawnsole) {
  delete cfg.ui.clawnsole;
  if (Object.keys(cfg.ui).length === 0) {
    delete cfg.ui;
  }
  writeConfig(cfg);
  console.log(`Removed ui.clawnsole from ${configPath}`);
}

if (fs.existsSync(statePath)) {
  console.log(`Leaving state file at ${statePath}`);
}
