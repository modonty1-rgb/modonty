// One-time script: fix the article with slug='م' (single Arabic char)
// Article title: "ماهى محركات البحث مثل Google؟ ولماذا لاتظهر بعض المواقع فى نتائج البحث؟"
// Run: node scripts/fix-broken-slug.mjs

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  // Find the broken article
  const broken = await db.post.findFirst({
    where: { slug: 'م' },
    select: { id: true, title: true, slug: true },
  });

  if (!broken) {
    console.log('✅ No article with slug="م" found — already fixed or not in DB.');
    return;
  }

  console.log('Found broken article:');
  console.log('  ID   :', broken.id);
  console.log('  Title:', broken.title);
  console.log('  Slug :', broken.slug);

  // Build correct slug from title
  const correctSlug = broken.title
    .toLowerCase()
    .replace(/[؟?!،,]/g, '')        // remove Arabic/Latin punctuation
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '');          // trim leading/trailing hyphens

  console.log('  New slug:', correctSlug);

  // Check uniqueness
  const exists = await db.post.findFirst({
    where: { slug: correctSlug },
    select: { id: true },
  });

  if (exists && exists.id !== broken.id) {
    console.error('❌ Slug collision — another article already has this slug:', correctSlug);
    console.error('   Append -2 or edit manually.');
    return;
  }

  const updated = await db.post.update({
    where: { id: broken.id },
    data: { slug: correctSlug },
    select: { id: true, slug: true },
  });

  console.log('✅ Fixed:', updated);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
