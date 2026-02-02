"use server";

import { db } from "@/lib/db";
import type { ClientFormData } from "@/lib/types";
import { getFieldsForGroup } from "../../helpers/group-fields-by-tab";
import { getTierConfigByTier } from "@/app/(dashboard)/subscription-tiers/actions/tier-actions";
import { SubscriptionTier } from "@prisma/client";
import { validateAndNormalizeUrls } from "./validate-and-normalize-urls";
import bcrypt from "bcryptjs";

export interface GroupUpdateResult {
  success: boolean;
  error?: string;
  groupName: string;
  fieldsUpdated?: number;
}

/**
 * Helper to compare values (arrays, dates, primitives)
 */
function valuesAreEqual(existing: unknown, newValue: unknown): boolean {
  // Deep comparison for arrays
  if (Array.isArray(existing) && Array.isArray(newValue)) {
    const existingStr = JSON.stringify([...existing].sort());
    const newStr = JSON.stringify([...newValue].sort());
    return existingStr === newStr;
  }
  
  // Date comparison
  if (existing instanceof Date && newValue instanceof Date) {
    return existing.getTime() === newValue.getTime();
  }
  
  // Null/undefined comparison
  return existing === newValue;
}

/**
 * Normalizes date values to Date objects or null
 * Handles serialization from client-side where Date objects become strings
 * 
 * @param value - Date object, string, null, or undefined
 * @returns Date object or null if invalid/missing
 */
function normalizeDate(value: unknown): Date | null {
  // Return null for empty values
  if (value === null || value === undefined || value === "") {
    return null;
  }
  
  // Return Date object if already a Date
  if (value instanceof Date) {
    // Validate the date is not Invalid Date
    return isNaN(value.getTime()) ? null : value;
  }
  
  // Convert strings to Date objects
  if (typeof value === "string") {
    // Handle double-quoted strings (e.g., '"1988-01-14T00:00:00.000Z"')
    const cleanedValue = value.replace(/^["']|["']$/g, "");
    const date = new Date(cleanedValue);
    // Validate the date is valid
    return isNaN(date.getTime()) ? null : date;
  }
  
  // Return null for invalid types
  return null;
}

/**
 * Builds update data object with only changed fields for a specific group
 */
function buildGroupUpdateData(
  groupId: string,
  existingData: Record<string, unknown>,
  newData: Record<string, unknown>
): Record<string, unknown> {
  const fields = getFieldsForGroup(groupId);
  const updateData: Record<string, unknown> = {};
  
  fields.forEach((field) => {
    const existingValue = existingData[field];
    const newValue = newData[field];
    
    if (!valuesAreEqual(existingValue, newValue)) {
      updateData[field] = newValue;
    }
  });
  
  return updateData;
}

/**
 * Updates Required fields group (Basic info, subscription, business brief)
 */
export async function updateRequiredFields(
  clientId: string,
  data: Partial<ClientFormData>
): Promise<GroupUpdateResult> {
  try {
    // Verify client exists (security check)
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        name: true,
        slug: true,
        email: true,
        subscriptionTier: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        businessBrief: true,
        subscriptionTierConfigId: true,
        articlesPerMonth: true,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found", groupName: "required" };
    }

    // Handle subscription tier logic
    let articlesPerMonth = data.articlesPerMonth ?? client.articlesPerMonth;
    let subscriptionTierConfigId = data.subscriptionTierConfigId ?? client.subscriptionTierConfigId;

    const tierChanged = client.subscriptionTier !== data.subscriptionTier;

    if (data.subscriptionTier && tierChanged) {
      const tierConfig = await getTierConfigByTier(data.subscriptionTier as SubscriptionTier);
      
      if (tierConfig) {
        articlesPerMonth = tierConfig.articlesPerMonth;
        subscriptionTierConfigId = tierConfig.id;
        
        if (!tierConfig.isActive) {
          console.warn(`Tier ${tierConfig.name} is deactivated but being assigned to client ${clientId}`);
        }
      } else {
        console.warn(`Tier config not found for tier: ${data.subscriptionTier}, keeping existing articlesPerMonth`);
        articlesPerMonth = client.articlesPerMonth;
      }
    } else if (!data.subscriptionTier) {
      subscriptionTierConfigId = null;
      articlesPerMonth = null;
    }

    const newData: Record<string, unknown> = {
      name: data.name,
      slug: data.slug,
      email: data.email,
      subscriptionTier: data.subscriptionTier,
      subscriptionStartDate: normalizeDate(data.subscriptionStartDate),
      subscriptionEndDate: normalizeDate(data.subscriptionEndDate),
      businessBrief: data.businessBrief,
      subscriptionTierConfigId,
      articlesPerMonth,
    };

    const updateData = buildGroupUpdateData("required", client as Record<string, unknown>, newData);

    if (Object.keys(updateData).length === 0) {
      return { success: true, groupName: "required", fieldsUpdated: 0 };
    }

    await db.client.update({
      where: { id: clientId },
      data: updateData,
    });

    return { success: true, groupName: "required", fieldsUpdated: Object.keys(updateData).length };
  } catch (error) {
    console.error("Error updating required fields:", error);
    const message = error instanceof Error ? error.message : "Failed to update required fields";
    return { success: false, error: message, groupName: "required" };
  }
}

/**
 * Updates Settings fields group (subscription/payment status and similar toggles)
 */
export async function updateSettingsFields(
  clientId: string,
  data: Partial<ClientFormData>
): Promise<GroupUpdateResult> {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        subscriptionStatus: true,
        paymentStatus: true,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found", groupName: "settings" };
    }

    const newData: Record<string, unknown> = {
      subscriptionStatus: data.subscriptionStatus ?? client.subscriptionStatus,
      paymentStatus: data.paymentStatus ?? client.paymentStatus,
    };

    const updateData = buildGroupUpdateData("settings", client as Record<string, unknown>, newData);

    if (Object.keys(updateData).length === 0) {
      return { success: true, groupName: "settings", fieldsUpdated: 0 };
    }

    await db.client.update({
      where: { id: clientId },
      data: updateData,
    });

    return { success: true, groupName: "settings", fieldsUpdated: Object.keys(updateData).length };
  } catch (error) {
    console.error("Error updating settings fields:", error);
    const message = error instanceof Error ? error.message : "Failed to update settings fields";
    return { success: false, error: message, groupName: "settings" };
  }
}

