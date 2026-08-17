import Link from "next/link";
import { PostCard } from "@/components/feed/postcard/PostCard";
import { AccentHeading } from "@/components/shared/accent-heading/AccentHeading";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";
import { fill, messages } from "@/lib/i18n/messages";
import type { FeedPost } from "@/lib/types";

interface ModontyArticlesFeedProps {
  articles: FeedPost[];
  page: number;
  buildPageHref: (page: number) => string;
}

/**
 * modonty's own articles — same `PostCard` the homepage feed uses, real crawlable
 * pagination (matches `/clients` and `/industries`: a genuine `<a href>` per chunk, not
 * infinite scroll, so Google can reach article 11 onward).
 */
export function ModontyArticlesFeed({ articles, page, buildPageHref }: ModontyArticlesFeedProps) {
  const start = (page - 1) * FEED_PAGE_SIZE;
  const rows = articles.slice(start, start + FEED_PAGE_SIZE);
  const hasMore = articles.length > start + FEED_PAGE_SIZE;

  return (
    <section aria-labelledby="modonty-articles-heading" className="space-y-4">
      <AccentHeading id="modonty-articles-heading" size="title">
        {page > 1 ? fill(messages.modonty.feedTitlePaged, { page: page.toLocaleString("ar-SA") }) : messages.modonty.feedTitle}
      </AccentHeading>

      {rows.length === 0 ? (
        <div className="rounded-lg bg-card p-8 text-center ring-1 ring-border">
          <p className="text-sm font-medium text-foreground">ما نشرنا مقالات بعد</p>
          <p className="mt-1 text-xs text-muted-foreground">تابعنا، جايين قريب.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} hideClient />
          ))}
        </div>
      )}

      {(page > 1 || hasMore) && (
        <nav aria-label="تنقّل بين صفحات المقالات" className="flex items-center justify-between gap-3 border-t border-border pt-4">
          {page > 1 ? (
            <Link href={buildPageHref(page - 1)} className="text-sm font-medium text-link hover:underline">
              → الصفحة السابقة
            </Link>
          ) : (
            <span />
          )}
          {hasMore && (
            <Link href={buildPageHref(page + 1)} className="text-sm font-medium text-link hover:underline">
              الصفحة التالية ←
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
