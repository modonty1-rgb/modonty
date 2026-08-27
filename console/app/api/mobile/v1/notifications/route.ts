import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const notifications = await db.notification.findMany({ where: { clientId: session.clientId }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, type: true, title: true, body: true, relatedId: true, readAt: true, createdAt: true } });
  return ok({ notifications, unreadCount: notifications.filter((item) => !item.readAt).length });
}
