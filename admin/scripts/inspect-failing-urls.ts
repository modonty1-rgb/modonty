/**
 * Inspect failing article URLs via GSC URL Inspection API.
 * READ-ONLY. No DB writes. Direct query to Google.
 */
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env.shared") });

import { getSearchConsoleClient, GSC_PROPERTY } from "../lib/gsc/client";

const URLS = [
  "https://www.modonty.com/articles/تفعيل-باقات-stc-بأسعار-أقل-من-الرسمي-داخل-السعودية",
  "https://www.modonty.com/articles/ما-هو-السيو",
  "https://www.modonty.com/articles/كيف-يساعد-سيو-في-زيادة-المبيعات",
];

async function inspect(url: string) {
  const sc = getSearchConsoleClient();
  const res = await sc.urlInspection.index.inspect({
    requestBody: {
      inspectionUrl: url,
      siteUrl: GSC_PROPERTY,
    },
  });
  return res.data;
}

async function run() {
  console.log(`🌐 GSC Property: ${GSC_PROPERTY}\n`);
  for (const url of URLS) {
    console.log(`\n━━━━━━━━━━ ${url.slice(28, 70)}... ━━━━━━━━━━`);
    try {
      const data = await inspect(url);
      const r = data.inspectionResult;
      if (!r) { console.log("❌ no result"); continue; }
      const idx = r.indexStatusResult;
      console.log(`Verdict:           ${idx?.verdict ?? "(none)"}`);
      console.log(`Coverage state:    ${idx?.coverageState ?? "(none)"}`);
      console.log(`Indexing state:    ${idx?.indexingState ?? "(none)"}`);
      console.log(`User canonical:    ${idx?.userCanonical ?? "(none)"}`);
      console.log(`Google canonical:  ${idx?.googleCanonical ?? "(none)"}`);
      console.log(`Robots state:      ${idx?.robotsTxtState ?? "(none)"}`);
      console.log(`Last crawl:        ${idx?.lastCrawlTime ?? "(never)"}`);
      console.log(`Crawled as:        ${idx?.crawledAs ?? "(none)"}`);
      console.log(`Page fetch:        ${idx?.pageFetchState ?? "(none)"}`);
      console.log(`Sitemap:           ${idx?.sitemap?.join(", ") ?? "(none)"}`);
      console.log(`Referring URLs:    ${idx?.referringUrls?.slice(0,3).join(", ") ?? "(none)"}`);
      const mob = r.mobileUsabilityResult;
      if (mob) console.log(`Mobile verdict:    ${mob.verdict}  issues=${mob.issues?.length ?? 0}`);
      const rich = r.richResultsResult;
      if (rich) console.log(`Rich verdict:      ${rich.verdict}  items=${rich.detectedItems?.length ?? 0}`);
    } catch (e: any) {
      console.log(`❌ Error: ${e.message}`);
    }
  }
}

run().catch(e => { console.error(e); process.exit(1); });
