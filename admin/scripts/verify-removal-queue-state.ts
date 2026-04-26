/**
 * Verify the state of all 11 URLs in the Removal Queue against:
 * 1. Indexing API getMetadata (does Google have a notification record for them?)
 * 2. Search Console URL Inspection (are they still indexed?)
 *
 * This validates the central question: are these URLs already de-indexed,
 * making the "Notify deleted" button moot?
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import { google } from "googleapis";

// All 11 URLs from the current Removal Queue
const URLS = [
  "https://www.modonty.com/articles/النموذج-الأولي-الأول-من-kosmera-سيعرض-عالميًا-في-ces-2026،-مع-إعادة-تعريف-سيارة-السوبر-الكهربائية-الذكية-البوابة-39",
  "https://www.modonty.com/articles/hizero-تستعرض-منظف-الأسطح-المتعددة-h100r-الجديد-بتقنية-التنظيف-بدون-شفط-ces2026-9",
  "https://www.modonty.com/articles/هواوي-كلاود-تحتفي-بشركائها-في-السعودية-وتستعرض-نمو-منظومة-الحوسبة-السحابية-62",
  "https://www.modonty.com/articles/أخبار-على-الهامش-الأسبوع-2-8-يناير-18",
  "https://www.modonty.com/articles/أومودا-وجايكو-الإمارات-تحتفل-بأوّل-موسم-أعياد-لها-في-الدولة-مع-عرض-حصري-ليوم-واحد-بمناسبة-عيد-الميلاد-ورأس-السنة-24",
  "https://www.modonty.com/articles/استثمارك-في-العقارات-مواد-البناء-وأهميتها",
  "https://www.modonty.com/articles/أخبار-على-الهامش-الأسبوع-2-8-يناير-10",
  "https://www.modonty.com/articles/النموذج-الأولي-الأول-من-kosmera-سيعرض-عالميًا-في-ces-2026،-مع-إعادة-تعريف-سيارة-السوبر-الكهربائية-الذكية-البوابة-23",
  "https://www.modonty.com/articles/أومودا-وجايكو-الإمارات-تحتفل-بأوّل-موسم-أعياد-لها-في-الدولة-مع-عرض-حصري-ليوم-واحد-بمناسبة-عيد-الميلاد-ورأس-السنة-16",
  "https://www.modonty.com/articles/شاهد-شبيه-بلاكبيري-يعود-بعد-سنوات-لمواجهة-التشتت-الرقمي-61",
];

const SHORT_URLS = URLS.map((u) => {
  const path = new URL(u).pathname;
  return path.length > 50 ? path.slice(0, 47) + "..." : path;
});

async function main() {
  const b64 = process.env.GSC_MODONTY_KEY_BASE64!;
  const creds = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));

  // Two scopes: Indexing API + Search Console
  const indexingJwt = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });
  const gscJwt = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const indexing = google.indexing({ version: "v3", auth: indexingJwt });
  const sc = google.searchconsole({ version: "v1", auth: gscJwt });

  console.log("# Removal Queue State — All 11 URLs\n");
  console.log(
    "| # | URL (short) | Indexing API record | URL Inspection: indexed? | Reason |",
  );
  console.log(
    "|---|---|---|---|---|",
  );

  for (let i = 0; i < URLS.length; i++) {
    const url = URLS[i];
    const short = SHORT_URLS[i];

    // 1) Indexing API: getMetadata
    let indexingRec = "—";
    try {
      const r = await indexing.urlNotifications.getMetadata({ url });
      const remove = r.data.latestRemove?.notifyTime;
      const update = r.data.latestUpdate?.notifyTime;
      indexingRec = remove ? `removed @ ${remove}` : update ? `updated @ ${update}` : "(empty meta)";
    } catch (e) {
      const err = e as { code?: number };
      indexingRec = err.code === 404 ? "❌ NO record" : `error ${err.code}`;
    }

    // 2) URL Inspection
    let onGoogle = "?";
    let reason = "—";
    try {
      const r = await sc.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl: url,
          siteUrl: "sc-domain:modonty.com",
        },
      });
      const idx = r.data.inspectionResult?.indexStatusResult;
      const verdict = idx?.verdict ?? "?";
      const coverage = idx?.coverageState ?? "?";
      const indexingState = idx?.indexingState ?? "?";
      onGoogle = verdict === "PASS" ? "✅ INDEXED" : verdict === "NEUTRAL" ? "⚠️ NEUTRAL" : "❌ NOT indexed";
      reason = `${coverage} / ${indexingState}`;
    } catch (e) {
      const err = e as { code?: number; message?: string };
      onGoogle = `error ${err.code}`;
      reason = err.message ?? "";
    }

    console.log(`| ${i + 1} | ${short} | ${indexingRec} | ${onGoogle} | ${reason} |`);
  }

  console.log("\n## Summary");
  console.log("If most URLs show 'NOT indexed' → Removal Queue is showing already-de-indexed URLs.");
  console.log("If they show 'INDEXED' → URLs really do need to be removed and our API failure matters.");
}

main().catch((e) => console.error("Fail:", e));
