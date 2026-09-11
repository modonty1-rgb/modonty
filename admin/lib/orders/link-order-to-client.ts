"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Writes CheckoutOrder.clientId only — createClient() itself is never edited (PAY-E3),
 * so this is the one place an order and a client meet. Called either right after a fresh
 * create (from the client form, orderId in the URL) or directly for a renewal whose email
 * already has a client (order-detail "ربط بالعميل القائم").
 *
 * Lives under admin/lib because both the clients route (after create) and the orders
 * route (renewal link, and revalidating its own detail page) call it — sibling routes
 * may not import each other's actions.ts directly.
 *
 * The guard reads-then-writes by id rather than `updateMany({ where: { clientId: null } })`
 * (measured live, PAY-E3): Prisma's MongoDB connector does not match `clientId: null` — in
 * any of its equals/NOT forms — against a document where the field was simply never set,
 * which every order from checkout is (clientId is never in the create() data). That filter
 * silently updated zero rows on every real order. A staff double-click racing this read is
 * a negligible risk here — unlike PAY-E2's money-confirming guard, re-linking the same
 * order to the same client twice changes nothing.
 */
export async function linkOrderToClient(orderId: string, clientId: string): Promise<void> {
  const session = await auth();
  if (!(session?.user as { id?: string } | undefined)?.id) throw new Error("غير مصرح");

  const [client, order] = await Promise.all([
    db.client.findUnique({ where: { id: clientId }, select: { id: true } }),
    db.checkoutOrder.findUnique({ where: { id: orderId }, select: { id: true, clientId: true } }),
  ]);
  if (!client) throw new Error("العميل غير موجود");
  if (!order) throw new Error("الطلب غير موجود");
  if (order.clientId) throw new Error("الطلب مربوط بعميل مسبقاً");

  await db.checkoutOrder.update({ where: { id: orderId }, data: { clientId } });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/clients");
}
