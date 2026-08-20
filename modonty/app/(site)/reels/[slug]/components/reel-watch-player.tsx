"use client";

import { useEffect, useState } from "react";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";

import { IconVolume2, IconVolumeX } from "@/lib/icons";
import { ReelVideo } from "../../components/reel-video";
import { trackReelView } from "../../actions/track-reel-view";
import { markReelViewed } from "../../helpers/mark-reel-viewed";
import type { ReelWatch } from "../data/get-reel-by-slug";

/**
 * The single reel on its own page — always the active one, since it is the only thing here.
 *
 * Same still-first layer as the feed (blurred backdrop + poster) with the video overlaid, so the
 * first paint is the thumbnail and the clip fades in over it. Its own mute state: a watch page
 * opened from a search result should behave on its own, independent of the feed.
 */
export function ReelWatchPlayer({ reel }: { reel: ReelWatch }) {
  const [muted, setMuted] = useState(true);

  // Same view rule as the feed: two seconds on screen, once per browser session.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (markReelViewed(reel.id)) void trackReelView(reel.id);
    }, 2000);
    return () => clearTimeout(timer);
  }, [reel.id]);

  return (
    <article className="relative aspect-[9/16] h-full max-h-[94dvh] overflow-hidden rounded-2xl bg-black shadow-2xl">
      {reel.imageUrl && (
        <>
          <OptimizedImage
            media={asMedia(reel.imageUrl)}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            className="scale-125 object-cover opacity-50 blur-2xl"
            preload
          />
          <OptimizedImage
            media={asMedia(reel.imageUrl, reel.title)}
            alt={reel.isVideo ? "" : reel.title}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            className="object-contain"
            preload
          />
        </>
      )}

      {reel.isVideo && (
        <ReelVideo
          hlsUrl={reel.hlsUrl}
          mp4Url={reel.mp4Url}
          posterUrl={reel.posterUrl}
          title={reel.title}
          active
          muted={muted}
        />
      )}

      {reel.isVideo && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}
          className="absolute end-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
        >
          {muted ? <IconVolumeX className="size-5" /> : <IconVolume2 className="size-5" />}
        </button>
      )}
    </article>
  );
}
