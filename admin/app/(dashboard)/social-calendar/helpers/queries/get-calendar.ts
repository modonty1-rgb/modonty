import type { SocialCalendarKind } from "@prisma/client";

import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";

import { calendarLabel } from "../calendar-label";

export interface CalendarInfo {
  id: string;
  kind: SocialCalendarKind;
  name: string;
  logoUrl: string | null;
  /** عميل مدونتي المربوط (كاليندر التفعيل) — null لكاليندر براندٍ خارجيّ أو داخليّ. */
  clientId: string | null;
  designerId: string | null;
  reviewNote: string | null;
}

/** هويّة الكاليندر في رأس كل صفحة من صفحاته. معرّف غير صالح أو مؤرشف → null (الصفحة تردّ notFound). */
export async function getCalendar(calendarId: string): Promise<CalendarInfo | null> {
  if (!/^[a-f\d]{24}$/i.test(calendarId)) return null;
  const c = await db.socialCalendar.findUnique({
    where: { id: calendarId },
    select: {
      id: true,
      kind: true,
      name: true,
      clientId: true,
      designerId: true,
      reviewNote: true,
      archivedAt: true,
      client: { select: { name: true, logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } } } },
    },
  });
  if (!c || c.archivedAt) return null;
  return {
    id: c.id,
    kind: c.kind,
    name: calendarLabel(c),
    logoUrl: c.client ? mediaSrc(c.client.logoMedia) : null,
    clientId: c.clientId ?? null,
    designerId: c.designerId ?? null,
    reviewNote: c.reviewNote ?? null,
  };
}
