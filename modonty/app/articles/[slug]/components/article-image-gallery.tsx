import { OptimizedImage } from "@/components/media/OptimizedImage";
import { Card, CardContent } from "@/components/ui/card";

interface ArticleImageGalleryProps {
  gallery: Array<{
    id: string;
    media: {
      url: string;
      altText: string | null;
      caption: string | null;
    };
  }>;
}

export function ArticleImageGallery({ gallery }: ArticleImageGalleryProps) {
  if (!gallery || gallery.length === 0) return null;

  return (
    <section className="my-8 md:my-12" aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="text-xl font-semibold mb-6">معرض الصور</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {gallery.map((galleryItem) => (
          <Card key={galleryItem.id} className="hover:shadow-md transition-shadow overflow-hidden">
            <div className="relative w-full aspect-video">
              <OptimizedImage
                src={galleryItem.media.url}
                alt={galleryItem.media.altText || galleryItem.media.caption || ""}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            {(galleryItem.media.caption || galleryItem.media.altText) && (
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  {galleryItem.media.caption || galleryItem.media.altText}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
