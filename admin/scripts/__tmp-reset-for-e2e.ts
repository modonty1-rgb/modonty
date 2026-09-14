import { db } from "../lib/db";
async function run() {
  await db.checkoutOrder.update({ where: { id: "6aa4484bcc11f2cea389cad6" }, data: { clientId: null } });
  const del = await db.client.deleteMany({ where: { email: "seed-test-order-paid@example.test" } });
  console.log("reset order, deleted clients:", del.count);
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
