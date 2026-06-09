import Image from "next/image";
import { SectionCard } from "./section-card";

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

/** «معرض الأعمال» — work gallery grid. Server, lazy images. Hide-if-empty. */
export function ClientGallerySection({ images }: Props) {
  const items = images.filter((img) => img.url?.trim());
  if (items.length === 0) return null;

  return (
    <SectionCard id="gallery" icon="🖼️" title="معرض الأعمال">
      <div className="grid grid-cols-3 gap-[9px] lg:grid-cols-4">
        {items.map((img) => (
          <div
            key={img.id}
            className="relative aspect-square overflow-hidden rounded-md bg-muted"
          >
            <Image
              src={img.url}
              alt={img.altText || ""}
              fill
              loading="lazy"
              className="object-cover"
              sizes="(max-width:1024px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
