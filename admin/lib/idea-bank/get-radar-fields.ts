import { db } from "@/lib/db";
import { LIVE_SECTORS, isSectorPaused } from "@modonty/shared/lib/sectors/live-sectors";
import { NOT_ARCHIVED } from "@modonty/shared/lib/taxonomy/not-archived";

export type RadarField = { type: "sector" | "category" | "industry" | "competitor"; key: string; name: string };

/**
 * **المجالات التي يرصدها رادار المحتوى** — من القاعدة في كل نداء، فقسمٌ أو صناعةٌ تُضاف من الأدمن
 * تُرصد بلا تعديل كود (خالد ١٥ أكتوبر ٢٠٢٦: «دايناميك»). القطاع الموقوف خارج الرصد.
 *
 * مستهلكان: مدخل الرادار (`/api/idea-bank/fields`) وزرّ «ابحث الآن» في صفحة بنك الأفكار.
 */
export async function getRadarFields(): Promise<RadarField[]> {
  const [categories, industries, competitors] = await Promise.all([
    db.category.findMany({ where: NOT_ARCHIVED, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.industry.findMany({ where: NOT_ARCHIVED, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.ideaCompetitor.findMany({ where: { active: true }, select: { domain: true, name: true }, orderBy: { name: "asc" }, take: 50 }),
  ]);
  return [
    ...LIVE_SECTORS.filter((s) => !isSectorPaused(s.slug)).map((s) => ({ type: "sector" as const, key: s.slug, name: s.label })),
    ...categories.map((c) => ({ type: "category" as const, key: c.id, name: c.name })),
    ...industries.map((i) => ({ type: "industry" as const, key: i.id, name: i.name })),
    // المنافس مجالٌ مفتاحه نطاقه — فيأخذ تبويبه وعدّاده و«ابحث الآن» وآخر رصده بلا مسارٍ ثانٍ
    ...competitors.map((c) => ({ type: "competitor" as const, key: c.domain, name: c.name })),
  ];
}
