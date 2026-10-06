import { SiteLink } from "../../parts/site-link";
import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/**
 * «الخريطة» — Google Maps embed at the partner's coordinates, lazy, with the address under it and a «افتح الاتجاهات» link.
 * 21:9 left the map 134px tall on a phone — too short to read a street (4 Oct 2026): 4:3 there, 21:9 from `md`.
 */
export function MapBlock({ data, preview = false }: { data: HomeData; preview?: boolean }) {
  const c = data.contact;
  if (!c.mapEmbedSrc) return null;
  return (
    <Section id="map" eyebrow="زورونا" heading="موقعنا على الخريطة" tone="muted">
      <div className="overflow-hidden rounded-[var(--ps-radius-card,0.5rem)] ring-1 ring-border">
        {preview ? (
          <div className="grid aspect-[4/3] w-full md:aspect-[21/9] place-items-center bg-muted text-sm text-muted-foreground">خريطة قوقل — تظهر على الموقع</div>
        ) : (
          <iframe
            src={c.mapEmbedSrc}
            title={`موقع ${data.name} على الخريطة`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="aspect-[4/3] w-full border-0 md:aspect-[21/9]"
            allowFullScreen
          />
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">{c.address}</p>
        {c.mapHref && (
          <SiteLink href={c.mapHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center font-medium text-[hsl(var(--primary-ink,var(--primary)))] max-md:min-h-11">افتح الاتجاهات</SiteLink>
        )}
      </div>
    </Section>
  );
}
