import { db } from "../lib/db";

async function main() {
  const c = await db.campaignInterest.findUnique({
    where: { clientId: "69e8927b6a15f350c2158a2e" },
    select: { id: true, reach: true, status: true, createdAt: true },
  });
  console.log("Existing CampaignInterest:", JSON.stringify(c, null, 2));
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
