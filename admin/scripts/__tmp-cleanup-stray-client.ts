import { db } from "../lib/db";
async function run() {
  const del = await db.client.deleteMany({ where: { email: { startsWith: "seed-test-order-" } } });
  console.log("deleted stray test clients:", del.count);
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
