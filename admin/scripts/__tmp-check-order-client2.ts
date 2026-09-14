import { db } from "../lib/db";
async function run() {
  const order = await db.checkoutOrder.findUnique({ where: { id: "6aa4484bcc11f2cea389cad6" }, select: { clientId: true, status: true } });
  console.log("order:", JSON.stringify(order));
  if (order?.clientId) {
    const client = await db.client.findUnique({ where: { id: order.clientId }, select: { id: true, name: true, subscriptionTier: true, subscriptionStatus: true, articlesPerMonth: true, openingBalance: true, industryId: true, salesRepId: true } });
    console.log("client:", JSON.stringify(client));
  } else {
    const client = await db.client.findFirst({ where: { email: "seed-test-order-paid@example.test" }, select: { id: true, name: true, subscriptionTier: true, subscriptionStatus: true } });
    console.log("client by email (unlinked?):", JSON.stringify(client));
  }
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
