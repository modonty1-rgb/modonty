/**
 * Backfill `singletonKey: "global"` on every Settings doc that's missing the field.
 * Then delete duplicates (keeps oldest, which becomes THE canonical singleton).
 *
 * Why raw MongoClient? Prisma's @default("global") returns "global" on READ
 * even when the field is missing in BSON — so a Prisma update with conditional
 * "if singletonKey !== 'global' update" is a no-op. The field stays missing in
 * actual BSON, findUnique({where: singletonKey:"global"}) returns null,
 * race condition resumes.
 *
 * This script uses raw $set so MongoDB stores the field in BSON for real.
 */
import dotenv from "dotenv";
import path from "path";
import { MongoClient } from "mongodb";

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env.shared") });

const url = process.env.DATABASE_URL;
if (!url) { console.error("❌ no DATABASE_URL"); process.exit(1); }

console.log(`🌐 Target: ${url.replace(/:[^:@/]+@/, ":***@")}\n`);

async function run() {
  const client = new MongoClient(url!);
  await client.connect();
  const db = client.db();
  const settings = db.collection("settings");

  // 1. Find all docs (sorted by _id asc → oldest first)
  const all = await settings.find({}).sort({ _id: 1 }).toArray();
  console.log(`📊 ${all.length} doc(s) found`);

  if (all.length === 0) {
    console.log("⚠️  empty collection — nothing to do");
    await client.close();
    return;
  }

  const keeper = all[0];
  const duplicates = all.slice(1);

  // 2. Delete duplicates FIRST — they hold the "global" key and would
  //    block the keeper's backfill via the unique index.
  if (duplicates.length > 0) {
    console.log(`\n🗑️  Deleting ${duplicates.length} duplicate(s) first:`);
    for (const dup of duplicates) {
      await settings.deleteOne({ _id: dup._id });
      console.log(`   ✗ deleted _id=${dup._id}`);
    }
  } else {
    console.log("\n🎉 no duplicates");
  }

  // 3. Now backfill the keeper (oldest) with raw $set
  const keeperHasField = "singletonKey" in keeper;
  console.log(`\n✅ Keeper: _id=${keeper._id}  has(singletonKey)=${keeperHasField}`);

  if (!keeperHasField) {
    console.log("   → BACKFILLING via raw $set...");
    const res = await settings.updateOne(
      { _id: keeper._id },
      { $set: { singletonKey: "global" } }
    );
    console.log(`   → modifiedCount=${res.modifiedCount}`);
  } else {
    console.log("   → already has field, no backfill needed");
  }

  // 4. Verify final state
  const finalDocs = await settings.find({}).toArray();
  console.log(`\n📊 Final: ${finalDocs.length} doc(s)`);
  finalDocs.forEach(d => {
    console.log(`  · _id=${d._id}  singletonKey=${JSON.stringify(d.singletonKey)}  has(field)=${"singletonKey" in d}`);
  });

  await client.close();
}

run().catch(e => { console.error(e); process.exit(1); });
