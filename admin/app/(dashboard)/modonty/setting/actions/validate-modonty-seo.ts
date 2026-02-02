"use server";

import { db } from "@/lib/db";
import {
  validateMetaTags,
  validateModontyPageJsonLdComplete,
  type MetaValidationReport,
  type ModontyValidationReport,
} from "../helpers/modonty-jsonld-validator";
import { normalizeModontyJsonLd } from "../helpers/jsonld-normalize";
import { getLivePreviewSEO } from "./get-live-preview-seo";
import type { PageFormData } from "../helpers/page-schema";

export interface ValidateModontySEOReport {
  meta: MetaValidationReport;
  jsonLd: ModontyValidationReport | null;
}

export async function validateModontyPageSEO(slug: string): Promise<
  | { success: true; report: ValidateModontySEOReport }
  | { success: false; error: string }
> {
  try {
    const page = await db.modonty.findUnique({
      where: { slug },
      select: { metaTags: true, jsonLdStructuredData: true },
    });
    if (!page) return { success: false, error: "Page not found" };

    const metaReport = validateMetaTags(page.metaTags);

    let jsonLdReport: ModontyValidationReport | null = null;
    if (page.jsonLdStructuredData?.trim()) {
      try {
        const parsed = JSON.parse(page.jsonLdStructuredData) as object;
        const normalized = await normalizeModontyJsonLd(parsed);
        jsonLdReport = await validateModontyPageJsonLdComplete(normalized);
      } catch (e) {
        jsonLdReport = {
          adobe: { valid: false, errors: [{ message: e instanceof Error ? e.message : String(e) }], warnings: [] },
          ajv: { valid: false, errors: [e instanceof Error ? e.message : String(e)], warnings: [] },
          jsonldJs: { valid: false, errors: [e instanceof Error ? e.message : String(e)] },
          custom: { errors: ["JSON-LD parse failed"], warnings: [] },
        };
      }
    }

    return {
      success: true,
      report: { meta: metaReport, jsonLd: jsonLdReport },
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function validateLivePreviewSEO(
  slug: string,
  formData: PageFormData
): Promise<
  | { success: true; report: ValidateModontySEOReport }
  | { success: false; error: string }
> {
  try {
    const result = await getLivePreviewSEO(slug, formData);
    if ("error" in result) return { success: false, error: result.error };

    const { metaTags, jsonLd } = result;
    const metaReport = validateMetaTags(metaTags);

    let jsonLdReport: ModontyValidationReport | null = null;
    if (jsonLd?.trim()) {
      try {
        const parsed = JSON.parse(jsonLd) as object;
        jsonLdReport = await validateModontyPageJsonLdComplete(parsed);
      } catch (e) {
        jsonLdReport = {
          adobe: { valid: false, errors: [{ message: e instanceof Error ? e.message : String(e) }], warnings: [] },
          ajv: { valid: false, errors: [e instanceof Error ? e.message : String(e)], warnings: [] },
          jsonldJs: { valid: false, errors: [e instanceof Error ? e.message : String(e)] },
          custom: { errors: ["JSON-LD parse failed"], warnings: [] },
        };
      }
    }

    return {
      success: true,
      report: { meta: metaReport, jsonLd: jsonLdReport },
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
