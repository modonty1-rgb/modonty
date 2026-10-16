"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientInboxWhere, countClientUnread } from "@/lib/mobile-api/client-inbox";

/**
 * وسم تنبيه واحد كمقروء عند فتحه — نفس منطق نقطة الجوّال (`notifications/[id]/read`):
 * الملكية من `clientInboxWhere`، والوسم مرّة واحدة لا يُزحزح وقت أوّل قراءة.
 * دخول فريقنا بحساب العميل لا يوسم شيئاً — التنبيه للعميل لا لنا.
 */
export async function markNotificationRead(id: string): Promise<{ unreadCount: number }> {
  const session = await auth();
  const clientId = (session as { clientId?: string } | null)?.clientId;
  if (!clientId || !/^[0-9a-f]{24}$/i.test(id)) return { unreadCount: 0 };
  if ((session as { impersonated?: boolean }).impersonated) return { unreadCount: await countClientUnread(clientId) };

  const row = await db.notification.findFirst({ where: { id, ...clientInboxWhere(clientId) }, select: { id: true, readAt: true } });
  if (row && !row.readAt) await db.notification.update({ where: { id: row.id }, data: { readAt: new Date() } });
  return { unreadCount: await countClientUnread(clientId) };
}
