#!/usr/bin/env node
/**
 * Sync local .env.shared → Vercel Shared Environment Variables for the 3 Modonty apps.
 *
 * WHY: .env.shared (local) is the key list every app needs, but it is gitignored and
 * never reaches Vercel. Production relies 100% on Vercel's Shared Env Vars, which had
 * drifted badly (admin had 13/53 keys). This brings Vercel to full parity.
 *
 * SAFETY:
 *  - DRY-RUN by default. Pass --apply to actually write.
 *  - DATABASE_URL is the ONLY value that differs: local=modonty_dev, prod=modonty.
 *    The script FORCES the prod value (read from admin/.env commented line) and will
 *    ABORT if it ever resolves to a *_dev database — so we can never point prod at dev.
 *  - Never prints secret values (only key names + action).
 *
 * Usage:
 *   node scripts/sync-env-to-vercel.mjs            # dry-run, all 3 apps
 *   node scripts/sync-env-to-vercel.mjs --apply    # actually write
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const APPLY = process.argv.includes("--apply");
const TEAM = "team_OIl7TDxOqFj8NnBlo4ZAtx5B";
const PROJECTS = {
  admin: "prj_dQHq3vAaE43eunyAxlOVXgaibt6w",
  console: "prj_6zLtaxGM8lm1o71QDuvd0RFFYfKL",
  modonty: "prj_5ZRCkgVQhteslZAgHJBWKVAkBxn6",
};
const ALL_PIDS = Object.values(PROJECTS);
const TARGET = ["production", "preview", "development"];

const TOKEN = process.env.VERCEL_TOKEN;
if (!TOKEN) {
  console.error("VERCEL_TOKEN is not set. Aborting.");
  process.exit(1);
}

function parseEnvFile(file) {
  const out = {};
  const raw = fs.readFileSync(file, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    out[m[1]] = val;
  }
  return out;
}

// Read the canonical PROD DATABASE_URL from admin/.env commented line (# DATABASE_URL=...)
function readProdDatabaseUrl() {
  const f = path.join(ROOT, "admin", ".env");
  const raw = fs.readFileSync(f, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*#?\s*DATABASE_URL\s*=\s*"?([^"\n]+)"?\s*$/);
    if (m && /mongodb/.test(m[1])) return m[1].trim();
  }
  return null;
}

async function vercel(method, urlPath, body) {
  const res = await fetch(`https://api.vercel.com${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function main() {
  const shared = parseEnvFile(path.join(ROOT, ".env.shared"));

  // --- DATABASE_URL override (the one env-specific value) ---
  const prodDb = readProdDatabaseUrl();
  if (!prodDb) {
    console.error("Could not read prod DATABASE_URL from admin/.env. Aborting.");
    process.exit(1);
  }
  if (/\/modonty_dev(\?|$)/.test(prodDb) || !/\/modonty(\?|$)/.test(prodDb)) {
    console.error(`SAFETY ABORT: resolved prod DATABASE_URL does not point to /modonty: it looks like a dev DB.`);
    process.exit(1);
  }
  shared.DATABASE_URL = prodDb; // force prod value
  console.log("DATABASE_URL → forced to PROD value (db=modonty). ✔ safety check passed\n");

  // --- current Vercel state ---
  const sharedVarsRes = await vercel("GET", `/v1/env?teamId=${TEAM}`);
  const existingShared = sharedVarsRes.json.data || [];
  const byKey = new Map(existingShared.map((e) => [e.key, e]));

  const projEnv = {};
  for (const [name, pid] of Object.entries(PROJECTS)) {
    const r = await vercel("GET", `/v9/projects/${pid}/env?teamId=${TEAM}`);
    projEnv[name] = new Set(((r.json.envs || r.json) || []).map((e) => e.key));
  }

  const plan = { create: [], link: [], skip: [] };

  for (const key of Object.keys(shared)) {
    const ev = byKey.get(key);
    // which projects already have this key (shared-linked OR project-level)?
    const have = new Set();
    if (ev) for (const pid of ev.projectId || []) if (ALL_PIDS.includes(pid)) have.add(pid);
    for (const [name, pid] of Object.entries(PROJECTS)) if (projEnv[name].has(key)) have.add(pid);

    const missing = ALL_PIDS.filter((pid) => !have.has(pid));
    if (missing.length === 0) { plan.skip.push(key); continue; }

    if (ev) {
      // exists as a shared var → extend its project links (union)
      const union = Array.from(new Set([...(ev.projectId || []), ...ALL_PIDS]));
      plan.link.push({ key, id: ev.id, union, missing });
    } else {
      // brand new → create linked to all 3
      plan.create.push({ key, missing });
    }
  }

  // --- report ---
  console.log(`=== PLAN (${APPLY ? "APPLY" : "DRY-RUN"}) ===`);
  console.log(`CREATE (new shared var, linked to 3): ${plan.create.length}`);
  plan.create.forEach((p) => console.log(`   + ${p.key}`));
  console.log(`LINK (exists, add missing project links): ${plan.link.length}`);
  plan.link.forEach((p) => console.log(`   ~ ${p.key}  (+${p.missing.length} project link(s))`));
  console.log(`SKIP (already on all 3): ${plan.skip.length}`);

  if (!APPLY) {
    console.log("\nDRY-RUN only. Re-run with --apply to write these changes.");
    return;
  }

  // --- apply ---
  console.log("\n=== APPLYING ===");
  // create new — link ONLY to the projects that are missing it (avoids clashing
  // with a project-level var of the same key on another project, e.g. admin/INDEXNOW_KEY)
  for (const p of plan.create) {
    const r = await vercel("POST", `/v1/env?teamId=${TEAM}`, {
      projectId: p.missing, target: TARGET,
      evs: [{ key: p.key, value: shared[p.key], type: "encrypted", target: TARGET }],
    });
    const created = r.json.created && r.json.created[0];
    // POST ignores projectId on create; link explicitly to the missing projects afterwards
    if (created && !(created.projectId || []).length) {
      await vercel("PATCH", `/v1/env?teamId=${TEAM}`, { updates: { [created.id]: { projectId: p.missing } } });
    }
    console.log(`   + ${p.key} → ${r.status === 200 || r.status === 201 ? "created+linked (" + p.missing.length + ")" : "FAILED " + JSON.stringify(r.json).slice(0, 120)}`);
  }
  // link existing
  for (const p of plan.link) {
    const r = await vercel("PATCH", `/v1/env?teamId=${TEAM}`, { updates: { [p.id]: { projectId: p.union } } });
    console.log(`   ~ ${p.key} → ${r.status === 200 ? "linked" : "FAILED " + JSON.stringify(r.json).slice(0, 120)}`);
  }
  console.log("\nDone. Redeploy the 3 projects for changes to take effect.");
}

main().catch((e) => { console.error(e); process.exit(1); });
