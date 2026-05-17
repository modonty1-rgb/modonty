import { Card } from "@/components/ui/card";
import { ArticleSectionCollapsible } from "./article-section-collapsible";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { RelativeTime } from "@/components/date/RelativeTime";
import {
  IconLike,
  IconComment,
  IconHelp,
  IconArticleList,
} from "@/lib/icons";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  datePublished: Date | null;
  createdAt: Date;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  category: {
    name: string;
    slug: string;
  } | null;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  questionsCount: number;
}

interface MoreFromClientProps {
  clientId: string;
  articleId: string;
  clientName: string;
  articles: Article[];
}

export function MoreFromClient({ clientId, articleId, clientName, articles }: MoreFromClientProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <ArticleSectionCollapsible
      title={`المزيد من ${clientName}`}
      headingId="more-from-client-heading"
      icon={<IconArticleList className="h-4 w-4 shrink-0 text-muted-foreground" />}
      defaultOpen={true}
    >
      {articles.map((article) => (
        <CtaTrackedLink
          key={article.id}
          href={`/articles/${article.slug}`}
          label={article.title}
          type="LINK"
          articleId={articleId}
          clientId={clientId}
          className="h-full block"
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-row overflow-hidden">
            <div className="flex-[0_0_80%] flex flex-col min-w-0 min-h-[7.5rem] p-4 text-right justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {article.category
                    ? `في ${article.category.name} من ${clientName}`
                    : `من ${clientName}`}
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
                    <IconLike className="h-3.5 w-3.5 shrink-0" />
                    <span className="tabular-nums">{article.likesCount.toLocaleString("ar-SA")}</span>
                  </span>
                  <span className="flex items-center gap-1" aria-label="التعليقات">
                    <IconComment className="h-3.5 w-3.5 shrink-0" />
                    <span className="tabular-nums">{article.commentsCount.toLocaleString("ar-SA")}</span>
                  </span>
                  <span className="flex items-center gap-1" aria-label="الأسئلة">
                    <IconHelp className="h-3.5 w-3.5 shrink-0" />
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
        </CtaTrackedLink>
      ))}
    </ArticleSectionCollapsible>
  );
}
