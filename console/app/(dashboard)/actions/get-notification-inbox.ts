"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientInboxWhere, countClientUnread } from "@/lib/mobile-api/client-inbox";
import { arabicRelativeTime } from "@/lib/mobile-api/arabic-format";
import { notificationHref } from "@/lib/notifications/notification-href";

export type InboxItem = { id: string; title: string; body: string; href: string | null; unread: boolean; timeLabel: string };

/**
 * صندوق التنبيهات لجرس الكونسول على الويب (خالد ١٦ أكتوبر ٢٠٢٦: «ضيف ضيف») — نفس صفوف
 * صندوق تطبيق الجوّال ونفس شرطه (`clientInboxWhere`)، فلا يرى العميل على جهازٍ ما لا يراه على الآخر.
 */
export async function getNotificationInbox(): Promise<{ items: InboxItem[]; unreadCount: number }> {
  const session = await auth();
  const clientId = (session as { clientId?: string } | null)?.clientId;
  if (!clientId) return { items: [], unreadCount: 0 };

  const now = new Date();
  const [rows, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: clientInboxWhere(clientId),
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, type: true, title: true, body: true, relatedId: true, readAt: true, createdAt: true },
    }),
    countClientUnread(clientId),
  ]);

  return {
    unreadCount,
    items: rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      href: notificationHref(r.type, r.relatedId),
      unread: !r.readAt,
      timeLabel: arabicRelativeTime(r.createdAt, now),
    })),
  };
}
