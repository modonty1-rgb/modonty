import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/lib/auth";

import { ReelsFeedClient } from "./components/reels-feed-client";
import { getReelsFeedPage, getUserReelFlags } from "./helpers/reels-feed";

// Immersive feed: fixed full-viewport layer above the site chrome (header/footer).
// Kept out of the index until the reels launch.
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
        <Link
          href="/"
          aria-label="الخروج من الريلز"
          className="pointer-events-auto rounded-full bg-black/40 px-4 py-1.5 text-sm text-white backdrop-blur transition hover:bg-black/60"
        >
          ✕ خروج
        </Link>
      </header>

      <ReelsFeedClient initialItems={withState} initialCursor={nextCursor} isLoggedIn={!!userId} />
    </div>
  );
}
