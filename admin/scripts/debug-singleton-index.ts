import dotenv from "dotenv";
import path from "path";
import { MongoClient } from "mongodb";

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env.shared") });

const url = process.env.DATABASE_URL;
if (!url) { console.error("❌ no DATABASE_URL"); process.exit(1); }

async function run() {
  const client = new MongoClient(url!);
  await client.connect();
  const db = client.db();
  const settings = db.collection("settings");

  console.log("\n📋 INDEXES on `settings`:");
  const idxs = await settings.indexes();
  idxs.forEach(i => console.log(`  · ${i.name} → key=${JSON.stringify(i.key)}  unique=${!!i.unique}  partial=${!!i.partialFilterExpression}`));

  console.log("\n📊 ALL DOCS (raw BSON):");
  const docs = await settings.find({}).toArray();
  docs.forEach((d, i) => {
    console.log(`  ${i+1}. _id=${d._id}`);
    console.log(`     singletonKey type=${typeof d.singletonKey}  value=${JSON.stringify(d.singletonKey)}`);
    console.log(`     has(singletonKey)=${"singletonKey" in d}`);
    console.log(`     keys count=${Object.keys(d).length}`);
  });

  console.log("\n🧪 TEST: try inserting a 2nd doc with singletonKey='global' DIRECTLY");
  try {
    const res = await settings.insertOne({ singletonKey: "global", testField: "should fail if unique" });
    console.log(`  ⚠️ INSERT SUCCEEDED — index is NOT enforced! _id=${res.insertedId}`);
    await settings.deleteOne({ _id: res.insertedId });
    console.log(`  cleanup: deleted test doc`);
  } catch (e: any) {
    console.log(`  ✅ INSERT BLOCKED by unique index: ${e.code} ${e.message?.slice(0,200)}`);
  }

  await client.close();
}

run().catch(e => { console.error(e); process.exit(1); });
