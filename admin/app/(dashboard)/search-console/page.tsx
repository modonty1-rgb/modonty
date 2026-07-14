import {
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { db } from "@/lib/db";
import { getCachedTopPages } from "@/lib/gsc/cached";
import { parseUrl } from "@/lib/gsc/coverage";
import { getCachedInspectionsByUrls, type InspectionRecord } from "@/lib/gsc/inspection-cache";
import { fetchAndParseSitemap } from "@/lib/gsc/parse-sitemap";

import { BackgroundInspector } from "./components/background-inspector";
import { SitemapManager } from "./components/sitemap-manager";
import { RobotsValidator } from "./components/robots-validator";
import { ForceRefreshButton } from "./components/force-refresh-button";
import { type UrlRow } from "./components/urls-data-table";
import { UrlsTabs } from "./components/urls-tabs";
import { RemovalQueueCard, type RemovalRow } from "./components/removal-queue-card";
import { getRemovalTrackStates } from "./actions/removal-tracking-actions";

// Source of truth — hardcoded live PROD sitemap. Never local, never staging, never DB.
const PROD_SITEMAP_URL = "https://www.modonty.com/sitemap.xml";

type SimpleStatus = UrlRow["status"];

function classify(i: InspectionRecord | null): SimpleStatus {
  if (!i) return "Pending check";

  // Indexed wins first
  if (i.verdict === "PASS") return "Indexed";
  if (i.verdict === "PARTIAL") return "Indexed (with notes)";

  // Anything broken / explicitly blocked → Blocked
  if (i.verdict === "FAIL") return "Blocked";
  if (
    i.pageFetchState === "SERVER_ERROR" ||
    i.pageFetchState === "NOT_FOUND" ||
    i.pageFetchState === "ACCESS_DENIED" ||
    i.pageFetchState === "ACCESS_FORBIDDEN" ||
    i.pageFetchState === "BLOCKED_ROBOTS_TXT" ||
    i.pageFetchState === "BLOCKED_4XX" ||
    i.pageFetchState === "SOFT_404"
  ) {
    return "Blocked";
  }
  if (i.robotsTxtState === "DISALLOWED") return "Blocked";
  if (
    i.indexingState === "BLOCKED_BY_META_TAG" ||
    i.indexingState === "BLOCKED_BY_HTTP_HEADER"
  ) {
    return "Blocked";
  }

  // Otherwise = Google knows but hasn't indexed yet
  return "Unknown";
}

function safeDecode(url: string): string {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

function formatRelative(date: Date): string {
  const ms = Date.now() - date.getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

export default async function SearchConsolePage() {
  // 1) Live sitemap fetch — every page load, no cache
  const sitemap = await fetchAndParseSitemap(PROD_SITEMAP_URL).catch(() => ({
    entries: [] as Array<{ loc: string }>,
  }));
  const sitemapUrls = sitemap.entries.map((e) => e.loc);

  // 2) Read Google's cached responses (24h TTL — only Google data, no enrichment)
  const inspectionMap = await getCachedInspectionsByUrls(sitemapUrls);

  // 3) Identify stale URLs for background refresh
  const staleUrls = sitemapUrls.filter((url) => {
    const cached = inspectionMap.get(url);
    return !cached || !cached.isFresh;
  });

  // 4) Aggregate Google's response into the view model
  const total = sitemapUrls.length;
  let indexed = 0;
  let pendingCheck = 0;
  const reasonsBucket = new Map<string, string[]>(); // coverageState → URL list

  const rows: UrlRow[] = sitemapUrls.map((url) => {
    const i = inspectionMap.get(url) ?? null;
    const status = classify(i);
    if (status === "Indexed" || status === "Indexed (with notes)") {
      indexed += 1;
    } else if (status === "Pending check") {
      pendingCheck += 1;
    } else if (i) {
      const reason = i.coverageState ?? "Unknown";
      const list = reasonsBucket.get(reason) ?? [];
      list.push(url);
      reasonsBucket.set(reason, list);
    }
    return {
      id: url,
      url,
      decoded: safeDecode(url),
      status,
      rawVerdict: i?.verdict ?? null,
      reason: i?.coverageState ?? null,
      lastCrawl: i?.lastCrawlTime ? i.lastCrawlTime.toISOString() : null,
      checkedAt: i?.inspectedAt ? i.inspectedAt.toISOString() : null,
    };
  });
  const notIndexed = total - indexed - pendingCheck;
  const reasons = Array.from(reasonsBucket.entries())
    .map(([reason, urls]) => ({ reason, count: urls.length, urls }))
    .sort((a, b) => b.count - a.count);

  // Freshness of the freshest cache entry (proxy for "page data freshness")
  const lastRefreshAt = rows.reduce<Date | null>((latest, r) => {
    if (!r.checkedAt) return latest;
    const d = new Date(r.checkedAt);
    if (!latest || d > latest) return d;
    return latest;
  }, null);

  // ── REMOVAL QUEUE — DB-driven (separate concern from sitemap-as-truth) ────
  // URLs Google indexes (top pages 28d) but DB says are missing or ARCHIVED.
  // These leaked URLs need manual GSC removal — sitemap doesn't surface them.
  const topPages = await getCachedTopPages(28, 1000).catch(() => []);
  const articleSlugsInTopPages = new Set<string>();
  for (const row of topPages) {
    const url = row.keys?.[0];
    if (!url) continue;
    const info = parseUrl(url);
    if (info.type === "article" && info.slug) articleSlugsInTopPages.add(info.slug);
  }
  const articlesInTopPages = articleSlugsInTopPages.size > 0
    ? await db.article.findMany({
        where: { slug: { in: [...articleSlugsInTopPages] } },
        select: { slug: true, status: true },
      })
    : [];
  const articleStatusBySlug = new Map(articlesInTopPages.map((a) => [a.slug, a.status]));

  const removalRows: RemovalRow[] = [];
  for (const row of topPages) {
    const url = row.keys?.[0];
    if (!url) continue;
    const info = parseUrl(url);
    if (info.type !== "article" || !info.slug) continue;
    const status = articleStatusBySlug.get(info.slug);
    let dbStatus: RemovalRow["dbStatus"] | null = null;
    if (!status) dbStatus = "missing";
    else if (status === "ARCHIVED") dbStatus = "ARCHIVED";
    if (!dbStatus) continue;
    removalRows.push({
      url,
      decoded: safeDecode(url),
      dbStatus,
      impressions: row.impressions,
      clicks: row.clicks,
    });
  }
  removalRows.sort((a, b) => b.impressions - a.impressions);
  const removalTrackStates = await getRemovalTrackStates(removalRows.map((r) => r.url));

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold leading-tight">Search Console</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Live truth from Google — no database, no guesses.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Google's Generative AI performance report (impressions in AI Overviews/AI Mode,
              launched 2026-06) is UI-only — no API exposes it, so we deep-link instead. */}
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Generative AI report
            <ExternalLink className="h-3 w-3" />
          </a>
          <BackgroundInspector staleUrls={staleUrls} />
          <ForceRefreshButton urls={sitemapUrls} />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                Sitemap URL
              </div>
              <a
                href={PROD_SITEMAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs break-all inline-flex items-center gap-1 mt-1"
              >
                {PROD_SITEMAP_URL}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                URLs in sitemap
              </div>
              <div className="text-2xl font-extrabold tabular-nums mt-1">{total}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                Last Google check
              </div>
              <div className="text-sm font-medium mt-1 inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {lastRefreshAt
                  ? `${formatRelative(lastRefreshAt)} ago`
                  : <span className="text-amber-600">Never</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Google Indexing Status</CardTitle>
          <p className="text-xs text-muted-foreground">
            Each URL checked with Google&apos;s URL Inspection API. Refreshes every 24 hours.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Indexed by Google
              </div>
              <div className="text-3xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
                {indexed}
                <span className="text-base font-medium text-muted-foreground"> / {total}</span>
              </div>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide font-medium">
                <XCircle className="h-4 w-4 text-amber-500" />
                Not Indexed
              </div>
              <div className="text-3xl font-extrabold tabular-nums text-amber-600 dark:text-amber-400 mt-1">
                {notIndexed}
                <span className="text-base font-medium text-muted-foreground"> / {total}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                See reasons below
              </p>
            </div>
            <div className="rounded-lg border border-slate-500/20 bg-slate-500/5 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide font-medium">
                <Clock className="h-4 w-4 text-slate-500" />
                Pending check
              </div>
              <div className="text-3xl font-extrabold tabular-nums text-slate-600 dark:text-slate-400 mt-1">
                {pendingCheck}
                <span className="text-base font-medium text-muted-foreground"> / {total}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Updates automatically on page load
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {reasons.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Why pages are not indexed</CardTitle>
            <p className="text-xs text-muted-foreground">
              Grouped by Google&apos;s reason — exact same reasons GSC dashboard shows.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {reasons.map(({ reason, count, urls }) => (
                <details key={reason} className="group">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30">
                    <span className="text-sm font-medium">{reason}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold tabular-nums">
                      {count}
                    </span>
                  </summary>
                  <ul className="bg-muted/20 px-4 py-2 space-y-1">
                    {urls.map((u) => (
                      <li key={u}>
                        <a
                          href={u}
                          target="_blank"
                          rel="noopener noreferrer"
                          dir="ltr"
                          className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                          {safeDecode(u)}
                          <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">URLs vs Google</CardTitle>
          <p className="text-xs text-muted-foreground">
            Compare what&apos;s in your sitemap against what Google actually indexed.
          </p>
        </CardHeader>
        <CardContent>
          <UrlsTabs rows={rows} />
        </CardContent>
      </Card>

      <RemovalQueueCard rows={removalRows} trackStates={removalTrackStates} />

      <SitemapManager />
      <RobotsValidator />
    </div>
  );
}
