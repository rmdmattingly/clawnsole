import fs from "fs";
import path from "path";

const home = process.env.HOME || "";
const statePath = process.env.CLAWNSOLE_STATE_PATH || path.join(home, ".openclaw", "clawnsole-install.json");

function readState() {
  try {
    return JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch (err) {
    return {};
  }
}

function writeState(state) {
  const dir = path.dirname(statePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n", "utf8");
}

const state = readState();

const updates = {
  prevLocalHostName: process.env.CLAWNSOLE_PREV_LOCALHOSTNAME,
  prevHostName: process.env.CLAWNSOLE_PREV_HOSTNAME,
  prevComputerName: process.env.CLAWNSOLE_PREV_COMPUTERNAME,
  caddyWasInstalled: process.env.CLAWNSOLE_CADDY_WAS_INSTALLED,
  caddyInstalledByScript: process.env.CLAWNSOLE_CADDY_INSTALLED_BY_SCRIPT,
  installedAt: process.env.CLAWNSOLE_INSTALLED_AT
};

for (const [key, value] of Object.entries(updates)) {
  if (value !== undefined && value !== "") {
    state[key] = value === "true" ? true : value === "false" ? false : value;
  }
}

writeState(state);
console.log(`Updated ${statePath}`);
