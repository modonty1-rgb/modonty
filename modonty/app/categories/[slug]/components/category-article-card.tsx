import Link from "@/components/link";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Bookmark, Clock, Eye } from "lucide-react";
import { optimizeCloudinaryImage, generateBlurDataURL } from "../../helpers/category-utils";
import { formatReadingTime, formatPublishDate, formatEngagementCount } from "../helpers/article-utils";
import type { ArticleResponse } from "@/app/api/helpers/types";

interface CategoryArticleCardProps {
  article: ArticleResponse;
  priority?: boolean;
}

export function CategoryArticleCard({ article, priority = false }: CategoryArticleCardProps) {
  const optimizedImageUrl = article.featuredImage?.url
    ? optimizeCloudinaryImage(article.featuredImage.url, {
        width: 600,
        height: 338,
        quality: 'auto',
        format: 'auto'
      })
    : null;

  return (
    <Link href={`/articles/${article.slug}`} className="h-full">
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col">
        {optimizedImageUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            <OptimizedImage
              src={optimizedImageUrl}
              alt={article.featuredImage?.altText || article.title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg flex items-center justify-center">
            <span className="text-4xl font-bold text-primary/20">
              {article.title[0]}
            </span>
          </div>
        )}

        <CardHeader className="pb-3 flex-1">
          <div className="flex items-center gap-2 mb-2">
            {article.client.logo && (
              <OptimizedImage
                src={article.client.logo}
                alt={article.client.name}
                width={20}
                height={20}
                className="rounded"
              />
            )}
            <span className="text-xs text-muted-foreground truncate">{article.client.name}</span>
            {article.readingTimeMinutes && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  <span>{formatReadingTime(article.readingTimeMinutes)}</span>
                </div>
              </>
            )}
          </div>
          
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
            {article.title}
          </CardTitle>
          
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2 min-h-[2.5rem]">
              {article.excerpt}
            </p>
          )}
        </CardHeader>

        <CardContent className="pb-3 pt-0">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground min-w-0">
              {article.author.image && (
                <OptimizedImage
                  src={article.author.image}
                  alt={article.author.name}
                  width={16}
                  height={16}
                  className="rounded-full shrink-0"
                />
              )}
              <span className="truncate">{article.author.name}</span>
            </div>
            <span className="text-muted-foreground shrink-0 ml-2">
              {formatPublishDate(article.publishedAt)}
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-3 pb-3 border-t bg-muted/30 mt-auto">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer min-w-[3rem]">
                <Eye className="h-4 w-4 shrink-0" />
                <span className="font-medium tabular-nums">{formatEngagementCount(article.interactions.views)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer min-w-[3rem]">
                <Heart className="h-4 w-4 shrink-0" />
                <span className="font-medium tabular-nums">{formatEngagementCount(article.interactions.likes)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer min-w-[3rem]">
                <MessageCircle className="h-4 w-4 shrink-0" />
                <span className="font-medium tabular-nums">{formatEngagementCount(article.interactions.comments)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer min-w-[3rem]">
                <Bookmark className="h-4 w-4 shrink-0" />
                <span className="font-medium tabular-nums">{formatEngagementCount(article.interactions.favorites)}</span>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
