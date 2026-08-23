import { FeedPagination } from "@/components/shared/pagination/FeedPagination";
import { PostCard } from "@/components/feed/postcard/PostCard";
import { AccentHeading } from "@/components/shared/accent-heading/AccentHeading";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";
import { fill, messages } from "@/lib/i18n/messages";
import type { FeedPost } from "@/lib/types";

import { FeedFilterMenu } from "./FeedFilterMenu";
import { MoreModontyArticlesOnScroll } from "./MoreModontyArticlesOnScroll";
import type { FeedView } from "./feed-views";

interface ModontyArticlesFeedProps {
  articles: FeedPost[];
  page: number;
  view: FeedView;
  /** modonty's own slug — what the scroll endpoint filters by. */
  clientSlug: string;
  buildPageHref: (page: number) => string;
  viewHrefs: Record<FeedView, string>;
}

/**
 * modonty's own articles — the same `PostCard` the homepage feed draws.
 *
 * Scroll AND links, not one or the other (22 Aug 2026). The reader gets the endless list
 * every feed on this site already has; the crawler gets `<a href>` prev/next underneath it,
 * because a crawler neither scrolls nor clicks and the shared engine's contract requires a
 * server-rendered paginated twin. Take either half away and the page loses either its
 * readers or its eleventh article onward.
 *
 * The scroll runs on EVERY view. The endpoint learned to sort and filter on 22 Aug
 * (`view=popular` orders by `viewsCount`, `view=audio` filters `hasAudio`), so a scrolled
 * chunk now arrives in the same order the page was rendered in — before that it would have
 * silently undone the filter the reader had just chosen.
 */
export function ModontyArticlesFeed({ articles, page, view, clientSlug, buildPageHref, viewHrefs }: ModontyArticlesFeedProps) {
  const start = (page - 1) * FEED_PAGE_SIZE;
  const rows = articles.slice(start, start + FEED_PAGE_SIZE);
  const hasMore = articles.length > start + FEED_PAGE_SIZE;

  return (
    <section aria-labelledby="modonty-articles-heading" className="space-y-4 max-lg:space-y-3">
      {/* Heading and the filter pill on ONE row, the way the approved mockup draws it
          (`card-mockup.html` — `.feedhead`). */}
      <div className="flex items-center justify-between gap-3">
        <AccentHeading id="modonty-articles-heading" size="title">
          {page > 1 ? fill(messages.modonty.feedTitlePaged, { page: page.toLocaleString("ar-SA") }) : messages.modonty.feedTitle}
        </AccentHeading>
        <FeedFilterMenu view={view} hrefs={viewHrefs} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg bg-card p-8 text-center ring-1 ring-border">
          <p className="text-sm font-medium text-foreground">
            {view === "audio" ? "ما في مقال بنسخة صوتية هنا" : "ما نشرنا مقالات بعد"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {view === "audio" ? "جرّب «الأحدث» — فيها كل المقالات." : "تابعنا، جايين قريب."}
          </p>
        </div>
      ) : (
        // 16px between cards was 144px of pure gap over a ten-card feed on a phone
        // (Khalid, 22 Aug). 10px still separates two bordered cards clearly.
        <div className="space-y-4 max-lg:space-y-2.5">
          {rows.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} hideClient />
          ))}
          {hasMore && (
            <MoreModontyArticlesOnScroll
              clientSlug={clientSlug}
              startIndex={start + rows.length}
              initialPage={page}
              basePath={buildPageHref(1)}
              view={view}
            />
          )}
        </div>
      )}

      {/* `data-feed-pagination` is the handle the «اللسان الفعّال»-style rule in globals.css
          grabs: once the scroll marks itself live, these links stop being drawn for the
          reader — they already have the whole feed — while staying in the HTML for the
          crawler and for a browser with JavaScript off. */}
      <div data-feed-pagination>
        <FeedPagination page={page} hasMore={hasMore} buildHref={buildPageHref} label="تنقّل بين صفحات المقالات" />
      </div>
    </section>
  );
}
