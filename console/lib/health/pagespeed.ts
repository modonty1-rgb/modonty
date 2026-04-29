/**
 * Google PageSpeed Insights API integration.
 *
 * Free quota: 25,000 requests/day with API key.
 *
 * Two exports:
 *  - getPagespeedScores(url) → raw 4 Google scores (0-100) for direct display
 *  - checkCoreWebVitals(url) → CWV (LCP/CLS/FCP) as pass/warn/fail checks
 */

import type { HealthCheckResult } from "./types";

const TIMEOUT_MS = 60_000;

interface PsiResponse {
  lighthouseResult?: {
    categories?: {
      performance?: { score?: number };
      accessibility?: { score?: number };
      "best-practices"?: { score?: number };
      seo?: { score?: number };
    };
    audits?: {
      "largest-contentful-paint"?: { numericValue?: number; displayValue?: string };
      "first-contentful-paint"?: { numericValue?: number; displayValue?: string };
      "cumulative-layout-shift"?: { numericValue?: number; displayValue?: string };
      "total-blocking-time"?: { numericValue?: number; displayValue?: string };
      "speed-index"?: { numericValue?: number; displayValue?: string };
    };
  };
}

export interface PagespeedStrategyScores {
  available: boolean;
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
  cwv: {
    lcpMs: number | null;
    lcpDisplay: string | null;
    clsValue: number | null;
    clsDisplay: string | null;
    fcpMs: number | null;
    fcpDisplay: string | null;
  };
  error?: string;
}

export interface PagespeedScores {
  mobile: PagespeedStrategyScores;
  desktop: PagespeedStrategyScores;
}

function getApiKey(): string | null {
  return process.env.GOOGLE_PAGESPEED_API_KEY ?? null;
}

function buildPsiUrl(
  target: string,
  apiKey: string,
  strategy: "mobile" | "desktop"
): string {
  const u = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  u.searchParams.set("url", target);
  u.searchParams.set("key", apiKey);
  u.searchParams.set("strategy", strategy);
  u.searchParams.append("category", "performance");
  u.searchParams.append("category", "accessibility");
  u.searchParams.append("category", "best-practices");
  u.searchParams.append("category", "seo");
  return u.toString();
}

function emptyStrategy(error?: string): PagespeedStrategyScores {
  return {
    available: false,
    performance: null,
    accessibility: null,
    bestPractices: null,
    seo: null,
    cwv: {
      lcpMs: null,
      lcpDisplay: null,
      clsValue: null,
      clsDisplay: null,
      fcpMs: null,
      fcpDisplay: null,
    },
    error,
  };
}

async function fetchOneStrategy(
  url: string,
  strategy: "mobile" | "desktop"
): Promise<PagespeedStrategyScores> {
  const apiKey = getApiKey();
  if (!apiKey) return emptyStrategy("API key غير مهيأ");

  const target = url.startsWith("http") ? url : `https://${url}`;

  try {
    const res = await fetch(buildPsiUrl(target, apiKey, strategy), {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return emptyStrategy(`HTTP ${res.status}`);
    const data = (await res.json()) as PsiResponse;
    const lh = data.lighthouseResult;
    if (!lh) return emptyStrategy("lighthouseResult missing");

    const cat = lh.categories;
    const aud = lh.audits;

    const norm = (s: number | null | undefined): number | null =>
      s == null ? null : Math.round(s * 100);

    return {
      available: true,
      performance: norm(cat?.performance?.score),
      accessibility: norm(cat?.accessibility?.score),
      bestPractices: norm(cat?.["best-practices"]?.score),
      seo: norm(cat?.seo?.score),
      cwv: {
        lcpMs: aud?.["largest-contentful-paint"]?.numericValue ?? null,
        lcpDisplay: aud?.["largest-contentful-paint"]?.displayValue ?? null,
        clsValue: aud?.["cumulative-layout-shift"]?.numericValue ?? null,
        clsDisplay: aud?.["cumulative-layout-shift"]?.displayValue ?? null,
        fcpMs: aud?.["first-contentful-paint"]?.numericValue ?? null,
        fcpDisplay: aud?.["first-contentful-paint"]?.displayValue ?? null,
      },
    };
  } catch (err) {
    return emptyStrategy(err instanceof Error ? err.message : "fetch failed");
  }
}

/**
 * Fetch Google PageSpeed scores for BOTH mobile and desktop in parallel.
 */
export async function getPagespeedScores(url: string): Promise<PagespeedScores> {
  const [mobile, desktop] = await Promise.all([
    fetchOneStrategy(url, "mobile"),
    fetchOneStrategy(url, "desktop"),
  ]);
  return { mobile, desktop };
}

/**
 * Convert Core Web Vitals values into pass/warn/fail health checks.
 * Used by aggregator for Modonty's own scoring.
 */
function lcpStatus(ms: number | null): HealthCheckResult["status"] {
  if (ms == null) return "skip";
  if (ms <= 2500) return "pass";
  if (ms <= 4000) return "warn";
  return "fail";
}
function clsStatus(v: number | null): HealthCheckResult["status"] {
  if (v == null) return "skip";
  if (v <= 0.1) return "pass";
  if (v <= 0.25) return "warn";
  return "fail";
}
function fcpStatus(ms: number | null): HealthCheckResult["status"] {
  if (ms == null) return "skip";
  if (ms <= 1800) return "pass";
  if (ms <= 3000) return "warn";
  return "fail";
}

export async function checkCoreWebVitals(
  url: string,
  prefetched?: PagespeedScores
): Promise<HealthCheckResult[]> {
  const data = prefetched ?? (await getPagespeedScores(url));
  // Use mobile CWV for the Modonty health checks (mobile is the priority for CWV)
  const m = data.mobile;
  if (!m.available) {
    return [
      {
        metric: "cwv_unavailable",
        status: "skip",
        message: m.error ? `PageSpeed: ${m.error}` : "PageSpeed غير متاح",
      },
    ];
  }
  return [
    {
      metric: "cwv_lcp",
      status: lcpStatus(m.cwv.lcpMs),
      value: { ms: m.cwv.lcpMs },
      message: `LCP (موبايل): ${m.cwv.lcpDisplay ?? "غير متاح"}`,
      recommendation:
        lcpStatus(m.cwv.lcpMs) !== "pass" && m.cwv.lcpMs != null
          ? "يفضّل LCP أقل من 2.5 ثانية — حسّن صور القائمة + lazy loading"
          : undefined,
    },
    {
      metric: "cwv_cls",
      status: clsStatus(m.cwv.clsValue),
      value: { value: m.cwv.clsValue },
      message: `CLS (موبايل): ${m.cwv.clsDisplay ?? "غير متاح"}`,
      recommendation:
        clsStatus(m.cwv.clsValue) !== "pass" && m.cwv.clsValue != null
          ? "يفضّل CLS أقل من 0.1 — احجز مساحة الصور والـ embeds"
          : undefined,
    },
    {
      metric: "cwv_fcp",
      status: fcpStatus(m.cwv.fcpMs),
      value: { ms: m.cwv.fcpMs },
      message: `FCP (موبايل): ${m.cwv.fcpDisplay ?? "غير متاح"}`,
    },
  ];
}
