// Create GA4 Configuration tag in MODONTY GTM container via API.
// One-shot: creates 1 Constant variable (the Measurement ID) + 1 GA4 Config tag
// firing on the built-in "All Pages" trigger. Idempotent: skips if already exists.

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
const MEASUREMENT_ID = env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

if (!ACCOUNT_ID || !CONTAINER_ID || !WORKSPACE_ID || !MEASUREMENT_ID) {
  console.error("❌ Missing GTM_* or NEXT_PUBLIC_GA4_MEASUREMENT_ID in .env.shared");
  process.exit(1);
}
if (!env.GA4_CLIENT_EMAIL || !env.GA4_PRIVATE_KEY) {
  console.error("❌ Missing GA4_CLIENT_EMAIL or GA4_PRIVATE_KEY in .env.shared");
  process.exit(1);
}

const BASE = `https://www.googleapis.com/tagmanager/v2/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}`;
const WS = `${BASE}/workspaces/${WORKSPACE_ID}`;
const ALL_PAGES_TRIGGER_ID = "2147479553"; // Built-in trigger

function base64url(data) {
  return (typeof data === "string" ? Buffer.from(data) : data)
    .toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function getToken(scope) {
  const privateKey = env.GA4_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/\\r/g, "").trim();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iss: env.GA4_CLIENT_EMAIL,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
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

async function gtmFetch(token, path, init = {}) {
  const resp = await fetch(`${WS}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`GTM ${init.method ?? "GET"} ${path} failed [${resp.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

const token = await getToken("https://www.googleapis.com/auth/tagmanager.edit.containers");
console.log("✅ Token acquired");

// ─── Step 1: Variable {{GA4 Measurement ID}} (Constant) ──────────────────────
const VAR_NAME = "GA4 Measurement ID";
const { variable: existingVars = [] } = await gtmFetch(token, "/variables");
let measurementVar = existingVars.find((v) => v.name === VAR_NAME);

if (measurementVar) {
  console.log(`ℹ️  Variable "${VAR_NAME}" already exists (id ${measurementVar.variableId})`);
} else {
  measurementVar = await gtmFetch(token, "/variables", {
    method: "POST",
    body: JSON.stringify({
      name: VAR_NAME,
      type: "c", // Constant
      parameter: [{ type: "template", key: "value", value: MEASUREMENT_ID }],
    }),
  });
  console.log(`✅ Created variable "${VAR_NAME}" (id ${measurementVar.variableId})`);
}

// ─── Step 2: GA4 Configuration Tag ───────────────────────────────────────────
const TAG_NAME = "GA4 - Configuration";
const { tag: existingTags = [] } = await gtmFetch(token, "/tags");
let configTag = existingTags.find((t) => t.name === TAG_NAME);

if (configTag) {
  console.log(`ℹ️  Tag "${TAG_NAME}" already exists (id ${configTag.tagId})`);
} else {
  configTag = await gtmFetch(token, "/tags", {
    method: "POST",
    body: JSON.stringify({
      name: TAG_NAME,
      type: "googtag", // Google tag (GA4 config) — modern type as of 2024+
      parameter: [
        { type: "template", key: "tagId", value: `{{${VAR_NAME}}}` },
        // Optional configuration parameters — leave defaults for now
      ],
      firingTriggerId: [ALL_PAGES_TRIGGER_ID],
    }),
  });
  console.log(`✅ Created tag "${TAG_NAME}" (id ${configTag.tagId})`);
}

console.log("\n═══ SUMMARY ═══");
console.log(`Variable: ${VAR_NAME} = ${MEASUREMENT_ID}`);
console.log(`Tag: ${TAG_NAME} → fires on All Pages`);
console.log(`\n⚠️  Not yet published — workspace changes are pending.`);
console.log(`   Run the publish script or use GTM UI to publish.`);
console.log(`\n🔗 Workspace URL:`);
console.log(`   https://tagmanager.google.com/#/container/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${WORKSPACE_ID}`);
