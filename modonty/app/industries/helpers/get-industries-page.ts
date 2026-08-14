
/** حجم صفحة قائمة الصناعات — يُقرأ هنا وحده. */
const INDUSTRIES_PAGE_SIZE = 20;
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { SubscriptionStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type { IndustryListItem, IndustryQueryOptions } from "@/lib/types";
import { getIndustriesEnhanced } from "./get-industries-enhanced";

export async function getIndustriesPage(
  page: number,
  options: IndustryQueryOptions = {}
): Promise<{ items: IndustryListItem[]; hasMore: boolean; total: number }> {
  const all = await getIndustriesEnhanced(options);
  const start = (page - 1) * INDUSTRIES_PAGE_SIZE;
  const items = all.slice(start, start + INDUSTRIES_PAGE_SIZE);
  return { items, hasMore: start + INDUSTRIES_PAGE_SIZE < all.length, total: all.length };
}
