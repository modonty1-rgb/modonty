import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";
import { IndustriesNavRail } from "@/app/(site)/industries/components/industries-nav-rail/IndustriesNavRail";
import { IndustriesCards } from "@/app/(site)/industries/components/industries-cards/IndustriesCards";
import { IndustriesHeader } from "@/app/(site)/industries/components/industries-header/IndustriesHeader";
import { IndustryContextStrip } from "@/app/(site)/industries/components/industry-context-strip/IndustryContextStrip";
import { PartnersGridMobile } from "@/app/(site)/industries/components/partners-grid-mobile/PartnersGridMobile";
import { PartnersRail } from "@/app/(site)/industries/components/partners-rail/PartnersRail";
import { toneForSlug } from "@/app/(site)/industries/helpers/industry-tones";
import { MobileCtaBar } from "@/components/shared/mobile-cta-bar/MobileCtaBar";
import { ModontyShoppingMark } from "@/components/icons/modonty-shopping-mark";
import { ModontyBookingMark } from "@/components/icons/modonty-booking-mark";
import { ArticlesFeed } from "@/app/(site)/industries/components/articles-feed/ArticlesFeed";
import type { IndustryListItem } from "@/lib/types";
import type { ClientListItem } from "@/lib/queries/get-clients-list";
import type { FeedPost } from "@/lib/types";

interface IndustryPageLayoutProps {
  industries: IndustryListItem[];
  /** "" on the base `/industries` page — no field highlighted in the right rail. */
  currentSlug: string;
  /** Omit for the base page — the center column then shows the combined feed. */
  industryName?: string;
  articles: FeedPost[];
  partners: ClientListItem[];
  partnersHeading: string;
  partnersBrowseAllHref: string;
  page: number;
  buildPageHref: (page: number) => string;
}

/**
 * The homepage's three-column shell — this IS the entry page (Khalid, 2026-08-16:
 * «هذه الصفحة الرئيسية التي يكون فيها التقسيم»), not a detail page one click deeper.
 * Right = every field, one click away · center = articles (one field's, or every field's
 * combined) · left = who provides them. Same widths and gaps as `/` and `/clients`.
 *
 * MOBILE (<1240px, redesigned 21 Aug per the approved mockup
 * `documents/idea/industries-mobile-ui.html`, grounded in Baymard/NN/g): identity header
 * (base page) → visual field CARDS with thumbnails and counts → context strip (field
 * page) → feed → partners LOGO GRID (<1024px, where the rail is hidden). Desktop ≥1240px
 * untouched: nav rail + partners rail exactly as before.
 */
export function IndustryPageLayout({
  industries,
  currentSlug,
  industryName,
  articles,
  partners,
  partnersHeading,
  partnersBrowseAllHref,
  page,
  buildPageHref,
}: IndustryPageLayoutProps) {
  return (
    <>
    <ThreeColumnLayout
      right={
        <StickyRail
          label="المجالات"
          className="hidden w-[300px] shrink-0 self-start min-[1240px]:sticky min-[1240px]:block"
        >
          <IndustriesNavRail industries={industries} currentSlug={currentSlug} />
        </StickyRail>
      }
      center={
        <>
          {/* Below 1240px the fields rail is hidden — these visual cards are the only way
              to switch fields there; ≥1240px the rail takes over and all of this hides. */}
          <div className="space-y-4 min-[1240px]:hidden">
            {!industryName && <IndustriesHeader />}
            <IndustriesCards industries={industries} currentSlug={currentSlug} />
            {industryName && (
              <IndustryContextStrip
                industryName={industryName}
                articlesCount={articles.length}
                partnersCount={partners.length}
                tone={toneForSlug(currentSlug)}
              >
                <PartnersGridMobile partners={partners} heading={partnersHeading} browseAllHref={partnersBrowseAllHref} embedded />
              </IndustryContextStrip>
            )}
          </div>
          <ArticlesFeed articles={articles} page={page} industryName={industryName} buildPageHref={buildPageHref} />
          {/* Base page only: no context strip, so the partners keep their own section
              after the feed. Field pages open them from the strip's collapse instead. */}
          {!industryName && (
            <div className="mt-6 lg:hidden">
              <PartnersGridMobile partners={partners} heading={partnersHeading} browseAllHref={partnersBrowseAllHref} />
            </div>
          )}
        </>
      }
      left={
        <PartnersRail
          partners={partners}
          heading={partnersHeading}
          browseAllHref={partnersBrowseAllHref}
        />
      }
    />
    {/* Same shared bottom bar (Khalid, 21 Aug: the industries pages need it too) — the
        field visitor's end goal is reaching a provider: book, or shop. */}
    <MobileCtaBar
      ariaLabel="احجز أو تسوّق"
      primary={{ href: "/booking", label: "احجز الآن", icon: ModontyBookingMark }}
      secondary={{ href: "/shop", label: "تسوّق الآن", icon: ModontyShoppingMark }}
    />
    </>
  );
}
