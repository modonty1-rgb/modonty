import { SharePlatform } from "@prisma/client";
import { z } from "zod";

import { recordArticleShare } from "@/lib/analytics/record-article-share";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { deviceSessionId, readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";

const bodySchema = z.object({ platform: z.nativeEnum(SharePlatform) });

/**
 * E8 — POST /api/mobile/v1/articles/:slug/share · public + X-Device-Id (required) · Bearer optional.
 * `recordArticleShare` — the web share route's logic and limit (10 per article per hour), keyed on
 * the device instead of the cookie.
 */
export const POST = handle("article-share", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const deviceId = readDeviceId(request);
  if (!deviceId) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.articleNotFound);

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const result = await recordArticleShare({
    slug,
    platform: body.value.platform,
    sessionId: deviceSessionId(deviceId),
    resolveUserId: async () => (await readerFromRequest(request))?.id,
    headers: request.headers,
  });

  if (result === "not_found") return fail("NOT_FOUND", MESSAGES.articleNotFound);
  if (result === "rate_limited") return fail("RATE_LIMITED", MESSAGES.tooManyAttempts);
  return ok({ ok: true });
});
