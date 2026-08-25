import { getClientsList } from "@/lib/queries/get-clients-list";
import { PartnerCard } from "@/components/shared/partner-card/PartnerCard";
import { BecomePartnerBanner } from "@/components/shared/become-partner-banner/BecomePartnerBanner";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { messages, formatCount } from "@/lib/i18n/messages";
import { SITE_URL } from "@/constants";

import type { Metadata } from "next";

import { buildPageAlternates } from "@/lib/seo/build-page-alternates";

const text = messages.shop;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: "تسوّق الآن — متاجر شركاء مدونتي | مدونتي" },
    description:
      "تسوّق من متاجر شركاء مدونتي — علامات تجارية موثوقة بمنتجات وعروض في السعودية ومصر والخليج.",
    // A lone canonical is a deletion, not an addition — Next replaces the layout's alternates.
    alternates: await buildPageAlternates("/shop"),
  };
}

/**
 * The shopping door: same partner card as `/clients` and `/booking` (Khalid, 2026-08-16
 * — «خلي الكرت تبع العميل يكون reusable»), filtered to partners whose CTA sends visitors
 * to an external store. Reads the same cached list the other two doors read — one query,
 * one card, three doors.
 */
export default async function ShopPage() {
  const partners = (await getClientsList()).filter((partner) => partner.ctaMode === "LINK");

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
              {formatCount(partners.length, messages.clients.counts.partnersCount)} {text.sellingSuffix}
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
            <BecomePartnerBanner source="Shop Page" className="mt-8" />
          </>
        )}
      </div>
    </>
  );
}
