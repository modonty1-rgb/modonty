import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";
import { ModontyCard } from "@/components/shared/modonty-card/ModontyCard";

import { FiltersRail } from "../filters-rail/FiltersRail";
import { ArticlesFeed } from "../articles-feed/ArticlesFeed";
import { ReadingTimeBar } from "../reading-time-bar/ReadingTimeBar";

import type { ArchiveState } from "../../helpers/build-archive-href";
import type { ReadingTimeBucket } from "../../helpers/reading-time-buckets";
import type { ArchiveFilters } from "../../data/get-articles-filters";
import type { FeedPost } from "@/lib/types";
import type { ReactNode } from "react";

interface ArticlesPageLayoutProps {
  breadcrumb: ReactNode;
  articles: FeedPost[];
  readingTimeCounts: Record<ReadingTimeBucket, number>;
  filters: ArchiveFilters;
  modontyArticles: FeedPost[];
  brandLogoUrl: string | null;
  current: ArchiveState;
  scopeLabel: string | null;
}

/**
 * The same three columns as `/`, `/clients` and `/industries` — identical widths and gaps, so
 * moving between them never moves the furniture.
 *
 * Right narrows by subject (المجال then التصنيف), left is modonty's own card, the same one the homepage carries. Above both, full
 * width, «عندك كم دقيقة؟» — the question a reader answers before he picks a subject.
 */
export function ArticlesPageLayout({
  breadcrumb,
  articles,
  readingTimeCounts,
  filters,
  modontyArticles,
  brandLogoUrl,
  current,
  scopeLabel,
}: ArticlesPageLayoutProps) {
  return (
    <ThreeColumnLayout
      header={
        <div className="space-y-4">
          {breadcrumb}
          <ReadingTimeBar counts={readingTimeCounts} current={current} />
        </div>
      }
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
          label="مدونتي"
          className="hidden w-[300px] shrink-0 self-start min-[1240px]:sticky min-[1240px]:block"
        >
          <ModontyCard articles={modontyArticles} brandLogoUrl={brandLogoUrl} />
        </StickyRail>
      }
    />
  );
}
