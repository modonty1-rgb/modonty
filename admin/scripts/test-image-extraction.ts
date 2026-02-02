/**
 * Test script to debug image URL extraction for infinite scroll
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Simulate the extractPublicId function from OptimizedImage component
function extractPublicId(url: string): string | null {
  try {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return null;
    
    const afterUpload = url.substring(uploadIndex + 8);
    const segments = afterUpload.split('/');
    const publicIdParts: string[] = [];
    
    for (const segment of segments) {
      if (segment.match(/^v\d+$/)) continue;
      publicIdParts.push(segment);
    }
    
    let publicId = publicIdParts.join('/');
    publicId = publicId.replace(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i, '');
    
    // Decode URL-encoded characters
    try {
      publicId = decodeURIComponent(publicId);
    } catch (e) {
      console.log('   ⚠️  Failed to decode:', e);
    }
    
    // Check length
    if (publicId.length > 255) {
      return null;
    }
    
    return publicId;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log("📋 Testing image extraction from article data (page 2 - infinite scroll)\n");

  // Get articles like infinite scroll does (page 2)
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    skip: 10, // Page 2 (skip first 10)
    take: 5,  // Get 5 articles
    include: {
      featuredImage: true,
      client: true,
      author: true,
    },
    orderBy: { datePublished: "desc" },
  });

  console.log(`Found ${articles.length} articles from page 2:\n`);

  articles.forEach((article, index) => {
    console.log(`${index + 1}. Article: ${article.title}`);
    
    if (article.featuredImage?.url) {
      const imageUrl = article.featuredImage.url;
      console.log(`   Original URL: ${imageUrl}`);
      
      const publicId = extractPublicId(imageUrl);
      
      if (publicId) {
        console.log(`   ✅ Extracted Public ID: ${publicId}`);
        console.log(`   Length: ${publicId.length} chars`);
      } else {
        console.log(`   ❌ Failed to extract (URL too long or invalid)`);
      }
    } else {
      console.log(`   No featured image`);
    }
    console.log('');
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
