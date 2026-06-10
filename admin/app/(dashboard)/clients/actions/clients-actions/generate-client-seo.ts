"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

import { generateClientSeoBundle } from "@modonty/database/lib/seo/generate-client-seo-bundle";
import { validateClientJsonLdComplete } from "../../helpers/client-seo-config/client-jsonld-validator";

/**
 * Admin entry point. Generation (metaTags + JSON-LD, all Settings-sourced) lives in
 * the SHARED dataLayer bundle so admin + console produce identical output. Admin adds
 * the heavy Adobe/Ajv validation (writes jsonLdValidationReport) on top.
 */
export async function generateClientSEO(clientId: string) {
  try {
    const bundle = await generateClientSeoBundle(db, clientId);
    if (!bundle) return { success: false, error: "Client not found" };

    const { metaTags, jsonLdGraph, jsonLdString } = bundle;

    // Validate (Adobe + Ajv + business rules) — admin-only.
    const validationReport = await validateClientJsonLdComplete(jsonLdGraph, {
      requireLogo: true, // Require logo for Organization rich results
      requireAddress: false, // Address optional but validated if present
      requireContactPoint: false, // ContactPoint optional but validated if present
      minNameLength: 2,
      maxNameLength: 100,
    });

    // Ensure metaTags is properly serialized as JSON to avoid MongoDB pipeline issues
    const metaTagsJson = JSON.parse(JSON.stringify(metaTags)) as Record<string, unknown>;

    await db.client.update({
      where: { id: clientId },
      data: {
        nextjsMetadata: metaTagsJson as Prisma.InputJsonValue,
        nextjsMetadataLastGenerated: new Date(),
        jsonLdStructuredData: jsonLdString,
        jsonLdLastGenerated: new Date(),
        jsonLdValidationReport: JSON.parse(
          JSON.stringify(validationReport)
        ) as Prisma.InputJsonValue,
      },
    });

    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/clients");

    return { success: true };
  } catch (error) {
    console.error("Error generating client SEO:", error);
    const message = error instanceof Error ? error.message : "Failed to generate SEO data";
    return { success: false, error: message };
  }
}
