import { z } from "zod";

import { recordArticleView } from "@/lib/analytics/record-article-view";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { deviceSessionId, readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";

const bodySchema = z
  .object({
    referrer: z.string().max(2000).nullish(),
    url: z.string().max(2000).nullish(),
  })
  .default({});

/**
 * E6 — POST /api/mobile/v1/articles/:slug/view · public + X-Device-Id (required) · Bearer optional.
 * `recordArticleView` — the web view route's counting rule, keyed on the device instead of the
 * `modonty_view_sid` cookie. Returns the GA4 params the app sends from its own SDK.
 */
export const POST = handle("article-view", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const deviceId = readDeviceId(request);
  if (!deviceId) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.articleNotFound);

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const result = await recordArticleView({
    slug,
    referrer: body.value.referrer?.trim() || null,
    pageUrl: body.value.url?.trim() || null,
    headers: request.headers,
    resolveSessionId: async () => deviceSessionId(deviceId),
    resolveUserId: async () => (await readerFromRequest(request))?.id,
  });

  if (!result.found) return fail("NOT_FOUND", MESSAGES.articleNotFound);
  return ok({
    counted: result.analyticsId !== null,
    analyticsId: result.analyticsId,
    ga4: result.ga4 ?? null,
    clarity: result.clarity,
  });
});
