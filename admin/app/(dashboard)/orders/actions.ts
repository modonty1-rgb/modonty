"use server";

import { db } from "@/lib/db";

/**
 * Read-only name lookup for the breadcrumb (see breadcrumb-actions.ts), same unguarded
 * pattern as getCommercialPlanName — the order number isn't sensitive on its own.
 */
export async function getOrderNumber(id: string): Promise<string | null> {
  const order = await db.checkoutOrder.findUnique({ where: { id }, select: { number: true } });
  return order?.number ?? null;
}
