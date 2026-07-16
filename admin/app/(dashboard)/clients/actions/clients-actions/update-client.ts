"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import type { ClientFormData } from "@/lib/types";
import { mapFormDataToClientData } from "../../helpers/client-field-mapper";
import { clientServerSchema } from "./client-server-schema";
import { groupFieldsByTab } from "../../helpers/group-fields-by-tab";
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
import { logAction } from "@/lib/audit/log-action";

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

    // Update each group independently (separate updates keep each under the
    // MongoDB <50-pipeline-stage limit). We always invoke every writer — each one
    // computes its own changed-fields diff and no-ops (no DB write) when nothing
    // changed. The old `hasGroupData` gate skipped a writer when all of a group's
    // fields were empty, which silently dropped legitimate field CLEARS
    // (e.g. emptying legalForm / addressCountry). Removing the gate lets the diff
    // see "old value → null" and persist the clear.
    const results = await Promise.all([
      updateRequiredFields(id, groupedData.required),
      updateBusinessFields(id, groupedData.business),
      updateContactFields(id, groupedData.contact),
      updateAddressFields(id, groupedData.address),
      updateLegalFields(id, groupedData.legal),
      updateSEOFields(id, groupedData.seo),
      updateMediaSocialFields(id, groupedData["media-social"]),
      updateSecurityFields(id, groupedData.security),
      updateAdditionalFields(id, groupedData.additional),
      updateSettingsFields(id, groupedData.settings),
      updateYmylFields(id, groupedData.ymyl ?? {}),
      updateCtaFields(id, groupedData.cta ?? {}),
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

    // `client` was re-read above, so the name is the one saved a moment ago.
    await logAction("client.update", {
      entity: "Client",
      entityId: id,
      summary: client?.name ?? null,
      // Which groups actually saved — the difference between "she edited the client" and
      // "she edited the client and half of it did not save".
      metadata: failedGroups.length > 0 ? { failedGroups: failedGroups.map((g) => g.groupName) } : null,
    });

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

