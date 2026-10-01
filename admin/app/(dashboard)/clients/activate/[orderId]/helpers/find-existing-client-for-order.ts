import { db } from "@/lib/db";

/**
 * The account an order belongs to when it is a renewal: a client whose email is the buyer's, or
 * the client his earlier orders are linked to (the email on the account can be edited after
 * activation; the renewal order copies the buyer's email from the previous ORDER —
 * `orders/new?renewFrom=`). Null = a genuinely new buyer, activated as a new account.
 *
 * Why it exists (live test, 30 Sep 2026): activating renewal ORD-2026-00052 was refused
 * («السلَج … مستخدمٌ لعميلٍ آخر»), and the «ربط بالعميل القائم» button had left the order page on
 * 19 Sep without landing anywhere — a paid renewal could never reach its client, so it extended
 * nothing and could not be invoiced.
 */
export async function findExistingClientForOrder(order: { id: string; buyerEmail: string }): Promise<{ id: string; name: string } | null> {
  const email = order.buyerEmail.trim();
  if (!email) return null;
  const byAccount = await db.client.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, name: true },
  });
  if (byAccount) return byAccount;

  const earlier = await db.checkoutOrder.findFirst({
    where: { id: { not: order.id }, buyerEmail: { equals: email, mode: "insensitive" }, clientId: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { clientId: true },
  });
  if (!earlier?.clientId) return null;
  return db.client.findUnique({ where: { id: earlier.clientId }, select: { id: true, name: true } });
}
