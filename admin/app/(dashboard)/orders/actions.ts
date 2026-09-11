"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { requireFinanceAdmin } from "@/lib/require-finance-admin";

/**
 * Read-only name lookup for the breadcrumb (see breadcrumb-actions.ts), same unguarded
 * pattern as getCommercialPlanName — the order number isn't sensitive on its own.
 */
export async function getOrderNumber(id: string): Promise<string | null> {
  const order = await db.checkoutOrder.findUnique({ where: { id }, select: { number: true } });
  return order?.number ?? null;
}

const confirmTransferSchema = z.object({
  transferReference: z.string().trim().min(1, "مرجع التحويل مطلوب").max(80, "المرجع طويل جداً"),
  transferDate: z.coerce.date({ invalid_type_error: "تاريخ غير صحيح" }),
});

/**
 * PAY-Q12's mandatory guard for the Egypt manual-transfer path: ADMIN-only
 * (requireFinanceAdmin), a written reference + date, an audit row, and a conditional
 * update so the same order can never be confirmed twice — count === 0 means it was
 * already PAID (or never AWAITING_TRANSFER) and the caller sees why, not a false success.
 */
export async function confirmOrderPaymentAction(orderId: string, form: FormData): Promise<void> {
  await requireFinanceAdmin();

  const parsed = confirmTransferSchema.safeParse({
    transferReference: String(form.get("transferReference") ?? "").trim(),
    transferDate: String(form.get("transferDate") ?? ""),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "تحقّق من بيانات التحويل");

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("غير مصرح");

  const now = new Date();
  const { count } = await db.checkoutOrder.updateMany({
    where: { id: orderId, status: "AWAITING_TRANSFER" },
    data: {
      status: "PAID",
      paidAt: now,
      transferReference: parsed.data.transferReference,
      transferDate: parsed.data.transferDate,
      confirmedByUserId: userId,
      confirmedAt: now,
    },
  });
  if (count === 0) throw new Error("الطلب مؤكَّد مسبقاً أو ليس بانتظار تحويل");

  const order = await db.checkoutOrder.findUnique({ where: { id: orderId }, select: { totalMinor: true, currency: true } });
  if (order) {
    await db.paymentTransaction.create({
      data: { orderId, provider: "BANK_TRANSFER", providerReference: parsed.data.transferReference, status: "SUCCESS", amountMinor: order.totalMinor, currency: order.currency, settledAt: now },
    });
  }

  await logAction("order.confirmPayment", { entity: "Order", entityId: orderId, summary: `تأكيد تحويل — مرجع ${parsed.data.transferReference}` });

  // shared/lib/payments/notify-payment-received.ts (PAY-E7) يُستدعى من هنا حين يُبنى.

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}

/** For the order-detail "existing client?" check — same buyer email, read-only. */
export async function getExistingClientForOrderEmail(orderId: string): Promise<{ id: string; name: string } | null> {
  const order = await db.checkoutOrder.findUnique({ where: { id: orderId }, select: { buyerEmail: true } });
  if (!order) return null;
  return db.client.findFirst({ where: { email: order.buyerEmail }, select: { id: true, name: true } });
}