/**
 * Updates Business fields group
 */
export async function updateBusinessFields(
  clientId: string,
  data: Partial<ClientFormData>
): Promise<GroupUpdateResult> {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        legalName: true,
        industryId: true,
        targetAudience: true,
        contentPriorities: true,
        foundingDate: true,
        organizationType: true,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found", groupName: "business" };
    }

    const newData: Record<string, unknown> = {
      legalName: data.legalName ?? null,
      industryId: data.industryId ?? null,
      targetAudience: data.targetAudience ?? null,
      contentPriorities: data.contentPriorities ?? [],
      foundingDate: normalizeDate(data.foundingDate),
      organizationType: data.organizationType ?? null,
    };

    const updateData = buildGroupUpdateData("business", client as Record<string, unknown>, newData);

    if (Object.keys(updateData).length === 0) {
      return { success: true, groupName: "business", fieldsUpdated: 0 };
    }

    await db.client.update({
      where: { id: clientId },
      data: updateData,
    });

    return { success: true, groupName: "business", fieldsUpdated: Object.keys(updateData).length };
  } catch (error) {
    console.error("Error updating business fields:", error);
    const message = error instanceof Error ? error.message : "Failed to update business fields";
    return { success: false, error: message, groupName: "business" };
  }
}

/**
 * Updates Contact fields group
 */
export async function updateContactFields(
  clientId: string,
  data: Partial<ClientFormData>
): Promise<GroupUpdateResult> {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        url: true,
        phone: true,
        contactType: true,
        sameAs: true,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found", groupName: "contact" };
    }

    // Normalize sameAs URLs if provided
    const normalizedSameAs = data.sameAs ? validateAndNormalizeUrls(data.sameAs) : [];

    const newData: Record<string, unknown> = {
      url: data.url ?? null,
      phone: data.phone ?? null,
      contactType: data.contactType ?? null,
      sameAs: normalizedSameAs,
    };

    const updateData = buildGroupUpdateData("contact", client as Record<string, unknown>, newData);

    if (Object.keys(updateData).length === 0) {
      return { success: true, groupName: "contact", fieldsUpdated: 0 };
    }

    await db.client.update({
      where: { id: clientId },
      data: updateData,
    });

    return { success: true, groupName: "contact", fieldsUpdated: Object.keys(updateData).length };
  } catch (error) {
    console.error("Error updating contact fields:", error);
    const message = error instanceof Error ? error.message : "Failed to update contact fields";
    return { success: false, error: message, groupName: "contact" };
  }
}

