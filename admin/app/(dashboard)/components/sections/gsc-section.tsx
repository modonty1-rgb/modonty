import Link from "next/link";
import {
  Search,
  AlertCircle,
  TrendingDown,
  Lightbulb,
  Target,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Archive,
  RefreshCw,
} from "lucide-react";

import {
  getCachedTopQueries,
  getCachedTopPages,
  getCachedPerformanceByDate,
} from "@/lib/gsc/cached";
import { analyzeGscCoverage, getAllPublishedArticles } from "@/lib/gsc/coverage";
import { getTechHealthSummary, type TechHealthSummary } from "@/lib/gsc/inspection-cache";
import { DashboardSection } from "@/app/(dashboard)/components/dashboard-section";
import { KpiStrip } from "@/app/(dashboard)/components/kpi-strip";
import { MiniActionItems } from "@/app/(dashboard)/components/mini-action-items";

import type { KpiItem } from "@/app/(dashboard)/components/kpi-strip";
import type { ActionItem } from "@/app/(dashboard)/components/mini-action-items";
import type { CoverageSummary } from "@/lib/gsc/coverage";
import type { GscRow } from "@/lib/gsc/types";

interface GscSectionProps {
  /** Window size in days. Default: 7. */
  days?: number;
}

function summarize(rows: GscRow[]) {
  if (rows.length === 0) return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const totals = rows.reduce(
    (acc, r) => ({
      clicks: acc.clicks + r.clicks,
      impressions: acc.impressions + r.impressions,
      positionSum: acc.positionSum + r.position,
    }),
    { clicks: 0, impressions: 0, positionSum: 0 },
  );
  return {
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
    position: totals.positionSum / rows.length,
  };
}

