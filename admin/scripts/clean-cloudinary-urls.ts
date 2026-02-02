/**
 * Database Migration Script: Clean Cloudinary URLs
 * 
 * This script removes transformation parameters from Cloudinary URLs stored in the database.
 * Transformations will now be handled by next-cloudinary (CldImage) on the frontend
 * for optimal responsive image delivery.
 * 
 * What it does:
 * - Finds all Media records with Cloudinary URLs
 * - Removes transformation parameters (f_auto, q_auto, dpr_auto, c_limit, etc.)
 * - Updates the database with clean URLs
 * 
 * Run with: pnpm tsx admin/scripts/clean-cloudinary-urls.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function cleanCloudinaryUrl(url: string): string {
  if (!url.includes("cloudinary.com")) {
    return url;
  }

  try {
    const urlParts = url.split("/upload/");
    if (urlParts.length !== 2) {
      return url;
    }

    const baseUrl = urlParts[0];
    const pathAfterUpload = urlParts[1];

    const segments = pathAfterUpload.split("/");
    const cleanSegments: string[] = [];

    for (const segment of segments) {
      // Skip transformation parameters (contain commas or underscore prefixes like f_auto, q_auto, w_500)
      if (segment.includes(",") || segment.match(/^[a-z]_/)) {
        continue;
      }
      cleanSegments.push(segment);
    }

    const cleanUrl = `${baseUrl}/upload/${cleanSegments.join("/")}`;
    return cleanUrl;
  } catch (error) {
    console.error("Error cleaning URL:", url, error);
    return url;
  }
}

async function main() {
  console.log("🔍 Finding Media records with Cloudinary URLs...\n");

  const mediaRecords = await prisma.media.findMany({
    where: {
      url: {
        contains: "cloudinary.com",
      },
    },
  });

  console.log(`✅ Found ${mediaRecords.length} Cloudinary media records\n`);

  if (mediaRecords.length === 0) {
    console.log("✅ No records to update");
    return;
  }

  let updatedCount = 0;
  let skippedCount = 0;

  for (const media of mediaRecords) {
    const cleanUrl = cleanCloudinaryUrl(media.url);

    if (cleanUrl !== media.url) {
      await prisma.media.update({
        where: { id: media.id },
        data: { url: cleanUrl },
      });

      console.log(`✅ Updated: ${media.filename}`);
      console.log(`   Before: ${media.url}`);
      console.log(`   After:  ${cleanUrl}\n`);
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log("\n📊 Migration Summary:");
  console.log(`   Total records: ${mediaRecords.length}`);
  console.log(`   ✅ Updated: ${updatedCount}`);
  console.log(`   ⏭️  Skipped (already clean): ${skippedCount}`);
  console.log("\n✅ Migration complete!");
}

main()
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
