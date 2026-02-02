"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
    return { success: true, industry };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update industry";
    return { success: false, error: message };
  }
}
