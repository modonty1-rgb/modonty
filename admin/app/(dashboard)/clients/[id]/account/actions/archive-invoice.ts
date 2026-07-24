"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { recomputeSubscriptionEnd } from "../helpers/billing";

export interface ArchiveInvoiceInput {
  invoiceId: string;
  reason: string;
}

interface ArchiveInvoiceResult {
  ok: boolean;
  error?: string;
}

/**
 * Void an invoice without deleting it — the accounting record stays whole (Khalid
 * 2026-07-24: «الحل الوحيد إنه نعمل archive للفاتورة عشان الحسابات»).
 *
 * This is the only escape from the one-outstanding-invoice rule, and the only legitimate
 * way the subscription end date moves BACKWARDS: the archived period was never really
 * sold, so it must stop counting.
 *
 * A paid invoice is never archivable — money changed hands, and the ledger says so.
 */
export async function archiveInvoiceAction(input: ArchiveInvoiceInput): Promise<ArchiveInvoiceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  if (!input.invoiceId) return { ok: false, error: "الفاتورة مطلوبة" };
  const reason = input.reason?.trim();
  if (!reason) return { ok: false, error: "سبب الأرشفة مطلوب" };

  const invoice = await db.invoice.findUnique({
    where: { id: input.invoiceId },
    select: { id: true, clientId: true, paymentStatus: true, archivedAt: true },
  });
  if (!invoice) return { ok: false, error: "الفاتورة غير موجودة" };
  if (invoice.archivedAt) return { ok: false, error: "الفاتورة مؤرشفة بالفعل" };
  if (invoice.paymentStatus === "PAID") {
    return { ok: false, error: "الفاتورة مدفوعة — لا تُؤرشف فاتورة دخلت الحسابات" };
  }

  try {
    await db.invoice.update({
      where: { id: invoice.id },
      data: {
        archivedAt: new Date(),
        archivedReason: reason,
        archivedByUserId: session.user.id ?? null,
      },
    });

    await recomputeSubscriptionEnd(invoice.clientId);

    revalidatePath(`/clients/${invoice.clientId}/account`);
    revalidatePath(`/clients/${invoice.clientId}`);
    revalidatePath("/clients/accounts");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    console.error("[archiveInvoice] failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : "فشل أرشفة الفاتورة" };
  }
}
