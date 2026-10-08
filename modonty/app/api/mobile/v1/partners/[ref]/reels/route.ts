import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { loadPartnerHome } from "@/lib/mobile-api/load-partner-home";

const REEL_PATH = "/reels/";

/**
 * C13 — GET /api/mobile/v1/partners/:slug/reels · public.
 * What `/clients/[slug]/reels` renders: the «reels» block of `getCachedHomeData` — his published
 * reels with a slug, newest first, up to 60. `slug` is read off the reel's watch link; it opens
 * with `GET /reels/:slug`. (A swipeable feed of the same reels: `GET /reels?client=<slug>`.)
 */
export const GET = handle("partner-reels", async (_request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const loaded = await loadPartnerHome((await params).ref);
  if ("response" in loaded) return loaded.response;
  const items = loaded.value.home.reels.map((r) => ({
    title: r.title,
    slug: r.href.startsWith(REEL_PATH) ? decodeURIComponent(r.href.slice(REEL_PATH.length)) : r.href,
    imageUrl: r.imageUrl,
  }));
  return ok({ items }, PUBLIC_CACHE);
});
