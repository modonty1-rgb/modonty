import { AskModo } from "../ask-modo/AskModo";
import { FiltersBar } from "../filters-bar/FiltersBar";
import { ReadingTimeBar } from "../reading-time-bar/ReadingTimeBar";
import { ArticlesFeed } from "../articles-feed/ArticlesFeed";

import type { ArchiveState } from "../../helpers/build-archive-href";
import type { ReadingTimeBucket } from "../../helpers/reading-time-buckets";
import type { ArchiveFilters } from "../../data/get-articles-filters";
import type { FeedPost } from "@/lib/types";
import type { ReactNode } from "react";

interface ArticlesPageLayoutProps {
  breadcrumb: ReactNode;
  articles: FeedPost[];
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
  filters,
  readingTimeCounts,
  current,
  scopeLabel,
}: ArticlesPageLayoutProps) {
  return (
    <div className="container mx-auto max-w-[760px] px-3 py-3 sm:px-4 sm:py-6">
      <div className="mb-5 space-y-4">
        {breadcrumb}
        <FiltersBar filters={filters} current={current} />
        <ReadingTimeBar counts={readingTimeCounts} current={current} />
        <AskModo />
      </div>

      <ArticlesFeed articles={articles} current={current} scopeLabel={scopeLabel} />
    </div>
  );
}
