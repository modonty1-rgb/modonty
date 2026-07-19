"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export interface CreateInvoiceInput {
  clientId: string;
  amount: number;
  subscriptionEnd: string; // yyyy-mm-dd — admin-entered end date
}

interface CreateInvoiceResult {
  ok: boolean;
  number?: string;
  error?: string;
}

// Egypt → EGP, everything else (default Saudi) → SAR.
function currencyForCountry(country: string | null): "SAR" | "EGP" {
  const c = (country ?? "").toLowerCase();
  return /مصر|egypt|\beg\b/.test(c) ? "EGP" : "SAR";
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

/**
 * Issue a renewal invoice — born «مستحقّة» (DUE).
 * Does NOT extend the subscription and does NOT email the client; both happen
 * later («تحديد مدفوعة» extends + «إرسال» emails). Plan/period/currency are
 * derived server-side from the client's current subscription — the form only
 * sends the amount and the end date.
 */
export async function createInvoiceAction(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  if (!input.clientId) return { ok: false, error: "العميل مطلوب" };
  if (!input.amount || input.amount <= 0) return { ok: false, error: "المبلغ غير صحيح" };
  if (!input.subscriptionEnd) return { ok: false, error: "تاريخ الانتهاء مطلوب" };

  const subEnd = new Date(input.subscriptionEnd);
  if (isNaN(subEnd.getTime())) return { ok: false, error: "تاريخ الانتهاء غير صحيح" };

  const client = await db.client.findUnique({
    where: { id: input.clientId },
    select: {
      id: true,
      subscriptionTier: true,
      subscriptionTierConfig: { select: { name: true } },
      addressCountry: true,
    },
  });
  if (!client) return { ok: false, error: "العميل غير موجود" };

  // Billing period follows the client's most-recent invoice (default annual).
  const latest = await db.invoice.findFirst({
    where: { clientId: client.id },
    orderBy: { issuedAt: "desc" },
    select: { period: true },
  });

  try {
    const now = new Date();
    const number = await nextInvoiceNumber(now.getFullYear());

    await db.invoice.create({
      data: {
        number,
        clientId: client.id,
        tier: client.subscriptionTier,
        tierName: client.subscriptionTierConfig?.name ?? client.subscriptionTier,
        period: latest?.period ?? "annual",
        currency: currencyForCountry(client.addressCountry),
        amount: input.amount,
        paymentStatus: "DUE", // born due — settled later via «تحديد مدفوعة»
        subscriptionEnd: subEnd,
        issuedAt: now,
        issuedByUserId: session.user.id ?? null,
      },
      select: { id: true },
    });

    revalidatePath(`/clients/${client.id}/account`);
    return { ok: true, number };
  } catch (e) {
    console.error("[createInvoice] failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : "فشل إصدار الفاتورة" };
  }
}
