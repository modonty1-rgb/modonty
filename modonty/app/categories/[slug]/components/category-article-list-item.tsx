import Link from "@/components/link";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Heart, MessageCircle, Bookmark, Clock, Eye, ArrowLeft } from "lucide-react";
import { optimizeCloudinaryImage, generateBlurDataURL } from "../../helpers/category-utils";
import { formatReadingTime, formatPublishDate, formatEngagementCount } from "../helpers/article-utils";
import type { ArticleResponse } from "@/app/api/helpers/types";

interface CategoryArticleListItemProps {
  article: ArticleResponse;
  priority?: boolean;
}

export function CategoryArticleListItem({ article, priority = false }: CategoryArticleListItemProps) {
  const optimizedImageUrl = article.featuredImage?.url
    ? optimizeCloudinaryImage(article.featuredImage.url, {
        width: 256,
        height: 256,
        quality: 'auto',
        format: 'auto'
      })
    : null;

  return (
    <Link href={`/articles/${article.slug}`}>
      <div className="group bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:border-primary cursor-pointer">
        <div className="flex gap-4">
          {optimizedImageUrl ? (
            <div className="relative w-32 h-32 shrink-0 overflow-hidden rounded-lg bg-muted">
              <OptimizedImage
                src={optimizedImageUrl}
                alt={article.featuredImage?.altText || article.title}
                fill
                priority={priority}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="128px"
              />
            </div>
          ) : (
            <div className="w-32 h-32 shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
              <span className="text-3xl font-bold text-primary/20">
                {article.title[0]}
              </span>
            </div>
          )}

          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {article.client.logo && (
                  <OptimizedImage
                    src={article.client.logo}
                    alt={article.client.name}
                    width={16}
                    height={16}
                    className="rounded"
                  />
                )}
                <span className="text-xs text-muted-foreground">{article.client.name}</span>
                {article.readingTimeMinutes && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatReadingTime(article.readingTimeMinutes)}</span>
                    </div>
                  </>
                )}
              </div>

              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                {article.title}
              </h3>

              {article.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {article.author.image && (
                    <OptimizedImage
                      src={article.author.image}
                      alt={article.author.name}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  )}
                  <span>{article.author.name}</span>
                </div>

                <span className="text-xs text-muted-foreground">
                  {formatPublishDate(article.publishedAt)}
                </span>

                <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/50 rounded-full">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer min-w-[2.5rem]">
                    <Eye className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium tabular-nums">{formatEngagementCount(article.interactions.views)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer min-w-[2.5rem]">
                    <Heart className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium tabular-nums">{formatEngagementCount(article.interactions.likes)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer min-w-[2.5rem]">
                    <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium tabular-nums">{formatEngagementCount(article.interactions.comments)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer min-w-[2.5rem]">
                    <Bookmark className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium tabular-nums">{formatEngagementCount(article.interactions.favorites)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium hidden sm:inline">قراءة المزيد</span>
                <ArrowLeft className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
