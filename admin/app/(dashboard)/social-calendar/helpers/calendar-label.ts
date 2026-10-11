import type { Prisma } from "@prisma/client";

/**
 * اسم الكاليندر في الإشعارات والسجلّ والتاسكات — مكانٌ واحد.
 * كاليندر المحتوى باسم عميله (لا يُنسخ الاسم على الكاليندر)، وكاليندر السوشيال باسمه.
 */
export const CALENDAR_LABEL_SELECT = {
  name: true,
  client: { select: { name: true } },
} satisfies Prisma.SocialCalendarSelect;

export function calendarLabel(c: { name: string | null; client: { name: string } | null }): string {
  return c.client?.name ?? c.name ?? "—";
}
