"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { messages } from "@/lib/messages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  Loader2,
  ExternalLink,
  Globe,
  FileText,
  AlertCircle,
  XCircle,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { regenerateContentPageSeo, regenerateListPageSeo, type SeoPageStatus } from "./actions/seo-overview-actions";

interface SeoOverviewClientProps {
  listPages: SeoPageStatus[];
  contentPages: SeoPageStatus[];
  stats: {
    totalPages: number;
    withMeta: number;
    withJsonLd: number;
  };
}

interface BulkProgress {
  total: number;
  completed: number;
  current: string;
  results: Array<{ name: string; success: boolean; error?: string }>;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function StatusBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
      <CheckCircle2 className="h-3 w-3" />
      Generated
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 border-yellow-500/30 text-yellow-600 bg-yellow-500/10">
      <Clock className="h-3 w-3" />
      Pending
    </Badge>
  );
}

function PageRow({
  page,
  onRegenerate,
  regenerating,
  siteUrl,
}: {
  page: SeoPageStatus;
  onRegenerate: (id: string) => void;
  regenerating: string | null;
  siteUrl: string;
}) {
  const isRegenerating = regenerating === page.id;
  const editHref = page.group === "content"
    ? `/modonty/pages/${page.id}`
    : undefined;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          {page.group === "list" ? (
            <Globe className="h-4 w-4 text-blue-500 shrink-0" />
          ) : (
            <FileText className="h-4 w-4 text-violet-500 shrink-0" />
          )}
          <div>
            <p className="font-medium text-sm">{page.name}</p>
            <p className="text-xs text-muted-foreground">{siteUrl}{page.path}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge ok={page.hasMetaTags} />
      </TableCell>
      <TableCell>
        <StatusBadge ok={page.hasJsonLd} />
      </TableCell>
      <TableCell>
        <div>
          {page.seoTitle ? (
            <p className="text-xs truncate max-w-[200px]" title={page.seoTitle}>{page.seoTitle}</p>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-xs text-muted-foreground">{formatDate(page.lastGenerated)}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => onRegenerate(page.id)}
            disabled={isRegenerating}
            title="Regenerate SEO"
          >
            {isRegenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
          {editHref && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              asChild
            >
              <a href={editHref}>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function SeoOverviewClient({ listPages, contentPages, stats }: SeoOverviewClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState<BulkProgress | null>(null);
  const [bulkDone, setBulkDone] = useState(false);

  const siteUrl = "modonty.com";
  const metaPercent = Math.round((stats.withMeta / stats.totalPages) * 100);
  const jsonLdPercent = Math.round((stats.withJsonLd / stats.totalPages) * 100);
  const allGood = metaPercent === 100 && jsonLdPercent === 100;

  const handleRegenerate = async (id: string) => {
    setRegenerating(id);
    const page = [...listPages, ...contentPages].find((p) => p.id === id);
    try {
      const result = page?.group === "list"
        ? await regenerateListPageSeo(id)
        : await regenerateContentPageSeo(id);
      if (result.success) {
        toast({ title: messages.success.updated, description: messages.descriptions.search_data_updated, variant: "success" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: messages.error.update_failed, description: result.error || messages.descriptions.search_data_updated });
      }
    } finally {
      setRegenerating(null);
    }
  };

  const handleRegenerateAll = useCallback(async () => {
    const allPages = [...listPages, ...contentPages];
    setBulkDone(false);
    setBulkProgress({
      total: allPages.length,
      completed: 0,
      current: allPages[0]?.name || "",
      results: [],
    });

    const results: Array<{ name: string; success: boolean; error?: string }> = [];

    for (let i = 0; i < allPages.length; i++) {
      const page = allPages[i];
      setBulkProgress((prev) => prev && ({
        ...prev,
        current: page.name,
        completed: i,
        results: [...results],
      }));

      let success = false;
      let error: string | undefined;
      try {
        const result = page.group === "list"
          ? await regenerateListPageSeo(page.id)
          : await regenerateContentPageSeo(page.id);
        success = result.success;
        if (!success) error = result.error || "Unknown error";
      } catch (e) {
        success = false;
        error = e instanceof Error ? e.message : "Unknown error";
      }
      results.push({ name: page.name, success, error });
    }

    setBulkProgress({
      total: allPages.length,
      completed: allPages.length,
      current: "",
      results,
    });
    setBulkDone(true);
    router.refresh();
  }, [listPages, contentPages, router]);

  const closeBulkDialog = () => {
    setBulkProgress(null);
    setBulkDone(false);
  };

  const successCount = bulkProgress?.results.filter((r) => r.success).length ?? 0;
  const skippedCount = bulkProgress?.results.filter((r) => !r.success && (r.error?.includes("under development") || r.error?.includes("no content yet"))).length ?? 0;
  const failCount = bulkProgress?.results.filter((r) => !r.success && !(r.error?.includes("under development") || r.error?.includes("no content yet"))).length ?? 0;
  const progressPercent = bulkProgress
    ? Math.round((bulkProgress.completed / bulkProgress.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Bulk Progress Dialog */}
      <Dialog open={bulkProgress !== null} onOpenChange={(open) => { if (!open && bulkDone) closeBulkDialog(); }}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => { if (!bulkDone) e.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {bulkDone ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Regeneration Complete
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 text-amber-500 animate-pulse" />
                  Regenerating SEO...
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {bulkDone ? "All pages processed" : `Processing: ${bulkProgress?.current}`}
                </span>
                <span className="font-mono font-medium">
                  {bulkProgress?.completed ?? 0}/{bulkProgress?.total ?? 0}
                </span>
              </div>
              <Progress value={bulkDone ? 100 : progressPercent} className="h-2" />
            </div>

            {/* Results summary */}
            {bulkDone && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">{successCount} succeeded</span>
                </div>
                {skippedCount > 0 && (
                  <div className="flex items-center gap-1.5 text-yellow-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{skippedCount} skipped</span>
                  </div>
                )}
                {failCount > 0 && (
                  <div className="flex items-center gap-1.5 text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{failCount} failed</span>
                  </div>
                )}
              </div>
            )}

            {/* Live results feed */}
            <div className="max-h-[240px] overflow-y-auto space-y-1 rounded-lg border p-2">
              {bulkProgress?.results.map((r, i) => {
                const isSkipped = r.error?.includes("under development") || r.error?.includes("no content yet");
                return (
                  <div key={i} className="py-1.5 px-2 rounded hover:bg-muted/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className={r.success ? "text-muted-foreground" : "text-foreground"}>{r.name}</span>
                      {r.success ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : isSkipped ? (
                        <Clock className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                      )}
                    </div>
                    {r.error && (
                      <p className={`text-xs font-medium mt-1 ps-0.5 ${isSkipped ? "text-yellow-600" : "text-destructive"}`}>
                        {r.error}
                      </p>
                    )}
                  </div>
                );
              })}
              {!bulkDone && bulkProgress && bulkProgress.completed < bulkProgress.total && (
                <div className="flex items-center gap-2 py-1 px-2 text-sm text-muted-foreground animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {bulkProgress.current}...
                </div>
              )}
            </div>

            {/* Close button */}
            {bulkDone && (
              <Button onClick={closeBulkDialog} className="w-full gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Done
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Banner */}
      <Card className={allGood ? "border-emerald-500/30 bg-emerald-500/[0.03]" : "border-yellow-500/30 bg-yellow-500/[0.03]"}>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-4">
            {allGood ? (
              <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-yellow-500/15 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-base">
                {allGood ? "All pages have SEO data" : `${stats.withMeta} of ${stats.totalPages} pages have SEO data`}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {allGood
                  ? "Meta tags and structured data are generated for all pages"
                  : `${stats.totalPages - stats.withMeta} pages still need content or SEO generation`
                }
              </p>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.withMeta}<span className="text-sm font-normal text-muted-foreground">/{stats.totalPages}</span></p>
                <p className="text-[11px] text-muted-foreground">Meta Tags</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.withJsonLd}<span className="text-sm font-normal text-muted-foreground">/{stats.totalPages}</span></p>
                <p className="text-[11px] text-muted-foreground">JSON-LD</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regenerate All — single button at top */}
      <div className="flex justify-end">
        <Button
          onClick={handleRegenerateAll}
          disabled={bulkProgress !== null}
          className="gap-2"
        >
          <Zap className="h-4 w-4" />
          Regenerate All ({stats.totalPages} pages)
        </Button>
      </div>

      {/* List Pages Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">List Pages</CardTitle>
            <Badge variant="secondary" className="text-xs">{listPages.length}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Home, Clients, Categories, Trending, Tags, Industries, Articles</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Meta Tags</TableHead>
                <TableHead>JSON-LD</TableHead>
                <TableHead>SEO Title</TableHead>
                <TableHead>Last Generated</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listPages.map((page) => (
                <PageRow
                  key={page.id}
                  page={page}
                  onRegenerate={handleRegenerate}
                  regenerating={regenerating}
                  siteUrl={siteUrl}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Content Pages Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-base">Content Pages</CardTitle>
            <Badge variant="secondary" className="text-xs">{contentPages.length}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">About, Terms, Privacy Policy, Cookie Policy, Copyright Policy, User Agreement</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Meta Tags</TableHead>
                <TableHead>JSON-LD</TableHead>
                <TableHead>SEO Title</TableHead>
                <TableHead>Last Generated</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contentPages.map((page) => (
                <PageRow
                  key={page.id}
                  page={page}
                  onRegenerate={handleRegenerate}
                  regenerating={regenerating}
                  siteUrl={siteUrl}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
