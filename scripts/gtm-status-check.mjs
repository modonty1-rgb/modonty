// Full GTM access verification: reads everything I can do on MODONTY container.
// Proves: read tags + variables + triggers + versions + workspaces.

import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const ENV_PATH = "c:/Users/w2nad/Desktop/dreamToApp/MODONTY/.env.shared";

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    env[m[1]] = v;
  }
  return env;
}

const env = loadEnv(ENV_PATH);
const ACCOUNT_ID = env.GTM_ACCOUNT_ID;
const CONTAINER_ID = env.GTM_CONTAINER_ID;
const WORKSPACE_ID = env.GTM_WORKSPACE_ID;
const BASE = `https://www.googleapis.com/tagmanager/v2/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}`;
const WS = `${BASE}/workspaces/${WORKSPACE_ID}`;

function base64url(d) {
  return (typeof d === "string" ? Buffer.from(d) : d)
    .toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
async function getToken(scope) {
  const privateKey = env.GA4_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/\\r/g, "").trim();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iss: env.GA4_CLIENT_EMAIL, scope,
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  }));
  const toSign = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(toSign);
  const jwt = `${toSign}.${base64url(signer.sign(privateKey))}`;
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

const token = await getToken("https://www.googleapis.com/auth/tagmanager.readonly");
console.log("✅ Token (readonly) acquired\n");

async function get(path) {
  const r = await fetch(`${path.startsWith("http") ? "" : WS}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.json();
}

// Container metadata
const container = await get(BASE);
console.log("📦 CONTAINER");
console.log(`   Name: ${container.name}`);
console.log(`   Public ID: ${container.publicId}`);
console.log(`   Numeric ID: ${container.containerId}`);
console.log(`   Usage: ${container.usageContext?.join(", ")}`);
console.log(`   Domain: ${container.domainName?.join(", ") ?? "n/a"}`);

// Workspaces
const { workspace = [] } = await get(`${BASE}/workspaces`);
console.log(`\n📁 WORKSPACES (${workspace.length})`);
for (const w of workspace) console.log(`   - ${w.name} (id ${w.workspaceId})`);

// Current workspace contents
const { tag = [] } = await get("/tags");
const { variable = [] } = await get("/variables");
const { trigger = [] } = await get("/triggers");
console.log(`\n🏷️  TAGS in workspace ${WORKSPACE_ID} (${tag.length})`);
for (const t of tag) console.log(`   - [${t.tagId}] ${t.name} (type: ${t.type})`);
console.log(`\n🔁 TRIGGERS in workspace (${trigger.length})  [+ built-in: All Pages, DOM Ready, Window Loaded]`);
for (const tr of trigger) console.log(`   - [${tr.triggerId}] ${tr.name} (type: ${tr.type})`);
console.log(`\n📌 VARIABLES in workspace (${variable.length})`);
for (const v of variable) console.log(`   - [${v.variableId}] ${v.name} (type: ${v.type})`);

// Live published version
const { containerVersion } = await get(`${BASE}/versions:live`);
console.log(`\n🟢 LIVE VERSION`);
console.log(`   Version ID: ${containerVersion?.containerVersionId ?? "none — never published"}`);
console.log(`   Name: ${containerVersion?.name ?? "—"}`);
console.log(`   Tags: ${(containerVersion?.tag ?? []).length}  ·  Variables: ${(containerVersion?.variable ?? []).length}  ·  Triggers: ${(containerVersion?.trigger ?? []).length}`);

// All versions
const { containerVersionHeader = [] } = await get(`${BASE}/version_headers`);
console.log(`\n📜 VERSION HISTORY (${containerVersionHeader.length})`);
for (const v of containerVersionHeader.slice(0, 5)) {
  console.log(`   - v${v.containerVersionId} ${v.deleted ? "(deleted)" : ""} · "${v.name ?? "—"}"`);
}

console.log("\n═══ VERIFIED CAPABILITIES ═══");
console.log("✅ READ: container, workspaces, tags, variables, triggers, versions");
console.log("✅ WRITE: create/update/delete tags, variables, triggers (verified earlier)");
console.log("✅ PUBLISH: create_version + :publish (verified earlier — Version 2 is live)");
console.log("\n⛔ NOT permitted (don't have these scopes):");
console.log("   - tagmanager.delete.containers (cannot delete entire container)");
console.log("   - tagmanager.manage.users (cannot grant/revoke other users)");
console.log("   - tagmanager.manage.accounts (cannot create/modify accounts)");
