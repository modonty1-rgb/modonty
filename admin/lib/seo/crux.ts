import "server-only";

import type { CWVRating } from "./pagespeed";

const CRUX_BASE = "https://chromeuxreport.googleapis.com/v1/records:queryRecord";

export type CruxFormFactor = "PHONE" | "DESKTOP" | "TABLET" | "ALL_FORM_FACTORS";

export interface CruxMetric {
  /** 75th percentile value — what Google uses for "good"/"poor" assessment. */
  p75: number;
  rating: CWVRating;
  /** Distribution: % of users in good / needs-improvement / poor buckets. */
  good: number;
  needsImprovement: number;
  poor: number;
}

export interface CruxReport {
  /** "url" if exact URL has data, "origin" if fell back to site-wide data. */
  scope: "url" | "origin";
  /** The actual URL or origin returned. */
  reportedKey: string;
  formFactor: CruxFormFactor;
  /** 28-day collection period reported by CrUX. */
  collectionPeriod: { firstDate: string; lastDate: string } | null;
  lcp: CruxMetric | null;
  cls: CruxMetric | null;
  inp: CruxMetric | null;
  fcp: CruxMetric | null;
  ttfb: CruxMetric | null;
  fetchedAt: string;
}

interface CruxRawMetric {
  histogram?: Array<{ start?: number | string; end?: number | string; density?: number }>;
  percentiles?: { p75?: number | string };
}

interface CruxRawResponse {
  record?: {
    key?: { url?: string; origin?: string; formFactor?: string };
    metrics?: Record<string, CruxRawMetric>;
    collectionPeriod?: {
      firstDate?: { year?: number; month?: number; day?: number };
      lastDate?: { year?: number; month?: number; day?: number };
    };
  };
  urlNormalizationDetails?: { originalUrl?: string; normalizedUrl?: string };
}

/**
 * Fetch CrUX field data for a URL. Tries URL-level first; if no data
 * (low-traffic page), automatically falls back to origin-level data.
 *
 * Returns null if no data available at either level — common for very new pages.
 */
export async function fetchCruxReport(
  url: string,
  formFactor: CruxFormFactor = "PHONE",
): Promise<CruxReport | null> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY; // Same key works once CrUX API is enabled

  // Try URL-level first
  const urlReport = await queryCrux({ url, formFactor }, apiKey);
  if (urlReport) return urlReport;

  // Fall back to origin-level
  const origin = (() => {
    try {
      return new URL(url).origin;
    } catch {
      return null;
    }
  })();
  if (!origin) return null;

  const originReport = await queryCrux({ origin, formFactor }, apiKey);
  return originReport;
}

async function queryCrux(
  body: { url?: string; origin?: string; formFactor: CruxFormFactor },
  apiKey: string | undefined,
): Promise<CruxReport | null> {
  const params = new URLSearchParams();
  if (apiKey) params.set("key", apiKey);

  const res = await fetch(`${CRUX_BASE}?${params.toString()}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      ...(body.url ? { url: body.url } : { origin: body.origin }),
      formFactor: body.formFactor,
      metrics: [
        "largest_contentful_paint",
        "cumulative_layout_shift",
        "interaction_to_next_paint",
        "first_contentful_paint",
        "experimental_time_to_first_byte",
      ],
    }),
  });

  if (res.status === 404) {
    // No data for this URL/origin yet — common for new pages
    return null;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 403) {
      // Both "not enabled" and "blocked" responses mean the API needs to be turned on.
      throw new Error(
        "CrUX API is disabled. Enable 'Chrome UX Report API' at https://console.cloud.google.com/apis/library/chromeuxreport.googleapis.com — wait 30s, then retry.",
      );
    }
    throw new Error(`CrUX API ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as CruxRawResponse;
  const record = json.record;
  if (!record?.metrics) return null;

  const isUrlScope = !!record.key?.url;
  const reportedKey = record.key?.url ?? record.key?.origin ?? "";

  const period = record.collectionPeriod
    ? {
        firstDate: formatDate(record.collectionPeriod.firstDate),
        lastDate: formatDate(record.collectionPeriod.lastDate),
      }
    : null;

  return {
    scope: isUrlScope ? "url" : "origin",
    reportedKey,
    formFactor: body.formFactor,
    collectionPeriod: period,
    lcp: extractCruxMetric(record.metrics["largest_contentful_paint"], "lcp"),
    cls: extractCruxMetric(record.metrics["cumulative_layout_shift"], "cls"),
    inp: extractCruxMetric(record.metrics["interaction_to_next_paint"], "inp"),
    fcp: extractCruxMetric(record.metrics["first_contentful_paint"], "fcp"),
    ttfb: extractCruxMetric(record.metrics["experimental_time_to_first_byte"], "ttfb"),
    fetchedAt: new Date().toISOString(),
  };
}

function formatDate(d: { year?: number; month?: number; day?: number } | undefined): string {
  if (!d?.year || !d?.month || !d?.day) return "";
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

function extractCruxMetric(
  raw: CruxRawMetric | undefined,
  metric: "lcp" | "cls" | "inp" | "fcp" | "ttfb",
): CruxMetric | null {
  if (!raw) return null;

  // p75 — Google's official threshold for "is this URL fast?"
  const p75Raw = raw.percentiles?.p75;
  const p75 = typeof p75Raw === "number" ? p75Raw : Number(p75Raw);
  if (!Number.isFinite(p75)) return null;

  // Histogram: 3 buckets (good / needs-improvement / poor)
  const hist = raw.histogram ?? [];
  const good = (hist[0]?.density ?? 0) * 100;
  const needsImprovement = (hist[1]?.density ?? 0) * 100;
  const poor = (hist[2]?.density ?? 0) * 100;

  return {
    p75,
    rating: rate(metric, p75),
    good,
    needsImprovement,
    poor,
  };
}

function rate(
  metric: "lcp" | "cls" | "inp" | "fcp" | "ttfb",
  value: number,
): CWVRating {
  switch (metric) {
    case "lcp":
      return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
    case "cls":
      return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
    case "inp":
      return value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor";
    case "fcp":
      return value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor";
    case "ttfb":
      return value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor";
  }
}

export function isCruxReady(report: CruxReport | null): boolean {
  if (!report) return false;
  const lcpOk = report.lcp?.rating === "good";
  const clsOk = report.cls?.rating === "good";
  const inpOk = report.inp?.rating === "good";
  return lcpOk && clsOk && inpOk;
}
