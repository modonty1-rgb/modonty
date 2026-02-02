import { db } from "../lib/db";
import * as dotenv from "dotenv";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

dotenv.config({ path: ".env.local" });

/**
 * Normalizes date values to Date objects or null
 * Handles serialization from client-side where Date objects become strings
 */
function normalizeDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  
  if (typeof value === "string") {
    // Handle double-quoted strings (e.g., '"1988-01-14T00:00:00.000Z"')
    const cleanedValue = value.replace(/^["']|["']$/g, "");
    const date = new Date(cleanedValue);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
}

/**
 * Attempts to fetch a client and identify corrupted date fields
 */
async function checkClientDates(clientId: string): Promise<{
  hasCorruptedDates: boolean;
  corruptedFields: string[];
  subscriptionStartDate?: unknown;
  subscriptionEndDate?: unknown;
  foundingDate?: unknown;
}> {
  try {
    // Try to fetch the client - if it succeeds, dates are fine
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        foundingDate: true,
      },
    });

    if (!client) {
      return { hasCorruptedDates: false, corruptedFields: [] };
    }

    // Check if dates are stored as strings (corrupted)
    const corruptedFields: string[] = [];
    
    if (client.subscriptionStartDate && typeof client.subscriptionStartDate === "string") {
      corruptedFields.push("subscriptionStartDate");
    }
    if (client.subscriptionEndDate && typeof client.subscriptionEndDate === "string") {
      corruptedFields.push("subscriptionEndDate");
    }
    if (client.foundingDate && typeof client.foundingDate === "string") {
      corruptedFields.push("foundingDate");
    }

    return {
      hasCorruptedDates: corruptedFields.length > 0,
      corruptedFields,
      subscriptionStartDate: client.subscriptionStartDate,
      subscriptionEndDate: client.subscriptionEndDate,
      foundingDate: client.foundingDate,
    };
  } catch (error) {
    // If we can't fetch due to date conversion error, the dates are corrupted
    if (error instanceof PrismaClientKnownRequestError) {
      const errorMessage = error.message || "";
      if (errorMessage.includes("Failed to convert") && errorMessage.includes("DateTime")) {
        // We can't fetch the client, so we'll need to use raw MongoDB query
        return {
          hasCorruptedDates: true,
          corruptedFields: ["subscriptionStartDate", "subscriptionEndDate", "foundingDate"], // Assume all might be corrupted
        };
      }
    }
    throw error;
  }
}

async function fixSubscriptionDates() {
  try {
    console.log("=== Fixing Clients with corrupted date fields ===\n");

    // Fetch all client IDs
    const allClients = await db.client.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    if (allClients.length === 0) {
      console.log("✅ No clients found.");
      await db.$disconnect();
      return;
    }

    console.log(`Checking ${allClients.length} client(s) for corrupted date fields...\n`);

    const corruptedClients: Array<{
      id: string;
      name: string;
      corruptedFields: string[];
      subscriptionStartDate?: unknown;
      subscriptionEndDate?: unknown;
      foundingDate?: unknown;
    }> = [];

    // Check each client for corrupted dates
    for (const client of allClients) {
      try {
        const checkResult = await checkClientDates(client.id);
        if (checkResult.hasCorruptedDates) {
          corruptedClients.push({
            id: client.id,
            name: client.name,
            corruptedFields: checkResult.corruptedFields,
            subscriptionStartDate: checkResult.subscriptionStartDate,
            subscriptionEndDate: checkResult.subscriptionEndDate,
            foundingDate: checkResult.foundingDate,
          });
        }
      } catch (error) {
        // If checkClientDates throws, likely means dates are corrupted and we can't read them
        console.warn(`  ⚠️  Could not check client ${client.name} (ID: ${client.id}): ${error instanceof Error ? error.message : "Unknown error"}`);
        corruptedClients.push({
          id: client.id,
          name: client.name,
          corruptedFields: ["subscriptionStartDate", "subscriptionEndDate", "foundingDate"], // Assume all might be corrupted
        });
      }
    }

    if (corruptedClients.length === 0) {
      console.log("✅ No clients with corrupted date fields found.");
      await db.$disconnect();
      return;
    }

    console.log(`Found ${corruptedClients.length} client(s) with corrupted date fields:\n`);
    corruptedClients.forEach((client) => {
      console.log(`  - ${client.name} (ID: ${client.id})`);
      console.log(`    Corrupted fields: ${client.corruptedFields.join(", ")}`);
    });

    console.log("\nFixing corrupted date fields...\n");

    // Use MongoDB raw queries to fix corrupted dates
    // Prisma doesn't support this directly, so we'll use $runCommandRaw
    let updatedCount = 0;
    let failedCount = 0;

    for (const client of corruptedClients) {
      try {
        // Build update data with normalized dates
        const updateData: Record<string, Date | null> = {};

        // Normalize dates if they exist
        if (client.corruptedFields.includes("subscriptionStartDate")) {
          updateData.subscriptionStartDate = normalizeDate(client.subscriptionStartDate);
        }
        if (client.corruptedFields.includes("subscriptionEndDate")) {
          updateData.subscriptionEndDate = normalizeDate(client.subscriptionEndDate);
        }
        if (client.corruptedFields.includes("foundingDate")) {
          updateData.foundingDate = normalizeDate(client.foundingDate);
        }

        // Try to update using Prisma first
        // If Prisma fails, we'll need to use raw MongoDB query
        try {
          await db.client.update({
            where: { id: client.id },
            data: updateData,
          });
          console.log(`  ✅ Updated ${client.name}`);
          updatedCount++;
        } catch (updateError) {
          // If update fails, try using MongoDB raw query
          console.warn(`  ⚠️  Prisma update failed for ${client.name}, attempting raw MongoDB update...`);
          
          // Use raw MongoDB update command
          const mongoClient = (db as any).$client || (db as any).client;
          if (mongoClient) {
            const collection = mongoClient.db().collection("clients");
            const rawUpdateData: Record<string, unknown> = {};
            
            for (const [key, value] of Object.entries(updateData)) {
              rawUpdateData[key] = value;
            }

            await collection.updateOne(
              { _id: client.id },
              { $set: rawUpdateData }
            );
            console.log(`  ✅ Updated ${client.name} (via raw query)`);
            updatedCount++;
          } else {
            throw new Error("MongoDB client not available");
          }
        }
      } catch (error) {
        console.error(`  ❌ Failed to fix client ${client.name}: ${error instanceof Error ? error.message : "Unknown error"}`);
        failedCount++;
      }
    }

    console.log(`\n✅ Fixed ${updatedCount} client(s).`);
    if (failedCount > 0) {
      console.warn(`⚠️  Failed to fix ${failedCount} client(s).`);
    }

    // Verify the fix
    console.log("\nVerifying fix...\n");
    let stillCorrupted = 0;
    for (const client of corruptedClients) {
      try {
        const checkResult = await checkClientDates(client.id);
        if (checkResult.hasCorruptedDates) {
          stillCorrupted++;
          console.warn(`  ⚠️  ${client.name} still has corrupted dates`);
        }
      } catch (error) {
        stillCorrupted++;
        console.warn(`  ⚠️  ${client.name} still has corrupted dates (could not verify)`);
      }
    }

    if (stillCorrupted > 0) {
      console.warn(`\n⚠️  Warning: ${stillCorrupted} client(s) still have corrupted date fields.`);
      console.warn("   Manual intervention may be required.");
    } else {
      console.log("\n✅ Verification: All date fields have been fixed.");
    }
  } catch (error) {
    console.error("\n❌ Error fixing date fields:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

fixSubscriptionDates();
