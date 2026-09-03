import "server-only";
import { db } from "@/lib/db";

export async function getLead(id: string) {
  return db.salesLead.findUnique({
    where: { id },
    include: {
      industry: { select: { id: true, name: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });
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
