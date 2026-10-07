import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { clientUnreadWhere, countClientUnread } from "../../helpers/client-inbox";

/**
 * «تعليم الكل كمقروء» — خالد ٥ أكتوبر ٢٠٢٦: صندوق فيه تنبيهات نشاط (مشاركة · متابعة) لا
 * شاشة لها، فكانت الشارة لا تنطفئ إلا بفتح كل صفّ على حدة.
 *
 * النطاق من `clientUnreadWhere` نفسها التي يعدّ بها `GET` والشارة، فلا يُوسم صفّ لا يُعدّ ولا
 * يبقى صفّ معدود. و`readAt` بذراعين (`null` · `isSet: false`): `notifyClientEvent` قديماً
 * كان يكتب الصفّ بلا الحقل، والغائب على مونجو لا يطابق `null` — النسخة أحادية الذراع كانت
 * ستترك تلك الصفوف «جديد» وتُرجع عدّاً غير صفر بعد «تعليم الكل».
 */
export async function POST(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");

  const result = await db.notification.updateMany({
    where: clientUnreadWhere(session.clientId),
    data: { readAt: new Date() },
  });

  const unreadCount = await countClientUnread(session.clientId);

  return ok({ markedCount: result.count, unreadCount });
}
