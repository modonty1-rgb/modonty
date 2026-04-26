/**
 * Compare publish responses across content types to determine if Google actually accepts the request.
 * If Google returns response WITHOUT latestRemove/latestUpdate, the request was silently filtered.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import { google } from "googleapis";

async function publish(indexing: ReturnType<typeof google.indexing>, url: string, type: "URL_UPDATED" | "URL_DELETED") {
  console.log(`\n──── ${type} for ${url}`);
  try {
    const res = await indexing.urlNotifications.publish({ requestBody: { url, type } });
    const meta = res.data.urlNotificationMetadata;
    const accepted = !!(meta?.latestUpdate?.notifyTime || meta?.latestRemove?.notifyTime);
    console.log(`  HTTP: ${res.status}`);
    console.log(`  Response: ${JSON.stringify(meta)}`);
    console.log(`  ${accepted ? "✅ ACCEPTED — notifyTime returned" : "❌ FILTERED — no notifyTime in response"}`);
  } catch (e) {
    const err = e as { code?: number; message?: string };
    console.log(`  ❌ ERROR ${err.code}: ${err.message}`);
  }
}

async function main() {
  const b64 = process.env.GSC_MODONTY_KEY_BASE64!;
  const creds = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  const jwt = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });
  const indexing = google.indexing({ version: "v3", auth: jwt });

  // Test 1: URL_UPDATED on a real, live URL (homepage)
  await publish(indexing, "https://www.modonty.com/", "URL_UPDATED");

  // Test 2: URL_DELETED on a real, live URL (homepage) — should fail since site is live
  await publish(indexing, "https://www.modonty.com/", "URL_DELETED");

  // Test 3: URL_UPDATED on a live article that exists in DB
  await publish(indexing, "https://www.modonty.com/articles/test-publish-check", "URL_UPDATED");

  console.log("\n💡 If even URL_UPDATED on homepage returns NO notifyTime, Google is silently filtering all our requests for this site.");
  console.log("💡 If URL_UPDATED works but URL_DELETED doesn't, then URL_DELETED specifically is being filtered.");
}

main().catch((e) => console.error("Fail:", e));
