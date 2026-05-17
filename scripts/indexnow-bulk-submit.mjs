// One-time bulk submit ALL sitemap URLs to IndexNow.
// Pulls live sitemap from www.modonty.com/sitemap.xml + posts every URL to IndexNow.
//
// Usage: node scripts/indexnow-bulk-submit.mjs
// (or with explicit key: INDEXNOW_KEY=xxx node scripts/indexnow-bulk-submit.mjs)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.shared if INDEXNOW_KEY not set in env
if (!process.env.INDEXNOW_KEY) {
  try {
    const envText = readFileSync(resolve(process.cwd(), ".env.shared"), "utf-8");
    const match = envText.match(/^INDEXNOW_KEY=(.+)$/m);
    if (match) process.env.INDEXNOW_KEY = match[1].replace(/^"(.*)"$/, "$1").trim();
  } catch {
    // ignore
  }
}

const KEY = process.env.INDEXNOW_KEY;
if (!KEY) {
  console.error("ERROR: INDEXNOW_KEY not set (env var or .env.shared)");
  process.exit(1);
}

const HOST = "www.modonty.com";
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

console.log(`IndexNow bulk submit`);
console.log(`  host: ${HOST}`);
console.log(`  key: ${KEY.slice(0, 8)}...${KEY.slice(-4)}`);
console.log(`  sitemap: ${SITEMAP_URL}`);
console.log();

// 1) Fetch sitemap
console.log("Fetching sitemap...");
const sitemapXml = await fetch(SITEMAP_URL).then((r) => r.text());
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`  found ${urls.length} URLs`);

if (urls.length === 0) {
  console.error("No URLs found in sitemap. Aborting.");
  process.exit(1);
}

// 2) Submit (batches of 1000)
const BATCH_SIZE = 1000;
let total = 0;
let success = 0;

for (let i = 0; i < urls.length; i += BATCH_SIZE) {
  const batch = urls.slice(i, i + BATCH_SIZE);
  total += batch.length;

  console.log(`\nSubmitting batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} URLs)...`);

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: batch,
  };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8", Host: "api.indexnow.org" },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => "");
  console.log(`  → HTTP ${res.status} ${res.statusText}`);
  if (text) console.log(`  → body: ${text.slice(0, 200)}`);

  if (res.status === 200 || res.status === 202) {
    success += batch.length;
    console.log(`  ✅ accepted`);
  } else {
    console.log(`  ❌ failed`);
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Submitted: ${total}`);
console.log(`Accepted:  ${success}`);
console.log(`Failed:    ${total - success}`);

if (success === total) {
  console.log(`\n✅ All URLs submitted to IndexNow. Bing/Yandex/Brave/Seznam/Naver will start crawling within hours.`);
  console.log(`Track status: https://www.bing.com/webmasters → modonty.com → IndexNow tab`);
}
