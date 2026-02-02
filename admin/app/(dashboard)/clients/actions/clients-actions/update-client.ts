"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ClientFormData } from "@/lib/types";
import { mapFormDataToClientData } from "../../helpers/client-field-mapper";
import { groupFieldsByTab, hasGroupData } from "../../helpers/group-fields-by-tab";
import {
  updateRequiredFields,
  updateBusinessFields,
  updateContactFields,
  updateAddressFields,
  updateLegalFields,
  updateSEOFields,
  updateMediaSocialFields,
  updateSecurityFields,
  updateAdditionalFields,
  updateSettingsFields,
} from "./update-client-grouped";
import { generateClientSEO } from "./generate-client-seo";

export async function updateClient(id: string, data: ClientFormData) {
  try {
    // Early security check: Verify client ID exists
    const clientExists = await db.client.findUnique({
      where: { id },
      select: { id: true, subscriptionTier: true, articlesPerMonth: true },
    });

    if (!clientExists) {
      return { success: false, error: "Client not found" };
    }

    // Normalize and prepare data - convert null to undefined for ClientFormData
    const normalizedData = {
      ...data,
      legalName: data.legalName === null ? undefined : data.legalName,
      url: data.url === null ? undefined : data.url,
    } as ClientFormData;
    
    // Group fields by tab (before mapping to Prisma types)
    const groupedData = groupFieldsByTab(normalizedData);
    
    // Map to Prisma types after grouping
    const mappedData = mapFormDataToClientData(normalizedData);

    // Update each group independently
    // This ensures each update has <50 pipeline stages
    const results = await Promise.all([
      hasGroupData("required", groupedData.required) ? updateRequiredFields(id, groupedData.required) : Promise.resolve({ success: true, groupName: "required", fieldsUpdated: 0 } as const),
      hasGroupData("business", groupedData.business) ? updateBusinessFields(id, groupedData.business) : Promise.resolve({ success: true, groupName: "business", fieldsUpdated: 0 } as const),
      hasGroupData("contact", groupedData.contact) ? updateContactFields(id, groupedData.contact) : Promise.resolve({ success: true, groupName: "contact", fieldsUpdated: 0 } as const),
      hasGroupData("address", groupedData.address) ? updateAddressFields(id, groupedData.address) : Promise.resolve({ success: true, groupName: "address", fieldsUpdated: 0 } as const),
      hasGroupData("legal", groupedData.legal) ? updateLegalFields(id, groupedData.legal) : Promise.resolve({ success: true, groupName: "legal", fieldsUpdated: 0 } as const),
      hasGroupData("seo", groupedData.seo) ? updateSEOFields(id, groupedData.seo) : Promise.resolve({ success: true, groupName: "seo", fieldsUpdated: 0 } as const),
      hasGroupData("media-social", groupedData["media-social"]) ? updateMediaSocialFields(id, groupedData["media-social"]) : Promise.resolve({ success: true, groupName: "media-social", fieldsUpdated: 0 } as const),
      hasGroupData("security", groupedData.security) ? updateSecurityFields(id, groupedData.security) : Promise.resolve({ success: true, groupName: "security", fieldsUpdated: 0 } as const),
      hasGroupData("additional", groupedData.additional) ? updateAdditionalFields(id, groupedData.additional) : Promise.resolve({ success: true, groupName: "additional", fieldsUpdated: 0 } as const),
      hasGroupData("settings", groupedData.settings) ? updateSettingsFields(id, groupedData.settings) : Promise.resolve({ success: true, groupName: "settings", fieldsUpdated: 0 } as const),
    ]);

    // Check for failures
    const failedGroups = results.filter((r) => !r.success);
    
    if (failedGroups.length > 0) {
      const errorMessages = failedGroups.map((r) => `${r.groupName}: ${r.success === false ? r.error : "Unknown error"}`).join("; ");
      return {
        success: false,
        error: errorMessages,
      };
    }

    // All groups updated successfully
    const client = await db.client.findUnique({ where: { id } });
    
    // Automatically regenerate MetaTags and JSON-LD after successful update
    // This ensures SEO data stays in sync with client field changes
    const seoResult = await generateClientSEO(id);
    if (!seoResult.success) {
      // Log warning but don't fail the entire update
      // This ensures users can still save their changes even if SEO generation fails
      console.warn(`Failed to regenerate SEO data for client ${id}: ${seoResult.error}`);
    }
    
    // Note: generateClientSEO already calls revalidatePath, but we keep these for consistency
    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    revalidatePath("/media");
    
    return { success: true, client };
  } catch (error) {
    console.error("Error updating client:", error);
    const message = error instanceof Error ? error.message : "Failed to update client";
    return { success: false, error: message };
  }
}

