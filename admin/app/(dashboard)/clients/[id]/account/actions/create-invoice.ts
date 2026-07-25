"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { findBlockingUnpaidInvoice, recomputeSubscriptionEnd } from "../helpers/billing";

export interface CreateInvoiceInput {
  clientId: string;
  amount: number;
  /** Billed duration. The end date is derived from it — never typed by hand. */
  months: number;
  /** Required only when the client has no published article yet (see resolveAnchor). */
  confirmNotActivated?: boolean;
}

interface CreateInvoiceResult {
  ok: boolean;
  number?: string;
  /** yyyy-mm-dd the subscription now runs to — echoed back so the UI can show it. */
  subscriptionEnd?: string;
  error?: string;
}

const ALLOWED_MONTHS = [1, 2, 3, 6, 12, 18] as const;

/**
 * Add whole months, clamping the day so 31 Jan + 1 month lands on 28/29 Feb, not 3 Mar.
 *
 * Deliberately in UTC. Local-time arithmetic makes the result depend on where the code
 * runs — the same renewal computed a day apart on a dev machine east of Greenwich and on
 * Vercel (UTC) — and the client preview does the same maths, so both must agree.
 */
function addMonths(from: Date, months: number): Date {
  const out = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + months, from.getUTCDate())
  );
  if (out.getUTCDate() < from.getUTCDate()) out.setUTCDate(0);
  return out;
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
 * Issue a renewal invoice — born «مستحقّة» (DUE), but the subscription window moves
 * NOW: `Client.subscriptionEndDate` is rewritten to the furthest end across all of the
 * client's invoices (Khalid 2026-07-24: «تاريخ انتهاء الفاتورة هو الذي يعدّل تاريخ
 * الانتهاء في ملف العميل»). Before this, the date only moved on «تحديد مدفوعة», so 21
 * of 26 active clients carried no end date at all — and a date filter cannot match a
 * missing field, which left the renewal watch blind to 81% of the book.
 *
 * The end date is COMPUTED from `months`, never typed: it is anchored to the current
 * end (a renewal continues where the last period stopped), else to the first published
 * article — the subscription starts when the client's content goes live, not when the
 * record was created — else to today.
 *
 * Emailing still happens separately («إرسال»).
 */
export async function createInvoiceAction(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  if (!input.clientId) return { ok: false, error: "العميل مطلوب" };
  if (!input.amount || input.amount <= 0) return { ok: false, error: "المبلغ غير صحيح" };
  if (!ALLOWED_MONTHS.includes(input.months as (typeof ALLOWED_MONTHS)[number])) {
    return { ok: false, error: "المدة غير صحيحة" };
  }

  const client = await db.client.findUnique({
    where: { id: input.clientId },
    select: {
      id: true,
      name: true,
      subscriptionTier: true,
      subscriptionTierConfig: { select: { name: true } },
      addressCountry: true,
      subscriptionEndDate: true,
      billingCycle: true,
    },
  });
  if (!client) return { ok: false, error: "العميل غير موجود" };

  // We do not sell on credit: one outstanding invoice at a time. Clearing it means
  // settling it or archiving it — there is no bypass.
  const blocking = await findBlockingUnpaidInvoice(client.id);
  if (blocking) {
    return {
      ok: false,
      error: `فيه فاتورة غير مسدّدة (${blocking}) — حدّدها مدفوعة أو أرشفها قبل إصدار فاتورة جديدة.`,
    };
  }

  // Billing starts when the client's first article goes live — that is what they are
  // paying for. No article yet means the clock has not started, so the admin has to
  // say out loud that they mean to bill anyway.
  const firstPublished = await db.article.findFirst({
    where: { clientId: client.id, status: "PUBLISHED", datePublished: { not: null } },
    orderBy: { datePublished: "asc" },
    select: { datePublished: true },
  });

  if (!firstPublished?.datePublished && !input.confirmNotActivated) {
    return { ok: false, error: "NOT_ACTIVATED" };
  }

  const now = new Date();
  // A renewal continues from where the last period stopped — even if it stopped in the
  // past. Anchoring an expired client to its first article instead would reach back a
  // year and hand them a period SHORTER than they paid for (caught live: end 11 Jul 2026,
  // 12 months quoted 2027-06-10 — 45 days missing). First article is the anchor only for
  // a client that has never had an end date at all.
  const anchor =
    client.subscriptionEndDate ?? firstPublished?.datePublished ?? now;
  const subEnd = addMonths(anchor, input.months);

  // Billing period is client-owned — read it off the client, not the last invoice
  // (Khalid 2026-07-25: the tier + cycle are set on the client edit page).
  const period = client.billingCycle === "monthly" ? "monthly" : "annual";

  try {
    const number = await nextInvoiceNumber(now.getFullYear());

    const created = await db.invoice.create({
      data: {
        number,
        clientId: client.id,
        tier: client.subscriptionTier,
        tierName: client.subscriptionTierConfig?.name ?? client.subscriptionTier,
        period,
        currency: currencyForCountry(client.addressCountry),
        amount: input.amount,
        paymentStatus: "DUE", // born due — settled later via «تحديد مدفوعة»
        subscriptionEnd: subEnd,
        issuedAt: now,
        issuedByUserId: session.user.id ?? null,
      },
      select: { id: true },
    });

    const latestEnd = await recomputeSubscriptionEnd(client.id);

    await logAction("invoice.create", {
      entity: "Invoice",
      entityId: created.id,
      summary: `${number} · ${client.name ?? client.id}`,
      metadata: {
        amount: input.amount,
        currency: currencyForCountry(client.addressCountry),
        months: input.months,
        period,
      },
    });

    revalidatePath(`/clients/${client.id}/account`);
    revalidatePath(`/clients/${client.id}`);
    revalidatePath("/clients/accounts");
    revalidatePath("/"); // the dashboard's renewal counters read this date
    return { ok: true, number, subscriptionEnd: (latestEnd ?? subEnd).toISOString().slice(0, 10) };
  } catch (e) {
    console.error("[createInvoice] failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : "فشل إصدار الفاتورة" };
  }
}
