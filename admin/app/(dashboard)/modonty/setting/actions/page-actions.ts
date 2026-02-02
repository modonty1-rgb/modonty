"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { optimizeCloudinaryUrl } from "@/lib/utils/image-seo";
import { revalidatePath } from "next/cache";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { getPageConfig } from "../helpers/page-config";
import type { PageFormData } from "../helpers/page-schema";
import { generateModontyPageSEO } from "./generate-modonty-page-seo";

const CLOUDINARY_ORIGIN = "res.cloudinary.com";

export type ValidateHeroImageResult =
  | { valid: true; enhancedUrl: string }
  | { valid: false; error: string };

export async function validateHeroImageUrl(url: string): Promise<ValidateHeroImageResult> {
  const trimmed = (url ?? "").trim();
  if (!trimmed) return { valid: false, error: "Enter a URL" };
  if (!trimmed.includes(CLOUDINARY_ORIGIN))
    return { valid: false, error: "Image not correct (must be a Cloudinary URL)" };
  try {
    const res = await fetch(trimmed, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { valid: false, error: "Image not correct (URL did not return 200)" };
    const enhancedUrl = optimizeCloudinaryUrl(trimmed);
    return { valid: true, enhancedUrl };
  } catch {
    return { valid: false, error: "Image not correct (link unreachable)" };
  }
}

export async function getPage(slug: string) {
  try {
    const page = await db.modonty.findUnique({
      where: { slug },
    });
    return { success: true, page };
  } catch (error) {
    console.error(`Error fetching page with slug "${slug}":`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to fetch page with slug "${slug}"`,
      page: null,
    };
  }
}

const PERSISTED_KEYS = [
  "title", "content", "heroImage", "heroImageAlt", "heroImageCloudinaryPublicId",
  "seoTitle", "seoDescription", "metaRobots", "socialImage", "socialImageAlt", "cloudinaryPublicId",
  "ogTitle", "ogDescription", "ogType", "ogUrl", "ogSiteName", "ogLocale", "ogImage",
  "twitterCard", "twitterTitle", "twitterDescription", "twitterSite", "twitterCreator",
  "canonicalUrl", "alternateLanguages", "sitemapPriority", "sitemapChangeFreq", "inLanguage",
] as const;

function toPersistedData(data: PageFormData) {
  const raw = Object.fromEntries(
    PERSISTED_KEYS.filter((k) => k in data).map((k) => [k, data[k as keyof PageFormData]])
  ) as Record<string, unknown>;
  const opt = (key: string) => {
    const v = raw[key];
    if (typeof v === "string" && v) raw[key] = optimizeCloudinaryUrl(v);
  };
  ["heroImage", "socialImage", "ogImage"].forEach(opt);
  return raw;
}

export async function updatePage(slug: string, data: PageFormData) {
  try {
    const settings = await getAllSettings();
    const titleMax = settings.seoTitleMax ?? 60;
    const descMax = settings.seoDescriptionMax ?? 160;
    if (data.seoTitle != null && data.seoTitle.length > titleMax) {
      return { success: false, error: `SEO title max ${titleMax} characters` };
    }
    if (data.seoDescription != null && data.seoDescription.length > descMax) {
      return { success: false, error: `SEO description max ${descMax} characters` };
    }

    const persisted = toPersistedData(data);
    const existing = await db.modonty.findUnique({ where: { slug }, select: { metaTags: true } });
    const existingMeta = (existing?.metaTags ?? {}) as Record<string, unknown>;
    const mergedMeta = {
      ...existingMeta,
      ...(data.organizationSeo != null ? { organizationSeo: data.organizationSeo } : {}),
      ...(data.ogLocaleAlternate !== undefined ? { ogLocaleAlternate: data.ogLocaleAlternate } : {}),
    };
    const metaTagsValue =
      Object.keys(mergedMeta).length > 0 ? (mergedMeta as Prisma.InputJsonValue) : undefined;
    const updatePayload: Prisma.ModontyUpdateInput = {
      ...persisted,
      ...(metaTagsValue !== undefined ? { metaTags: metaTagsValue } : {}),
      updatedAt: new Date(),
    };
    const createPayload: Prisma.ModontyCreateInput = {
      slug,
      title: data.title,
      content: data.content,
      ...persisted,
      ...(metaTagsValue !== undefined ? { metaTags: metaTagsValue } : {}),
    };
    const page = await db.modonty.upsert({
      where: { slug },
      update: updatePayload,
      create: createPayload,
    });

    // Generate SEO with proper error handling
    let seoWarning: string | undefined;
    try {
      const seoResult = await generateModontyPageSEO(slug);
      if (!seoResult.success) {
        seoWarning = seoResult.error || "SEO generation failed";
        console.error(`SEO generation failed for "${slug}":`, seoWarning);
      }
    } catch (seoError) {
      seoWarning = seoError instanceof Error ? seoError.message : "SEO generation failed";
      console.error(`SEO generation error for "${slug}":`, seoError);
    }

    const pageConfig = getPageConfig(slug);
    revalidatePath("/modonty/setting", "page");

    if (pageConfig) {
      try {
        const settings = await getAllSettings();
        const modontyUrl = settings.siteUrl?.trim() || "https://modonty.com";
        if (modontyUrl) {
          await fetch(
            `${modontyUrl}/api/revalidate?path=${pageConfig.modontyPath}&secret=${process.env.REVALIDATE_SECRET}`,
            {
              method: "POST",
            }
          ).catch(() => {
            // Silently fail if revalidation endpoint doesn't exist
            console.warn("Could not revalidate modonty app");
          });
        }
      } catch (error) {
        // Non-critical: revalidation failure shouldn't block save
        console.warn("Revalidation error:", error);
      }
    }

    return { success: true, page, warning: seoWarning };
  } catch (error) {
    console.error(`Error updating page with slug "${slug}":`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to update page with slug "${slug}"`,
    };
  }
}
