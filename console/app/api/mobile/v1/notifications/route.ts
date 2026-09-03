import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { arabicNumber, arabicRelativeTime } from "@/lib/mobile-api/arabic-format";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

/**
 * S12 «التنبيهات» — the client's own inbox, read from `Notification` (`notifications`).
 *
 * NOT `ClientNotification` (`client_notifications`): that one is the operations manager's
 * Telegram note to the CONTENT TEAM about a client, and it must never surface to the client.
 *
 * `userId: null` matters. A row may carry both a `userId` (the reader it is for) and a
 * `clientId` (the article's owner) — `faq_reply` in `console/lib/faq/publish-faq-answer.ts`
 * does exactly that. Filtering on `clientId` alone would show the client a notification
 * addressed to one of their readers.
 */

/** Which screen the tap opens. Derived here so the app maps no Arabic or DB strings. */
function targetOf(type: string): "article" | "audience" | "videos" | null {
  if (type.startsWith("article")) return "article";
  if (type.startsWith("faq") || type.startsWith("comment") || type.startsWith("contact") || type.includes("question")) return "audience";
  if (type.startsWith("reel") || type.startsWith("video") || type.startsWith("media")) return "videos";
  return null;
}

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const now = new Date();
  // مشتركٌ بين القائمة والعدّاد: نسخُ الشرط في موضعين يجعل عدّاداً يقيس مجموعةً غير
  // التي تُعرض بعد أوّل تعديل على أحدهما.
  const scopeWhere = {
    clientId: session.clientId,
    AND: [
      { OR: [{ userId: null }, { userId: { isSet: false } }] },
      { OR: [{ staffId: null }, { staffId: { isSet: false } }] },
    ],
  };
  const rows = await db.notification.findMany({
    // `userId: null` alone matches nothing: in MongoDB a row created without the field has no
    // such KEY, and an absent key equals neither `null` nor any value. Each recipient field
    // therefore needs both arms — measured on modonty_dev, the one-arm version returned 0 of 3.
    where: scopeWhere,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, type: true, title: true, body: true, relatedId: true, readAt: true, createdAt: true },
  });
  // يُعدّ في القاعدة لا من `rows`: تلك آخر مئة إشعار، فصاحب 140 غير مقروء كان يرى «100»
  // — والشارة التي لا تتجاوز مئةً أبداً تُقرأ كسقفٍ للاهتمام لا كعدد.
  // `readAt` غائبٌ في الصفوف القديمة لا `null`، فالطرفان لازمان — كما في شرط النطاق أعلاه.
  const unreadCount = await db.notification.count({
    where: { ...scopeWhere, OR: [{ readAt: null }, { readAt: { isSet: false } }] },
  });

  const notifications = rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    relatedId: row.relatedId,
    target: targetOf(row.type),
    isUnread: row.readAt === null,
    stateLabel: row.readAt === null ? "جديد" : "تمت رؤيته",
    timeLabel: arabicRelativeTime(row.createdAt, now),
  }));

  return ok({
    notifications,
    unreadCount,
    review: {
      title: "التنبيهات",
      unreadBadgeLabel: unreadCount === 0 ? null : `${arabicNumber(unreadCount)} جديد`,
      priorityNote: "الأولوية للأشياء التي تحتاج إجراءً منك",
      openPrefix: "افتح",
      retryLabel: "إعادة المحاولة",
      emptyTitle: "ما في تنبيهات جديدة",
      emptyDescription: "نعلمك هنا بأي شيء يحتاج قرارك أو متابعتك.",
      errorTitle: "ما قدرنا نحمّل التنبيهات",
      offlineTitle: "ما في اتصال",
      offlineDescription: "تأكد من الإنترنت وجرّب مرة ثانية.",
    },
  });
}
