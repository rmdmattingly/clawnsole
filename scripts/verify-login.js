#!/usr/bin/env node
'use strict';

// Verifies the deployed server's login/auth basics WITHOUT requiring a browser.
// Intended for update.sh (blue/green cutover guardrail).
//
// Usage:
//   node scripts/verify-login.js --base-url http://127.0.0.1:5173 --role admin
//
// Reads passwords/authVersion from $HOME/.openclaw/clawnsole.json by default.

const fs = require('fs');
const path = require('path');

function argValue(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] || '';
}

function parseArgs() {
  const baseUrl = argValue('--base-url') || 'http://127.0.0.1:5173';
  const roleRaw = (argValue('--role') || 'admin').toLowerCase();
  const role = roleRaw === 'guest' ? 'guest' : 'admin';
  const openclawHome = process.env.OPENCLAW_HOME || path.join(process.env.HOME || '', '.openclaw');
  const cfgPath = process.env.CLAWNSOLE_CONFIG || path.join(openclawHome, 'clawnsole.json');
  return { baseUrl, role, cfgPath };
}

function readPasswords(cfgPath) {
  try {
    const raw = fs.readFileSync(cfgPath, 'utf8');
    const cfg = JSON.parse(raw);
    return {
      adminPassword: cfg?.adminPassword || 'admin',
      guestPassword: cfg?.guestPassword || 'guest'
    };
  } catch {
    return { adminPassword: 'admin', guestPassword: 'guest' };
  }
}

function splitSetCookie(header) {
  if (!header) return [];
  // naive but adequate for our cookie format
  return String(header).split(/,(?=\s*[^;]+=[^;]+)/);
}

function cookiesFromResponse(res) {
  // Node 20+ undici fetch exposes headers.getSetCookie() in some environments.
  const getSetCookie = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : null;
  const raw = getSetCookie && getSetCookie.length ? getSetCookie : splitSetCookie(res.headers.get('set-cookie'));
  return raw
    .map((c) => String(c).split(';')[0].trim())
    .filter(Boolean);
}

async function login(baseUrl, role, password) {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, password })
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`login failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const cookies = cookiesFromResponse(res);
  if (!cookies.some((c) => c.startsWith('clawnsole_auth'))) {
    throw new Error(`login did not set auth cookie (Set-Cookie missing clawnsole_auth*). got: ${JSON.stringify(cookies)}`);
  }
  if (!cookies.some((c) => c.startsWith('clawnsole_role'))) {
    throw new Error(`login did not set role cookie (Set-Cookie missing clawnsole_role*). got: ${JSON.stringify(cookies)}`);
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`login response not json: ${text.slice(0, 200)}`);
  }
  if (!json.ok || json.role !== role) {
    throw new Error(`login response unexpected: ${text.slice(0, 200)}`);
  }
  return cookies.join('; ');
}

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`non-json response from ${url}: ${text.slice(0, 200)}`);
  }
  return { res, json, text };
}

async function run() {
  const { baseUrl, role, cfgPath } = parseArgs();
  const { adminPassword, guestPassword } = readPasswords(cfgPath);
  const password = role === 'admin' ? adminPassword : guestPassword;

  // 1) /meta must be healthy
  {
    const { res, json } = await getJson(`${baseUrl}/meta`);
    if (!res.ok) throw new Error(`/meta failed (${res.status})`);
    if (!json.adminWsUrl || !json.guestWsUrl) throw new Error('/meta missing ws urls');
  }

  // 2) login -> /auth/role must reflect role
  const cookieHeader = await login(baseUrl, role, password);
  {
    const { res, json } = await getJson(`${baseUrl}/auth/role`, { Cookie: cookieHeader });
    if (!res.ok) throw new Error(`/auth/role failed (${res.status})`);
    if (json.role !== role) throw new Error(`/auth/role mismatch: expected ${role} got ${json.role}`);
  }

  // 3) token is admin-only
  {
    const { res, json } = await getJson(`${baseUrl}/token`, { Cookie: cookieHeader });
    if (role === 'admin') {
      if (!res.ok) throw new Error(`/token failed (${res.status})`);
      if (!json.token) throw new Error('/token missing token');
    } else {
      if (res.status !== 403) throw new Error(`/token should be forbidden for guest; got ${res.status}`);
      if (json.error !== 'forbidden') throw new Error('/token guest response unexpected');
    }
  }

  // 4) logout clears role
  {
    const res = await fetch(`${baseUrl}/auth/logout`, { headers: { Cookie: cookieHeader } });
    if (!res.ok) throw new Error(`/auth/logout failed (${res.status})`);
  }

  console.log(`verify-login: ok (${role}) ${baseUrl}`);
}

run().catch((err) => {
  console.error('verify-login: failed');
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
