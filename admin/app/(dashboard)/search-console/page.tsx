import Link from "next/link";
import {
  Search,
  CheckCircle2,
  XCircle,
  Archive,
  FileText,
  Globe,
  Pencil,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  Link2,
  AlertCircle,
  Filter,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { db } from "@/lib/db";
import { getCachedTopPages } from "@/lib/gsc/cached";
import { analyzeGscCoverage, getAllPublishedArticles } from "@/lib/gsc/coverage";
import { getCachedInspectionsByUrls, type InspectionRecord } from "@/lib/gsc/inspection-cache";
import { SITE_BASE_URL } from "@/lib/gsc/client";
import {
  getRemovalTrackStates,
  type RemovalTrackState,
} from "./actions/removal-tracking-actions";

import { SeoRowAction } from "./components/seo-row-action";
import { InspectBulkButton } from "./components/inspect-bulk-button";
import { TechHealthStat } from "./components/tech-health-stat";
import type { TechHealthIssue } from "./components/tech-health-dialog";
import { SitemapManager } from "./components/sitemap-manager";
import { ImageSitemapCard } from "./components/image-sitemap-card";
import { RobotsValidator } from "./components/robots-validator";
import { PendingIndexingCard } from "./components/pending-indexing-card";
import { DataSourcesNote } from "./components/data-sources-note";

import type { DbStatus, EnrichedPage, PathType } from "@/lib/gsc/coverage";

type CoverageFilter =
  | "all"
  | "live"
  | "archived"
  | "missing"
  | "canonical"
  | "robots"
  | "mobile"
  | "soft404";

const FILTER_LABELS: Record<Exclude<CoverageFilter, "all">, string> = {
  live: "Live",
  archived: "Archived",
  missing: "Missing",
  canonical: "Canonical Issues",
  robots: "Robots Blocked",
  mobile: "Mobile Failures",
  soft404: "Soft 404",
};

function filterHref(current: CoverageFilter, target: CoverageFilter): string {
  if (target === "all" || current === target) return "/search-console";
  return `/search-console?filter=${target}`;
}

export default async function SearchConsolePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: filterParam } = await searchParams;
  const filter: CoverageFilter =
    filterParam === "live" ||
    filterParam === "archived" ||
    filterParam === "missing" ||
    filterParam === "canonical" ||
    filterParam === "robots" ||
    filterParam === "mobile" ||
    filterParam === "soft404"
      ? filterParam
      : "all";

  const [topPages, publishedArticles] = await Promise.all([
    getCachedTopPages(28, 100).catch(() => []),
    getAllPublishedArticles(),
  ]);

  const { pages, summary, pendingIndexing } = await analyzeGscCoverage(
    topPages,
    publishedArticles,
  );
  const inspectionMap = await getCachedInspectionsByUrls(pages.map((p) => p.url));

  // Union of GSC coverage URLs + all PUBLISHED articles (deduped)
  const inspectableUrls = Array.from(
    new Set([
      ...pages.map((p) => p.url),
      ...publishedArticles.map((a) => `${SITE_BASE_URL}/articles/${a.slug}`),
    ]),
  );

  // Tech health summary + per-issue URL lists for drill-down dialogs
  const canonicalList: TechHealthIssue[] = [];
  const robotsList: TechHealthIssue[] = [];
  const mobileList: TechHealthIssue[] = [];
  const soft404List: TechHealthIssue[] = [];
  let inspectedCount = 0;

  for (const page of pages) {
    const i = inspectionMap.get(page.url);
    if (!i) continue;
    inspectedCount += 1;
    if (
      i.userCanonical &&
      i.googleCanonical &&
      i.userCanonical !== i.googleCanonical
    ) {
      canonicalList.push({
        url: page.url,
        userCanonical: i.userCanonical,
        googleCanonical: i.googleCanonical,
      });
    }
    if (i.robotsTxtState === "DISALLOWED") {
      robotsList.push({ url: page.url, robotsTxtState: i.robotsTxtState });
    }
    if (i.mobileVerdict === "FAIL") {
      mobileList.push({
        url: page.url,
        mobileVerdict: i.mobileVerdict,
        mobileIssues: i.mobileIssues,
      });
    }
    if (i.pageFetchState === "SOFT_404") {
      soft404List.push({
        url: page.url,
        pageFetchState: i.pageFetchState,
        coverageState: i.coverageState,
      });
    }
  }
  const canonicalIssues = canonicalList.length;
  const robotsBlocked = robotsList.length;
  const mobileFailures = mobileList.length;
  const softFourOhFour = soft404List.length;

  const order: Record<DbStatus, number> = {
    missing: 0,
    ARCHIVED: 1,
    DRAFT: 2,
    SCHEDULED: 2,
    WRITING: 2,
    PUBLISHED: 3,
    "n/a": 4,
  };
  const sorted = [...pages].sort((a, b) => {
    const oa = order[a.dbStatus] ?? 5;
    const ob = order[b.dbStatus] ?? 5;
    if (oa !== ob) return oa - ob;
    return b.clicks - a.clicks;
  });

  // Removal Queue = only URLs that need to be removed (missing in DB or archived)
  // Sort by impressions DESC — highest reach first (most urgent to remove)
  const visible = sorted
    .filter((page) => page.dbStatus === "missing" || page.dbStatus === "ARCHIVED")
    .sort((a, b) => b.impressions - a.impressions);

  // Removal tracking: opened (intent) + done (confirmed). Stored in our DB since Google doesn't expose Removals data.
  const removalTrackStates = await getRemovalTrackStates(visible.map((p) => p.url));

  return (
    <div className="px-6 py-6 max-w-[1280px] mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold leading-tight">Search Console</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Coverage · indexing · canonical · robots · mobile · all in one place
            </p>
          </div>
        </div>
        <InspectBulkButton urls={inspectableUrls} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-9 divide-y lg:divide-y-0 lg:divide-x">
            <div className="lg:col-span-5 p-4">
              <h2 className="text-[10px] text-muted-foreground font-bold mb-3 uppercase tracking-wider">
                Coverage
              </h2>
              <div className="grid grid-cols-5 gap-2">
                <Stat label="Total" value={summary.total} accent="text-foreground" />
                <Stat
                  label="Live"
                  value={summary.live}
                  accent="text-emerald-600 dark:text-emerald-400"
                  icon={<CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                />
                <Stat
                  label="Archived"
                  value={summary.archived}
                  accent="text-amber-600 dark:text-amber-400"
                  icon={<Archive className="h-3 w-3 text-amber-500" />}
                />
                <Stat
                  label="Missing"
                  value={summary.missing}
                  accent="text-red-600 dark:text-red-400"
                  icon={<XCircle className="h-3 w-3 text-red-500" />}
                />
                <Stat
                  label="Coverage"
                  value={`${summary.liveCoveragePct}%`}
                  accent={
                    summary.liveCoveragePct >= 90
                      ? "text-emerald-600 dark:text-emerald-400"
                      : summary.liveCoveragePct >= 70
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                  }
                />
              </div>
            </div>

            <div className="lg:col-span-4 p-4">
              <h2 className="text-[10px] text-muted-foreground font-bold mb-3 uppercase tracking-wider">
                Technical Health
                <span className="text-muted-foreground/60 ms-2 normal-case font-medium">
                  · {inspectedCount}/{pages.length} inspected
                </span>
              </h2>
              <div className="grid grid-cols-4 gap-2">
                <TechHealthStat kind="canonical" count={canonicalIssues} issues={canonicalList} />
                <TechHealthStat kind="robots" count={robotsBlocked} issues={robotsList} />
                <TechHealthStat kind="mobile" count={mobileFailures} issues={mobileList} />
                <TechHealthStat kind="soft404" count={softFourOhFour} issues={soft404List} />
              </div>
              {inspectedCount === 0 && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  No inspection data yet. Click <strong>Inspect all PUBLISHED</strong> to populate.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <PendingIndexingCard pendingIndexing={pendingIndexing} />

      <SitemapManager />
      <ImageSitemapCard />
      <RobotsValidator />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">Removal Queue</CardTitle>
              {(() => {
                const doneCount = visible.filter((p) => removalTrackStates.get(p.url)?.doneAt).length;
                const openedCount = visible.filter(
                  (p) => removalTrackStates.get(p.url)?.openedAt && !removalTrackStates.get(p.url)?.doneAt,
                ).length;
                const pendingCount = visible.length - doneCount - openedCount;
                return (
                  <>
                    {pendingCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {pendingCount} pending
                      </Badge>
                    )}
                    {openedCount > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                      >
                        {openedCount} awaiting submit
                      </Badge>
                    )}
                    {doneCount > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                      >
                        {doneCount} done
                      </Badge>
                    )}
                  </>
                );
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              Sorted by reach. Click &ldquo;Remove in GSC&rdquo;, submit in Google, then come back and click &ldquo;Mark done&rdquo;.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {visible.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              ✅ Clean — no URLs need removal right now.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-10">#</th>
                    <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">URL</th>
                    <th className="text-end px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-32">Reach (28d)</th>
                    <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-44">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {visible.map((page, i) => (
                    <RemovalRow
                      key={`${page.url}-${i}`}
                      page={page}
                      index={i + 1}
                      trackState={removalTrackStates.get(page.url) ?? null}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <DataSourcesNote />
    </div>
  );
}

type PillTone = "neutral" | "emerald" | "amber" | "red";

const PILL_ACTIVE: Record<PillTone, string> = {
  neutral: "bg-foreground text-background border-foreground",
  emerald: "bg-emerald-600 text-white border-emerald-600",
  amber: "bg-amber-600 text-white border-amber-600",
  red: "bg-red-600 text-white border-red-600",
};

const PILL_IDLE: Record<PillTone, string> = {
  neutral: "bg-muted/50 text-foreground hover:bg-muted",
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20",
  red: "bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20",
};

function FilterPill({
  href,
  active,
  count,
  tone = "neutral",
  disabled,
  children,
}: {
  href: string;
  active: boolean;
  count: number;
  tone?: PillTone;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const baseClass =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-transparent transition-colors";
  if (disabled) {
    return (
      <span
        className={`${baseClass} bg-muted/30 text-muted-foreground/50 cursor-not-allowed`}
        aria-disabled="true"
      >
        {children}
        <span className="tabular-nums opacity-60">{count}</span>
      </span>
    );
  }
  return (
    <Link
      href={href}
      scroll={false}
      className={`${baseClass} ${active ? PILL_ACTIVE[tone] : PILL_IDLE[tone]}`}
    >
      {children}
      <span className="tabular-nums">{count}</span>
    </Link>
  );
}

function Stat({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number | string;
  accent: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className={`text-2xl font-extrabold tabular-nums leading-none ${accent}`}>
        {value}
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<DbStatus, string> = {
  PUBLISHED: "Live",
  ARCHIVED: "Archived",
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  WRITING: "Writing",
  missing: "Missing",
  "n/a": "—",
};

const STATUS_COLOR: Record<DbStatus, string> = {
  PUBLISHED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  ARCHIVED: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  DRAFT: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20",
  SCHEDULED: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
  WRITING: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
  missing: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  "n/a": "bg-muted text-muted-foreground border-border",
};

const TYPE_LABEL: Record<PathType, string> = {
  article: "Article",
  homepage: "Home",
  client: "Client",
  category: "Category",
  tag: "Tag",
  industry: "Industry",
  author: "Author",
  static: "Static",
  other: "Other",
};

function GscVerdictCell({ inspection }: { inspection: InspectionRecord | null }) {
  if (!inspection) {
    return <span className="text-[10px] text-muted-foreground/50">not inspected</span>;
  }

  const verdict = inspection.verdict; // PASS · FAIL · PARTIAL · NEUTRAL · VERDICT_UNSPECIFIED
  const coverage = inspection.coverageState; // e.g. "Submitted and indexed"
  const indexing = inspection.indexingState; // e.g. INDEXING_ALLOWED · BLOCKED_BY_META_TAG

  const verdictStyle = (() => {
    switch (verdict) {
      case "PASS":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "FAIL":
        return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20";
      case "PARTIAL":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "NEUTRAL":
        return "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  })();

  const indexingShort = (() => {
    if (!indexing) return null;
    if (indexing === "INDEXING_ALLOWED") return { text: "Indexing allowed", ok: true };
    if (indexing.startsWith("BLOCKED_")) return { text: indexing.replace("BLOCKED_BY_", "Blocked: ").toLowerCase(), ok: false };
    return { text: indexing.toLowerCase(), ok: false };
  })();

  return (
    <div className="space-y-1">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${verdictStyle}`}
      >
        {verdict ?? "—"}
      </span>
      {coverage && (
        <div
          className="text-[10px] text-muted-foreground line-clamp-1"
          title={coverage}
        >
          {coverage}
        </div>
      )}
      {indexingShort && (
        <div
          className={`text-[10px] line-clamp-1 ${indexingShort.ok ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}`}
          title={indexing ?? ""}
        >
          {indexingShort.text}
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: DbStatus }) {
  if (status === "PUBLISHED") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "ARCHIVED") return <Archive className="h-4 w-4 text-amber-500" />;
  if (status === "missing") return <XCircle className="h-4 w-4 text-red-500" />;
  return <FileText className="h-4 w-4 text-muted-foreground" />;
}

function RemovalRow({
  page,
  index,
  trackState,
}: {
  page: EnrichedPage;
  index: number;
  trackState: RemovalTrackState | null;
}) {
  const decoded = (() => {
    try {
      return decodeURIComponent(page.path);
    } catch {
      return page.path;
    }
  })();

  const reach = page.impressions;
  const isHotReach = reach >= 50;
  const reachCls = isHotReach
    ? "text-red-600 dark:text-red-400 font-bold"
    : reach >= 10
      ? "text-amber-600 dark:text-amber-400"
      : "text-muted-foreground";

  const statusBadge = page.dbStatus === "missing"
    ? { label: "Missing", cls: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20" }
    : { label: "Archived", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20" };

  const isDone = !!trackState?.doneAt;

  return (
    <tr className={`hover:bg-muted/40 ${isDone ? "opacity-60" : ""}`}>
      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">{index}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${statusBadge.cls}`}
          >
            {statusBadge.label}
          </span>
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 min-w-0"
            title={decoded}
          >
            <span className="truncate max-w-[400px]">{decoded}</span>
            <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
          </a>
        </div>
      </td>
      <td className={`px-4 py-3 text-end tabular-nums ${reachCls}`}>
        {isHotReach && <span className="me-1">🔥</span>}
        {reach.toLocaleString("en-US")}
      </td>
      <td className="px-4 py-3">
        <SeoRowAction url={page.url} action="delete" trackState={trackState} />
      </td>
    </tr>
  );
}

function CoverageRow({
  page,
  inspection,
}: {
  page: EnrichedPage;
  inspection: InspectionRecord | null;
}) {
  const decoded = (() => {
    try {
      return decodeURIComponent(page.path);
    } catch {
      return page.path;
    }
  })();

  return (
    <tr className="hover:bg-muted/40">
      <td className="px-3 py-3">
        <StatusIcon status={page.dbStatus} />
      </td>
      <td className="px-3 py-3 max-w-md">
        <div className="flex items-center gap-2 min-w-0">
          <span dir="ltr" className="font-mono text-xs truncate" title={decoded}>
            {decoded}
          </span>
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Open in new tab"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        {page.articleTitle && (
          <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
            {page.articleTitle}
          </div>
        )}
      </td>
      <td className="px-3 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium ${STATUS_COLOR[page.dbStatus]}`}
        >
          {STATUS_LABEL[page.dbStatus]}
        </span>
        <div className="text-[10px] text-muted-foreground mt-1 inline-flex items-center gap-1">
          {page.type === "homepage" && <Globe className="h-3 w-3" />}
          {TYPE_LABEL[page.type]}
        </div>
      </td>
      <td className="px-3 py-3 max-w-[180px]">
        <GscVerdictCell inspection={inspection} />
      </td>
      <td className="px-3 py-3">
        {inspection ? (
          inspection.userCanonical && inspection.googleCanonical ? (
            inspection.userCanonical === inspection.googleCanonical ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> match
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 text-[10px] text-amber-600"
                title={`User: ${inspection.userCanonical}\nGoogle: ${inspection.googleCanonical}`}
              >
                <Link2 className="h-3 w-3" /> mismatch
              </span>
            )
          ) : (
            <span className="text-[10px] text-muted-foreground">—</span>
          )
        ) : (
          <span className="text-[10px] text-muted-foreground/50">not inspected</span>
        )}
      </td>
      <td className="px-3 py-3">
        {inspection ? (
          inspection.robotsTxtState === "ALLOWED" ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
              <CheckCircle2 className="h-3 w-3" /> allowed
            </span>
          ) : inspection.robotsTxtState === "DISALLOWED" ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-red-600">
              <ShieldAlert className="h-3 w-3" /> blocked
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">—</span>
          )
        ) : (
          <span className="text-[10px] text-muted-foreground/50">—</span>
        )}
      </td>
      <td className="px-3 py-3">
        {inspection ? (
          inspection.mobileVerdict === "PASS" ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
              <CheckCircle2 className="h-3 w-3" /> pass
            </span>
          ) : inspection.mobileVerdict === "FAIL" ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-red-600">
              <XCircle className="h-3 w-3" /> fail
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">—</span>
          )
        ) : (
          <span className="text-[10px] text-muted-foreground/50">—</span>
        )}
      </td>
      <td className="px-3 py-3 text-end tabular-nums">{page.clicks}</td>
      <td className="px-3 py-3 text-end tabular-nums text-muted-foreground">{page.impressions}</td>
      <td className="px-3 py-3 text-[10px] text-muted-foreground">
        {inspection?.lastCrawlTime
          ? inspection.lastCrawlTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : <span className="text-muted-foreground/50">—</span>}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(page.dbStatus === "missing" || page.dbStatus === "ARCHIVED") && (
            <SeoRowAction url={page.url} action="delete" />
          )}
          {page.articleId && (
            <Link
              href={`/articles/${page.articleId}/edit`}
              className="shrink-0 text-muted-foreground hover:text-primary"
              aria-label="Edit article"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}
