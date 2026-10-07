"use client";

import { InfiniteList } from "@modonty/shared/components/infinite-list";
import { IconLoading } from "@/lib/icons";

import { PostCard } from "@/components/feed/postcard/PostCard";
import { buildArchiveHref, type ArchiveState } from "@/lib/articles/archive/build-archive-href";
import { fetchArchivePage } from "../../helpers/fetch-archive-page";

import type { ArchiveArticle } from "@/lib/articles/archive/get-articles-archive";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

interface MoreArticlesProps {
  /** Everything the visitor filtered by — every scrolled chunk must obey the same filters. */
  current: ArchiveState;
  /** How many rows the server already rendered above this list. */
  startIndex: number;
  initialPage: number;
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
  return (
    <InfiniteList<ArchiveArticle>
      initialPage={initialPage}
      startIndex={startIndex}
      fetchPage={(page) => fetchArchivePage(current, page)}
      getKey={(item) => item.id}
      pageUrl={(page) => buildArchiveHref({ ...current, page })}
      // The same one article card the whole site uses (Khalid, 21 Aug) — what the scroll
      // appends must be identical to what the server already drew above it.
      listClassName="space-y-3"
      renderItem={(item) => <PostCard post={item} />}
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
            className="mt-1 text-xs font-medium text-link hover:underline"
          >
            جرّب مرّة ثانية
          </button>
        </div>
      )}
      renderEnd={(seen) => (
        <p className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          خلصت المقالات — {seen.toLocaleString(SITE_LOCALE)} مقالاً.
        </p>
      )}
    />
  );
}
