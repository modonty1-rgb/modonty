import Link from "@/components/link";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RelativeTime } from "@/components/RelativeTime";
import { TrendingUp, Eye, Heart, MessageCircle } from "lucide-react";

interface TrendingArticle {
  id: string;
  title: string;
  excerpt?: string;
  slug: string;
  image?: string;
  publishedAt: string;
  client: {
    name: string;
    slug: string;
    logo?: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  interactions: {
    views: number;
    likes: number;
    comments: number;
  };
  readingTimeMinutes?: number;
}

interface TrendingArticlesProps {
  articles: TrendingArticle[];
  showTitle?: boolean;
}

export function TrendingArticles({ articles, showTitle = true }: TrendingArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="my-8 md:my-12" aria-labelledby="trending-heading">
      {showTitle && (
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 id="trending-heading" className="text-2xl font-bold">
            المقالات الرائجة
          </h2>
          <Badge variant="secondary" className="text-xs">
            آخر 7 أيام
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {articles.map((article, index) => (
          <Link key={article.id} href={`/articles/${article.slug}`}>
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full relative overflow-hidden group">
              {/* Trending Badge */}
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>#{index + 1}</span>
                </Badge>
              </div>

              {/* Featured Image */}
              {article.image && (
                <div className="aspect-video w-full overflow-hidden relative">
                  <OptimizedImage
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index < 3}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">
                    {article.client.name}
                  </span>
                  {article.category && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {article.category.name}
                      </span>
                    </>
                  )}
                </div>

                <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>

                {article.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {article.excerpt}
                  </p>
                )}
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{article.interactions.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      <span>{article.interactions.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{article.interactions.comments}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {article.readingTimeMinutes && (
                      <>
                        <span>⏱️ {article.readingTimeMinutes} د</span>
                        <span>•</span>
                      </>
                    )}
                    <RelativeTime
                      date={article.publishedAt}
                      dateTime={article.publishedAt}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
