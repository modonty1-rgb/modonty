import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";
import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { EntitySearchForm } from "@/components/listing/EntitySearchForm";
import { AiDisclaimer } from "@/components/shared/ai-disclaimer/AiDisclaimer";
import { AboutCard } from "@/components/shared/about-card/AboutCard";

import { AskModo } from "../ask-modo/AskModo";
import { TrustBox } from "../trust-box/TrustBox";
import { ResultsLine } from "../results-line/ResultsLine";
import { FiltersBar } from "../filters-bar/FiltersBar";
import { ReadingTimeBar } from "../reading-time-bar/ReadingTimeBar";
import { ArticlesFeed } from "../articles-feed/ArticlesFeed";

import type { ArchiveState } from "../../helpers/build-archive-href";
import type { ReadingTimeBucket } from "../../helpers/reading-time-buckets";
import type { ArchiveFilters } from "../../data/get-articles-filters";
import type { ArchiveArticle } from "../../data/get-articles-archive";
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
    <TwoColumnLayout
      header={breadcrumb}
      main={
        <>
          {/* Search sits WITH the filters: known-item finding and exploratory browsing are the
              same job, and every filter-UX guide puts their controls together. */}
          <EntitySearchForm
            basePath="/articles"
            placeholder="اكتب كلمة من العنوان..."
            defaultValue={current.search ?? ""}
          />
          <FiltersBar filters={filters} current={current} />

          {/* Count and time on one line — stacked, the controls filled 61% of the screen before
              the first article appeared. */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <ResultsLine total={total} scopeLabel={scopeLabel} current={current} />
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
          <div className="space-y-3">
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
  );
}
