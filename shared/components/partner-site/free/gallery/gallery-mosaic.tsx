import { OptimizedImage, asMedia } from "../../../optimized-image";
import { Section } from "../home/parts/section";
import { ViewAllLink } from "../home/parts/view-all-link";
import { GalleryZoom } from "./parts/gallery-zoom";
import type { HomeData } from "../home/home-data";

/** «المعرض» — a 3-column mosaic, first image large (Shopify `collage` / Tailwind "bento"). Up to 5. */
export function GalleryMosaic({ data, preview = false }: { data: HomeData; preview?: boolean }) {
  const imgs = data.gallery.slice(0, 5);
  const grid = (
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
        {imgs.map((img, i) => (
          <li key={img.url} className={i === 0 ? "relative col-span-2 row-span-2 aspect-square overflow-hidden rounded-[var(--ps-radius-card,0.5rem)] bg-muted" : "relative aspect-square overflow-hidden rounded-[var(--ps-radius-card,0.5rem)] bg-muted"}>
            <OptimizedImage media={asMedia(img.url, img.alt)} alt={img.alt} fill sizes={i === 0 ? "(max-width: 768px) 100vw, 560px" : "(max-width: 768px) 50vw, 280px"} className="object-cover" />
            {/* The squares crop every photo; a tap shows it whole (4 Oct 2026). Inert in the console preview. */}
            {!preview && (
              <button
                type="button"
                data-gallery-index={i}
                aria-label={`تكبير: ${img.alt}`}
                className="absolute inset-0 cursor-zoom-in outline-none ring-inset ring-primary focus-visible:ring-2"
              />
            )}
          </li>
        ))}
      </ul>
  );
  return (
    <Section id="gallery" eyebrow="من أعمالنا" heading="المعرض" tone="muted">
      {preview ? grid : <GalleryZoom images={data.gallery}>{grid}</GalleryZoom>}
      <ViewAllLink href={data.photosHref} label="كل الصور" shown={imgs.length} total={data.gallery.length} />
    </Section>
  );
}
