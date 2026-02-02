import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface GalleryItem {
  id: string;
  media: {
    url: string;
    altText: string | null;
    caption: string | null;
  };
}

interface PreviewGalleryProps {
  gallery: GalleryItem[];
}

export function PreviewGallery({ gallery }: PreviewGalleryProps) {
  if (!gallery || gallery.length === 0) return null;

  return (
    <section className="my-8 md:my-12" aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="text-xl font-semibold mb-6">
        معرض الصور
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {gallery.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow overflow-hidden">
            <div className="relative w-full aspect-video">
              <Image
                src={item.media.url}
                alt={item.media.altText || item.media.caption || ""}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            {(item.media.caption || item.media.altText) && (
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  {item.media.caption || item.media.altText}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
