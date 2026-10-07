import type { TagListItem } from "./tag-types";
import type { EntityCardProps } from "@/components/listing/EntityCard";

export const tagToCard = (tag: TagListItem): EntityCardProps => ({
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
});
