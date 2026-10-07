import { db } from "@/lib/db";

/** Atomic, gapless per-year sequence. Backstop: Invoice.number is @unique. */
export async function nextInvoiceNumber(year: number): Promise<string> {
  const counter = await db.counter.upsert({
    where: { key: `invoice-${year}` },
    create: { key: `invoice-${year}`, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `MOD-${year}-${String(counter.value).padStart(5, "0")}`;
}
