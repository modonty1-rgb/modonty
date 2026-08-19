import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";
import { ModontyCard } from "@/components/shared/modonty-card/ModontyCard";
import { EntitySearchForm } from "@/components/listing/EntitySearchForm";

import { ArticlesFeed } from "../articles-feed/ArticlesFeed";
import { ReadingTimeBar } from "../reading-time-bar/ReadingTimeBar";

import type { ArchiveState } from "../../helpers/build-archive-href";
import type { ReadingTimeBucket } from "../../helpers/reading-time-buckets";
import type { FeedPost } from "@/lib/types";
import type { ReactNode } from "react";

interface ArticlesPageLayoutProps {
  breadcrumb: ReactNode;
  articles: FeedPost[];
  readingTimeCounts: Record<ReadingTimeBucket, number>;
  modontyArticles: FeedPost[];
  brandLogoUrl: string | null;
  current: ArchiveState;
  scopeLabel: string | null;
}

/**
 * The same three columns as `/`, `/clients` and `/industries` — identical widths and gaps, so
 * moving between them never moves the furniture.
 *
 * Right is search, not filters: Khalid replaced the industry/category boxes with one search box
 * (2026-08-19). Left is modonty's own card, the same one the homepage carries. Above both, full
 * width, «عندك كم دقيقة؟» — the question a reader answers before he picks a subject.
 */
export function ArticlesPageLayout({
  breadcrumb,
  articles,
  readingTimeCounts,
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
          label="بحث في المقالات"
          className="hidden w-[300px] shrink-0 self-start min-[1240px]:sticky min-[1240px]:block"
        >
          <div className="rounded-xl border border-border bg-card p-3">
            <h2 className="mb-2 text-sm font-bold text-foreground">دوّر على مقال</h2>
            {/* The same component `/categories` and `/tags` use — one search behaviour site-wide. */}
            <EntitySearchForm
              basePath="/articles"
              placeholder="اكتب كلمة من العنوان..."
              defaultValue={current.search ?? ""}
            />
          </div>
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
