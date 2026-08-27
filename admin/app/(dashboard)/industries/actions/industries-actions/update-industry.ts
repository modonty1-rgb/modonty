"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { industryServerSchema } from "./industry-server-schema";
import { buildTaxonomyCanonical } from "@/lib/seo/build-taxonomy-canonical";

export async function updateIndustry(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    socialImage?: string | null;
    socialImageAlt?: string | null;
    socialImageMediaId?: string | null;
    cloudinaryPublicId?: string | null;
  },
) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = industryServerSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

    const normalizedData = {
      ...data,
      slug: parsed.data.slug,
    };

    // Slug uniqueness check (exclude current)
    const existingSlug = await db.industry.findFirst({ where: { slug: normalizedData.slug, id: { not: id } }, select: { id: true } });
    if (existingSlug) return { success: false, error: "This slug is already in use. Try a different one." };

    const updateData: {
      name: string;
      slug: string;
      description?: string | null;
      seoTitle?: string | null;
      seoDescription?: string | null;
      canonicalUrl?: string | null;
      socialImage?: string | null;
      socialImageAlt?: string | null;
      socialImageMediaId?: string | null;
      cloudinaryPublicId?: string | null;
    } = {
      name: normalizedData.name,
      slug: normalizedData.slug,
      description: normalizedData.description || null,
      seoTitle: normalizedData.seoTitle || null,
      seoDescription: normalizedData.seoDescription || null,
      // Rebuilt from the slug being saved — see build-taxonomy-canonical.
      canonicalUrl: await buildTaxonomyCanonical("industries", normalizedData.slug),
    };

    if (data.socialImage !== undefined) {
      updateData.socialImage = data.socialImage;
    }
    if (data.socialImageAlt !== undefined) {
      updateData.socialImageAlt = data.socialImageAlt;
    }
    if (data.socialImageMediaId !== undefined) {
      updateData.socialImageMediaId = data.socialImageMediaId;
    }
    if (data.cloudinaryPublicId !== undefined) {
      updateData.cloudinaryPublicId = data.cloudinaryPublicId;
    }

    const industry = await db.industry.update({ where: { id }, data: updateData });

    await logAction("industry.update", {
      entity: "Industry",
      entityId: industry.id,
      summary: industry.name,
    });

    revalidatePath("/industries");
    // Regenerate the stored SEO BEFORE revalidating modonty — otherwise the page rebuilds
    // with the stale cached metadata (og:image lags one save behind; caught live 2026-07-31).
    // Both generators RETURN { success, error } and never throw — read the result, or a
    // failed regeneration passes as success and modonty keeps serving the old blob.
    const seoFailures: string[] = [];
    try {
      const { generateAndSaveIndustrySeo } = await import("@/lib/seo/industry-seo-generator");
      const result = await generateAndSaveIndustrySeo(industry.id);
      if (!result.success) seoFailures.push(`سيو المجال: ${result.error || "سبب غير معروف"}`);
    } catch (e) { seoFailures.push(`سيو المجال: ${e instanceof Error ? e.message : String(e)}`); }
    try {
      const { regenerateIndustriesListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      const result = await regenerateIndustriesListingCache();
      if (!result.success) seoFailures.push(`صفحة المجالات: ${result.error || "سبب غير معروف"}`);
    } catch (e) { seoFailures.push(`صفحة المجالات: ${e instanceof Error ? e.message : String(e)}`); }
    if (seoFailures.length > 0) console.error("Industry SEO gen failed:", industry.id, seoFailures.join(" · "));
    else await revalidateModontyTag("industries");

    // Cascade: regenerate SEO for all clients in this industry
    let clientCascadeFailed = 0;
    try {
      const industryClients = await db.client.findMany({
        where: { industryId: industry.id },
        select: { id: true },
      });
      if (industryClients.length > 0) {
        // Shared bundle path — keeps image licensing + metaTags in sync with per-client save.
        const { generateClientSEO } = await import("@/app/(dashboard)/clients/actions/clients-actions/generate-client-seo");
        for (const client of industryClients) {
          // generateClientSEO RETURNS { success, error } — `.catch(() => null)` only ever
          // caught a throw it never makes, so every failed client silently counted as done.
          const result = await generateClientSEO(client.id).catch((e: unknown) => ({
            success: false as const,
            error: e instanceof Error ? e.message : String(e),
          }));
          if (!result.success) clientCascadeFailed++;
        }
        if (clientCascadeFailed > 0) seoFailures.push(`${clientCascadeFailed} شريكاً ما تجدّدت بياناته`);
      }
    } catch (e) {
      clientCascadeFailed = -1;
      seoFailures.push(`شركاء المجال: ${e instanceof Error ? e.message : String(e)}`);
    }

    if (clientCascadeFailed === 0) await revalidateModontyTag("clients");

    return {
      success: true,
      industry,
      seoWarning:
        seoFailures.length > 0
          ? `المجال انحفظ، لكن بيانات السيو ما تجدّدت — جوجل بيبقى يشوف القديم. (${seoFailures.join(" · ")})`
          : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update industry";
    return { success: false, error: message };
  }
}
