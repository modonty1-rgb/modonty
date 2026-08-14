"use server";

import { getCachedClientJsonLd } from "../../helpers/client-seo-config/client-jsonld-storage";
import type { ValidationReport } from "@/lib/seo/jsonld-validator";

/**
 * Read-only. Writing a client's JSON-LD has exactly one entry point —
 * `generateClientSEO`, which goes through the shared shared bundle.
 *
 * There used to be a `regenerateClientJsonLdAction` here too, wired to the Update button on
 * the client's SEO tab. It ran a separate generator fed by its own hand-written `select`
 * that omitted `openingHoursSpecification`, `priceRange` and the image-licensing defaults —
 * so pressing Update silently stripped the client's opening hours, its price range and its
 * Licensable image metadata, and reported success. Removed 2026-08-02.
 */
export async function getClientJsonLd(clientId: string): Promise<{
  jsonLd: object | null;
  validationReport: ValidationReport | null;
}> {
  return getCachedClientJsonLd(clientId);
}