function pct(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

function decodeQuery(q: string): string {
  try {
    return decodeURIComponent(q);
  } catch {
    return q;
  }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}

async function fetchGscDashboardData(days: number) {
  // Pull a 2x window so we can split into current vs previous for deltas.
  // KPIs + top pages use the requested days window (7d default).
  // Coverage uses a wider window (28d, 100 pages) — same as /seo — so the dashboard
  // alert reflects ALL indexed URLs, not just the recent active subset.
  const [byDate, topQueries, recentPages, coveragePages, publishedArticles, techHealth] = await Promise.all([
    getCachedPerformanceByDate(days * 2).catch(() => []),
    getCachedTopQueries(days, 10).catch(() => []),
    getCachedTopPages(days, 10).catch(() => []),
    getCachedTopPages(28, 100).catch(() => []),
    getAllPublishedArticles().catch(() => []),
    getTechHealthSummary().catch(() => ({ inspected: 0, canonicalIssues: 0, robotsBlocked: 0, mobileFailures: 0, softFourOhFour: 0 } as TechHealthSummary)),
  ]);

  // Sort by date (analytics returns earliest first)
  const sorted = [...byDate].sort((a, b) => a.keys[0].localeCompare(b.keys[0]));
  const half = Math.floor(sorted.length / 2);
  const previous = summarize(sorted.slice(0, half));
  const current = summarize(sorted.slice(half));
  const recentSpark = sorted.slice(half).map((r) => r.clicks);
  const recentImpSpark = sorted.slice(half).map((r) => r.impressions);

  const coverage = await analyzeGscCoverage(coveragePages, publishedArticles);

  return { current, previous, recentSpark, recentImpSpark, topQueries, topPages: recentPages, coverage, techHealth };
}

function TechHealthBar({ tech }: { tech: TechHealthSummary }) {
  if (tech.inspected === 0) {
    return (
      <Link
        href="/search-console"
        className="flex items-center justify-between gap-4 px-5 py-2 border-b text-xs hover:bg-muted/40"
      >
        <span className="text-muted-foreground">
          Technical health: <span className="text-amber-600">no inspections yet</span> — run bulk inspect in Search Console
        </span>
        <ChevronLeft className="h-3 w-3 text-muted-foreground" />
      </Link>
    );
  }

  const issues =
    tech.canonicalIssues + tech.robotsBlocked + tech.mobileFailures + tech.softFourOhFour;
  return (
    <Link
      href="/search-console"
      className="flex items-center justify-between gap-4 px-5 py-2 border-b text-xs hover:bg-muted/40"
    >
      <div className="flex items-center gap-3 flex-wrap text-muted-foreground">
        <span>Technical:</span>
        <span className={tech.canonicalIssues > 0 ? "text-amber-600" : ""}>
          <span className="font-bold tabular-nums">{tech.canonicalIssues}</span> canonical
        </span>
        <span className={tech.robotsBlocked > 0 ? "text-red-600" : ""}>
          <span className="font-bold tabular-nums">{tech.robotsBlocked}</span> robots blocked
        </span>
        <span className={tech.mobileFailures > 0 ? "text-red-600" : ""}>
          <span className="font-bold tabular-nums">{tech.mobileFailures}</span> mobile fail
        </span>
        <span className={tech.softFourOhFour > 0 ? "text-amber-600" : ""}>
          <span className="font-bold tabular-nums">{tech.softFourOhFour}</span> soft 404
        </span>
        <span className="text-muted-foreground/60">· {tech.inspected} inspected</span>
      </div>
      <span className={`font-bold ${issues > 0 ? "text-red-500" : "text-emerald-500"}`}>
        {issues > 0 ? `${issues} issue${issues === 1 ? "" : "s"}` : "All clean"}
      </span>
    </Link>
  );
}

function CoverageAlert({ summary }: { summary: CoverageSummary }) {
  const hasIssues =
    summary.missing > 0 || summary.archived > 0 || summary.pendingIndexing > 0;
  return (
    <Link
      href="/search-console"
      className="flex items-center justify-between gap-4 px-5 py-3 border-b hover:bg-muted/40 transition-colors"
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-sm">
            <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {summary.live}
            </span>{" "}
            <span className="text-muted-foreground">live</span>
          </span>
        </div>
        {summary.missing > 0 && (
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm">
              <span className="font-bold tabular-nums text-red-600 dark:text-red-400">
                {summary.missing}
              </span>{" "}
              <span className="text-muted-foreground">need removal</span>
            </span>
          </div>
        )}
        {summary.pendingIndexing > 0 && (
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-500" />
            <span className="text-sm">
              <span className="font-bold tabular-nums text-blue-600 dark:text-blue-400">
                {summary.pendingIndexing}
              </span>{" "}
              <span className="text-muted-foreground">need indexing</span>
            </span>
          </div>
        )}
        {summary.archived > 0 && (
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-amber-500" />
            <span className="text-sm">
              <span className="font-bold tabular-nums text-amber-600 dark:text-amber-400">
                {summary.archived}
              </span>{" "}
              <span className="text-muted-foreground">archived</span>
            </span>
          </div>
        )}
        {summary.other > 0 && (
          <span className="text-xs text-muted-foreground">
            +{summary.other} non-article
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-bold tabular-nums">
          {summary.liveCoveragePct}% coverage
        </span>
        <span className={`text-xs font-bold ${hasIssues ? "text-red-500" : "text-emerald-500"}`}>
          {hasIssues ? "Review needed" : "All clean"}
        </span>
        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

export async function GscSection({ days = 7 }: GscSectionProps) {
  let data;
  let errorMsg: string | null = null;
  try {
    data = await fetchGscDashboardData(days);
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : "Failed to load GSC data";
  }

  if (errorMsg || !data) {
    return (
      <DashboardSection
        title="Search Console"
        subtitle="How Google sees your site"
        icon={<Search className="h-5 w-5" />}
        accent="blue"
        drillDown={{ href: "/search-console", label: "Open Search Console" }}
      >
        <div className="p-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          GSC unavailable: {errorMsg ?? "Unknown error"}
        </div>
      </DashboardSection>
    );
  }

  const { current, previous, recentSpark, recentImpSpark, topQueries, topPages, coverage, techHealth } = data;

  const kpis: KpiItem[] = [
    {
      label: "Clicks",
      value: formatNumber(current.clicks),
      delta: { value: pct(current.clicks, previous.clicks), positive: current.clicks >= previous.clicks },
      sparkline: recentSpark,
      accent: "blue",
    },
    {
      label: "Impressions",
      value: formatNumber(current.impressions),
      delta: { value: pct(current.impressions, previous.impressions), positive: current.impressions >= previous.impressions },
      sparkline: recentImpSpark,
      accent: "blue",
    },
    {
      label: "CTR",
      value: `${(current.ctr * 100).toFixed(1)}%`,
      delta: {
        value: Math.round((current.ctr - previous.ctr) * 1000) / 10,
        positive: current.ctr >= previous.ctr,
        suffix: "pp",
      },
      accent: "blue",
    },
    {
      label: "Avg Position",
      value: current.position > 0 ? current.position.toFixed(1) : "—",
      // Lower position number is BETTER, so flip the positive flag.
      delta: {
        value: previous.position > 0
          ? Math.round((previous.position - current.position) * 10) / 10
          : 0,
        positive: current.position <= previous.position && current.position > 0,
        suffix: "",
      },
      accent: "blue",
    },
  ];

  // Action items — derived from coverage + GSC analytics
  const actionItems: ActionItem[] = [];

  if (coverage.summary.missing > 0) {
    actionItems.push({
      severity: "critical",
      icon: <XCircle className="h-4 w-4" />,
      title: `${coverage.summary.missing} URL${coverage.summary.missing === 1 ? "" : "s"} indexed but missing in DB`,
      subtitle: "Request removal from Google — review in Search Console",
      href: "/search-console",
    });
  }

  if (coverage.summary.pendingIndexing > 0) {
    actionItems.push({
      severity: "info",
      icon: <RefreshCw className="h-4 w-4" />,
      title: `${coverage.summary.pendingIndexing} article${coverage.summary.pendingIndexing === 1 ? "" : "s"} not indexed yet`,
      subtitle: "Request indexing from Google — review in Search Console",
      href: "/search-console",
    });
  }

  if (coverage.summary.archived > 0) {
    actionItems.push({
      severity: "warning",
      icon: <Archive className="h-4 w-4" />,
      title: `${coverage.summary.archived} archived article${coverage.summary.archived === 1 ? "" : "s"} still indexed`,
      subtitle: "Send 410 Gone signal — review in Search Console",
      href: "/search-console",
    });
  }

  const lowCtrPages = topPages.filter((p) => p.impressions >= 100 && p.ctr < 0.01).slice(0, 1);
  for (const page of lowCtrPages) {
    actionItems.push({
      severity: "warning",
      icon: <TrendingDown className="h-4 w-4" />,
      title: `Low CTR page (${(page.ctr * 100).toFixed(2)}%)`,
      subtitle: `${page.impressions.toLocaleString("en-US")} impressions but only ${page.clicks} clicks — review title`,
    });
  }

  const opportunityQuery = topQueries.find((q) => q.impressions >= 50 && q.clicks === 0);
  if (opportunityQuery && actionItems.length < 3) {
    actionItems.push({
      severity: "info",
      icon: <Lightbulb className="h-4 w-4" />,
      title: "Untapped query opportunity",
      subtitle: `"${decodeQuery(opportunityQuery.keys[0]).slice(0, 50)}" — ${opportunityQuery.impressions} imp, 0 clicks`,
    });
  }

  if (actionItems.length === 0) {
    actionItems.push({
      severity: "success",
      icon: <Target className="h-4 w-4" />,
      title: "Performance looks healthy",
      subtitle: "No critical SEO issues detected in the last 7 days",
    });
  }

  return (
    <DashboardSection
      title="Search Console"
      subtitle={`How Google sees your site · last ${days} days`}
      icon={<Search className="h-5 w-5" />}
      accent="blue"
      drillDown={{ href: "/search-console", label: "Open Search Console" }}
    >
      <KpiStrip items={kpis} defaultAccent="blue" />

      <CoverageAlert summary={coverage.summary} />
      <TechHealthBar tech={techHealth} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-5">
        {/* Top Queries */}
        <div>
          <h3 className="text-[11px] text-muted-foreground font-bold mb-3 uppercase tracking-wider">
            Top Queries
          </h3>
          {topQueries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No query data yet.</p>
          ) : (
            <div className="space-y-1">
              {topQueries.slice(0, 5).map((q, i) => (
                <div
                  key={`${q.keys[0]}-${i}`}
                  className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/40"
                >
                  <span className="text-sm truncate" dir="auto">
                    {decodeQuery(q.keys[0])}
                  </span>
                  <span className="text-xs font-bold text-blue-500 tabular-nums shrink-0">
                    {q.clicks}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Pages */}
        <div>
          <h3 className="text-[11px] text-muted-foreground font-bold mb-3 uppercase tracking-wider">
            Top Pages
          </h3>
          {topPages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No page data yet.</p>
          ) : (
            <div className="space-y-1">
              {topPages.slice(0, 5).map((p, i) => {
                const url = p.keys[0];
                const path = url.replace(/^https?:\/\/[^/]+/, "") || "/";
                return (
                  <div
                    key={`${url}-${i}`}
                    className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/40"
                  >
                    <span className="text-xs truncate" dir="ltr" title={path}>
                      {decodeQuery(path)}
                    </span>
                    <span className="text-xs font-bold text-blue-500 tabular-nums shrink-0">
                      {p.clicks}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Items */}
        <MiniActionItems items={actionItems} title="SEO Insights" />
      </div>
    </DashboardSection>
  );
}
