import { db } from "../lib/db";
async function run() {
  const order = await db.checkoutOrder.findUnique({ where: { id: "6aa452c75ec300f43d69d65d" }, select: { clientId: true } });
  console.log("order.clientId:", order?.clientId);
  if (order?.clientId) {
    const client = await db.client.findUnique({ where: { id: order.clientId }, select: { name: true, subscriptionTier: true, subscriptionStatus: true, openingBalance: true } });
    console.log("client:", JSON.stringify(client));
  }
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
