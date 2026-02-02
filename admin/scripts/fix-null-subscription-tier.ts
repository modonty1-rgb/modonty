import { db } from "../lib/db";
import { SubscriptionTier } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function fixNullSubscriptionTier() {
  try {
    console.log("=== Fixing Clients with null subscriptionTier ===\n");

    // Fetch all clients (Prisma doesn't support filtering null enum values directly)
    const allClients = await db.client.findMany({
      select: {
        id: true,
        name: true,
        subscriptionTier: true,
      },
    });

    // Filter clients with null or undefined subscriptionTier
    const clientsWithNullTier = allClients.filter(
      (client) => client.subscriptionTier === null || client.subscriptionTier === undefined
    );

    if (clientsWithNullTier.length === 0) {
      console.log("✅ No clients with null subscriptionTier found.");
      await db.$disconnect();
      return;
    }

    console.log(`Found ${clientsWithNullTier.length} client(s) with null subscriptionTier:\n`);
    clientsWithNullTier.forEach((client) => {
      console.log(`  - ${client.name} (ID: ${client.id})`);
    });

    console.log("\nUpdating to default tier: BASIC...\n");

    // Update each client individually
    let updatedCount = 0;
    for (const client of clientsWithNullTier) {
      try {
        await db.client.update({
          where: { id: client.id },
          data: {
            subscriptionTier: SubscriptionTier.BASIC,
          },
        });
        console.log(`  ✅ Updated ${client.name}`);
        updatedCount++;
      } catch (error) {
        console.error(`  ⚠️  Failed to update client ${client.name}: ${error}`);
      }
    }

    console.log(`\n✅ Updated ${updatedCount} client(s) to BASIC tier.`);
    console.log("All clients now have valid subscriptionTier values.");

    // Verify no null values remain
    const allClientsAfter = await db.client.findMany({
      select: {
        id: true,
        subscriptionTier: true,
      },
    });

    const remainingNullCount = allClientsAfter.filter(
      (client) => client.subscriptionTier === null || client.subscriptionTier === undefined
    ).length;

    if (remainingNullCount > 0) {
      console.warn(`\n⚠️  Warning: ${remainingNullCount} client(s) still have null subscriptionTier.`);
    } else {
      console.log("\n✅ Verification: All clients have valid subscriptionTier values.");
    }
  } catch (error) {
    console.error("\n❌ Error fixing subscriptionTier:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

fixNullSubscriptionTier();
