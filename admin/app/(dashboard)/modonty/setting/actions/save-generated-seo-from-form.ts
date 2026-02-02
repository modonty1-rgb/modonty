"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { normalizeModontyJsonLd } from "../helpers/jsonld-normalize";
import { validateModontyPageJsonLdComplete } from "../helpers/modonty-jsonld-validator";
import { getPageConfig } from "../helpers/page-config";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { getLivePreviewSEO } from "./get-live-preview-seo";
import type { PageFormData } from "../helpers/page-schema";

export async function saveGeneratedSeoFromForm(
  slug: string,
  formData: PageFormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const result = await getLivePreviewSEO(slug, formData);
    if ("error" in result) return { success: false, error: result.error };

    const { metaTags, jsonLd } = result;
    const rawJsonLd = JSON.parse(jsonLd) as object;
    const normalizedJsonLd = await normalizeModontyJsonLd(rawJsonLd);
    const validationReport = await validateModontyPageJsonLdComplete(normalizedJsonLd);

    await db.modonty.update({
      where: { slug },
      data: {
        metaTags: JSON.parse(JSON.stringify(metaTags)) as object,
        jsonLdStructuredData: jsonLd,
        jsonLdLastGenerated: new Date(),
        jsonLdValidationReport: JSON.parse(JSON.stringify(validationReport)) as object,
      },
    });

    revalidatePath("/modonty/setting", "page");
    const pageConfig = getPageConfig(slug);
    if (pageConfig?.modontyPath) {
      const settings = await getAllSettings();
      const modontyUrl = settings.siteUrl?.trim() || "https://modonty.com";
      if (modontyUrl) {
        fetch(
          `${modontyUrl}/api/revalidate?path=${pageConfig.modontyPath}&secret=${process.env.REVALIDATE_SECRET}`,
          { method: "POST" }
        ).catch(() => {});
      }
    }
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
