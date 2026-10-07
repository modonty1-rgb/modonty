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
