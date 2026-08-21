import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";
import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { EntitySearchForm } from "@/components/listing/EntitySearchForm";
import { AiDisclaimer } from "@/components/shared/ai-disclaimer/AiDisclaimer";
import { AboutBar, AboutCard } from "@/components/shared/about-card/AboutCard";
import { MobileCtaBar } from "@/components/shared/mobile-cta-bar/MobileCtaBar";
import { ModontyReelsMark } from "@/components/icons/modonty-reels-mark";
import { IconVolume2 } from "@/lib/icons";

import { AskModo } from "../ask-modo/AskModo";
import { TrustBox, TrustHint } from "../trust-box/TrustBox";
import { ResultsLine } from "../results-line/ResultsLine";
import { FiltersBar } from "../filters-bar/FiltersBar";
import { ReadingTimeBar } from "../reading-time-bar/ReadingTimeBar";
import { ArticlesFeed } from "../articles-feed/ArticlesFeed";

import type { ArchiveState } from "../../helpers/build-archive-href";
import type { ReadingTimeBucket } from "../../helpers/reading-time-buckets";
import type { ArchiveFilters } from "../../data/get-articles-filters";
import type { ArchiveArticle } from "../../data/get-articles-archive";
import type { ReactNode } from "react";
import type { IndustryListItem } from "@/lib/types";

interface ArticlesPageLayoutProps {
  breadcrumb: ReactNode;
  articles: ArchiveArticle[];
  total: number;
  filters: ArchiveFilters;
  readingTimeCounts: Record<ReadingTimeBucket, number>;
  current: ArchiveState;
  scopeLabel: string | null;
  /** The fields' artwork — the mobile filter draws the same branded cards the other pages do. */
  industryArtwork: IndustryListItem[];
}

/**
 * Two columns: the archive, and the three cards beside it.
 *
 * It was three columns (a copy of the homepage), then one — the shape Vercel, Stripe and Intercom
 * all use, measured 2026-08-19. Khalid then put the cards back as a RAIL rather than a strip under
 * the list, and that is the right call for what they say: a visitor deciding whether to trust this
 * content needs to see that the partners are checked *while* he reads it, not after he has
 * scrolled past everything.
 *
 * The main column keeps the order that research produced: which field → what am I looking for →
 * how long do I have → the list.
 */
export function ArticlesPageLayout({
  breadcrumb,
  articles,
  total,
  filters,
  readingTimeCounts,
  current,
  scopeLabel,
  industryArtwork,
}: ArticlesPageLayoutProps) {
  return (
    <>
    <TwoColumnLayout
      header={breadcrumb}
      main={
        <>
          {/* Why these articles can be trusted, and who publishes them — both at the top of
              the phone view (Khalid, 21 Aug: «make it as before»). Trust is a one-line hint;
              «مدونتي» keeps its full card, the same one the desktop rail shows. */}
          <div className="space-y-2 min-[1240px]:hidden">
            <TrustHint />
            <AboutBar />
          </div>
          {/* Search sits WITH the filters: known-item finding and exploratory browsing are the
              same job, and every filter-UX guide puts their controls together. Desktop only
              (Khalid, 21 Aug: «remove») — the navbar already carries a search on a phone, and
              the field cards below are the faster way in. */}
          <div className="hidden min-[1240px]:block">
            <EntitySearchForm
              basePath="/articles"
              placeholder="اكتب كلمة من العنوان..."
              defaultValue={current.search ?? ""}
            />
          </div>
          <FiltersBar filters={filters} current={current} industryArtwork={industryArtwork} />

          {/* Count and time on one line — stacked, the controls filled 61% of the screen before
              the first article appeared. The results line is desktop-only (Khalid, 21 Aug:
              «remove»): on a phone the picked field card is already lit and the breadcrumb
              names it, so the line repeated what two elements above it had said. */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="hidden min-[1240px]:block">
              <ResultsLine total={total} scopeLabel={scopeLabel} current={current} />
            </div>
            <ReadingTimeBar counts={readingTimeCounts} current={current} />
          </div>

          <ArticlesFeed articles={articles} current={current} />
        </>
      }
      rail={
        <StickyRail
          label="عن مدونتي"
          className="w-full shrink-0 self-start lg:w-[300px] min-[1240px]:sticky"
        >
          {/* MOBILE: this rail stacked BELOW twenty cards — 458px of trust copy starting at
              scroll 5,815, which nobody reaches (measured 21 Aug). Trust and «مدونتي» moved
              to the TOP of the main column instead; Modo is not repeated on a phone at all
              — the bottom bar already carries him (Khalid, 21 Aug). */}
          <div className="hidden space-y-3 min-[1240px]:block">
            {/* Trust first: it is the question a visitor answers before he reads anything. */}
            <TrustBox />
            <AboutCard />
            <div>
              <AskModo />
              <AiDisclaimer />
            </div>
          </div>
        </StickyRail>
      }
    />
    {/* This page's own two asks (Khalid's contextual-bar rule): a reader who did not find
        his article here has two other ways to take the same content — watch it, or hear
        it. Booking belongs on a partner's page, not on an archive. */}
    <MobileCtaBar
      ariaLabel="شاهد أو استمع"
      primary={{ href: "/reels", label: "شاهد الطلّات", icon: ModontyReelsMark }}
      secondary={{ href: "/audio", label: "استمع", icon: IconVolume2 }}
    />
    </>
  );
}
