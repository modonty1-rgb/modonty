import "server-only";

const PSI_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export type CWVRating = "good" | "needs-improvement" | "poor";
export type Strategy = "mobile" | "desktop";

export interface CWVMetric {
  value: number;
  rating: CWVRating;
  unit: string;
}

/** Element details extracted from Lighthouse audits — tells us if the issue
 *  is article-specific or template-wide (navbar/footer/scripts). */
export interface ElementDetail {
  selector: string;
  snippet: string;
  /** Heuristic — whether the selector looks like article content vs site template. */
  scope: "article" | "template" | "unknown";
}

export interface PageSpeedReport {
  url: string;
  strategy: Strategy;
  performanceScore: number; // 0-100
  lcp: CWVMetric | null; // Largest Contentful Paint (ms)
  cls: CWVMetric | null; // Cumulative Layout Shift (unitless)
  inp: CWVMetric | null; // Interaction to Next Paint (ms) — preferred over FID
  fid: CWVMetric | null; // First Input Delay (ms) — fallback
  fcp: CWVMetric | null; // First Contentful Paint (ms)
  ttfb: CWVMetric | null; // Time to First Byte (ms)
  /** The actual element identified as the LCP — knowing this lets the admin
   *  decide if the fix is in article content or the template. */
  lcpElement: ElementDetail | null;
  /** Elements that contributed to layout shift, sorted by impact. */
  clsElements: ElementDetail[];
  fetchedAt: string;
}

interface AuditValue {
  numericValue?: number;
  numericUnit?: string;
  details?: {
    type?: string;
    items?: Array<Record<string, unknown>>;
  };
}

interface PsiRawResponse {
  lighthouseResult?: {
    categories?: { performance?: { score?: number } };
    audits?: Record<string, AuditValue>;
  };
}

// In-memory cache to reduce repeated PSI calls (resets on server restart)
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const memoryCache = new Map<string, { report: PageSpeedReport; expiresAt: number }>();

function cacheKey(url: string, strategy: Strategy): string {
  return `${strategy}::${url}`;
}

export async function fetchPageSpeed(
  url: string,
  strategy: Strategy = "mobile",
  options: { forceRefresh?: boolean } = {},
): Promise<PageSpeedReport> {
  const key = cacheKey(url, strategy);

  if (!options.forceRefresh) {
    const cached = memoryCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.report;
    }
  }

  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  const params = new URLSearchParams({
    url,
    strategy,
    category: "performance",
  });
  if (apiKey) params.set("key", apiKey);

  const res = await fetch(`${PSI_BASE}?${params.toString()}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        apiKey
          ? "PageSpeed API quota exceeded for the day. Quota resets at midnight Pacific Time. Increase quota in Google Cloud Console if needed."
          : "PageSpeed API quota exceeded (anonymous limit: ~25/day). Set GOOGLE_PAGESPEED_API_KEY in admin/.env.local to get 25,000/day. See Cloud Console → APIs → Credentials.",
      );
    }
    const text = await res.text().catch(() => "");
    throw new Error(`PageSpeed API ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as PsiRawResponse;
  const audits = json.lighthouseResult?.audits ?? {};
  const score = json.lighthouseResult?.categories?.performance?.score ?? 0;

  const report: PageSpeedReport = {
    url,
    strategy,
    performanceScore: Math.round(score * 100),
    lcp: extractMetric(audits["largest-contentful-paint"], "ms", "lcp"),
    cls: extractMetric(audits["cumulative-layout-shift"], "score", "cls"),
    inp: extractMetric(audits["interaction-to-next-paint"], "ms", "inp"),
    fid: extractMetric(audits["max-potential-fid"], "ms", "fid"),
    fcp: extractMetric(audits["first-contentful-paint"], "ms", "fcp"),
    ttfb: extractMetric(audits["server-response-time"], "ms", "ttfb"),
    lcpElement: extractFirstElement(audits["largest-contentful-paint-element"]),
    clsElements: extractElements(audits["layout-shift-elements"]).slice(0, 5),
    fetchedAt: new Date().toISOString(),
  };

  memoryCache.set(key, { report, expiresAt: Date.now() + CACHE_TTL_MS });
  return report;
}

/**
 * Walk the audit details to find element nodes (LCP element + CLS-causing elements).
 * Lighthouse nests them in different shapes:
 *   - LCP: { items: [{ node: { selector, snippet } }] }
 *   - CLS: { items: [{ node: { selector, snippet }, score }] }
 */
function extractElements(audit: AuditValue | undefined): ElementDetail[] {
  if (!audit?.details?.items) return [];
  const out: ElementDetail[] = [];
  for (const item of audit.details.items) {
    const node = (item as { node?: Record<string, unknown> }).node;
    if (!node) continue;
    const selector = typeof node.selector === "string" ? node.selector : "";
    const snippet = typeof node.snippet === "string" ? node.snippet : "";
    if (!selector && !snippet) continue;
    out.push({
      selector,
      snippet: snippet.length > 200 ? snippet.slice(0, 200) + "..." : snippet,
      scope: classifyElementScope(selector, snippet),
    });
  }
  return out;
}

function extractFirstElement(audit: AuditValue | undefined): ElementDetail | null {
  return extractElements(audit)[0] ?? null;
}

/**
 * Heuristic — does this CSS selector / snippet look like article content
 * or site template (navbar/footer/sidebar)?
 */
function classifyElementScope(selector: string, snippet: string): ElementDetail["scope"] {
  const text = (selector + " " + snippet).toLowerCase();

  const templateHints = [
    "header",
    "navbar",
    "nav>",
    "nav ",
    "navigation",
    "footer",
    "sidebar",
    "logo",
    "menu",
    "modontylogo",
    "site-",
    "topbar",
  ];
  if (templateHints.some((h) => text.includes(h))) return "template";

  const articleHints = [
    "article",
    "post",
    "content",
    "featured",
    "hero",
    "body",
    "main",
    "h1",
  ];
  if (articleHints.some((h) => text.includes(h))) return "article";

  return "unknown";
}

function extractMetric(
  audit: AuditValue | undefined,
  unit: string,
  metric: "lcp" | "cls" | "inp" | "fid" | "fcp" | "ttfb",
): CWVMetric | null {
  if (!audit || typeof audit.numericValue !== "number") return null;
  const value = audit.numericValue;
  return {
    value,
    rating: rate(metric, value),
    unit: audit.numericUnit ?? unit,
  };
}

/**
 * Thresholds per Google web.dev — mobile-first.
 * https://web.dev/articles/vitals
 */
function rate(metric: "lcp" | "cls" | "inp" | "fid" | "fcp" | "ttfb", value: number): CWVRating {
  switch (metric) {
    case "lcp":
      return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
    case "cls":
      return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
    case "inp":
      return value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor";
    case "fid":
      return value <= 100 ? "good" : value <= 300 ? "needs-improvement" : "poor";
    case "fcp":
      return value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor";
    case "ttfb":
      return value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor";
  }
}

/** "All Core Web Vitals = good" → ready */
export function isCwvReady(report: PageSpeedReport): boolean {
  const lcpOk = report.lcp?.rating === "good";
  const clsOk = report.cls?.rating === "good";
  const inpOk = report.inp?.rating === "good" || report.fid?.rating === "good";
  return lcpOk && clsOk && inpOk;
}
