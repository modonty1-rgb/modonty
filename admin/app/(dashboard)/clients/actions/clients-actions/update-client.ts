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
  updateSubscriptionFields,
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
  updateClientSiteFields,
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
      updateSubscriptionFields(id, groupedData.subscription),
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
      updateClientSiteFields(id, groupedData["client-site"] ?? {}),
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

    // The articles address moved → the URLs baked into that client's articles are now
    // wrong, and everything below (JSON-LD, metadata) is built FROM those columns. So
    // they are rewritten first, and the cascade that follows picks up the new value.
    // `baseUrlChangedFrom` is present only on a real change, so an ordinary save of any
    // other section rewrites nothing.
    // Every article whose stored card is now suspect. The tag flush at the end is gated on
    // this: modonty serves the STORED card, so busting its cache while a card was built from
    // the old address is what publishes the wrong URL — the old data under a fresh timestamp.
    const articleSeoFailures: string[] = [];

    // Found by shape, not by position. This read `results[13]` — the fourteenth entry of the
    // `Promise.all` above — so inserting or reordering ONE writer in that list would have
    // pointed it at a different group's result. It would not have thrown: the `in` check
    // below would simply be false, the rebake would never run, and a moved articles address
    // would silently publish stale URLs. A silent miss on a list people edit is the bug.
    const clientSiteResult = results.find(
      (r): r is typeof r & { baseUrlChangedFrom?: string | null } => r != null && "baseUrlChangedFrom" in r,
    );
    if (clientSiteResult) {
      const { rebakeClientSiteCanonicals } = await import("./rebake-client-site-canonicals");
      // This used to end in `.catch(() => {})`. The address had moved, the rebake had failed,
      // and the cascade below then rebuilt every card from the OLD columns and flushed
      // modonty's cache — publishing the stale URLs as if they were the new ones, under a
      // green "Saved successfully".
      try {
        const rebake = await rebakeClientSiteCanonicals(id, client?.articlesBaseUrl ?? null);
        if (rebake.failed > 0) {
          articleSeoFailures.push(`${rebake.failed} مقالاً ما انكتب فيه العنوان الجديد`);
        }
      } catch (e) {
        articleSeoFailures.push(
          `تعذّر تحديث روابط مقالات موقع الشريك: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    // Fetch articles once for cascade
    const clientArticles = await db.article.findMany({
      where: { clientId: id },
      select: { id: true },
    }).catch(() => [] as { id: string }[]);

    // Run client SEO + full article cascade in parallel.
    //
    // Both generators CATCH internally and return `{ success, error }` — neither ever throws —
    // so the old `.catch(() => {})` on each was a swallow on top of a swallow: a card that
    // failed to rebuild was counted exactly like one that succeeded, and the flush below went
    // out regardless. The answers are read now, and the count decides what gets published.
    const [seoResult, articleCascadeFailed] = await Promise.all([
      generateClientSEO(id),
      clientArticles.length > 0
        ? (async () => {
            const [{ generateAndSaveJsonLd }, { generateAndSaveNextjsMetadata }] = await Promise.all([
              import("@/lib/seo"),
              import("@/lib/seo/metadata-storage"),
            ]);
            const outcomes = await Promise.all(
              clientArticles.map(async (a) => {
                try {
                  const [jsonLd, metadata] = await Promise.all([
                    generateAndSaveJsonLd(a.id),
                    generateAndSaveNextjsMetadata(a.id),
                  ]);
                  return jsonLd?.success !== false && metadata?.success !== false;
                } catch {
                  return false;
                }
              }),
            );
            return outcomes.filter((done) => !done).length;
          })().catch(() => clientArticles.length)
        : Promise.resolve(0),
    ]);

    if (articleCascadeFailed > 0) {
      articleSeoFailures.push(`${articleCascadeFailed} مقالاً ما تجدّدت بياناته`);
    }

    if (!seoResult.success) {
      const seoWarning = "Saved successfully, but SEO data generation failed. You can update it later.";
      warning = warning ? `${warning} | ${seoWarning}` : seoWarning;
    }

    if (articleSeoFailures.length > 0) {
      const articleWarning = `الشريك انحفظ، لكن بيانات مقالاته ما تجدّدت — جوجل بيبقى يشوف القديم. (${articleSeoFailures.join(" · ")})`;
      warning = warning ? `${warning} | ${articleWarning}` : articleWarning;
      console.error("Client article SEO cascade failed:", id, articleSeoFailures.join(" · "));
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

    // Flush the tag that is clean, hold the one that is not — the rule update-author.ts
    // already follows. modonty builds a page from the row's live columns AND its stored card;
    // when a card failed to rebuild, the columns are new and the card is old, so busting that
    // tag publishes a half-new page and stamps the stale half as fresh. That is how a moved
    // address gets served back to Google under a green "Saved successfully". Holding the tag
    // keeps the page consistently old until the warning above is acted on.
    //
    // `failedGroups.length > 0` joins that gate for the same reason. The check above only
    // fails the whole action when ALL FOURTEEN writers fail — so thirteen could fail, the
    // screen would say "Partially saved", and the flush still went out. modonty would then
    // publish a row where some sections are new and the rest are the pre-edit values,
    // stamped fresh. A partial write is exactly the state that must not be published.
    const wroteCleanly = failedGroups.length === 0;

    // The /clients listing blob embeds each partner's name, url, email, phone and address,
    // so an edit here makes it stale. It is rebuilt BEFORE the flush below — it used to run
    // after, so busting the `clients` tag sent the next visitor to a /clients page rebuilt
    // from the pre-edit listing, i.e. the stale list served under a fresh cache.
    //
    // Its answer is read as well. The generator returns `{ success, error }` and never
    // throws, and the old call ended in `catch {}` — a swallow wrapped around a discarded
    // result, so a failed rebuild was indistinguishable from a good one.
    let listingOk = true;
    try {
      const { regenerateClientsListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      const r = await regenerateClientsListingCache();
      listingOk = r.success;
      // NOT pushed into `articleSeoFailures`: that list gates the ARTICLES flush below, and
      // the partners listing has nothing to do with article cards. It also feeds a warning
      // that was already assembled further up, so a message added here would never reach the
      // screen. The failure is logged and holds only the flush it actually concerns.
      if (!r.success) console.error("Clients listing cache failed:", id, r.error);
    } catch (e) {
      listingOk = false;
      console.error("Clients listing cache failed:", id, e);
    }

    if (wroteCleanly && seoResult.success && listingOk) await revalidateModontyTag("clients");
    if (wroteCleanly && articleSeoFailures.length === 0) await revalidateModontyTag("articles");

    return warning ? { success: true, client, warning } : { success: true, client };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update client";
    return { success: false, error: message };
  }
}

