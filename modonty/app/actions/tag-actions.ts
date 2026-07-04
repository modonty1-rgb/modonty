"use server";

import { getTagsPage, type TagQueryOptions } from "@/app/api/helpers/tag-queries";
import type { EntityCardProps } from "@/components/shared/EntityCard";

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

    const cards: EntityCardProps[] = items.map((tag) => ({
      type: "tag",
      name: tag.name,
      slug: tag.slug,
      imageUrl: tag.socialImage,
      imageAlt: tag.socialImageAlt,
      articleCount: tag.articleCount,
      recentArticleCount: tag.recentArticleCount,
      clientPreviews: tag.clientPreviews,
      clientCount: tag.clientCount,
      digitalImpact: tag.digitalImpact,
    }));

    return { items: cards, hasMore };
  } catch (error) {
    console.error("[loadMoreTags] Error:", error);
    return { items: [], hasMore: false };
  }
}
