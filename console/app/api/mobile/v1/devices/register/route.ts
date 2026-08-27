import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";

const input = z.object({ expoPushToken: z.string().regex(/^(Expo|Exponent)PushToken\[[^\]]+\]$/, "Expo push token غير صالح."), platform: z.enum(["android", "ios"]), deviceName: z.string().trim().max(120).optional(), appVersion: z.string().trim().max(40).optional() });

export async function POST(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const parsed = await readBody(request, input);
  if ("response" in parsed) return parsed.response;
  const device = await db.mobileDevice.upsert({
    where: { expoPushToken: parsed.value.expoPushToken },
    create: { clientId: session.clientId, ...parsed.value, enabled: true, lastSeenAt: new Date(), disabledAt: null, disabledReason: null },
    update: { clientId: session.clientId, ...parsed.value, enabled: true, lastSeenAt: new Date(), disabledAt: null, disabledReason: null },
    select: { id: true, platform: true, enabled: true, updatedAt: true },
  });
  return ok({ device });
}
