"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { auth } from "@/lib/auth";
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
  cloudinaryPublicId?: string;
}) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = industryServerSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

    // Slug uniqueness check
    const existing = await db.industry.findFirst({ where: { slug: data.slug.trim() }, select: { id: true } });
    if (existing) return { success: false, error: "This slug is already in use. Try a different one." };

    const industry = await db.industry.create({ data });
    revalidatePath("/industries");
    await revalidateModontyTag("industries");
    try { const { generateAndSaveIndustrySeo } = await import("@/lib/seo/industry-seo-generator"); await generateAndSaveIndustrySeo(industry.id); } catch (e) { console.error("Industry SEO gen failed:", e); }
    try { const { regenerateIndustriesListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateIndustriesListingCache(); } catch (e) { console.error("Industries listing cache failed:", e); }
    return { success: true, industry };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create industry";
    return { success: false, error: message };
  }
}
