"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { readBunnyBackupConfig } from "@modonty/shared/lib/backup";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { requireFinanceAdmin } from "@/lib/require-finance-admin";

/**
 * **حذفُ طلبٍ نهائياً** — يُرفع من جدول الطلبات، لا يصير «ملغى» (خالد ٢٨ سبتمبر ٢٠٢٦: «أبغى
 * أشيله من التيبل… أحياناً نعمل تجارب على طلبات وبتكون معلقة… الأدمن بس»).
 *
 * يُحذف الطلب وما يخصّه وحده: عمليّات الدفع ومحاولاته وإشعارات البوّابة وفاتورته. ولا يُمسّ
 * العميل؛ إلا مؤشّر `activeOrderId` إن كان يشير إلى هذا الطلب، فيُفرَّغ كي لا يشير إلى طلبٍ
 * لم يعد موجوداً.
 *
 * للأدمن وحده (`requireFinanceAdmin`)، ويُكتب رقم الطلب أو آخر أربعة أرقامه للتأكيد. وقبل
 * الحذف تُحفظ لقطةٌ منه في سجلّ العمليّات: الرقم والمشتري والمبلغ والحالة والفاتورة.
 */
const schema = z.object({
  orderId: z.string().min(1),
  confirm: z.string().trim().min(1, "اكتب رقم الطلب للتأكيد"),
});

export async function deleteOrderAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireFinanceAdmin();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  const { orderId, confirm } = parsed.data;

  const order = await db.checkoutOrder.findUnique({
    where: { id: orderId },
    select: {
      number: true, status: true, buyerName: true, buyerPhone: true, totalMinor: true, currency: true,
      invoiceId: true, clientId: true, transferReceiptPath: true,
    },
  });
  if (!order) return { ok: false, error: "الطلب غير موجود — ربما حُذف." };

  const last4 = order.number.replace(/\D/g, "").slice(-4);
  const typed = confirm.toUpperCase();
  if (typed !== order.number.toUpperCase() && typed.replace(/\D/g, "") !== last4) {
    return { ok: false, error: `الرقم لا يطابق — اكتب ${order.number} أو آخر أربعة أرقام (${last4})` };
  }

  // الفاتورة بمؤشّريها: `orderId` عليها و`invoiceId` على الطلب — أيّهما وُجد.
  const invoiceWhere = order.invoiceId
    ? { OR: [{ orderId }, { id: order.invoiceId }] }
    : { orderId };
  const invoices = await db.invoice.findMany({ where: invoiceWhere, select: { id: true, number: true } });

  try {
    await db.$transaction([
      db.paymentTransaction.deleteMany({ where: { orderId } }),
      db.paymentAttempt.deleteMany({ where: { orderId } }),
      db.paymentWebhookEvent.deleteMany({ where: { orderId } }),
      db.invoice.deleteMany({ where: { id: { in: invoices.map((i) => i.id) } } }),
      db.client.updateMany({ where: { activeOrderId: orderId }, data: { activeOrderId: null } }),
      db.checkoutOrder.delete({ where: { id: orderId } }),
    ]);
  } catch {
    return { ok: false, error: "ما تمّ الحذف — لم يُحذف شيء. حاول مرة ثانية." };
  }

  await logAction("order.delete", {
    entity: "Order",
    entityId: orderId,
    summary: `حذف الطلب ${order.number} نهائياً — ${order.buyerName} — ${(order.totalMinor / 100).toLocaleString("en")} ${order.currency}`,
    metadata: {
      number: order.number,
      status: order.status,
      buyerName: order.buyerName,
      buyerPhone: order.buyerPhone,
      totalMinor: order.totalMinor,
      currency: order.currency,
      clientId: order.clientId,
      invoices: invoices.map((i) => i.number),
    },
  });

  // The receipt image lives in private Bunny storage, not in the database: remove it too, or
  // it outlives its order. Best-effort — the order is already gone, a stray file is not worth
  // failing the delete over.
  if (order.transferReceiptPath) {
    try {
      const config = readBunnyBackupConfig();
      await fetch(`https://${config.hostname}/${config.zone}/${order.transferReceiptPath}`, {
        method: "DELETE",
        headers: { AccessKey: config.password },
      });
    } catch {
      // leave it
    }
  }

  revalidatePath("/orders");
  revalidatePath("/");
  // From the server, not the client: the action re-renders the page it was called from, and
  // that order no longer exists — measured 28 Sep 2026, it landed on a 404 before the client
  // could navigate away.
  redirect("/orders");
}
