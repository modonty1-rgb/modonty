/**
 * Creates the `settings_singletonKey_key` unique index on MongoDB directly.
 * Bypasses `prisma db push` to avoid dropping unrelated TTL indexes.
 * Idempotent: if the index exists, MongoDB returns existing index name.
 *
 * Usage:
 *   DATABASE_URL="...prod..." pnpm tsx admin/scripts/create-singleton-unique-index.ts
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

  // List existing indexes first
  const before = await settings.indexes();
  console.log(`📋 Current indexes (${before.length}):`);
  before.forEach(i => console.log(`  · ${i.name}  unique=${!!i.unique}`));

  const exists = before.some(i => i.name === "settings_singletonKey_key");
  if (exists) {
    console.log("\n✅ settings_singletonKey_key already exists — nothing to do");
  } else {
    console.log("\n🔧 Creating unique index settings_singletonKey_key...");
    const res = await settings.createIndex(
      { singletonKey: 1 },
      { unique: true, name: "settings_singletonKey_key" }
    );
    console.log(`✅ Created: ${res}`);
  }

  const after = await settings.indexes();
  console.log(`\n📋 Final indexes (${after.length}):`);
  after.forEach(i => console.log(`  · ${i.name}  unique=${!!i.unique}`));

  await client.close();
}

run().catch(e => { console.error("❌", e); process.exit(1); });
