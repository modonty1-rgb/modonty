"use server";

import { db } from "@/lib/db";
import { buildTaxonomyCanonical } from "@/lib/seo/build-taxonomy-canonical";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { industryServerSchema } from "./industry-server-schema";

export async function createIndustry(data: {
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  socialImage?: string;
  socialImageAlt?: string;
  socialImageMediaId?: string;
  cloudinaryPublicId?: string;
}) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = industryServerSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

    const normalizedData = {
      ...data,
      slug: parsed.data.slug,
    };

    // Slug uniqueness check
    const existing = await db.industry.findFirst({ where: { slug: normalizedData.slug }, select: { id: true } });
    if (existing) return { success: false, error: "This slug is already in use. Try a different one." };

    // Canonical derived from the slug, same rule as the update path.
    const industry = await db.industry.create({
      data: { ...normalizedData, canonicalUrl: await buildTaxonomyCanonical("industries", normalizedData.slug) },
    });

    await logAction("industry.create", {
      entity: "Industry",
      entityId: industry.id,
      summary: industry.name,
    });

    revalidatePath("/industries");
    // Generate BEFORE revalidating modonty — it renders the stored blob. Both generators
    // RETURN { success, error } and never throw, so the result has to be read.
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

    return {
      success: true,
      industry,
      seoWarning:
        seoFailures.length > 0
          ? `المجال انحفظ، لكن بيانات السيو ما تجدّدت — جوجل بيبقى يشوف القديم. (${seoFailures.join(" · ")})`
          : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create industry";
    return { success: false, error: message };
  }
}
