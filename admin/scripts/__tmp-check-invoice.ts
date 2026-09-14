import { db } from "../lib/db";
async function run() {
  const order = await db.checkoutOrder.findUnique({ where: { id: "6aa4484bcc11f2cea389cad6" }, select: { invoiceId: true, clientId: true } });
  console.log("order:", JSON.stringify(order));
  if (order?.invoiceId) {
    const inv = await db.invoice.findUnique({ where: { id: order.invoiceId } });
    console.log("invoice:", JSON.stringify(inv, null, 2));
  }
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
