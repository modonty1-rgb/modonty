/**
 * GA4 Realtime Verification — queries Data API to confirm events arrived.
 *
 * Uses service account JWT (GA4_CLIENT_EMAIL + GA4_PRIVATE_KEY from .env.shared).
 * No browser, no manual GA4 UI step.
 *
 * Endpoint: properties/{id}:runRealtimeReport
 * Docs: https://developers.google.com/analytics/devguides/reporting/data/v1/realtime-basics
 */

import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const ENV_PATH = "c:/Users/w2nad/Desktop/dreamToApp/MODONTY/.env.shared";
const PROPERTY_ID = "538167732";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

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
if (!env.GA4_CLIENT_EMAIL || !env.GA4_PRIVATE_KEY) {
  console.error("❌ Missing GA4_CLIENT_EMAIL or GA4_PRIVATE_KEY");
  process.exit(1);
}

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

async function runRealtimeReport(token, body) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runRealtimeReport`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`API error ${resp.status}: ${JSON.stringify(data)}`);
  return data;
}

console.log("═══════════════════════════════════════════════════════════════");
console.log(`  GA4 Realtime Verification — Property ${PROPERTY_ID}`);
console.log(`  ${new Date().toISOString()}`);
console.log("═══════════════════════════════════════════════════════════════\n");

console.log("→ Authenticating...");
const token = await getToken();
console.log("✅ Token acquired\n");

// 1. Active users (sanity)
console.log("→ Query 1: Active users in last 30 min");
const r1 = await runRealtimeReport(token, {
  metrics: [{ name: "activeUsers" }],
});
const activeUsers = r1.rows?.[0]?.metricValues?.[0]?.value ?? "0";
console.log(`   Active users: ${activeUsers}\n`);

// 2. Top events by name
console.log("→ Query 2: Event counts by name (last 30 min)");
const r2 = await runRealtimeReport(token, {
  dimensions: [{ name: "eventName" }],
  metrics: [{ name: "eventCount" }],
  orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
  limit: 50,
});

if (!r2.rows || r2.rows.length === 0) {
  console.log("   ⚠️ No events in last 30 min\n");
} else {
  console.log(`   Found ${r2.rows.length} event types:\n`);
  for (const row of r2.rows) {
    const name = row.dimensionValues[0].value;
    const count = row.metricValues[0].value;
    const marker = ["article_view", "article_share", "client_view", "client_favorite", "follow_client", "contact_submit", "ask_client_submit", "newsletter_subscribe", "comment_submit", "outbound_click", "conversion_complete"].includes(name) ? "  🎯 OUR EVENT" : "";
    console.log(`   ${count.padStart(5)} × ${name}${marker}`);
  }
}

// 3. Recent minute-by-minute breakdown for our key events
console.log("\n→ Query 3: Last 5 min breakdown for OUR events");
const ourEvents = ["article_view", "article_share", "client_view"];
for (const evt of ourEvents) {
  const r = await runRealtimeReport(token, {
    metrics: [{ name: "eventCount" }],
    minuteRanges: [{ name: "last-5", startMinutesAgo: 5 }],
    dimensionFilter: {
      filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: evt } },
    },
  });
  const count = r.rows?.[0]?.metricValues?.[0]?.value ?? "0";
  const status = count > 0 ? "✅" : "❌";
  console.log(`   ${status} ${evt}: ${count} in last 5 min`);
}

console.log("\n═══════════════════════════════════════════════════════════════");
console.log("  Verification complete.");
console.log("═══════════════════════════════════════════════════════════════");
