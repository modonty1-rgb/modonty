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
import { analyzeGscCoverage } from "@/lib/gsc/coverage";
import { getCachedInspectionsByUrls, type InspectionRecord } from "@/lib/gsc/inspection-cache";

import { SeoRowAction } from "./components/seo-row-action";
import { SeoBulkActions } from "./components/seo-bulk-actions";
import { InspectBulkButton } from "./components/inspect-bulk-button";
import { InspectRowButton } from "./components/inspect-row-button";
import { SitemapManager } from "./components/sitemap-manager";
import { ImageSitemapCard } from "./components/image-sitemap-card";
import { RobotsValidator } from "./components/robots-validator";
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

  const [topPages, publishedCount] = await Promise.all([
    getCachedTopPages(28, 100).catch(() => []),
    db.article.count({ where: { status: "PUBLISHED" } }),
  ]);

  const { pages, summary } = await analyzeGscCoverage(topPages);
  const inspectionMap = await getCachedInspectionsByUrls(pages.map((p) => p.url));

  // Tech health summary
  let canonicalIssues = 0;
  let robotsBlocked = 0;
  let mobileFailures = 0;
  let softFourOhFour = 0;
  let inspectedCount = 0;

  for (const page of pages) {
    const i = inspectionMap.get(page.url);
    if (!i) continue;
    inspectedCount += 1;
    if (
      i.userCanonical &&
      i.googleCanonical &&
      i.userCanonical !== i.googleCanonical
    ) canonicalIssues += 1;
    if (i.robotsTxtState === "DISALLOWED") robotsBlocked += 1;
    if (i.mobileVerdict === "FAIL") mobileFailures += 1;
    if (i.pageFetchState === "SOFT_404") softFourOhFour += 1;
  }

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

  const visible = sorted.filter((page) => {
    if (filter === "all") return true;
    if (filter === "live") return page.dbStatus === "PUBLISHED";
    if (filter === "archived") return page.dbStatus === "ARCHIVED";
    if (filter === "missing") return page.dbStatus === "missing";
    const i = inspectionMap.get(page.url);
    if (!i) return false;
    if (filter === "canonical") {
      return (
        !!i.userCanonical &&
        !!i.googleCanonical &&
        i.userCanonical !== i.googleCanonical
      );
    }
    if (filter === "robots") return i.robotsTxtState === "DISALLOWED";
    if (filter === "mobile") return i.mobileVerdict === "FAIL";
    if (filter === "soft404") return i.pageFetchState === "SOFT_404";
    return true;
  });

  const missingUrls = pages
    .filter((p) => p.dbStatus === "missing" || p.dbStatus === "ARCHIVED")
    .map((p) => p.url);
  const unindexedUrls = pages
    .filter((p) => p.dbStatus === "PUBLISHED" && p.impressions === 0)
    .map((p) => p.url);

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
        <InspectBulkButton totalArticles={publishedCount} />
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
                <Stat
                  label="Canonical"
                  value={canonicalIssues}
                  accent={canonicalIssues > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}
                  icon={<Link2 className="h-3 w-3 text-amber-500" />}
                />
                <Stat
                  label="Robots"
                  value={robotsBlocked}
                  accent={robotsBlocked > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}
                  icon={<ShieldAlert className="h-3 w-3 text-red-500" />}
                />
                <Stat
                  label="Mobile"
                  value={mobileFailures}
                  accent={mobileFailures > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}
                  icon={<Smartphone className="h-3 w-3 text-red-500" />}
                />
                <Stat
                  label="Soft 404"
                  value={softFourOhFour}
                  accent={softFourOhFour > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}
                  icon={<AlertCircle className="h-3 w-3 text-amber-500" />}
                />
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

      <SitemapManager />
      <ImageSitemapCard />
      <RobotsValidator />

      <Card>
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Indexed pages — coverage + tech health</CardTitle>
              <Badge variant="secondary" className="text-xs">
                last 28 days · top 100
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Sorted by status urgency, then by clicks
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider me-1">
              <Filter className="h-3 w-3" />
              Filter
            </span>
            <FilterPill href={filterHref(filter, "all")} active={filter === "all"} count={sorted.length}>
              All
            </FilterPill>
            <FilterPill href={filterHref(filter, "live")} active={filter === "live"} count={summary.live} tone="emerald">
              Live
            </FilterPill>
            <FilterPill href={filterHref(filter, "archived")} active={filter === "archived"} count={summary.archived} tone="amber">
              Archived
            </FilterPill>
            <FilterPill href={filterHref(filter, "missing")} active={filter === "missing"} count={summary.missing} tone="red">
              Missing
            </FilterPill>
            <span className="mx-1 h-4 w-px bg-border" />
            <FilterPill href={filterHref(filter, "canonical")} active={filter === "canonical"} count={canonicalIssues} tone="amber" disabled={canonicalIssues === 0}>
              Canonical
            </FilterPill>
            <FilterPill href={filterHref(filter, "robots")} active={filter === "robots"} count={robotsBlocked} tone="red" disabled={robotsBlocked === 0}>
              Robots
            </FilterPill>
            <FilterPill href={filterHref(filter, "mobile")} active={filter === "mobile"} count={mobileFailures} tone="red" disabled={mobileFailures === 0}>
              Mobile
            </FilterPill>
            <FilterPill href={filterHref(filter, "soft404")} active={filter === "soft404"} count={softFourOhFour} tone="amber" disabled={softFourOhFour === 0}>
              Soft 404
            </FilterPill>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <SeoBulkActions missingUrls={missingUrls} unindexedUrls={unindexedUrls} />
          {visible.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {filter === "all"
                ? "No GSC data available yet."
                : `No URLs match the "${FILTER_LABELS[filter]}" filter.`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-start px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider w-8" />
                    <th className="text-start px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">URL</th>
                    <th className="text-start px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">DB Status</th>
                    <th className="text-start px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">GSC Verdict</th>
                    <th className="text-start px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Canonical</th>
                    <th className="text-start px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Robots</th>
                    <th className="text-start px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Mobile</th>
                    <th className="text-end px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Clicks</th>
                    <th className="text-end px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Imp.</th>
                    <th className="text-start px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Last Crawl</th>
                    <th className="text-start px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {visible.map((page, i) => (
                    <CoverageRow
                      key={`${page.url}-${i}`}
                      page={page}
                      inspection={inspectionMap.get(page.url) ?? null}
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
          <InspectRowButton url={page.url} />
          {(page.dbStatus === "missing" || page.dbStatus === "ARCHIVED") && (
            <SeoRowAction url={page.url} action="delete" />
          )}
          {page.dbStatus === "PUBLISHED" && page.impressions === 0 && (
            <SeoRowAction url={page.url} action="index" />
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
