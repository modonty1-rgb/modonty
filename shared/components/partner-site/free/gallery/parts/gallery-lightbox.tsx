"use client";

import { useCallback, useEffect, useRef } from "react";

import { OptimizedImage, asMedia } from "../../../../optimized-image";
import { IconClose, IconChevronLeft, IconChevronRight } from "../../../../../lib/icons";
import type { HomeData } from "../../home/home-data";

type Tile = HomeData["gallery"][number];

interface Props {
  images: Tile[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}

/**
 * Fullscreen photo viewer for the partner album. Loaded ONLY on first thumbnail click
 * (dynamic import, ssr:false) so its JS never touches the initial visitor bundle.
 * Close: X · backdrop · Esc. Navigate: arrows · ← → keys · mobile swipe (h=move, ↓=close).
 * Moved here from modonty's partner route (4 Oct 2026), where it was built and never wired.
 */
export function GalleryLightbox({ images, index, onIndexChange, onClose }: Props) {
  const count = images.length;
  const image = images[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // RTL: "next" reveals the image to the LEFT — match the page's reading flow.
  const next = useCallback(() => onIndexChange((index + 1) % count), [index, count, onIndexChange]);
  const prev = useCallback(() => onIndexChange((index - 1 + count) % count), [index, count, onIndexChange]);

  // Keyboard + body-scroll lock + initial focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") next();
      else if (e.key === "ArrowRight") prev();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [next, prev, onClose]);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
      if (count > 1) (dx < 0 ? next : prev)(); // swipe LEFT → next (RTL)
    } else if (dy > 80 && Math.abs(dx) < 60) {
      onClose(); // swipe down to dismiss
    }
  }

  if (!image) return null;

  // No portal: `shared` carries no react-dom types, and a `fixed inset-0` layer needs none — no
  // ancestor of the album sets a transform that would trap it (4 Oct 2026).
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || "عرض الصورة"}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
    >
      {count > 1 && (
        // `dir="ltr"` sat on this span and flipped its own `start-4` to the left — under the
        // close button. Only the numbers need LTR, so it moved to the <bdi>.
        <span className="absolute top-4 start-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tabular-nums text-white/90 backdrop-blur-sm">
          <bdi dir="ltr">{index + 1} / {count}</bdi>
        </span>
      )}

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="إغلاق"
        className="absolute top-3.5 end-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white outline-none ring-white/60 backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:ring-2"
      >
        <IconClose className="h-5 w-5" />
      </button>

      {count > 1 && (
        <>
          {/* RTL: previous sits on the start (right) side. Both chevrons are the one arrow mark,
              drawn pointing left — so this one is turned to point right. */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="الصورة السابقة"
            className="absolute start-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:grid lg:start-6"
          >
            <IconChevronRight className="h-6 w-6 rotate-180" />
          </button>
          {/* RTL: next sits on the end (left) side, pointing left ◁ */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="الصورة التالية"
            className="absolute end-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:grid lg:end-6"
          >
            <IconChevronLeft className="h-6 w-6" />
          </button>
        </>
      )}

      {/* object-contain shows the FULL photo, no crop */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative h-[88vh] w-[94vw] sm:w-[88vw]"
      >
        <OptimizedImage media={asMedia(image.url, image.alt)} alt={image.alt} fill preload sizes="94vw" className="object-contain" />
      </div>

      {image.alt && (
        <p
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 bottom-0 mx-auto max-w-[90vw] truncate px-4 pb-4 text-center text-sm text-white/90"
        >
          {image.alt}
        </p>
      )}
    </div>
  );
}
