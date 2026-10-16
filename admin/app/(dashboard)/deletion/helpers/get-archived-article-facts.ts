import { db } from "@/lib/db";

type ArchivedArticle = {
  id: string;
  updatedAt: Date;
  datePublished: Date | null;
  viewsCount: number;
  wordCount: number | null;
  client: { name: string } | null;
};

const D = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", year: "numeric" });
const N = new Intl.NumberFormat("ar-EG");

/**
 * ما يحتاجه الأدمن قبل حذف مقال مؤرشف (خالد ١٦ أكتوبر ٢٠٢٦: «مين الكاتب ومتى الأرشيف حصلت…
 * معلومات تفيدني قبل ما الغي»). كلها من سجلّ التدقيق والمقال نفسه، ولا يُخمَّن شيء:
 *  - الكاتب: من سجّل `article.create`.
 *  - الأرشفة: `article.archive` (يُسجَّل من ١٦ أكتوبر) أو انتقالٌ إلى ARCHIVED من شاشة سير العمل.
 *    قبلها ما كانت الأرشفة تُسجَّل، فأوّل تعديلٍ حالته ARCHIVED يُعرض «تقريباً»، وإلا يُقال صراحةً إنه غير مسجّل.
 */
export type RowFact = { label: string; value: string };

export async function getArchivedArticleFacts(articles: ArchivedArticle[]): Promise<Map<string, RowFact[]>> {
  const logs = await db.auditLog.findMany({
    where: {
      entity: "Article",
      entityId: { in: articles.map((a) => a.id) },
      action: { in: ["article.create", "article.archive", "article.transition", "article.update"] },
    },
    select: { entityId: true, action: true, userName: true, userEmail: true, createdAt: true, metadata: true },
    orderBy: { createdAt: "asc" },
    take: 20000,
  });

  const out = new Map<string, RowFact[]>();
  for (const a of articles) {
    const mine = logs.filter((l) => l.entityId === a.id);
    const who = (l: (typeof mine)[number]) => l.userName ?? l.userEmail;
    const meta = (l: (typeof mine)[number]) => (l.metadata ?? {}) as { to?: string; status?: string };

    const created = mine.find((l) => l.action === "article.create");
    const archived = [...mine]
      .reverse()
      .find((l) => l.action === "article.archive" || (l.action === "article.transition" && meta(l).to === "ARCHIVED"));
    const firstArchivedEdit = mine.find((l) => l.action === "article.update" && meta(l).status === "ARCHIVED");

    const facts: RowFact[] = [
      { label: "العميل", value: a.client?.name ?? "—" },
      { label: "الكاتب", value: created ? who(created) : "غير مسجّل" },
      { label: "النشر", value: a.datePublished ? `منشور من ${D.format(a.datePublished)}` : "ما انتشر أبداً" },
      {
        label: "الأرشفة",
        value: archived
          ? `${D.format(archived.createdAt)} — ${who(archived)}`
          : firstArchivedEdit
            ? `تقريباً ${D.format(firstArchivedEdit.createdAt)} — ${who(firstArchivedEdit)}`
            : `غير مسجّل · آخر تعديل ${D.format(a.updatedAt)}`,
      },
      { label: "المشاهدات", value: N.format(a.viewsCount) },
      { label: "الكلمات", value: a.wordCount ? N.format(a.wordCount) : "—" },
    ];
    out.set(a.id, facts);
  }
  return out;
}
