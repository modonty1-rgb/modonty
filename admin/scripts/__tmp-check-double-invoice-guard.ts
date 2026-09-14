import { db } from "../lib/db";
async function run() {
  const order = await db.checkoutOrder.findUnique({ where: { id: "6aa4484bcc11f2cea389cad6" }, select: { invoiceId: true, status: true, clientId: true } });
  console.log("order fresh read:", JSON.stringify(order));
  console.log("would createInvoiceFromOrderAction throw on second call?", !!order?.invoiceId);
  const invoiceCountForOrder = await db.invoice.count({ where: { orderId: "6aa4484bcc11f2cea389cad6" } });
  console.log("invoice rows for this order (should stay 1):", invoiceCountForOrder);
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
