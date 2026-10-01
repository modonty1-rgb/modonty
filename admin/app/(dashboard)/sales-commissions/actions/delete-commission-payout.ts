"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { requireFinanceAdmin } from "@/lib/require-finance-admin";

const schema = z.object({ payoutId: z.string().regex(/^[0-9a-f]{24}$/i) });

/** Removes a payout recorded by mistake. The audit row keeps what it was. */
export async function deleteCommissionPayoutAction(payoutId: string): Promise<{ ok: boolean; error?: string }> {
  await requireFinanceAdmin();

  const parsed = schema.safeParse({ payoutId });
  if (!parsed.success) return { ok: false, error: "بيانات غير صالحة" };

  const payout = await db.salesCommissionPayout.findUnique({
    where: { id: parsed.data.payoutId },
    select: { id: true, staffId: true, currency: true, amountMinor: true, paidOn: true, note: true, staff: { select: { name: true } } },
  });
  if (!payout) return { ok: false, error: "الصرفيّة غير موجودة" };

  await db.salesCommissionPayout.delete({ where: { id: payout.id } });

  await logAction("commission.payoutDelete", {
    entity: "Staff",
    entityId: payout.staffId,
    summary: `حذف صرفيّة ${payout.staff.name ?? ""}: ${(payout.amountMinor / 100).toLocaleString("en")} ${payout.currency} — ${payout.paidOn.toISOString().slice(0, 10)}`,
    metadata: { amountMinor: payout.amountMinor, currency: payout.currency, paidOn: payout.paidOn.toISOString(), note: payout.note },
  });

  revalidatePath("/sales-commissions");
  revalidatePath("/orders"); // the commission face beside each order
  return { ok: true };
}
