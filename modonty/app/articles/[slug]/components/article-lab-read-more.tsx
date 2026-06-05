import { Card } from "@/components/ui/card";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { OptimizedImage } from "@/components/media/OptimizedImage";

interface ReadMoreItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage?: { url: string; altText: string | null } | null;
  clientName?: string | null;
}

interface ArticleLabReadMoreProps {
  articleId: string;
  clientId?: string;
  items: ReadMoreItem[];
}

/**
 * One consolidated "اقرأ أيضاً" section — responsive grid (best practice for related
 * content; replaces the previous 4 stacked related sections). No carousel.
 */
export function ArticleLabReadMore({ articleId, clientId, items }: ArticleLabReadMoreProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="read-more-heading">
      <h2 id="read-more-heading" className="mb-4 text-xl font-bold text-foreground">اقرأ أيضاً</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <CtaTrackedLink
            key={a.id}
            href={`/articles/${a.slug}`}
            label={a.title}
            type="LINK"
            articleId={articleId}
            clientId={clientId}
            className="block h-full"
          >
            <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
              <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted">
                {a.featuredImage ? (
                  <OptimizedImage
                    src={a.featuredImage.url}
                    alt={a.featuredImage.altText || a.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-4 text-right">
                {a.clientName && (
                  <p className="mb-1 text-xs text-muted-foreground">في {a.clientName}</p>
                )}
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{a.title}</h3>
                {a.excerpt && (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{a.excerpt}</p>
                )}
              </div>
            </Card>
          </CtaTrackedLink>
        ))}
      </div>
    </section>
  );
}
