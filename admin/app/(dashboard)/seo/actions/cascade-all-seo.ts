"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

// Safe under Prisma MongoDB default connection pool (num_cpus × 2 + 1 ≈ 3-5 on Vercel).
const CONCURRENCY = 5;

/**
 * Cascade SEO regeneration to ALL entities after settings change.
 * Settings values (siteName, siteUrl, twitterCard, etc.) are used in
 * every entity's JSON-LD and metadata — so changing them requires
 * regenerating everything.
 *
 * Runs in background via `after()` — doesn't block the settings save response.
 */
export async function cascadeSettingsToAllEntities(): Promise<{
  articles: { total: number; successful: number };
  clients: { total: number; successful: number };
  categories: { total: number; successful: number };
  tags: { total: number; successful: number };
  industries: { total: number; successful: number };
  listings: boolean;
}> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const t0 = Date.now();
  console.log("[cascade] start");

  // 1. Categories, Tags, Industries — batch regenerate
  const [
    { batchGenerateCategorySeo },
    { batchGenerateTagSeo },
    { batchGenerateIndustrySeo },
  ] = await Promise.all([
    import("@/lib/seo/category-seo-generator"),
    import("@/lib/seo/tag-seo-generator"),
    import("@/lib/seo/industry-seo-generator"),
  ]);

  const [categories, tags, industries] = await Promise.all([
    batchGenerateCategorySeo(),
    batchGenerateTagSeo(),
    batchGenerateIndustrySeo(),
  ]);

  // 2. Clients — regenerate in parallel chunks of 5 (safe under Prisma MongoDB default pool).
  // Uses the SHARED bundle path (generateClientSEO) so image licensing + metaTags + JSON-LD
  // stay identical to the per-client save — no divergence between cascade and single-save.
  const { generateClientSEO } = await import(
    "@/app/(dashboard)/clients/actions/clients-actions/generate-client-seo"
  );
  const allClients = await db.client.findMany({ select: { id: true } });
  let clientSuccess = 0;
  for (let i = 0; i < allClients.length; i += CONCURRENCY) {
    const chunk = allClients.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map((c) => generateClientSEO(c.id).catch(() => ({ success: false }))),
    );
    clientSuccess += results.filter((r) => r.success).length;
  }

  // 3. Articles — regenerate JSON-LD + metadata in parallel chunks of 5
  const { generateAndSaveJsonLd } = await import("@/lib/seo/jsonld-storage");
  const { generateAndSaveNextjsMetadata } = await import("@/lib/seo/metadata-storage");
  const allArticles = await db.article.findMany({ select: { id: true } });
  let articleSuccess = 0;
  for (let i = 0; i < allArticles.length; i += CONCURRENCY) {
    const chunk = allArticles.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map(async (a) => {
        try {
          await generateAndSaveJsonLd(a.id);
          await generateAndSaveNextjsMetadata(a.id);
          return true;
        } catch {
          return false;
        }
      }),
    );
    articleSuccess += results.filter(Boolean).length;
  }

  // 4. Listing pages — regenerate all
  let listingsOk = false;
  try {
    const { regenerateAllListingCaches } = await import("@/lib/seo/listing-page-seo-generator");
    await regenerateAllListingCaches();
    listingsOk = true;
  } catch {
    // Non-critical
  }

  // 5. Revalidate all public site tags
  await Promise.all([
    revalidateModontyTag("articles"),
    revalidateModontyTag("clients"),
    revalidateModontyTag("categories"),
    revalidateModontyTag("tags"),
    revalidateModontyTag("industries"),
    revalidateModontyTag("settings"),
  ]);

  console.log(
    `[cascade] done in ${Math.round((Date.now() - t0) / 1000)}s — articles ${articleSuccess}/${allArticles.length}, clients ${clientSuccess}/${allClients.length}`,
  );

  return {
    articles: { total: allArticles.length, successful: articleSuccess },
    clients: { total: allClients.length, successful: clientSuccess },
    categories: { total: categories.total, successful: categories.successful },
    tags: { total: tags.total, successful: tags.successful },
    industries: { total: industries.total, successful: industries.successful },
    listings: listingsOk,
  };
}