/**
 * Updates SEO fields group
 */
export async function updateSEOFields(
  clientId: string,
  data: Partial<ClientFormData>
): Promise<GroupUpdateResult> {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        seoTitle: true,
        seoDescription: true,
        description: true,
        canonicalUrl: true,
        metaRobots: true,
        gtmId: true,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found", groupName: "seo" };
    }

    const newData: Record<string, unknown> = {
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      description: data.description ?? null,
      canonicalUrl: data.canonicalUrl ?? null,
      metaRobots: data.metaRobots ?? null,
      gtmId: data.gtmId ?? null,
    };

    const updateData = buildGroupUpdateData("seo", client as Record<string, unknown>, newData);

    if (Object.keys(updateData).length === 0) {
      return { success: true, groupName: "seo", fieldsUpdated: 0 };
    }

    await db.client.update({
      where: { id: clientId },
      data: updateData,
    });

    return { success: true, groupName: "seo", fieldsUpdated: Object.keys(updateData).length };
  } catch (error) {
    console.error("Error updating seo fields:", error);
    const message = error instanceof Error ? error.message : "Failed to update seo fields";
    return { success: false, error: message, groupName: "seo" };
  }
}

/**
 * Updates Legal fields group
 */
export async function updateLegalFields(
  clientId: string,
  data: Partial<ClientFormData>
): Promise<GroupUpdateResult> {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        legalForm: true,
        commercialRegistrationNumber: true,
        vatID: true,
        taxID: true,
        licenseNumber: true,
        licenseAuthority: true,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found", groupName: "legal" };
    }

    const newData: Record<string, unknown> = {
      legalForm: data.legalForm ?? null,
      commercialRegistrationNumber: data.commercialRegistrationNumber ?? null,
      vatID: data.vatID ?? null,
      taxID: data.vatID ?? data.taxID ?? null, // Use VAT ID as Tax ID if Tax ID is not provided
      licenseNumber: data.licenseNumber ?? null,
      licenseAuthority: data.licenseAuthority ?? null,
    };

    const updateData = buildGroupUpdateData("legal", client as Record<string, unknown>, newData);

    if (Object.keys(updateData).length === 0) {
      return { success: true, groupName: "legal", fieldsUpdated: 0 };
    }

    await db.client.update({
      where: { id: clientId },
      data: updateData,
    });

    return { success: true, groupName: "legal", fieldsUpdated: Object.keys(updateData).length };
  } catch (error) {
    console.error("Error updating legal fields:", error);
    const message = error instanceof Error ? error.message : "Failed to update legal fields";
    return { success: false, error: message, groupName: "legal" };
  }
}

/**
 * Updates Address fields group
 */
export async function updateAddressFields(
  clientId: string,
  data: Partial<ClientFormData>
): Promise<GroupUpdateResult> {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        addressStreet: true,
        addressNeighborhood: true,
        addressBuildingNumber: true,
        addressAdditionalNumber: true,
        addressCity: true,
        addressRegion: true,
        addressPostalCode: true,
        addressCountry: true,
        addressLatitude: true,
        addressLongitude: true,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found", groupName: "address" };
    }

    const newData: Record<string, unknown> = {
      addressStreet: data.addressStreet ?? null,
      addressNeighborhood: data.addressNeighborhood ?? null,
      addressBuildingNumber: data.addressBuildingNumber ?? null,
      addressAdditionalNumber: data.addressAdditionalNumber ?? null,
      addressCity: data.addressCity ?? null,
      addressRegion: data.addressRegion ?? null,
      addressPostalCode: data.addressPostalCode ?? null,
      addressCountry: data.addressCountry ?? null,
      addressLatitude: data.addressLatitude ?? null,
      addressLongitude: data.addressLongitude ?? null,
    };

    const updateData = buildGroupUpdateData("address", client as Record<string, unknown>, newData);

    if (Object.keys(updateData).length === 0) {
      return { success: true, groupName: "address", fieldsUpdated: 0 };
    }

    await db.client.update({
      where: { id: clientId },
      data: updateData,
    });

    return { success: true, groupName: "address", fieldsUpdated: Object.keys(updateData).length };
  } catch (error) {
    console.error("Error updating address fields:", error);
    const message = error instanceof Error ? error.message : "Failed to update address fields";
    return { success: false, error: message, groupName: "address" };
  }
}

