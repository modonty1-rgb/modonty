import type { ArchiveState } from "@/lib/articles/archive/build-archive-href";

import { getTagName } from "../data/get-tag-name";
import type { getArticlesFilters } from "./get-articles-filters";

/** The filter in words — used in the heading and the title, so both say the same thing. */
export async function describeScope(
  state: ArchiveState,
  filters: Awaited<ReturnType<typeof getArticlesFilters>>
): Promise<string | null> {
  if (state.modonty) return "مدونتي";
  const category =
    state.category &&
    [...filters.categories, ...filters.categories.flatMap((c) => c.children)].find((c) => c.slug === state.category)?.name;
  if (category) return category;

  const industry = state.industry && filters.industries.find((i) => i.slug === state.industry)?.name;
  if (industry) return industry;

  // Tags are not offered in the rail any more, but `/tags/[slug]` still links here — so the name
  // is looked up rather than carried through the page.
  if (state.tag) return await getTagName(state.tag);

  if (state.search) return `«${state.search}»`;

  return null;
}
