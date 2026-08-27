"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { optimizeCloudinaryUrl } from "@/lib/utils/image-seo";
import { revalidatePath } from "next/cache";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { getPageConfig } from "../helpers/page-config";
import type { PageFormData } from "../helpers/page-schema";
import { generateModontyPageSEO } from "./generate-modonty-page-seo";

export type ValidateHeroImageResult =
  | { valid: true; enhancedUrl: string }
  | { valid: false; error: string };

/**
 * Validate a hero image URL for a Modonty page.
 *
 * Used to REJECT anything that wasn't `res.cloudinary.com` — which would have blocked
 * every Bunny URL the moment this action got wired to a form. Now it accepts any
 * reachable https image and only applies the Cloudinary transform when the URL actually
 * is a Cloudinary one (`optimizeCloudinaryUrl` passes other hosts through untouched).
 */
export async function validateHeroImageUrl(url: string): Promise<ValidateHeroImageResult> {
  const trimmed = (url ?? "").trim();
  if (!trimmed) return { valid: false, error: "Enter a URL" };
  if (!/^https:\/\//i.test(trimmed))
    return { valid: false, error: "Image not correct (must be an https URL)" };
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
  "heroImageMediaId", "socialImageMediaId",
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
  // Relation ids: "" (picker cleared) must persist as null — "" is not a valid ObjectId.
  ["heroImageMediaId", "socialImageMediaId"].forEach((k) => {
    if (k in raw && !raw[k]) raw[k] = null;
  });
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

    // The stored Metadata blob modonty reads — regenerated here so a save never leaves the
    // page serving the previous title. Failure surfaces as a warning, same as the JSON-LD path.
    let metaWarning: string | undefined;
    try {
      const { regenerateContentPageCache } = await import("@/lib/seo/content-page-seo-generator");
      const metaResult = await regenerateContentPageCache(slug);
      if (!metaResult.success) metaWarning = metaResult.error || "Metadata generation failed";
    } catch (e) {
      metaWarning = e instanceof Error ? e.message : "Metadata generation failed";
    }
    if (metaWarning) console.error(`Metadata generation failed for "${slug}":`, metaWarning);

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
    revalidatePath("/modonty/pages", "layout");

    if (pageConfig) {
      try {
        const settings = await getAllSettings();
        // The literal used to sit here as an `||` fallback, so the `if` below could never be
        // false — a blank Settings row pinged a host nobody configured. Now the ping is simply
        // skipped and says why, instead of hitting a guessed address.
        const modontyUrl = settings.siteUrl?.trim();
        if (!modontyUrl) {
          console.error(
            "[page revalidate] تخطّيت تفريغ كاش مدونتي — الحقل الناقص: Settings.siteUrl. اضبطه من /settings.",
          );
        }
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
