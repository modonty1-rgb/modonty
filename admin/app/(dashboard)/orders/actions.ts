"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { addMonths } from "@/lib/invoices/add-months";
import { findBlockingUnpaidInvoice } from "@/lib/invoices/find-blocking-unpaid-invoice";
import { nextInvoiceNumber } from "@/lib/invoices/next-invoice-number";
import { recomputeSubscriptionEnd } from "@/lib/invoices/recompute-subscription-end";
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

/**
 * PAY-E4: every field comes from the order's own snapshot, never today's catalog —
 * changing a plan's price afterwards must not rewrite a past invoice. ADMIN-only
 * (money), one click, gapless numbering via the same Counter every other invoice uses.
 *
 * `period` is set "monthly" | "annual" (not the card's literal "{paidMonths}m") —
 * measured live: three consumers (sales-report, send-invoice, this account page's own
 * ledger row label) switch on exactly those two strings and silently read anything
 * else as "annual". A third format there is a defect, not a feature; paidMonths===1
 * is the same simplification PAY-E3 already made for the client form's billingCycle.
 */
export async function createInvoiceFromOrderAction(orderId: string): Promise<void> {
  await requireFinanceAdmin();
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("غير مصرح");

  const order = await db.checkoutOrder.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("الطلب غير موجود");
  if (order.status !== "PAID") throw new Error("الطلب ليس مدفوعاً");
  if (!order.clientId) throw new Error("أنشئ حساب العميل أولاً");
  if (order.invoiceId) throw new Error("صدرت فاتورة لهذا الطلب مسبقاً");

  const client = await db.client.findUnique({
    where: { id: order.clientId },
    select: { id: true, name: true, createdAt: true, openingBalance: true, subscriptionEndDate: true, subscriptionTier: true, subscriptionTierConfig: { select: { name: true } }, _count: { select: { invoices: true } } },
  });
  if (!client) throw new Error("العميل غير موجود");

  // Cash-basis rule of the sales report (get-sales-report.ts:195-207): a client's
  // openingBalance is counted as revenue at founding, and an invoice flagged
  // fromOpeningBalance only DOCUMENTS it. A client created FROM this order carries the
  // order's total as its opening balance (PAY-E3 prefill — the form requires > 0), so the
  // invoice issued from the same order must be flagged, or the one payment is counted
  // twice (measured: 2394 + 2394). A renewal order linked to a pre-existing client is real
  // new money and stays unflagged — told apart by the client having been created after
  // the order, with no invoice yet.
  const foundingInvoice = client.createdAt > order.createdAt && (client.openingBalance ?? 0) > 0 && client._count.invoices === 0;
  // The CLIENT's own tier, not order.planTier: PAY-E3 already resolved the checkout
  // catalog's plan onto this client's real SubscriptionTierConfig tier (by name — the two
  // catalogs' enum values don't match, e.g. "الانطلاقة" is BASIC on the order but STANDARD
  // here). Using the order's raw enum would silently invoice a paying client as BASIC/free
  // (Fable, 11 Sep).
  if (!client.subscriptionTier) throw new Error("لا فئة اشتراك على حساب العميل");

  const blocking = await findBlockingUnpaidInvoice(client.id);
  if (blocking) throw new Error(`فيه فاتورة غير مسدّدة (${blocking}) لهذا العميل — حدّدها مدفوعة أو أرشفها أولاً`);

  const anchor = client.subscriptionEndDate ?? order.paidAt ?? new Date();
  const totalMonths = order.paidMonths + order.bonusServiceMonths;
  const subscriptionEnd = addMonths(anchor, totalMonths);
  const period = order.paidMonths === 1 ? "monthly" : "annual";

  const number = await nextInvoiceNumber(new Date().getFullYear());
  const created = await db.invoice.create({
    data: {
      number,
      clientId: client.id,
      tier: client.subscriptionTier,
      tierName: client.subscriptionTierConfig?.name ?? order.planName,
      period,
      currency: order.currency,
      amount: order.totalMinor / 100,
      paymentStatus: "PAID",
      paidAt: order.paidAt,
      subscriptionStart: anchor,
      subscriptionEnd,
      issuedAt: new Date(),
      issuedByUserId: userId,
      orderId: order.id,
      subtotalMinor: order.subtotalMinor,
      vatRateBp: order.vatRateBp,
      vatMinor: order.vatMinor,
      totalMinor: order.totalMinor,
      paidMonths: order.paidMonths,
      bonusServiceMonths: order.bonusServiceMonths,
      fromOpeningBalance: foundingInvoice,
    },
    select: { id: true },
  });

  await db.checkoutOrder.update({ where: { id: orderId }, data: { invoiceId: created.id } });
  await recomputeSubscriptionEnd(client.id);

  await logAction("invoice.create", {
    entity: "Invoice",
    entityId: created.id,
    summary: `${number} · من الطلب ${order.number} · ${client.name ?? client.id}`,
    metadata: { orderId: order.id, totalMinor: order.totalMinor, paidMonths: order.paidMonths, bonusServiceMonths: order.bonusServiceMonths, fromOpeningBalance: foundingInvoice },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/clients/${client.id}/account`);
  revalidatePath("/clients/accounts");
  revalidatePath("/");
}
