/**
 * One-shot live test — sends URL_REMOVED for a SINGLE URL via Indexing API.
 *
 * ⚠️ CONSUMES 1/200 of the daily Indexing API write quota.
 *
 * Run: pnpm tsx admin/scripts/test-removal-single.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import { google } from "googleapis";

// Target: highest-impression URL in the Removal Queue (26 impressions, missing in DB)
const TARGET_URL =
  "https://www.modonty.com/articles/النموذج-الأولي-الأول-من-kosmera-سيعرض-عالميًا-في-ces-2026،-مع-إعادة-تعريف-سيارة-السوبر-الكهربائية-الذكية-البوابة-39";

async function main() {
  console.log("─────────────────────────────────────────");
  console.log(" Indexing API — Live Single Removal Test");
  console.log("─────────────────────────────────────────\n");
  console.log(`🎯 Target URL: ${TARGET_URL}\n`);

  const b64 = process.env.GSC_MODONTY_KEY_BASE64;
  if (!b64) {
    console.error("❌ GSC_MODONTY_KEY_BASE64 is not set");
    process.exit(1);
  }
  const creds = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  const jwt = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });

  const indexing = google.indexing({ version: "v3", auth: jwt });

  // Step 1 — pre-check: was this URL already notified?
  console.log("⏳ Step 1 — pre-check (getMetadata)…");
  try {
    const res = await indexing.urlNotifications.getMetadata({ url: TARGET_URL });
    console.log("ℹ️  Already has notification metadata:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    const err = e as { code?: number; message?: string };
    if (err.code === 404) {
      console.log("✅ No prior notification for this URL — clean slate.\n");
    } else {
      console.error(`❌ getMetadata failed: ${err.message}`);
      process.exit(1);
    }
  }

  // Step 2 — actual URL_REMOVED publish
  console.log("⏳ Step 2 — publishing URL_REMOVED (consumes 1/200 quota)…");
  try {
    const res = await indexing.urlNotifications.publish({
      requestBody: {
        url: TARGET_URL,
        type: "URL_REMOVED",
      },
    });
    console.log("✅ publish succeeded\n");
    console.log("📦 Response body:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    const err = e as { code?: number; message?: string };
    console.error(`❌ publish FAILED (code ${err.code ?? "?"}): ${err.message}`);
    process.exit(1);
  }

  // Step 3 — post-check: confirm Google now has the URL_REMOVED record
  console.log("\n⏳ Step 3 — post-check (getMetadata)…");
  try {
    const res = await indexing.urlNotifications.getMetadata({ url: TARGET_URL });
    console.log("✅ Confirmed — Google's record:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    const err = e as { code?: number; message?: string };
    console.error(`⚠️  Post-check failed (code ${err.code ?? "?"}): ${err.message}`);
  }

  console.log("\n─────────────────────────────────────────");
  console.log(" ✅ URL_REMOVED sent successfully");
  console.log("─────────────────────────────────────────");
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
