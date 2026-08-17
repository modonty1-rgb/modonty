import Link from "next/link";
import { OptimizedImage } from "@modonty/shared/components/optimized-image";
import { justifyRows, tileAspectRatio, shouldContainTile } from "@modonty/shared/lib/justify-rows";
import type { ClientGalleryImage } from "../../helpers/client-gallery";
import { SectionHeading } from "./section-heading";

interface GalleryTeaserProps {
  images: ClientGalleryImage[];
  totalCount: number;
  base: string;
}

/** Packing width for the 1216px container (padding removed); widths come back as flex-grow, so the rows stay justified at any size. */
const PACK_WIDTH = 1184;
/** One generous row on the home page is a taste, not the album — the album is /photos. */
const MAX_ROWS = 1;

/**
 * «من شغله» — the newest gallery images in justified rows (the project gallery standard:
 * true aspect ratios, no crop, no gaps). Every tile links to the full album.
 */
export function GalleryTeaser({ images, totalCount, base }: GalleryTeaserProps) {
  const items = images.filter((img) => img.url?.trim());
  if (items.length === 0) return null;
  const rows = justifyRows(items, PACK_WIDTH, 300, 12).slice(0, MAX_ROWS);
  const href = `${base}/photos`;

  return (
    <section className="mx-auto max-w-[1216px] px-4">
      <SectionHeading eyebrow="من شغله" title="بعدسة فريقه" more={{ href, label: `كل الصور (${totalCount.toLocaleString("ar-SA")})` }} />
      <div className="mt-8 space-y-3">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-3">
            {row.items.map(({ tile: img, grow }) => (
              <Link
                key={img.id}
                href={href}
                aria-label={img.altText?.trim() || "افتح المعرض"}
                style={row.isLast ? { flex: "0 0 auto", width: `${row.height * grow}px` } : { flexGrow: grow, flexBasis: 0, minWidth: 0 }}
                className="group relative overflow-hidden rounded-lg bg-muted"
              >
                <div style={{ aspectRatio: tileAspectRatio(img) }} className="relative">
                  <OptimizedImage
                    media={img}
                    alt={img.altText || ""}
                    fill
                    loading="lazy"
                    sizes="(max-width:1024px) 50vw, 25vw"
                    className={`${shouldContainTile(img) ? "object-contain" : "object-cover"} transition-transform duration-300 motion-safe:group-hover:scale-105`}
                  />
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
