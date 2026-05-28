"use server";

import { submitSitemap, listSitemaps } from "@/lib/gsc/sitemaps";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

const KNOWN_SITEMAPS = ["/sitemap.xml", "/image-sitemap.xml"] as const;

export interface SitemapFreshnessStats {
  configured: boolean;
  totalKnown: number;
  staleCount: number;
  sample: Array<{ url: string; lastSubmitted: string | null; needsRefresh: boolean }>;
  freshnessThresholdHours: number;
}

const FRESHNESS_THRESHOLD_HOURS = 24;

function isStale(lastSubmitted: string | undefined, nowMs: number): boolean {
  if (!lastSubmitted) return true; // never submitted
  const last = new Date(lastSubmitted).getTime();
  if (Number.isNaN(last)) return true;
  return nowMs - last > FRESHNESS_THRESHOLD_HOURS * 60 * 60 * 1000;
}

async function getSiteBaseUrl(): Promise<string | null> {
  const settings = await getAllSettings();
  return settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? null;
}

export async function getSitemapFreshnessStats(): Promise<SitemapFreshnessStats> {
  const base = await getSiteBaseUrl();
  if (!base) {
    return {
      configured: false,
      totalKnown: KNOWN_SITEMAPS.length,
      staleCount: 0,
      sample: [],
      freshnessThresholdHours: FRESHNESS_THRESHOLD_HOURS,
    };
  }

  let submitted: Awaited<ReturnType<typeof listSitemaps>> = [];
  try {
    submitted = await listSitemaps();
  } catch {
    // GSC not configured / permission error — treat as configured=false
    return {
      configured: false,
      totalKnown: KNOWN_SITEMAPS.length,
      staleCount: 0,
      sample: [],
      freshnessThresholdHours: FRESHNESS_THRESHOLD_HOURS,
    };
  }

  const now = Date.now();
  const submittedByUrl = new Map(submitted.map((s) => [s.path, s.lastSubmitted]));

  const sample = KNOWN_SITEMAPS.map((path) => {
    const fullUrl = new URL(path, base).href;
    const last = submittedByUrl.get(fullUrl);
    return {
      url: fullUrl,
      lastSubmitted: last ?? null,
      needsRefresh: isStale(last, now),
    };
  });

  const staleCount = sample.filter((s) => s.needsRefresh).length;

  return {
    configured: true,
    totalKnown: KNOWN_SITEMAPS.length,
    staleCount,
    sample,
    freshnessThresholdHours: FRESHNESS_THRESHOLD_HOURS,
  };
}

export async function refreshAllSitemaps(): Promise<{
  attempted: number;
  successful: number;
  failed: number;
}> {
  const base = await getSiteBaseUrl();
  if (!base) return { attempted: 0, successful: 0, failed: 0 };

  const stats = await getSitemapFreshnessStats();
  if (!stats.configured) return { attempted: 0, successful: 0, failed: 0 };

  const stale = stats.sample.filter((s) => s.needsRefresh);
  let successful = 0;
  let failed = 0;
  for (const s of stale) {
    try {
      await submitSitemap(s.url);
      successful++;
    } catch {
      failed++;
    }
  }
  return { attempted: stale.length, successful, failed };
}
