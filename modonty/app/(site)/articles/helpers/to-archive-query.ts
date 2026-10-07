import type { ArchiveState } from "@/lib/articles/archive/build-archive-href";

/** The query the endpoint needs, built from the same state the links are built from. */
export function toArchiveQuery(current: ArchiveState, page: number): string {
  const params = new URLSearchParams({ page: String(page) });
  if (current.modonty) params.set("modonty", "1");
  if (current.industry) params.set("industry", current.industry);
  if (current.category) params.set("category", current.category);
  if (current.tag) params.set("tag", current.tag);
  if (current.search) params.set("search", current.search);
  if (current.time) params.set("time", current.time);
  if (current.sort) params.set("sort", current.sort);
  return params.toString();
}
