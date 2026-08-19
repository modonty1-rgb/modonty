import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";

import { FiltersRail } from "../filters-rail/FiltersRail";
import { ArticlesFeed } from "../articles-feed/ArticlesFeed";
import { ReadingTimeBar } from "../reading-time-bar/ReadingTimeBar";
import { EntitySearchForm } from "@/components/listing/EntitySearchForm";

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
 * The same three columns as `/`, `/clients` and `/industries` — identical widths and gaps, so
 * moving between them never moves the furniture.
 *
 * Above them, full width, sits «عندك كم دقيقة؟». Khalid put it there (2026-08-19) because it is
 * the question a reader answers before he picks a subject, so it belongs where the eye lands.
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
          label="بحث في المقالات"
          className="hidden w-[300px] shrink-0 self-start min-[1240px]:sticky min-[1240px]:block"
        >
          <div className="rounded-xl border border-border bg-card p-3">
            <h2 className="mb-2 text-sm font-bold text-foreground">دوّر على مقال</h2>
            {/* Same component /categories and /tags use — one search behaviour across the site. */}
            <EntitySearchForm basePath="/articles" placeholder="اكتب كلمة من العنوان..." defaultValue={current.search ?? ""} />
          </div>
        </StickyRail>
      }
    />
  );
}
