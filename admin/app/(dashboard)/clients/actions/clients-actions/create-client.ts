"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ClientFormData } from "@/lib/types";
import { getTierConfigByTier } from "@/app/(dashboard)/subscription-tiers/actions/tier-actions";
import { SubscriptionTier } from "@prisma/client";
import { mapFormDataToClientData } from "../../helpers/client-field-mapper";
import { generateClientSEO } from "./generate-client-seo";
import bcrypt from "bcryptjs";

export async function createClient(data: ClientFormData) {
  try {
    let articlesPerMonth = data.articlesPerMonth || null;
    let subscriptionTierConfigId = data.subscriptionTierConfigId || null;

    if (data.subscriptionTier) {
      const tierConfig = await getTierConfigByTier(data.subscriptionTier as SubscriptionTier);
      
      if (!tierConfig) {
        return {
          success: false,
          error: `Tier config not found for tier: ${data.subscriptionTier}`,
        };
      }

      if (!tierConfig.isActive) {
        return {
          success: false,
          error: `Tier ${tierConfig.name} is not active and cannot be assigned to new clients`,
        };
      }

      articlesPerMonth = tierConfig.articlesPerMonth;
      subscriptionTierConfigId = tierConfig.id;
    }

    const mappedData = mapFormDataToClientData(data);
    
    const clientData: any = {
      ...mappedData,
      subscriptionTierConfigId: subscriptionTierConfigId,
      articlesPerMonth: articlesPerMonth,
    };
    
    if (mappedData.subscriptionTier) {
      clientData.subscriptionTier = mappedData.subscriptionTier;
    }

    // Hash password if provided
    if (data.password && data.password.trim() !== "") {
      clientData.password = await bcrypt.hash(data.password, 10);
    } else {
      // Remove password field if not provided to avoid storing empty strings
      delete clientData.password;
    }

    clientData.logoMediaId = null;
    clientData.ogImageMediaId = null;
    clientData.twitterImageMediaId = null;

    const client = await db.client.create({
      data: clientData,
    });

    try {
      await generateClientSEO(client.id);
    } catch (error) {
      console.warn(`Failed to generate SEO for client ${client.id}:`, error);
    }

    revalidatePath("/clients");
    revalidatePath("/media");
    return { success: true, client };
  } catch (error) {
    console.error("Error creating client:", error);
    const message = error instanceof Error ? error.message : "Failed to create client";
    return { success: false, error: message };
  }
}

