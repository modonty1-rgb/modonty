import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";
import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { EntitySearchForm } from "@/components/listing/EntitySearchForm";
import { AiDisclaimer } from "@/components/shared/ai-disclaimer/AiDisclaimer";
import { AboutCard } from "@/components/shared/about-card/AboutCard";
import { MobileCtaBar } from "@/components/shared/mobile-cta-bar/MobileCtaBar";
import { ModontyReelsMark } from "@/components/icons/modonty-reels-mark";
import { IconVolume2 } from "@/lib/icons";

import { ArticlesHeader } from "../articles-header/ArticlesHeader";
import { AskModo } from "@/components/shared/ask-modo/AskModo";
import { TrustBox } from "../trust-box/TrustBox";
import { ResultsLine } from "../results-line/ResultsLine";
import { FiltersBar } from "@/components/shared/archive-filters/FiltersBar";
import { ReadingTimeBar } from "@/components/shared/archive-filters/ReadingTimeBar";
import { ArticlesFeed } from "../articles-feed/ArticlesFeed";

import type { ArchiveState } from "@/lib/articles/archive/build-archive-href";
import type { ReadingTimeBucket } from "@/lib/articles/archive/reading-time-buckets";
import type { ArchiveFilters } from "@/lib/articles/archive/get-articles-filters";
import type { ArchiveArticle } from "@/lib/articles/archive/get-articles-archive";
import type { ReactNode } from "react";

interface ArticlesPageLayoutProps {
  breadcrumb: ReactNode;
  articles: ArchiveArticle[];
  total: number;
  filters: ArchiveFilters;
  readingTimeCounts: Record<ReadingTimeBucket, number>;
  current: ArchiveState;
  scopeLabel: string | null;
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
}: ArticlesPageLayoutProps) {
  return (
    <>
    <TwoColumnLayout
      header={breadcrumb}
      main={
        <>
          {/* The trust hint and the «مدونتي» bar were here on the phone until 22 Aug; Khalid
              removed both. They sat between the reader and the one thing this page asks him to
              do — pick and read — and neither answered a question he had at that moment. Both
              still live in the desktop rail below, where there is room for them. */}
          <ArticlesHeader page={current.page && current.page > 1 ? current.page : 1} />

          {/* Search sits WITH the filters: known-item finding and exploratory browsing are the
              same job, and every filter-UX guide puts their controls together. On the phone it
              was removed on 21 Aug and brought back on 23 Aug (Khalid: «all the articles with
              filter and fast search») — this page is now the site's reading archive, and an
              archive the reader can only search from the navbar is a search he has to find. */}
          <EntitySearchForm
            basePath="/articles"
            placeholder="اكتب كلمة من العنوان..."
            defaultValue={current.search ?? ""}
            live
          />
          <FiltersBar filters={filters} current={current} />

          {/* Count and time on one line — stacked, the controls filled 61% of the screen before
              the first article appeared. The results line is desktop-only (Khalid, 21 Aug:
              «remove»): on a phone the picked field card is already lit and the breadcrumb
              names it, so the line repeated what two elements above it had said. */}
          {/* The list had a label here — «مقالات تستاهل وقتك» — until the title moved to the
              top of the page on 22 Aug. Two promise lines a screen apart is one too many, and
              the `h1` up there is the stronger place for it. */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="hidden min-[1240px]:block">
              <ResultsLine total={total} scopeLabel={scopeLabel} current={current} />
            </div>
            <ReadingTimeBar counts={readingTimeCounts} current={current} />
          </div>

          {/* The list is OPEN from the first paint, every viewport. For one day (22–23 Aug) the
              phone opened with a «pick a field first» prompt instead; Khalid moved that pattern
              to `/industries`, where choosing a sector IS the page, and set this page back to
              what its name promises: all the articles, with the filters and the search above
              them. That also dissolved the twin problem — the unfiltered list here and the
              combined feed there measured 117/117 identical on 19 Aug. */}
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
