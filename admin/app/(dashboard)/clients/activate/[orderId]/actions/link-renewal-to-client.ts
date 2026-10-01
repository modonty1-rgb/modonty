"use server";

import { z } from "zod";

import { checkAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { linkOrderToClient } from "@/lib/orders/link-order-to-client";

import { findExistingClientForOrder } from "../helpers/find-existing-client-for-order";

const schema = z.object({ orderId: z.string().regex(/^[0-9a-f]{24}$/i) });

/**
 * «ربط بالعميل القائم» — a paid renewal joins the account it renews. The client is resolved
 * here from the order, never taken from the browser, so a tampered id cannot attach a deal to
 * someone else. `linkOrderToClient` then stamps the order, makes it the active deal and extends
 * the subscription end.
 */
export async function linkRenewalToClientAction(orderId: string): Promise<{ ok: true; clientId: string } | { ok: false; error: string }> {
  const gate = await checkAdmin();
  if (gate.status !== "ok") return { ok: false, error: "غير مصرح" };

  const parsed = schema.safeParse({ orderId });
  if (!parsed.success) return { ok: false, error: "بيانات غير صالحة" };

  const order = await db.checkoutOrder.findUnique({
    where: { id: parsed.data.orderId },
    select: { id: true, number: true, status: true, clientId: true, buyerEmail: true },
  });
  if (!order) return { ok: false, error: "الطلب غير موجود" };
  if (order.clientId) return { ok: false, error: "الطلب مربوط بعميل مسبقاً" };
  if (order.status !== "PAID") return { ok: false, error: "لا يُربط إلّا طلبٌ مدفوع" };

  const client = await findExistingClientForOrder(order);
  if (!client) return { ok: false, error: "لا عميلَ قائم بهذا البريد — فعّله كعميلٍ جديد" };

  await linkOrderToClient(order.id, client.id);

  await logAction("order.update", {
    entity: "Order",
    entityId: order.id,
    summary: `ربط التجديد ${order.number} بالعميل القائم «${client.name}»`,
    metadata: { clientId: client.id, via: "activate-page-renewal-link" },
  });

  return { ok: true, clientId: client.id };
}
