import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../.env.local"), override: true });

import { getTopQueries, getTopPages, getPerformanceTotals } from "../lib/gsc/analytics";
import { listSitemaps } from "../lib/gsc/sitemaps";
import { inspectUrl } from "../lib/gsc/inspection";

async function run() {
  console.log("\n=== GSC Full Test ===\n");

  console.log("1️⃣  Performance Totals (28 days)...");
  const totals = await getPerformanceTotals(28);
  console.log(`   Clicks: ${totals.clicks} | Impressions: ${totals.impressions} | CTR: ${(totals.ctr * 100).toFixed(1)}% | Avg Position: ${totals.position.toFixed(1)}`);

  console.log("\n2️⃣  Top 5 Queries...");
  const queries = await getTopQueries(28, 5);
  queries.forEach((r) => console.log(`   [${r.clicks} clicks] ${r.keys[0]}`));

  console.log("\n3️⃣  Top 5 Pages...");
  const pages = await getTopPages(28, 5);
  pages.forEach((r) => console.log(`   [${r.clicks} clicks] ${r.keys[0]}`));

  console.log("\n4️⃣  Sitemaps...");
  const sitemaps = await listSitemaps();
  sitemaps.forEach((s) => console.log(`   ${s.path} | pending: ${s.isPending}`));

  console.log("\n5️⃣  URL Inspection (homepage)...");
  const inspection = await inspectUrl("https://www.modonty.com/");
  console.log(`   Verdict: ${inspection.indexStatusResult?.verdict}`);
  console.log(`   Coverage: ${inspection.indexStatusResult?.coverageState}`);
  console.log(`   Mobile: ${inspection.mobileUsabilityResult?.verdict}`);

  console.log("\n✅ All GSC capabilities confirmed.\n");
}

run().catch((e) => { console.error("❌", e); process.exit(1); });
