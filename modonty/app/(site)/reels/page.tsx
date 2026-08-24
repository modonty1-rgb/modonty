import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { ModontyLogoutMark } from "@/components/icons/modonty-logout-mark";

import { ReelsFeedClient } from "./components/reels-feed-client";
import { getReelsFeedPage } from "@/lib/queries/get-reels-feed-page";
import { getUserReelFlags } from "@/lib/queries/get-user-reel-flags";

// Immersive feed: fixed full-viewport layer above the site chrome (header/footer).
//
// ⚠️ FLIP `index` TO TRUE BEFORE MERGING `modonty-ui` INTO `main` — one line, board card 83c.
//
// It is noindex on purpose, not by oversight: an indexed feed with no published reels is an
// empty page in Google's eyes, and a thin page indexed early is harder to rank later than one
// indexed the day it has content. Khalid, 24 Aug 2026: keep it closed through the UI phase and
// open it LAST, right before the final merge — by then PRODDATA has real reels behind it.
export const metadata: Metadata = {
  title: "الريلز — مُدَوَّنَتِي",
  robots: { index: false, follow: false },
};

export default async function ReelsPage() {
  const { items, nextCursor } = await getReelsFeedPage();

  // Per-user state stays OUTSIDE the cached feed query.
  const session = await auth();
  const userId = session?.user?.id ?? null;
  let liked = new Set<string>();
  let fav = new Set<string>();
  if (userId && items.length > 0) {
    ({ liked, fav } = await getUserReelFlags(userId, items.map((r) => r.id)));
  }
  const withState = items.map((r) => ({
    ...r,
    likedByMe: liked.has(r.id),
    favoritedByMe: fav.has(r.id),
  }));

  if (withState.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-neutral-950 text-white">
        <p className="text-2xl font-bold">لا توجد ريلز بعد</p>
        <p className="text-sm text-neutral-400">أول ريلز الشركاء في الطريق</p>
        <Link href="/" className="mt-4 rounded-full bg-white/10 px-6 py-2 text-sm hover:bg-white/20">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950">
      {/* Floating header above the feed */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
        <h1 className="rounded-full bg-black/40 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
          الريلز
        </h1>
        {/* The way OUT of a full-screen layer has to be unmissable (Khalid, 23 Aug: «exit
            button need more enhancement to be clear»): 44px tall, a solid dark pill with a
            visible edge instead of a 40%-black wash that vanished over bright footage, the
            brand logout mark instead of a bare «✕» text glyph, and bold text. */}
        <Link
          href="/"
          aria-label="الخروج من الريلز"
          className="pointer-events-auto flex min-h-11 items-center gap-2 rounded-full bg-black/70 px-4 text-sm font-bold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-black/90 hover:ring-white/40 motion-safe:active:scale-95 active:bg-black/90"
        >
          <ModontyLogoutMark className="size-5" aria-hidden />
          خروج
        </Link>
      </header>

      <ReelsFeedClient initialItems={withState} initialCursor={nextCursor} isLoggedIn={!!userId} />
    </div>
  );
}
