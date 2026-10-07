import "server-only";

import type { CWVRating } from "./pagespeed";

/**
 * CrUX History API — real Chrome visitors, one 28-day window per week, up to 40 weeks back.
 * Docs: https://developer.chrome.com/docs/crux/history-api
 *   «collectionPeriodCount … between 1 and 40. The default is 25»
 *   «updated each Monday around 04:00 UTC and contains data up until the previous Saturday»
 *   percentiles «can be numbers or strings», `null` when a period had too few visitors;
 *   histogram densities are `"NaN"` then.
 */
const CRUX_HISTORY = "https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord";

export type CruxDevice = "PHONE" | "DESKTOP";
export type CwvKey = "lcp" | "inp" | "cls";

const METRIC_NAME: Record<CwvKey, string> = {
  lcp: "largest_contentful_paint",
  inp: "interaction_to_next_paint",
  cls: "cumulative_layout_shift",
};

export interface CwvValue {
  /** 75th percentile — the number Google judges a site by. */
  p75: number;
  rating: CWVRating;
  /** Share of visits in the «good» bucket, 0–100. */
  goodShare: number;
}

export interface CruxPeriod {
  /** Last day of the 28-day window, YYYY-MM-DD. */
  end: string;
  lcp: CwvValue | null;
  inp: CwvValue | null;
  cls: CwvValue | null;
}

interface RawDate { year: number; month: number; day: number }
interface RawHistory {
  record?: {
    collectionPeriods?: Array<{ firstDate: RawDate; lastDate: RawDate }>;
    metrics?: Record<
      string,
      {
        histogramTimeseries?: Array<{ densities?: Array<number | string> }>;
        percentilesTimeseries?: { p75s?: Array<number | string | null> };
      }
    >;
  };
}

/** Google's Core Web Vitals thresholds (web.dev/articles/vitals). */
function rateCwv(metric: CwvKey, value: number): CWVRating {
  if (metric === "lcp") return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
  if (metric === "inp") return value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor";
  return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
}

/**
 * Weekly periods for an origin or one URL, oldest first. `null` = Google has no record at all
 * (HTTP 404: too few Chrome visitors for that key) — expected for single pages on a young site.
 */
export async function fetchCruxHistory(
  key: { origin: string } | { url: string },
  device: CruxDevice,
  periods = 40,
): Promise<CruxPeriod[] | null> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY; // same Cloud key; Chrome UX Report API enabled on it
  if (!apiKey) throw new Error("GOOGLE_PAGESPEED_API_KEY is not set");

  const res = await fetch(`${CRUX_HISTORY}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...key,
      formFactor: device,
      collectionPeriodCount: periods,
      metrics: Object.values(METRIC_NAME),
    }),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CrUX History API ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

  const record = ((await res.json()) as RawHistory).record;
  const windows = record?.collectionPeriods ?? [];
  const metrics = record?.metrics ?? {};

  const valueAt = (metric: CwvKey, i: number): CwvValue | null => {
    const m = metrics[METRIC_NAME[metric]];
    const p75 = Number(m?.percentilesTimeseries?.p75s?.[i]);
    if (m?.percentilesTimeseries?.p75s?.[i] == null || !Number.isFinite(p75)) return null;
    const good = Number(m?.histogramTimeseries?.[0]?.densities?.[i]);
    return { p75, rating: rateCwv(metric, p75), goodShare: Number.isFinite(good) ? good * 100 : 0 };
  };

  return windows.map((w, i) => ({
    end: `${w.lastDate.year}-${String(w.lastDate.month).padStart(2, "0")}-${String(w.lastDate.day).padStart(2, "0")}`,
    lcp: valueAt("lcp", i),
    inp: valueAt("inp", i),
    cls: valueAt("cls", i),
  }));
}
