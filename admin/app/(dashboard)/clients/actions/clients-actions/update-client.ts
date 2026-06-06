"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import type { ClientFormData } from "@/lib/types";
import { mapFormDataToClientData } from "../../helpers/client-field-mapper";
import { clientServerSchema } from "./client-server-schema";
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
  updateYmylFields,
  updateCtaFields,
} from "./update-client-grouped";
import { generateClientSEO } from "./generate-client-seo";

export async function updateClient(id: string, data: ClientFormData) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    // Server-side Zod validation
    const parsed = clientServerSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return { success: false, error: firstError.message };
    }

    // Early security check: Verify client ID exists
    const clientExists = await db.client.findUnique({
      where: { id },
      select: { id: true, subscriptionTier: true, articlesPerMonth: true },
    });

    if (!clientExists) {
      return { success: false, error: "Client not found" };
    }

    // Email + phone must stay globally unique (exclude current client).
    const dupConds: Array<{ email?: string; phone?: string }> = [];
    if (parsed.data.email) dupConds.push({ email: parsed.data.email });
    if (parsed.data.phone) dupConds.push({ phone: parsed.data.phone });
    if (dupConds.length > 0) {
      const dup = await db.client.findFirst({
        where: { OR: dupConds, NOT: { id } },
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
      hasGroupData("ymyl", groupedData.ymyl ?? {}) ? updateYmylFields(id, groupedData.ymyl ?? {}) : Promise.resolve({ success: true, groupName: "ymyl", fieldsUpdated: 0 } as const),
      hasGroupData("cta", groupedData.cta ?? {}) ? updateCtaFields(id, groupedData.cta ?? {}) : Promise.resolve({ success: true, groupName: "cta", fieldsUpdated: 0 } as const),
    ]);

    // Check for failures
    const failedGroups = results.filter((r) => !r.success);

    if (failedGroups.length === results.length) {
      const errorMessages = failedGroups.map((r) => `${r.groupName}: ${r.success === false ? r.error : "Unknown error"}`).join("; ");
      return {
        success: false,
        error: errorMessages,
      };
    }

    const client = await db.client.findUnique({ where: { id } });

    let warning: string | undefined;

    // Partial success: some groups failed but others succeeded
    if (failedGroups.length > 0 && failedGroups.length < results.length) {
      warning = `Partially saved. Failed to update: ${failedGroups.map(g => g.groupName).join(', ')}`;
    }

    // Fetch articles once for cascade
    const clientArticles = await db.article.findMany({
      where: { clientId: id },
      select: { id: true },
    }).catch(() => [] as { id: string }[]);

    // Run client SEO + full article cascade in parallel
    const [seoResult] = await Promise.all([
      generateClientSEO(id),
      clientArticles.length > 0
        ? (async () => {
            const [{ generateAndSaveJsonLd }, { generateAndSaveNextjsMetadata }] = await Promise.all([
              import("@/lib/seo"),
              import("@/lib/seo/metadata-storage"),
            ]);
            await Promise.all(
              clientArticles.map((a) =>
                Promise.all([
                  generateAndSaveJsonLd(a.id).catch(() => {}),
                  generateAndSaveNextjsMetadata(a.id).catch(() => {}),
                ])
              )
            );
          })().catch(() => {})
        : Promise.resolve(undefined),
    ]);

    if (!seoResult.success) {
      const seoWarning = "Saved successfully, but SEO data generation failed. You can update it later.";
      warning = warning ? `${warning} | ${seoWarning}` : seoWarning;
    }

    // Revalidate admin paths
    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    revalidatePath("/media");
    if (client?.slug) {
      revalidatePath(`/clients/${client.slug}`);
    }

    await Promise.all([
      revalidateModontyTag("clients"),
      revalidateModontyTag("articles"),
    ]);
    
    return warning ? { success: true, client, warning } : { success: true, client };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update client";
    return { success: false, error: message };
  }
}

