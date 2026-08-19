"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";

import { loadMoreReels } from "../actions/load-more";
import type { ReelFeedItemWithState } from "@/lib/queries/reels-feed-shapes";
import { ReelActionsRail } from "./reel-actions-rail";

interface ReelsFeedClientProps {
  initialItems: ReelFeedItemWithState[];
  initialCursor: string | null;
  isLoggedIn: boolean;
}

export function ReelsFeedClient({ initialItems, initialCursor, isLoggedIn }: ReelsFeedClientProps) {
  const [items, setItems] = useState(initialItems);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Cursor + in-flight flag live in a ref so the observer callback never goes stale.
  const stateRef = useRef({ cursor: initialCursor, loading: false });

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
      // Prefetch two screens before the end so the user never hits a wall.
      { root: scrollRef.current, rootMargin: "200% 0px" }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={scrollRef} className="h-full snap-y snap-mandatory overflow-y-auto">
      {items.map((reel, i) => (
        <section
          key={reel.id}
          className="flex h-dvh snap-start items-center justify-center p-3"
          // Browser skips layout/paint for far-offscreen reels (native memory relief).
          style={{ contentVisibility: "auto", containIntrinsicSize: "auto 100dvh" }}
        >
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
                  {...(i === 0 ? { preload: true } : {})}
                />
                <OptimizedImage
                  media={asMedia(reel.imageUrl, reel.title)}
                  alt={reel.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-contain"
                  {...(i === 0 ? { preload: true } : {})}
                />
              </>
            )}

            <ReelActionsRail
              reelId={reel.id}
              title={reel.title}
              likesCount={reel.likesCount}
              favoritesCount={reel.favoritesCount}
              likedByMe={reel.likedByMe}
              favoritedByMe={reel.favoritedByMe}
              isLoggedIn={isLoggedIn}
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pe-16 pt-20">
              <Link
                href={`/clients/${reel.clientSlug}`}
                className="mb-2 flex w-fit items-center gap-2 rounded-full bg-white/10 py-1 pe-4 ps-1 backdrop-blur transition hover:bg-white/20"
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
          </article>
        </section>
      ))}
      {/* Infinite-scroll sentinel — no snap class so it never captures a snap stop. */}
      <div ref={sentinelRef} aria-hidden className="h-px" />
    </div>
  );
}
