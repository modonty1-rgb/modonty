"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { sendEmailWithRetry } from "@/lib/email/resend-client";
import { invoiceEmail, type InvoiceLegalInfo } from "@/lib/email/templates/invoice";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

/**
 * The platform's legal registry for the invoice body — read from the SAME Settings.org*
 * fields the /trust page shows, so the invoice can never state a different CR number
 * than the site does.
 */
async function getInvoiceLegalInfo(): Promise<InvoiceLegalInfo | null> {
  const s = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: {
      orgLegalName: true,
      orgCommercialRegistrationNumber: true,
      orgUnifiedNationalNumber: true,
      orgLegalForm: true,
      orgCapitalAmount: true,
      orgStreetAddress: true,
      orgAddressNeighborhood: true,
      orgAddressLocality: true,
    },
  });
  if (!s) return null;
  const t = (v: string | null) => v?.trim() || null;
  const address = [t(s.orgAddressLocality), t(s.orgAddressNeighborhood), t(s.orgStreetAddress)]
    .filter(Boolean)
    .join(" — ");
  return {
    legalName: t(s.orgLegalName),
    cr: t(s.orgCommercialRegistrationNumber),
    unifiedNumber: t(s.orgUnifiedNationalNumber),
    entityType: t(s.orgLegalForm),
    capital: t(s.orgCapitalAmount),
    address: address || null,
  };
}

interface SendInvoiceResult {
  ok: boolean;
  error?: string;
}

/** Email an invoice to the client (issue and send are decoupled). */
export async function sendInvoiceAction(invoiceId: string): Promise<SendInvoiceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };
  if (!invoiceId) return { ok: false, error: "الفاتورة مطلوبة" };

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      clientId: true,
      number: true,
      tierName: true,
      period: true,
      currency: true,
      amount: true,
      paymentStatus: true,
      issuedAt: true,
      subscriptionEnd: true,
      client: { select: { name: true, email: true } },
    },
  });
  if (!invoice) return { ok: false, error: "الفاتورة غير موجودة" };
  if (!invoice.client.email) return { ok: false, error: "لا يوجد إيميل لهذا العميل" };

  try {
    const currency = invoice.currency === "EGP" ? "EGP" : "SAR";
    const legal = await getInvoiceLegalInfo();
    const tpl = invoiceEmail({
      legal,
      clientName: invoice.client.name,
      email: invoice.client.email,
      invoiceNumber: invoice.number,
      tierName: invoice.tierName,
      periodLabel: invoice.period === "monthly" ? "شهري" : "سنوي",
      amount: invoice.amount,
      currency,
      paymentStatus: invoice.paymentStatus === "PAID" ? "PAID" : "DUE",
      issuedAt: invoice.issuedAt,
      subscriptionEnd: invoice.subscriptionEnd,
    });

    await sendEmailWithRetry({
      from: process.env.RESEND_FROM?.trim() || "Modonty <modonty@modonty.com>",
      to: invoice.client.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      tags: [
        { name: "emailType", value: "invoice" },
        { name: "invoiceNumber", value: invoice.number },
      ],
    });

    await db.invoice.update({ where: { id: invoice.id }, data: { emailSentAt: new Date() } });

    await logAction("invoice.send", {
      entity: "Invoice",
      entityId: invoice.id,
      summary: `${invoice.number} · ${invoice.client.name ?? invoice.clientId}`,
    });

    revalidatePath(`/clients/${invoice.clientId}/account`);
    return { ok: true };
  } catch (e) {
    console.error("[sendInvoice] failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : "فشل إرسال الإيميل" };
  }
}
