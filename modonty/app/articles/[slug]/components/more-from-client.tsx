import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "@/components/link";
import { OptimizedImage } from "@/components/OptimizedImage";
import { RelativeTime } from "@/components/RelativeTime";

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
}

interface MoreFromClientProps {
  articles: Article[];
  clientName: string;
}

export function MoreFromClient({ articles, clientName }: MoreFromClientProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="my-8 md:my-12">
      <h2 className="text-xl font-semibold mb-6">المزيد من {clientName}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {articles.map((article) => (
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
                  {article.category && (
                    <span className="text-muted-foreground">
                      {article.category.name}
                    </span>
                  )}
                  <RelativeTime
                    date={article.datePublished ?? article.createdAt}
                    dateTime={(article.datePublished ?? article.createdAt).toISOString()}
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
