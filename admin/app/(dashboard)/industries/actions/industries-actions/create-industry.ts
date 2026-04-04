"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

export async function createIndustry(data: {
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  socialImage?: string;
  socialImageAlt?: string;
  cloudinaryPublicId?: string;
}) {
  try {
    if (!data.name?.trim()) return { success: false, error: "اسم الصناعة مطلوب" };
    if (!data.slug?.trim()) return { success: false, error: "الرابط المختصر مطلوب" };

    const industry = await db.industry.create({ data });
    revalidatePath("/industries");
    await revalidateModontyTag("industries");
    try { const { generateAndSaveIndustrySeo } = await import("@/lib/seo/industry-seo-generator"); await generateAndSaveIndustrySeo(industry.id); } catch {}
    try { const { regenerateIndustriesListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateIndustriesListingCache(); } catch {}
    return { success: true, industry };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create industry";
    return { success: false, error: message };
  }
}
