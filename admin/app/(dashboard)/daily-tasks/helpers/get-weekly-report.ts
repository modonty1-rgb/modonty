import { db } from "@/lib/db";

/**
 * **تقريرُ الأسبوع لكلّ شخص** (خالد ٢٣ سبتمبر ٢٠٢٦: «تتقسم لتقرير أسبوعي — تقرير بمعنى الكلمة»).
 *
 * كانت الصفحةُ قائمةَ مهامّ اليوم، لا تقريراً: تقول ما كُتب، ولا تقول مَن أنجز ومَن تأخّر.
 * فهذا يجيب أربعة أسئلة لكلّ شخصٍ في الأسبوع:
 *   أُسند له   — مهامّ كُتبت له في الأسبوع (`createdAt`).
 *   أنجز       — مهامّ أُغلقت في الأسبوع (`completedAt`)، أيّاً كان يومُ كتابتها.
 *   في موعده   — من المنجَز ذي الموعد: ما أُغلق قبل نهاية يوم موعده.
 *   متأخّر الآن — مفتوحٌ فات موعدُه (حالٌ اليوم، لا حدثُ الأسبوع).
 * ومعها «أنجز الأسبوعَ الماضي» للمقارنة.
 *
 * الأسبوعُ من الأحد إلى السبت — أسبوعُ العمل في السعوديّة ومصر يبدأ الأحد.
 */
export interface PersonWeek {
  staffId: string | null;
  name: string;
  image: string | null;
  assigned: number;
  completed: number;
  completedWithDue: number;
  onTime: number;
  lateNow: number;
  completedLastWeek: number;
}

/** بدايةُ أسبوعٍ (الأحد، منتصف الليل المحلّيّ) يحوي `day`. */
export function weekStartOf(day: Date): Date {
  const d = new Date(day);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // getDay(): الأحد = 0
  return d;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

const endOfDay = (d: Date) => new Date(d).setHours(23, 59, 59, 999);

export async function getWeeklyReport(weekStart: Date, now: Date = new Date()): Promise<PersonWeek[]> {
  const weekEnd = addDays(weekStart, 7);
  const prevStart = addDays(weekStart, -7);

  const rows = await db.task.findMany({
    where: {
      AND: [
        // المؤرشفُ خارجُ كلّ لوحة — والحقلُ الغائبُ في مونغو لا يطابق `null`، فيُسأل الشكلان.
        { OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }] },
        {
          OR: [
            { createdAt: { gte: weekStart, lt: weekEnd } },
            { completedAt: { gte: prevStart, lt: weekEnd } },
            // المتأخّرُ الآن: مفتوحٌ وموعدُه قبل اليوم.
            { status: { not: "DONE" }, dueDate: { lt: now } },
          ],
        },
      ],
    },
    select: {
      status: true,
      dueDate: true,
      createdAt: true,
      completedAt: true,
      assignee: { select: { id: true, name: true, image: true } },
    },
    take: 2000,
  });

  const people = new Map<string, PersonWeek>();
  const bucket = (a: { id: string; name: string | null; image: string | null } | null) => {
    const key = a?.id ?? "__unassigned__";
    let p = people.get(key);
    if (!p) {
      p = {
        staffId: a?.id ?? null,
        name: a?.name?.trim() || (a ? "No name" : "Unassigned"),
        image: a?.image ?? null,
        assigned: 0, completed: 0, completedWithDue: 0, onTime: 0, lateNow: 0, completedLastWeek: 0,
      };
      people.set(key, p);
    }
    return p;
  };

  for (const t of rows) {
    const p = bucket(t.assignee);
    if (t.createdAt >= weekStart && t.createdAt < weekEnd) p.assigned += 1;
    if (t.completedAt && t.completedAt >= weekStart && t.completedAt < weekEnd) {
      p.completed += 1;
      if (t.dueDate) {
        p.completedWithDue += 1;
        if (t.completedAt.getTime() <= endOfDay(t.dueDate)) p.onTime += 1;
      }
    }
    if (t.completedAt && t.completedAt >= prevStart && t.completedAt < weekStart) p.completedLastWeek += 1;
    if (t.status !== "DONE" && t.dueDate && endOfDay(t.dueDate) < now.getTime()) p.lateNow += 1;
  }

  // المتأخّرُ أوّلاً ثمّ الأكثرُ عملاً — مَن يحتاج نظرةً اليوم أوّلُ مَن يُرى. وبلا مُسنَدٍ في الآخر.
  return [...people.values()]
    .filter((p) => p.assigned + p.completed + p.lateNow + p.completedLastWeek > 0)
    .sort((a, b) => {
      if (!a.staffId) return 1;
      if (!b.staffId) return -1;
      return b.lateNow - a.lateNow || b.assigned + b.completed - (a.assigned + a.completed);
    });
}
