/** How many reels one page of the feed carries. */
export const REELS_PAGE_SIZE = 6;

export interface ReelFeedItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  width: number | null;
  height: number | null;
  likesCount: number;
  favoritesCount: number;
  clientName: string;
  clientSlug: string;
  clientLogoUrl: string | null;
}

export interface ReelFeedItemWithState extends ReelFeedItem {
  likedByMe: boolean;
  favoritedByMe: boolean;
}

export interface ReelFeedPage {
  items: ReelFeedItem[];
  nextCursor: string | null;
}
