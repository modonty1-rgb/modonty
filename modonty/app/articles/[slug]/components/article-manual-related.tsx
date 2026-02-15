"use client";

import Link from "@/components/link";
import { Card } from "@/components/ui/card";
import { ArticleSectionCollapsible } from "./article-section-collapsible";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { RelativeTime } from "@/components/date/RelativeTime";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  HelpCircle,
  Link2,
} from "lucide-react";

interface ArticleManualRelatedProps {
  relatedArticles: Array<{
    id: string;
    related: {
      id: string;
      slug: string;
      title: string;
      excerpt: string | null;
      datePublished: Date | null;
      createdAt: Date;
      featuredImage: {
        url: string;
        altText: string | null;
      } | null;
      client: {
        name: string;
        slug: string;
      };
      _count: {
        likes: number;
        dislikes: number;
        comments: number;
        faqs: number;
      };
    };
  }>;
}

export function ArticleManualRelated({ relatedArticles }: ArticleManualRelatedProps) {
  if (!relatedArticles || relatedArticles.length === 0) return null;

  return (
    <ArticleSectionCollapsible
      title="مقالات ذات صلة"
      headingId="manual-related-articles-heading"
      icon={Link2}
    >
      {relatedArticles.map(({ id, related }) => (
        <Link key={id} href={`/articles/${related.slug}`} className="h-full block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-row overflow-hidden">
            <div className="flex-[0_0_80%] flex flex-col min-w-0 min-h-[7.5rem] p-4 text-right justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  في {related.client.name}
                </p>
                <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-1">
                  {related.title}
                </h3>
                {related.excerpt && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {related.excerpt}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mt-2 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1" aria-label="الإعجابات">
                    <ThumbsUp className="h-3.5 w-3.5 shrink-0" />
                    <span className="tabular-nums">{related._count.likes.toLocaleString("ar-SA")}</span>
                  </span>
                  <span className="flex items-center gap-1" aria-label="عدم الإعجاب">
                    <ThumbsDown className="h-3.5 w-3.5 shrink-0" />
                    <span className="tabular-nums">{related._count.dislikes.toLocaleString("ar-SA")}</span>
                  </span>
                  <span className="flex items-center gap-1" aria-label="التعليقات">
                    <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="tabular-nums">{related._count.comments.toLocaleString("ar-SA")}</span>
                  </span>
                  <span className="flex items-center gap-1" aria-label="الأسئلة">
                    <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="tabular-nums">{related._count.faqs.toLocaleString("ar-SA")}</span>
                  </span>
                </div>
                <RelativeTime
                  date={related.datePublished ?? related.createdAt}
                  dateTime={(related.datePublished ?? related.createdAt).toISOString()}
                />
              </div>
            </div>
            {related.featuredImage ? (
              <div className="flex-[0_0_20%] aspect-square relative overflow-hidden bg-muted">
                <OptimizedImage
                  src={related.featuredImage.url}
                  alt={related.featuredImage.altText || related.title}
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
    </ArticleSectionCollapsible>
  );
}
