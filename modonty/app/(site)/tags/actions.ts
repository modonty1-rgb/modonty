"use server";

import type { TagQueryOptions } from "./helpers/tag-types";
import { getTagsPage } from "./helpers/get-tags-page";
import { tagToCard } from "./helpers/tag-to-card";
import type { EntityCardProps } from "@/components/listing/EntityCard";

/**
 * `options` is bound via loadMoreTags.bind(null, { search, sortBy }) in the
 * Server Component so the Client Component only has to pass `page` —
 * see Next.js docs: app/02-guides/forms.md ("Passing additional arguments").
 */
export async function loadMoreTags(
  options: TagQueryOptions,
  page: number
): Promise<{ items: EntityCardProps[]; hasMore: boolean }> {
  try {
    const { items, hasMore } = await getTagsPage(page, options);

    const cards: EntityCardProps[] = items.map(tagToCard);

    return { items: cards, hasMore };
  } catch (error) {
    console.error("[loadMoreTags] Error:", error);
    return { items: [], hasMore: false };
  }
}
