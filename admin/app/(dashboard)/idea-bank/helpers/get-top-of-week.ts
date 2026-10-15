import { db } from "@/lib/db";
import { IDEA_SELECT, type IdeaBankRow } from "./get-idea-bank";
import { makeTopicMatcher } from "./make-topic-matcher";

const WINDOW_DAYS = 10;
const PER_FIELD = 3;

/**
 * **أهم الأسبوع** — ما لم يُحسم بعد (جديدة · للمتابعة) وظهر خلال آخر ١٠ أيام، الأطول استمراراً أولاً.
 *
 * التنوّع مقصود (خالد ١٥ أكتوبر ٢٠٢٦: «التنوع هذا جدا مهم»): ٣ أفكار كحدّ أقصى لكل مجال، فلا يبتلع
 * مجالٌ نشيط القائمة. والاستمرار قبل الدرجة: الموضوع الذي يُبحث عنه أسبوعاً أنفع للمقال من موجة يوم.
 */
export async function getTopOfWeek(source?: string): Promise<IdeaBankRow[]> {
  const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000);
  const rows = await db.ideaBankItem.findMany({
    where: { status: { in: ["NEW", "WATCH"] }, lastSeenAt: { gte: since }, ...(source ? { sourcePlatform: source } : {}) },
    orderBy: [{ daysSeen: "desc" }, { opportunityScore: "desc" }],
    take: 600,
    select: IDEA_SELECT,
  });
  const perField = new Map<string, number>();
  const picked: IdeaBankRow[] = [];
  const pickedMatchers: ReturnType<typeof makeTopicMatcher>[] = [];
  for (const r of rows) {
    const f = `${r.fieldType ?? "none"}:${r.fieldKey ?? r.sector ?? "none"}`;
    const n = perField.get(f) ?? 0;
    if (n >= PER_FIELD) continue;
    // نفس الموضوع بصياغتين («ترتيب الدوري السعودي» · «ترتيب دوري روشن السعودي») من مجالين = صفٌّ
    // واحد: يبقى الأطول استمراراً (الصفوف مرتّبة بالأيام). التشابه في الاتجاهين، لا كلمةٌ عابرة.
    const mine = makeTopicMatcher(r.topic);
    const dup = mine.needed > 0 && pickedMatchers.some((p, i) => p.needed > 0 && p.score(r.topic) >= p.needed && mine.score(picked[i].topic) >= mine.needed);
    if (dup) continue;
    perField.set(f, n + 1);
    picked.push(r);
    pickedMatchers.push(mine);
    if (picked.length >= 60) break;
  }
  return picked;
}
