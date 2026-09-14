import { db } from "../lib/db";
async function run() {
  const clients = await db.client.findMany({ where: { OR: [{ name: "منشأة اختبار" }, { slug: { contains: "اختبار" } }, { email: "seed-test-order-paid@example.test" }] }, select: { id: true, name: true, slug: true, email: true, subscriptionStatus: true, createdAt: true } });
  console.log(JSON.stringify(clients, null, 2));
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
