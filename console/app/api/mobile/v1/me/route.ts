import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const client = await db.client.findUnique({ where: { id: session.clientId }, select: { id: true, name: true, slug: true, email: true, notificationPreferences: true, subscriptionStatus: true, subscriptionTier: true, logoMedia: { select: { url: true, bunnyUrl: true, altText: true } } } });
  if (!client) return fail("UNAUTHORIZED", "الحساب لم يعد متاحًا.");
  return ok({ client });
}
