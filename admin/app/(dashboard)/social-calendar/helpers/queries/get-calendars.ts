import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";

import { calendarLabel } from "../calendar-label";
import { formatMonthParam } from "../dates";

export type CalendarKind = "content" | "social";

export interface CalendarRow {
  id: string;
  name: string;
  logoUrl: string | null;
  /** «محتاج مراجعة» — شارة صفراء على الكرت. */
  reviewNote: string | null;
  /** كاتب المحتوى المسؤول عن العميل (`Client.editor`) — null لكاليندر بلا عميل أو بلا كاتب. */
  writer: string | null;
  totalPosts: number;
  /** الشهور التي فيها منشور حيّ، تصاعدياً بصيغة `yyyy-mm`. */
  activeMonths: string[];
}

interface MonthGroup {
  _id: { c?: { $oid: string } | string | null; y: number; m: number };
  n: number;
}

/**
 * كروت قسمٍ من Social Calendar (خالد ١١ أكتوبر ٢٠٢٦) — القسم من `kind` الذي يُختار عند التأسيس:
 *   content  كاليندرات المحتوى — كاليندر التفعيل لكل عميل (والمنتهي يبقى ظاهراً)، وأيّ براند آخر.
 *   social   كاليندرات السوشيال ميديا.
 * كاليندرٌ عميله مؤرشف يختفي كرته.
 *
 * تجميع واحد على مونغو لا N+1. في الاستعلام الخام `archivedAt: null` يطابق الغائب أيضاً —
 * الفخّ خاصّ بترجمة Prisma لا بمونغو.
 */
export async function getCalendars(kind: CalendarKind): Promise<CalendarRow[]> {
  const NOT_ARCHIVED = { OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }] };
  const [calendars, groups] = await Promise.all([
    db.socialCalendar.findMany({
      where: {
        AND: [
          NOT_ARCHIVED,
          { kind: kind === "content" ? "CONTENT" : "SOCIAL" },
          { OR: [{ clientId: null }, { clientId: { isSet: false } }, { client: { is: NOT_ARCHIVED } }] },
        ],
      },
      select: {
        id: true,
        name: true,
        reviewNote: true,
        client: {
          select: {
            name: true,
            logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
            editor: { select: { name: true, email: true } },
          },
        },
      },
      // الأقدم أوّلاً، كترتيب القديم (`getClients` — `clients.ts:26-29`).
      orderBy: { createdAt: "asc" },
    }),
    db.socialPost.aggregateRaw({
      pipeline: [
        { $match: { archivedAt: null, calendarId: { $type: "objectId" }, scheduledFor: { $type: "date" } } },
        {
          $group: {
            _id: { c: "$calendarId", y: { $year: "$scheduledFor" }, m: { $month: "$scheduledFor" } },
            n: { $sum: 1 },
          },
        },
      ],
    }) as unknown as Promise<MonthGroup[]>,
  ]);

  const byCalendar = new Map<string, { total: number; months: string[] }>();
  for (const g of groups) {
    const c = g._id.c;
    if (!c) continue;
    const id = typeof c === "string" ? c : c.$oid;
    const entry = byCalendar.get(id) ?? { total: 0, months: [] };
    entry.total += g.n;
    entry.months.push(formatMonthParam(g._id.y, g._id.m - 1));
    byCalendar.set(id, entry);
  }

  return calendars.map((c) => {
    const agg = byCalendar.get(c.id);
    return {
      id: c.id,
      name: calendarLabel(c),
      logoUrl: c.client ? mediaSrc(c.client.logoMedia) : null,
      reviewNote: c.reviewNote ?? null,
      writer: c.client?.editor ? c.client.editor.name?.trim() || c.client.editor.email : null,
      totalPosts: agg?.total ?? 0,
      activeMonths: (agg?.months ?? []).sort(),
    };
  });
}

/** «المؤرشفة» أسفل القسم — الكاليندرات المؤرشفة لتُسترجع (الأرشفة لا الحذف). */
export async function getArchivedCalendars(kind: CalendarKind): Promise<{ id: string; name: string }[]> {
  const rows = await db.socialCalendar.findMany({
    where: { kind: kind === "content" ? "CONTENT" : "SOCIAL", archivedAt: { not: null } },
    select: { id: true, name: true, client: { select: { name: true } } },
    orderBy: { archivedAt: "desc" },
  });
  return rows.map((c) => ({ id: c.id, name: calendarLabel(c) }));
}
