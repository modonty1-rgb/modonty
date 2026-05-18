/**
 * GA4 Measurement Protocol Smoke Test
 *
 * Sends a single test event to GA4 via Measurement Protocol to verify:
 *   - GA4_API_SECRET is valid
 *   - NEXT_PUBLIC_GA4_MEASUREMENT_ID matches the stream
 *   - Event reaches GA4 (visible in Realtime / DebugView)
 *
 * USAGE:
 *   node scripts/smoke-test-ga4-mp.mjs           # sends to /debug/mp/collect (validation only, no real event)
 *   node scripts/smoke-test-ga4-mp.mjs --real    # sends to /mp/collect (real event, appears in Realtime + DebugView)
 *
 * The default /debug endpoint validates payload shape and returns errors WITHOUT recording the event.
 * Use --real once to confirm the event actually lands in GA4 Realtime.
 */

import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

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
const measurementId = env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const apiSecret = env.GA4_API_SECRET;

if (!measurementId || !apiSecret) {
  console.error("❌ Missing NEXT_PUBLIC_GA4_MEASUREMENT_ID or GA4_API_SECRET in .env.shared");
  process.exit(1);
}

const isReal = process.argv.includes("--real");
const endpoint = isReal
  ? "https://www.google-analytics.com/mp/collect"
  : "https://www.google-analytics.com/debug/mp/collect";

const clientId = `smoketest.${Date.now()}`;
const sessionId = String(Date.now());

const payload = {
  client_id: clientId,
  events: [
    {
      name: "smoke_test_phase1",
      params: {
        session_id: sessionId,
        engagement_time_msec: 100,
        debug_mode: 1,
        article_id: "test-article-001",
        article_slug: "phase-1-smoke-test",
        client_slug: "modonty",
      },
    },
  ],
};

console.log("═══════════════════════════════════════════════════════════════");
console.log(`  GA4 Measurement Protocol — Smoke Test`);
console.log(`  Endpoint: ${isReal ? "🔴 /mp/collect (REAL event)" : "🟢 /debug/mp/collect (validation only)"}`);
console.log(`  Measurement ID: ${measurementId}`);
console.log(`  Secret: ${apiSecret.slice(0, 4)}***${apiSecret.slice(-4)} (${apiSecret.length} chars)`);
console.log(`  Client ID: ${clientId}`);
console.log("═══════════════════════════════════════════════════════════════\n");

console.log("→ Sending payload:");
console.log(JSON.stringify(payload, null, 2));
console.log();

const url = `${endpoint}?measurement_id=${measurementId}&api_secret=${apiSecret}`;
const resp = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

console.log(`→ HTTP Status: ${resp.status} ${resp.statusText}`);

const text = await resp.text();
let json;
try {
  json = text ? JSON.parse(text) : null;
} catch {
  json = null;
}

if (json) {
  console.log("→ Response body:");
  console.log(JSON.stringify(json, null, 2));
} else {
  console.log(`→ Response body: ${text || "(empty)"}`);
}

console.log();

// Validate
if (!resp.ok) {
  console.error(`❌ Request failed with HTTP ${resp.status}`);
  process.exit(1);
}

if (json?.validationMessages && json.validationMessages.length > 0) {
  console.error("❌ GA4 returned validation messages:");
  for (const msg of json.validationMessages) {
    console.error(`  - [${msg.fieldPath ?? "?"}] ${msg.description}`);
  }
  process.exit(1);
}

console.log("✅ Smoke test PASSED");
if (!isReal) {
  console.log("ℹ️  This was /debug — no event was recorded.");
  console.log("ℹ️  To send a real event (visible in GA4 Realtime + DebugView):");
  console.log("    node scripts/smoke-test-ga4-mp.mjs --real");
} else {
  console.log("ℹ️  Real event sent. Check GA4 within ~30 seconds:");
  console.log("    https://analytics.google.com/analytics/web/#/p538167732/realtime/overview");
  console.log(`    Event name to look for: smoke_test_phase1`);
  console.log(`    Client ID: ${clientId}`);
}
