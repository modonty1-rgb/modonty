import { z } from "zod";

import { readerFromRequest } from "@/lib/mobile-api/auth";
import { readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";
import { trackReelShareAs } from "@/lib/reels/track-reel-share-as";

/** «native» = the OS share sheet opened · «clipboard» = the link was copied instead. */
const bodySchema = z.object({ platform: z.enum(["native", "clipboard"]) });

/**
 * E18 — POST /api/mobile/v1/reels/:id/share · public + X-Device-Id (required) · Bearer optional.
 * `trackReelShareAs` — the web's reel share: no row is written (the web writes none either), only
 * the GA4 `reel_share` event. The device id is required like every other tracking endpoint.
 */
export const POST = handle("reel-share", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const deviceId = readDeviceId(request);
  if (!deviceId) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  const { ref: mediaId } = await params;
  const malformed = rejectMalformedIds([mediaId], MESSAGES.reelNotFound);
  if (malformed) return malformed;

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const reader = await readerFromRequest(request);
  const result = await trackReelShareAs(reader?.id, mediaId, body.value.platform);
  if (result === "not_found") return fail("NOT_FOUND", MESSAGES.reelNotFound);
  return ok({ ok: result === "tracked" });
});
