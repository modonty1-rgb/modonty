import "server-only";

import { db } from "@/lib/db";
import { riyadhToday, workDayWindow } from "@/lib/tasks/work-day-window";

/** Someone who wrote nothing in two weeks is not on the morning routine (left, on leave, sales-only). */
const ACTIVE_WINDOW_DAYS = 14;

/** Khalid reads the report; he is not counted in it. Everyone else is — Rawan included. */
const REPORT_OWNER_EMAIL = "modonty1@gmail.com";

export type RosterRow = {
  id: string;
  name: string;
  email: string | null;
  telegramUserId: string | null;
  /** Tasks this person wrote for themselves for today's work day (from 17:00 of the last one). */
  written: number;
};

/**
 * **مَن كتب مهامَّ يومه ومَن لم يكتب** — مصدرُ تذكير ٨:٠٠ وتقرير ٨:٣٠ (خالد ١٦ أكتوبر ٢٠٢٦:
 * «منبّه على فريق العمل إن ٨:٣٠ الحدّ الأقصى لتاسكاتهم… عشان الستاف يعرف إنّي متابع»).
 *
 * ── مَن يُنتظَر منه ──
 * كلُّ موظّفٍ نشط له مهمّةٌ في آخر أسبوعين — وروان منهم (خالد: «هي برضه بتحط المهام تبعتها»).
 * خالد وحده خارج العدّ: هو قارئ التقرير. وشرطُ الأسبوعين يُخرج حسابات المبيعات والمغادرين
 * وحسابات الاختبار بلا قائمةٍ تُصان باليد.
 *
 * ── وما يُعدّ «كتب» ──
 * مهمّةٌ كتبها لنفسه ليوم العمل هذا — ومنها ما كتبه مساء أمس بعد ٥ العصر، تماماً كما تقرأ صفحة
 * Daily Tasks (`lib/tasks/work-day-window.ts`). وتاسكاتُ التقويم (`socialPostId`) آليّة فلا تُحسب.
 */
export async function getMorningRoster(now: Date = new Date()): Promise<RosterRow[]> {
  const dayStart = workDayWindow(riyadhToday(now)).from;
  const since = new Date(now.getTime() - ACTIVE_WINDOW_DAYS * 86_400_000);

  const [staff, tasks] = await Promise.all([
    db.staff.findMany({
      where: { email: { not: REPORT_OWNER_EMAIL } },
      select: { id: true, name: true, email: true, isActive: true, telegramUserId: true },
    }),
    db.task.findMany({
      where: { createdAt: { gte: since } },
      select: { assigneeId: true, createdById: true, createdAt: true, socialPostId: true },
      take: 5000,
    }),
  ]);

  const recent = new Set<string>();
  const written = new Map<string, number>();
  for (const t of tasks) {
    if (!t.assigneeId) continue;
    recent.add(t.assigneeId);
    if (t.socialPostId || t.createdById !== t.assigneeId || t.createdAt < dayStart) continue;
    written.set(t.assigneeId, (written.get(t.assigneeId) ?? 0) + 1);
  }

  return staff
    .filter((s) => s.isActive !== false && recent.has(s.id))
    .map((s) => ({
      id: s.id,
      name: s.name?.trim() || s.email?.trim() || "زميل",
      email: s.email ?? null,
      telegramUserId: s.telegramUserId ?? null,
      written: written.get(s.id) ?? 0,
    }))
    .sort((a, b) => b.written - a.written || a.name.localeCompare(b.name));
}
