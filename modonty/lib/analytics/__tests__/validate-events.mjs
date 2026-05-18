/**
 * GA4 Events Validation Script
 *
 * Sends a sample of each registered event to GA4's /debug/mp/collect endpoint
 * and verifies validationMessages is empty. Catches typos in event names,
 * invalid params, reserved name conflicts, etc.
 *
 * Usage:
 *   node modonty/lib/analytics/__tests__/validate-events.mjs
 *
 * Reads env from MODONTY/.env.shared (NEXT_PUBLIC_GA4_MEASUREMENT_ID + GA4_API_SECRET).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ENV_PATH = join(__dirname, "../../../../.env.shared");

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
const MEASUREMENT_ID = env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const API_SECRET = env.GA4_API_SECRET;

if (!MEASUREMENT_ID || !API_SECRET) {
  console.error("❌ Missing NEXT_PUBLIC_GA4_MEASUREMENT_ID or GA4_API_SECRET in .env.shared");
  process.exit(1);
}

const TEST_CLIENT_ID = `validator.${Date.now()}`;
const TEST_SESSION_ID = String(Date.now());

const ARTICLE_CTX = {
  article_id: "test-article-001",
  article_slug: "validate-events-article",
  article_title: "Validate Events — Sample Article",
  author_id: "test-author",
  author_name: "Test Author",
  category_slug: "marketing",
  category_name: "Marketing",
  tag_primary: "validation",
};

const CLIENT_CTX = {
  client_id: "test-client-001",
  client_slug: "modonty",
  client_name: "Modonty Validator",
  client_industry: "tech",
};

const EVENT_SAMPLES = [
  // Article
  { name: "article_view", params: { ...ARTICLE_CTX, ...CLIENT_CTX } },
  { name: "article_like", params: { ...ARTICLE_CTX, ...CLIENT_CTX } },
  { name: "article_dislike", params: { ...ARTICLE_CTX, ...CLIENT_CTX } },
  { name: "article_favorite", params: { ...ARTICLE_CTX, ...CLIENT_CTX } },
  { name: "article_share", params: { ...ARTICLE_CTX, ...CLIENT_CTX, share_platform: "whatsapp" } },
  { name: "comment_submit", params: { ...ARTICLE_CTX, ...CLIENT_CTX, comment_id: "c1", comment_target_type: "article" } },
  { name: "comment_reply", params: { ...ARTICLE_CTX, ...CLIENT_CTX, comment_id: "c2" } },
  { name: "comment_like", params: { ...ARTICLE_CTX, ...CLIENT_CTX, comment_id: "c3" } },
  { name: "comment_dislike", params: { ...ARTICLE_CTX, ...CLIENT_CTX, comment_id: "c4" } },
  // Client page
  { name: "client_view", params: { ...CLIENT_CTX } },
  { name: "client_share", params: { ...CLIENT_CTX, share_platform: "twitter" } },
  { name: "client_favorite", params: { ...CLIENT_CTX } },
  { name: "client_comment_submit", params: { ...CLIENT_CTX, comment_id: "cc1" } },
  { name: "newsletter_subscribe", params: { ...CLIENT_CTX } },
  // Engagement
  { name: "follow_client", params: { ...CLIENT_CTX } },
  { name: "outbound_click", params: { cta_label: "Visit Site", cta_target_url: "https://example.com", cta_type: "button", cta_location: "sidebar" } },
  // Conversion ⭐
  { name: "contact_submit", params: { ...CLIENT_CTX, contact_method: "whatsapp" } },
  { name: "ask_client_submit", params: { ...CLIENT_CTX, ...ARTICLE_CTX } },
  { name: "campaign_interest", params: { ...CLIENT_CTX, campaign_reach: "own" } },
  { name: "conversion_complete", params: { ...CLIENT_CTX, conversion_type: "subscription" } },
  // Deferred
  { name: "lead_qualified", params: { ...CLIENT_CTX, conversion_type: "lead_qualified" } },
];

async function validateEvent(eventName, params) {
  const url = `https://www.google-analytics.com/debug/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;
  const payload = {
    client_id: TEST_CLIENT_ID,
    events: [
      {
        name: eventName,
        params: { ...params, session_id: TEST_SESSION_ID, engagement_time_msec: 100 },
      },
    ],
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await resp.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return {
    status: resp.status,
    validationMessages: json?.validationMessages ?? [],
  };
}

console.log("═══════════════════════════════════════════════════════════════");
console.log(`  GA4 Events Validation — ${EVENT_SAMPLES.length} events`);
console.log(`  Measurement ID: ${MEASUREMENT_ID}`);
console.log(`  Endpoint: /debug/mp/collect (no real events recorded)`);
console.log("═══════════════════════════════════════════════════════════════\n");

let pass = 0;
let fail = 0;
const failures = [];

for (const sample of EVENT_SAMPLES) {
  const result = await validateEvent(sample.name, sample.params);
  const ok = result.status === 200 && result.validationMessages.length === 0;
  if (ok) {
    pass++;
    console.log(`  ✅ ${sample.name.padEnd(28)} OK`);
  } else {
    fail++;
    failures.push({ name: sample.name, ...result });
    console.log(`  ❌ ${sample.name.padEnd(28)} FAIL (status ${result.status})`);
    for (const msg of result.validationMessages) {
      console.log(`     → ${msg.fieldPath ?? "?"} :: ${msg.description}`);
    }
  }
  await new Promise((r) => setTimeout(r, 100));
}

console.log(`\n═══ RESULT ═══`);
console.log(`✅ Passed: ${pass}/${EVENT_SAMPLES.length}`);
console.log(`❌ Failed: ${fail}/${EVENT_SAMPLES.length}\n`);

if (failures.length > 0) {
  console.log("Failures detail:");
  for (const f of failures) {
    console.log(`  - ${f.name}: ${JSON.stringify(f.validationMessages)}`);
  }
  process.exit(1);
}

console.log("✅ All events validated successfully.");
