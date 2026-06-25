import Image from "next/image";
import { SectionCard } from "./section-card";
import { GalleryInteractive } from "./gallery-interactive";

export interface ClientGalleryImage {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

interface Props {
  images: ClientGalleryImage[];
}

/**
 * «معرض الأعمال» — work gallery. The thumbnail grid is server-rendered (lazy
 * images, stays in HTML for SEO/LCP); a thin client layer adds click-to-enlarge,
 * lazy-loading the fullscreen viewer only on the first tap. Hide-if-empty.
 */
export function ClientGallerySection({ images }: Props) {
  const items = images.filter((img) => img.url?.trim());
  if (items.length === 0) return null;

  return (
    <SectionCard id="gallery" icon="🖼️" title="معرض الأعمال">
      <GalleryInteractive images={items}>
        <div className="grid grid-cols-3 gap-[9px] lg:grid-cols-4">
          {items.map((img, i) => (
            <button
              key={img.id}
              type="button"
              data-gallery-index={i}
              aria-label={img.altText?.trim() || `تكبير الصورة ${i + 1}`}
              className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-md bg-muted outline-none ring-primary transition focus-visible:ring-2"
            >
              <Image
                src={img.url}
                alt={img.altText || ""}
                fill
                loading="lazy"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width:1024px) 33vw, 25vw"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15"
              />
            </button>
          ))}
        </div>
      </GalleryInteractive>
    </SectionCard>
  );
}
