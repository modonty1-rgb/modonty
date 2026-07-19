"use server";

import { revalidatePath } from "next/cache";
import { SubscriptionStatus, PaymentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export interface MarkPaidInput {
  invoiceId: string;
  paidDate: string; // yyyy-mm-dd — settlement date entered by admin
}

interface MarkPaidResult {
  ok: boolean;
  error?: string;
}

/**
 * Settle an invoice. This is the ONLY write-point for `Client.subscriptionEndDate`:
 * after marking paid, the client's end date is recomputed as the latest end date
 * across ALL paid invoices (so out-of-order settlement stays correct).
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
    select: { id: true, clientId: true, paymentStatus: true },
  });
  if (!invoice) return { ok: false, error: "الفاتورة غير موجودة" };
  if (invoice.paymentStatus === "PAID") return { ok: false, error: "الفاتورة مدفوعة بالفعل" };

  try {
    await db.invoice.update({
      where: { id: invoice.id },
      data: { paymentStatus: "PAID", paidAt, paidByUserId: session.user.id ?? null },
    });

    // subscriptionEndDate = latest end date across ALL paid invoices.
    const paidInvoices = await db.invoice.findMany({
      where: { clientId: invoice.clientId, paymentStatus: "PAID" },
      select: { subscriptionEnd: true },
    });
    const latestEnd = paidInvoices
      .map((i) => i.subscriptionEnd)
      .filter((d): d is Date => d instanceof Date)
      .reduce<Date | null>((max, d) => (max === null || d.getTime() > max.getTime() ? d : max), null);

    await db.client.update({
      where: { id: invoice.clientId },
      data: {
        ...(latestEnd ? { subscriptionEndDate: latestEnd } : {}),
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        paymentStatus: PaymentStatus.PAID,
      },
    });

    revalidatePath(`/clients/${invoice.clientId}/account`);
    revalidatePath(`/clients/${invoice.clientId}`);
    revalidatePath("/clients/accounts");
    return { ok: true };
  } catch (e) {
    console.error("[markInvoicePaid] failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : "فشل تحديد السداد" };
  }
}
