import { Suspense } from "react";
import { connection } from "next/server";
import { IconEmail, IconMapPin, IconPhone } from "@/lib/icons";
import { WhatsAppAction } from "@/components/shared/whatsapp-action/WhatsAppAction";
import type { PartnerSite } from "../../helpers/get-partner-site";
import { ClientHours } from "../sidebar/client-hours";
import { SectionHeading } from "./section-heading";

interface ContactBlockProps {
  site: PartnerSite;
}

/**
 * «فين تلقاه» — address (map when coordinates exist), hours, phone/email/WhatsApp.
 * Three cards; a missing field drops its card, the block hides when nothing is left.
 */
export function ContactBlock({ site }: ContactBlockProps) {
  const address = [site.addressStreet, site.addressNeighborhood, site.addressCity].filter(Boolean).join("، ");
  const hasGeo = site.addressLatitude != null && site.addressLongitude != null;
  const hasContact = Boolean(site.phone || site.email);
  if (!address && !hasContact && !site.openingHoursSpecification) return null;

  const mapsHref = hasGeo
    ? `https://www.google.com/maps/search/?api=1&query=${site.addressLatitude},${site.addressLongitude}`
    : address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name} ${address}`)}`
      : null;

  return (
    <section id="contact" className="mx-auto max-w-[1216px] px-4">
      <SectionHeading eyebrow="تواصل" title={site.addressCity ? `في ${site.addressCity} — ونردّ عليك في نفس اليوم` : "نردّ عليك في نفس اليوم"} />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {address ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><IconMapPin className="h-4 w-4" aria-hidden /> العنوان</p>
            <p className="mt-2 text-lg font-bold leading-snug text-foreground">{address}</p>
            {mapsHref ? (
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-primary hover:underline underline-offset-4">
                افتح في خرائط قوقل ›
              </a>
            ) : null}
          </div>
        ) : null}

        <div className="[&>section]:h-full [&_h2]:text-sm">
          <Suspense fallback={<div className="h-40 rounded-2xl border border-border bg-card" aria-hidden />}>
            <HoursCard openingHours={site.openingHoursSpecification} />
          </Suspense>
        </div>

        {hasContact ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="space-y-4 text-sm">
              {site.phone ? (
                <div>
                  <p className="flex items-center gap-2 text-muted-foreground"><IconPhone className="h-4 w-4" aria-hidden /> الهاتف</p>
                  <a href={`tel:${site.phone}`} dir="ltr" className="mt-1 block text-lg font-bold text-foreground">{site.phone}</a>
                </div>
              ) : null}
              {site.email ? (
                <div>
                  <p className="flex items-center gap-2 text-muted-foreground"><IconEmail className="h-4 w-4" aria-hidden /> البريد</p>
                  <a href={`mailto:${site.email}`} className="mt-1 block font-medium text-foreground">{site.email}</a>
                </div>
              ) : null}
            </div>
            {site.phone ? (
              <div className="mt-5">
                <WhatsAppAction phone={site.phone} clientId={site.id} clientName={site.name} source="client_page" variant="solid" label="واتساب" className="w-full" />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** ClientHours highlights "today", i.e. reads the clock — so it renders per request, behind its own boundary. */
async function HoursCard({ openingHours }: { openingHours: unknown }) {
  await connection();
  return <ClientHours openingHours={openingHours} />;
}
