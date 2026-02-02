/**
 * Test script to check if URLs were properly cleaned by migration
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📋 Checking sample Cloudinary URLs from database...\n");

  const sampleMedia = await prisma.media.findMany({
    where: {
      url: {
        contains: "cloudinary.com",
      },
    },
    take: 5,
    select: {
      filename: true,
      url: true,
    },
  });

  console.log(`Found ${sampleMedia.length} sample URLs:\n`);

  sampleMedia.forEach((media, index) => {
    console.log(`${index + 1}. ${media.filename}`);
    console.log(`   URL: ${media.url}`);
    
    // Check if URL has transformations
    const hasTransformations = media.url.includes('/f_auto') || 
                               media.url.includes('/q_auto') || 
                               media.url.includes('/w_');
    
    if (hasTransformations) {
      console.log(`   ⚠️  WARNING: URL still has transformations!\n`);
    } else {
      console.log(`   ✅ Clean URL (no transformations)\n`);
    }
  });
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
