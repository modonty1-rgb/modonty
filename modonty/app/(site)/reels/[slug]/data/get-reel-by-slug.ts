import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";

import { db } from "@/lib/db";

export interface ReelWatch {
  id: string;
  slug: string;
  title: string;
  description: string;
  isVideo: boolean;
  imageUrl: string | null;
  hlsUrl: string | null;
  mp4Url: string | null;
  posterUrl: string | null;
  durationSec: number | null;
  publishedAt: Date | null;
  likesCount: number;
  favoritesCount: number;
  viewsCount: number;
  clientName: string;
  clientSlug: string;
  clientLogoUrl: string | null;
}

/**
 * One published reel by its slug — the standalone, indexable watch page.
 *
 * The immersive `/reels` feed is an app surface and stays out of the index; THIS page is the one
 * Google sees, one URL per clip, carrying the VideoObject. The slug and the fetchable `mp4Url`
 * were put in place upstream for exactly this: the schema comment on `reelSlug` reads "standalone
 * watch page", and `mp4Url` exists "because Google requires a fetchable file".
 */
export async function getReelBySlug(slug: string): Promise<ReelWatch | null> {
  "use cache";
  cacheTag("reels");
  cacheLife("minutes");

  const r = await db.media.findFirst({
    where: { reelSlug: slug, inReels: true, reelStatus: "PUBLISHED", client: { isNot: null } },
    select: {
      id: true,
      reelSlug: true,
      title: true,
      description: true,
      url: true,
      bunnyUrl: true,
      blurDataURL: true,
      bunnyVideoId: true,
      playbackUrl: true,
      mp4Url: true,
      thumbnailUrl: true,
      durationSec: true,
      reelPublishedAt: true,
      likesCount: true,
      favoritesCount: true,
      viewsCount: true,
      client: {
        select: {
          name: true,
          slug: true,
          logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
        },
      },
    },
  });
  if (!r) return null;

  const isVideo = Boolean(r.bunnyVideoId);
  return {
    id: r.id,
    slug: r.reelSlug ?? r.id,
    title: r.title ?? "",
    description: r.description ?? "",
    isVideo,
    imageUrl: isVideo ? (r.thumbnailUrl ?? mediaSrc(r)) : mediaSrc(r),
    hlsUrl: isVideo ? r.playbackUrl : null,
    mp4Url: isVideo ? r.mp4Url : null,
    posterUrl: isVideo ? (r.thumbnailUrl ?? null) : null,
    durationSec: isVideo ? r.durationSec : null,
    publishedAt: r.reelPublishedAt,
    likesCount: r.likesCount,
    favoritesCount: r.favoritesCount,
    viewsCount: r.viewsCount,
    clientName: r.client?.name ?? "",
    clientSlug: r.client?.slug ?? "",
    clientLogoUrl: mediaSrc(r.client?.logoMedia ?? null),
  };
}
