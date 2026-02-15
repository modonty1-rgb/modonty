"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleSectionCollapsible } from "./article-section-collapsible";
import Link from "@/components/link";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { RelativeTime } from "@/components/date/RelativeTime";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchRelatedArticlesByCategoryTags } from "../actions/article-lazy-actions";

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  datePublished: Date | null;
  createdAt: Date;
  featuredImage?: { url: string; altText: string | null } | null;
  client: { name: string; slug: string };
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  questionsCount: number;
}

interface RelatedArticlesProps {
  articleId: string;
}

function RelatedArticlesSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="flex flex-row overflow-hidden">
          <div className="flex-[0_0_80%] flex flex-col min-h-[7.5rem] p-4 justify-between gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="flex gap-3 mt-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
          <div className="flex-[0_0_20%] aspect-square">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function RelatedArticles({ articleId }: RelatedArticlesProps) {
  const [open, setOpen] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || fetched) return;
    setLoading(true);
    setError(null);
    fetchRelatedArticlesByCategoryTags(articleId)
      .then((data) => {
        setRelatedArticles(data ?? []);
        setFetched(true);
      })
      .catch(() => setError("فشل تحميل المقالات المقترحة"))
      .finally(() => setLoading(false));
  }, [open, fetched, articleId]);

  const retry = () => { setFetched(false); setError(null); };

  return (
    <ArticleSectionCollapsible
      title="مقالات قد تهمك"
      headingId="related-articles-heading"
      icon={Sparkles}
      open={open}
      onOpenChange={setOpen}
    >
      {loading && <RelatedArticlesSkeleton />}
      {!loading && !error && relatedArticles && relatedArticles.length > 0 && (
        <>
          {relatedArticles.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`} className="h-full block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-row overflow-hidden">
                <div className="flex-[0_0_80%] flex flex-col min-w-0 min-h-[7.5rem] p-4 text-right justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      في {article.client.name}
                    </p>
                    <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-1">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mt-2 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1" aria-label="الإعجابات">
                        <ThumbsUp className="h-3.5 w-3.5 shrink-0" />
                        <span className="tabular-nums">{article.likesCount.toLocaleString("ar-SA")}</span>
                      </span>
                      <span className="flex items-center gap-1" aria-label="عدم الإعجاب">
                        <ThumbsDown className="h-3.5 w-3.5 shrink-0" />
                        <span className="tabular-nums">{article.dislikesCount.toLocaleString("ar-SA")}</span>
                      </span>
                      <span className="flex items-center gap-1" aria-label="التعليقات">
                        <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                        <span className="tabular-nums">{article.commentsCount.toLocaleString("ar-SA")}</span>
                      </span>
                      <span className="flex items-center gap-1" aria-label="الأسئلة">
                        <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                        <span className="tabular-nums">{article.questionsCount.toLocaleString("ar-SA")}</span>
                      </span>
                    </div>
                    <RelativeTime
                      date={article.datePublished ?? article.createdAt}
                      dateTime={(article.datePublished ?? article.createdAt).toISOString()}
                    />
                  </div>
                </div>
                {article.featuredImage ? (
                  <div className="flex-[0_0_20%] aspect-square relative overflow-hidden bg-muted">
                    <OptimizedImage
                      src={article.featuredImage.url}
                      alt={article.featuredImage.altText || article.title}
                      fill
                      className="object-cover"
                      sizes="20vw"
                    />
                  </div>
                ) : (
                  <div className="flex-[0_0_20%] aspect-square bg-muted" />
                )}
              </Card>
            </Link>
          ))}
        </>
      )}
      {!loading && error && (
        <div className="py-4 text-center">
          <p className="text-sm text-destructive mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={retry}>إعادة المحاولة</Button>
        </div>
      )}
      {!loading && fetched && !error && relatedArticles?.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">لا توجد مقالات مقترحة</p>
      )}
    </ArticleSectionCollapsible>
  );
}
