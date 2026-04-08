"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { messages } from "@/lib/messages";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  XCircle,
  Loader2,
  Wrench,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ImageOff,
  Type,
  FileSearch,
  Link2,
  Code2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bulkFixArticleSeo, type ArticleSeoHealth, type BulkFixResult } from "./actions/articles-seo-actions";

interface ArticlesSeoHealthProps {
  articles: ArticleSeoHealth[];
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) {
    return (
      <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-mono tabular-nums">
        {score}%
      </Badge>
    );
  }
  if (score >= 60) {
    return (
      <Badge variant="outline" className="gap-1 border-yellow-500/30 text-yellow-600 bg-yellow-500/10 font-mono tabular-nums">
        {score}%
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 border-red-500/30 text-red-600 bg-red-500/10 font-mono tabular-nums">
      {score}%
    </Badge>
  );
}

function MissingBadges({ article }: { article: ArticleSeoHealth }) {
  const missing: { label: string; icon: React.ReactNode }[] = [];
  if (article.missingSeoTitle) missing.push({ label: "Title", icon: <Type className="h-3 w-3" /> });
  if (article.missingSeoDescription) missing.push({ label: "Description", icon: <FileSearch className="h-3 w-3" /> });
  if (article.missingCanonical) missing.push({ label: "Canonical", icon: <Link2 className="h-3 w-3" /> });
  if (article.missingJsonLd) missing.push({ label: "JSON-LD", icon: <Code2 className="h-3 w-3" /> });
  if (article.missingFeaturedImage) missing.push({ label: "Image", icon: <ImageOff className="h-3 w-3" /> });

  if (missing.length === 0) {
    return <span className="text-xs text-muted-foreground">All good</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {missing.map((m) => (
        <Badge key={m.label} variant="secondary" className="gap-1 text-[10px] px-1.5 py-0 h-5">
          {m.icon}
          {m.label}
        </Badge>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PUBLISHED":
      return <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px]">Published</Badge>;
    case "DRAFT":
      return <Badge variant="outline" className="border-slate-500/30 text-slate-600 bg-slate-500/10 text-[10px]">Draft</Badge>;
    case "WRITING":
      return <Badge variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-500/10 text-[10px]">Writing</Badge>;
    case "SCHEDULED":
      return <Badge variant="outline" className="border-violet-500/30 text-violet-600 bg-violet-500/10 text-[10px]">Scheduled</Badge>;
    case "ARCHIVED":
      return <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-500/10 text-[10px]">Archived</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
  }
}

export function ArticlesSeoHealth({ articles }: ArticlesSeoHealthProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [fixing, setFixing] = useState(false);
  const [fixResults, setFixResults] = useState<BulkFixResult[] | null>(null);
  const [fixProgress, setFixProgress] = useState(0);

  const redCount = articles.filter((a) => a.seoScore < 60).length;
  const yellowCount = articles.filter((a) => a.seoScore >= 60 && a.seoScore < 80).length;
  const greenCount = articles.filter((a) => a.seoScore >= 80).length;

  const sortedArticles = [...articles].sort((a, b) => a.seoScore - b.seoScore);

  const lowScoreIds = sortedArticles.filter((a) => a.seoScore < 80).map((a) => a.id);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllLow = () => {
    setSelected(new Set(lowScoreIds));
  };

  const clearSelection = () => {
    setSelected(new Set());
  };

  const handleBulkFix = useCallback(async () => {
    if (selected.size === 0) return;
    setFixing(true);
    setFixResults(null);
    setFixProgress(0);

    try {
      const ids = Array.from(selected);
      const result = await bulkFixArticleSeo(ids);
      setFixResults(result.results);
      setFixProgress(100);

      const improved = result.results.filter((r) => r.success && r.newScore > r.oldScore).length;
      const unchanged = result.results.filter((r) => r.success && r.newScore === r.oldScore).length;
      const failed = result.results.filter((r) => !r.success).length;

      if (failed === 0) {
        toast({
          title: messages.success.updated,
          description: `${improved} improved, ${unchanged} unchanged`,
          variant: "success",
        });
      } else {
        toast({
          title: messages.error.operation_failed,
          description: `${improved} improved, ${failed} failed`,
          variant: "destructive",
        });
      }

      router.refresh();
    } catch (error) {
      toast({
        title: messages.error.server_error,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setFixing(false);
    }
  }, [selected, router, toast]);

  const closeResults = () => {
    setFixResults(null);
    setSelected(new Set());
  };

  return (
    <>
      {/* Results Dialog */}
      <Dialog open={fixResults !== null} onOpenChange={(open) => { if (!open) closeResults(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Bulk SEO Fix Results
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {/* Summary */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {fixResults?.filter((r) => r.success && r.newScore > r.oldScore).length} improved
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-sm font-medium">
                  {fixResults?.filter((r) => r.success && r.newScore === r.oldScore).length} unchanged
                </span>
              </div>
              {(fixResults?.filter((r) => !r.success).length ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 text-destructive">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {fixResults?.filter((r) => !r.success).length} failed
                  </span>
                </div>
              )}
            </div>

            {/* Individual results */}
            <div className="max-h-[300px] overflow-y-auto space-y-1 rounded-lg border p-2">
              {fixResults?.map((r) => (
                <div key={r.articleId} className="py-1.5 px-2 rounded hover:bg-muted/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[280px]">{r.title}</span>
                    {r.success ? (
                      <span className="text-xs font-mono shrink-0 ms-2">
                        <span className="text-muted-foreground">{r.oldScore}%</span>
                        <span className="text-muted-foreground mx-1">→</span>
                        <span className={r.newScore > r.oldScore ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                          {r.newScore}%
                        </span>
                      </span>
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                    )}
                  </div>
                  {r.error && (
                    <p className="text-xs text-destructive mt-0.5">{r.error}</p>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={closeResults} className="w-full gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Banner */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-base">Articles SEO Health</CardTitle>
              <Badge variant="secondary" className="text-xs">{articles.length}</Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-muted-foreground">{redCount} below 60%</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">{yellowCount} 60-80%</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">{greenCount} above 80%</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* Score distribution bar */}
          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
            {redCount > 0 && (
              <div className="bg-red-500 transition-all" style={{ width: `${(redCount / articles.length) * 100}%` }} />
            )}
            {yellowCount > 0 && (
              <div className="bg-yellow-500 transition-all" style={{ width: `${(yellowCount / articles.length) * 100}%` }} />
            )}
            {greenCount > 0 && (
              <div className="bg-emerald-500 transition-all" style={{ width: `${(greenCount / articles.length) * 100}%` }} />
            )}
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selected.size > 0 ? (
                <>
                  <span className="text-sm text-muted-foreground">{selected.size} selected</span>
                  <Button variant="ghost" size="sm" onClick={clearSelection} className="h-7 text-xs">
                    Clear
                  </Button>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Select articles to fix</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {lowScoreIds.length > 0 && (
                <Button variant="outline" size="sm" onClick={selectAllLow} className="h-8 gap-1.5 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Select All Below 80% ({lowScoreIds.length})
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleBulkFix}
                disabled={selected.size === 0 || fixing}
                className="h-8 gap-1.5"
              >
                {fixing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wrench className="h-3.5 w-3.5" />
                )}
                Fix Selected ({selected.size})
              </Button>
            </div>
          </div>

          {/* Loading indicator */}
          {fixing && (
            <div className="space-y-2">
              <Progress value={fixProgress} className="h-1.5" />
              <p className="text-xs text-muted-foreground text-center">
                Fixing SEO for {selected.size} articles...
              </p>
            </div>
          )}

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selected.size > 0 && selected.size === sortedArticles.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelected(new Set(sortedArticles.map((a) => a.id)));
                        } else {
                          clearSelection();
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead className="w-20">Score</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead>Missing</TableHead>
                  <TableHead className="w-20">Words</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedArticles.map((article) => (
                  <TableRow key={article.id} className={article.seoScore < 60 ? "bg-red-500/[0.03]" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(article.id)}
                        onCheckedChange={() => toggleSelect(article.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <a
                          href={`/articles/${article.id}`}
                          className="text-sm font-medium hover:underline line-clamp-1"
                        >
                          {article.title}
                        </a>
                        {article.clientName && (
                          <p className="text-[11px] text-muted-foreground">{article.clientName}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ScoreBadge score={article.seoScore} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={article.status} />
                    </TableCell>
                    <TableCell>
                      <MissingBadges article={article} />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground font-mono">{article.wordCount.toLocaleString()}</span>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedArticles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No articles found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
