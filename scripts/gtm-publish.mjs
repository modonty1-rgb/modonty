// One-shot: create a Version from the current workspace + publish it to live.
// Result: all pending tags/variables/triggers become active on modonty.com.

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
    iss: env.GA4_CLIENT_EMAIL,
    scope,
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

// Need 2 scopes in same token: edit.containerversions (for create_version)
// + publish (for :publish). Space-separated per OAuth2 spec.
const SCOPES = [
  "https://www.googleapis.com/auth/tagmanager.edit.containerversions",
  "https://www.googleapis.com/auth/tagmanager.publish",
].join(" ");
const pubToken = await getToken(SCOPES);
console.log("✅ Token acquired (edit.containerversions + publish scopes)");

// ─── Step 1: Create Version from Workspace ───────────────────────────────────
console.log("→ Creating version from workspace...");
const versionResp = await fetch(`${WS}:create_version`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${pubToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: `v1 — GA4 Configuration (auto via API)`,
    notes: `Created by gtm-publish.mjs · Adds Constant variable {{GA4 Measurement ID}} = ${env.NEXT_PUBLIC_GA4_MEASUREMENT_ID} + GA4 Configuration tag firing on All Pages.`,
  }),
});
const versionData = await versionResp.json();
if (!versionResp.ok) {
  console.error("❌ Create version failed:", JSON.stringify(versionData, null, 2));
  process.exit(1);
}

const version = versionData.containerVersion;
if (!version) {
  console.error("❌ Response missing containerVersion:", JSON.stringify(versionData, null, 2));
  process.exit(1);
}
console.log(`✅ Version created: id ${version.containerVersionId} · name "${version.name}"`);
console.log(`   Tags: ${(version.tag ?? []).length} · Variables: ${(version.variable ?? []).length} · Triggers: ${(version.trigger ?? []).length}`);

// ─── Step 2: Publish that Version ────────────────────────────────────────────
console.log("\n→ Publishing version to live container...");
const publishResp = await fetch(
  `${BASE}/versions/${version.containerVersionId}:publish`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${pubToken}` },
  },
);
const publishData = await publishResp.json();
if (!publishResp.ok) {
  console.error("❌ Publish failed:", JSON.stringify(publishData, null, 2));
  process.exit(1);
}
const liveVersion = publishData.containerVersion;
console.log(`✅ PUBLISHED to live container.`);
console.log(`   Live version: ${liveVersion?.containerVersionId ?? version.containerVersionId}`);
console.log(`   Fingerprint: ${publishData.compilerError ? "FAILED (compiler error)" : "OK"}`);
if (publishData.compilerError) {
  console.error("❌ Compiler error:", JSON.stringify(publishData.compilerError, null, 2));
}

console.log(`\n═══ DONE ═══`);
console.log(`GA4 (${env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}) is now active in production via GTM-MNRR2NS9.`);
console.log(`Verify in Realtime: https://analytics.google.com/`);
