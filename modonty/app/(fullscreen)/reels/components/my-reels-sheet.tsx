"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ModontyReelsMark } from "@/components/icons/modonty-reels-mark";

import { fetchMyReels } from "../actions/fetch-my-reels";
import type { MyReelTile } from "../data/get-my-reels";

type Kind = "LIKE" | "FAVORITE";

const TABS: Array<{ k: Kind; label: string; empty: string }> = [
  { k: "LIKE", label: "أعجبني", empty: "ما أعجبك شيء بعد. اضغط القلب على أي طلّة وتلقاها هنا." },
  { k: "FAVORITE", label: "محفوظة", empty: "ما حفظت شيئاً بعد. اضغط علامة الحفظ وتلقاها هنا." },
];

interface MyReelsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * «طلّاتي» — the reader's own reels, over the feed rather than away from it.
 *
 * A sheet, not a route: the feed keeps its scroll position and its mounted video, so coming
 * back costs nothing. It answers the question the heart and the bookmark had been raising with
 * no way to answer it — until 24 Aug 2026 nothing in modonty listed a saved reel back.
 *
 * Each tab loads once, on first view, and is kept after.
 */
export function MyReelsSheet({ open, onOpenChange }: MyReelsSheetProps) {
  const [kind, setKind] = useState<Kind>("LIKE");
  const [cache, setCache] = useState<Partial<Record<Kind, MyReelTile[]>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || cache[kind]) return;
    let alive = true;
    setLoading(true);
    fetchMyReels(kind)
      .then((res) => {
        if (alive) setCache((c) => ({ ...c, [kind]: res.items }));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, kind, cache]);

  const items = cache[kind];
  const tab = TABS.find((t) => t.k === kind)!;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex h-[70dvh] flex-col rounded-t-2xl border-neutral-800 bg-neutral-950 p-0 text-white"
        dir="rtl"
      >
        <SheetHeader className="border-b border-neutral-800 px-4 py-3">
          <SheetTitle className="text-center text-sm font-bold text-white">طلّاتي</SheetTitle>
          <SheetDescription className="sr-only">الطلّات التي أعجبتك أو حفظتها</SheetDescription>
          {/* Two tabs, 44 tall each — the sheet is reached by thumb and so are these. */}
          <div role="tablist" className="mt-2 flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.k}
                role="tab"
                type="button"
                aria-selected={kind === t.k}
                onClick={() => setKind(t.k)}
                className={`min-h-11 flex-1 rounded-full text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  kind === t.k ? "bg-white text-neutral-950" : "bg-white/10 text-white/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain p-3">
          {loading && !items ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-[9/16] rounded-lg bg-neutral-800" />
              ))}
            </div>
          ) : items && items.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {items.map((r) => (
                <Link
                  key={r.id}
                  // No slug means no watch page for this row — the feed is the honest landing.
                  href={r.slug ? `/reels/${encodeURIComponent(r.slug)}` : "/reels"}
                  onClick={() => onOpenChange(false)}
                  className="group relative block aspect-[9/16] overflow-hidden rounded-lg bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {r.imageUrl ? (
                    <OptimizedImage
                      media={asMedia(r.imageUrl, r.title)}
                      alt={r.title || "طلّة"}
                      fill
                      sizes="(min-width: 768px) 160px, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="grid size-full place-items-center">
                      <ModontyReelsMark className="size-7 text-white/30" aria-hidden />
                    </span>
                  )}
                  {/* The partner's name, not the title: on a 33vw tile the title clamps to
                      nothing useful, while the name is what the reader recognises. */}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-[10px] font-bold leading-tight text-white line-clamp-2">
                    {r.clientName}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-6 pt-10 text-center text-sm leading-relaxed text-neutral-400">
              {tab.empty}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
