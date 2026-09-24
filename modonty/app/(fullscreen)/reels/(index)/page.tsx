import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getContentPageRow } from "@/lib/seo/get-content-page-row";
import { IconHome } from "@/lib/icons";

import { ReelsFeedClient } from "../components/reels-feed-client";
import { ReelsNavRail } from "../components/reels-nav-rail";
import { getReelsFeedPage } from "@/lib/queries/get-reels-feed-page";
import { getReelClientFilterOptions } from "@/lib/queries/get-reels-feed-page";
import { getUserReelFlags } from "@/lib/queries/get-user-reel-flags";
import { messages } from "@/lib/i18n/messages";
import { ReelsClientFilter, ReelsClientFilterDesktop } from "../components/reels-client-filter";

// Immersive feed: fixed full-viewport layer above the site chrome (header/footer).
//
// SEO — including whether this page is indexed — lives in its admin row
// (`/modonty/pages/reels`), like every other content page.
//
// It shipped `noindex` while the feed was empty. It is indexable now that it has published
// reels, and the old default had become a contradiction: `app/sitemap.ts` lists `/reels`, so
// the site was telling Google "crawl this" and "do not index this" about the same URL. The
// `nofollow` half was worse — it told the crawler not to follow the links into the watch
// pages, which are the reels' only indexable surface.
//
// No brand in the fallback title: the root layout's template already appends "| مدونتي"
// (layout.tsx:35), and the old fallback carried "مُدَوَّنَتِي" itself — the tag rendered
// "الريلز — مُدَوَّنَتِي | مدونتي", the brand twice, in two different spellings.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getContentPageRow("reels"), {
    path: "/reels",
    fallbackTitle: "الريلز",
    fallbackDescription: messages.seo.reels.description,
  });
}

export default async function ReelsPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const params = await searchParams;
  const selectedSlug = params.client?.trim() || null;
  const [reelClients, firstPage] = await Promise.all([
    getReelClientFilterOptions(),
    getReelsFeedPage(null, selectedSlug),
  ]);
  // A stale or hand-typed filter must never turn the directory into a dead end.
  const selectedClient = reelClients.find((client) => client.slug === selectedSlug) ?? null;
  const activeSlug = selectedClient?.slug ?? null;
  const { items, nextCursor } = selectedClient || !selectedSlug ? firstPage : await getReelsFeedPage();

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
        <p className="text-sm text-neutral-400">{selectedClient ? `لا توجد ريلز منشورة لـ ${selectedClient.name}` : "أول ريلز الشركاء في الطريق"}</p>
        <Link href="/" className="mt-4 rounded-full bg-white/10 px-6 py-2 text-sm hover:bg-white/20">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950">
      {/* Desktop navigation, `md` and up. Mounted HERE and not inside `ReelsFeedClient`:
          it is a plain server component, and importing it into the client file would drag
          `nav-config` — and the whole `messages` object it reads — into the client bundle. */}
      <ReelsNavRail />

      {/* Floating header above the feed. `md:ps-*` keeps its title clear of the nav rail. */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 md:ps-24 lg:ps-60">
        <div className="hidden min-w-0 items-center gap-2 md:flex">
          <h1 className="shrink-0 rounded-full bg-black/40 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">الريلز</h1>
          <ReelsClientFilterDesktop clients={reelClients} selectedClient={selectedClient} />
        </div>
        <div className="md:hidden"><ReelsClientFilter clients={reelClients} selectedClient={selectedClient} /></div>
        <Link
          href="/"
          aria-label="الصفحة الرئيسية"
          className="pointer-events-auto grid size-11 place-items-center rounded-full bg-black/70 text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-black/90 hover:ring-white/40 motion-safe:active:scale-95 active:bg-black/90"
        >
          <IconHome className="size-5" aria-hidden />
        </Link>
      </header>

      <ReelsFeedClient
        key={activeSlug ?? "all"}
        initialItems={withState}
        initialCursor={nextCursor}
        clientSlug={activeSlug}
        isLoggedIn={!!userId}
        userImage={session?.user?.image ?? null}
        userName={session?.user?.name ?? "حسابي"}
      />

    </div>
  );
}
