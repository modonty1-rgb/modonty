import { db } from "../lib/db";

async function main() {
  await db.campaignInterest.deleteMany({
    where: { clientId: "69e8927b6a15f350c2158a2e" },
  });
  console.log("Reset done.");
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
