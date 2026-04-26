/**
 * Debug: call urlNotifications.publish directly and log the FULL raw response.
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

  console.log("📤 Publishing URL_DELETED...");
  console.log(`   URL: ${TARGET_URL}\n`);

  try {
    const res = await indexing.urlNotifications.publish({
      requestBody: { url: TARGET_URL, type: "URL_DELETED" },
    });
    console.log("📥 HTTP status:", res.status);
    console.log("📥 Headers:", JSON.stringify(res.headers, null, 2));
    console.log("📥 res.data (raw):");
    console.log(JSON.stringify(res.data, null, 2));
    console.log("\n📥 res.data.urlNotificationMetadata:");
    console.log(JSON.stringify(res.data.urlNotificationMetadata, null, 2));
  } catch (e) {
    const err = e as { code?: number; message?: string; errors?: unknown };
    console.error("❌ FAILED:");
    console.error("  code:", err.code);
    console.error("  message:", err.message);
    console.error("  errors:", JSON.stringify(err.errors, null, 2));
    console.error("  full:", e);
  }
}

main().catch((e) => console.error("Outer fail:", e));
