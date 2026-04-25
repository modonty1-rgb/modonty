import { unstable_cache } from "next/cache";
import {
  getTopQueries,
  getTopPages,
  getPerformanceTotals,
  getPerformanceByDate,
} from "./analytics";

const TAG = "gsc-dashboard";
const REVALIDATE = 60 * 60 * 3; // 3 hours — GSC data is delayed 2–3 days anyway

export const getCachedTopQueries = unstable_cache(
  async (days: number, limit: number) => getTopQueries(days, limit),
  ["gsc:top-queries"],
  { revalidate: REVALIDATE, tags: [TAG] },
);

export const getCachedTopPages = unstable_cache(
  async (days: number, limit: number) => getTopPages(days, limit),
  ["gsc:top-pages"],
  { revalidate: REVALIDATE, tags: [TAG] },
);

export const getCachedPerformanceTotals = unstable_cache(
  async (days: number) => getPerformanceTotals(days),
  ["gsc:performance-totals"],
  { revalidate: REVALIDATE, tags: [TAG] },
);

export const getCachedPerformanceByDate = unstable_cache(
  async (days: number) => getPerformanceByDate(days),
  ["gsc:performance-by-date"],
  { revalidate: REVALIDATE, tags: [TAG] },
);
