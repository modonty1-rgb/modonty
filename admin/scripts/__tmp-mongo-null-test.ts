import { db } from "../lib/db";
async function run() {
  const orderId = "6aa4484bcc11f2cea389cad6";
  const byIdOnly = await db.checkoutOrder.findMany({ where: { id: orderId } });
  console.log("byIdOnly count:", byIdOnly.length, "clientId field:", JSON.stringify(byIdOnly[0]?.clientId));
  const byIdAndNull = await db.checkoutOrder.findMany({ where: { id: orderId, clientId: null } });
  console.log("byIdAndNull count:", byIdAndNull.length);
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
