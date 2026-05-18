// One-shot probe: does the JBRSEO service account have read access to
// MODONTY's GTM container (GTM-P43DC5FM)?
//
// Reads credentials from JBRSEO/jbrseo.com/.env directly (no copy yet).
// Lists every account + container reachable by the service account.

import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

// Probe MODONTY env now (creds were copied) — fallback to JBRSEO if MODONTY missing.
const MODONTY_ENV = "c:/Users/w2nad/Desktop/dreamToApp/MODONTY/.env.shared";
const JBRSEO_ENV = "c:/Users/w2nad/Desktop/dreamToApp/JBRSEO/jbrseo.com/.env";
const MODONTY_TARGET = "GTM-MNRR2NS9";
const JBRSEO_TARGET = "GTM-TT25M3GX";

function loadEnv(path) {
  const env = {};
  const lines = readFileSync(path, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[m[1]] = val;
  }
  return env;
}

let env = loadEnv(MODONTY_ENV);
let source = "MODONTY/.env.shared";
if (!env.GA4_CLIENT_EMAIL || !env.GA4_PRIVATE_KEY || env.GA4_CLIENT_EMAIL.startsWith("<")) {
  env = loadEnv(JBRSEO_ENV);
  source = "JBRSEO/jbrseo.com/.env (fallback)";
}
console.log(`→ Reading credentials from: ${source}`);

if (!env.GA4_CLIENT_EMAIL || !env.GA4_PRIVATE_KEY) {
  console.error("❌ Missing GA4_CLIENT_EMAIL or GA4_PRIVATE_KEY in JBRSEO/.env");
  process.exit(1);
}

console.log(`→ Service account: ${env.GA4_CLIENT_EMAIL}`);

function base64url(data) {
  const buf = typeof data === "string" ? Buffer.from(data) : data;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function getToken(scope) {
  const clientEmail = env.GA4_CLIENT_EMAIL;
  const privateKey = env.GA4_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/\\r/g, "").trim();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iss: clientEmail,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const toSign = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(toSign);
  const jwt = `${toSign}.${base64url(sign.sign(privateKey))}`;
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

console.log("→ Requesting access token (tagmanager.readonly)...");
const token = await getToken("https://www.googleapis.com/auth/tagmanager.readonly");
console.log("✅ Token obtained\n");

console.log("→ Listing all GTM accounts reachable by this service account...");
const accountsResp = await fetch("https://www.googleapis.com/tagmanager/v2/accounts", {
  headers: { Authorization: `Bearer ${token}` },
});
const accountsData = await accountsResp.json();

if (!accountsResp.ok) {
  console.error("❌ Failed to list accounts:", JSON.stringify(accountsData, null, 2));
  process.exit(1);
}

const accounts = accountsData.account ?? [];
console.log(`✅ Found ${accounts.length} account(s)\n`);

let foundModonty = null;
let foundJbrseo = null;

for (const acc of accounts) {
  console.log(`Account: ${acc.name} (id ${acc.accountId})`);
  const contResp = await fetch(
    `https://www.googleapis.com/tagmanager/v2/accounts/${acc.accountId}/containers`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const contData = await contResp.json();
  if (!contResp.ok) {
    console.log(`  ⚠️ containers fetch failed: ${contData?.error?.message ?? "unknown"}`);
    continue;
  }
  const containers = contData.container ?? [];
  for (const c of containers) {
    const marker = c.publicId === MODONTY_TARGET ? "  🎯 MODONTY MATCH"
      : c.publicId === JBRSEO_TARGET ? "  ✅ jbrseo"
      : "";
    console.log(`  - ${c.name} | publicId=${c.publicId} | id=${c.containerId} | usage=${c.usageContext?.join(",") ?? "n/a"}${marker}`);
    if (c.publicId === MODONTY_TARGET) foundModonty = { accountId: acc.accountId, containerId: c.containerId, name: c.name };
    if (c.publicId === JBRSEO_TARGET) foundJbrseo = { accountId: acc.accountId, containerId: c.containerId, name: c.name };
  }
}

console.log("\n═══ VERDICT ═══");
if (foundModonty) {
  console.log(`✅ ACCESS GRANTED to MODONTY container (${MODONTY_TARGET})`);
  console.log(`   Account ID: ${foundModonty.accountId}`);
  console.log(`   Container ID: ${foundModonty.containerId}`);
  console.log(`   Container Name: ${foundModonty.name}`);
} else {
  console.log(`❌ NO ACCESS to MODONTY container (${MODONTY_TARGET})`);
  console.log(`   → Need to add ${env.GA4_CLIENT_EMAIL} as Editor in:`);
  console.log(`     tagmanager.google.com → MODONTY container → Admin → User Management`);
}
console.log(foundJbrseo ? `✅ JBRSEO container reachable (${JBRSEO_TARGET})` : `❌ JBRSEO container NOT reachable`);
