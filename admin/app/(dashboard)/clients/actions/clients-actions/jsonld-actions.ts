"use server";

import { getCachedClientJsonLd, regenerateClientJsonLd } from "../../helpers/client-seo-config/client-jsonld-storage";
import type { ValidationReport } from "@/lib/seo/jsonld-validator";
import { revalidatePath } from "next/cache";

/**
 * Get client JSON-LD and validation report
 */
export async function getClientJsonLd(clientId: string): Promise<{
  jsonLd: object | null;
  validationReport: ValidationReport | null;
}> {
  return getCachedClientJsonLd(clientId);
}

/**
 * Regenerate client JSON-LD and validation report
 */
export async function regenerateClientJsonLdAction(clientId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await regenerateClientJsonLd(clientId);
    
    if (result.success) {
      revalidatePath(`/clients/${clientId}`);
      revalidatePath("/clients");
      return { success: true };
    }
    
    return {
      success: false,
      error: result.error || "Failed to regenerate JSON-LD",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to regenerate JSON-LD",
    };
  }
}
