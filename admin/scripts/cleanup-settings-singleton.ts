/**
 * One-shot cleanup for Settings duplicate-doc historical race.
 *
 * Usage (DEV):
 *   pnpm tsx scripts/cleanup-settings-singleton.ts
 *
 * Usage (PROD):
 *   DATABASE_URL="mongodb+srv://..." pnpm tsx scripts/cleanup-settings-singleton.ts --prod
 *
 * Behavior:
 *   - Lists ALL Settings docs sorted by id (oldest first).
 *   - Keeps the OLDEST doc (canonical) and sets singletonKey="global" on it.
 *   - Deletes every other Settings doc.
 *   - Prints before/after summary.
 *
 * Idempotent: safe to run multiple times.
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

const isProd = process.argv.includes("--prod");

if (!isProd) {
  dotenv.config({ path: path.join(__dirname, "../.env.local") });
  dotenv.config({ path: path.join(__dirname, "../../.env.shared") });
  dotenv.config({ path: path.join(__dirname, "../.env") });
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL missing — set it via .env.local (DEV) or inline (PROD)");
  process.exit(1);
}

console.log(`🌐 Target: ${dbUrl.replace(/:[^:@/]+@/, ":***@")}`);

const db = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function run() {
  const all = await db.settings.findMany({
    orderBy: { id: "asc" },
    select: { id: true, singletonKey: true, siteUrl: true, siteName: true },
  });

  console.log(`\n📊 Found ${all.length} Settings doc(s):`);
  all.forEach((s, i) => {
    console.log(`  ${i + 1}. _id=${s.id}  singletonKey=${s.singletonKey ?? "(unset)"}  siteUrl=${s.siteUrl ?? "(empty)"}  siteName=${s.siteName ?? "(empty)"}`);
  });

  if (all.length === 0) {
    console.log("\n⚠️  No Settings doc found. Nothing to clean. Run getAllSettings() from admin UI to seed.");
    return;
  }

  const [keeper, ...duplicates] = all;
  console.log(`\n✅ Keeper: _id=${keeper.id}`);

  if (keeper.singletonKey !== "global") {
    await db.settings.update({
      where: { id: keeper.id },
      data: { singletonKey: "global" },
    });
    console.log(`   → set singletonKey="global"`);
  } else {
    console.log(`   → already has singletonKey="global"`);
  }

  if (duplicates.length === 0) {
    console.log(`\n🎉 No duplicates. DB is already singleton-clean.`);
    return;
  }

  console.log(`\n🗑️  Deleting ${duplicates.length} duplicate(s):`);
  for (const dup of duplicates) {
    await db.settings.delete({ where: { id: dup.id } });
    console.log(`   ✗ deleted _id=${dup.id}`);
  }

  const after = await db.settings.count();
  console.log(`\n✅ DONE. Settings doc count: ${after} (expected 1).`);
}

run()
  .catch((e) => {
    console.error("\n❌ Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
