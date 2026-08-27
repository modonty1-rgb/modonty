/**
 * Guard for SEOADM-GSC-FAKE-ALLCLEAR (the two items left open by the audit).
 *
 * Fails when the SEO-health surface reports a measurement it never made:
 *  1. an error TREND with a fabricated previous period (previousCount = 0 -> "+100%")
 *  2. a green "no errors" all-clear rendered after Search Console could not be read
 *  3. dead code left behind (generateEmailHTML) or `any[]` on the page
 *
 * Run it yourself:  cd admin && ./node_modules/.bin/tsx scripts/_guard-gsc-fake-allclear.ts
 * Exit 0 = green. Untracked on purpose — it is a verification command, not shipped code.
 */
import { readFileSync } from "node:fs";

import * as searchConsole from "../lib/seo/search-console-api";
import type { StructuredDataError } from "../lib/seo/search-console-api";

const ROOT = "C:/Users/w2nad/Desktop/dreamToApp/MODONTY";
const FILES = {
  api: `${ROOT}/admin/lib/seo/search-console-api.ts`,
  section: `${ROOT}/admin/app/(dashboard)/seo-health/components/search-console-errors-section.tsx`,
  page: `${ROOT}/admin/app/(dashboard)/seo-health/page.tsx`,
  alerts: `${ROOT}/admin/lib/seo/alert-system.ts`,
  report: `${ROOT}/admin/lib/seo/weekly-report-generator.ts`,
};

const failures: string[] = [];
const fail = (msg: string) => failures.push(msg);
const read = (p: string) => readFileSync(p, "utf8");

// ---------- 1. runtime: the trend shape itself ----------
const sample: StructuredDataError[] = [
  { url: "https://modonty.com/a", type: "Article", severity: "ERROR", description: "x", firstDetected: new Date() },
  { url: "https://modonty.com/b", type: "Article", severity: "WARNING", description: "y", firstDetected: new Date() },
  { url: "https://modonty.com/c", type: "BreadcrumbList", severity: "ERROR", description: "z", firstDetected: new Date() },
];

const buildErrorTrends = (searchConsole as Record<string, unknown>).buildErrorTrends;

if (typeof buildErrorTrends !== "function") {
  fail("search-console-api.ts exports no `buildErrorTrends` — the trend shape is unreachable and untestable");
} else {
  const trends = buildErrorTrends(sample) as Array<{
    errorType: string;
    currentCount: number;
    previousCount: number | null;
    trend: string;
    changePercentage: number | null;
  }>;

  if (trends.length !== 2) fail(`buildErrorTrends: expected 2 error types, got ${trends.length}`);

  const article = trends.find((t) => t.errorType === "Article");
  if (!article) fail("buildErrorTrends: missing the Article group");
  else if (article.currentCount !== 2) fail(`buildErrorTrends: Article currentCount = ${article.currentCount}, expected 2`);

  for (const t of trends) {
    if (t.previousCount !== null) {
      fail(`FABRICATED: "${t.errorType}" reports previousCount = ${t.previousCount}; the previous period is never read -> must be null`);
    }
    if (t.changePercentage !== null) {
      fail(`FABRICATED: "${t.errorType}" reports changePercentage = ${t.changePercentage}; nothing was compared -> must be null`);
    }
    if (t.trend !== "not-measured") {
      fail(`FABRICATED: "${t.errorType}" claims trend "${t.trend}" with no previous period -> must be "not-measured"`);
    }
  }
}

// ---------- 2. source: no placeholder previous period ----------
const api = read(FILES.api);
if (/previousCount\s*=\s*0/.test(api)) fail("search-console-api.ts still hard-codes `previousCount = 0`");
if (/Placeholder/i.test(api)) fail("search-console-api.ts still carries a `Placeholder` measurement");

// ---------- 3. UI: never prints a number it did not measure ----------
const section = read(FILES.section);
if (/changePercentage\.toFixed/.test(section) && !/changePercentage\s*!==\s*null/.test(section)) {
  fail("errors-section renders changePercentage without a null guard");
}
if (!/not measured/i.test(section)) fail("errors-section has no `not measured` state for the previous period");
if (/Last 30 Days/.test(section)) fail("errors-section still claims a 30-day window that is never queried");

// ---------- 4. page: no fake all-clear, no `any` ----------
const page = read(FILES.page);
if (/:\s*any\[\]/.test(page)) fail("seo-health/page.tsx still declares `any[]`");
if (/catch\s*\([\s\S]{0,400}?searchConsoleErrors\s*=\s*\[\]/.test(page)) {
  fail("seo-health/page.tsx swallows a Search Console failure into an empty error list (fake all-clear)");
}
if (!/"unavailable"/.test(page)) fail("seo-health/page.tsx has no `unavailable` state — a failed read still renders as measured");

// ---------- 5. dead code ----------
const alerts = read(FILES.alerts);
// A prose mention in a comment is not dead code; a definition or a call is.
if (/function\s+generateEmailHTML/.test(alerts) || /generateEmailHTML\s*\(/.test(alerts)) {
  fail("alert-system.ts still holds dead `generateEmailHTML` (zero consumers)");
}

// ---------- 6. weekly report must not claim a scoped window ----------
const report = read(FILES.report);
if (/Only `errorTrends` is actually scoped to the window/.test(report)) {
  fail("weekly-report-generator.ts claims errorTrends is scoped to the report window — it is not scoped at all");
}

if (failures.length > 0) {
  console.error(`FAIL: ${failures.length} fabricated-measurement issue(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("PASS: error trends report `not-measured` instead of a fabricated previous period; no fake all-clear; no dead email template");
process.exit(0);
