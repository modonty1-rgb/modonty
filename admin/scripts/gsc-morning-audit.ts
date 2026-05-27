/**
 * Morning GSC audit (2026-05-27) — full control via service account.
 *
 * 1. Inspect the failing URL (دليلك-الشامل-...)
 * 2. List all sitemaps + their state
 * 3. Top 30 pages last 28 days
 * 4. Date-by-date performance (detect when 404 problems started)
 */
import dotenv from "dotenv";
import path from "path";
import { google } from "googleapis";

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env.shared") });

const PROPERTY = "sc-domain:modonty.com";
const FAILING_URL = "https://www.modonty.com/articles/دليلك-الشامل-حول-أفضل-طرق-زيادة-الدخل-في-السعودية";

function getCredentials() {
  const b64 = process.env.GSC_MODONTY_KEY_BASE64;
  if (!b64) throw new Error("GSC_MODONTY_KEY_BASE64 missing");
  const json = Buffer.from(b64, "base64").toString("utf-8");
  return JSON.parse(json) as { client_email: string; private_key: string };
}

function gscClient(scope: string) {
  const creds = getCredentials();
  const auth = new google.auth.JWT({ email: creds.client_email, key: creds.private_key, scopes: [scope] });
  return google.webmasters({ version: "v3", auth });
}

function searchConsoleClient(scope: string) {
  const creds = getCredentials();
  const auth = new google.auth.JWT({ email: creds.client_email, key: creds.private_key, scopes: [scope] });
  return google.searchconsole({ version: "v1", auth });
}

async function inspectUrl(url: string) {
  console.log(`\n═══ 1️⃣  URL Inspection: ${url.slice(0, 80)}... ═══\n`);
  try {
    const c = searchConsoleClient("https://www.googleapis.com/auth/webmasters.readonly");
    const res = await c.urlInspection.index.inspect({
      requestBody: { inspectionUrl: url, siteUrl: PROPERTY, languageCode: "ar-SA" },
    });
    const r = res.data.inspectionResult;
    const idx = r?.indexStatusResult;
    console.log("Verdict:           ", idx?.verdict);
    console.log("Coverage state:    ", idx?.coverageState);
    console.log("Page fetch:        ", idx?.pageFetchState);
    console.log("Indexing state:    ", idx?.indexingState);
    console.log("Robots.txt state:  ", idx?.robotsTxtState);
    console.log("Last crawled:      ", idx?.lastCrawlTime);
    console.log("Crawled as:        ", idx?.crawledAs);
    console.log("User canonical:    ", idx?.userCanonical);
    console.log("Google canonical:  ", idx?.googleCanonical);
    console.log("Referring URLs:    ", idx?.referringUrls);
    console.log("Sitemap:           ", idx?.sitemap);
    console.log("Mobile usability:  ", r?.mobileUsabilityResult?.verdict);
  } catch (e) {
    console.error("❌ Inspection failed:", (e as Error).message);
  }
}

async function listSitemaps() {
  console.log("\n═══ 2️⃣  Sitemaps registered ═══\n");
  try {
    const c = gscClient("https://www.googleapis.com/auth/webmasters.readonly");
    const res = await c.sitemaps.list({ siteUrl: PROPERTY });
    const sm = res.data.sitemap ?? [];
    if (!sm.length) {
      console.log("⚠️  No sitemaps registered.");
      return;
    }
    for (const s of sm) {
      console.log(`  📄 ${s.path}`);
      console.log(`     submitted: ${s.lastSubmitted} · downloaded: ${s.lastDownloaded}`);
      console.log(`     warnings: ${s.warnings} · errors: ${s.errors} · indexed urls: ${s.contents?.[0]?.indexed ?? "?"} / ${s.contents?.[0]?.submitted ?? "?"}`);
      console.log(`     isPending: ${s.isPending} · isSitemapsIndex: ${s.isSitemapsIndex}`);
    }
  } catch (e) {
    console.error("❌ Sitemap list failed:", (e as Error).message);
  }
}

async function topPages() {
  console.log("\n═══ 3️⃣  Top 30 pages (last 28 days) ═══\n");
  try {
    const c = gscClient("https://www.googleapis.com/auth/webmasters.readonly");
    const end = new Date(); end.setDate(end.getDate() - 3);
    const start = new Date(); start.setDate(end.getDate() - 28);
    const res = await c.searchanalytics.query({
      siteUrl: PROPERTY,
      requestBody: {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        dimensions: ["page"],
        rowLimit: 30,
      },
    });
    const rows = res.data.rows ?? [];
    console.log(`Showing top ${rows.length} by clicks · range: ${start.toISOString().slice(0,10)} to ${end.toISOString().slice(0,10)}\n`);
    rows.sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0));
    for (const r of rows.slice(0, 30)) {
      const url = (r.keys?.[0] ?? "").slice(-70);
      console.log(`  ${(r.clicks ?? 0).toString().padStart(4)} clk · ${(r.impressions ?? 0).toString().padStart(5)} imp · pos ${(r.position ?? 0).toFixed(1).padStart(5)} · ${url}`);
    }
  } catch (e) {
    console.error("❌ Top pages failed:", (e as Error).message);
  }
}

async function performanceByDate() {
  console.log("\n═══ 4️⃣  Daily performance (last 28 days) — detect drop pattern ═══\n");
  try {
    const c = gscClient("https://www.googleapis.com/auth/webmasters.readonly");
    const end = new Date(); end.setDate(end.getDate() - 3);
    const start = new Date(); start.setDate(end.getDate() - 28);
    const res = await c.searchanalytics.query({
      siteUrl: PROPERTY,
      requestBody: {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        dimensions: ["date"],
        rowLimit: 50,
      },
    });
    const rows = (res.data.rows ?? []).sort((a, b) => (a.keys?.[0] ?? "").localeCompare(b.keys?.[0] ?? ""));
    console.log(`Date         | clicks | impressions | CTR%  | avg pos`);
    console.log(`-------------|--------|-------------|-------|--------`);
    for (const r of rows) {
      const d = r.keys?.[0] ?? "?";
      const c = r.clicks ?? 0;
      const i = r.impressions ?? 0;
      const ctr = ((r.ctr ?? 0) * 100).toFixed(2);
      const pos = (r.position ?? 0).toFixed(1);
      console.log(`${d} | ${c.toString().padStart(6)} | ${i.toString().padStart(11)} | ${ctr.padStart(5)} | ${pos.padStart(6)}`);
    }
  } catch (e) {
    console.error("❌ Date performance failed:", (e as Error).message);
  }
}

async function main() {
  console.log("🔍 GSC Morning Audit — 2026-05-27");
  console.log("Property:", PROPERTY);
  console.log("Service account:", getCredentials().client_email);

  await inspectUrl(FAILING_URL);
  await listSitemaps();
  await topPages();
  await performanceByDate();

  console.log("\n✅ Audit complete.");
}

main().catch((e) => { console.error("\n❌ Fatal:", e); process.exit(1); });
