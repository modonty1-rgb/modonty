/** How many reels one page of the feed carries. */
export const REELS_PAGE_SIZE = 6;

export interface ReelFeedItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** Still image for an image reel; for a video reel, its thumbnail (used as the blurred backdrop). */
  imageUrl: string | null;
  width: number | null;
  height: number | null;
  /** A video reel plays; an image reel is a still. Everything video-only below is null when false. */
  isVideo: boolean;
  /** Bunny Stream HLS playlist — the primary source, adaptive bitrate. */
  hlsUrl: string | null;
  /** Bunny Stream progressive MP4 — the fallback when HLS cannot load, and the file Google fetches. */
  mp4Url: string | null;
  /** Bunny Stream thumbnail — the video's poster, shown instantly before a frame decodes. */
  posterUrl: string | null;
  /** Whole seconds, ≤ 90 by the upload limit. */
  durationSec: number | null;
  likesCount: number;
  favoritesCount: number;
  /** APPROVED comments only — the console owns this counter and moves it on moderation. */
  commentsCount: number;
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
