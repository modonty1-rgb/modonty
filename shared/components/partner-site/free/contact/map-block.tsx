import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/** «الخريطة» — Google Maps embed at the partner's coordinates, lazy, with the address under it and a «افتح الاتجاهات» link. */
export function MapBlock({ data, preview = false }: { data: HomeData; preview?: boolean }) {
  const c = data.contact;
  if (!c.mapEmbedSrc) return null;
  return (
    <Section id="map" eyebrow="فين نحن" heading="موقعنا على الخريطة" tone="muted">
      <div className="overflow-hidden rounded-lg ring-1 ring-border">
        {preview ? (
          <div className="grid aspect-[21/9] w-full place-items-center bg-muted text-sm text-muted-foreground">خريطة قوقل — تظهر على الموقع</div>
        ) : (
          <iframe
            src={c.mapEmbedSrc}
            title={`موقع ${data.name} على الخريطة`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="aspect-[21/9] w-full border-0"
            allowFullScreen
          />
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">{c.address}</p>
        {c.mapHref && (
          <a href={c.mapHref} target="_blank" rel="noopener noreferrer" className="font-medium text-primary">افتح الاتجاهات</a>
        )}
      </div>
    </Section>
  );
}
