import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * صندوق تنبيهات العميل — مصدر واحد للقائمة والعدّاد والشارة.
 *
 * كان الشرط منسوخاً في ثلاث نقاط (الرئيسية · القائمة · وسم المقروء)، وافترقت النسخ:
 * الرئيسية والوسم يعدّان `readAt: null` وحدها، والقائمة تعدّ `null` **أو** الغائب. وعلى مونجو
 * الحقل الغائب لا يساوي `null`، و`notifyClient` يكتب الصفّ بلا `readAt` أصلاً — فقالت الرئيسية
 * «١» والقائمة «٢ جديد» على نفس الصندوق (مقيس حيّاً في QA ٤ أكتوبر).
 *
 * و`userId`/`staffId` بذراعين لنفس السبب: صفّ يحمل `clientId` مع `userId` هو تنبيه لقارئ
 * عند هذا العميل (`faq_reply`)، لا للعميل نفسه.
 */
export function clientInboxWhere(clientId: string): Prisma.NotificationWhereInput {
  return {
    clientId,
    AND: [
      { OR: [{ userId: null }, { userId: { isSet: false } }] },
      { OR: [{ staffId: null }, { staffId: { isSet: false } }] },
    ],
  };
}

/** غير المقروء = `readAt` فارغ **أو غائب**. */
export function clientUnreadWhere(clientId: string): Prisma.NotificationWhereInput {
  return {
    clientId,
    AND: [
      { OR: [{ userId: null }, { userId: { isSet: false } }] },
      { OR: [{ staffId: null }, { staffId: { isSet: false } }] },
      { OR: [{ readAt: null }, { readAt: { isSet: false } }] },
    ],
  };
}

export function countClientUnread(clientId: string): Promise<number> {
  return db.notification.count({ where: clientUnreadWhere(clientId) });
}
