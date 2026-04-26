import Link from "next/link";
import { Zap, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { SITE_BASE_URL } from "@/lib/gsc/client";

import type { PublishedArticleRef } from "@/lib/gsc/coverage";

interface Props {
  pendingIndexing: PublishedArticleRef[];
}

export function PendingIndexingCard({ pendingIndexing }: Props) {
  const total = pendingIndexing.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">Pending Indexing</CardTitle>
            {total > 0 ? (
              <Badge className="text-xs bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20">
                {total} article{total === 1 ? "" : "s"}
              </Badge>
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
              <strong>Reference list</strong> — these articles are PUBLISHED in your DB but Google hasn&apos;t shown them in search results yet. Click <strong>Open Pipeline →</strong> on any row to walk that article through the 10-stage quality gate before indexing.
            </p>
            <div className="overflow-x-auto border-t">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-10">#</th>
                    <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Title</th>
                    <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Slug</th>
                    <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-44">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendingIndexing.map((article, i) => {
                    const url = `${SITE_BASE_URL}/articles/${article.slug}`;
                    return (
                      <tr key={article.id} className="hover:bg-muted/40">
                        <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums">
                          {i + 1}
                        </td>
                        <td className="px-4 py-2.5 max-w-md">
                          <span className="font-medium line-clamp-1" title={article.title}>
                            {article.title}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 max-w-sm">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            dir="ltr"
                            className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                          >
                            <span className="truncate max-w-[280px]">/articles/{article.slug}</span>
                            <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
                          </a>
                        </td>
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/search-console/pipeline/${article.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                          >
                            Open Pipeline
                            <ArrowRight className="h-3 w-3" />
                          </Link>
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
