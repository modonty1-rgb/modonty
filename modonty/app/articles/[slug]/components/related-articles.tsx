import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "@/components/link";
import { OptimizedImage } from "@/components/OptimizedImage";
import { formatRelativeTime } from "@/lib/utils";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

interface RelatedArticlesProps {
  currentArticleId: string;
  categoryId: string | null;
  tagIds?: string[];
  limit?: number;
}

export async function RelatedArticles({
  currentArticleId,
  categoryId,
  tagIds = [],
  limit = 3,
}: RelatedArticlesProps) {
  try {
    // Build where clause for related articles
    const whereConditions: any = {
      id: { not: currentArticleId },
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    };

    // Try to find articles with same tags first (if tags exist)
    let relatedArticles: any[] = [];
    
    if (tagIds.length > 0) {
      relatedArticles = await db.article.findMany({
        where: {
          ...whereConditions,
          tags: {
            some: {
              tagId: { in: tagIds },
            },
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          datePublished: true,
          createdAt: true,
          featuredImage: {
            select: {
              url: true,
              altText: true,
            },
          },
          client: {
            select: {
              name: true,
              slug: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              views: true,
            },
          },
        },
        orderBy: [
          { datePublished: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
      });
    }

    // If not enough articles with tags, fill with same category
    if (relatedArticles.length < limit && categoryId) {
      const additionalArticles = await db.article.findMany({
        where: {
          ...whereConditions,
          categoryId,
          id: {
            not: currentArticleId,
            notIn: relatedArticles.map((a) => a.id),
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          datePublished: true,
          createdAt: true,
          featuredImage: {
            select: {
              url: true,
              altText: true,
            },
          },
          client: {
            select: {
              name: true,
              slug: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              views: true,
            },
          },
        },
        orderBy: [
          { datePublished: "desc" },
          { createdAt: "desc" },
        ],
        take: limit - relatedArticles.length,
      });

      relatedArticles = [...relatedArticles, ...additionalArticles];
    }

    // If still not enough, get most recent articles
    if (relatedArticles.length < limit) {
      const additionalArticles = await db.article.findMany({
        where: {
          ...whereConditions,
          id: {
            not: currentArticleId,
            notIn: relatedArticles.map((a) => a.id),
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          datePublished: true,
          createdAt: true,
          featuredImage: {
            select: {
              url: true,
              altText: true,
            },
          },
          client: {
            select: {
              name: true,
              slug: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              views: true,
            },
          },
        },
        orderBy: [
          { datePublished: "desc" },
          { createdAt: "desc" },
        ],
        take: limit - relatedArticles.length,
      });

      relatedArticles = [...relatedArticles, ...additionalArticles];
    }

    if (relatedArticles.length === 0) {
      return null;
    }

    return (
      <section className="my-8 md:my-12" aria-labelledby="related-articles-heading">
        <h2 id="related-articles-heading" className="text-xl font-semibold mb-6">
          مقالات قد تهمك
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {relatedArticles.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                {article.featuredImage && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
                    <OptimizedImage
                      src={article.featuredImage.url}
                      alt={article.featuredImage.altText || article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-base font-semibold">
                    {article.title}
                  </CardTitle>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {article.excerpt}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{article.client.name}</span>
                    <time
                      dateTime={article.datePublished?.toISOString()}
                      suppressHydrationWarning
                    >
                      {article.datePublished
                        ? formatRelativeTime(article.datePublished)
                        : formatRelativeTime(article.createdAt)}
                    </time>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    return null;
  }
}
