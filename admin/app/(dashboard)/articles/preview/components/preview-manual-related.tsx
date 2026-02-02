import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Related {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  datePublished: Date | null;
  createdAt: Date;
  featuredImage: { url: string; altText: string | null } | null;
  client: { name: string; slug: string } | null;
}

interface PreviewManualRelatedProps {
  related: { id: string; related: Related }[];
}

export function PreviewManualRelated({ related }: PreviewManualRelatedProps) {
  if (!related || related.length === 0) return null;

  return (
    <section className="my-8 md:my-12" aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-xl font-semibold mb-6">
        مقالات ذات صلة
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map(({ id: relationId, related: r }) => (
          <Link key={relationId} href={`/articles/${r.id}`} className="group">
            <Card className="hover:shadow-md transition-shadow overflow-hidden h-full">
              {r.featuredImage && (
                <div className="relative w-full aspect-video">
                  <Image
                    src={r.featuredImage.url}
                    alt={r.featuredImage.altText || r.title}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
              <CardHeader className="p-4">
                <CardTitle className="text-base font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {r.title}
                </CardTitle>
              </CardHeader>
              {r.excerpt && (
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
