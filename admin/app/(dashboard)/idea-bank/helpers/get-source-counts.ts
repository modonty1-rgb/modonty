import { db } from "@/lib/db";

/** المصادر التي يجلب منها الرادار — بالترتيب الذي تظهر به تحت عدّادات القرار. */
export const IDEA_SOURCES = [
  { key: "google_suggest", label: "بحث قوقل" },
  { key: "google_news", label: "أخبار قوقل" },
  { key: "google_trends", label: "قوقل ترندز" },
  { key: "competitor", label: "المنافسون" },
  { key: "x", label: "إكس" },
] as const;

export type IdeaSourceKey = (typeof IDEA_SOURCES)[number]["key"];

export const isIdeaSource = (v: string | undefined): v is IdeaSourceKey =>
  IDEA_SOURCES.some((s) => s.key === v);

/** عدد أفكار كل مصدر في البنك كلّه — إكس يظهر بصفر حتى يُشحن حسابه، فيُعرف أنه مصدرٌ مطفأ لا مفقود. */
export async function getSourceCounts(): Promise<Record<IdeaSourceKey, number>> {
  const grouped = await db.ideaBankItem.groupBy({ by: ["sourcePlatform"], _count: { _all: true } });
  const counts = Object.fromEntries(IDEA_SOURCES.map((s) => [s.key, 0])) as Record<IdeaSourceKey, number>;
  for (const g of grouped) if (isIdeaSource(g.sourcePlatform)) counts[g.sourcePlatform] = g._count._all;
  return counts;
}
