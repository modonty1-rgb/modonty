import { getReelClientFilterOptions } from "@/lib/queries/get-reels-feed-page";
import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";

/** C15 — GET /api/mobile/v1/reels/filters · public. The partners with a public reel (`getReelClientFilterOptions`). */
export const GET = handle("reels-filters", async (_request: Request) => {
  return ok({ items: await getReelClientFilterOptions() }, PUBLIC_CACHE);
});
