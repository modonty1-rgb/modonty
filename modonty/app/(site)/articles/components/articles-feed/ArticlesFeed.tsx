import Link from "next/link";

import { MiniCard } from "../mini-card/MiniCard";
import { MoreArticlesOnScroll } from "../more-articles/MoreArticlesOnScroll";


import { buildArchiveHref, type ArchiveState } from "../../helpers/build-archive-href";
import { FOCUS_RING } from "../../helpers/focus-ring";

import type { ArchiveArticle } from "../../data/get-articles-archive";

/**
 * Twenty, not the feed's ten: a mini row is roughly a quarter the height of the homepage card, so
 * ten of them left the column half empty next to the rails (Khalid, 2026-08-19: «مساحات كبيرة
 * فاضية»). The shared ARCHIVE_PAGE_SIZE stays at ten for the homepage, where the card is a poster.
 */
const ARCHIVE_PAGE_SIZE = 20;

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
    <section aria-labelledby="articles-heading" className="space-y-4">
      {/* Invisible by Khalid's call (2026-08-19) — he pointed at the old title strip and said
          «remove». It stays in the markup: a page with no `h1` loses its name in search results
          and leaves a screen reader with nothing to announce. What the visitor sees instead is
          the results line above the list, which says the same thing and adds a way out. */}
      <h1 id="articles-heading" className="sr-only">
        {page > 1 ? `كل المقالات — الصفحة ${page.toLocaleString("ar-SA")}` : "كل المقالات"}
      </h1>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-medium text-foreground">ما فيه مقالات بهذي التصفية</p>
          <p className="mt-1 text-xs text-muted-foreground">جرّب تشيل واحداً من الفلاتر.</p>
          <Link
            href={buildArchiveHref({})}
            className={"mt-3 inline-flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-link hover:underline active:bg-muted " + FOCUS_RING}
          >
            اعرض كل المقالات
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {rows.map((post, index) => (
              <MiniCard key={post.id} post={post} isLcp={index === 0 && page === 1} />
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

      {(page > 1 || hasMore) && (
        <nav
          aria-label="تنقّل بين صفحات المقالات"
          className="flex items-center justify-between gap-3 border-t border-border pt-4"
        >
          {page > 1 ? (
            <Link
              href={buildArchiveHref({ ...current, page: page - 1 })}
              className={"inline-flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-link transition-colors hover:underline active:bg-muted " + FOCUS_RING}
            >
              → الصفحة السابقة
            </Link>
          ) : (
            <span />
          )}
          {hasMore && (
            <Link
              href={buildArchiveHref({ ...current, page: page + 1 })}
              className={"inline-flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-link transition-colors hover:underline active:bg-muted " + FOCUS_RING}
            >
              الصفحة التالية ←
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
