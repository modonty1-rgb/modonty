/**
 * 🚀 Submit ALL published articles to search engines automatically
 *
 * Uses:
 * - IndexNow API (covers Bing + Yandex + Naver + Brave/Yep + Seznam) — FREE, instant
 * - Google Indexing API (URL_UPDATED via service account) — FREE, 200/day quota
 *
 * Saves manual GSC "Request Indexing" clicking on every URL.
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env.shared") });

const PROD_DATABASE_URL =
  "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty?retryWrites=true&w=majority&appName=modonty-cluster";

const db = new PrismaClient({ datasources: { db: { url: PROD_DATABASE_URL } } });

async function getAllPublishedUrls(): Promise<string[]> {
  const articles = await db.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
    orderBy: { datePublished: "desc" },
  });
  return articles.map((a) => `https://www.modonty.com/articles/${encodeURIComponent(a.slug)}`);
}

async function submitToIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    console.log("⚠️  INDEXNOW_KEY missing — skipping IndexNow submission");
    return;
  }
  const body = {
    host: "www.modonty.com",
    key,
    keyLocation: `https://www.modonty.com/${key}.txt`,
    urlList: urls,
  };
  // Submit to Bing endpoint (propagates to Yandex, Naver, Brave, Seznam)
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  if (res.ok || res.status === 202) {
    console.log(`✅ IndexNow: ${urls.length} URLs submitted (HTTP ${res.status})`);
    console.log(`   Covers: Bing · Yandex · Naver · Brave/Yep · Seznam`);
  } else {
    const text = await res.text().catch(() => "");
    console.log(`❌ IndexNow failed: HTTP ${res.status} — ${text.slice(0, 200)}`);
  }
}

async function submitToGoogleIndexingAPI(urls: string[]): Promise<void> {
  const b64 = process.env.GSC_MODONTY_KEY_BASE64;
  if (!b64) {
    console.log("⚠️  GSC_MODONTY_KEY_BASE64 missing — skipping Google Indexing API");
    return;
  }
  const creds = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });
  const indexing = google.indexing({ version: "v3", auth });

  console.log(`\n📤 Submitting ${urls.length} URLs to Google Indexing API (URL_UPDATED)...`);
  console.log(`   Quota: 200/day (Indexing API limit)`);
  console.log(`   Note: Google officially limits this API to JobPosting + BroadcastEvent.`);
  console.log(`         Submissions for other content types are accepted but may not trigger crawl.`);
  console.log(`         GSC's manual "Request Indexing" button is more reliable for re-crawl signals.\n`);

  let success = 0;
  let failed = 0;
  for (const url of urls) {
    try {
      await indexing.urlNotifications.publish({
        requestBody: { url, type: "URL_UPDATED" },
      });
      success++;
      console.log(`  ✅ ${url.slice(-60)}`);
    } catch (e) {
      failed++;
      const err = e as { code?: number; message?: string };
      console.log(`  ❌ ${url.slice(-60)} — ${err.code || err.message || "error"}`);
    }
  }
  console.log(`\n   Google Indexing API: ${success} success · ${failed} failed`);
}

async function main() {
  console.log("🚀 Submit all PROD articles to search engines\n");
  const urls = await getAllPublishedUrls();
  console.log(`Found ${urls.length} PUBLISHED articles in PROD DB\n`);

  if (urls.length === 0) {
    console.log("No URLs to submit. Exiting.");
    return;
  }

  console.log("═══ STEP 1: IndexNow (instant, covers Bing+Yandex+Naver+Brave+Seznam) ═══\n");
  await submitToIndexNow(urls);

  console.log("\n═══ STEP 2: Google Indexing API (URL_UPDATED notifications) ═══");
  await submitToGoogleIndexingAPI(urls);

  console.log("\n✅ Done.\n");
  console.log("Next steps (manual, optional but reliable for Google):");
  console.log("  GSC → URL Inspection → paste URL → REQUEST INDEXING for top 5-10 URLs");
  console.log("  Google's natural recrawl will pick up the rest within days.");
}

main()
  .catch((e) => { console.error("\n❌ FAILED:", e); process.exit(1); })
  .finally(() => db.$disconnect());
