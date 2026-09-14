import { db } from "../lib/db";
async function run() {
  const plans = await db.commercialPlan.findMany({ include: { prices: true }, orderBy: { displayOrder: "asc" } });
  console.log(JSON.stringify(plans, null, 2));
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
