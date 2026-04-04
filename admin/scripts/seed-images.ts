/**
 * Seed Images Script
 * Downloads real stock images and uploads them to Cloudinary under "seed-data/" folder
 * Then updates the Media records in the database with real URLs
 *
 * Run: pnpm tsx admin/scripts/seed-images.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// ─── Cloudinary Config (from .env) ───
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfegnpgwx";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "modonty";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// ─── Seed Images: free stock from picsum.photos + loremflickr ───
// Each image has a purpose, size, and search query for realistic content
const SEED_IMAGES = [
  {
    name: "nova-logo",
    filename: "nova-logo.png",
    altText: "شعار متجر نوفا للإلكترونيات",
    type: "LOGO" as const,
    width: 400,
    height: 400,
    // Solid color placeholder via Cloudinary itself (no external download needed)
    sourceUrl: "https://placehold.co/400x400/1e3a5f/ffffff/png?text=NOVA",
    folder: "seed-data/logos",
  },
  {
    name: "balsam-logo",
    filename: "balsam-logo.png",
    altText: "شعار عيادات بلسم الطبية",
    type: "LOGO" as const,
    width: 400,
    height: 400,
    sourceUrl: "https://placehold.co/400x400/0d7377/ffffff/png?text=BALSAM",
    folder: "seed-data/logos",
  },
  {
    name: "future-logo",
    filename: "future-logo.png",
    altText: "شعار أكاديمية المستقبل",
    type: "LOGO" as const,
    width: 400,
    height: 400,
    sourceUrl: "https://placehold.co/400x400/5b21b6/ffffff/png?text=FUTURE",
    folder: "seed-data/logos",
  },
  {
    name: "seo-guide-og",
    filename: "seo-guide-og.jpg",
    altText: "دليل SEO المتاجر الإلكترونية 2025",
    type: "OGIMAGE" as const,
    width: 1200,
    height: 630,
    sourceUrl: "https://picsum.photos/1200/630?random=1",
    folder: "seed-data/articles",
  },
  {
    name: "ai-healthcare-og",
    filename: "ai-healthcare-og.jpg",
    altText: "الذكاء الاصطناعي في الرعاية الصحية",
    type: "OGIMAGE" as const,
    width: 1200,
    height: 630,
    sourceUrl: "https://picsum.photos/1200/630?random=2",
    folder: "seed-data/articles",
  },
  {
    name: "ecommerce-gallery-1",
    filename: "ecommerce-gallery-1.jpg",
    altText: "إحصائيات التجارة الإلكترونية في السعودية 2025",
    type: "POST" as const,
    width: 800,
    height: 600,
    sourceUrl: "https://picsum.photos/800/600?random=3",
    folder: "seed-data/articles",
  },
  // Extra images for client OG images
  {
    name: "nova-og",
    filename: "nova-og.jpg",
    altText: "متجر نوفا للإلكترونيات — أحدث الأجهزة",
    type: "OGIMAGE" as const,
    width: 1200,
    height: 630,
    sourceUrl: "https://picsum.photos/1200/630?random=4",
    folder: "seed-data/clients",
  },
  {
    name: "balsam-og",
    filename: "balsam-og.jpg",
    altText: "عيادات بلسم الطبية — رعاية صحية متميزة",
    type: "OGIMAGE" as const,
    width: 1200,
    height: 630,
    sourceUrl: "https://picsum.photos/1200/630?random=5",
    folder: "seed-data/clients",
  },
  {
    name: "future-og",
    filename: "future-og.jpg",
    altText: "أكاديمية المستقبل — دورات احترافية",
    type: "OGIMAGE" as const,
    width: 1200,
    height: 630,
    sourceUrl: "https://picsum.photos/1200/630?random=6",
    folder: "seed-data/clients",
  },
  // Author avatars
  {
    name: "author-ahmed",
    filename: "author-ahmed.jpg",
    altText: "م. أحمد الشهري — خبير SEO",
    type: "GENERAL" as const,
    width: 300,
    height: 300,
    sourceUrl: "https://picsum.photos/300/300?random=7",
    folder: "seed-data/authors",
  },
  {
    name: "author-noura",
    filename: "author-noura.jpg",
    altText: "أ. نورة القحطاني — كاتبة محتوى",
    type: "GENERAL" as const,
    width: 300,
    height: 300,
    sourceUrl: "https://picsum.photos/300/300?random=8",
    folder: "seed-data/authors",
  },
];

// ─── Upload to Cloudinary via unsigned upload ───
async function uploadToCloudinary(
  sourceUrl: string,
  publicId: string,
  folder: string
): Promise<{
  secure_url: string;
  public_id: string;
  version: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}> {
  const formData = new FormData();
  formData.append("file", sourceUrl);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("public_id", publicId);
  formData.append("asset_folder", folder);

  const res = await fetch(UPLOAD_URL, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed for ${publicId}: ${err}`);
  }
  return res.json();
}

// ─── Optimize URL (add f_auto,q_auto) ───
function optimizeUrl(url: string): string {
  return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
}

// ─── Main ───
async function main() {
  console.log("🖼️  Seed Images — Upload to Cloudinary + Save to DB\n");
  console.log(`   Cloud: ${CLOUD_NAME}`);
  console.log(`   Preset: ${UPLOAD_PRESET}`);
  console.log(`   Images: ${SEED_IMAGES.length}\n`);

  const results: Array<{
    name: string;
    url: string;
    publicId: string;
    mediaId: string;
  }> = [];

  for (const img of SEED_IMAGES) {
    process.stdout.write(`   ⏳ ${img.name} ...`);
    try {
      // 1. Upload to Cloudinary
      const cloudResult = await uploadToCloudinary(
        img.sourceUrl,
        `seed-data/${img.name}`,
        img.folder
      );

      const optimizedUrl = optimizeUrl(cloudResult.secure_url);

      // 2. Save/update Media record in DB
      const existing = await db.media.findFirst({
        where: { filename: img.filename },
        select: { id: true },
      });

      let mediaId: string;
      const mediaData = {
        filename: img.filename,
        url: optimizedUrl,
        mimeType: img.filename.endsWith(".png") ? "image/png" : "image/jpeg",
        type: img.type,
        altText: img.altText,
        width: cloudResult.width,
        height: cloudResult.height,
        fileSize: cloudResult.bytes,
        cloudinaryPublicId: cloudResult.public_id,
        cloudinaryVersion: String(cloudResult.version),
      };

      if (existing) {
        await db.media.update({ where: { id: existing.id }, data: mediaData });
        mediaId = existing.id;
      } else {
        const created = await db.media.create({ data: mediaData, select: { id: true } });
        mediaId = created.id;
      }

      results.push({
        name: img.name,
        url: optimizedUrl,
        publicId: cloudResult.public_id,
        mediaId,
      });

      console.log(` ✅ ${cloudResult.width}x${cloudResult.height} (${(cloudResult.bytes / 1024).toFixed(1)}KB)`);
    } catch (error) {
      console.log(` ❌ ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // 3. Update Authors with real avatar URLs
  console.log("\n   📝 Updating author avatars...");
  const ahmedImg = results.find(r => r.name === "author-ahmed");
  const nouraImg = results.find(r => r.name === "author-noura");
  if (ahmedImg) {
    await db.author.updateMany({ where: { slug: "ahmed-alshehri" }, data: { image: ahmedImg.url, cloudinaryPublicId: ahmedImg.publicId } });
    console.log("   ✅ ahmed-alshehri avatar updated");
  }
  if (nouraImg) {
    await db.author.updateMany({ where: { slug: "noura-alqahtani" }, data: { image: nouraImg.url, cloudinaryPublicId: nouraImg.publicId } });
    console.log("   ✅ noura-alqahtani avatar updated");
  }

  // 4. Update Clients with OG images
  console.log("\n   📝 Updating client OG images...");
  const clientOgMap: Record<string, string> = {
    "nova-electronics": "nova-og",
    "balsam-medical": "balsam-og",
    "future-academy": "future-og",
  };
  for (const [clientSlug, imgName] of Object.entries(clientOgMap)) {
    const img = results.find(r => r.name === imgName);
    if (img) {
      await db.client.updateMany({
        where: { slug: clientSlug },
        data: { ogImageMediaId: img.mediaId },
      });
      console.log(`   ✅ ${clientSlug} OG image linked`);
    }
  }

  // 5. Update Articles with featured images
  console.log("\n   📝 Updating article featured images...");
  const articleImgMap: Record<string, string> = {
    "seo-guide-ecommerce-2025": "seo-guide-og",
    "ai-healthcare-saudi-2025": "ai-healthcare-og",
  };
  for (const [articleSlug, imgName] of Object.entries(articleImgMap)) {
    const img = results.find(r => r.name === imgName);
    if (img) {
      // Find article by slug (need clientId for compound unique)
      const article = await db.article.findFirst({
        where: { slug: articleSlug },
        select: { id: true },
      });
      if (article) {
        await db.article.update({
          where: { id: article.id },
          data: { featuredImageId: img.mediaId },
        });
        console.log(`   ✅ ${articleSlug} featured image linked`);
      }
    }
  }

  // Summary
  console.log("\n" + "═".repeat(50));
  console.log(`✅ Done! ${results.length}/${SEED_IMAGES.length} images uploaded to Cloudinary`);
  console.log(`   Folder: seed-data/`);
  console.log(`   DB Media records: ${results.length} created/updated`);
  console.log(`   Authors: ${ahmedImg ? 1 : 0} + ${nouraImg ? 1 : 0} avatars linked`);
  console.log(`   Clients: ${Object.keys(clientOgMap).length} OG images linked`);
  console.log(`   Articles: ${Object.keys(articleImgMap).length} featured images linked`);
  console.log("═".repeat(50));

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error("Fatal error:", e);
  await db.$disconnect();
  process.exit(1);
});
