// READ-ONLY one-shot: verify no Client has subscriptionStatus CANCELLED before the enum rename.
import { db } from "@/lib/db";

async function main() {
  // Golden rule: surface the resolved DB URL before any read.
  const url = process.env.DATABASE_URL || "(unset)";
  console.log("DATABASE_URL:", url.replace(/\/\/[^@]*@/, "//***@"));

  const grouped = await db.client.groupBy({
    by: ["subscriptionStatus"],
    _count: { _all: true },
  });
  console.log("Clients by subscriptionStatus:");
  for (const g of grouped) {
    console.log(`  ${g.subscriptionStatus}: ${g._count._all}`);
  }

  const cancelled = grouped.find((g) => g.subscriptionStatus === "CANCELLED")?._count._all ?? 0;
  console.log(`\nCANCELLED count = ${cancelled} → ${cancelled === 0 ? "SAFE to rename" : "MUST migrate first"}`);
}

main().finally(() => process.exit(0));
