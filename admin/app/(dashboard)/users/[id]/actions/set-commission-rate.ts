"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { requireFinanceAdmin } from "@/lib/require-finance-admin";

const percent = z.coerce.number().min(0, "النسبة لا تقلّ عن ٠").max(100, "النسبة لا تزيد عن ١٠٠");

const schema = z
  .object({
    staffId: z.string().regex(/^[0-9a-f]{24}$/i),
    newRate: percent,
    renewalRate: percent,
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "اختر تاريخ البداية"),
  })
  .refine((v) => v.renewalRate <= v.newRate, { message: "نسبة التجديد لا تزيد عن نسبة الصفقة الجديدة", path: ["renewalRate"] });

/**
 * Set from the rep's own staff page (Khalid, 30 Sep 2026: «النسبة حقها تحدد هناك» — in Staff, not
 * on the commissions page). A new commission rate for one rep, in force from `effectiveFrom`. Adds a row — never edits
 * one: deals before that day keep the rate they were sold under (Khalid: «تبقى على نسبتها»).
 */
export async function setCommissionRateAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireFinanceAdmin();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  const { staffId, newRate, renewalRate, effectiveFrom } = parsed.data;

  const staff = await db.staff.findUnique({ where: { id: staffId }, select: { name: true } });
  if (!staff) return { ok: false, error: "المندوب غير موجود" };

  const session = await auth().catch(() => null);
  const newRateBp = Math.round(newRate * 100);
  const renewalRateBp = Math.round(renewalRate * 100);
  await db.salesCommissionRate.create({
    data: {
      staffId,
      newRateBp,
      renewalRateBp,
      effectiveFrom: new Date(`${effectiveFrom}T00:00:00Z`),
      createdById: (session?.user as { id?: string } | undefined)?.id ?? null,
    },
  });

  await logAction("commission.rate", {
    entity: "Staff",
    entityId: staffId,
    summary: `نسبة عمولة ${staff.name ?? ""}: جديد ${newRate}٪ · تجديد ${renewalRate}٪ — من ${effectiveFrom}`,
    metadata: { newRateBp, renewalRateBp, effectiveFrom },
  });

  revalidatePath("/sales-commissions");
  revalidatePath(`/users/${staffId}`);
  return { ok: true };
}
