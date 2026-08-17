import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus, SubscriptionStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";

export interface TagListItem {
  id: string;
  name: string;
  slug: string;
  socialImage?: string;
  socialImageAlt?: string;
  articleCount: number;
  recentArticleCount: number;
  clientPreviews: { id: string; name: string; logoUrl?: string }[];
  clientCount: number;
  /** Sum of the GA4 digital-impact total of every ACTIVE client tagged with this tag — not views of our own /tags/[slug] page. */
  digitalImpact: number;
}

export interface TagQueryOptions {
  search?: string;
  sortBy?: "name" | "articles" | "trending";
}

export const PAGE_SIZE = 20;
