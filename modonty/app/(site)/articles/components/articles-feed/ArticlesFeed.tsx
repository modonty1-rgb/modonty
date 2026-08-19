import Link from "next/link";

import { MiniCard } from "../mini-card/MiniCard";

import { cn } from "@/lib/utils";

import { withArchiveChange, buildArchiveHref, type ArchiveState } from "../../helpers/build-archive-href";

import type { ArchiveSort } from "../../data/get-articles-archive";
import type { FeedPost } from "@/lib/types";

/**
 * Twenty, not the feed's ten: a mini row is roughly a quarter the height of the homepage card, so
 * ten of them left the column half empty next to the rails (Khalid, 2026-08-19: «مساحات كبيرة
 * فاضية»). The shared ARCHIVE_PAGE_SIZE stays at ten for the homepage, where the card is a poster.
 */
const ARCHIVE_PAGE_SIZE = 20;

const SORTS: { key: ArchiveSort; label: string }[] = [
  { key: "newest", label: "الأحدث" },
  { key: "mostRead", label: "الأكثر قراءة" },
  { key: "mostEngaged", label: "الأكثر تفاعلاً" },
];

interface ArticlesFeedProps {
  /** Everything in scope — this component only chunks and draws. */
  articles: FeedPost[];
  current: ArchiveState;
  /** What the visitor filtered by, in words, for the heading. */
  scopeLabel: string | null;
}

/**
 * The middle column: one compact row per article, so the page can be scanned instead of scrolled.
 *
 * Pagination is real `<a href>` links, not infinite scroll — Google never reaches article eleven
 * by scrolling, and this page exists to be crawled as much as read.
 */
export function ArticlesFeed({ articles, current, scopeLabel }: ArticlesFeedProps) {
  const page = current.page && current.page > 1 ? current.page : 1;
  const start = (page - 1) * ARCHIVE_PAGE_SIZE;
  const rows = articles.slice(start, start + ARCHIVE_PAGE_SIZE);
  const hasMore = articles.length > start + ARCHIVE_PAGE_SIZE;

  const heading = scopeLabel ? `مقالات ${scopeLabel}` : "كل المقالات";

  return (
    <section aria-labelledby="articles-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 id="articles-heading" className="text-base font-bold text-foreground">
          {page > 1 ? `${heading} — الصفحة ${page.toLocaleString("ar-SA")}` : heading}
        </h1>
        <p className="text-xs text-muted-foreground">
          {articles.length.toLocaleString("ar-SA")} مقالاً
        </p>
      </div>

      <nav aria-label="ترتيب المقالات" className="flex flex-wrap gap-2">
        {SORTS.map((sort) => {
          const active = (current.sort ?? "newest") === sort.key;
          return (
            <Link
              key={sort.key}
              href={withArchiveChange(current, { sort: sort.key })}
              aria-current={active ? "true" : undefined}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {sort.label}
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-medium text-foreground">ما فيه مقالات بهذي التصفية</p>
          <p className="mt-1 text-xs text-muted-foreground">جرّب تشيل واحداً من الفلاتر.</p>
          <Link
            href={buildArchiveHref({})}
            className="mt-3 inline-block text-sm font-medium text-link hover:underline"
          >
            اعرض كل المقالات
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {rows.map((post, index) => (
            <MiniCard key={post.id} post={post} isLcp={index === 0 && page === 1} />
          ))}
        </ul>
      )}

      {(page > 1 || hasMore) && (
        <nav
          aria-label="تنقّل بين صفحات المقالات"
          className="flex items-center justify-between gap-3 border-t border-border pt-4"
        >
          {page > 1 ? (
            <Link
              href={buildArchiveHref({ ...current, page: page - 1 })}
              className="text-sm font-medium text-link hover:underline"
            >
              → الصفحة السابقة
            </Link>
          ) : (
            <span />
          )}
          {hasMore && (
            <Link
              href={buildArchiveHref({ ...current, page: page + 1 })}
              className="text-sm font-medium text-link hover:underline"
            >
              الصفحة التالية ←
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
