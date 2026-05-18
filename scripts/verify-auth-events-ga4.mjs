/**
 * Verify 11 auth-required GA4 events fired during live browser test.
 *
 * Tests: article_like, article_dislike, article_favorite, comment_like,
 * comment_reply, comment_submit, ask_client_submit, follow_client,
 * client_favorite, client_comment_submit, campaign_interest.
 *
 * Skipped: comment_dislike (no UI button on modonty article page).
 *
 * Usage: node scripts/verify-auth-events-ga4.mjs
 */

import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const ENV_PATH = "c:/Users/w2nad/Desktop/dreamToApp/MODONTY/.env.shared";
const PROPERTY_ID = "538167732";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

const EVENTS = [
  "article_like",
  "article_dislike",
  "article_favorite",
  "comment_like",
  "comment_reply",
  "comment_submit",
  "ask_client_submit",
  "follow_client",
  "client_favorite",
  "client_comment_submit",
  "campaign_interest",
];

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

function base64url(data) {
  const buf = typeof data === "string" ? Buffer.from(data) : data;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function getToken() {
  const privateKey = env.GA4_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/\\r/g, "").trim();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iss: env.GA4_CLIENT_EMAIL,
    scope: SCOPE,
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

async function realtimeEventCount(token, eventName, startMinutesAgo = 10) {
  const resp = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runRealtimeReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        metrics: [{ name: "eventCount" }],
        minuteRanges: [{ startMinutesAgo }],
        dimensionFilter: {
          filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: eventName } },
        },
      }),
    },
  );
  const data = await resp.json();
  if (!resp.ok) return 0;
  return Number(data.rows?.[0]?.metricValues?.[0]?.value ?? 0);
}

console.log("═══════════════════════════════════════════════════════════════");
console.log("  GA4 PROD — Verify 11 Auth Events (Last 10 min)");
console.log(`  Property: ${PROPERTY_ID}`);
console.log(`  ${new Date().toISOString()}`);
console.log("═══════════════════════════════════════════════════════════════\n");

console.log("→ Authenticating with GA4...");
const token = await getToken();
console.log("✅ Token acquired\n");

const results = [];
for (const eventName of EVENTS) {
  const count = await realtimeEventCount(token, eventName, 10);
  const status = count > 0 ? "✅ ARRIVED" : "❌ MISSING";
  console.log(`   ${status} ${eventName.padEnd(24)} count=${count}`);
  results.push({ eventName, count, ok: count > 0 });
  await new Promise((r) => setTimeout(r, 200));
}

const passed = results.filter((r) => r.ok).length;
console.log("\n═══════════════════════════════════════════════════════════════");
console.log(`  RESULT: ${passed}/${EVENTS.length} events arrived in GA4`);
console.log("═══════════════════════════════════════════════════════════════");

if (passed === EVENTS.length) {
  console.log("\n🎉 ALL AUTH-REQUIRED EVENTS WORKING ON PROD");
} else {
  console.log(`\n⚠️  ${EVENTS.length - passed} event(s) missing — investigate`);
  console.log("Missing:", results.filter(r => !r.ok).map(r => r.eventName).join(", "));
}
