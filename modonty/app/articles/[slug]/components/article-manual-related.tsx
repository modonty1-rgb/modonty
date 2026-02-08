import Link from "@/components/link";
import { Card, CardContent } from "@/components/ui/card";
import { OptimizedImage } from "@/components/OptimizedImage";
import { RelativeTime } from "@/components/RelativeTime";

interface ArticleManualRelatedProps {
  relatedArticles: Array<{
    id: string;
    related: {
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
    };
  }>;
}

export function ArticleManualRelated({ relatedArticles }: ArticleManualRelatedProps) {
  if (!relatedArticles || relatedArticles.length === 0) return null;

  return (
    <section className="my-8 md:my-12" aria-labelledby="manual-related-articles-heading">
      <h2 id="manual-related-articles-heading" className="text-xl font-semibold mb-6">مقالات ذات صلة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {relatedArticles.map((related) => (
          <Link
            key={related.id}
            href={`/articles/${related.related.slug}`}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              {related.related.featuredImage && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
                  <OptimizedImage
                    src={related.related.featuredImage.url}
                    alt={related.related.featuredImage.altText || related.related.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold text-base mb-2 line-clamp-2">
                  {related.related.title}
                </h3>
                {related.related.excerpt && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {related.related.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{related.related.client.name}</span>
                  <RelativeTime
                    date={related.related.datePublished ?? related.related.createdAt}
                    dateTime={(related.related.datePublished ?? related.related.createdAt).toISOString()}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
