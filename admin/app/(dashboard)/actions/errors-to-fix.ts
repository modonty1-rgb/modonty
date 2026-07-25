"use server";

import { toE164 } from "@modonty/database/lib/phone";

import { db } from "@/lib/db";

/**
 * «Errors to fix» — a REUSABLE dashboard aggregator for data problems that a script can't
 * safely auto-fix and a human must resolve by hand. Each check returns a category; add a new
 * check here and the dashboard card renders it automatically.
 *
 * First check: client WhatsApp numbers that can't be normalized to E.164 (two numbers glued
 * together, a landline, an unknown format) — the deep-link would go nowhere.
 */

export interface FixItem {
  id: string;
  /** Primary label (e.g. client name). */
  label: string;
  /** What's wrong + the offending value. */
  detail: string;
  /** Where the admin goes to fix it. */
  href: string;
}

export interface ErrorCategory {
  key: string;
  title: string;
  items: FixItem[];
}

async function invalidWhatsappNumbers(): Promise<FixItem[]> {
  // Fetch + filter in code (never a Mongo `{ phone: null }` filter — it misses absent fields).
  const clients = await db.client.findMany({
    where: { OR: [{ isInternal: null }, { isInternal: false }, { isInternal: { isSet: false } }] },
    select: { id: true, name: true, phone: true },
    take: 3000,
  });

  return clients
    .map((c) => ({ c, r: c.phone ? toE164(c.phone) : { e164: null as string | null, reason: undefined } }))
    .filter((x) => x.c.phone && x.r.e164 === null)
    .map((x) => ({
      id: x.c.id,
      label: x.c.name,
      detail: `${x.c.phone} — ${x.r.reason ?? "غير صالح"}`,
      href: `/clients/${x.c.id}/edit`,
    }));
}

export async function getErrorsToFix(): Promise<ErrorCategory[]> {
  const [badPhones] = await Promise.all([invalidWhatsappNumbers()]);

  const categories: ErrorCategory[] = [];
  if (badPhones.length) {
    categories.push({ key: "whatsapp", title: "أرقام واتساب غير صالحة", items: badPhones });
  }
  return categories;
}
