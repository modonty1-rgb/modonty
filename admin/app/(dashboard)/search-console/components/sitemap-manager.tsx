"use client";

import { useEffect, useState } from "react";
import {
  FileCode,
  Loader2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Globe,
  Image as ImageIcon,
  Newspaper,
  FolderTree,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { listSitemapsAction } from "../actions/sitemap-actions";
import { SitemapUrlsDialog } from "./sitemap-urls-dialog";

import type { GscSitemap } from "@/lib/gsc/types";

export function SitemapManager() {
  const { toast } = useToast();
  const [sitemaps, setSitemaps] = useState<GscSitemap[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [drillUrl, setDrillUrl] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const res = await listSitemapsAction();
    if (res.ok) {
      setSitemaps(res.sitemaps ?? []);
    } else {
      toast({ title: "Failed to load sitemaps", description: res.error, variant: "destructive" });
      setSitemaps([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const totalUrls = (sitemaps ?? []).reduce(
    (sum, s) => sum + Number(s.contents?.[0]?.submitted ?? 0),
    0
  );
  const totalErrors = (sitemaps ?? []).reduce(
    (sum, s) => sum + Number(s.errors ?? 0),
    0
  );
  const totalWarnings = (sitemaps ?? []).reduce(
    (sum, s) => sum + Number(s.warnings ?? 0),
    0
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">Sitemaps</CardTitle>
            {sitemaps !== null && (
              <Badge variant="secondary" className="text-xs">
                {sitemaps.length} {sitemaps.length === 1 ? "file" : "files"}
              </Badge>
            )}
            {totalUrls > 0 && (
              <Badge variant="outline" className="text-xs font-mono">
                {totalUrls.toLocaleString("en-US")} URLs
              </Badge>
            )}
            {totalErrors > 0 && (
              <Badge variant="destructive" className="text-xs">
                {totalErrors} error{totalErrors === 1 ? "" : "s"}
              </Badge>
            )}
            {totalWarnings > 0 && totalErrors === 0 && (
              <Badge className="text-xs bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
                {totalWarnings} warning{totalWarnings === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Refresh
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin inline-block me-2" />
            Loading sitemaps…
          </div>
        ) : sitemaps && sitemaps.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground border rounded-md bg-muted/20">
            No sitemaps registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Sitemap URL
                  </th>
                  <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-end px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    URLs
                  </th>
                  <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Last fetched by Google
                  </th>
                  <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Health
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sitemaps?.map((s) => {
                  const total = s.contents?.[0];
                  const submitted = total ? Number(total.submitted) : 0;
                  const errorsNum = Number(s.errors ?? 0);
                  const warningsNum = Number(s.warnings ?? 0);
                  const hasErrors = errorsNum > 0;
                  const hasWarnings = warningsNum > 0;
                  const submittedDate = s.lastSubmitted ? new Date(s.lastSubmitted) : null;
                  const downloadedDate = s.lastDownloaded ? new Date(s.lastDownloaded) : null;

                  return (
                    <tr key={s.path} className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <a
                            href={s.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            dir="ltr"
                            className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                            title={s.path}
                          >
                            {s.path.replace(/^https?:\/\/(www\.)?/, "")}
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <SitemapTypeBadge
                          type={s.type}
                          isIndex={s.isSitemapsIndex}
                        />
                      </td>
                      <td className="px-4 py-3 text-end tabular-nums">
                        {submitted > 0 ? (
                          <button
                            type="button"
                            onClick={() => setDrillUrl(s.path)}
                            className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            title="Click to see all URLs in this sitemap"
                          >
                            {submitted.toLocaleString("en-US")}
                          </button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {submittedDate ? (
                          <div>
                            <div className="text-foreground/90">
                              {formatDistanceToNow(submittedDate, { addSuffix: true })}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {format(submittedDate, "MMM d, yyyy")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {downloadedDate ? (
                          <div>
                            <div className="text-foreground/90">
                              {formatDistanceToNow(downloadedDate, { addSuffix: true })}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {format(downloadedDate, "MMM d, yyyy")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">not yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {s.isPending ? (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Processing
                          </span>
                        ) : hasErrors ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                            <XCircle className="h-3.5 w-3.5" />
                            {errorsNum} error{errorsNum === 1 ? "" : "s"}
                          </span>
                        ) : hasWarnings ? (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {warningsNum} warning{warningsNum === 1 ? "" : "s"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground italic mt-3">
          <strong>URLs</strong> = number of links inside the sitemap that Google has read (click to view all).{" "}
          <strong>Last fetched</strong> = the last time Googlebot downloaded the sitemap (closer = healthier).
          For real indexed counts, see the <strong>Coverage</strong> card at the top of this page.
        </p>
      </CardContent>
      <SitemapUrlsDialog
        open={drillUrl !== null}
        onOpenChange={(open) => !open && setDrillUrl(null)}
        sitemapUrl={drillUrl ?? ""}
      />
    </Card>
  );
}

function SitemapTypeBadge({
  type,
  isIndex,
}: {
  type?: string;
  isIndex?: boolean;
}) {
  if (isIndex) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20 text-[10px] font-medium">
        <FolderTree className="h-3 w-3" />
        Index
      </span>
    );
  }
  const t = (type ?? "").toLowerCase();
  if (t.includes("image")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/20 text-[10px] font-medium">
        <ImageIcon className="h-3 w-3" />
        Image
      </span>
    );
  }
  if (t.includes("news")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20 text-[10px] font-medium">
        <Newspaper className="h-3 w-3" />
        News
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] font-medium">
      <Globe className="h-3 w-3" />
      Web
    </span>
  );
}
