"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

import { generateClientSeoBundle } from "@modonty/shared/lib/seo/generate-client-seo-bundle";
import { db } from "@/lib/db";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

/**
 * Regenerate the client's cached SEO (Next.js metadata + JSON-LD @graph) and persist
 * it. Generation lives in the SHARED shared bundle (ALL platform values from
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

    // ...and that only clears the CONSOLE's own cache. modonty is a separate deployment
    // that serves the client page from its own tag cache, so without this it keeps
    // handing visitors the pre-save version until the cache ages out on its own.
    //
    // It lives HERE, not in each caller, deliberately: four write paths (page content,
    // gallery, page FAQ, reviews) regenerated the bundle and never made this call, and
    // every one of them shipped looking correct. A caller that cannot forget is the fix.
    //
    // Best-effort and deliberately outside the return value — the regeneration itself
    // succeeded, and a cache endpoint that is down must not report it as a failure.
    try {
      await revalidateModontyTag("clients");
    } catch {
      // swallow — never let a cache bust undo a successful regeneration
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to regenerate SEO data";
    return { success: false, error: message };
  }
}
