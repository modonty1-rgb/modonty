"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { auth } from "@/lib/auth";
import { industryServerSchema } from "./industry-server-schema";

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
    cloudinaryPublicId?: string | null;
  },
) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = industryServerSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

    // Slug uniqueness check (exclude current)
    const existingSlug = await db.industry.findFirst({ where: { slug: data.slug.trim(), id: { not: id } }, select: { id: true } });
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
      cloudinaryPublicId?: string | null;
    } = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      canonicalUrl: data.canonicalUrl || null,
    };

    if (data.socialImage !== undefined) {
      updateData.socialImage = data.socialImage;
    }
    if (data.socialImageAlt !== undefined) {
      updateData.socialImageAlt = data.socialImageAlt;
    }
    if (data.cloudinaryPublicId !== undefined) {
      updateData.cloudinaryPublicId = data.cloudinaryPublicId;
    }

    const industry = await db.industry.update({ where: { id }, data: updateData });
    revalidatePath("/industries");
    await revalidateModontyTag("industries");
    try { const { generateAndSaveIndustrySeo } = await import("@/lib/seo/industry-seo-generator"); await generateAndSaveIndustrySeo(industry.id); } catch (e) { console.error("Industry SEO gen failed:", e); }
    try { const { regenerateIndustriesListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateIndustriesListingCache(); } catch (e) { console.error("Industries listing cache failed:", e); }

    // Cascade: regenerate SEO for all clients in this industry
    try {
      const industryClients = await db.client.findMany({
        where: { industryId: industry.id },
        select: { id: true },
      });
      if (industryClients.length > 0) {
        const { regenerateClientJsonLd } = await import("@/app/(dashboard)/clients/helpers/client-seo-config/client-jsonld-storage");
        for (const client of industryClients) {
          await regenerateClientJsonLd(client.id).catch(() => null);
        }
      }
    } catch {
      // Don't fail the industry update if cascade fails
    }

    await revalidateModontyTag("clients");

    return { success: true, industry };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update industry";
    return { success: false, error: message };
  }
}
