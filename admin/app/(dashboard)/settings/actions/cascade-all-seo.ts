"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

/**
 * Cascade SEO regeneration to ALL entities after settings change.
 * Settings values (siteName, siteUrl, twitterCard, etc.) are used in
 * every entity's JSON-LD and metadata — so changing them requires
 * regenerating everything.
 *
 * Runs in background — doesn't block the settings save response.
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

  // 2. Clients — regenerate all
  const { regenerateClientJsonLd } = await import(
    "@/app/(dashboard)/clients/helpers/client-seo-config/client-jsonld-storage"
  );
  const allClients = await db.client.findMany({ select: { id: true } });
  let clientSuccess = 0;
  for (const client of allClients) {
    const result = await regenerateClientJsonLd(client.id).catch(() => ({ success: false }));
    if (result.success) clientSuccess++;
  }

  // 3. Articles — regenerate all JSON-LD + metadata
  const { generateAndSaveJsonLd } = await import("@/lib/seo/jsonld-storage");
  const { generateAndSaveNextjsMetadata } = await import("@/lib/seo/metadata-storage");
  const allArticles = await db.article.findMany({ select: { id: true } });
  let articleSuccess = 0;
  for (const article of allArticles) {
    try {
      await generateAndSaveJsonLd(article.id);
      await generateAndSaveNextjsMetadata(article.id);
      articleSuccess++;
    } catch {
      // Continue with next article
    }
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

  return {
    articles: { total: allArticles.length, successful: articleSuccess },
    clients: { total: allClients.length, successful: clientSuccess },
    categories: { total: categories.total, successful: categories.successful },
    tags: { total: tags.total, successful: tags.successful },
    industries: { total: industries.total, successful: industries.successful },
    listings: listingsOk,
  };
}
