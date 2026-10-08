import { handle } from "@/lib/mobile-api/http";
import { toggleReelReactionRoute } from "@/lib/mobile-api/toggle-reel-reaction-route";

/** E16 — POST /api/mobile/v1/reels/:id/like (toggle) · Bearer. */
export const POST = handle("reel-like", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  return toggleReelReactionRoute(request, (await params).ref, "LIKE");
});
