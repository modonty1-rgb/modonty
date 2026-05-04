/**
 * One-shot test fix: clean the SEO test article's slug — remove invalid `؟` chars.
 * Used during live test of the validator's fix-then-revalidate loop.
 * Safe — only updates one specific article, only the slug field.
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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
      process.env[key.trim()] = value;
    }
  });
} catch {
  // ignore
}

const ARTICLE_ID = "69d6830820251ee8497527b4";
const db = new PrismaClient();

async function main() {
  if (!(process.env.DATABASE_URL ?? "").includes("modonty_dev")) {
    console.error("❌ ABORT — DB is not modonty_dev");
    process.exit(1);
  }

  const before = await db.article.findUnique({
    where: { id: ARTICLE_ID },
    select: { slug: true, status: true },
  });
  if (!before) {
    console.error("❌ Article not found");
    process.exit(1);
  }

  console.log(`Before:  slug = ${before.slug}`);
  console.log(`         status = ${before.status}`);

  const cleanSlug = before.slug.replace(/؟/g, "");
  if (cleanSlug === before.slug) {
    console.log("✅ Slug already clean — no change");
    return;
  }

  await db.article.update({
    where: { id: ARTICLE_ID },
    data: {
      slug: cleanSlug,
      // Also fix canonical to match the article URL exactly (or null to auto-generate)
      canonicalUrl: null,
    },
  });

  const after = await db.article.findUnique({
    where: { id: ARTICLE_ID },
    select: { slug: true, canonicalUrl: true },
  });
  console.log(`After:   slug = ${after?.slug}`);
  console.log(`         canonicalUrl = ${after?.canonicalUrl}`);
  console.log("✅ Slug cleaned + canonicalUrl reset for auto-generation");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
