import { db } from "@/lib/db";

export type NpsGroup = "promoter" | "passive" | "detractor";

export type NpsRow = {
  id: string;
  clientId: string;
  clientName: string;
  clientSlug: string | null;
  score: number;
  group: NpsGroup;
  comment: string | null;
  createdAt: string;
};

export type NpsSummary = {
  /** −١٠٠ إلى +١٠٠ — null بلا إجابات. */
  nps: number | null;
  answered: number;
  promoters: number;
  passives: number;
  detractors: number;
  /** من أغلق النافذة بـ× (تأجيل) — يُعرض لمعرفة نسبة التجاوب. */
  dismissed: number;
};

/** المروّج ٩–١٠ · المحايد ٧–٨ · المنتقد ٠–٦ — تعريف NPS المعتمد. */
export const npsGroup = (score: number): NpsGroup => (score >= 9 ? "promoter" : score >= 7 ? "passive" : "detractor");

/**
 * إجابات استبيان الرضا من الكونسول (خالد ١٥ أكتوبر ٢٠٢٦) — كل إجابة باسم عميلها، والملخّص على **آخر
 * إجابة لكل عميل**: عميلٌ أجاب مرّتين خلال سنة لا يُعدّ صوتين.
 */
export async function getNpsResponses(): Promise<{ rows: NpsRow[]; summary: NpsSummary }> {
  const [answers, dismissed] = await Promise.all([
    db.clientNpsResponse.findMany({
      where: { dismissed: false, score: { not: null } },
      select: { id: true, clientId: true, score: true, comment: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
    db.clientNpsResponse.count({ where: { dismissed: true } }),
  ]);
  const clients = answers.length
    ? await db.client.findMany({
        where: { id: { in: [...new Set(answers.map((a) => a.clientId))] } },
        select: { id: true, name: true, slug: true },
      })
    : [];
  const byId = new Map(clients.map((c) => [c.id, c]));

  const rows: NpsRow[] = answers.map((a) => ({
    id: a.id,
    clientId: a.clientId,
    clientName: byId.get(a.clientId)?.name ?? "عميل محذوف",
    clientSlug: byId.get(a.clientId)?.slug ?? null,
    score: a.score!,
    group: npsGroup(a.score!),
    comment: a.comment,
    createdAt: a.createdAt.toISOString(),
  }));

  // آخر إجابة لكل عميل — الصفوف مرتّبة من الأحدث، فأوّل ظهورٍ للعميل هو الأحدث
  const latest = new Map<string, NpsRow>();
  for (const r of rows) if (!latest.has(r.clientId)) latest.set(r.clientId, r);
  const last = [...latest.values()];
  const promoters = last.filter((r) => r.group === "promoter").length;
  const detractors = last.filter((r) => r.group === "detractor").length;
  const answered = last.length;

  return {
    rows,
    summary: {
      nps: answered ? Math.round(((promoters - detractors) / answered) * 100) : null,
      answered,
      promoters,
      passives: answered - promoters - detractors,
      detractors,
      dismissed,
    },
  };
}
