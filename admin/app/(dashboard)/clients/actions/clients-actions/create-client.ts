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
import { logAction } from "@/lib/audit/log-action";
import { clientServerSchema } from "./client-server-schema";
import { normalizeOrganizationType } from "@modonty/shared/lib/constants/client-classification";
import { normalizePhone } from "@modonty/shared/lib/phone";
import { DEFAULT_CLIENT_PASSWORD } from "@/lib/default-client-password";
import bcrypt from "bcryptjs";

export async function createClient(data: ClientFormData) {
  try {
    const session = await auth();
    if (!session) return { success: false as const, error: "Unauthorized" };

    // Server-side Zod validation
    const parsed = clientServerSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return { success: false as const, error: firstError.message };
    }

    // Validate slug uniqueness
    const existingClient = await db.client.findUnique({
      where: { slug: parsed.data.slug.trim() },
      select: { id: true },
    });
    if (existingClient) {
      return { success: false as const, error: "This slug is already in use" };
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
          success: false as const,
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
          success: false as const,
          error: `Tier config not found for tier: ${data.subscriptionTier}`,
        };
      }

      if (!tierConfig.isActive) {
        return {
          success: false as const,
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

    // Opening balance — the founding payment («تأسيسه معناه دفع»). Recorded as revenue
    // immediately (paid date = the createdAt we're about to set). No invoice at founding;
    // the first invoice is generated later from this balance on the account page. Internal
    // accounts are free, so they carry no balance.
    if (!data.isInternal && typeof data.openingBalance === "number" && data.openingBalance > 0) {
      clientData.openingBalance = data.openingBalance;
    }
    
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
      "openingBalance",
      "isFeatured",
      "showSchedule",
      "isInternal",
      "billingCycle",
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
      // Client Site Publishing is deliberately absent: it is an EDIT-only decision,
      // so founding a client never touches it and never generates a key.
    ];
    // Strategy fields removed (Plan B): targetAudience, forbiddenKeywords, forbiddenClaims,
    // competitiveMentionsAllowed — these are now client-managed via console intake.

    const cleanData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in clientData) {
        cleanData[key] = clientData[key];
      }
    }

    // organizationType is admin-owned: store only the canonical schema.org value
    // (same normalizer the console used), so legacy/free-text never reaches the DB.
    if ("organizationType" in cleanData) {
      cleanData.organizationType = normalizeOrganizationType(
        cleanData.organizationType as string | null | undefined
      );
    }

    // Store the phone in canonical E.164 (Saudi/Egypt) so WhatsApp links are correct; keep
    // the raw value if it can't be normalized (it surfaces in the dashboard «Errors to fix»).
    if (typeof cleanData.phone === "string" && cleanData.phone.trim()) {
      const e164 = normalizePhone(cleanData.phone);
      if (e164) cleanData.phone = e164;
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
      if (!tierConfig) return { success: false as const, error: "Subscription tier not found" };
      cleanData.subscriptionTierConfig = { connect: { id: tierConfig.id } };
    }
    if (clientData.industryId) {
      const industry = await db.industry.findUnique({
        where: { id: clientData.industryId as string },
        select: { id: true },
      });
      if (!industry) return { success: false as const, error: "Selected industry not found" };
      cleanData.industry = { connect: { id: industry.id } };
    }
    if (clientData.salesRepId) {
      const rep = await db.staff.findUnique({
        where: { id: clientData.salesRepId as string },
        select: { id: true },
      });
      if (!rep) return { success: false as const, error: "Selected sales rep not found" };
      cleanData.salesRep = { connect: { id: rep.id } };
    }
    if (clientData.editorId) {
      const editor = await db.staff.findUnique({
        where: { id: clientData.editorId as string },
        select: { id: true },
      });
      if (!editor) return { success: false as const, error: "Selected editor not found" };
      cleanData.editor = { connect: { id: editor.id } };
    }
    if (clientData.parentOrganizationId) {
      const parentOrg = await db.client.findUnique({
        where: { id: clientData.parentOrganizationId as string },
        select: { id: true },
      });
      if (!parentOrg) return { success: false as const, error: "Parent organization not found" };
      cleanData.parentOrganization = { connect: { id: parentOrg.id } };
    }

    const client = await db.client.create({
      data: cleanData as Prisma.ClientCreateInput,
    });

    let warning: string | undefined;

    // generateClientSEO RETURNS { success, error } and never throws, so this `catch` was
    // unreachable and `warning` could never be set: a failed generation shipped as a
    // clean success. Read the result.
    try {
      const seoResult = await generateClientSEO(client.id);
      if (!seoResult.success) {
        warning = `Client saved successfully, but SEO data generation failed (${seoResult.error ?? "unknown reason"}). You can update it later.`;
      }
    } catch (e) {
      warning = `Client saved successfully, but SEO data generation failed (${e instanceof Error ? e.message : String(e)}). You can update it later.`;
    }

    await logAction("client.create", {
      entity: "Client",
      entityId: client.id,
      summary: client.name,
      metadata: { slug: client.slug },
    });

    revalidatePath("/clients");
    revalidatePath("/media");
    // Regenerate BEFORE revalidating modonty — /clients renders the stored blob. And
    // regenerateClientsListingCache RETURNS { success, error } and never throws, so the
    // old `catch {}` was unreachable: a failed rebuild left no trace at all.
    const seoFailures: string[] = [];
    try {
      const { regenerateClientsListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      const result = await regenerateClientsListingCache();
      if (!result.success) seoFailures.push(`صفحة الشركاء: ${result.error || "سبب غير معروف"}`);
    } catch (e) { seoFailures.push(`صفحة الشركاء: ${e instanceof Error ? e.message : String(e)}`); }
    if (seoFailures.length > 0) console.error("Clients listing cache failed:", client.id, seoFailures.join(" · "));
    else await revalidateModontyTag("clients");

    return {
      success: true as const,
      client,
      ...(warning && { warning }),
      seoWarning:
        seoFailures.length > 0
          ? `الشريك انحفظ، لكن بيانات السيو ما تجدّدت — جوجل بيبقى يشوف القديم. (${seoFailures.join(" · ")})`
          : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create client";
    return { success: false as const, error: message };
  }
}

