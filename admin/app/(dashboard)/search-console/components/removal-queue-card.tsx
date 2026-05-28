import { ExternalLink, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { SeoRowAction } from "./seo-row-action";
import type { RemovalTrackState } from "../actions/removal-tracking-actions";

export interface RemovalRow {
  url: string;
  decoded: string;
  dbStatus: "missing" | "ARCHIVED";
  impressions: number;
  clicks: number;
}

interface Props {
  rows: RemovalRow[];
  trackStates: Map<string, RemovalTrackState>;
}

/**
 * URLs Google has indexed BUT our DB has as missing or ARCHIVED.
 * These leaked into Google's index and need manual removal via GSC Removals tool.
 * Source: GSC top pages (URLs with traffic) cross-referenced with DB.
 */
export function RemovalQueueCard({ rows, trackStates }: Props) {
  const doneCount = rows.filter((r) => trackStates.get(r.url)?.doneAt).length;
  const openedCount = rows.filter(
    (r) => trackStates.get(r.url)?.openedAt && !trackStates.get(r.url)?.doneAt,
  ).length;
  const pendingCount = rows.length - doneCount - openedCount;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Trash2 className="h-4 w-4 text-red-500" />
            <CardTitle className="text-base">Removal Queue</CardTitle>
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
          </div>
          <p className="text-xs text-muted-foreground">
            From <strong>DB</strong> · sorted by reach. URLs Google still indexes but you archived or deleted.
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
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
                {rows.map((r, i) => (
                  <Row
                    key={r.url}
                    row={r}
                    index={i + 1}
                    trackState={trackStates.get(r.url) ?? null}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  row,
  index,
  trackState,
}: {
  row: RemovalRow;
  index: number;
  trackState: RemovalTrackState | null;
}) {
  const reach = row.impressions;
  const isHot = reach >= 50;
  const reachCls = isHot
    ? "text-red-600 dark:text-red-400 font-bold"
    : reach >= 10
      ? "text-amber-600 dark:text-amber-400"
      : "text-muted-foreground";

  const badge = row.dbStatus === "missing"
    ? { label: "Not in DB", cls: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20" }
    : { label: "In DB · Archived", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20" };

  const isDone = !!trackState?.doneAt;

  return (
    <tr className={`hover:bg-muted/40 ${isDone ? "opacity-60" : ""}`}>
      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">{index}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${badge.cls}`}>
            {badge.label}
          </span>
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 min-w-0"
            title={row.decoded}
          >
            <span className="truncate max-w-[400px]">{row.decoded}</span>
            <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
          </a>
        </div>
      </td>
      <td className={`px-4 py-3 text-end tabular-nums ${reachCls}`}>
        {isHot && <span className="me-1">🔥</span>}
        {reach.toLocaleString("en-US")}
      </td>
      <td className="px-4 py-3">
        <SeoRowAction url={row.url} action="delete" trackState={trackState} />
      </td>
    </tr>
  );
}
