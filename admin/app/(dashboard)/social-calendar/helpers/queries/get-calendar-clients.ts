import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";

import { formatMonthParam } from "../dates";

export interface CalendarClientRow {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  totalPosts: number;
  /** الشهور التي فيها منشور حيّ، تصاعدياً بصيغة `yyyy-mm`. */
  activeMonths: string[];
}

interface MonthGroup {
  _id: { c?: { $oid: string } | string | null; y: number; m: number };
  n: number;
}

/**
 * لوحة العملاء — كل عميل مدونتي غير مؤرشف، مع عدد منشوراته الحيّة وشهوره النشطة.
 *
 * تجميع واحد على مونغو لا N+1 (القديم كان يجلب كل المنشورات ثم يفلتر في JS — `clients.ts:31-37`).
 * في الاستعلام الخام `archivedAt: null` يطابق الغائب أيضاً — الفخّ خاصّ بترجمة Prisma لا بمونغو.
 */
export async function getCalendarClients(): Promise<CalendarClientRow[]> {
  const [clients, groups] = await Promise.all([
    db.client.findMany({
      where: { OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }] },
      select: { id: true, name: true, slug: true, logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } } },
      // ترتيب القديم (`getClients` — `clients.ts:26-29`): الأقدم أوّلاً.
      orderBy: { createdAt: "asc" },
    }),
    db.socialPost.aggregateRaw({
      pipeline: [
        // `clientId` و`scheduledFor` شرطان دفاعيّان: كانت الميزة على `social_posts` التي تحمل صفوف
        // ميزة نشر فيسبوك قديمة (بلا clientId) فتُسقط اللوحة — نُقلت إلى `social_calendar_posts` (قرار خالد ٩ أكتوبر).
        { $match: { archivedAt: null, clientId: { $type: "objectId" }, scheduledFor: { $type: "date" } } },
        {
          $group: {
            _id: { c: "$clientId", y: { $year: "$scheduledFor" }, m: { $month: "$scheduledFor" } },
            n: { $sum: 1 },
          },
        },
      ],
    }) as unknown as Promise<MonthGroup[]>,
  ]);

  const byClient = new Map<string, { total: number; months: string[] }>();
  for (const g of groups) {
    const c = g._id.c;
    if (!c) continue;
    const id = typeof c === "string" ? c : c.$oid;
    const entry = byClient.get(id) ?? { total: 0, months: [] };
    entry.total += g.n;
    entry.months.push(formatMonthParam(g._id.y, g._id.m - 1));
    byClient.set(id, entry);
  }

  return clients.map((c) => {
    const agg = byClient.get(c.id);
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      logoUrl: mediaSrc(c.logoMedia),
      totalPosts: agg?.total ?? 0,
      activeMonths: (agg?.months ?? []).sort(),
    };
  });
}
