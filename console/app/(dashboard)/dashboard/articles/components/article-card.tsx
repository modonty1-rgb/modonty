"use client";

import Image from "next/image";
import Link from "next/link";
import { ar } from "@/lib/ar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Check, MessageSquare, BarChart3, ExternalLink } from "lucide-react";
import type { ArticleWithAllData } from "../helpers/article-queries";
import { approveArticle, requestChanges } from "../actions/article-actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FeedbackForm } from "./feedback-form";

interface ArticleCardProps {
  article: ArticleWithAllData;
  siteUrl: string;
}

const READING_WORDS_PER_MINUTE = 200;

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(d));
}

export function ArticleCard({ article, siteUrl }: ArticleCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const isPending = article.status === "DRAFT";

  // Computed values — derive reading time from word count to avoid stale data
  const readingTime = article.wordCount
    ? Math.max(1, Math.ceil(article.wordCount / READING_WORDS_PER_MINUTE))
    : null;
  const displayDate = article.datePublished
    ? formatDate(article.datePublished)
    : formatDate(article.createdAt);
  const dateLabel = article.datePublished ? ar.articles.publishedOn : ar.articles.created;

  const visibleTags = article.tags.slice(0, 3);
  const remainingTags = Math.max(0, article.tags.length - visibleTags.length);

  // Smart link target — published articles open the live page on modonty.com,
  // pending articles open the in-console sandbox preview.
  const viewUrl = isPending
    ? `/dashboard/articles/${article.id}/preview`
    : `${siteUrl}/articles/${article.slug}`;
  const viewTarget = isPending ? undefined : "_blank";
  const viewRel = isPending ? undefined : "noopener noreferrer";

  const handleApprove = async () => {
    if (!confirm(ar.articles.approveConfirm)) return;
    setLoading(true);
    try {
      const result = await approveArticle(article.id, article.client.id);
      if (result.success) router.refresh();
      else alert(result.error || ar.articles.approveFailed);
    } catch {
      alert(ar.articles.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChanges = async (feedback: string) => {
    setLoading(true);
    try {
      const result = await requestChanges(article.id, article.client.id, feedback);
      if (result.success) {
        setShowFeedback(false);
        router.refresh();
      } else {
        alert(result.error || ar.articles.requestFailed);
      }
    } catch {
      alert(ar.articles.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden p-0 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex flex-col gap-4 p-4 sm:flex-row">
          {/* ─── Side thumbnail ─────────────────────────────────────── */}
          {article.featuredImage ? (
            <Link
              href={`/dashboard/articles/${article.id}/preview`}
              className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-48 sm:aspect-auto"
            >
              <Image
                src={article.featuredImage.url}
                alt={article.featuredImage.altText || article.title}
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="(max-width: 640px) 100vw, 192px"
              />
            </Link>
          ) : (
            <div className="grid aspect-video w-full shrink-0 place-items-center rounded-lg bg-muted text-xs text-muted-foreground sm:h-32 sm:w-48 sm:aspect-auto">
              {ar.articles.noImage ?? "بدون صورة"}
            </div>
          )}

          {/* ─── Body ────────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {/* Top row: status + category */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isPending
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                }`}
              >
                {isPending ? ar.articles.pendingApprovalStatus : ar.articles.published}
              </span>
              {article.category && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {article.category.name}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {dateLabel} {displayDate}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold leading-tight">
              <Link
                href={`/dashboard/articles/${article.id}/preview`}
                className="hover:text-primary transition-colors"
              >
                {article.title}
              </Link>
            </h3>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {article.excerpt}
              </p>
            )}

            {/* Tags + stats row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
              {article.wordCount && (
                <span className="text-muted-foreground">
                  {article.wordCount.toLocaleString("ar-SA")} {ar.articles.words}
                </span>
              )}
              {readingTime && (
                <span className="text-muted-foreground">
                  · {readingTime} {ar.articles.minRead}
                </span>
              )}
              {visibleTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  {visibleTags.map((t) => (
                    <span
                      key={t.tag.id}
                      className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      #{t.tag.name}
                    </span>
                  ))}
                  {remainingTags > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      +{remainingTags}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              {isPending ? (
                <Link href={`/dashboard/articles/${article.id}/preview`}>
                  <Button variant="outline" size="sm">
                    <Eye className="me-2 h-4 w-4" />
                    {ar.articles.preview}
                  </Button>
                </Link>
              ) : (
                <a
                  href={`${siteUrl}/articles/${article.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <ExternalLink className="me-2 h-4 w-4" />
                    عرض على الموقع
                  </Button>
                </a>
              )}
              {!isPending && (
                <Link href={`/dashboard/articles/${article.id}`}>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="me-2 h-4 w-4" />
                    {ar.articleStats.statsTitle}
                  </Button>
                </Link>
              )}
              {isPending && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleApprove}
                    disabled={loading}
                  >
                    <Check className="me-2 h-4 w-4" />
                    {ar.articles.approve}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFeedback(true)}
                    disabled={loading}
                  >
                    <MessageSquare className="me-2 h-4 w-4" />
                    {ar.articles.requestChanges}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {showFeedback && (
        <FeedbackForm
          articleTitle={article.title}
          onSubmit={handleRequestChanges}
          onCancel={() => setShowFeedback(false)}
        />
      )}
    </>
  );
}
