"use client";

import { useEffect, useRef, useState } from "react";

import { IconPlay, IconPause } from "@/lib/icons";
import { useReelVideo } from "../helpers/use-reel-video";

interface ReelVideoProps {
  hlsUrl: string | null;
  mp4Url: string | null;
  posterUrl: string | null;
  title: string;
  active: boolean;
  muted: boolean;
}

/**
 * One reel's video surface, with the two touches a feed is expected to have: tap to pause, and a
 * thin progress line.
 *
 * `poster` is the Bunny thumbnail, so the first paint is the still frame with zero black flash.
 * `muted` + `playsInline` are not optional — browsers refuse to autoplay sound, and without
 * `playsInline` iOS throws the clip into its own fullscreen player. `loop` because a ≤90s clip
 * replays until the reader scrolls on.
 *
 * Tap toggles play/pause and flashes the matching icon, the gesture every short-video app trains
 * into people. The progress bar reads `timeupdate` — no timer of our own.
 */
export function ReelVideo({ hlsUrl, mp4Url, posterUrl, title, active, muted }: ReelVideoProps) {
  const videoRef = useReelVideo({ hlsUrl, mp4Url, active, muted });
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState<"play" | "pause" | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (video.duration > 0) setProgress((video.currentTime / video.duration) * 100);
    };
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, [videoRef]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => {});
      showFlash("play");
    } else {
      video.pause();
      showFlash("pause");
    }
  };

  const showFlash = (kind: "play" | "pause") => {
    setFlash(kind);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 500);
  };

  return (
    <>
      <video
        ref={videoRef}
        poster={posterUrl ?? undefined}
        muted={muted}
        playsInline
        loop
        preload="auto"
        aria-label={title}
        onClick={toggle}
        className="absolute inset-0 h-full w-full cursor-pointer object-cover"
      />

      {/* The icon flashes on the tap that caused it, then fades — feedback that the tap landed. */}
      {flash && (
        <span className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <span className="grid size-16 animate-in fade-in zoom-in-75 place-items-center rounded-full bg-black/45 text-white backdrop-blur">
            {flash === "play" ? <IconPlay className="size-7" /> : <IconPause className="size-7" />}
          </span>
        </span>
      )}

      {/* Progress: a hairline at the very bottom, under the attribution gradient. */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[3px] bg-white/20" aria-hidden>
        <span
          className="block h-full bg-white/90 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </span>
    </>
  );
}
