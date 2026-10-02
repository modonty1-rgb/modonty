"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { requireFinanceAdmin } from "@/lib/require-finance-admin";

const schema = z.object({
  staffId: z.string().regex(/^[0-9a-f]{24}$/i),
  amount: z.coerce.number().positive("التارجت أكبر من صفر").max(100_000_000, "رقم غير منطقي"),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}$/, "اختر الشهر"),
});

/**
 * A rep's monthly sales target in Saudi riyals, from a month on (Khalid, 1 Oct 2026: «شهري بالمبلغ»
 * · «التارجت يكون بالريال»). Adds a row — never edits one, like the rate: a past month keeps the
 * target it was measured against.
 */
export async function setSalesTargetAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireFinanceAdmin();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  const { staffId, amount, effectiveFrom } = parsed.data;

  const staff = await db.staff.findUnique({ where: { id: staffId }, select: { name: true } });
  if (!staff) return { ok: false, error: "المندوب غير موجود" };

  const session = await auth().catch(() => null);
  const monthlySarMinor = Math.round(amount * 100);
  await db.salesTarget.create({
    data: {
      staffId,
      monthlySarMinor,
      effectiveFrom: new Date(`${effectiveFrom}-01T00:00:00Z`),
      createdById: (session?.user as { id?: string } | undefined)?.id ?? null,
    },
  });

  await logAction("commission.target", {
    entity: "Staff",
    entityId: staffId,
    summary: `تارجت ${staff.name ?? ""} الشهري: ${amount} ر.س — من ${effectiveFrom}`,
    metadata: { monthlySarMinor, effectiveFrom },
  });

  revalidatePath(`/users/${staffId}`);
  revalidatePath("/commission-statement");
  return { ok: true };
}
