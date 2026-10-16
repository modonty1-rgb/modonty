"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientUnreadWhere, countClientUnread } from "@/lib/mobile-api/client-inbox";

/** «تعليم الكل كمقروء» — نفس نطاق العدّاد (`clientUnreadWhere`)، كما في نقطة الجوّال `read-all`. */
export async function markAllNotificationsRead(): Promise<{ unreadCount: number }> {
  const session = await auth();
  const clientId = (session as { clientId?: string } | null)?.clientId;
  if (!clientId) return { unreadCount: 0 };
  // دخول فريقنا بحساب العميل لا يوسم شيئاً — التنبيه للعميل لا لنا.
  if ((session as { impersonated?: boolean }).impersonated) return { unreadCount: await countClientUnread(clientId) };
  await db.notification.updateMany({ where: clientUnreadWhere(clientId), data: { readAt: new Date() } });
  return { unreadCount: 0 };
}
