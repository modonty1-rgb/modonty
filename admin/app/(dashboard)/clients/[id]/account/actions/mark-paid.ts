"use server";

import { revalidatePath } from "next/cache";
import { SubscriptionStatus, PaymentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { NOT_ARCHIVED, recomputeSubscriptionEnd } from "../helpers/billing";

export interface MarkPaidInput {
  invoiceId: string;
  paidDate: string; // yyyy-mm-dd — settlement date entered by admin
}

interface MarkPaidResult {
  ok: boolean;
  error?: string;
}

/**
 * Settle an invoice, then recompute the client's end date through the one shared formula
 * (`recomputeSubscriptionEnd`). It used to compute its own — furthest end across PAID
 * invoices only — which meant settling an older invoice while newer ones were still due
 * pulled the subscription BACKWARDS. Paying must never shorten a subscription.
 */
export async function markInvoicePaidAction(input: MarkPaidInput): Promise<MarkPaidResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  if (!input.invoiceId) return { ok: false, error: "الفاتورة مطلوبة" };
  if (!input.paidDate) return { ok: false, error: "تاريخ السداد مطلوب" };

  const paidAt = new Date(input.paidDate);
  if (isNaN(paidAt.getTime())) return { ok: false, error: "تاريخ السداد غير صحيح" };

  const invoice = await db.invoice.findUnique({
    where: { id: input.invoiceId },
    select: {
      id: true,
      clientId: true,
      number: true,
      paymentStatus: true,
      archivedAt: true,
      client: { select: { name: true } },
    },
  });
  if (!invoice) return { ok: false, error: "الفاتورة غير موجودة" };
  if (invoice.paymentStatus === "PAID") return { ok: false, error: "الفاتورة مدفوعة بالفعل" };
  if (invoice.archivedAt) return { ok: false, error: "الفاتورة مؤرشفة — لا يمكن تحديدها مدفوعة" };

  try {
    await db.invoice.update({
      where: { id: invoice.id },
      data: { paymentStatus: "PAID", paidAt, paidByUserId: session.user.id ?? null },
    });

    await recomputeSubscriptionEnd(invoice.clientId);

    // Only claim the client is settled when nothing is actually outstanding. The
    // issuance guard should make a second unpaid invoice impossible, but this field is
    // read by legacy counters and must not lie if one ever slips through.
    const stillOutstanding = await db.invoice.count({
      where: { clientId: invoice.clientId, paymentStatus: { not: "PAID" }, ...NOT_ARCHIVED },
    });

    await db.client.update({
      where: { id: invoice.clientId },
      data: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        ...(stillOutstanding === 0 ? { paymentStatus: PaymentStatus.PAID } : {}),
      },
    });

    await logAction("invoice.paid", {
      entity: "Invoice",
      entityId: invoice.id,
      summary: `${invoice.number} · ${invoice.client.name ?? invoice.clientId}`,
      metadata: { paidDate: input.paidDate },
    });

    revalidatePath(`/clients/${invoice.clientId}/account`);
    revalidatePath(`/clients/${invoice.clientId}`);
    revalidatePath("/clients/accounts");
    revalidatePath("/"); // the dashboard's renewal + unpaid counters read these
    return { ok: true };
  } catch (e) {
    console.error("[markInvoicePaid] failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : "فشل تحديد السداد" };
  }
}
