import "server-only";
import { db } from "@/lib/db";

export async function getLead(id: string) {
  return db.salesLead.findUnique({
    where: { id },
    include: {
      industry: { select: { id: true, name: true } },
      createdBy: { select: { name: true, email: true } },
      owner: { select: { id: true, name: true } },
      /**
       * السجلّ كاملاً، الأحدث أوّلاً — وهو صلب الصفحة لا ملحقٌ بها: خالد (٤ سبتمبر) «العميل
       * ممكن يكون فيه قصة حياته كاملة في الـfollow up».
       *
       * السقف ٢٠٠ صفّ: عميلٌ تجاوزها له تاريخ سنتين، وعرضه كاملاً في صفحة واحدة لا يُقرأ
       * أصلاً. ويُذكر السقف في الشاشة حين يُبلَغ بدل أن يُبتر الباقي بصمت.
       */
      followUps: {
        orderBy: { happenedAt: "desc" },
        take: 200,
        include: { createdBy: { select: { name: true } } },
      },
    },
  });
}

/** عدد صفوف السجلّ كاملاً — يقول للشاشة هل السقف أعلاه بتر شيئاً. */
export async function countLeadFollowUps(leadId: string): Promise<number> {
  return db.salesLeadFollowUp.count({ where: { leadId } });
}

export type LeadDetail = NonNullable<Awaited<ReturnType<typeof getLead>>>;

/** The dropdown's options — the same table the id is validated against on save. */
export async function getIndustryOptions() {
  return db.industry.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

/** Just the name — what the breadcrumb needs, without pulling the whole row for one string. */
export async function getLeadName(id: string): Promise<string | null> {
  const lead = await db.salesLead.findUnique({ where: { id }, select: { name: true } });
  return lead?.name ?? null;
}
