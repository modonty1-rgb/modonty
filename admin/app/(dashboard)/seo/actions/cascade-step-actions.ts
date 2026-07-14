"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

/**
 * T1.8 — Client-driven cascade with per-step UI feedback.
 *
 * Replaces the fire-and-forget background `cascadeSettingsToAllEntities()`.
 * The settings form calls these actions one at a time and updates a counter
 * after each response, giving the admin a real progress UI:
 *   "Updating articles 6/23…" → "✅ All 23 articles updated"
 */

export async function getCascadeEntities(): Promise<{
  articleIds: string[];
  clientIds: string[];
}> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const [articles, clients] = await Promise.all([
    db.article.findMany({ select: { id: true } }),
    db.client.findMany({ select: { id: true } }),
  ]);
  return {
    articleIds: articles.map((a) => a.id),
    clientIds: clients.map((c) => c.id),
  };
}

export async function regenerateOneArticleCascade(
  articleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const { generateAndSaveJsonLd } = await import("@/lib/seo/jsonld-storage");
    const { generateAndSaveNextjsMetadata } = await import(
      "@/lib/seo/metadata-storage"
    );
    await generateAndSaveJsonLd(articleId);
    await generateAndSaveNextjsMetadata(articleId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Rebuild one client's card through the SAME path a client save uses.
 *
 * It used to call regenerateClientJsonLd, which carries its own hand-written `select` —
 * and that select was missing `openingHoursSpecification` and `priceRange`. So a cascade
 * silently REPLACED every client's card with a poorer one: hours and price gone, because
 * a field you do not select reads as a field the client does not have. Caught on dev
 * before it ever ran in production (2026-07-14).
 *
 * generateClientSEO goes through the shared dataLayer bundle — the one generator, the one
 * select, the one @type rule — so the cascade and a save now produce byte-identical cards.
 */
export async function regenerateOneClientCascade(
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const { generateClientSEO } = await import(
      "@/app/(dashboard)/clients/actions/clients-actions/generate-client-seo"
    );
    const result = await generateClientSEO(clientId);
    return result.success
      ? { success: true }
      : { success: false, error: result.error ?? "Regen returned failure" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function regenerateBulkCategoriesCascade(): Promise<{
  success: boolean;
  total: number;
  successful: number;
}> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  const { batchGenerateCategorySeo } = await import(
    "@/lib/seo/category-seo-generator"
  );
  const r = await batchGenerateCategorySeo();
  return { success: true, total: r.total, successful: r.successful };
}

export async function regenerateBulkTagsCascade(): Promise<{
  success: boolean;
  total: number;
  successful: number;
}> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  const { batchGenerateTagSeo } = await import("@/lib/seo/tag-seo-generator");
  const r = await batchGenerateTagSeo();
  return { success: true, total: r.total, successful: r.successful };
}

export async function regenerateBulkIndustriesCascade(): Promise<{
  success: boolean;
  total: number;
  successful: number;
}> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  const { batchGenerateIndustrySeo } = await import(
    "@/lib/seo/industry-seo-generator"
  );
  const r = await batchGenerateIndustrySeo();
  return { success: true, total: r.total, successful: r.successful };
}

export async function regenerateListingsCascade(): Promise<{
  success: boolean;
}> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  try {
    const { regenerateAllListingCaches } = await import(
      "@/lib/seo/listing-page-seo-generator"
    );
    await regenerateAllListingCaches();
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function finalizeCascadeRevalidation(): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  await Promise.all([
    revalidateModontyTag("articles"),
    revalidateModontyTag("clients"),
    revalidateModontyTag("categories"),
    revalidateModontyTag("tags"),
    revalidateModontyTag("industries"),
    revalidateModontyTag("settings"),
  ]);
}
