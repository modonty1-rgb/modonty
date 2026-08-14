import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus, SubscriptionStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";
import { TagListItem, TagQueryOptions, PAGE_SIZE } from "./tag-types";
import { getTagsEnhanced } from "./get-tags-enhanced";

export async function getTagsPage(
  page: number,
  options: TagQueryOptions = {}
): Promise<{ items: TagListItem[]; hasMore: boolean; total: number }> {
  const all = await getTagsEnhanced(options);
  const start = (page - 1) * PAGE_SIZE;
  const items = all.slice(start, start + PAGE_SIZE);
  return { items, hasMore: start + PAGE_SIZE < all.length, total: all.length };
}
