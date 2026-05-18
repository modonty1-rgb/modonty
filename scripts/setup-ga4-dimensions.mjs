/**
 * GA4 Custom Dimensions Setup — Phase 1 of GTM-PLAN
 *
 * Creates ~25 Custom Dimensions in GA4 property G-V25C2PSHNB via Admin API.
 * Idempotent: checks existing dimensions first, only creates what's missing.
 *
 * USAGE:
 *   node scripts/setup-ga4-dimensions.mjs           # dry-run (prints plan, no API writes)
 *   node scripts/setup-ga4-dimensions.mjs --apply   # actually create missing dimensions
 *
 * REQUIRES (in .env.shared):
 *   GA4_CLIENT_EMAIL  — service account email
 *   GA4_PRIVATE_KEY   — service account private key
 *
 * REQUIRES on GA4 property:
 *   Service account must have **Editor** role (not just Viewer).
 *   Verify at: GA4 → Admin → Property Access Management
 *
 * SAFETY:
 *   - Idempotent (won't duplicate existing dimensions)
 *   - Won't modify or delete anything
 *   - Reports what it WOULD do in dry-run mode
 *   - Logs every API response for audit
 */

import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const ENV_PATH = "c:/Users/w2nad/Desktop/dreamToApp/MODONTY/.env.shared";
const GA4_PROPERTY_ID = "538167732"; // Modonty property (corrected 2026-05-18)
const SCOPE = "https://www.googleapis.com/auth/analytics.edit";

const isApply = process.argv.includes("--apply");

// ─── Load env ────────────────────────────────────────────────────────────────
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
  console.error("❌ Missing GA4_CLIENT_EMAIL or GA4_PRIVATE_KEY in .env.shared");
  process.exit(1);
}

// ─── Dimension Catalog (~25 dimensions) ──────────────────────────────────────
// Each entry: parameterName + displayName + scope + description
// Scope: EVENT / USER / ITEM (per GA4 spec)
const DIMENSIONS = [
  // ─── Client context (4) ────────────────────────────────────────────────────
  { parameter: "client_id",       displayName: "Client ID",       scope: "EVENT", description: "Modonty client (business) identifier — for filtering reports per client" },
  { parameter: "client_slug",     displayName: "Client Slug",     scope: "EVENT", description: "URL-safe client slug" },
  { parameter: "client_name",     displayName: "Client Name",     scope: "EVENT", description: "Display name of the client" },
  { parameter: "client_industry", displayName: "Client Industry", scope: "EVENT", description: "Industry sector of the client (e.g., construction, marketing)" },

  // ─── Article context (8) ───────────────────────────────────────────────────
  { parameter: "article_id",       displayName: "Article ID",       scope: "EVENT", description: "Article identifier from MongoDB" },
  { parameter: "article_slug",     displayName: "Article Slug",     scope: "EVENT", description: "URL-safe article slug" },
  { parameter: "article_title",    displayName: "Article Title",    scope: "EVENT", description: "Article title (first 100 chars)" },
  { parameter: "author_id",        displayName: "Author ID",        scope: "EVENT", description: "Author user identifier" },
  { parameter: "author_name",      displayName: "Author Name",      scope: "EVENT", description: "Author display name" },
  { parameter: "category_slug",    displayName: "Category Slug",    scope: "EVENT", description: "Article category slug" },
  { parameter: "category_name",    displayName: "Category Name",    scope: "EVENT", description: "Article category display name" },
  { parameter: "tag_primary",      displayName: "Primary Tag",      scope: "EVENT", description: "First tag of the article" },

  // ─── CTA context (4) ───────────────────────────────────────────────────────
  { parameter: "cta_label",      displayName: "CTA Label",      scope: "EVENT", description: "Text label of the CTA button/link" },
  { parameter: "cta_type",       displayName: "CTA Type",       scope: "EVENT", description: "CTA element type (button/link/banner)" },
  { parameter: "cta_location",   displayName: "CTA Location",   scope: "EVENT", description: "Where on the page (sidebar/inline/footer)" },
  { parameter: "cta_target_url", displayName: "CTA Target URL", scope: "EVENT", description: "Destination URL of the CTA" },

  // ─── Engagement context (4) ────────────────────────────────────────────────
  { parameter: "share_platform",      displayName: "Share Platform",     scope: "EVENT", description: "Platform shared to (whatsapp/twitter/linkedin)" },
  { parameter: "comment_target_type", displayName: "Comment Target",     scope: "EVENT", description: "What was commented on (article/client)" },
  { parameter: "comment_id",          displayName: "Comment ID",         scope: "EVENT", description: "Comment identifier from DB" },
  { parameter: "interaction_position",displayName: "Interaction Position", scope: "EVENT", description: "Where on the page (top/middle/bottom)" },

  // ─── Conversion context (3) ────────────────────────────────────────────────
  { parameter: "conversion_type", displayName: "Conversion Type",  scope: "EVENT", description: "Specific conversion (purchase/signup_complete/contact)" },
  { parameter: "contact_method",  displayName: "Contact Method",   scope: "EVENT", description: "How contacted (whatsapp/email/phone/form)" },
  { parameter: "campaign_reach",  displayName: "Campaign Reach",   scope: "EVENT", description: "For campaign_interest (own/industry/full)" },

  // ─── User context (3) ──────────────────────────────────────────────────────
  { parameter: "user_role",       displayName: "User Role",       scope: "USER", description: "anonymous / registered_user / client_owner" },
  { parameter: "signup_method",   displayName: "Signup Method",   scope: "USER", description: "How they registered (google/email)" },
  { parameter: "user_segment",    displayName: "User Segment",    scope: "USER", description: "new / returning / loyal" },
];

