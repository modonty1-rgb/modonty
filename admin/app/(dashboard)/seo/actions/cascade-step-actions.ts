"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
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

  // A cascade rebuilds the JSON-LD and metadata of EVERY entity on the platform — the
  // widest single action anyone can take here. Logged once, at the start: the per-entity
  // steps that follow would bury the log in hundreds of identical lines.
  await logAction("seo.cascade", {
    entity: "Seo",
    summary: `إعادة توليد شاملة — ${articles.length} مقالاً و${clients.length} عميلاً`,
    metadata: { articles: articles.length, clients: clients.length },
  });
  return {
    articleIds: articles.map((a) => a.id),
    clientIds: clients.map((c) => c.id),
  };
}

/**
 * Real totals for every phase, fetched once before a run starts so the panel shows
 * "0/14" instead of a meaningless "0/?" while a phase waits its turn.
 */
export async function getCascadeCounts(): Promise<{
  categories: number;
  tags: number;
  industries: number;
  clients: number;
  articles: number;
}> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const [categories, tags, industries, clients, articles] = await Promise.all([
    db.category.count(),
    db.tag.count(),
    db.industry.count(),
    db.client.count(),
    db.article.count(),
  ]);
  return { categories, tags, industries, clients, articles };
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
  successful: number;
  total: number;
}> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  try {
    const { regenerateAllListingCaches } = await import(
      "@/lib/seo/listing-page-seo-generator"
    );
    // One call rebuilds every listing page (home, categories, tags, industries,
    // clients, trending, faq) — report them individually so the panel shows real
    // progress instead of a meaningless 1/1.
    const { results } = await regenerateAllListingCaches();
    const entries = Object.values(results);
    const successful = entries.filter(Boolean).length;
    return { success: successful === entries.length, successful, total: entries.length };
  } catch {
    return { success: false, successful: 0, total: 0 };
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
