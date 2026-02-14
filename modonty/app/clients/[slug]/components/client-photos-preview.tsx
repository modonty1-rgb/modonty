import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { Image } from "lucide-react";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import Link from "@/components/link";

interface ClientPhotosPreviewProps {
  articles: {
    id: string;
    slug: string;
    title?: string;
    featuredImage?: { url: string; altText?: string | null } | null;
  }[];
  showEmptyState?: boolean;
}

export function ClientPhotosPreview({ articles, showEmptyState = false }: ClientPhotosPreviewProps) {
  const photoArticles = articles.filter((article) => article.featuredImage?.url).slice(0, 6);

  if (photoArticles.length === 0) {
    if (!showEmptyState) {
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitleWithIcon title="الصور" icon={Image} />
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
        <CardTitleWithIcon title="الصور" icon={Image} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-1.5">
          {photoArticles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="relative block aspect-square overflow-hidden rounded-md bg-muted"
              aria-label={article.title ?? "مقال"}
            >
              <OptimizedImage
                src={article.featuredImage!.url}
                alt={article.featuredImage?.altText || article.title || "مقال"}
                fill
                className="object-cover transition-transform duration-200 hover:scale-105"
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 15vw, 120px"
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

