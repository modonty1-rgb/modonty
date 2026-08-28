"use client";

import { InfiniteList } from "@modonty/shared/components/infinite-list";
import type { InfiniteListPage } from "@modonty/shared/components/infinite-list";

import { PostCard } from "@/components/feed/postcard/PostCard";
import { ModontyArrowMark } from "@/components/icons/modonty-arrow-mark";
import { IconLoading } from "@/lib/icons";
import type { FeedPost } from "@/lib/types";

import type { FeedView } from "./feed-views";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

interface MoreModontyArticlesProps {
  /** modonty's own slug — the endpoint filters the feed down to this publisher. */
  clientSlug: string;
  /** How many cards the server already drew above this list. */
  startIndex: number;
  initialPage: number;
  /** Route the chunks mirror onto — a STRING, because a function cannot cross into a
      Client Component. It already carries the active view, so `?page=N` is appended to it. */
  basePath: string;
  /** The active view — the endpoint must sort and filter the same way the page did. */
  view: FeedView;
}

/**
 * `/modonty`'s skin over the shared infinite-scroll engine — the same one the homepage and
 * the archive already run, not a third implementation.
 *
 * Built 22 Aug 2026 after I argued AGAINST it and was wrong: I measured 12 articles today
 * and treated that as the page's shape. Khalid: «it's not fixed twelve article» — the count
 * is a snapshot of a publisher that keeps publishing, and a page designed around today's
 * number breaks silently on the day it stops being true. The engine costs nothing until the
 * reader reaches the end of the list, so there is no case for waiting.
 *
 * The endpoint already accepted a `client` filter for the coming mobile app, so nothing new
 * was needed on the server.
 *
 * The prev/next links stay in the markup below this. That is not redundancy — a crawler
 * neither scrolls nor clicks, and the engine's own contract requires a server-rendered
 * paginated twin behind the scroll. `pageUrl` keeps the address bar honest while it loads.
 */
export function MoreModontyArticles({ clientSlug, startIndex, initialPage, basePath, view }: MoreModontyArticlesProps) {
  const fetchPage = async (page: number): Promise<InfiniteListPage<FeedPost>> => {
    const response = await fetch(`/api/articles?page=${page}&client=${encodeURIComponent(clientSlug)}${view === "latest" ? "" : `&view=${view}`}`);
    if (!response.ok) throw new Error(`articles endpoint returned ${response.status}`);

    const result = (await response.json()) as { articles: FeedPost[]; hasMore: boolean };
    return {
      hasMore: result.hasMore,
      // JSON carries no Date — the card formats it, so it has to arrive as one.
      items: result.articles.map((item) => ({ ...item, publishedAt: new Date(item.publishedAt) })),
    };
  };

  // `basePath` already carries the view («/modonty?view=audio»), so the page separator has
  // to follow what is already there rather than always being «?».
  return (
    <InfiniteList<FeedPost>
      initialPage={initialPage}
      startIndex={startIndex}
      fetchPage={fetchPage}
      getKey={(item) => item.id}
      pageUrl={(page) => (page > 1 ? `${basePath}${basePath.includes("?") ? "&" : "?"}page=${page}` : basePath)}
      listClassName="space-y-4 max-lg:space-y-2.5"
      // `hideClient` because this page IS the publisher — the same prop the server rows use,
      // or the scrolled cards would grow a publisher line the ones above them do not have.
      renderItem={(item) => <PostCard post={item} hideClient />}
      renderLoading={(seen) => (
        <div className="flex items-center justify-center gap-2 border-t border-border py-4 text-muted-foreground">
          <IconLoading className="h-4 w-4 animate-spin" aria-hidden />
          <span className="text-xs">نجيب لك المزيد… (شفت {seen.toLocaleString(SITE_LOCALE)} مقالاً)</span>
        </div>
      )}
      renderError={(retry) => (
        <div className="border-t border-border py-4 text-center">
          <p className="text-xs text-muted-foreground">ما قدرنا نجيب الباقي.</p>
          <button
            type="button"
            onClick={retry}
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            جرّب مرة ثانية
            <ModontyArrowMark className="size-5 text-muted-foreground" />
          </button>
        </div>
      )}
      /* The end line names a number, not «انتهى». A reader who just scrolled through
         modonty.s whole output should be told how much that was — it is the one place on
         this page where a count belongs to the READER rather than to us. */
      renderEnd={(seen) => (
        <p className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          خلصت مقالات مدونتي — {seen.toLocaleString(SITE_LOCALE)} مقالاً.
        </p>
      )}
    />
  );
}
