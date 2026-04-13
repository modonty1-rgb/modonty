// One-time fix: article with slug='م' (single Arabic char)
// Run from repo root: cd admin && npx tsx ../scripts/fix-broken-slug.ts

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const broken = await db.article.findFirst({
    where: { slug: "م" },
    select: { id: true, title: true, slug: true },
  });

  if (!broken) {
    console.log("✅ No article with slug='م' found — already fixed.");
    return;
  }

  console.log("Found broken article:");
  console.log("  ID   :", broken.id);
  console.log("  Title:", broken.title);
  console.log("  Slug :", broken.slug);

  const correctSlug = (broken.title ?? "")
    .toLowerCase()
    .replace(/[؟?!،,،.]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  console.log("  New slug:", correctSlug);

  const collision = await db.article.findFirst({
    where: { slug: correctSlug, NOT: { id: broken.id } },
    select: { id: true },
  });

  if (collision) {
    console.error("❌ Slug collision — try appending -2");
    return;
  }

  const updated = await db.article.update({
    where: { id: broken.id },
    data: { slug: correctSlug },
    select: { id: true, slug: true },
  });

  console.log("✅ Fixed:", updated);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
