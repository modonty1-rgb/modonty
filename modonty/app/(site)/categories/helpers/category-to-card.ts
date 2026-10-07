import type { CategoryResponse } from "@/lib/types";
import type { EntityCardProps } from "@/components/listing/EntityCard";

export const categoryToCard = (cat: CategoryResponse): EntityCardProps => ({
  type: "category",
  name: cat.name,
  slug: cat.slug,
  imageUrl: cat.socialImage,
  imageAlt: cat.socialImageAlt,
  articleCount: cat.articleCount,
  recentArticleCount: cat.recentArticleCount,
  clientPreviews: cat.clientPreviews ?? [],
  clientCount: cat.clientCount ?? 0,
  digitalImpact: cat.digitalImpact,
});
