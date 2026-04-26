/**
 * Read-only check — was the target URL already notified for removal?
 * Uses getMetadata (no write quota consumed).
 *
 * Run: pnpm tsx admin/scripts/check-removal-status.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import { google } from "googleapis";

const TARGET_URL =
  "https://www.modonty.com/articles/النموذج-الأولي-الأول-من-kosmera-سيعرض-عالميًا-في-ces-2026،-مع-إعادة-تعريف-سيارة-السوبر-الكهربائية-الذكية-البوابة-39";

async function main() {
  const b64 = process.env.GSC_MODONTY_KEY_BASE64!;
  const creds = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  const jwt = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });
  const indexing = google.indexing({ version: "v3", auth: jwt });

  console.log(`🎯 Checking: ${TARGET_URL}\n`);
  try {
    const res = await indexing.urlNotifications.getMetadata({ url: TARGET_URL });
    console.log("✅ URL HAS notification metadata:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    const err = e as { code?: number; message?: string };
    if (err.code === 404) {
      console.log("ℹ️  No notification yet — URL has NOT been sent to Indexing API.");
    } else {
      console.error(`❌ Error (code ${err.code}): ${err.message}`);
    }
  }
}

main();
