import { trackReelView } from "@/app/(fullscreen)/reels/actions/track-reel-view";
import { readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";

/**
 * E17 — POST /api/mobile/v1/reels/:id/view · public + X-Device-Id (required).
 * `trackReelView` — the web's bare counter (+1 on a published reel) and the GA4 params the app
 * sends from its SDK. Like the web, the once-per-reel-per-session dedupe is the CALLER's (the
 * browser keeps it in sessionStorage; the app keeps it per device) — the server has no reel-view
 * table to dedupe against.
 */
export const POST = handle("reel-view", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  if (!readDeviceId(request)) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  const { ref: mediaId } = await params;
  const malformed = rejectMalformedIds([mediaId], MESSAGES.reelNotFound);
  if (malformed) return malformed;

  const ga4 = await trackReelView(mediaId);
  if (!ga4) return fail("NOT_FOUND", MESSAGES.reelNotFound);
  return ok({ counted: true, ga4 });
});
