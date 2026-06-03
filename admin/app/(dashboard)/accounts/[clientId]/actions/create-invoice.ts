"use server";

import { revalidatePath } from "next/cache";
import { SubscriptionTier, SubscriptionStatus, PaymentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendEmailWithRetry } from "@/lib/email/resend-client";
import { invoiceEmail } from "@/lib/email/templates/invoice";
import { getTierConfigByTier } from "@/app/(dashboard)/subscription-tiers/actions/tier-actions";

export interface CreateInvoiceInput {
  clientId: string;
  tier: SubscriptionTier;
  tierName: string;
  period: "monthly" | "annual";
  currency: "SAR" | "EGP";
  amount: number;
  paymentMethod: string; // value
  paymentMethodLabel: string; // Arabic label (snapshot for email)
  paymentStatus: "PAID" | "DUE";
  subscriptionStart: string | null; // ISO / yyyy-mm-dd
  subscriptionEnd: string | null;
}

interface CreateInvoiceResult {
  ok: boolean;
  number?: string;
  emailed?: boolean;
  error?: string;
}

// Atomic, gapless per-year sequence. Backstop: Invoice.number is @unique.
async function nextInvoiceNumber(year: number): Promise<string> {
  const counter = await db.counter.upsert({
    where: { key: `invoice-${year}` },
    create: { key: `invoice-${year}`, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `MOD-${year}-${String(counter.value).padStart(5, "0")}`;
}

export async function createInvoiceAction(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  if (!input.clientId) return { ok: false, error: "العميل مطلوب" };
  if (!input.tier) return { ok: false, error: "الباقة مطلوبة" };
  if (!input.amount || input.amount <= 0) return { ok: false, error: "المبلغ غير صحيح" };

  const client = await db.client.findUnique({
    where: { id: input.clientId },
    select: { id: true, name: true, email: true },
  });
  if (!client) return { ok: false, error: "العميل غير موجود" };

  const subStart = input.subscriptionStart ? new Date(input.subscriptionStart) : null;
  const subEnd = input.subscriptionEnd ? new Date(input.subscriptionEnd) : null;

  try {
    const now = new Date();
    const number = await nextInvoiceNumber(now.getFullYear());

    const invoice = await db.invoice.create({
      data: {
        number,
        clientId: client.id,
        tier: input.tier,
        tierName: input.tierName,
        period: input.period,
        currency: input.currency,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentStatus,
        subscriptionStart: subStart,
        subscriptionEnd: subEnd,
        issuedAt: now,
        issuedByUserId: session.user.id ?? null,
      },
      select: { id: true },
    });

    // Option (b): issuing the invoice updates the client's live subscription state.
    const tierConfig = await getTierConfigByTier(input.tier);
    await db.client.update({
      where: { id: client.id },
      data: {
        subscriptionTier: input.tier,
        ...(tierConfig?.id ? { subscriptionTierConfigId: tierConfig.id } : {}),
        ...(typeof tierConfig?.articlesPerMonth === "number"
          ? { articlesPerMonth: tierConfig.articlesPerMonth }
          : {}),
        ...(subStart ? { subscriptionStartDate: subStart } : {}),
        ...(subEnd ? { subscriptionEndDate: subEnd } : {}),
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        paymentStatus: input.paymentStatus === "PAID" ? PaymentStatus.PAID : PaymentStatus.PENDING,
      },
    });

    // Email the invoice (best-effort — never fail the invoice on email error).
    let emailed = false;
    if (client.email) {
      try {
        const tpl = invoiceEmail({
          clientName: client.name,
          email: client.email,
          invoiceNumber: number,
          tierName: input.tierName,
          periodLabel: input.period === "monthly" ? "شهري" : "سنوي",
          amount: input.amount,
          currency: input.currency,
          paymentMethodLabel: input.paymentMethodLabel,
          paymentStatus: input.paymentStatus,
          issuedAt: now,
          subscriptionStart: subStart,
          subscriptionEnd: subEnd,
        });
        await sendEmailWithRetry({
          from: process.env.RESEND_FROM?.trim() || "Modonty <modonty@modonty.com>",
          to: client.email,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
          tags: [
            { name: "emailType", value: "invoice" },
            { name: "clientId", value: client.id },
          ],
        });
        emailed = true;
        await db.invoice.update({ where: { id: invoice.id }, data: { emailSentAt: new Date() } });
      } catch (e) {
        console.error("[invoice email] send failed:", e);
      }
    }

    revalidatePath(`/accounts/${client.id}`);
    revalidatePath(`/clients/${client.id}`);
    return { ok: true, number, emailed };
  } catch (e) {
    console.error("[createInvoice] failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : "فشل إصدار الفاتورة" };
  }
}
