import { FeedPagination } from "@/components/shared/pagination/FeedPagination";
import { PostCard } from "@/components/feed/postcard/PostCard";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";
import type { FeedPost } from "@/lib/types";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

interface ArticlesFeedProps {
  /** Every article in scope — this component only chunks and draws. */
  articles: FeedPost[];
  /** 1-based chunk of the feed being shown. */
  page: number;
  /** Omit for the base `/industries` page — the combined feed across every field. */
  industryName?: string;
  buildPageHref: (page: number) => string;
}

/**
 * The center column: articles in the same card the homepage feed uses — either one
 * field's, or every field's combined on the base `/industries` page (Khalid, 2026-08-16:
 * «هذه الصفحة الرئيسية التي يكون فيها التقسيم»). Real `<a href>` pagination, not
 * infinite scroll — the home feed's infinite-scroll action is bound to the whole-site
 * feed, not this slice, and a crawlable chunk link is what lets Google reach article 11
 * onward (same reasoning as `/clients`).
 */
export function ArticlesFeed({ articles, page, industryName, buildPageHref }: ArticlesFeedProps) {
  const start = (page - 1) * FEED_PAGE_SIZE;
  const rows = articles.slice(start, start + FEED_PAGE_SIZE);
  const hasMore = articles.length > start + FEED_PAGE_SIZE;
  const title = industryName ? `مقالات ${industryName}` : "أحدث مقالات المجالات";

  return (
    <section aria-labelledby="industry-feed-heading" className="space-y-4">
      <h1 id="industry-feed-heading" className="text-base font-bold text-foreground">
        {page > 1 ? `${title} — الصفحة ${page.toLocaleString(SITE_LOCALE)}` : title}
      </h1>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-medium text-foreground">
            {industryName ? "ما فيه مقالات في هذا المجال بعد" : "ما فيه مقالات بعد"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">تابعنا، الشركاء ينشرون قريباً.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      )}

      <FeedPagination page={page} hasMore={hasMore} buildHref={buildPageHref} label="تنقّل بين صفحات المقالات" />
    </section>
  );
}
