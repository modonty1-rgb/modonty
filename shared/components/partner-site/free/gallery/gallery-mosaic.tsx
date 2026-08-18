import { OptimizedImage, asMedia } from "../../../optimized-image";
import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/** «المعرض» — a 3-column mosaic, first image large (Shopify `collage` / Tailwind "bento"). Up to 5. */
export function GalleryMosaic({ data }: { data: HomeData; preview?: boolean }) {
  const imgs = data.gallery.slice(0, 5);
  return (
    <Section id="gallery" eyebrow="من شغلنا" heading="المعرض" tone="muted">
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
        {imgs.map((img, i) => (
          <li key={img.url} className={i === 0 ? "relative col-span-2 row-span-2 aspect-square overflow-hidden rounded-lg bg-muted" : "relative aspect-square overflow-hidden rounded-lg bg-muted"}>
            <OptimizedImage media={asMedia(img.url, img.alt)} alt={img.alt} fill sizes={i === 0 ? "560px" : "thumb"} className="object-cover" />
          </li>
        ))}
      </ul>
    </Section>
  );
}
