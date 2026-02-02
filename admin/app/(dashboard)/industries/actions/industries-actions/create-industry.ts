"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
    const industry = await db.industry.create({ data });
    revalidatePath("/industries");
    return { success: true, industry };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create industry";
    return { success: false, error: message };
  }
}
