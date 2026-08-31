import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

/**
 * وسم تنبيه واحد كمقروء.
 *
 * كانت نقطة التنبيهات **تقرأ `readAt` ولا تكتبه أبداً** — لا فعل واحد في عقد الجوّال كلّه
 * يضع فيه قيمة. فالشارة على تاب التنبيهات لا تصل صفراً مهما فتح العميل التنبيهات، والتنبيه
 * يظلّ «جديد» إلى الأبد. وشارةٌ لا تُطفأ تتوقّف عن أن تكون إشارة: يتعلّم العميل تجاهلها،
 * فتضيع معها التنبيهات الحقيقية التي وُجدت الشارة لأجلها.
 *
 * والوسم عند **فتح التنبيه** لا عند رؤية القائمة: مرورُ العين على قائمة ليس قراءةً، ووسمُ
 * الكلّ عند العرض يمحو قائمة العميل بما لم يفعله بعد.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ notificationId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { notificationId } = await params;

  /**
   * حرّاس الملكية **نسخةٌ حرفية من `GET`** في المجلّد الأعلى — ولا يجوز أن يفترقا.
   * وذراعا `isSet` ليستا زينة: على مونجو الحقل الغائب لا يساوي `null`، والنسخة أحادية
   * الذراع رجعت **صفراً من ٣** على `modonty_dev` (مقيسة، ومكتوبة في `GET` نفسه).
   */
  const existing = await db.notification.findFirst({
    where: {
      id: notificationId,
      clientId: session.clientId,
      AND: [
        { OR: [{ userId: null }, { userId: { isSet: false } }] },
        { OR: [{ staffId: null }, { staffId: { isSet: false } }] },
      ],
    },
    select: { id: true, readAt: true },
  });
  if (existing === null) return fail("NOT_FOUND", "ما لقينا هذا التنبيه.");

  // الوسم مرّة واحدة: إعادة الفتح لا تُزحزح وقت أول قراءة.
  if (existing.readAt === null) {
    await db.notification.update({ where: { id: existing.id }, data: { readAt: new Date() } });
  }

  const unreadCount = await db.notification.count({
    where: {
      clientId: session.clientId,
      readAt: null,
      AND: [
        { OR: [{ userId: null }, { userId: { isSet: false } }] },
        { OR: [{ staffId: null }, { staffId: { isSet: false } }] },
      ],
    },
  });

  return ok({ notificationId: existing.id, unreadCount });
}
