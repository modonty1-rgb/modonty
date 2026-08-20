import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";

import { db } from "@/lib/db";

import { REELS_PAGE_SIZE, type ReelFeedPage } from "./reels-feed-shapes";

/**
 * Paginated public reels feed — PUBLISHED reels, newest first, cursor-based
 * (infinite scroll). Cached per page; per-user flags live in getUserReelFlags.
 *
 * Lives here, not in the reels route: the homepage reads it too, and a route may never
 * import from a sibling route.
 */
export async function getReelsFeedPage(cursor?: string | null): Promise<ReelFeedPage> {
  "use cache";
  cacheTag("reels");
  cacheLife("minutes");
  // Both kinds of reel now (2026-08-20): a video (bunnyVideoId set, plays) and a still image
  // share one feed. The old `mimeType: "image/"` filter hid every video reel the console
  // uploaded and the admin approved — they sat PUBLISHED and invisible. `client: isNot null`
  // stays: a reel with no partner has no attribution to show.
  const reels = await db.media.findMany({
    where: {
      inReels: true,
      reelStatus: "PUBLISHED",
      client: { isNot: null },
    },
    select: {
      id: true,
      reelSlug: true,
      title: true,
      description: true,
      url: true,
      bunnyUrl: true, blurDataURL: true,
      mimeType: true,
      bunnyVideoId: true,
      playbackUrl: true,
      mp4Url: true,
      thumbnailUrl: true,
      durationSec: true,
      width: true,
      height: true,
      likesCount: true,
      favoritesCount: true,
      commentsCount: true,
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
  const items = reels.map((r) => {
    // A video reel is one Bunny actually encoded — `bunnyVideoId` present. The console never
    // sets it on an image, so it is the honest discriminator, not the mime type.
    const isVideo = Boolean(r.bunnyVideoId);
    return {
      id: r.id,
      slug: r.reelSlug ?? r.id,
      title: r.title ?? "",
      description: r.description ?? "",
      // For a video, the thumbnail is the still that carries the blurred backdrop and the poster;
      // for an image, the image itself.
      imageUrl: isVideo ? (r.thumbnailUrl ?? mediaSrc(r)) : mediaSrc(r),
      width: r.width,
      height: r.height,
      isVideo,
      hlsUrl: isVideo ? r.playbackUrl : null,
      mp4Url: isVideo ? r.mp4Url : null,
      posterUrl: isVideo ? (r.thumbnailUrl ?? null) : null,
      durationSec: isVideo ? r.durationSec : null,
      likesCount: r.likesCount,
      favoritesCount: r.favoritesCount,
      commentsCount: r.commentsCount,
      clientName: r.client?.name ?? "",
      clientSlug: r.client?.slug ?? "",
      clientLogoUrl: mediaSrc(r.client?.logoMedia ?? null),
    };
  });
  return {
    items,
    nextCursor: items.length === REELS_PAGE_SIZE ? items[items.length - 1].id : null,
  };
}
