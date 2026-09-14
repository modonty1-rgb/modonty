import { db } from "../lib/db";
async function run() {
  const order = await db.checkoutOrder.findUnique({ where: { id: "6aa4484bcc11f2cea389cad6" }, select: { clientId: true, status: true, number: true } });
  console.log("order:", JSON.stringify(order));
  if (order?.clientId) {
    const client = await db.client.findUnique({ where: { id: order.clientId }, select: { id: true, name: true, email: true, subscriptionTier: true, subscriptionStatus: true, articlesPerMonth: true } });
    console.log("linked client:", JSON.stringify(client));
  }
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
