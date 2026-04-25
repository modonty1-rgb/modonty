import { db } from "@/lib/db";

import { inspectUrl } from "./inspection";

const TTL_DAYS = 7;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

export interface InspectionRecord {
  url: string;
  verdict: string | null;
  coverageState: string | null;
  robotsTxtState: string | null;
  indexingState: string | null;
  pageFetchState: string | null;
  userCanonical: string | null;
  googleCanonical: string | null;
  mobileVerdict: string | null;
  mobileIssues: string[];
  lastCrawlTime: Date | null;
  crawledAs: string | null;
  sitemap: string[];
  inspectedAt: Date;
  expiresAt: Date;
  /** True if the cached row is still valid (expiresAt > now). */
  isFresh: boolean;
}

/** Read cached inspection without hitting the API. Returns null if not cached. */
export async function getCachedInspection(url: string): Promise<InspectionRecord | null> {
  const row = await db.gscUrlInspection.findUnique({ where: { url } });
  if (!row) return null;
  return rowToRecord(row);
}

/** Inspect a URL using cache when fresh; refresh from API otherwise. */
export async function inspectWithCache(
  url: string,
  options: { forceRefresh?: boolean } = {},
): Promise<InspectionRecord> {
  if (!options.forceRefresh) {
    const cached = await getCachedInspection(url);
    if (cached?.isFresh) return cached;
  }
  return refreshInspection(url);
}

/** Always hit the GSC API and upsert the cache row. */
export async function refreshInspection(url: string): Promise<InspectionRecord> {
  const result = await inspectUrl(url);
  const idx = result.indexStatusResult;
  const mobile = result.mobileUsabilityResult;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + TTL_MS);

  const data = {
    verdict: idx?.verdict ?? null,
    coverageState: idx?.coverageState ?? null,
    robotsTxtState: idx?.robotsTxtState ?? null,
    indexingState: idx?.indexingState ?? null,
    pageFetchState: idx?.pageFetchState ?? null,
    userCanonical: idx?.userCanonical ?? null,
    googleCanonical: idx?.googleCanonical ?? null,
    mobileVerdict: mobile?.verdict ?? null,
    mobileIssues: [],
    lastCrawlTime: idx?.lastCrawlTime ? new Date(idx.lastCrawlTime) : null,
    crawledAs: idx?.crawledAs ?? null,
    sitemap: idx?.sitemap ?? [],
    rawJson: result as unknown as object,
    inspectedAt: now,
    expiresAt,
  };

  const row = await db.gscUrlInspection.upsert({
    where: { url },
    update: data,
    create: { url, ...data },
  });

  return rowToRecord(row);
}

/** Bulk inspect: prefers cache, falls back to API for stale/missing. Throttled to respect quota. */
export async function bulkInspect(
  urls: string[],
  options: { forceRefresh?: boolean; concurrency?: number; onProgress?: (done: number, total: number) => void } = {},
): Promise<{ results: InspectionRecord[]; errors: { url: string; message: string }[] }> {
  const concurrency = options.concurrency ?? 3;
  const results: InspectionRecord[] = [];
  const errors: { url: string; message: string }[] = [];
  let done = 0;

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      batch.map((url) => inspectWithCache(url, { forceRefresh: options.forceRefresh })),
    );
    for (let j = 0; j < settled.length; j++) {
      const res = settled[j];
      if (res.status === "fulfilled") {
        results.push(res.value);
      } else {
        errors.push({
          url: batch[j],
          message: res.reason instanceof Error ? res.reason.message : "Unknown error",
        });
      }
      done += 1;
      options.onProgress?.(done, urls.length);
    }
  }

  return { results, errors };
}

/** Read all cached inspections (used by /search-console Coverage tab). */
export async function getAllCachedInspections(): Promise<InspectionRecord[]> {
  const rows = await db.gscUrlInspection.findMany({
    orderBy: { inspectedAt: "desc" },
  });
  return rows.map(rowToRecord);
}

/** Bulk lookup by URL list — for joining inspection data with GSC top pages. */
export async function getCachedInspectionsByUrls(urls: string[]): Promise<Map<string, InspectionRecord>> {
  if (urls.length === 0) return new Map();
  const rows = await db.gscUrlInspection.findMany({
    where: { url: { in: urls } },
  });
  return new Map(rows.map((r) => [r.url, rowToRecord(r)]));
}

/** Lightweight summary used by the Dashboard "Technical issues" row. */
export interface TechHealthSummary {
  inspected: number;
  canonicalIssues: number;
  robotsBlocked: number;
  mobileFailures: number;
  softFourOhFour: number;
}

export async function getTechHealthSummary(): Promise<TechHealthSummary> {
  const rows = await db.gscUrlInspection.findMany({
    select: {
      userCanonical: true,
      googleCanonical: true,
      robotsTxtState: true,
      mobileVerdict: true,
      pageFetchState: true,
    },
  });
  let canonicalIssues = 0;
  let robotsBlocked = 0;
  let mobileFailures = 0;
  let softFourOhFour = 0;
  for (const r of rows) {
    if (r.userCanonical && r.googleCanonical && r.userCanonical !== r.googleCanonical) canonicalIssues += 1;
    if (r.robotsTxtState === "DISALLOWED") robotsBlocked += 1;
    if (r.mobileVerdict === "FAIL") mobileFailures += 1;
    if (r.pageFetchState === "SOFT_404") softFourOhFour += 1;
  }
  return {
    inspected: rows.length,
    canonicalIssues,
    robotsBlocked,
    mobileFailures,
    softFourOhFour,
  };
}

function rowToRecord(row: {
  url: string;
  verdict: string | null;
  coverageState: string | null;
  robotsTxtState: string | null;
  indexingState: string | null;
  pageFetchState: string | null;
  userCanonical: string | null;
  googleCanonical: string | null;
  mobileVerdict: string | null;
  mobileIssues: string[];
  lastCrawlTime: Date | null;
  crawledAs: string | null;
  sitemap: string[];
  inspectedAt: Date;
  expiresAt: Date;
}): InspectionRecord {
  return {
    url: row.url,
    verdict: row.verdict,
    coverageState: row.coverageState,
    robotsTxtState: row.robotsTxtState,
    indexingState: row.indexingState,
    pageFetchState: row.pageFetchState,
    userCanonical: row.userCanonical,
    googleCanonical: row.googleCanonical,
    mobileVerdict: row.mobileVerdict,
    mobileIssues: row.mobileIssues,
    lastCrawlTime: row.lastCrawlTime,
    crawledAs: row.crawledAs,
    sitemap: row.sitemap,
    inspectedAt: row.inspectedAt,
    expiresAt: row.expiresAt,
    isFresh: row.expiresAt.getTime() > Date.now(),
  };
}
