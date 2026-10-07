import type { InfiniteListPage } from "@modonty/shared/components/infinite-list";
import type { ArchiveState } from "@/lib/articles/archive/build-archive-href";
import type { ArchiveArticle } from "@/lib/articles/archive/get-articles-archive";

import { toArchiveQuery } from "./to-archive-query";

/** One scrolled chunk of the archive, under the visitor's current filters. */
export async function fetchArchivePage(current: ArchiveState, page: number): Promise<InfiniteListPage<ArchiveArticle>> {
  const response = await fetch(`/articles/api/list?${toArchiveQuery(current, page)}`);
  if (!response.ok) throw new Error(`archive endpoint returned ${response.status}`);

  const result = (await response.json()) as { items: ArchiveArticle[]; hasMore: boolean };
  return {
    hasMore: result.hasMore,
    // JSON has no Date — the card formats it, so it must arrive as one.
    items: result.items.map((item) => ({ ...item, publishedAt: new Date(item.publishedAt) })),
  };
}
