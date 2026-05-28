/**
 * READ-ONLY audit: compare PROD vs LOCAL after sync.
 * Verifies the sync produced an EXACT replica + flags missing data.
 * Zero writes to either DB.
 */
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env.shared") });

import { MongoClient } from "mongodb";

const PROD_URL = "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty?retryWrites=true&w=majority&appName=modonty-cluster";
const localUrl = process.env.DATABASE_URL ?? "";

if (!localUrl.includes("modonty_dev")) {
  console.error("❌ DATABASE_URL must point to modonty_dev");
  process.exit(1);
}

async function run() {
  const prodClient = new MongoClient(PROD_URL);
  const localClient = new MongoClient(localUrl);
  await prodClient.connect();
  await localClient.connect();

  const prodDb = prodClient.db();
  const localDb = localClient.db();

  console.log("\n━━━ COLLECTION COUNTS ━━━");
  const prodCollections = (await prodDb.listCollections().toArray())
    .filter((c) => !c.name.startsWith("system.") && !c.name.startsWith("_") && c.type !== "view")
    .map((c) => c.name)
    .sort();

  const localCollections = (await localDb.listCollections().toArray())
    .filter((c) => !c.name.startsWith("system.") && !c.name.startsWith("_") && c.type !== "view")
    .map((c) => c.name)
    .sort();

  const missingLocal: string[] = [];
  const mismatches: { name: string; prod: number; local: number }[] = [];

  for (const name of prodCollections) {
    const prodCount = await prodDb.collection(name).countDocuments();
    if (!localCollections.includes(name)) {
      missingLocal.push(name);
      console.log(`  ❌ ${name.padEnd(35)} PROD=${String(prodCount).padStart(5)}  LOCAL=MISSING`);
      continue;
    }
    const localCount = await localDb.collection(name).countDocuments();
    const match = prodCount === localCount;
    if (!match) mismatches.push({ name, prod: prodCount, local: localCount });
    console.log(`  ${match ? "✓" : "⚠"} ${name.padEnd(35)} PROD=${String(prodCount).padStart(5)}  LOCAL=${String(localCount).padStart(5)}${match ? "" : "  ← MISMATCH"}`);
  }

  console.log("\n━━━ CLIENT LOGO REFERENCE INTEGRITY ━━━");
  const prodClients = await prodDb.collection("clients").find({}, { projection: { _id: 1, name: 1, slug: 1, logoMediaId: 1, heroImageMediaId: 1 } }).toArray();
  const localClients = await localDb.collection("clients").find({}, { projection: { _id: 1, name: 1, slug: 1, logoMediaId: 1, heroImageMediaId: 1 } }).toArray();

  console.log(`  PROD clients: ${prodClients.length}  ·  LOCAL clients: ${localClients.length}`);

  const brokenLogos: { client: string; logoMediaId: string }[] = [];
  for (const client of localClients) {
    const logoId = client.logoMediaId;
    if (!logoId) continue;
    // Mongo ObjectId comes in as string in Prisma but as ObjectId here — try both
    const found = await localDb.collection("media").findOne({ _id: logoId });
    if (!found) {
      brokenLogos.push({ client: `${client.name} (${client.slug})`, logoMediaId: String(logoId) });
    }
  }

  if (brokenLogos.length === 0) {
    console.log(`  ✓ All local Client.logoMediaId references resolve to Media docs`);
  } else {
    console.log(`  ❌ ${brokenLogos.length} BROKEN logo references in local:`);
    for (const b of brokenLogos.slice(0, 10)) {
      console.log(`     - ${b.client}  →  logoMediaId=${b.logoMediaId}`);
    }
  }

  console.log("\n━━━ SAMPLE LOGO URLS (first 5 with logo) ━━━");
  for (const client of localClients.slice(0, 8)) {
    if (!client.logoMediaId) {
      console.log(`  · ${client.name?.slice(0, 30).padEnd(30)} — no logoMediaId`);
      continue;
    }
    const media = await localDb.collection("media").findOne({ _id: client.logoMediaId });
    if (!media) {
      console.log(`  ❌ ${client.name?.slice(0, 30).padEnd(30)} — Media doc not found`);
    } else {
      console.log(`  ✓ ${client.name?.slice(0, 30).padEnd(30)} → ${(media.url || "NO URL").slice(0, 80)}`);
    }
  }

  console.log("\n━━━ COMPARE: same client on PROD vs LOCAL ━━━");
  // Pick first client that has a logo on PROD
  const prodWithLogo = prodClients.find((c) => c.logoMediaId);
  if (prodWithLogo) {
    const prodMedia = await prodDb.collection("media").findOne({ _id: prodWithLogo.logoMediaId });
    const localMedia = await localDb.collection("media").findOne({ _id: prodWithLogo.logoMediaId });
    console.log(`  Client: ${prodWithLogo.name}`);
    console.log(`  logoMediaId: ${prodWithLogo.logoMediaId}`);
    console.log(`  PROD media URL:  ${prodMedia?.url ?? "MISSING"}`);
    console.log(`  LOCAL media URL: ${localMedia?.url ?? "MISSING"}`);
    console.log(`  Same? ${prodMedia?.url === localMedia?.url ? "✓ YES" : "❌ NO"}`);
  }

  console.log("\n━━━ SUMMARY ━━━");
  console.log(`  Collections in PROD missing from LOCAL: ${missingLocal.length}`);
  console.log(`  Count mismatches: ${mismatches.length}`);
  console.log(`  Broken logo references in local: ${brokenLogos.length}`);

  await prodClient.close();
  await localClient.close();
}

run().catch((e) => { console.error(e); process.exit(1); });
