"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import type { ClientFormData } from "@/lib/types";
import { getTierConfigByTier } from "@/app/(dashboard)/subscription-tiers/actions/tier-actions";
import { SubscriptionTier } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { mapFormDataToClientData } from "../../helpers/client-field-mapper";
import { generateClientSEO } from "./generate-client-seo";
import { clientServerSchema } from "./client-server-schema";
import { DEFAULT_CLIENT_PASSWORD } from "@/lib/default-client-password";
import bcrypt from "bcryptjs";

export async function createClient(data: ClientFormData) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    // Server-side Zod validation
    const parsed = clientServerSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return { success: false, error: firstError.message };
    }

    // Validate slug uniqueness
    const existingClient = await db.client.findUnique({
      where: { slug: parsed.data.slug.trim() },
      select: { id: true },
    });
    if (existingClient) {
      return { success: false, error: "This slug is already in use" };
    }

    // Email + phone must be globally unique. App-level guard (the DB index may not be synced).
    const dupConds: Array<{ email?: string; phone?: string }> = [];
    if (parsed.data.email) dupConds.push({ email: parsed.data.email });
    if (parsed.data.phone) dupConds.push({ phone: parsed.data.phone });
    if (dupConds.length > 0) {
      const dup = await db.client.findFirst({
        where: { OR: dupConds },
        select: { email: true, phone: true },
      });
      if (dup) {
        const sameEmail = Boolean(parsed.data.email) && dup.email === parsed.data.email;
        return {
          success: false,
          error: sameEmail
            ? "هذا البريد الإلكتروني مستخدم من عميل آخر."
            : "رقم الجوال مستخدم من عميل آخر.",
        };
      }
    }

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

    const clientData: Record<string, unknown> = {
      ...mappedData,
      subscriptionTierConfigId: subscriptionTierConfigId,
      articlesPerMonth: articlesPerMonth,
    };
    
    if (mappedData.subscriptionTier) {
      clientData.subscriptionTier = mappedData.subscriptionTier;
    }

    // Admins don't set a password. The client gets the default password
    // (sent via the welcome email) and changes it from the console on first login.
    const rawPassword =
      data.password && data.password.trim() !== "" ? data.password : DEFAULT_CLIENT_PASSWORD;
    clientData.password = await bcrypt.hash(rawPassword, 10);

    // Whitelist: only pass fields Prisma accepts on client.create()
    const allowedFields = [
      "name",
      "slug",
      "legalName",
      "url",
      "sameAs",
      "email",
      "phone",
      "contactType",
      "password",
      "seoTitle",
      "seoDescription",
      "description",
      "canonicalUrl",
      "businessBrief",
      "contentPriorities",
      "foundingDate",
      "addressStreet",
      "addressCity",
      "addressCountry",
      "addressPostalCode",
      "commercialRegistrationNumber",
      "vatID",
      "taxID",
      "legalForm",
      "addressRegion",
      "addressNeighborhood",
      "addressBuildingNumber",
      "addressAdditionalNumber",
      "addressLatitude",
      "addressLongitude",
      "businessActivityCode",
      "isicV4",
      "numberOfEmployees",
      "alternateName",
      "slogan",
      "keywords",
      "knowsLanguage",
      "organizationType",
      "subscriptionTier",
      "subscriptionStartDate",
      "subscriptionEndDate",
      "articlesPerMonth",
      "subscriptionStatus",
      "paymentStatus",
      "gbpProfileUrl",
      "gbpPlaceId",
      "gbpAccountId",
      "gbpLocationId",
      "gbpCategory",
      "priceRange",
      "openingHoursSpecification",
      "googleBusinessProfileUrl",
      // YMYL verification
      "isYmyl",
      "ymylCategory",
      "ymylData",
      // Primary CTA («احجز الآن») — admin-controlled
      "ctaMode",
      "ctaLabel",
      "ctaUrl",
    ];
    // Strategy fields removed (Plan B): targetAudience, forbiddenKeywords, forbiddenClaims,
    // competitiveMentionsAllowed — these are now client-managed via console intake.

    const cleanData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in clientData) {
        cleanData[key] = clientData[key];
      }
    }

    // Bootstrap intake JSON with businessBrief so the unified strategy bundle is non-empty from creation.
    if (typeof cleanData.businessBrief === "string" && cleanData.businessBrief.trim()) {
      cleanData.intake = {
        version: 1,
        business: { brief: cleanData.businessBrief },
        updatedAt: new Date().toISOString(),
      };
      cleanData.intakeUpdatedAt = new Date();
    }

    // Handle relations — verify each ID exists before connecting
    if (clientData.subscriptionTierConfigId) {
      const tierConfig = await db.subscriptionTierConfig.findUnique({
        where: { id: clientData.subscriptionTierConfigId as string },
        select: { id: true },
      });
      if (!tierConfig) return { success: false, error: "Subscription tier not found" };
      cleanData.subscriptionTierConfig = { connect: { id: tierConfig.id } };
    }
    if (clientData.industryId) {
      const industry = await db.industry.findUnique({
        where: { id: clientData.industryId as string },
        select: { id: true },
      });
      if (!industry) return { success: false, error: "Selected industry not found" };
      cleanData.industry = { connect: { id: industry.id } };
    }
    if (clientData.parentOrganizationId) {
      const parentOrg = await db.client.findUnique({
        where: { id: clientData.parentOrganizationId as string },
        select: { id: true },
      });
      if (!parentOrg) return { success: false, error: "Parent organization not found" };
      cleanData.parentOrganization = { connect: { id: parentOrg.id } };
    }

    const client = await db.client.create({
      data: cleanData as Prisma.ClientCreateInput,
    });

    let warning: string | undefined;
    try {
      await generateClientSEO(client.id);
    } catch {
      warning = "Client saved successfully, but SEO data generation failed. You can update it later.";
    }

    revalidatePath("/clients");
    revalidatePath("/media");
    await revalidateModontyTag("clients");
    try { const { regenerateClientsListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateClientsListingCache(); } catch {}
    return warning ? { success: true, client, warning } : { success: true, client };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create client";
    return { success: false, error: message };
  }
}

