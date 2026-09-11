import type { PrismaClient } from "@prisma/client";

/**
 * Gapless per-year order number — ORD-2026-00042 — via an atomic upsert on `Counter`
 * (same pattern as `nextInvoiceNumber` in admin `clients/[id]/account/actions/create-invoice.ts`).
 * Backstop: `CheckoutOrder.number` is @unique. Also sent to the provider as merchant reference.
 */
export async function nextOrderNumber(db: Pick<PrismaClient, "counter">, year = new Date().getFullYear()): Promise<string> {
  const counter = await db.counter.upsert({
    where: { key: `order-${year}` },
    create: { key: `order-${year}`, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `ORD-${year}-${String(counter.value).padStart(5, "0")}`;
}
