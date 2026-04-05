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
import bcrypt from "bcryptjs";

export async function createClient(data: ClientFormData) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "غير مصرح" };

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
      return { success: false, error: "هذا الرابط المختصر مستخدم بالفعل" };
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

    // Hash password if provided
    if (data.password && data.password.trim() !== "") {
      clientData.password = await bcrypt.hash(data.password, 10);
    } else {
      // Remove password field if not provided to avoid storing empty strings
      delete clientData.password;
    }

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
      "targetAudience",
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
      "licenseNumber",
      "licenseAuthority",
      "alternateName",
      "slogan",
      "keywords",
      "knowsLanguage",
      "organizationType",
      "gtmId",
      "subscriptionTier",
      "subscriptionStartDate",
      "subscriptionEndDate",
      "articlesPerMonth",
      "subscriptionStatus",
      "paymentStatus",
      "ga4PropertyId",
      "ga4MeasurementId",
      "gbpProfileUrl",
      "gbpPlaceId",
      "gbpAccountId",
      "gbpLocationId",
      "gbpCategory",
      "priceRange",
      "openingHoursSpecification",
      "googleBusinessProfileUrl",
      "forbiddenKeywords",
      "forbiddenClaims",
      "competitiveMentionsAllowed",
    ];

    const cleanData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in clientData) {
        cleanData[key] = clientData[key];
      }
    }

    // Handle relations — verify each ID exists before connecting
    if (clientData.subscriptionTierConfigId) {
      const tierConfig = await db.subscriptionTierConfig.findUnique({
        where: { id: clientData.subscriptionTierConfigId as string },
        select: { id: true },
      });
      if (!tierConfig) return { success: false, error: "باقة الاشتراك غير موجودة" };
      cleanData.subscriptionTierConfig = { connect: { id: tierConfig.id } };
    }
    if (clientData.industryId) {
      const industry = await db.industry.findUnique({
        where: { id: clientData.industryId as string },
        select: { id: true },
      });
      if (!industry) return { success: false, error: "القطاع المحدد غير موجود" };
      cleanData.industry = { connect: { id: industry.id } };
    }
    if (clientData.parentOrganizationId) {
      const parentOrg = await db.client.findUnique({
        where: { id: clientData.parentOrganizationId as string },
        select: { id: true },
      });
      if (!parentOrg) return { success: false, error: "المنظمة الأم غير موجودة" };
      cleanData.parentOrganization = { connect: { id: parentOrg.id } };
    }

    const client = await db.client.create({
      data: cleanData as Prisma.ClientCreateInput,
    });

    let warning: string | undefined;
    try {
      await generateClientSEO(client.id);
    } catch {
      warning = "تم حفظ العميل بنجاح، لكن فشل توليد بيانات البحث. يمكنك تحديثها لاحقاً.";
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

