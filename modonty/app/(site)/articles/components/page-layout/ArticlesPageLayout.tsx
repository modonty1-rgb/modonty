import { EntitySearchForm } from "@/components/listing/EntitySearchForm";
import { AiDisclaimer } from "@/components/shared/ai-disclaimer/AiDisclaimer";

import { AskModo } from "../ask-modo/AskModo";
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
 * ONE column, not three.
 *
 * This page had copied the homepage's three-column shell, and the result was a second homepage:
 * measured 2026-08-19, every shared component `/articles` imported was one the homepage imports
 * too — a 100% overlap, with only the card size and the pagination telling them apart. Khalid saw
 * it before the measurement did.
 *
 * The shape comes from how real archives are built. Vercel, Stripe and Intercom are all a single
 * column with a horizontal category strip and no side rails at all (measured the same day). A
 * reader here is searching, not browsing a feed — rails give him furniture, not answers.
 *
 * Order follows the order of his questions: which field → what am I looking for → how long do I
 * have → and if none of that worked, ask Modo.
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
    <div className="container mx-auto max-w-[760px] px-3 py-3 sm:px-4 sm:py-6">
      <div className="mb-5 space-y-4">
        {breadcrumb}

        {/* Search sits WITH the filters, not below Modo. Known-item finding and exploratory
            browsing are the same job, and every filter-UX guide puts their controls together. */}
        <EntitySearchForm
          basePath="/articles"
          placeholder="اكتب كلمة من العنوان..."
          defaultValue={current.search ?? ""}
        />
        <FiltersBar filters={filters} current={current} />

        {/* Count and time on ONE line. Stacked, the controls filled 61% of the screen before the
            first article; side by side they read as one row and the list starts above the fold. */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <ResultsLine total={total} scopeLabel={scopeLabel} current={current} />
          <ReadingTimeBar counts={readingTimeCounts} current={current} />
        </div>
      </div>

      <ArticlesFeed articles={articles} current={current} />

      {/* Last, not first: Modo is what you reach for after the list did not answer you. */}
      {/* The disclosure travels with Modo, not with the chat page. EU AI Act Article 50 asks that
          a person be told they are talking to a machine at the FIRST interaction — and for many
          visitors that first interaction starts here. */}
      <div className="mt-6">
        <AskModo />
        <AiDisclaimer />
      </div>
    </div>
  );
}
