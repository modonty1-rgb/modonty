import type { ArchiveSort } from "../data/get-articles-archive";

export interface ArchiveState {
  industry?: string;
  category?: string;
  tag?: string;
  sort?: ArchiveSort;
  page?: number;
}

/**
 * One place that writes `/articles?…`, so every link in the page agrees on the shape.
 *
 * Query string, never a path segment: the proxy matches `/articles/:slug`, so `/articles/page/2`
 * would collide with a real article slug — and `next.config.ts:17` records what happened the last
 * time a rule matched `/articles` (Arabic slugs corrupted by the URL normalizer, then read by
 * Google as a soft 404).
 *
 * Empty and default values are dropped, so the same view always has exactly one URL.
 */
export function buildArchiveHref(state: ArchiveState): string {
  const params = new URLSearchParams();
  if (state.industry) params.set("industry", state.industry);
  if (state.category) params.set("category", state.category);
  if (state.tag) params.set("tag", state.tag);
  if (state.sort && state.sort !== "newest") params.set("sort", state.sort);
  if (state.page && state.page > 1) params.set("page", String(state.page));
  const qs = params.toString();
  return qs ? `/articles?${qs}` : "/articles";
}

/** Same link, with one key changed — and the page reset, because page 3 of a new filter is empty. */
export function withArchiveChange(current: ArchiveState, change: Partial<ArchiveState>): string {
  return buildArchiveHref({ ...current, ...change, page: change.page ?? 1 });
}
