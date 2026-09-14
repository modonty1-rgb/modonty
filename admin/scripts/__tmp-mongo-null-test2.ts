import { db } from "../lib/db";
async function run() {
  const orderId = "6aa4484bcc11f2cea389cad6";
  const a = await db.checkoutOrder.findMany({ where: { id: orderId, clientId: { equals: null } } });
  console.log("equals:null count:", a.length);
  const b = await db.checkoutOrder.findMany({ where: { id: orderId, NOT: { clientId: { not: null } } } });
  console.log("NOT-not-null count:", b.length);
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
