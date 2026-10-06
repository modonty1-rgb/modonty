import { Fragment, Suspense, type ReactNode } from "react";
import { notFound } from "next/navigation";
import type { HomeData } from "@modonty/shared/components/partner-site/free/home";
import { resolvePartnerTheme, getThemePage, type PartnerPageKey } from "@modonty/shared/components/partner-site/theme";
import { BookingBlock } from "@modonty/shared/components/partner-site/free/booking/booking-block";
import { getWhatsAppLink, bookingWhatsappMessage } from "@/lib/whatsapp";
import { getPartnerSite } from "../helpers/get-partner-site";
import { getCachedHomeData } from "../helpers/get-cached-home-data";
import { BookingCard, BookingCardSkeleton } from "./home/booking-card";
import { PageFrame, PARTNER_PAGE_TITLE_PREFIX } from "@modonty/shared/components/partner-site/parts/page-frame";

interface PageBlocksProps {
  slug: string;
  /**
   * Which site page this is — the hidden-section keys are stored per page («home:testimonials»).
   * They were bare block keys shared by every page, so hiding «آراء العملاء» on the home page
   * emptied the reviews page too (4 Oct 2026). Same names as the console's `BLOCKS_PAGES`.
   */
  page: PartnerPageKey;
  /**
   * Page-owned extras placed right after a block, keyed by block key — for pieces that are
   * modonty's, not the template's (the /faq ask form, which owns a server action).
   */
  after?: Partial<Record<string, ReactNode>>;
}

/**
 * A partner-site page = its block registry, in order, minus what the partner switched
 * off in the console and what has no data — the same components he previewed, so what
 * he saw is what ships. The booking block gets the live form (it owns the server
 * action); everything else is data → markup.
 */
export async function PageBlocks({ slug, page, after }: PageBlocksProps) {
  const decodedSlug = decodeURIComponent(slug);
  const [site, home] = await Promise.all([getPartnerSite(decodedSlug), getCachedHomeData(decodedSlug)]);
  if (!site || !home) notFound();
  // The page's sections come from the partner's theme (THEMES.md).
  const blocks = getThemePage(resolvePartnerTheme(site.site?.themeKey), page);

  const data: HomeData = {
    ...home.data,
    whatsappHref: site.phone ? getWhatsAppLink(site.phone, bookingWhatsappMessage(site.name)) : null,
  };
  const hidden = new Set(site.site?.hiddenSections ?? []);
  // A bare key (the old format, none saved in production as of 4 Oct 2026) still hides everywhere.
  const visible = blocks.filter((b) => !hidden.has(`${page}:${b.key}`) && !hidden.has(b.key) && !b.isEmpty(data));

  const content = (
    <>
      {/* Every block in order, so a page slot keeps its place even when its block is empty —
          the /faq ask form must show when there are no questions yet. */}
      {blocks.map((b) => (
        <Fragment key={b.key}>
        {!visible.includes(b) ? null : b.key === "booking" && data.booking.mode === "FORM" ? (
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
        )}
        {after?.[b.key]}
        </Fragment>
      ))}
    </>
  );

  // The title word comes from the shared list the console preview reads too («صور» · «تواصل مع»).
  const titlePrefix = page in PARTNER_PAGE_TITLE_PREFIX ? PARTNER_PAGE_TITLE_PREFIX[page as keyof typeof PARTNER_PAGE_TITLE_PREFIX] : null;
  if (!titlePrefix) return content;

  return (
    <PageFrame
      siteName={site.name}
      base={`/clients/${encodeURIComponent(site.slug)}`}
      title={`${titlePrefix} ${site.name}`}
    >
      {content}
    </PageFrame>
  );
}
