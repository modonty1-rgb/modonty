import { z } from "zod";

import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { ACTION_MESSAGES } from "@/lib/mobile-api/messages-actions";
import { readBody } from "@/lib/mobile-api/request";
import { enableTopicAlertAs } from "@/lib/users/enable-topic-alert-as";

const bodySchema = z.object({ topic: z.string().trim().min(1).max(50) });

/**
 * V3 — POST /api/mobile/v1/topic-alerts · Bearer · `{ topic }` (an id from `ALERT_TOPICS`:
 * football · ai · entrepreneurship · education · entertainment · health …).
 * `enableTopicAlertAs` — the sector page's «نبّهني»: consent on the email channel, dated; a topic
 * already on keeps the reader's channels. → `{ topic, enabled: true, alreadyEnabled }`
 */
export const POST = handle("topic-alert", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const result = await enableTopicAlertAs(reader.id, body.value.topic);
  if (result === "invalid") return fail("VALIDATION_ERROR", ACTION_MESSAGES.topicUnknown);
  if (result === "no_user") return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  return ok({ topic: body.value.topic, enabled: true, alreadyEnabled: result === "already" });
});
