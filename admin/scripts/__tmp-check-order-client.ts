import { db } from "../lib/db";
async function run() {
  const order = await db.checkoutOrder.findUnique({ where: { id: "6aa43be49e6ba7ebbc195401" }, select: { clientId: true, status: true } });
  console.log("order:", JSON.stringify(order));
  const client = await db.client.findUnique({ where: { id: "6aa4476467fad58d279788d6" }, select: { id: true, name: true, subscriptionTier: true, subscriptionStatus: true, articlesPerMonth: true, openingBalance: true } });
  console.log("client:", JSON.stringify(client));
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
