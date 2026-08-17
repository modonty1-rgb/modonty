import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";

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

/**
 * Paginated public reels feed — PUBLISHED reels, newest first, cursor-based
 * (infinite scroll). Cached per page; per-user flags live in getUserReelFlags.
 */
export async function getReelsFeedPage(cursor?: string | null): Promise<ReelFeedPage> {
  "use cache";
  cacheTag("reels");
  cacheLife("minutes");
  // A reel is a media file with the switch on (2026-08-05). `mimeType` filters to images
  // instead of the old `type: "IMAGE"` column — the file already carries that fact.
  const reels = await db.media.findMany({
    where: {
      inReels: true,
      reelStatus: "PUBLISHED",
      mimeType: { startsWith: "image/" },
      client: { isNot: null },
    },
    select: {
      id: true,
      reelSlug: true,
      title: true,
      description: true,
      url: true,
      bunnyUrl: true, blurDataURL: true,
      width: true,
      height: true,
      likesCount: true,
      favoritesCount: true,
      client: {
        select: {
          name: true,
          slug: true,
          logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
        },
      },
    },
    orderBy: [{ reelPublishedAt: "desc" }, { id: "desc" }],
    take: REELS_PAGE_SIZE,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  // `title`/`description` are optional columns now — they were required on the old reel
  // row. The admin approval screen refuses an empty one, so a published reel always has
  // both; these fallbacks only keep the type honest.
  const items = reels.map((r) => ({
    id: r.id,
    slug: r.reelSlug ?? r.id,
    title: r.title ?? "",
    description: r.description ?? "",
    imageUrl: mediaSrc(r),
    width: r.width,
    height: r.height,
    likesCount: r.likesCount,
    favoritesCount: r.favoritesCount,
    clientName: r.client?.name ?? "",
    clientSlug: r.client?.slug ?? "",
    clientLogoUrl: mediaSrc(r.client?.logoMedia ?? null),
  }));
  return {
    items,
    nextCursor: items.length === REELS_PAGE_SIZE ? items[items.length - 1].id : null,
  };
}

/** Per-user like/favorite flags — session-specific, deliberately NOT cached. */
export async function getUserReelFlags(
  userId: string,
  reelIds: string[]
): Promise<{ liked: Set<string>; fav: Set<string> }> {
  // One table for both now, split by `kind` — two queries became one.
  const reactions = await db.mediaReaction.findMany({
    where: { userId, mediaId: { in: reelIds } },
    select: { mediaId: true, kind: true },
  });
  return {
    liked: new Set(reactions.filter((r) => r.kind === "LIKE").map((r) => r.mediaId)),
    fav: new Set(reactions.filter((r) => r.kind === "FAVORITE").map((r) => r.mediaId)),
  };
}
