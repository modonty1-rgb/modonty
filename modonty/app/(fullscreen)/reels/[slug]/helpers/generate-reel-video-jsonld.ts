import { SITE_URL } from "@/constants";

import type { ReelWatch } from "../data/get-reel-by-slug";

/** Seconds → ISO 8601 duration, the only form Google reads: 59 → `PT59S`, 95 → `PT1M35S`. */
function isoDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `PT${m > 0 ? `${m}M` : ""}${s}S`;
}

/**
 * The reel's `VideoObject` — the whole reason the clip is indexable.
 *
 * `contentUrl` is Bunny's progressive MP4, not the HLS playlist: Google fetches this file to
 * verify the video, and it must be a plain file with no token auth — which is exactly why the
 * console stores `mp4Url` alongside the stream. `thumbnailUrl`, `name` and `description` are all
 * required; the admin approval screen refuses to publish a reel missing a title or description,
 * so they are always present here.
 *
 * An image reel gets an `ImageObject` instead — a still is not a VideoObject, and emitting one
 * for it would be a false claim to the crawler. It used to get nothing at all, which left an
 * indexable page describing itself to Google with no structured data whatsoever.
 */
export function generateReelVideoJsonld(reel: ReelWatch): Record<string, unknown> | null {
  const url = `${SITE_URL}/reels/${encodeURIComponent(reel.slug)}`;

  if (!reel.isVideo) {
    if (!reel.imageUrl) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      name: reel.title,
      description: reel.description,
      contentUrl: reel.imageUrl,
      url,
      ...(reel.publishedAt && { uploadDate: reel.publishedAt.toISOString() }),
      ...(reel.clientName && {
        creator: { "@type": "Organization", name: reel.clientName },
      }),
    };
  }

  if (!reel.mp4Url || !reel.posterUrl) return null;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: reel.title,
    description: reel.description,
    thumbnailUrl: [reel.posterUrl],
    contentUrl: reel.mp4Url,
    embedUrl: url,
    url,
    ...(reel.publishedAt && { uploadDate: reel.publishedAt.toISOString() }),
    ...(reel.durationSec && { duration: isoDuration(reel.durationSec) }),
    ...(reel.clientName && {
      creator: { "@type": "Organization", name: reel.clientName },
    }),
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/WatchAction",
        userInteractionCount: reel.viewsCount,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: reel.likesCount,
      },
    ],
  };
}
