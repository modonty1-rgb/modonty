import { db } from "@/lib/db";

/**
 * عملاء آخر إجابةٍ لهم في استبيان الرضا ٠–٦ خلال ٣٠ يوماً — صفٌّ في «عاجل» على اللوحة (بطاقة CONSOLE-NPS:
 * «المنتقد يظهر في عاجل»): العميل الزعلان يُتّصل به قبل أن يلغي.
 */
export async function getRecentDetractors(): Promise<number> {
  const since = new Date(Date.now() - 30 * 86400_000);
  const answers = await db.clientNpsResponse.findMany({
    where: { dismissed: false, score: { not: null }, createdAt: { gte: since } },
    select: { clientId: true, score: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });
  const latest = new Map<string, number>();
  for (const a of answers) if (!latest.has(a.clientId)) latest.set(a.clientId, a.score!);
  return [...latest.values()].filter((s) => s <= 6).length;
}
