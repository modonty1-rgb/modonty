/**
 * Reset all articles to WRITING status — for testing the workflow flow.
 *
 * Safe operation: clears scheduledAt + datePublished + sets status to WRITING.
 * Does NOT delete articles, content, or any other data.
 *
 * IMPORTANT: this script only runs against modonty_dev (verified via .env.shared).
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env.shared (root) where DATABASE_URL lives
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sharedEnvPath = resolve(__dirname, "../../.env.shared");
try {
  const envFile = readFileSync(sharedEnvPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    if (line.trim().startsWith("#") || !line.includes("=")) return;
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
      // Force override — .env.shared is the source of truth for DB connection
      process.env[key.trim()] = value;
    }
  });
} catch {
  // .env.shared not found — fall back to whatever the runtime provides
}

const db = new PrismaClient();

async function main() {
  // Safety check — verify we're NOT pointing at production
  const dbUrl = process.env.DATABASE_URL ?? "";
  if (!dbUrl.includes("modonty_dev")) {
    console.error("❌ ABORT — DATABASE_URL does not contain 'modonty_dev'");
    // Extract DB name from URL for clarity (URL format: mongodb+srv://.../<dbname>?...)
    const dbName = dbUrl.match(/\.net\/([^?]+)/)?.[1] ?? "(unknown)";
    console.error(`   DB name: ${dbName}`);
    console.error("   This script only runs against the DEV database.");
    process.exit(1);
  }

  console.log("✅ DB verified: modonty_dev");
  console.log("");

  // Snapshot current state
  const before = await db.article.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  console.log("📊 Current article distribution:");
  for (const row of before) {
    console.log(`   ${row.status.padEnd(20)} ${row._count._all}`);
  }
  const total = before.reduce((s, r) => s + r._count._all, 0);
  console.log(`   ${"TOTAL".padEnd(20)} ${total}`);
  console.log("");

  // Reset all non-WRITING articles to WRITING
  const result = await db.article.updateMany({
    where: { status: { not: "WRITING" } },
    data: {
      status: "WRITING",
      scheduledAt: null,
      datePublished: null,
    },
  });

  console.log(`✅ Reset ${result.count} article(s) to WRITING status.`);
  console.log("   - Cleared scheduledAt");
  console.log("   - Cleared datePublished");
  console.log("");

  // Snapshot final state
  const after = await db.article.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  console.log("📊 New article distribution:");
  for (const row of after) {
    console.log(`   ${row.status.padEnd(20)} ${row._count._all}`);
  }
  console.log("");
  console.log("Done. Ready to test the workflow flow from WRITING → DRAFT → APPROVAL → ...");
}

main()
  .catch((e) => {
    console.error("❌ Script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
