import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Inbox } from "lucide-react";
import { SITE_BASE_URL } from "@/lib/gsc/client";
import { validateArticleFromDb } from "@/lib/seo/article-validator-db";
import {
  isValidTransitionSlug,
  getTransition,
  type TransitionSlug,
} from "../lib/transitions";
import { TransitionButton } from "../components/transition-button";
import { GatedTransitionButton } from "../components/gated-transition-button";
import { ScheduledRowActions } from "../components/scheduled-row-actions";
import { SeoHealthCell } from "../components/seo-health-cell";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ transition: string }>;
}

export default async function WorkflowTransitionPage({ params }: PageProps) {
  const { transition } = await params;

  if (!isValidTransitionSlug(transition)) {
    notFound();
  }

  const config = getTransition(transition as TransitionSlug);

  const articles = await db.article.findMany({
    where: { status: config.from },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      content: true,
      excerpt: true,
      updatedAt: true,
      createdAt: true,
      datePublished: true,
      dateModified: true,
      scheduledAt: true,
      seoTitle: true,
      seoDescription: true,
      wordCount: true,
      articleBodyText: true,
      canonicalUrl: true,
      jsonLdStructuredData: true,
      jsonLdLastGenerated: true,
      jsonLdValidationReport: true,
      nextjsMetadata: true,
      nextjsMetadataLastGenerated: true,
      featuredImageId: true,
      client: {
        select: {
          name: true,
          slug: true,
          logoMedia: { select: { url: true, width: true, height: true } },
        },
      },
      author: { select: { name: true } },
      featuredImage: {
        select: { url: true, altText: true, width: true, height: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  // The 28-check gate runs ONLY at draft → approval. Once an article passes
  // this gate and enters AWAITING_APPROVAL, it's guaranteed technically clean.
  // Subsequent transitions (approval→revision, approval→scheduled, scheduled→published)
  // trust this guarantee — no re-validation, no pill, no disabled button.
  const showSeoCheck = transition === "draft-to-approval";
  const seoResults = showSeoCheck
    ? articles.map((a) =>
        validateArticleFromDb({
          id: a.id,
          slug: a.slug,
          title: a.title,
          url: `${SITE_BASE_URL}/articles/${a.slug}`,
          status: a.status,
          content: a.content,
          excerpt: a.excerpt,
          seoTitle: a.seoTitle,
          seoDescription: a.seoDescription,
          wordCount: a.wordCount,
          articleBodyText: a.articleBodyText,
          canonicalUrl: a.canonicalUrl,
          datePublished: a.datePublished,
          dateModified: a.dateModified,
          scheduledAt: a.scheduledAt,
          jsonLdStructuredData: a.jsonLdStructuredData,
          jsonLdLastGenerated: a.jsonLdLastGenerated,
          jsonLdValidationReport: a.jsonLdValidationReport,
          nextjsMetadata: a.nextjsMetadata,
          nextjsMetadataLastGenerated: a.nextjsMetadataLastGenerated,
          featuredImageId: a.featuredImageId,
          featuredImage: a.featuredImage
            ? {
                altText: a.featuredImage.altText,
                width: a.featuredImage.width,
                height: a.featuredImage.height,
              }
            : null,
          author: a.author ? { name: a.author.name } : null,
          client: a.client
            ? {
                name: a.client.name,
                logoMedia: a.client.logoMedia
                  ? {
                      url: a.client.logoMedia.url,
                      width: a.client.logoMedia.width,
                      height: a.client.logoMedia.height,
                    }
                  : null,
              }
            : null,
        }),
      )
    : [];

  return (
    <div className="px-6 py-6 max-w-[1280px] mx-auto space-y-5">
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
          <h1 className="text-xl font-semibold leading-tight">
            {config.pageTitle}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {config.pageDescription}
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 gap-1.5 text-xs px-3 py-1.5">
          <Inbox className="h-3.5 w-3.5" />
          {articles.length} article{articles.length !== 1 ? "s" : ""} in {config.fromLabel}
        </Badge>
      </div>

      {/* Empty state */}
      {articles.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center text-center gap-3 text-muted-foreground">
            <Inbox className="h-10 w-10 opacity-40" />
            <div>
              <p className="font-medium text-foreground">
                No articles in {config.fromLabel}
              </p>
              <p className="text-xs mt-1">
                Articles in this stage will appear here when they are ready to move to {config.toLabel}.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="divide-y overflow-hidden">
          {articles.map((article, idx) => (
            <div
              key={article.id}
              className="flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors"
            >
              {/* Avatar-sized thumbnail */}
              <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-muted ring-1 ring-border/60">
                {article.featuredImage?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.featuredImage.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              {/* Info column */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <Link
                  href={`/articles/${article.id}`}
                  className="block font-semibold text-base leading-snug hover:text-primary transition-colors truncate text-left"
                >
                  {article.title}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  {article.client?.name && (
                    <span className="truncate">{article.client.name}</span>
                  )}
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
                  {article.scheduledAt && config.from === "SCHEDULED" && (
                    <>
                      <span className="opacity-50">·</span>
                      <span className="text-amber-600 font-medium">
                        Scheduled for{" "}
                        {new Intl.DateTimeFormat("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(article.scheduledAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions row — different per transition */}
              <div className="flex items-center gap-2 shrink-0">
                {transition === "draft-to-approval" ? (
                  <GatedTransitionButton
                    articleId={article.id}
                    actionLabel={config.actionLabel}
                    hasErrors={(seoResults[idx]?.failedCount ?? 0) > 0}
                  />
                ) : transition === "scheduled-to-published" ? (
                  <ScheduledRowActions
                    articleId={article.id}
                    articleTitle={article.title}
                    scheduledAt={article.scheduledAt}
                  />
                ) : (
                  <TransitionButton
                    articleId={article.id}
                    articleTitle={article.title}
                    expectedFrom={config.from}
                    toStatus={config.to}
                    actionLabel={config.actionLabel}
                    confirmTitle={config.confirmTitle}
                    confirmDescription={config.confirmDescription}
                    successMessage={config.successMessage}
                  />
                )}
                {showSeoCheck && seoResults[idx] && (
                  <SeoHealthCell articleId={article.id} result={seoResults[idx]} />
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
