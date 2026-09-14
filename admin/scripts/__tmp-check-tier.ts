import { db } from "../lib/db";
async function run() {
  const tiers = await db.subscriptionTierConfig.findMany({ select: { tier: true, name: true, isActive: true, price: true } });
  console.log("tierConfigs:", JSON.stringify(tiers, null, 2));
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
