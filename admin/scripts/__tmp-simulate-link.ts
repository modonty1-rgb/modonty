import { db } from "../lib/db";
async function run() {
  const orderId = "6aa4484bcc11f2cea389cad6";
  const clientId = "6aa448c567fad58d279788d8";
  const client = await db.client.findUnique({ where: { id: clientId }, select: { id: true } });
  console.log("client found:", !!client);
  const { count } = await db.checkoutOrder.updateMany({ where: { id: orderId, clientId: null }, data: { clientId } });
  console.log("updateMany count:", count);
  const order = await db.checkoutOrder.findUnique({ where: { id: orderId }, select: { clientId: true } });
  console.log("order.clientId now:", order?.clientId);
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
