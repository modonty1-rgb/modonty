"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { recomputeSubscriptionEnd } from "../helpers/billing";

interface ConvertResult {
  ok: boolean;
  number?: string;
  error?: string;
}

// Add whole months in UTC, clamping the day (31 Jan + 1m → 28/29 Feb) — the same formula
// createInvoiceAction uses, so a converted period lines up with any later renewal.
function addMonths(from: Date, months: number): Date {
  const out = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + months, from.getUTCDate()));
  if (out.getUTCDate() < from.getUTCDate()) out.setUTCDate(0);
  return out;
}

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
 * Turn the client's opening balance into its FIRST invoice — the «Auto Button» on the
 * account page (Khalid 2026-07-25).
 *
 * The founding payment is already stored on `Client.openingBalance` and already counted in
 * the sales report (as cash received at createdAt). This does NOT add new revenue: it issues
 * the paid invoice that DOCUMENTS that balance, flagged `fromOpeningBalance` so the report
 * keeps excluding it (the balance is the money; the invoice is only the paper).
 *
 * Only runs once the client's first article is live — billing starts when content goes live,
 * so the subscription window is anchored to that article. The opening balance is NOT cleared:
 * the report reads balance + renewals, and the flag alone prevents double-counting.
 * Idempotent: a second call is refused once a fromOpeningBalance invoice exists.
 */
export async function convertOpeningBalanceAction(clientId: string): Promise<ConvertResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };
  if (!clientId) return { ok: false, error: "العميل مطلوب" };

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      openingBalance: true,
      addressCountry: true,
      billingCycle: true,
      isInternal: true,
      createdAt: true,
      subscriptionTier: true,
      subscriptionTierConfig: { select: { name: true } },
    },
  });
  if (!client) return { ok: false, error: "العميل غير موجود" };
  if (client.isInternal) return { ok: false, error: "الحساب داخلي/مجاني — لا رصيد افتتاحي." };
  if (!client.openingBalance || client.openingBalance <= 0) {
    return { ok: false, error: "لا يوجد رصيد افتتاحي لهذا العميل." };
  }

  // Never convert twice — the flag is the source of truth for "already documented".
  const existing = await db.invoice.findFirst({
    where: { clientId: client.id, fromOpeningBalance: true },
    select: { number: true },
  });
  if (existing) {
    return { ok: false, error: `الرصيد الافتتاحي محوّل مسبقاً في الفاتورة ${existing.number}.` };
  }

  // Billing starts when the client's first article goes live — that anchors the period.
  const firstPublished = await db.article.findFirst({
    where: { clientId: client.id, status: "PUBLISHED", datePublished: { not: null } },
    orderBy: { datePublished: "asc" },
    select: { datePublished: true },
  });
  if (!firstPublished?.datePublished) {
    return { ok: false, error: "ما فيه مقال منشور بعد — الفوترة تبدأ مع أول مقال." };
  }

  const months = client.billingCycle === "monthly" ? 1 : 12;
  const period = client.billingCycle === "monthly" ? "monthly" : "annual";
  const subStart = firstPublished.datePublished;
  const subEnd = addMonths(subStart, months);

  try {
    const number = await nextInvoiceNumber(new Date().getFullYear());
    const created = await db.invoice.create({
      data: {
        number,
        clientId: client.id,
        tier: client.subscriptionTier,
        tierName: client.subscriptionTierConfig?.name ?? client.subscriptionTier,
        period,
        currency: currencyForCountry(client.addressCountry),
        amount: client.openingBalance,
        paymentStatus: "PAID", // the founding payment was already collected
        paidAt: client.createdAt, // cash was received at founding
        paidByUserId: session.user.id ?? null,
        subscriptionStart: subStart,
        subscriptionEnd: subEnd,
        issuedAt: new Date(),
        issuedByUserId: session.user.id ?? null,
        fromOpeningBalance: true, // a document of the balance — excluded from report revenue
      },
      select: { id: true },
    });

    await recomputeSubscriptionEnd(client.id);

    await logAction("invoice.create", {
      entity: "Invoice",
      entityId: created.id,
      summary: `${number} · رصيد افتتاحي · ${client.name ?? client.id}`,
      metadata: { amount: client.openingBalance, months, fromOpeningBalance: true },
    });

    revalidatePath(`/clients/${client.id}/account`);
    revalidatePath("/clients/accounts");
    revalidatePath("/clients/sales-report");
    revalidatePath("/"); // dashboard renewal counters read the client's end date
    return { ok: true, number };
  } catch (e) {
    console.error("[convertOpeningBalance] failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : "فشل تجهيز الفاتورة" };
  }
}
