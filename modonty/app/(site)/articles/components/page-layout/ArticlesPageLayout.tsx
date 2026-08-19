import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";

import { FiltersRail } from "../filters-rail/FiltersRail";
import { ArticlesFeed } from "../articles-feed/ArticlesFeed";
import { DiscoverRail } from "../discover-rail/DiscoverRail";

import type { ArchiveState } from "../../helpers/build-archive-href";
import type { ReadingTimeBucket } from "../../helpers/reading-time-buckets";
import type { ArchiveFilters } from "../../data/get-articles-filters";
import type { FeedPost } from "@/lib/types";
import type { ReactNode } from "react";

interface ArticlesPageLayoutProps {
  header?: ReactNode;
  articles: FeedPost[];
  filters: ArchiveFilters;
  readingTimeCounts: Record<ReadingTimeBucket, number>;
  current: ArchiveState;
  scopeLabel: string | null;
}

/**
 * The same three columns as `/`, `/clients` and `/industries` — identical widths and gaps, so
 * moving between them never moves the furniture. Right narrows by subject, centre reads, left
 * narrows by how much time the visitor has.
 */
export function ArticlesPageLayout({
  header,
  articles,
  filters,
  readingTimeCounts,
  current,
  scopeLabel,
}: ArticlesPageLayoutProps) {
  return (
    <ThreeColumnLayout
      header={header}
      right={
        <StickyRail
          label="تصفية المقالات"
          className="hidden w-[300px] shrink-0 self-start min-[1240px]:sticky min-[1240px]:block"
        >
          <FiltersRail filters={filters} current={current} />
        </StickyRail>
      }
      center={<ArticlesFeed articles={articles} current={current} scopeLabel={scopeLabel} />}
      left={
        <StickyRail
          label="اقرأ حسب وقتك"
          className="hidden w-[300px] shrink-0 self-start min-[1240px]:sticky min-[1240px]:block"
        >
          <DiscoverRail readingTimeCounts={readingTimeCounts} current={current} />
        </StickyRail>
      }
    />
  );
}
