import { z } from "zod";

import { recordArticleLinkClick } from "@/lib/analytics/record-article-link-click";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { deviceSessionId, readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";

const bodySchema = z.object({
  articleId: z.string().regex(/^[0-9a-f]{24}$/i),
  linkUrl: z.string().min(1).max(2048),
  linkText: z.string().max(500).optional(),
  isExternal: z.boolean().optional(),
});

/**
 * T2 — POST /api/mobile/v1/track/link-click · public + X-Device-Id (required) · Bearer optional.
 * `recordArticleLinkClick` — the web route's logic (published article only, ArticleLinkClick row,
 * partner Telegram), keyed on the device instead of the cookie.
 */
export const POST = handle("track-link-click", async (request: Request) => {
  const deviceId = readDeviceId(request);
  if (!deviceId) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const result = await recordArticleLinkClick({
    body: body.value,
    resolveSessionId: async () => deviceSessionId(deviceId),
    resolveUserId: async () => (await readerFromRequest(request))?.id,
    headers: request.headers,
  });
  if (result === "not_found") return fail("NOT_FOUND", MESSAGES.articleNotFound);
  if (result === "invalid") return fail("VALIDATION_ERROR", MESSAGES.invalidBody);
  return ok({ ok: true });
});