/**
 * Updates Media fields group
 */
export async function updateMediaSocialFields(
  clientId: string,
  data: Partial<ClientFormData>
): Promise<GroupUpdateResult> {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        logoMediaId: true,
        ogImageMediaId: true,
        twitterImageMediaId: true,
        twitterCard: true,
        twitterTitle: true,
        twitterDescription: true,
        twitterSite: true,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found", groupName: "media-social" };
    }

    const newData: Record<string, unknown> = {
      logoMediaId: data.logoMediaId ?? null,
      ogImageMediaId: data.ogImageMediaId ?? null,
      twitterImageMediaId: data.twitterImageMediaId ?? null,
      twitterCard: data.twitterCard ?? null,
      twitterTitle: data.twitterTitle ?? null,
      twitterDescription: data.twitterDescription ?? null,
      twitterSite: data.twitterSite ?? null,
    };

    const updateData = buildGroupUpdateData("media-social", client as Record<string, unknown>, newData);

    if (Object.keys(updateData).length === 0) {
      return { success: true, groupName: "media-social", fieldsUpdated: 0 };
    }

    await db.client.update({
      where: { id: clientId },
      data: updateData,
    });

    return { success: true, groupName: "media-social", fieldsUpdated: Object.keys(updateData).length };
  } catch (error) {
    console.error("Error updating media-social fields:", error);
    const message = error instanceof Error ? error.message : "Failed to update media-social fields";
    return { success: false, error: message, groupName: "media-social" };
  }
}

/**
 * Updates Security fields group (password)
 */
export async function updateSecurityFields(
  clientId: string,
  data: Partial<ClientFormData>
): Promise<GroupUpdateResult> {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        password: true,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found", groupName: "security" };
    }

    // Handle password separately (only update if provided)
    const updateData: Record<string, unknown> = {};

    if (data.password && data.password.trim() !== "") {
      // Hash the new password
      updateData.password = await bcrypt.hash(data.password, 10);
    } else {
      // Don't update password if not provided
      return { success: true, groupName: "security", fieldsUpdated: 0 };
    }

    // Build update data using the group helper
    const groupUpdateData = buildGroupUpdateData("security", client as Record<string, unknown>, updateData);

    if (Object.keys(groupUpdateData).length === 0) {
      return { success: true, groupName: "security", fieldsUpdated: 0 };
    }

    await db.client.update({
      where: { id: clientId },
      data: groupUpdateData,
    });

    return { success: true, groupName: "security", fieldsUpdated: Object.keys(groupUpdateData).length };
  } catch (error) {
    console.error("Error updating security fields:", error);
    const message = error instanceof Error ? error.message : "Failed to update security fields";
    return { success: false, error: message, groupName: "security" };
  }
}

/**
 * Updates Additional fields group
 */
export async function updateAdditionalFields(
  clientId: string,
  data: Partial<ClientFormData>
): Promise<GroupUpdateResult> {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        businessActivityCode: true,
        isicV4: true,
        numberOfEmployees: true,
        parentOrganizationId: true,
        alternateName: true,
        slogan: true,
        keywords: true,
        knowsLanguage: true,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found", groupName: "additional" };
    }

    // Handle additional fields
    const updateData: Record<string, unknown> = {
      businessActivityCode: data.businessActivityCode ?? null,
      isicV4: data.isicV4 ?? null,
      numberOfEmployees: data.numberOfEmployees ?? null,
      parentOrganizationId: data.parentOrganizationId ?? null,
      alternateName: data.alternateName ?? null,
      slogan: data.slogan ?? null,
      keywords: data.keywords ?? [],
      knowsLanguage: data.knowsLanguage ?? [],
    };

    // Build update data using the group helper
    const groupUpdateData = buildGroupUpdateData("additional", client as Record<string, unknown>, updateData);

    if (Object.keys(groupUpdateData).length === 0) {
      return { success: true, groupName: "additional", fieldsUpdated: 0 };
    }

    await db.client.update({
      where: { id: clientId },
      data: groupUpdateData,
    });

    return { success: true, groupName: "additional", fieldsUpdated: Object.keys(groupUpdateData).length };
  } catch (error) {
    console.error("Error updating additional fields:", error);
    const message = error instanceof Error ? error.message : "Failed to update additional fields";
    return { success: false, error: message, groupName: "additional" };
  }
}
