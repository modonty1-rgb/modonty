"use client";

import { InfiniteList } from "@modonty/shared/components/infinite-list";
import { IconLoading } from "@/lib/icons";

import { PostCard } from "@/components/feed/postcard/PostCard";
import { buildArchiveHref, type ArchiveState } from "../../helpers/build-archive-href";

import type { InfiniteListPage } from "@modonty/shared/components/infinite-list";
import type { ArchiveArticle } from "../../data/get-articles-archive";

interface MoreArticlesProps {
  /** Everything the visitor filtered by — every scrolled chunk must obey the same filters. */
  current: ArchiveState;
  /** How many rows the server already rendered above this list. */
  startIndex: number;
  initialPage: number;
}

/** The query the endpoint needs, built from the same state the links are built from. */
function toQuery(current: ArchiveState, page: number): string {
  const params = new URLSearchParams({ page: String(page) });
  if (current.industry) params.set("industry", current.industry);
  if (current.category) params.set("category", current.category);
  if (current.tag) params.set("tag", current.tag);
  if (current.search) params.set("search", current.search);
  if (current.time) params.set("time", current.time);
  if (current.sort) params.set("sort", current.sort);
  return params.toString();
}

/**
 * The archive's skin over the shared infinite-scroll engine.
 *
 * The engine owns the machine — sentinel observer, dedup, `pushState`. This file owns what the
 * visitor sees. And the ROUTE owns the SEO: the `<a href>` prev/next links stay in the markup,
 * because a crawler neither scrolls nor clicks, and `pageUrl` mirrors each loaded chunk onto its
 * crawlable twin. That contract is written in the engine's own header, and infinite scroll without
 * it is how a site loses everything past article twenty.
 */
export function MoreArticles({ current, startIndex, initialPage }: MoreArticlesProps) {
  const fetchPage = async (page: number): Promise<InfiniteListPage<ArchiveArticle>> => {
    const response = await fetch(`/articles/api/list?${toQuery(current, page)}`);
    if (!response.ok) throw new Error(`archive endpoint returned ${response.status}`);

    const result = (await response.json()) as { items: ArchiveArticle[]; hasMore: boolean };
    return {
      hasMore: result.hasMore,
      // JSON has no Date — the card formats it, so it must arrive as one.
      items: result.items.map((item) => ({ ...item, publishedAt: new Date(item.publishedAt) })),
    };
  };

  return (
    <InfiniteList<ArchiveArticle>
      initialPage={initialPage}
      startIndex={startIndex}
      fetchPage={fetchPage}
      getKey={(item) => item.id}
      pageUrl={(page) => buildArchiveHref({ ...current, page })}
      // The same one article card the whole site uses (Khalid, 21 Aug) — what the scroll
      // appends must be identical to what the server already drew above it.
      listClassName="space-y-3"
      renderItem={(item) => <PostCard post={item} />}
      renderLoading={(seen) => (
        <div className="flex items-center justify-center gap-2 border-t border-border py-4 text-muted-foreground">
          <IconLoading className="h-4 w-4 animate-spin" aria-hidden />
          <span className="text-xs">نجيب لك المزيد… (شفت {seen.toLocaleString("ar-SA")} مقالاً)</span>
        </div>
      )}
      renderError={(retry) => (
        <div className="border-t border-border py-4 text-center">
          <p className="text-xs text-muted-foreground">ما قدرنا نجيب الباقي.</p>
          <button
            type="button"
            onClick={retry}
            className="mt-1 text-xs font-medium text-link hover:underline"
          >
            جرّب مرّة ثانية
          </button>
        </div>
      )}
      renderEnd={(seen) => (
        <p className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          خلصت المقالات — {seen.toLocaleString("ar-SA")} مقالاً.
        </p>
      )}
    />
  );
}
