import { db } from "../lib/db";
async function run() {
  const orderId = "6aa4484bcc11f2cea389cad6";
  const clientId = "6aa448c567fad58d279788d8";
  const order = await db.checkoutOrder.findUnique({ where: { id: orderId }, select: { id: true, clientId: true } });
  console.log("before:", JSON.stringify(order));
  if (order?.clientId) { console.log("already linked, skipping"); return; }
  await db.checkoutOrder.update({ where: { id: orderId }, data: { clientId } });
  const after = await db.checkoutOrder.findUnique({ where: { id: orderId }, select: { clientId: true } });
  console.log("after:", JSON.stringify(after));
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
