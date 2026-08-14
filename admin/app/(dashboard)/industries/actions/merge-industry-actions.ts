"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { generateClientSeoBundle } from "@modonty/shared/lib/seo/generate-client-seo-bundle";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { recordRedirect } from "@/lib/redirect/record-redirect";

const prepareSchema = z.object({
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  // Type-to-confirm gate: must match the SOURCE name exactly (what gets emptied).
  confirmName: z.string().min(1),
});

export interface IndustryMergeImpact {
  /** Clients reassigned source → target (industry is a singular FK on Client, no dedup). */
  movedCount: number;
  /** Clients needing SEO regeneration (= movedCount; the client JSON-LD knowsAbout carries the name). */
  affectedCount: number;
}

/**
 * Read-only preview so the dialog shows real numbers before the operator commits.
 * Industry is a singular FK on Client, so every source client simply moves — no dedup,
 * no hierarchy (Industry has no children).
 */
export async function getIndustryMergeImpact(sourceId: string, targetId: string): Promise<IndustryMergeImpact> {
  if (!sourceId || !targetId || sourceId === targetId) {
    return { movedCount: 0, affectedCount: 0 };
  }
  const movedCount = await db.client.count({ where: { industryId: sourceId } });
  return { movedCount, affectedCount: movedCount };
}

export interface PrepareIndustryMergeResult {
  success: boolean;
  error?: string;
  sourceName?: string;
  targetName?: string;
  /** Every client that needs SEO regeneration (all moved). */
  affectedClientIds?: string[];
  movedCount?: number;
}

/**
 * Phase 1 (atomic): reassign every client from the source industry to the target and
 * record the 308 — in one transaction. Leaves the source industry existing but with
 * zero clients (Khalid deletes it from the table afterwards; the 308 fires then).
 *
 * Returns the affected client ids so the client can regenerate their SEO one by one
 * (Phase 2) with a live progress bar — the client's own Organization JSON-LD embeds
 * the industry name (knowsAbout), so it must be rebuilt. The industry name does NOT
 * appear in the client's article JSON-LD (the article's publisher Organization node
 * omits it), so there is no article cascade.
 */
export async function prepareIndustryMerge(input: {
  sourceId: string;
  targetId: string;
  confirmName: string;
}): Promise<PrepareIndustryMergeResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = prepareSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };
    const { sourceId, targetId, confirmName } = parsed.data;

    if (sourceId === targetId) {
      return { success: false, error: "Cannot merge an industry into itself." };
    }

    const [source, target] = await Promise.all([
      db.industry.findUnique({ where: { id: sourceId }, select: { id: true, name: true, slug: true } }),
      db.industry.findUnique({ where: { id: targetId }, select: { id: true, name: true, slug: true } }),
    ]);

    if (!source) return { success: false, error: "Source industry not found." };
    if (!target) return { success: false, error: "Target industry not found." };

    if (confirmName.trim() !== source.name.trim()) {
      return { success: false, error: "Confirmation text does not match the source industry name." };
    }

    const sourceClients = await db.client.findMany({
      where: { industryId: sourceId },
      select: { id: true },
    });
    const affectedClientIds = sourceClients.map((c) => c.id);

    await db.$transaction(async (tx) => {
      // Reassign every source client to the target industry (singular FK — no dedup).
      await tx.client.updateMany({
        where: { industryId: sourceId },
        data: { industryId: targetId },
      });
      // Permanent redirect old slug → target slug (collapses any existing chain).
      await recordRedirect(tx, "industries", source.slug, target.slug);
    });

    await logAction("industry.merge", {
      entity: "Industry",
      entityId: sourceId,
      summary: `Merged "${source.name}" → "${target.name}"`,
      metadata: {
        targetId,
        sourceSlug: source.slug,
        targetSlug: target.slug,
        movedCount: affectedClientIds.length,
        redirect: `/industries/${source.slug} → /industries/${target.slug}`,
      },
    });

    return {
      success: true,
      sourceName: source.name,
      targetName: target.name,
      affectedClientIds,
      movedCount: affectedClientIds.length,
    };
  } catch (error) {
    console.error("prepareIndustryMerge failed:", error);
    const message = error instanceof Error ? error.message : "Failed to merge industry";
    return { success: false, error: message };
  }
}

export interface RegenerateClientResult {
  success: boolean;
  clientId: string;
  title?: string;
  error?: string;
}

/**
 * Phase 2 (per client, idempotent): rebuild one moved client's Next.js metadata +
 * JSON-LD so its knowsAbout reflects the target industry. Uses the SHARED shared
 * bundle (byte-identical to an admin/console save). Called in a client loop to drive
 * the live progress bar.
 */
export async function regenerateClientSeoForMerge(clientId: string): Promise<RegenerateClientResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, clientId, error: "Unauthorized" };

    const bundle = await generateClientSeoBundle(db, clientId);
    if (!bundle) return { success: false, clientId, error: "Client not found" };

    const { client, metaTags, jsonLdString } = bundle;
    const metaTagsJson = JSON.parse(JSON.stringify(metaTags)) as Record<string, unknown>;

    await db.client.update({
      where: { id: clientId },
      data: {
        nextjsMetadata: metaTagsJson as Prisma.InputJsonValue,
        nextjsMetadataLastGenerated: new Date(),
        jsonLdStructuredData: jsonLdString,
        jsonLdLastGenerated: new Date(),
      },
    });

    // Bundle types client fields as unknown; the name drives the progress label only.
    const title = typeof client.name === "string" ? client.name : undefined;
    return { success: true, clientId, title };
  } catch (error) {
    console.error("regenerateClientSeoForMerge failed:", clientId, error);
    const message = error instanceof Error ? error.message : "Regeneration failed";
    return { success: false, clientId, error: message };
  }
}

/**
 * Phase 3 (finalize): regenerate both industries' own SEO caches + the industries
 * listing, then revalidate modonty. modonty's in-memory caches pick up the change
 * within their 5-minute TTL (documented eventual consistency).
 */
export async function finalizeIndustryMerge(input: { sourceId: string; targetId: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const { generateAndSaveIndustrySeo } = await import("@/lib/seo/industry-seo-generator");
    const { regenerateIndustriesListingCache } = await import("@/lib/seo/listing-page-seo-generator");

    // Target gains clients; source is now empty — refresh both entity caches.
    await generateAndSaveIndustrySeo(input.targetId).catch((e) => console.error("target industry SEO:", e));
    await generateAndSaveIndustrySeo(input.sourceId).catch((e) => console.error("source industry SEO:", e));
    await regenerateIndustriesListingCache().catch((e) => console.error("industries listing:", e));

    revalidatePath("/industries");
    revalidatePath("/clients");
    await revalidateModontyTag("industries");
    await revalidateModontyTag("clients");

    return { success: true };
  } catch (error) {
    console.error("finalizeIndustryMerge failed:", error);
    const message = error instanceof Error ? error.message : "Finalize failed";
    return { success: false, error: message };
  }
}
