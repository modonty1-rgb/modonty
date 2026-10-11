import { db } from "@/lib/db";

/**
 * من يُسند له تصميم الكاليندر — الموظّفون النشطون بوظيفة «كرياتيف» فقط في جدول الستاف
 * (خالد ١١ أكتوبر ٢٠٢٦).
 */
export async function getCalendarDesigners(): Promise<{ id: string; name: string }[]> {
  const rows = await db.staff.findMany({
    where: { role: "CREATIVE", OR: [{ isActive: true }, { isActive: { isSet: false } }] },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return rows.map((r) => ({ id: r.id, name: r.name || "—" }));
}
