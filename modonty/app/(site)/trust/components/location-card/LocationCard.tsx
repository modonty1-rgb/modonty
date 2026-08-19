import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { BRAND_AR } from "@/constants";
import { IconMapPin, IconExternal } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { LegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";

import type { ContactRow } from "../../helpers/build-contact-rows";

// The pin is the office address, so it comes from the same row as the address itself.
// No coordinates on file → no map, rather than a pin pointing at a remembered spot.
const mapEmbedUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps?q=${lat},${lng}&hl=ar&z=15&output=embed`;
const mapLinkUrl = (lat: number, lng: number) => `https://www.google.com/maps?q=${lat},${lng}`;

interface LocationCardProps {
  contact: ContactRow[];
  map: { lat: number; lng: number } | null;
  legal: LegalEntityDisplay;
}

/** «فين تلقانا» — the contact rows, with the map beside them when coordinates exist. */
export function LocationCard({ contact, map, legal }: LocationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title="فين تلقانا" icon={IconMapPin} />
        <CardDescription>عنوان حقيقي ووسائل تواصل مباشرة.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-6", map && "md:grid-cols-2")}>
          <ul className="space-y-4">
            {contact.map(({ Icon, k, v, ltr }) => (
              <li key={k} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs text-muted-foreground">{k}</div>
                  <div className={cn("font-semibold", ltr && "[direction:ltr]")}>{v}</div>
                </div>
              </li>
            ))}
          </ul>
          {map && (
            <div className="overflow-hidden rounded-lg border border-border">
              <iframe
                title={`خريطة موقع ${legal.legalName ?? BRAND_AR}${legal.city ? ` — ${legal.city}` : ""}`}
                src={mapEmbedUrl(map.lat, map.lng)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-64 w-full border-0 md:h-full"
              />
            </div>
          )}
        </div>
        {map && (
          <a
            href={mapLinkUrl(map.lat, map.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-80"
          >
            افتح في خرائط جوجل
            <IconExternal className="h-3.5 w-3.5" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
