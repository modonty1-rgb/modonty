import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Inbox, Wrench } from "lucide-react";
import { ArticleStatus } from "@prisma/client";

import { getStatusLabel, getStatusVariant } from "../../helpers/status-utils";
import { getRollbackTargets } from "../lib/rollback-targets";
import { MaintenanceRowActions } from "./components/maintenance-row-actions";

export const dynamic = "force-dynamic";

export default async function StatusMaintenancePage() {
  // Every non-published article. Published ones are live and intentionally excluded.
  const articles = await db.article.findMany({
    where: { status: { not: ArticleStatus.PUBLISHED } },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
      client: { select: { name: true } },
      author: { select: { name: true } },
      featuredImage: { select: { url: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-[1280px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1.5 min-w-0">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to all articles
          </Link>
          <h1 className="text-xl font-semibold leading-tight flex items-center gap-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            Status Maintenance
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Roll a stuck article <strong>back</strong> to an earlier stage (Draft or Writing).
            Published articles are live and never appear here. Resetting clears any schedule and
            client approval, so the article re-enters the workflow and must be approved by the
            client again before it can be published.
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 gap-1.5 text-xs px-3 py-1.5">
          <Inbox className="h-3.5 w-3.5" />
          {articles.length} non-published article{articles.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Empty state */}
      {articles.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center text-center gap-3 text-muted-foreground">
            <Inbox className="h-10 w-10 opacity-40" />
            <div>
              <p className="font-medium text-foreground">No articles to maintain</p>
              <p className="text-xs mt-1">
                Every article is either published or has no earlier stage to roll back to.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="divide-y overflow-hidden">
          {articles.map((article) => {
            const targets = getRollbackTargets(article.status);
            return (
              <div
                key={article.id}
                className="flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors"
              >
                {/* Thumbnail */}
                <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-muted ring-1 ring-border/60">
                  {article.featuredImage?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={article.featuredImage.url} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Link
                    href={`/articles/${article.id}`}
                    className="block font-semibold text-base leading-snug hover:text-primary transition-colors truncate text-left"
                  >
                    {article.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <Badge variant={getStatusVariant(article.status)} className="text-[10px]">
                      {getStatusLabel(article.status)}
                    </Badge>
                    {article.client?.name && <span className="truncate">{article.client.name}</span>}
                    {article.author?.name && (
                      <>
                        <span className="opacity-50">·</span>
                        <span className="truncate">{article.author.name}</span>
                      </>
                    )}
                    <span className="opacity-50">·</span>
                    <span>
                      Updated{" "}
                      {new Intl.DateTimeFormat("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(article.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <MaintenanceRowActions
                  articleId={article.id}
                  articleTitle={article.title}
                  currentStatus={article.status}
                  targets={targets}
                />
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
