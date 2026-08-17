import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";
import { IndustriesNavRail } from "@/app/industries/components/industries-nav-rail/IndustriesNavRail";
import { PartnersRail } from "@/app/industries/components/partners-rail/PartnersRail";
import { ArticlesFeed } from "@/app/industries/components/articles-feed/ArticlesFeed";
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
 * combined) · left = who provides them. Same widths and gaps as `/` and `/clients`, so
 * moving between them never moves the furniture.
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
    <ThreeColumnLayout
      right={
        <StickyRail
          label="المجالات"
          className="hidden w-[300px] shrink-0 self-start min-[1240px]:sticky min-[1240px]:block"
        >
          <IndustriesNavRail industries={industries} currentSlug={currentSlug} />
        </StickyRail>
      }
      center={<ArticlesFeed articles={articles} page={page} industryName={industryName} buildPageHref={buildPageHref} />}
      left={<PartnersRail partners={partners} heading={partnersHeading} browseAllHref={partnersBrowseAllHref} />}
    />
  );
}
