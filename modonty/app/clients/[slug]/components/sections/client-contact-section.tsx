import { SectionCard } from "@/app/clients/[slug]/components/sections/section-card";
import { Button } from "@/components/ui/button";

interface ClientContactSectionProps {
  lat: number | null;
  lng: number | null;
  gbpProfileUrl: string | null;
  gbpPlaceId: string | null;
  clientName: string;
  addressLine: string | null;
}

/**
 * «الموقع والتواصل» section — Google Maps embed (when coordinates exist) + a
 * Google Business Profile card (view + directions) + an address line. Pure
 * Server Component. Returns null when there is nothing to show.
 */
export function ClientContactSection({
  lat,
  lng,
  gbpProfileUrl,
  gbpPlaceId,
  clientName,
  addressLine,
}: ClientContactSectionProps) {
  const hasCoords = lat != null && lng != null;
  const hasGbp = Boolean(gbpProfileUrl) || Boolean(gbpPlaceId) || hasCoords;
  const hasAddress = Boolean(addressLine);

  if (!hasCoords && !gbpProfileUrl && !gbpPlaceId && !hasAddress) return null;

  const mapSrc = hasCoords
    ? `https://www.google.com/maps?q=${lat},${lng}&hl=ar&z=15&output=embed`
    : null;

  // «عرض على Google»: prefer the explicit profile URL, else a Maps search by place id, else by name.
  const viewHref =
    gbpProfileUrl ??
    (gbpPlaceId
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clientName)}&query_place_id=${gbpPlaceId}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clientName)}`);

  // «الاتجاهات»: route to the coordinates if present, else to the place id, else to the name.
  const directionsHref = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : gbpPlaceId
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clientName)}&destination_place_id=${gbpPlaceId}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clientName)}`;

  return (
    <SectionCard id="contact" icon="📍" title="الموقع والتواصل">
      {mapSrc && (
        <div className="h-[240px] overflow-hidden rounded-md border bg-muted">
          <iframe
            src={mapSrc}
            title={`موقع ${clientName} على خرائط Google`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0"
          />
        </div>
      )}

      {hasGbp && (
        <div className="mt-3.5 rounded-md border bg-muted/40 p-[15px]">
          <div className="mb-3.5 flex items-center gap-3">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-[11px] border bg-white text-[23px] font-black text-[#4285F4] shadow-[0_6px_16px_-6px_rgba(66,133,244,0.5)]"
              aria-hidden
            >
              G
            </span>
            <div className="min-w-0">
              <b className="block text-[13px] font-extrabold text-foreground">
                بطاقة العمل على Google
              </b>
              <span className="text-[11.5px] text-muted-foreground">{clientName}</span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Button asChild variant="outline" size="sm" className="flex-1 gap-1.5 text-[12.5px]">
              <a href={viewHref} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                عرض على Google
              </a>
            </Button>
            <Button asChild size="sm" className="flex-1 gap-1.5 text-[12.5px]">
              <a href={directionsHref} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path d="M3 11l19-9-9 19-2-8-8-2z" />
                </svg>
                الاتجاهات
              </a>
            </Button>
          </div>
        </div>
      )}

      {hasAddress && (
        <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
          <span aria-hidden>📍</span>
          {addressLine}
        </div>
      )}
    </SectionCard>
  );
}
