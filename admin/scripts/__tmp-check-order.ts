import { db } from "../lib/db";
async function run() {
  const order = await db.checkoutOrder.findUnique({ where: { id: "6aa43be69e6ba7ebbc195406" } });
  console.log(JSON.stringify(order, null, 2));
  const txs = await db.paymentTransaction.findMany({ where: { orderId: "6aa43be69e6ba7ebbc195406" } });
  console.log("transactions:", JSON.stringify(txs, null, 2));
  const logs = await db.auditLog.findMany({ where: { entityId: "6aa43be69e6ba7ebbc195406" } });
  console.log("audit logs:", JSON.stringify(logs, null, 2));
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
