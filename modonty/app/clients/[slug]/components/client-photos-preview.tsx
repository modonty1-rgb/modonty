import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { IconImage } from "@/lib/icons";
import { OptimizedImage } from "@modonty/shared/components/optimized-image";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { mediaSrc } from "@modonty/shared/lib/media-src";

interface ClientPhotosPreviewProps {
  articles: {
    id: string;
    slug: string;
    title?: string;
    featuredImage?: { url: string; bunnyUrl: string | null; blurDataURL: string | null; altText?: string | null } | null;
  }[];
  clientId?: string;
  showEmptyState?: boolean;
}

type ArticleWithImage = ClientPhotosPreviewProps["articles"][number] & {
  featuredImage: NonNullable<ClientPhotosPreviewProps["articles"][number]["featuredImage"]>;
};

export function ClientPhotosPreview({ articles, clientId, showEmptyState = false }: ClientPhotosPreviewProps) {
  // Type predicate, not a bare boolean — the component takes the media row now, so the
  // filter has to narrow the type too or the call site needs a `!` that hides real nulls.
  const photoArticles = articles
    .filter((article): article is ArticleWithImage => Boolean(mediaSrc(article.featuredImage)))
    .slice(0, 6);

  if (photoArticles.length === 0) {
    if (!showEmptyState) {
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitleWithIcon title="الصور" icon={IconImage} />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            لا توجد صور لهذا العميل حتى الآن. عند نشر مقالات تحتوي على صور، ستظهر هنا.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title="الصور" icon={IconImage} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-1.5">
          {photoArticles.map((article) => (
            <CtaTrackedLink
              key={article.id}
              href={`/articles/${article.slug}`}
              label="View photo article"
              type="LINK"
              clientId={clientId}
              articleId={article.id}
              className="relative block aspect-square overflow-hidden rounded-md bg-muted"
              aria-label={article.title ?? "مقال"}
            >
              <OptimizedImage
                media={article.featuredImage}
                alt={article.featuredImage?.altText || article.title || "مقال"}
                fill
                className="object-cover transition-transform duration-200 hover:scale-105"
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 15vw, 120px"
                loading="lazy"
              />
            </CtaTrackedLink>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

