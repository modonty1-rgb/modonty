/**
 * Health check for Google Indexing API.
 *
 * Verifies:
 *   1. Service account credentials load correctly
 *   2. JWT auth succeeds (access token issued)
 *   3. Indexing API is reachable with the indexing scope
 *   4. urlNotifications.getMetadata works (read-only, no write quota consumed)
 *
 * Run: pnpm tsx admin/scripts/test-indexing-api.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import { google } from "googleapis";

async function main() {
  console.log("─────────────────────────────────────────");
  console.log(" Indexing API — Health Check");
  console.log("─────────────────────────────────────────\n");

  // 1. Credentials
  const b64 = process.env.GSC_MODONTY_KEY_BASE64;
  if (!b64) {
    console.error("❌ GSC_MODONTY_KEY_BASE64 is not set");
    process.exit(1);
  }
  let creds: { client_email: string; private_key: string };
  try {
    creds = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  } catch (e) {
    console.error("❌ Failed to decode/parse credentials:", e);
    process.exit(1);
  }
  console.log("✅ Step 1 — Credentials loaded");
  console.log(`   client_email: ${creds.client_email}`);
  console.log(`   private_key: <${creds.private_key.length} chars>\n`);

  // 2. JWT auth
  const jwt = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });
  try {
    await jwt.authorize();
  } catch (e) {
    console.error("❌ Step 2 — JWT auth FAILED:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
  console.log("✅ Step 2 — JWT auth succeeded\n");

  // 3. Reach API + 4. getMetadata (read-only)
  const indexing = google.indexing({ version: "v3", auth: jwt });
  const testUrl = "https://www.modonty.com/";
  console.log(`⏳ Step 3+4 — Calling urlNotifications.getMetadata for ${testUrl}…`);
  try {
    const res = await indexing.urlNotifications.getMetadata({ url: testUrl });
    console.log("✅ Step 3 — Indexing API reachable");
    console.log("✅ Step 4 — getMetadata returned successfully");
    console.log("\n📦 Response body:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    const err = e as { code?: number; message?: string };
    if (err.code === 404) {
      console.log("✅ Step 3 — Indexing API reachable (got 404 = URL was never published, which is expected for a health check)");
      console.log("✅ Step 4 — getMetadata works (404 = no prior notification, NOT an auth/scope error)");
    } else {
      console.error(`❌ Step 3/4 — FAILED (code ${err.code ?? "?"}): ${err.message ?? e}`);
      process.exit(1);
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log(" ✅ Indexing API is healthy and ready");
  console.log("─────────────────────────────────────────");
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
