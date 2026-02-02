import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env file manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "../.env");

try {
  const envFile = readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
      process.env[key.trim()] = value;
    }
  });
} catch (error) {
  console.warn("Warning: Could not load .env file:", error);
}

const prisma = new PrismaClient();

async function migrateScheduledArticles() {
  try {
    console.log("=== Migrating SCHEDULED Articles ===\n");

    // Update articles with SCHEDULED status to DRAFT
    // Using raw MongoDB query since Prisma can't handle SCHEDULED anymore
    const result = await prisma.$runCommandRaw({
      update: "articles",
      updates: [
        {
          q: { status: "SCHEDULED" },
          u: { $set: { status: "DRAFT" } },
          multi: true,
        },
      ],
    });

    const modifiedCount = (result as any).nModified || 0;
    const matchedCount = (result as any).nMatched || 0;

    console.log(`✅ Migrated ${modifiedCount} articles from SCHEDULED to DRAFT`);
    console.log(`   Total matched: ${matchedCount}`);

    if (modifiedCount > 0) {
      console.log("\n⚠️  Note: These articles have been changed to DRAFT status.");
      console.log("   Review them and publish manually if needed.");
    } else {
      console.log("\n✅ No articles with SCHEDULED status found.");
    }
  } catch (error) {
    console.error("\n❌ Error migrating articles:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateScheduledArticles();
