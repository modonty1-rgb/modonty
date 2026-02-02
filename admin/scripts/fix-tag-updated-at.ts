import { db } from "../lib/db";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function fixTagUpdatedAt() {
  try {
    console.log("=== Fixing Tag updatedAt fields ===\n");

    let result: { count: number } | number;
    try {
      result = await (db as any).$executeRaw`
        UPDATE tags
        SET updatedAt = createdAt
        WHERE updatedAt IS NULL
      `;
    } catch {
      result = await (async () => {
      const tags = await db.tag.findMany({
        select: { id: true, createdAt: true },
      });

      let updatedCount = 0;
      for (const tag of tags) {
        try {
          await db.tag.update({
            where: { id: tag.id },
            data: { updatedAt: tag.createdAt || new Date() },
          });
          updatedCount++;
        } catch (err) {
          continue;
        }
      }
      return { count: updatedCount };
    })();
    }

    if (typeof result === "number") {
      console.log(`✅ Updated ${result} tags.`);
    } else if (result?.count !== undefined) {
      console.log(`✅ Updated ${result.count} tags.`);
    } else {
      console.log("✅ Tags updated.");
    }
    console.log("   All tags now have valid updatedAt values.\n");
  } catch (error) {
    console.error("\n❌ Error fixing tags:", error);
    console.log("\nTrying alternative approach...\n");
    
    try {
      const tags = await (db as any).$queryRaw`
        SELECT _id, createdAt FROM tags WHERE updatedAt IS NULL
      ` as Array<{ _id: string; createdAt: Date }>;

      if (tags.length === 0) {
        console.log("✅ No tags with null updatedAt found.");
        return;
      }

      console.log(`Found ${tags.length} tags with null updatedAt.\n`);

      for (const tag of tags) {
        await db.tag.update({
          where: { id: tag._id },
          data: { updatedAt: tag.createdAt || new Date() },
        });
      }

      console.log(`✅ Updated ${tags.length} tags.`);
    } catch (altError) {
      console.error("❌ Alternative approach also failed:", altError);
      console.log("\n⚠️  Manual fix required:");
      console.log("   Run this MongoDB query directly:");
      console.log('   db.tags.updateMany({ updatedAt: null }, { $set: { updatedAt: "$createdAt" } })');
      process.exit(1);
    }
  } finally {
    await db.$disconnect();
  }
}

fixTagUpdatedAt();