// ─── Auth ────────────────────────────────────────────────────────────────────
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

// ─── Admin API calls ─────────────────────────────────────────────────────────
const BASE = `https://analyticsadmin.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}`;

async function listExisting(token) {
  const resp = await fetch(`${BASE}/customDimensions?pageSize=200`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`List failed: ${JSON.stringify(data)}`);
  return (data.customDimensions ?? []).map((d) => ({
    name: d.name,
    parameter: d.parameterName,
    displayName: d.displayName,
    scope: d.scope,
  }));
}

async function createDimension(token, def) {
  const resp = await fetch(`${BASE}/customDimensions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parameterName: def.parameter,
      displayName: def.displayName,
      scope: def.scope,
      description: def.description,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`Create failed for ${def.parameter}: ${JSON.stringify(data)}`);
  }
  return data;
}

// ─── Main ────────────────────────────────────────────────────────────────────
console.log("═══════════════════════════════════════════════════════════════");
console.log(`  GA4 Custom Dimensions Setup`);
console.log(`  Property: ${GA4_PROPERTY_ID} (G-V25C2PSHNB / modonty.com)`);
console.log(`  Mode: ${isApply ? "🔴 APPLY (will create missing dimensions)" : "🟢 DRY-RUN (no API writes)"}`);
console.log("═══════════════════════════════════════════════════════════════\n");

console.log(`→ Authenticating as ${env.GA4_CLIENT_EMAIL}...`);
const token = await getToken();
console.log("✅ Token acquired\n");

console.log("→ Fetching existing custom dimensions...");
const existing = await listExisting(token);
console.log(`✅ Found ${existing.length} existing dimensions\n`);

const existingByParam = new Map(existing.map((d) => [d.parameter, d]));

console.log(`→ Planning changes for ${DIMENSIONS.length} dimensions in catalog:\n`);

let toCreate = [];
let alreadyExists = [];

for (const def of DIMENSIONS) {
  const exists = existingByParam.get(def.parameter);
  if (exists) {
    alreadyExists.push(def);
    console.log(`  ⏭️  SKIP   ${def.parameter.padEnd(28)} (already exists · scope: ${exists.scope})`);
  } else {
    toCreate.push(def);
    console.log(`  ➕ CREATE ${def.parameter.padEnd(28)} (scope: ${def.scope})`);
  }
}

console.log(`\n→ Summary: ${toCreate.length} to create · ${alreadyExists.length} already exist · ${DIMENSIONS.length} total\n`);

if (!isApply) {
  console.log("ℹ️  Dry-run complete. To actually create, run: node scripts/setup-ga4-dimensions.mjs --apply\n");
  process.exit(0);
}

if (toCreate.length === 0) {
  console.log("✅ Nothing to do — all dimensions already exist.\n");
  process.exit(0);
}

console.log(`═══ APPLYING ${toCreate.length} CHANGES ═══\n`);

let success = 0;
let failed = 0;
const errors = [];

for (const def of toCreate) {
  try {
    const created = await createDimension(token, def);
    success++;
    console.log(`  ✅ Created ${def.parameter.padEnd(28)} (id: ${created.name?.split("/").pop()})`);
  } catch (e) {
    failed++;
    errors.push({ parameter: def.parameter, error: e.message });
    console.log(`  ❌ Failed  ${def.parameter.padEnd(28)} — ${e.message.slice(0, 80)}`);
  }
  // Small delay to avoid rate limiting (Admin API limit: ~10 req/sec)
  await new Promise((r) => setTimeout(r, 150));
}

console.log(`\n═══ RESULT ═══`);
console.log(`✅ Created:  ${success}`);
console.log(`❌ Failed:   ${failed}`);
console.log(`⏭️  Skipped:  ${alreadyExists.length} (already existed)`);
console.log(`📊 Total dimensions in property now: ${existing.length + success}`);

if (errors.length > 0) {
  console.log(`\n❌ Errors detail:`);
  for (const e of errors) {
    console.log(`  - ${e.parameter}: ${e.error}`);
  }
  process.exit(1);
}

console.log(`\n✅ Done. Verify in GA4 UI:`);
console.log(`   Admin → Property → Data display → Custom definitions\n`);
