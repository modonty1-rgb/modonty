import { getClientsList } from "@/lib/queries/get-clients-list";
import { PartnerCard } from "@/components/shared/partner-card/PartnerCard";
import { BecomePartnerBanner } from "@/components/shared/become-partner-banner/BecomePartnerBanner";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { messages, formatCount } from "@/lib/i18n/messages";
import { SITE_URL } from "@/constants";

import type { Metadata } from "next";

import { buildPageAlternates } from "@/lib/seo/build-page-alternates";
import { buildShareTags } from "@/lib/seo/build-share-tags";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";

const text = messages.booking;

// The brand is appended by hand in `<title>` here (`absolute`), so the share tags get the
// bare headline — `og:site_name` is what carries the brand on a card.
const BOOKING_TITLE = "احجز الآن — الشركاء الذين يستقبلون الحجوزات";
const BOOKING_DESCRIPTION = messages.seo.booking.description;

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getPageSeoDefaults();
  return {
    // اللاحقة من `Settings.siteName` لا من الكود — وبغياب العمود يُشحن العنوان وحده،
    // لأن عنواناً بلا ماركة أهون من ماركة بالاسم القديم بعد تغييره من الأدمن.
    title: { absolute: siteName ? `${BOOKING_TITLE} | ${siteName}` : BOOKING_TITLE },
    description: BOOKING_DESCRIPTION,
    // Declaring only a canonical dropped this page to zero hreflang: Next replaces the
    // layout's `alternates` rather than merging them, so a lone canonical is also a deletion.
    alternates: await buildPageAlternates("/booking"),
    // Shipped zero og:/twitter: until now — see `buildShareTags`.
    ...(await buildShareTags({
      path: "/booking",
      title: BOOKING_TITLE,
      description: BOOKING_DESCRIPTION,
    })),
  };
}

/**
 * The booking door: the same partner card as `/clients` (Khalid, 2026-08-16 — «خلي الكرت
 * تبع العميل يكون reusable»), filtered to partners whose CTA is a booking form. Reads the
 * exact same cached list `/clients` reads — one query, one card, two doors — so a partner
 * never shows richer or thinner information depending on which page a visitor arrived from.
 */
export default async function BookingPage() {
  const partners = (await getClientsList()).filter((partner) => partner.ctaMode === "FORM");

  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: text.breadcrumbLabel },
        ]}
      />

      <div className="container mx-auto max-w-[1128px] px-4 py-6">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-foreground">{text.pageTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{text.pageSubtitle}</p>
          </div>
          {partners.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {formatCount(partners.length, messages.clients.counts.partnersCount)} {text.receivingBookingsSuffix}
            </p>
          )}
        </header>

        {partners.length === 0 ? (
          <p className="rounded-lg bg-card p-6 text-center text-sm text-muted-foreground ring-1 ring-border">
            {text.emptyStateMessage}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
            <BecomePartnerBanner source="Booking Page" className="mt-8" />
          </>
        )}
      </div>
    </>
  );
}
