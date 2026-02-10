import fs from "fs";
import path from "path";

const home = process.env.HOME || "";
const clawnsolePath =
  process.env.CLAWNSOLE_CONFIG || path.join(home, ".openclaw", "clawnsole.json");

function readConfig() {
  try {
    const raw = fs.readFileSync(clawnsolePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

function writeConfig(cfg) {
  const dir = path.dirname(clawnsolePath);
  fs.mkdirSync(dir, { recursive: true });
  const text = JSON.stringify(cfg, null, 2) + "\n";
  fs.writeFileSync(clawnsolePath, text, "utf8");
}

const cfg = readConfig();

const adminPassword = process.env.CLAWNSOLE_ADMIN_PASSWORD || cfg.adminPassword || "admin";
const authVersion = process.env.CLAWNSOLE_AUTH_VERSION || cfg.authVersion || "";

cfg.adminPassword = adminPassword;
if (authVersion) {
  cfg.authVersion = authVersion;
}

if (process.env.CLAWNSOLE_AUTO_UPDATE) {
  cfg.autoUpdate = true;
}
if (process.env.CLAWNSOLE_UPDATE_INTERVAL_SECONDS) {
  cfg.updateIntervalSeconds = Number(process.env.CLAWNSOLE_UPDATE_INTERVAL_SECONDS);
}

cfg.installedAt = cfg.installedAt || new Date().toISOString();
cfg.enabled = cfg.enabled !== false;

writeConfig(cfg);

console.log(`Updated ${clawnsolePath}`);
console.log("Clawnsole config saved.");
