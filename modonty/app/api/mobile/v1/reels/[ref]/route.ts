import { getReelBySlug } from "@/app/(fullscreen)/reels/[slug]/data/get-reel-by-slug";
import { getReelNeighbors } from "@/app/(fullscreen)/reels/[slug]/data/get-reel-neighbors";
import { fail, handle, MESSAGES, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";

/**
 * C16 — GET /api/mobile/v1/reels/:slug · public.
 * The watch page's reads: `getReelBySlug` (slug, or the id a slug-less reel hands out) and
 * `getReelNeighbors` (the newer/older reel in feed order).
 */
export const GET = handle("reel", async (_request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.reelNotFound);

  const reel = await getReelBySlug(slug);
  if (!reel) return fail("NOT_FOUND", MESSAGES.reelNotFound);

  const neighbors = await getReelNeighbors(reel.id);
  return ok({ reel, neighbors }, PUBLIC_CACHE);
});
