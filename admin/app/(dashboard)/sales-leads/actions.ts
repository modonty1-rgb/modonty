"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { createClient } from "@/app/(dashboard)/clients/actions/clients-actions/create-client";
import { leadSchema, type LeadInput } from "./helpers/lead-schema";

type Result =
  | { success: true; id: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Every write goes through the same three steps in the same order: who is asking, is the
 * input valid, then the database. The order matters — validating before checking the caller
 * leaks what the form looks like to someone who should not have reached it.
 */
async function parse(input: LeadInput) {
  const gate = await requireAdmin();
  if ("error" in gate) return { fail: { success: false as const, error: gate.error } };

  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fail: {
        success: false as const,
        error: "Check the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }
  return { data: parsed.data, userId: gate.userId };
}

/**
 * The industry arrives as an id from a dropdown built from the same table, so a value that
 * matches nothing means the list and the database have drifted. Writing it anyway would
 * produce a row pointing at an industry that does not exist — the orphan that drops a whole
 * query in Mongo rather than just its own row.
 */
async function resolveIndustry(id?: string): Promise<string | null> {
  if (!id) return null;
  const found = await db.industry.findUnique({ where: { id }, select: { id: true } });
  return found?.id ?? null;
}

export async function createLead(input: LeadInput): Promise<Result> {
  const gate = await parse(input);
  if ("fail" in gate) return gate.fail;
  const { data, userId } = gate;

  try {
    const lead = await db.salesLead.create({
      data: {
        ...data,
        industryId: await resolveIndustry(data.industryId),
        createdById: userId,
      },
      select: { id: true },
    });
    revalidatePath("/sales-leads");
    return { success: true, id: lead.id };
  } catch {
    return { success: false, error: "Could not save. Try again." };
  }
}

export async function updateLead(id: string, input: LeadInput): Promise<Result> {
  const gate = await parse(input);
  if ("fail" in gate) return gate.fail;
  const { data } = gate;

  try {
    await db.salesLead.update({
      where: { id },
      data: { ...data, industryId: await resolveIndustry(data.industryId) },
    });
    revalidatePath("/sales-leads");
    revalidatePath(`/sales-leads/${id}`);
    return { success: true, id };
  } catch {
    return { success: false, error: "Could not save. Try again." };
  }
}

/**
 * Turn a lead into a real client on Modonty.
 *
 * It calls the ordinary `createClient` rather than writing the row itself. That action is
 * where slug and email uniqueness are checked, the tier config is resolved, the client's
 * SEO is generated, the default password is set and the audit entry is written — half a
 * dozen steps a second creation path would drift away from within a month.
 *
 * The lead row is NOT deleted or emptied. It stays as the record of where this client came
 * from — which rep, which channel, what was said — and `convertedClientId` joins the two
 * halves of the journey.
 */
export async function convertLeadToClient(
  id: string,
  input: { slug: string; email: string; subscriptionTier: string },
): Promise<Result> {
  const gate = await requireAdmin();
  if ("error" in gate) return { success: false, error: gate.error };

  const lead = await db.salesLead.findUnique({ where: { id } });
  if (!lead) return { success: false, error: "العميل مش موجود." };
  if (lead.convertedClientId) {
    return { success: false, error: "العميل ده اتحوّل قبل كده." };
  }

  const created = await createClient({
    name: lead.name,
    slug: input.slug.trim(),
    email: input.email.trim(),
    phone: lead.phone ?? undefined,
    url: lead.website ?? undefined,
    industryId: lead.industryId ?? undefined,
    // الربط الجاهز الذي كان في السكيما قبل هذا الشغل كلّه: مَن سجّل المحتمَل يصير مندوب
    // العميل. هذه هي اللحظة الوحيدة التي يُعرف فيها الجواب، فلو فاتت لن يُعرف بعدها.
    salesRepId: lead.createdById ?? undefined,
    subscriptionTier: input.subscriptionTier,
  } as never);

  if (!created.success) {
    // رسالة `createClient` تُمرَّر كما هي: هي التي تعرف السبب («السلَق مستخدم» · «الإيميل
    // مستخدم من عميل آخر»)، واستبدالها برسالة عامّة يمسح الخطوة التالية من أمام فاتن.
    return { success: false, error: created.error || "ما قدرناش ننشئ العميل." };
  }

  const clientId = created.client?.id;
  if (!clientId) return { success: false, error: "اتنشأ العميل بس ما قدرناش نربطه — راجع قائمة العملاء." };

  await db.salesLead.update({
    where: { id },
    data: { convertedClientId: clientId, convertedAt: new Date(), status: "ACTIVE" },
  });

  revalidatePath("/sales-leads");
  revalidatePath(`/sales-leads/${id}`);
  revalidatePath("/clients");
  return { success: true, id: clientId };
}

/**
 * Archive, never delete — the same rule the task board settled on (Khalid, 2026-09-02:
 * «مافي حذف»). A prospect who said no is the record of a conversation that happened, and
 * next quarter it is the answer to "did we already call them?".
 */
export async function setLeadStatus(
  id: string,
  status: "PROSPECT" | "ACTIVE" | "ARCHIVED",
): Promise<Result> {
  const gate = await requireAdmin();
  if ("error" in gate) return { success: false, error: gate.error };

  try {
    await db.salesLead.update({ where: { id }, data: { status } });
    revalidatePath("/sales-leads");
    revalidatePath(`/sales-leads/${id}`);
    return { success: true, id };
  } catch {
    return { success: false, error: "Could not update. Try again." };
  }
}
