"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

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
 * One reel's video surface. A touch exposes a lightweight play/pause control and a seekable
 * timeline, so a viewer can stop on a specific moment without restarting the clip.
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
  const [paused, setPaused] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (video.duration > 0) setProgress((video.currentTime / video.duration) * 100);
    };
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
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
    revealControls();
  };

  const revealControls = () => {
    setControlsVisible(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setControlsVisible(false);
    }, 1800);
  };

  const seek = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video?.duration) return;
    const next = Number(event.target.value);
    video.currentTime = (next / 100) * video.duration;
    setProgress(next);
    revealControls();
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

      {(controlsVisible || paused) && (
        <>
          {/* Only the circle takes taps. A full-frame button here sat above the action rail and
              the partner chip, so a paused reel could not be liked or its partner opened
              (measured at 390px: `elementFromPoint` on «إعجاب» returned this button). */}
          <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
            <button
              type="button"
              onClick={toggle}
              aria-label={paused ? "تشغيل الفيديو" : "إيقاف الفيديو"}
              className="pointer-events-auto grid size-14 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {paused ? <IconPlay className="size-7" aria-hidden /> : <IconPause className="size-7" aria-hidden />}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={seek}
            onPointerDown={revealControls}
            aria-label="التقدم في الفيديو"
            className="absolute inset-x-4 bottom-3 z-30 h-8 cursor-pointer accent-white"
          />
        </>
      )}

      {/* Progress remains visible between interactions without adding controls to the frame. */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[3px] bg-white/20" aria-hidden>
        <span
          className="block h-full bg-white/90 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </span>
    </>
  );
}
