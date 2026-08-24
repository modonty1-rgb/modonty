"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";

import { IconVolume2, IconVolumeX, IconChevronUp, IconChevronDown } from "@/lib/icons";
import { loadMoreReels } from "../actions/load-more";
import { trackReelView } from "../actions/track-reel-view";
import { markReelViewed } from "../helpers/mark-reel-viewed";
import type { ReelFeedItemWithState } from "@/lib/queries/reels-feed-shapes";
import { ReelActionsRail } from "./reel-actions-rail";
import { ReelVideo } from "./reel-video";

interface ReelsFeedClientProps {
  initialItems: ReelFeedItemWithState[];
  initialCursor: string | null;
  isLoggedIn: boolean;
}

/** Mount a live <video> only for the reel on screen and its immediate neighbours. */
const WINDOW = 1;

export function ReelsFeedClient({ initialItems, initialCursor, isLoggedIn }: ReelsFeedClientProps) {
  const [items, setItems] = useState(initialItems);
  const [active, setActive] = useState(0);
  // Feeds must start muted or the browser refuses to autoplay; one tap turns sound on for all.
  const [muted, setMuted] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const stateRef = useRef({ cursor: initialCursor, loading: false });

  // The active reel = the one most in view. A single observer watches every section; whichever
  // crosses 60% and is the most visible becomes active — it plays, the rest pause.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const ratios = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.index);
          ratios.set(i, e.intersectionRatio);
        }
        let best = -1;
        let bestRatio = 0.6; // must clear the threshold to take over
        for (const [i, r] of ratios) {
          if (r >= bestRatio) {
            bestRatio = r;
            best = i;
          }
        }
        if (best !== -1) setActive(best);
      },
      { root, threshold: [0, 0.6, 0.9] }
    );
    sectionsRef.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  // A view = the reel HELD the screen for two seconds — a flick past it counts nothing.
  // Once per reel per browser session (markReelViewed dedupes in sessionStorage).
  useEffect(() => {
    const reel = items[active];
    if (!reel) return;
    const timer = setTimeout(() => {
      if (markReelViewed(reel.id)) void trackReelView(reel.id);
    }, 2000);
    return () => clearTimeout(timer);
  }, [active, items]);

  // Infinite scroll — prefetch two screens before the end so the reader never hits a wall.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        const s = stateRef.current;
        if (!entries[0].isIntersecting || s.loading || !s.cursor) return;
        s.loading = true;
        loadMoreReels(s.cursor)
          .then((res) => {
            setItems((prev) => [...prev, ...res.items]);
            s.cursor = res.nextCursor;
          })
          .finally(() => {
            s.loading = false;
          });
      },
      { root: scrollRef.current, rootMargin: "200% 0px" }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  const hasVideo = items.some((r) => r.isVideo);

  // A mouse cannot swipe. TikTok answers that with two chevrons on the desktop feed, and
  // without them the only way past a reel here is the scroll wheel — which fights the snap.
  // `scrollIntoView` on the target section, so the snap does the landing, not a pixel maths.
  const goTo = (index: number) => {
    const el = sectionsRef.current[index];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      ref={scrollRef}
      // `h-dvh`, matching the sections below — NOT `h-full`. The scroller was `h-full` (the large
      // layout viewport) while each reel was `h-dvh` (the dynamic one that shrinks when the phone's
      // address bar shows). The snap points then sat at a different rhythm than the container's
      // height, so on a real phone every swipe fought the snap — the "can't scroll" Khalid hit.
      // `overscroll-contain` stops a swipe past the last reel from scrolling the page behind it.
      className="h-dvh snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
    >
      {/* Prev / next for a mouse — `lg` and up, NOT `md`. Measured at 768px: the free lane
          beside the card is one 44px column wide, so this pair landed exactly on the action
          rail and «التعليقات» and «حفظ» stopped answering a click (elementFromPoint returned
          the chevrons). A tablet at that width swipes anyway, so the pair costs it nothing.
          Disabled at the ends rather than hidden, so it never jumps position mid-feed. */}
      <div className="fixed end-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label="الطلّة السابقة"
          className="grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <IconChevronUp className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          disabled={active >= items.length - 1}
          aria-label="الطلّة التالية"
          className="grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <IconChevronDown className="size-5" />
        </button>
      </div>

      {/* One mute control for the whole feed — only when there is a video to mute. */}
      {hasVideo && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}
          className="pointer-events-auto fixed end-4 top-16 z-30 grid size-11 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 motion-safe:active:scale-95 active:bg-black/70"
        >
          {muted ? <IconVolumeX className="size-5" /> : <IconVolume2 className="size-5" />}
        </button>
      )}

      {items.map((reel, i) => {
        const inWindow = Math.abs(i - active) <= WINDOW;
        return (
          <section
            key={reel.id}
            data-index={i}
            ref={(el) => {
              sectionsRef.current[i] = el;
            }}
            // `content-visibility:auto` used to sit here for memory, but it estimates each
            // section's size and that estimate desynced the snap on touch — a known scroll-snap
            // conflict. The video pool already caps what is in memory (3 players max), and a still
            // image is cheap, so it earned nothing here and broke the one thing that matters.
            // From `md` up the reel is a centred card with room beside it — the desktop
            // pattern TikTok uses (Khalid handed the reference 24 Aug): navigation stays on
            // the start rail, and the card never spans the whole screen. `ps` clears that
            // fixed rail; in RTL the start side is the RIGHT one, so the action buttons keep
            // the end (left) side they already had on the phone.
            className="flex h-dvh snap-start items-center justify-center p-3 md:gap-4 md:ps-24 lg:gap-6 lg:ps-60"
          >
            {/* `overflow-visible` from `md` up so the action rail can sit OUTSIDE the card;
                the media keeps its own clipping wrapper below, so corners stay round. */}
            <article className="relative aspect-[9/16] h-full max-h-[94dvh] overflow-hidden rounded-2xl bg-black shadow-2xl md:overflow-visible">
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {/* The still layer is always present: the blurred backdrop plus the contained frame.
                  For a video reel this frame is its poster, so the video fades in over an identical
                  image and there is never a black gap. */}
              {reel.imageUrl && (
                <>
                  <OptimizedImage
                    media={asMedia(reel.imageUrl)}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(max-width: 768px) 100vw, 420px"
                    className="scale-125 object-cover opacity-50 blur-2xl"
                    {...(i === 0 ? { preload: true } : {})}
                  />
                  <OptimizedImage
                    media={asMedia(reel.imageUrl, reel.title)}
                    alt={reel.isVideo ? "" : reel.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 420px"
                    className="object-contain"
                    {...(i === 0 ? { preload: true } : {})}
                  />
                </>
              )}

              {/* The video is overlaid only while near the screen; scrolling away unmounts it,
                  which is the pool eviction that keeps memory flat over a long feed. */}
              {reel.isVideo && inWindow && (
                <ReelVideo
                  hlsUrl={reel.hlsUrl}
                  mp4Url={reel.mp4Url}
                  posterUrl={reel.posterUrl}
                  title={reel.title}
                  active={i === active}
                  muted={muted}
                />
              )}

              {/* The caption stays INSIDE the clipping wrapper: its gradient runs to the card's
                  bottom edge, and outside it the square corners would poke past the radius
                  once `md` turns clipping off. `pe-16` only reserves room for the rail while
                  the rail is still overlaid — from `md` up it moved out, so the text is free. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pe-16 pt-20 md:pe-4">
                <Link
                  href={`/clients/${reel.clientSlug}`}
                  // `min-h-11`: the chip measured 142×36 (23 Aug) over moving footage — the
                  // one place a thumb needs the full 44. The pill keeps its look; only the
                  // tap box grew, and it answers on touch-down.
                  className="pointer-events-auto mb-2 flex min-h-11 w-fit items-center gap-2 rounded-full bg-white/10 py-1 pe-4 ps-1 backdrop-blur transition hover:bg-white/20 active:bg-white/20 motion-safe:active:scale-95"
                >
                  <span className="relative block size-7 overflow-hidden rounded-full bg-white">
                    {reel.clientLogoUrl && (
                      <OptimizedImage media={asMedia(reel.clientLogoUrl)} alt="" fill sizes="28px" className="object-contain" />
                    )}
                  </span>
                  <span className="text-sm font-bold text-white">{reel.clientName}</span>
                </Link>
                <h2 className="text-lg font-extrabold text-white">{reel.title}</h2>
                {reel.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-300">{reel.description}</p>
                )}
                </div>
              </div>

              {/* Outside the clipping wrapper — overlaid on the card on phones (unchanged),
                  and standing beside it from `md` up, the way TikTok puts its counts next to
                  the clip instead of over it. */}
              <ReelActionsRail
                reelId={reel.id}
                slug={reel.slug}
                title={reel.title}
                likesCount={reel.likesCount}
                favoritesCount={reel.favoritesCount}
                commentsCount={reel.commentsCount}
                likedByMe={reel.likedByMe}
                favoritedByMe={reel.favoritedByMe}
                isLoggedIn={isLoggedIn}
              />
            </article>
          </section>
        );
      })}
      <div ref={sentinelRef} aria-hidden className="h-px" />
    </div>
  );
}
