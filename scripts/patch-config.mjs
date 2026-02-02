import fs from "fs";
import path from "path";

const home = process.env.HOME || "";
const configPath = process.env.OPENCLAW_CONFIG || path.join(home, ".openclaw", "openclaw.json");

function readConfig() {
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

function writeConfig(cfg) {
  const dir = path.dirname(configPath);
  fs.mkdirSync(dir, { recursive: true });
  const text = JSON.stringify(cfg, null, 2) + "\n";
  fs.writeFileSync(configPath, text, "utf8");
}

const cfg = readConfig();

cfg.ui ||= {};
cfg.ui.clawnsole ||= {};

const adminPassword = process.env.CLAWNSOLE_ADMIN_PASSWORD || cfg.ui.clawnsole.adminPassword || "admin";
const guestPassword = process.env.CLAWNSOLE_GUEST_PASSWORD || cfg.ui.clawnsole.guestPassword || "guest";
const authVersion = process.env.CLAWNSOLE_AUTH_VERSION || cfg.ui.clawnsole.authVersion || "";

cfg.ui.clawnsole.adminPassword = adminPassword;
cfg.ui.clawnsole.guestPassword = guestPassword;
if (authVersion) {
  cfg.ui.clawnsole.authVersion = authVersion;
}

if (process.env.CLAWNSOLE_AUTO_UPDATE) {
  cfg.ui.clawnsole.autoUpdate = true;
}
if (process.env.CLAWNSOLE_UPDATE_INTERVAL_SECONDS) {
  cfg.ui.clawnsole.updateIntervalSeconds = Number(process.env.CLAWNSOLE_UPDATE_INTERVAL_SECONDS);
}

cfg.ui.clawnsole.installedAt = cfg.ui.clawnsole.installedAt || new Date().toISOString();
cfg.ui.clawnsole.enabled = cfg.ui.clawnsole.enabled !== false;

writeConfig(cfg);

console.log(`Updated ${configPath}`);
console.log("Clawnsole config saved.");
