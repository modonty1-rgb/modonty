"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

import { generateClientSeoBundle } from "@modonty/database/lib/seo/generate-client-seo-bundle";
import { db } from "@/lib/db";

/**
 * Regenerate the client's cached SEO (Next.js metadata + JSON-LD @graph) and persist
 * it. Generation lives in the SHARED dataLayer bundle (ALL platform values from
 * Settings) so output is byte-identical to an admin save — single source of truth,
 * zero hardcoded constants. Console skips the admin Adobe/Ajv validation.
 * NEVER throws — a regen failure must never break the profile save.
 */
export async function regenerateClientSeo(
  clientId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const bundle = await generateClientSeoBundle(db, clientId);
    if (!bundle) return { success: false, error: "Client not found" };

    const { client, metaTags, jsonLdString } = bundle;

    const metaTagsJson = JSON.parse(JSON.stringify(metaTags)) as Record<string, unknown>;

    await db.client.update({
      where: { id: clientId },
      data: {
        nextjsMetadata: metaTagsJson as Prisma.InputJsonValue,
        nextjsMetadataLastGenerated: new Date(),
        jsonLdStructuredData: jsonLdString,
        jsonLdLastGenerated: new Date(),
      },
    });

    // Revalidate the public client page + the profile dashboard
    revalidatePath(`/clients/${client.slug}`);
    revalidatePath("/dashboard/profile");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to regenerate SEO data";
    return { success: false, error: message };
  }
}
