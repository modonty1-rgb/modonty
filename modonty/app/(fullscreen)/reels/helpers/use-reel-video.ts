"use client";

import { useEffect, useRef } from "react";

interface Options {
  hlsUrl: string | null;
  mp4Url: string | null;
  /** True when this reel is the one on screen — it plays; otherwise it stays paused at 0. */
  active: boolean;
  muted: boolean;
}

/**
 * Drive one reel's `<video>` through the three-rung fallback ladder, once.
 *
 * 1. Safari / iOS play HLS natively — `canPlayType('application/vnd.apple.mpegurl')` — so no
 *    library is loaded there at all.
 * 2. Everywhere else, hls.js binds the HLS playlist to the element. It is imported dynamically,
 *    so its ~400KB ships only to a browser that actually opens the reels route, and never to a
 *    crawler or a reader who never scrolls a video.
 * 3. If hls.js is unsupported, or the stream fatally fails, the element falls back to Bunny's
 *    progressive MP4 — the same file Google fetches for the VideoObject.
 *
 * Source attachment happens ONCE per mount. Play/pause is a separate concern driven by `active`,
 * so scrolling between reels never re-creates the player — that is what a recycled pool needs.
 * The feed only mounts this for the reel on screen and its immediate neighbours, so unmounting
 * IS the pool eviction: the hls instance is destroyed and its buffer freed.
 *
 * hls.js config is tuned for a short vertical clip on a phone (Bunny Stream docs + hls.js API):
 * cap the level to the element's size (never fetch 1080p for a 420px column), keep a small buffer
 * (the clip is ≤90s), and turn off low-latency mode (this is VOD, not live).
 */
export function useReelVideo({ hlsUrl, mp4Url, active, muted }: Options) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach the source once (and re-attach only if the URL itself changes).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let destroyed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hls: any = null;

    const useMp4 = () => {
      if (mp4Url && video.src !== mp4Url) video.src = mp4Url;
    };

    if (!hlsUrl) {
      useMp4();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari: native HLS, no library.
      video.src = hlsUrl;
    } else {
      import("hls.js")
        .then(({ default: Hls }) => {
          if (destroyed) return;
          if (!Hls.isSupported()) {
            useMp4();
            return;
          }
          hls = new Hls({
            capLevelToPlayerSize: true,
            maxBufferLength: 10,
            maxMaxBufferLength: 20,
            backBufferLength: 6,
            lowLatencyMode: false,
            enableWorker: true,
          });
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_e: unknown, data: { fatal: boolean }) => {
            // A fatal stream error drops to the MP4 rather than showing a dead frame.
            if (data.fatal) {
              hls?.destroy();
              hls = null;
              useMp4();
            }
          });
        })
        .catch(useMp4);
    }

    return () => {
      destroyed = true;
      if (hls) hls.destroy();
    };
  }, [hlsUrl, mp4Url]);

  // Play only while active. Leaving a reel resets it to the first frame, so returning to it
  // starts from the top the way every short-video feed behaves.
  //
  // A reader who asked the system for reduced motion does not get autoplaying video pushed at
  // them — the poster stays, and a tap on the element starts it. Autoplaying anyway would be the
  // exact vestibular trigger the setting exists to prevent.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (active && !reduce) {
      void video.play().catch(() => {
        /* autoplay can be refused until a gesture; the poster stays up, no crash */
      });
    } else if (!active) {
      video.pause();
      video.currentTime = 0;
    }
  }, [active]);

  // Mute is global to the feed; reflect it without touching the source.
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = muted;
  }, [muted]);

  return videoRef;
}
