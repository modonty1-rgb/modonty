/**
 * Client JSON-LD — READ ONLY.
 *
 * Writing a client's JSON-LD has exactly one entry point: `generateClientSEO`, which runs
 * the shared shared bundle (`generateClientSeoBundle`) so admin, console and the cascade
 * all produce byte-identical cards.
 *
 * This file used to hold a second writer — `generateAndSaveClientJsonLd` /
 * `regenerateClientJsonLd` — fed by its own hand-written `select`. That select had drifted:
 * no `openingHoursSpecification`, no `priceRange`, and it never passed the Settings image
 * licensing through, so the generator fell back to "no licence block". A client rebuilt by
 * that path silently lost its opening hours, its price range (which Google requires for the
 * LocalBusiness family) and its Licensable image metadata — and the UI said "SEO updated".
 *
 * The cascade had already been moved off it (see cascade-step-actions.ts) after it was
 * caught wiping hours and price range on dev. The Update button on the client's SEO tab was
 * still wired to it until 2026-08-02; both writer and action are gone now, so there is no
 * way left to reach the poorer path.
 */

import { db } from "@/lib/db";
import type { ValidationReport } from "@/lib/seo/jsonld-validator";

/** Read the stored card + its validation report. */
export async function getCachedClientJsonLd(
  clientId: string
): Promise<{ jsonLd: object | null; validationReport: ValidationReport | null }> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      jsonLdStructuredData: true,
      jsonLdValidationReport: true,
    },
  });

  if (!client) {
    return { jsonLd: null, validationReport: null };
  }

  let jsonLd: object | null = null;
  if (client.jsonLdStructuredData) {
    try {
      jsonLd = JSON.parse(client.jsonLdStructuredData);
    } catch {
      jsonLd = null;
    }
  }

  return {
    jsonLd,
    validationReport: client.jsonLdValidationReport as ValidationReport | null,
  };
}

/** True when the client changed after its card was last built. */
export async function needsClientRegeneration(clientId: string): Promise<boolean> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      jsonLdLastGenerated: true,
      updatedAt: true,
    },
  });

  if (!client) return false;
  if (!client.jsonLdLastGenerated) return true;

  return client.updatedAt > client.jsonLdLastGenerated;
}
