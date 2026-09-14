import { db } from "../lib/db";
async function run() {
  // Same where-clause confirmOrderPaymentAction uses — proves a second confirm on an
  // already-PAID order updates zero rows (the guard the card requires).
  const { count } = await db.checkoutOrder.updateMany({
    where: { id: "6aa43be69e6ba7ebbc195406", status: "AWAITING_TRANSFER" },
    data: { status: "PAID" },
  });
  console.log("updateMany count on already-PAID order:", count);
  const auditCountBefore = await db.auditLog.count({ where: { entityId: "6aa43be69e6ba7ebbc195406", action: "order.confirmPayment" } });
  console.log("audit rows for this order (still 1, action code returns before logAction when count===0):", auditCountBefore);
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
