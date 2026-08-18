import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { HomeBlock, HomeData } from "@modonty/shared/components/partner-site/free/home";
import { BookingBlock } from "@modonty/shared/components/partner-site/free/booking/booking-block";
import { getWhatsAppLink, bookingWhatsappMessage } from "@/lib/whatsapp";
import { getPartnerSite } from "../helpers/get-partner-site";
import { getCachedHomeData } from "../helpers/get-cached-home-data";
import { BookingCard, BookingCardSkeleton } from "./home/booking-card";

interface PageBlocksProps {
  slug: string;
  blocks: readonly HomeBlock[];
}

/**
 * A partner-site page = its block registry, in order, minus what the partner switched
 * off in the console and what has no data — the same components he previewed, so what
 * he saw is what ships. The booking block gets the live form (it owns the server
 * action); everything else is data → markup.
 */
export async function PageBlocks({ slug, blocks }: PageBlocksProps) {
  const decodedSlug = decodeURIComponent(slug);
  const [site, home] = await Promise.all([getPartnerSite(decodedSlug), getCachedHomeData(decodedSlug)]);
  if (!site || !home) notFound();

  const data: HomeData = {
    ...home.data,
    whatsappHref: site.phone ? getWhatsAppLink(site.phone, bookingWhatsappMessage(site.name)) : null,
  };
  const hidden = new Set(site.site?.hiddenSections ?? []);
  const visible = blocks.filter((b) => !hidden.has(b.key) && !b.isEmpty(data));

  return (
    <>
      {visible.map((b) =>
        b.key === "booking" && data.booking.mode === "FORM" ? (
          <BookingBlock
            key={b.key}
            data={data}
            form={
              <Suspense fallback={<BookingCardSkeleton />}>
                <BookingCard
                  clientId={site.id}
                  clientName={site.name}
                  phone={site.phone ?? null}
                  ctaMode={site.ctaMode}
                  ctaLabel={site.ctaLabel ?? null}
                  ctaUrl={site.ctaUrl ?? null}
                />
              </Suspense>
            }
          />
        ) : (
          <b.Component key={b.key} data={data} />
        ),
      )}
    </>
  );
}
