import Link from "next/link";
import { Zap, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { SITE_BASE_URL } from "@/lib/gsc/client";

import type { PublishedArticleRef } from "@/lib/gsc/coverage";
import type { ManualTrackState } from "../actions/removal-tracking-actions";
import type { InspectionRecord } from "@/lib/gsc/inspection-cache";
import { IndexingRecheckButton } from "./indexing-recheck-button";

interface Props {
  pendingIndexing: PublishedArticleRef[];
  /** DB tracking: which URLs have a "Request Indexing" trace. Keyed by URL. */
  requestStates: Map<string, ManualTrackState>;
  /** Latest URL Inspection cache (Google's view). Keyed by URL. */
  inspections: Map<string, InspectionRecord>;
}

function formatRelativeDays(date: Date | null): string {
  if (!date) return "";
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (24 * 60 * 60 * 1000));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function formatDateShort(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function GoogleStatusBadge({ inspection }: { inspection: InspectionRecord | null }) {
  if (!inspection) {
    return (
      <span className="text-[10px] text-muted-foreground italic">
        Not checked yet
      </span>
    );
  }
  const verdict = inspection.verdict;
  if (verdict === "PASS") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
        ✅ Indexed
      </span>
    );
  }
  if (verdict === "FAIL") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/20 text-[10px] font-medium" title={inspection.coverageState ?? ""}>
        ❌ Rejected
      </span>
    );
  }
  // NEUTRAL or PARTIAL — show the coverage hint when present
  const cov = (inspection.coverageState ?? "").toLowerCase();
  if (cov.includes("crawled")) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-medium" title={inspection.coverageState ?? ""}>
        🟨 Crawled, not indexed
      </span>
    );
  }
  if (cov.includes("discovered")) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20 text-[10px] font-medium" title={inspection.coverageState ?? ""}>
        🟦 Discovered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/20 text-[10px] font-medium" title={inspection.coverageState ?? ""}>
      ⏳ Pending
    </span>
  );
}

export function PendingIndexingCard({ pendingIndexing, requestStates, inspections }: Props) {
  const total = pendingIndexing.length;
  const requestedCount = pendingIndexing.filter((a) =>
    requestStates.has(`${SITE_BASE_URL}/articles/${a.slug}`),
  ).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">Pending Indexing</CardTitle>
            {total > 0 ? (
              <>
                <Badge className="text-xs bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20">
                  {total} article{total === 1 ? "" : "s"}
                </Badge>
                {requestedCount > 0 && (
                  <Badge className="text-xs bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/20">
                    {requestedCount} requested
                  </Badge>
                )}
              </>
            ) : (
              <Badge className="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3 me-1" />
                All articles indexed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {total === 0 ? (
          <div className="px-5 py-6 text-center text-sm text-muted-foreground">
            Every PUBLISHED article appears in Google&apos;s top 100. Nothing to request.
          </div>
        ) : (
          <>
            <p className="px-5 pb-3 text-xs text-muted-foreground">
              <strong>Reference list</strong> — these articles are PUBLISHED in your DB but Google hasn&apos;t shown them in search results yet. Click <strong>Open Pipeline →</strong> to walk an article through the 13-stage quality gate before requesting indexing. Once requested, click <strong>Re-check</strong> to see Google&apos;s current verdict.
            </p>
            <div className="overflow-x-auto border-t">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-10">#</th>
                    <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Title · Slug</th>
                    <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-44">Request</th>
                    <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-44">Google</th>
                    <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-56">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendingIndexing.map((article, i) => {
                    const url = `${SITE_BASE_URL}/articles/${article.slug}`;
                    const reqState = requestStates.get(url) ?? null;
                    const inspection = inspections.get(url) ?? null;
                    return (
                      <tr key={article.id} className="hover:bg-muted/40">
                        <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums align-top">
                          {i + 1}
                        </td>
                        <td className="px-4 py-2.5 max-w-md align-top">
                          <span className="font-medium line-clamp-1" title={article.title}>
                            {article.title}
                          </span>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            dir="ltr"
                            className="font-mono text-[10px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <span className="truncate max-w-[280px]">/articles/{article.slug}</span>
                            <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
                          </a>
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          {reqState ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/20 text-[10px] font-medium">
                                Requested
                              </span>
                              <div className="text-[10px] text-muted-foreground">
                                {formatDateShort(reqState.openedAt)} · {formatRelativeDays(reqState.openedAt)}
                              </div>
                              {reqState.doneAt && (
                                <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                                  ✓ Submitted in GSC
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">
                              Not requested yet
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <div className="space-y-0.5">
                            <GoogleStatusBadge inspection={inspection} />
                            {inspection && (
                              <div className="text-[10px] text-muted-foreground">
                                Last checked {formatRelativeDays(inspection.inspectedAt)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {reqState && (
                              <IndexingRecheckButton url={url} openedAt={reqState.openedAt} />
                            )}
                            <Link
                              href={`/search-console/pipeline/${article.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium"
                            >
                              Open Pipeline
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
