import { OptimizedImage } from "@modonty/database/components/optimized-image";

import { justifyRows, tileAspectRatio, shouldContainTile } from "@modonty/database/lib/justify-rows";

import { mediaSrc } from "@modonty/database/lib/media-src";
import { SectionCard } from "./section-card";

/** Section content width at the widest breakpoint — only decides tiles-per-row.
 *  `flex-grow` fills the real width exactly. See the `gallery-justified-rows` standard. */
const GALLERY_WIDTH = 720;
import { GalleryInteractive } from "./gallery-interactive";

export interface ClientGalleryImage {
  id: string;
  url: string;
  bunnyUrl: string | null;
  blurDataURL: string | null;
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
        {/* Justified rows — the project gallery standard. `data-gallery-index` must stay
            sequential across rows, so it is read off the original list, not the row. */}
        <div>
          {justifyRows(items, GALLERY_WIDTH, 170, 9).map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-[9px] mb-[9px]">
              {row.items.map(({ tile: img, grow }) => {
                const i = items.indexOf(img);
                return (
                  <button
                    key={img.id}
                    type="button"
                    data-gallery-index={i}
                    aria-label={img.altText?.trim() || `تكبير الصورة ${i + 1}`}
                    style={
                      row.isLast
                        ? { flex: "0 0 auto", width: `${row.height * grow}px` }
                        : { flexGrow: grow, flexBasis: 0, minWidth: 0 }
                    }
                    className="group relative cursor-zoom-in overflow-hidden rounded-md bg-muted outline-none ring-primary transition focus-visible:ring-2"
                  >
                    <div style={{ aspectRatio: tileAspectRatio(img) }} className="relative">
                      <OptimizedImage
                        media={img}
                        alt={img.altText || ""}
                        fill
                        loading="lazy"
                        className={`${shouldContainTile(img) ? "object-contain" : "object-cover"} transition-transform duration-300 group-hover:scale-105`}
                        sizes="(max-width:1024px) 33vw, 25vw"
                      />
                    </div>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15"
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </GalleryInteractive>
    </SectionCard>
  );
}
