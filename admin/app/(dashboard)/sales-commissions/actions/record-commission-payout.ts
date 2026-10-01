"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { requireFinanceAdmin } from "@/lib/require-finance-admin";

import { getSalesCommissions } from "@/lib/commissions/get-sales-commissions";

const schema = z.object({
  staffId: z.string().regex(/^[0-9a-f]{24}$/i),
  currency: z.enum(["SAR", "EGP"]),
  orderIds: z.array(z.string().regex(/^[0-9a-f]{24}$/i)).min(1, "اختر طلباً واحداً على الأقل").max(500),
  paidOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "اختر تاريخ الصرف"),
  note: z.string().trim().max(300).optional(),
});

/**
 * «اصرف المحدد» — pays out the commission of the orders the admin ticked, for one rep in one
 * currency. The amounts are NOT taken from the browser: every order is priced again here from the
 * same ledger the page reads (`getSalesCommissions`), and must be this rep's, in this currency,
 * and still unpaid (or a clawback due). Each order is stored with its amount on the day — a later
 * rate change never rewrites what was paid.
 */
export async function recordCommissionPayoutAction(input: {
  staffId: string;
  currency: string;
  orderIds: string[];
  paidOn: string;
  note?: string;
}): Promise<{ ok: true; amountMinor: number } | { ok: false; error: string }> {
  await requireFinanceAdmin();

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  const { staffId, currency, orderIds, paidOn, note } = parsed.data;

  const rep = (await getSalesCommissions()).find((r) => r.id === staffId);
  if (!rep) return { ok: false, error: "المندوب غير موجود" };

  const items: { orderId: string; orderNumber: string; commissionMinor: number }[] = [];
  for (const id of new Set(orderIds)) {
    const deal = rep.deals.find((d) => d.orderId === id);
    if (!deal || deal.currency !== currency) return { ok: false, error: "طلبٌ ليس لهذا المندوب بهذه العملة" };
    if (deal.state === "unpaid") items.push({ orderId: id, orderNumber: deal.number, commissionMinor: deal.commissionMinor });
    else if (deal.state === "clawback") items.push({ orderId: id, orderNumber: deal.number, commissionMinor: -deal.clawbackMinor });
    else return { ok: false, error: `الطلب ${deal.number} ما عليه عمولة للصرف — حدّث الصفحة` };
  }
  const amountMinor = items.reduce((s, i) => s + i.commissionMinor, 0);
  if (amountMinor <= 0) return { ok: false, error: "المجموع صفر أو أقلّ — أضف طلبات تغطّي الخصم" };

  const session = await auth().catch(() => null);
  const payout = await db.salesCommissionPayout.create({
    data: {
      staffId,
      currency,
      amountMinor,
      items,
      paidOn: new Date(`${paidOn}T00:00:00Z`),
      note: note || null,
      createdById: (session?.user as { id?: string } | undefined)?.id ?? null,
    },
    select: { id: true },
  });

  await logAction("commission.payout", {
    entity: "Staff",
    entityId: staffId,
    summary: `صرف عمولة لـ${rep.name}: ${(amountMinor / 100).toLocaleString("en")} ${currency} عن ${items.length} طلب — ${paidOn}${note ? ` — ${note}` : ""}`,
    metadata: { payoutId: payout.id, amountMinor, currency, paidOn, orders: items.map((i) => `${i.orderNumber}:${i.commissionMinor}`) },
  });

  revalidatePath("/sales-commissions");
  revalidatePath("/orders"); // the commission face beside each order
  return { ok: true, amountMinor };
}
