import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env.shared") });
dotenv.config({ path: path.join(__dirname, "../.env") });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) { console.error("❌ DATABASE_URL missing"); process.exit(1); }
console.log(`🌐 Target: ${dbUrl.replace(/:[^:@/]+@/, ":***@")}\n`);

const db = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function run() {
  const all = await db.settings.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      singletonKey: true,
      siteUrl: true,
      siteName: true,
      cascadeStatus: true,
      seoTitleMin: true,
      seoTitleMax: true,
    },
  });

  console.log(`📊 Found ${all.length} Settings doc(s):\n`);
  all.forEach((s, i) => {
    const idTail = s.id.slice(-6);
    console.log(`  ${i + 1}. _id ...${idTail}`);
    console.log(`     singletonKey: ${s.singletonKey ?? "(unset)"}`);
    console.log(`     siteUrl:      ${s.siteUrl ?? "(empty)"}`);
    console.log(`     siteName:     ${s.siteName ?? "(empty)"}`);
    console.log(`     seoTitleMin:  ${s.seoTitleMin ?? "(unset)"}  seoTitleMax: ${s.seoTitleMax ?? "(unset)"}`);
    console.log(`     cascadeStatus:${s.cascadeStatus ?? "(unset)"}`);
    console.log();
  });

  if (all.length > 1) {
    console.log("⚠️  More than 1 doc found — that's the bug we're hunting.");
    console.log("    Look at the difference between docs to spot which writer is creating new ones.");
  }
}

run().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
