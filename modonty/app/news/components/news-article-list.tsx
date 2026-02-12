import Link from "@/components/link";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { Clock, ArrowLeft } from "lucide-react";
import { formatReadingTime, formatPublishDate } from "../helpers/format";
import type { ArticleResponse } from "@/lib/types";

interface NewsArticleListProps {
  articles: ArticleResponse[];
}

export function NewsArticleList({ articles }: NewsArticleListProps) {
  if (articles.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        لا توجد أخبار حالياً.
      </p>
    );
  }

  return (
    <ul className="space-y-4" aria-label="أخبار مودونتي">
      {articles.map((article) => (
        <li key={article.id}>
          <Link href={`/articles/${article.slug}`}>
            <article className="group bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:border-primary">
              <div className="flex gap-4">
                {article.image ? (
                  <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <OptimizedImage
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="96px"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 shrink-0 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {article.title[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    {article.client.logo && (
                      <OptimizedImage
                        src={article.client.logo}
                        alt={article.client.name}
                        width={14}
                        height={14}
                        className="rounded"
                      />
                    )}
                    <span>{article.client.name}</span>
                    {article.readingTimeMinutes != null && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatReadingTime(article.readingTimeMinutes)}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <time dateTime={article.publishedAt}>
                      {formatPublishDate(article.publishedAt)}
                    </time>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 mt-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    قراءة المزيد
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </li>
      ))}
    </ul>
  );
}
