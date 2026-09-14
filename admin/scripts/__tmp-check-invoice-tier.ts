import { db } from "../lib/db";
async function run() {
  const order = await db.checkoutOrder.findUnique({ where: { id: "6aa452c75ec300f43d69d65d" }, select: { invoiceId: true } });
  const inv = await db.invoice.findUnique({ where: { id: order!.invoiceId! }, select: { number: true, tier: true, tierName: true, period: true, paidMonths: true } });
  console.log(JSON.stringify(inv));
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
