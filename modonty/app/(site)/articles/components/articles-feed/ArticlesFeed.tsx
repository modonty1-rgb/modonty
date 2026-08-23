import Link from "next/link";

import { PostCard } from "@/components/feed/postcard/PostCard";
import { FeedPagination } from "@/components/shared/pagination/FeedPagination";
import { MoreArticlesOnScroll } from "../more-articles/MoreArticlesOnScroll";


import { buildArchiveHref, type ArchiveState } from "@/lib/articles/archive/build-archive-href";
import { FOCUS_RING } from "@/lib/articles/archive/focus-ring";
import { ARCHIVE_PAGE_SIZE } from "../../helpers/archive-page-size";

import type { ArchiveArticle } from "@/lib/articles/archive/get-articles-archive";

interface ArticlesFeedProps {
  /** Everything in scope — this component only chunks and draws. */
  articles: ArchiveArticle[];
  current: ArchiveState;
}

/**
 * The middle column: one compact row per article, so the page can be scanned instead of scrolled.
 *
 * Pagination is real `<a href>` links, not infinite scroll — Google never reaches article eleven
 * by scrolling, and this page exists to be crawled as much as read.
 */
export function ArticlesFeed({ articles, current }: ArticlesFeedProps) {
  const page = current.page && current.page > 1 ? current.page : 1;
  const start = (page - 1) * ARCHIVE_PAGE_SIZE;
  const rows = articles.slice(start, start + ARCHIVE_PAGE_SIZE);
  const hasMore = articles.length > start + ARCHIVE_PAGE_SIZE;

  return (
    // The page's `h1` moved out of here on 22 Aug — `ArticlesHeader` draws it at the top of
    // the page (visible on phones, `sr-only` on desktop). A second one in the feed would be
    // two names for one page, so the list labels itself by pointing UP at it.
    <section aria-label="قائمة المقالات" className="space-y-4">
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          {/* The hint names what the visitor can actually see and undo: on a phone the search
              box is in the navbar, not on the page, so «شيل واحداً من الفلاتر» pointed at a
              control that was not there (Khalid, 21 Aug). */}
          <p className="text-sm font-medium text-foreground">ما فيه مقالات بهذي التصفية</p>
          <p className="mt-1 text-xs text-muted-foreground">جرّب مجالاً آخر، أو وقت قراءة أطول.</p>
          <Link
            href={buildArchiveHref({})}
            className={"mt-3 inline-flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-link hover:underline active:bg-muted " + FOCUS_RING}
          >
            اعرض كل المقالات
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* ONE article card for the whole site (Khalid, 21 Aug): the same `PostCard` the
              homepage feed draws — publisher with his logo, title, brief, 16:9 thumb, audio
              mark. `ArchiveArticle` is a `FeedPost` plus trust fields, so it slots straight
              in. The archive's own `MiniCard` is no longer rendered; its file stays. */}
          <ul className="space-y-3">
            {rows.map((post, index) => (
              <li key={post.id}>
                <PostCard post={post} index={index} isLcp={index === 0 && page === 1} />
              </li>
            ))}
          </ul>

          {/* Scrolling continues from where the server stopped. The prev/next links below stay in
              the markup on purpose: a crawler neither scrolls nor clicks, and the engine's own
              contract requires a server-rendered paginated twin behind the scroll. */}
          {hasMore && (
            <MoreArticlesOnScroll current={current} startIndex={start + rows.length} initialPage={page} />
          )}
        </div>
      )}

      <FeedPagination
        page={page}
        hasMore={hasMore}
        buildHref={(target) => buildArchiveHref({ ...current, page: target })}
        label="تنقّل بين صفحات المقالات"
      />
    </section>
  );
}
