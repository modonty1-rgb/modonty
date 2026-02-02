import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  datePublished: Date | null;
  createdAt: Date;
  featuredImage: { url: string; altText: string | null } | null;
  client: { name: string; slug: string } | null;
}

interface PreviewMoreFromAuthorProps {
  articles: Article[];
  authorName: string;
}

export function PreviewMoreFromAuthor({ articles, authorName }: PreviewMoreFromAuthorProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="my-8 md:my-12" aria-labelledby="more-from-author-heading">
      <h2 id="more-from-author-heading" className="text-xl font-semibold mb-6">
        المزيد من الكاتب: {authorName}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((a) => (
          <Link key={a.id} href={`/articles/${a.id}`} className="group">
            <Card className="hover:shadow-md transition-shadow overflow-hidden h-full">
              {a.featuredImage && (
                <div className="relative w-full aspect-video">
                  <Image
                    src={a.featuredImage.url}
                    alt={a.featuredImage.altText || a.title}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
              <CardHeader className="p-4">
                <CardTitle className="text-base font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {a.title}
                </CardTitle>
              </CardHeader>
              {a.excerpt && (
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
