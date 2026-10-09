import type { Prisma } from "@prisma/client";

/**
 * «منشورٌ غير مؤرشف» بالصيغة الوحيدة التي يجيبها مونغو صحيحاً.
 *
 * `{ archivedAt: null }` وحده لا يطابق الصفّ الذي لم يُكتب فيه الحقل أصلاً (ذاكرة
 * `mongo-null-does-not-match-missing`، ونفس نمط `lib/tasks/not-archived.ts`). مصدر واحد
 * تقرؤه العدّادات والجدول معاً، فلا يعلن العدّاد رقماً يخالف الصفوف.
 */
export const SOCIAL_POST_NOT_ARCHIVED: Pick<Prisma.SocialPostWhereInput, "OR"> = {
  OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
};
